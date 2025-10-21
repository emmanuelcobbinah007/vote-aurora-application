import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { validateSession } from "@/libs/auth-utils";
import { hashPassword } from "@/libs/auth-utils";
import bcrypt from "bcrypt";

interface RouteParams {
  params: Promise<{ adminId: string }>;
}

// Domain types for profile operations
interface ProfileContext {
  adminId: string;
  request: NextRequest;
}

interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

interface ProfileUpdateContext extends ProfileContext {
  updateData: ProfileUpdateData;
}

// Strategy Pattern: Profile validation strategies
interface ProfileValidationStrategy {
  validate(context: ProfileContext | ProfileUpdateContext): Promise<void>;
}

class SessionValidationStrategy implements ProfileValidationStrategy {
  async validate(context: ProfileContext): Promise<void> {
    const authResult = await validateSession(context.request);
    if (!authResult.success || !authResult.user) {
      throw new Error("Unauthorized");
    }
  }
}

class ProfileAccessValidationStrategy implements ProfileValidationStrategy {
  async validate(context: ProfileContext): Promise<void> {
    const authResult = await validateSession(context.request);
    if (!authResult.success || !authResult.user) {
      throw new Error("Unauthorized");
    }

    if (!this.isAuthorizedToAccess(authResult.user, context.adminId)) {
      throw new Error("Forbidden");
    }
  }

  private isAuthorizedToAccess(user: any, adminId: string): boolean {
    return user.id === adminId || user.role === "SUPERADMIN";
  }
}

class PasswordChangeValidationStrategy implements ProfileValidationStrategy {
  async validate(context: ProfileUpdateContext): Promise<void> {
    const { current_password, new_password } = context.updateData;

    if (!new_password) {
      return; // No password change requested
    }

    if (!current_password) {
      throw new Error("Current password is required to change password");
    }

    await this.validateCurrentPassword(context.adminId, current_password);
    this.validateNewPassword(new_password);
  }

  private async validateCurrentPassword(
    adminId: string,
    currentPassword: string
  ): Promise<void> {
    const currentUser = await prisma.users.findUnique({
      where: { id: adminId },
      select: { password_hash: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }
  }

  private validateNewPassword(newPassword: string): void {
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }
  }
}

// Repository for profile operations
class ProfileRepository {
  static async findAdminProfile(adminId: string) {
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  }

  static async updateAdminProfile(adminId: string, updateData: any) {
    return await prisma.users.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        updated_at: true,
      },
    });
  }
}

// Profile data transformation service
class ProfileDataService {
  static formatProfileResponse(admin: any) {
    return {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      created_at: admin.created_at.toISOString(),
      updated_at: admin.updated_at.toISOString(),
      last_login: admin.last_login?.toISOString() || null,
    };
  }

  static formatUpdateResponse(admin: any) {
    return {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      updated_at: admin.updated_at.toISOString(),
    };
  }

  static async prepareUpdateData(updateData: ProfileUpdateData) {
    const { full_name, email, new_password } = updateData;
    const data: any = {};

    if (full_name) data.full_name = full_name;
    if (email) data.email = email;

    if (new_password) {
      data.password_hash = await hashPassword(new_password);
    }

    return data;
  }
}

// Validation factory
class ProfileValidationFactory {
  static createGetProfileValidationStrategies(): ProfileValidationStrategy[] {
    return [new ProfileAccessValidationStrategy()];
  }

  static createUpdateProfileValidationStrategies(): ProfileValidationStrategy[] {
    return [
      new ProfileAccessValidationStrategy(),
      new PasswordChangeValidationStrategy(),
    ];
  }
}

// Profile validator
class ProfileValidator {
  constructor(private strategies: ProfileValidationStrategy[]) {}

  async validateAll(
    context: ProfileContext | ProfileUpdateContext
  ): Promise<void> {
    for (const strategy of this.strategies) {
      await strategy.validate(context);
    }
  }
}

// Command Pattern: Profile operations
interface ProfileCommand {
  execute(): Promise<any>;
}

class GetProfileCommand implements ProfileCommand {
  constructor(private context: ProfileContext) {}

  async execute(): Promise<any> {
    await this.validateAccess();
    const admin = await this.fetchProfile();
    return this.formatResponse(admin);
  }

  private async validateAccess(): Promise<void> {
    const validator = new ProfileValidator(
      ProfileValidationFactory.createGetProfileValidationStrategies()
    );
    await validator.validateAll(this.context);
  }

  private async fetchProfile(): Promise<any> {
    return await ProfileRepository.findAdminProfile(this.context.adminId);
  }

  private formatResponse(admin: any) {
    return {
      success: true,
      data: ProfileDataService.formatProfileResponse(admin),
    };
  }
}

class UpdateProfileCommand implements ProfileCommand {
  constructor(private context: ProfileUpdateContext) {}

  async execute(): Promise<any> {
    await this.validateUpdate();
    const updateData = await this.prepareUpdateData();
    const updatedAdmin = await this.performUpdate(updateData);
    return this.formatResponse(updatedAdmin);
  }

  private async validateUpdate(): Promise<void> {
    const validator = new ProfileValidator(
      ProfileValidationFactory.createUpdateProfileValidationStrategies()
    );
    await validator.validateAll(this.context);
  }

  private async prepareUpdateData(): Promise<any> {
    return await ProfileDataService.prepareUpdateData(this.context.updateData);
  }

  private async performUpdate(updateData: any): Promise<any> {
    return await ProfileRepository.updateAdminProfile(
      this.context.adminId,
      updateData
    );
  }

  private formatResponse(admin: any) {
    return {
      success: true,
      message: "Profile updated successfully",
      data: ProfileDataService.formatUpdateResponse(admin),
    };
  }
}

// Context factory
class ProfileContextFactory {
  static createGetContext(
    request: NextRequest,
    adminId: string
  ): ProfileContext {
    return { adminId, request };
  }

  static createUpdateContext(
    request: NextRequest,
    adminId: string,
    updateData: ProfileUpdateData
  ): ProfileUpdateContext {
    return { adminId, request, updateData };
  }
}

// Profile controller
class ProfileController {
  async executeCommand(command: ProfileCommand): Promise<any> {
    return await command.execute();
  }
}

// DECOMPOSE CONDITIONAL: Error handling predicates
class ErrorPredicates {
  static isUnauthorizedError(error: any): boolean {
    return error.message.includes("Unauthorized");
  }

  static isForbiddenError(error: any): boolean {
    return error.message.includes("Forbidden");
  }

  static isNotFoundError(error: any): boolean {
    return error.message.includes("not found");
  }

  static isValidationError(error: any): boolean {
    return (
      error.message.includes("required") ||
      error.message.includes("incorrect") ||
      error.message.includes("at least")
    );
  }

  static isUniqueConstraintError(error: any): boolean {
    return (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    );
  }
}

// Error response factory
class ProfileErrorResponseFactory {
  static createErrorResponse(error: any): NextResponse {
    console.error("Profile operation error:", error);

    if (ErrorPredicates.isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (ErrorPredicates.isForbiddenError(error)) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (ErrorPredicates.isNotFoundError(error)) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (ErrorPredicates.isValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (ErrorPredicates.isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const context = ProfileContextFactory.createGetContext(
      request,
      resolvedParams.adminId
    );
    const controller = new ProfileController();
    const command = new GetProfileCommand(context);
    const result = await controller.executeCommand(command);

    return NextResponse.json(result);
  } catch (error: any) {
    return ProfileErrorResponseFactory.createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const updateData: ProfileUpdateData = {
      full_name: body.full_name,
      email: body.email,
      current_password: body.current_password,
      new_password: body.new_password,
    };

    const context = ProfileContextFactory.createUpdateContext(
      request,
      resolvedParams.adminId,
      updateData
    );
    const controller = new ProfileController();
    const command = new UpdateProfileCommand(context);
    const result = await controller.executeCommand(command);

    return NextResponse.json(result);
  } catch (error: any) {
    return ProfileErrorResponseFactory.createErrorResponse(error);
  }
}
