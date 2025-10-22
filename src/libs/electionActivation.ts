import prisma from "@/libs/prisma";
import {
  universityPrisma,
  withTimeout,
  testUniversityConnection,
} from "@/libs/university-prisma";
import { emailService } from "@/libs/email";
import { voterEmailService } from "@/libs/voterEmailService";
import { electionNotificationService } from "@/libs/electionNotificationService";
import crypto from "crypto";

interface EligibleStudent {
  student_id: string;
  email: string;
  name: string;
  department_id: number;
}

export class ElectionActivationService {
  async checkForElectionsToActivate() {
    console.log("Checking for elections to activate...");

    const now = new Date();

    // Find approved elections whose time has come
    const electionsToActivate = await prisma.elections.findMany({
      where: {
        status: "APPROVED",
        start_time: { lte: now },
        end_time: { gt: now },
        voter_list_generated: false, // Not processed yet
      },
      include: {
        creator: true,
        approver: true,
      },
    });

    console.log(`📋 Found ${electionsToActivate.length} elections to activate`);

    for (const election of electionsToActivate) {
      try {
        await this.activateElection(election);
        console.log(`Successfully activated election: ${election.title}`);
      } catch (error) {
        console.error(`Failed to activate election ${election.title}:`, error);
      }
    }

    return {
      processed: electionsToActivate.length,
      elections: electionsToActivate.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
      })),
    };
  }

  private async activateElection(election: any) {
    console.log(`Activating election: ${election.title}`);

    // 1. Mark election as LIVE
    await prisma.elections.update({
      where: { id: election.id },
      data: { status: "LIVE" },
    });

    // 2. Determine eligible voters
    const eligibleStudents = await this.getEligibleVoters(election);
    console.log(`👥 Found ${eligibleStudents.length} eligible voters`);

    // 3. Generate voter tokens
    await this.generateVoterTokens(election.id, eligibleStudents);

    // 4. 📧 NEW: Send voting emails
    try {
      console.log(
        `📧 Sending voting emails to ${eligibleStudents.length} voters...`
      );
      const emailResults = await voterEmailService.sendVotingEmails(
        election.id
      );
      console.log(
        `📬 Email dispatch completed: ${emailResults.emails_sent}/${emailResults.total_voters} sent`
      );
    } catch (emailError) {
      console.error(
        `❌ Email dispatch failed for ${election.title}:`,
        emailError
      );
      // Don't fail activation if emails fail - log it in audit trail
      await prisma.auditTrail.create({
        data: {
          user: {
            connect: { id: election.approver?.id || election.creator.id },
          },
          election: {
            connect: { id: election.id },
          },
          action: "EMAIL_DISPATCH_FAILED",
          metadata: {
            error:
              emailError &&
              typeof emailError === "object" &&
              "message" in emailError
                ? (emailError as any).message
                : String(emailError),
            election_title: election.title,
            eligible_voters: eligibleStudents.length,
          },
        },
      });
    }

    // 5. Log activation in audit trail
    await this.logActivation(election, eligibleStudents.length);

    console.log(`Election ${election.title} successfully activated!`);
  }

  private async getEligibleVoters(election: any): Promise<EligibleStudent[]> {
    try {
      console.log(`Getting eligible voters for election: ${election.title}`);
      console.log(
        `Election type - General: ${election.is_general}, Department: ${election.department}`
      );

      // Try to fetch students from university database
      console.log("Fetching students from university database...");

      let studentsQuery = `
        SELECT s.student_id, s.email, s.name, s.department_id
        FROM students s
        WHERE s.is_active = true
      `;

      const queryParams: any[] = [];

      // For department-specific elections, filter by department
      if (!election.is_general && election.department) {
        // Try to match department by name first
        const departmentMatch = (await universityPrisma.$queryRaw`
          SELECT id FROM departments 
          WHERE name = ${election.department} AND is_active = true
          LIMIT 1
        `) as any[];

        if (departmentMatch.length > 0) {
          studentsQuery += ` AND s.department_id = $1`;
          queryParams.push(departmentMatch[0].id);
          console.log(
            `Filtering students for department: ${election.department} (ID: ${departmentMatch[0].id})`
          );
        } else {
          console.warn(
            `Department "${election.department}" not found in university database, falling back to general election`
          );
        }
      }

      studentsQuery += ` ORDER BY s.name ASC`;

      const students = (await universityPrisma.$queryRawUnsafe(
        studentsQuery,
        ...queryParams
      )) as any[];

      console.log(
        `✅ Found ${students.length} students in university database`
      );

      if (students.length === 0) {
        console.warn(
          "No students found in university database, using mock data as fallback"
        );
        return this.getMockStudents(election);
      }

      // Transform to expected format
      const eligibleStudents: EligibleStudent[] = students.map(
        (student: any) => ({
          student_id: student.student_id,
          email: student.email,
          name: student.name,
          department_id: student.department_id,
        })
      );

      console.log(
        `📊 Returning ${eligibleStudents.length} eligible students from university database`
      );
      return eligibleStudents;
    } catch (error) {
      console.error("Error fetching students from university database:", error);
      console.log("Falling back to mock data due to database error");

      // Fallback to mock data
      return this.getMockStudents(election);
    }
  }

  private getMockStudents(election: any): EligibleStudent[] {
    console.log("Using mock student data for election activation");

    const mockStudents: EligibleStudent[] = [
      {
        student_id: "STU001",
        email: "student1@university.edu",
        name: "John Doe",
        department_id: 1,
      },
      {
        student_id: "STU002",
        email: "student2@university.edu",
        name: "Jane Smith",
        department_id: 1,
      },
      {
        student_id: "STU003",
        email: "student3@university.edu",
        name: "Bob Johnson",
        department_id: 2,
      },
      {
        student_id: "STU004",
        email: "student4@university.edu",
        name: "Alice Wilson",
        department_id: 1,
      },
      {
        student_id: "STU005",
        email: "student5@university.edu",
        name: "Charlie Brown",
        department_id: 3,
      },
    ];

    if (election.is_general) {
      console.log(
        `📊 Using ${mockStudents.length} mock students for general election`
      );
      return mockStudents;
    } else {
      // For department elections, return subset based on department
      const departmentStudents = mockStudents.filter(
        (student) => student.department_id === 1 // Default to department 1 for simplicity
      );
      console.log(
        `📊 Using ${departmentStudents.length} mock students for department election`
      );
      return departmentStudents;
    }
  }

  async closeExpiredElections() {
    console.log("Checking for elections to close...");

    const now = new Date();

    // Find LIVE elections that have passede their end time
    const electionsToClose = await prisma.elections.findMany({
      where: {
        status: "LIVE",
        end_time: { lte: now },
      },
      include: {
        creator: true,
        approver: true,
      },
    });

    console.log(`Found ${electionsToClose.length} elections to close`);

    for (const election of electionsToClose) {
      try {
        await prisma.elections.update({
          where: { id: election.id },
          data: {
            status: "CLOSED",
          },
        });

        // Log closure in audit trail
        await prisma.auditTrail.create({
          data: {
            user_id: election.approver?.id || election.creator.id,
            election_id: election.id,
            action: "ELECTION_CLOSED",
            metadata: {
              election_title: election.title,
              closed_time: new Date().toISOString(),
              end_time: election.end_time.toISOString(),
            },
          },
        });

        // 3. NEW: Send closure notifications to administrators
        try {
          console.log(
            `📧 Sending closure notifications for: ${election.title}`
          );
          const notificationResults =
            await electionNotificationService.sendElectionClosureNotifications(
              election.id
            );
          console.log(
            `📬 Closure notifications sent: ${
              notificationResults.notifications_sent
            }/${
              notificationResults.notifications_sent +
              notificationResults.notifications_failed
            } recipients`
          );
        } catch (notificationError) {
          console.error(
            `❌ Failed to send closure notifications for ${election.title}:`,
            notificationError
          );
          // Log notification failure but don't fail the closure
          await prisma.auditTrail.create({
            data: {
              user_id: election.approver?.id || election.creator.id,
              election_id: election.id,
              action: "CLOSURE_NOTIFICATION_FAILED",
              metadata: {
                error:
                  notificationError instanceof Error
                    ? notificationError.message
                    : String(notificationError),
                election_title: election.title,
              },
            },
          });
        }

        console.log(`Closed election: ${election.title}`);
      } catch (error) {
        console.error(`Failed to close election ${election.title}:`, error);
      }
    }

    return {
      closed: electionsToClose.length,
      elections: electionsToClose.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
      })),
    };
  }

  private async generateVoterTokens(electionId: string, students: any[]) {
    if (students.length === 0) {
      console.warn("No eligible students found, skipping token generation");
      return [];
    }

    const voterTokens = students.map((student) => ({
      // Required fields from your Prisma schema
      voter_token: crypto.randomBytes(16).toString("hex"),
      student_id: student.student_id,
      student_email: student.email,
      election_id: electionId,
      access_token: crypto.randomBytes(32).toString("hex"), // Unique URL token
      verification_otp: crypto.randomBytes(3).toString("hex").toUpperCase(), // 6-char OTP
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Token expires in 24 hours
      used: false,
      issued_at: new Date(),
    }));

    try {
      // Batch insert voter tokens
      await prisma.voterTokens.createMany({
        data: voterTokens,
        skipDuplicates: true, // In case of race conditions
      });

      console.log(`🎫 Generated ${voterTokens.length} voter tokens`);
      return voterTokens;
    } catch (error) {
      console.error("Error generating voter tokens:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate voter tokens: ${error.message}`);
      } else {
        throw new Error("Failed to generate voter tokens: Unknown error");
      }
    }
  }

  private async logActivation(election: any, voterCount: number) {
    try {
      await prisma.auditTrail.create({
        data: {
          user_id: election.approver?.id || election.creator.id,
          election_id: election.id,
          action: "ELECTION_ACTIVATED",
          metadata: {
            election_title: election.title,
            activation_time: new Date().toISOString(),
            eligible_voters: voterCount,
            is_general: election.is_general,
            department: election.department,
          },
        },
      });
    } catch (error) {
      console.error("Error logging activation:", error);
      // Don't throw here - activation should succeed even if logging fails
    }
  }
}

export const electionActivationService = new ElectionActivationService();
