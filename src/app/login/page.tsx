"use client";
import React, { useState } from "react";
import Image from "next/image";
import voteAurora_crest from "../../../public/VoteAurora.png";
import loginPageImage from "../../../public/login_page_image.png";
import * as Yup from "yup";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import axios from "axios";

const initialValues = {
  email: "",
  password: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Configuration":
        return "There was a problem with the server configuration. Please contact support.";
      case "AccessDenied":
        return "Access denied. You don't have permission to sign in.";
      case "Verification":
        return "Please verify your email address before signing in.";
      default:
        return "Something went wrong. Please try again later.";
    }
  };

  const getRedirectPath = (role: string, userId?: string) => {
    switch (role) {
      case "ORCHESTRATOR":
        return `/orchestrator/${userId}/dashboard`;
      case "ADMIN":
        // Check if we need the dynamic route - for now use static
        return `/admin/${userId}/dashboard`;
      case "SUPERADMIN":
        return `/superadmin/${userId}/dashboard`;
      case "APPROVER":
        return `/approver/${userId}/dashboard`;
      case "VOTER":
        return "/voter"; // May need to create this route
      default:
        return "/"; // Fallback to home page
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ORCHESTRATOR":
        return "orchestrator";
      case "ADMIN":
        return "admin";
      case "SUPERADMIN":
        return "super admin";
      case "APPROVER":
        return "approver";
      case "VOTER":
        return "voter";
      default:
        return "user";
    }
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setIsLoading(true);
    setLoginError("");
    setLoginSuccess(false);

    try {
      const signInData = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (signInData?.error) {
        setLoginError(getErrorMessage(signInData.error));
      } else if (signInData?.ok) {
        // Get the session to retrieve user role
        const session = await getSession();

        if (session?.user?.role) {
          setLoginSuccess(true);
          const userId = session.user.id;
          const redirectPath = getRedirectPath(session.user.role, userId);
          const roleName = getRoleName(session.user.role);
          setRedirectMessage(`Redirecting to ${roleName} dashboard...`);

          // Log the successful login event
          try {
            await axios.post("/api/audit-trail", {
              action: "USER_LOGIN",
              // entityId is used for election_id in the API, which doesn't apply here
              metadata: {
                entityType: "USER",
                userId: userId,
                user_name: session.user.name,
                user_email: session.user.email,
                user_role: session.user.role,
              },
            });
            console.log("Login event recorded in audit trail");
          } catch (logError) {
            // Don't block login flow if audit logging fails
            console.error("Failed to record login event:", logError);
          }

          setTimeout(() => {
            router.push(redirectPath);
          }, 1000); // Brief delay to show success message
        } else {
          setLoginError(
            "Unable to determine user role. Please contact support."
          );
        }
      } else {
        setLoginError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .opacity-0 {
          opacity: 0;
        }
      `}</style>
      <div className="flex">
        <div className="flex-1 h-screen mx-4 my-3 w-[50%]">
          <div className="flex items-center space-x-3 mx-4 mt-3 opacity-0 animate-fade-in-up">
            <Image
              src={voteAurora_crest}
              alt="UPSA University Crest"
              width={160}
              height={55}
              className="object-contain mr-1"
            />{" "}
          </div>
          <div className="flex flex-col justify-center h-[90%] w-[85%] md:w-[70%] mx-auto">
            <div className="mb-9 opacity-0 animate-fade-in-up delay-200">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Please enter your details to continue
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-6 opacity-0 animate-fade-in-up delay-250">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {loginError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {loginSuccess && (
              <div className="mb-6 opacity-0 animate-fade-in-up delay-250">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {redirectMessage || "Login successful! Redirecting..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="opacity-0 animate-fade-in-up delay-300">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (loginError) setLoginError(""); // Clear error when user starts typing
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>

              <div className="opacity-0 animate-fade-in-up delay-400">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (loginError) setLoginError(""); // Clear error when user starts typing
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right opacity-0 animate-fade-in-up delay-500">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#2ecc71] hover:text-[#27ae60] transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !formik.isValid}
                className={`w-full py-3 px-4 rounded-xl font-medium focus:ring-2 focus:ring-[#2ecc71] focus:ring-offset-2 transition-all duration-200 transform opacity-0 animate-fade-in-up delay-600 ${
                  isLoading || !formik.isValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2ecc71] text-white hover:bg-[#27ae60] hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div className="flex-1 relative hidden md:flex items-center justify-center overflow-hidden opacity-0 animate-fade-in delay-100">
          {/* Background Image */}
          <Image
            src={loginPageImage}
            alt="University Campus"
            fill
            className="object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 bg-opacity-60 backdrop-blur-sm"></div>

          {/* Content */}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
