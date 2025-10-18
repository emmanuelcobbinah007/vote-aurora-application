import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/libs/prisma";

// Authentication service to handle user verification logic
class AuthenticationService {
  static async validateCredentials(email?: string, password?: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
  }

  static async findUserByEmail(email: string) {
    console.log("Login attempt for email:", email);
    
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found in database");
      throw new Error("CredentialsSignin");
    }

    return user;
  }

  static async validateUserStatus(user: any) {
    if (user.status !== "ACTIVE") {
      console.log("User found but status is not ACTIVE:", user.status);
      throw new Error("CredentialsSignin");
    }
  }

  static async verifyPassword(password: string, user: any) {
    console.log("User found, checking password...");
    
    const passwordMatch = await compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log("Password doesn't match");
      await this.handleFailedLogin(user.id);
      throw new Error("CredentialsSignin");
    }

    console.log("Password matches, login successful");
    return true;
  }

  static async handleFailedLogin(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        failed_login_attempts: { increment: 1 },
        last_failed_attempt: new Date(),
      },
    });
  }

  static async handleSuccessfulLogin(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        failed_login_attempts: 0,
        last_login: new Date(),
      },
    });
  }

  static formatUserResponse(user: any) {
    return {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input credentials
          await AuthenticationService.validateCredentials(
            credentials?.email, 
            credentials?.password
          );

          // Find user in database
          const user = await AuthenticationService.findUserByEmail(credentials!.email);

          // Validate user status
          await AuthenticationService.validateUserStatus(user);

          // Verify password
          await AuthenticationService.verifyPassword(credentials!.password, user);

          // Handle successful login
          await AuthenticationService.handleSuccessfulLogin(user.id);

          // Return formatted user data
          return AuthenticationService.formatUserResponse(user);
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };