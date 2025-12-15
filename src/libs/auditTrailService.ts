import prisma from "./prisma";
import crypto from "crypto";

interface AuditLogEntry {
  user_id: string | null;
  action: string;
  election_id?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

export class AuditTrailService {
  /**
   * Create an immutable audit log entry with hash-chaining
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Get the most recent audit log to chain from
      const previousLog = await prisma.auditTrail.findFirst({
        orderBy: { timestamp: "desc" },
        select: { entry_hash: true },
      });

      const timestamp = new Date();

      // Compute hash of this entry
      const entryData = {
        user_id: entry.user_id,
        action: entry.action,
        election_id: entry.election_id || null,
        metadata: entry.metadata || null,
        timestamp: timestamp.toISOString(),
        previous_hash: previousLog?.entry_hash || "GENESIS",
      };

      const entryHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(entryData))
        .digest("hex");

      // Create audit log with hash chain
      await prisma.auditTrail.create({
        data: {
          user_id: entry.user_id,
          action: entry.action,
          election_id: entry.election_id,
          metadata: entry.metadata || {},
          timestamp,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          previous_hash: previousLog?.entry_hash || "GENESIS",
          entry_hash: entryHash,
        },
      });

      console.log(`✅ Audit log created: ${entry.action} by ${entry.user_id}`);
    } catch (error) {
      console.error("❌ Failed to create audit log:", error);
      // Still throw to ensure audit failures are visible
      throw new Error(
        `Audit logging failed: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  /**
   * Verify integrity of audit trail by checking hash chain
   */
  static async verifyIntegrity(): Promise<{
    isValid: boolean;
    corruptedEntries: string[];
    totalEntries: number;
  }> {
    const logs = await prisma.auditTrail.findMany({
      orderBy: { timestamp: "asc" },
    });

    const corruptedEntries: string[] = [];
    let previousHash = "GENESIS";

    for (const log of logs) {
      // Recompute expected hash
      const entryData = {
        user_id: log.user_id,
        action: log.action,
        election_id: log.election_id,
        metadata: log.metadata,
        timestamp: log.timestamp.toISOString(),
        previous_hash: previousHash,
      };

      const expectedHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(entryData))
        .digest("hex");

      // Check if hash matches
      if (log.entry_hash !== expectedHash) {
        corruptedEntries.push(log.id);
        console.error(`❌ Hash mismatch for audit log ${log.id}`);
      }

      // Check chain integrity
      if (log.previous_hash !== previousHash) {
        corruptedEntries.push(log.id);
        console.error(`❌ Chain broken at audit log ${log.id}`);
      }

      previousHash = log.entry_hash;
    }

    return {
      isValid: corruptedEntries.length === 0,
      corruptedEntries,
      totalEntries: logs.length,
    };
  }

  /**
   * Get audit logs for a specific user with origin information
   */
  static async getUserLogs(userId: string) {
    return await prisma.auditTrail.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        action: true,
        timestamp: true,
        ip_address: true,
        user_agent: true,
        metadata: true,
        election_id: true,
      },
    });
  }

  /**
   * Get suspicious activity (same user, different IPs)
   */
  static async getSuspiciousActivity() {
    const logs = await prisma.auditTrail.findMany({
      where: {
        ip_address: { not: null },
      },
      select: {
        user_id: true,
        ip_address: true,
        action: true,
        timestamp: true,
      },
      orderBy: { timestamp: "desc" },
      take: 10000, // Limit to prevent memory issues
    });

    // Group by user and find multiple IPs
    const userIPs = new Map<string, Set<string>>();

    logs.forEach((log) => {
      // Skip system events (no user_id)
      if (!log.user_id) return;
      
      if (!userIPs.has(log.user_id)) {
        userIPs.set(log.user_id, new Set());
      }
      if (log.ip_address) {
        userIPs.get(log.user_id)!.add(log.ip_address);
      }
    });

    // Find users with multiple IPs
    const suspicious = Array.from(userIPs.entries())
      .filter(([_, ips]) => ips.size > 3) // More than 3 different IPs
      .map(([userId, ips]) => ({
        user_id: userId,
        ip_count: ips.size,
        ips: Array.from(ips),
      }));

    return suspicious;
  }

  /**
   * Get audit logs for an election
   */
  static async getElectionLogs(electionId: string) {
    return await prisma.auditTrail.findMany({
      where: { election_id: electionId },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
