"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, X } from "lucide-react";
import InviteOrchestratorRegistrationForm from "@/app/components/ui/registration-forms/InviteOrchestratorRegistrationForm";
import InviteSuperAdminRegistrationForm from "@/app/components/ui/registration-forms/InviteSuperAdminRegistrationForm";
import InviteApproverRegistrationForm from "@/app/components/ui/registration-forms/InviteApproverRegistrationForm";
import InviteAdminRegistrationForm from "@/app/components/ui/registration-forms/InviteAdminRegistrationForm";
import * as Yup from "yup";
import axios from "axios";

interface InvitationData {
  email: string;
  role: string;
  expires_at: string;
  election?: {
    id: string;
    title: string;
  };
}

const AcceptInvitePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, "Full name must be at least 2 characters")
      .required("Full name is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/invite/verify?token=${token}`);
        console.log("🔍 Verification response:", response.data);
        setInvitationData(response.data);
      } catch (error: any) {
        console.error("Error verifying token:", error);
        setError(
          error.response?.data?.error || "Invalid or expired invitation"
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Form submission handler
  const handleSubmit = async (
    values: {
      fullName: string;
      password: string;
      confirmPassword: string;
      role: string;
    },
    { setSubmitting, setFieldError }: any
  ) => {
    console.log("🚀 Form submission started");
    console.log("📝 Values:", { role: values.role, fullName: values.fullName });
    console.log("🎫 Invitation data:", invitationData);

    try {
      if (invitationData?.role === "ADMIN") {
        console.log("👑 ADMIN role detected, using election-scoped endpoint");
        console.log("🏛️ Election ID:", invitationData?.election?.id);

        const electionId = invitationData?.election?.id;
        if (!electionId) {
          console.error("❌ No election ID found in invitation data");
          setError("Invalid invitation: no election specified");
          return;
        }

        const endpoint = `/api/superadmin/elections/${electionId}/invites/accept`;
        console.log("🎯 Calling endpoint:", endpoint);

        // Call the election-scoped accept endpoint which will create the user and the AdminAssignment
        const response = await axios.post(endpoint, {
          token,
          fullName: values.fullName,
          password: values.password,
          role: values.role,
        });
        console.log("✅ Admin account created and assigned:", response.data);
        setIsSubmitted(true);
        // Skip calling the global accept endpoint to avoid duplicate operations
        return;
      }

      console.log("👤 Non-admin role, using global accept endpoint");
      // Non-admin roles use the global accept endpoint
      const response = await axios.post("/api/invite/accept", {
        token,
        fullName: values.fullName,
        password: values.password,
        role: values.role,
      });

      console.log("Account created successfully:", response.data);
      setIsSubmitted(true);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error creating account:", error);

      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Account Created!
          </h1>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. You will be redirected
            to the login page shortly.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (invitationData?.role?.toUpperCase() === "ORCHESTRATOR") {
    return (
      <InviteOrchestratorRegistrationForm
        invitationData={invitationData}
        validationSchema={validationSchema}
        handleSubmit={handleSubmit}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
    );
  } else if (invitationData?.role == "APPROVER") {
    return (
      <InviteApproverRegistrationForm
        invitationData={invitationData}
        validationSchema={validationSchema}
        handleSubmit={handleSubmit}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
    );
  } else if (invitationData?.role == "ADMIN") {
    return (
      <InviteAdminRegistrationForm
        invitationData={invitationData}
        validationSchema={validationSchema}
        handleSubmit={handleSubmit}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
    );
  } else {
    return (
      <InviteSuperAdminRegistrationForm
        invitationData={invitationData}
        validationSchema={validationSchema}
        handleSubmit={handleSubmit}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
    );
  }
};

export default AcceptInvitePage;
