// src/components/ui/voter/VoterVerificationForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { Mail, Clock } from "lucide-react";

interface VoterVerificationFormProps {
  verificationData: {
    voterToken: string;
    student_id: string;
    email_masked: string;
    election_id: string;
    expires_in_minutes: number;
    max_attempts: number;
  };
  onSuccess: (accessData: any) => void;
  onError: (error: string) => void;
}

const validationSchema = Yup.object({
  student_id: Yup.string()
    .trim()
    .required("Student ID is required")
    .min(3, "Student ID must be at least 3 characters"),
  otp: Yup.string()
    .trim()
    .required("Verification code is required")
    .matches(/^\d{6}$/, "Verification code must be 6 digits"),
});

const VoterVerificationForm: React.FC<VoterVerificationFormProps> = ({
  verificationData,
  onSuccess,
  onError,
}) => {
  const [timeLeft, setTimeLeft] = useState(
    verificationData.expires_in_minutes * 60
  );
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onError(
            "Verification code has expired. Please request a new voting link."
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onError]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerification = async (
    values: { student_id: string; otp: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      setVerificationAttempts((prev) => prev + 1);

      const response = await fetch("/api/voter/verify/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voter_token: verificationData.voterToken,
          student_id: values.student_id,
          otp: values.otp,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error.includes("Invalid student ID")) {
          setFieldError("student_id", result.error);
        } else if (result.error.includes("Invalid verification code")) {
          setFieldError("otp", result.error);
        } else {
          onError(result.error);
        }
        return;
      }

      // Success - call onSuccess with access data
      onSuccess(result.data);
    } catch (error) {
      console.error("Verification failed:", error);
      onError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResendingOTP(true);

      const response = await fetch("/api/voter/verify/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voter_token: verificationData.voterToken,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        onError(result.error);
        return;
      }

      // Reset timer and set cooldown
      setTimeLeft(verificationData.expires_in_minutes * 60);
      setResendCooldown(60); // 1 minute cooldown
      setVerificationAttempts(0); // Reset attempts
    } catch (error) {
      console.error("Resend failed:", error);
      onError("Failed to resend verification code. Please try again.");
    } finally {
      setIsResendingOTP(false);
    }
  };

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
              src="../../../../public/voteAurora_crest.png"
              alt="UPSA University Crest"
              width={30}
              height={30}
              className="object-contain mr-1"
            />{" "}
            <p className="text-lg font-semibold">VoteAurora</p>
          </div>
          <div className="flex flex-col justify-center h-[90%] w-[85%] md:w-[70%] mx-auto">
            <div className="mb-9 opacity-0 animate-fade-in-up delay-200">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                Voter Verification
              </h2>
              <p className="text-gray-600">
                Please verify your identity to access your ballot
              </p>
            </div>

            {/* Timer Display */}
            <div className={`mb-6 opacity-0 animate-fade-in-up delay-250`}>
              <div
                className={`${
                  timeLeft < 120
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                } border rounded-xl p-4`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock
                      className={`h-5 w-5 ${
                        timeLeft < 120 ? "text-yellow-400" : "text-blue-400"
                      }`}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        timeLeft < 120 ? "text-yellow-800" : "text-blue-800"
                      }`}
                    >
                      Code expires in:{" "}
                      <span className="text-lg font-semibold">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="mb-6 opacity-0 animate-fade-in-up delay-300">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      Verification code sent to:
                    </p>
                    <p className="text-sm text-gray-600">
                      {verificationData.email_masked}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <Formik
              initialValues={{ student_id: "", otp: "" }}
              validationSchema={validationSchema}
              onSubmit={handleVerification}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Student ID Field */}
                  <div className="opacity-0 animate-fade-in-up delay-400">
                    <label
                      htmlFor="student_id"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student ID
                    </label>
                    <Field
                      id="student_id"
                      name="student_id"
                      type="text"
                      placeholder="Enter your student ID"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white uppercase ${
                        errors.student_id && touched.student_id
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="student_id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* OTP Field */}
                  <div className="opacity-0 animate-fade-in-up delay-500">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Verification Code
                    </label>
                    <Field
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-center text-lg tracking-wider ${
                        errors.otp && touched.otp
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      onInput={(e: any) => {
                        // Only allow numbers
                        e.target.value = e.target.value.replace(/\D/g, "");
                      }}
                    />
                    <ErrorMessage
                      name="otp"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || timeLeft <= 0}
                    className={`w-full py-3 px-4 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform opacity-0 animate-fade-in-up delay-600 ${
                      isSubmitting || timeLeft <= 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isSubmitting ? (
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
                        Verifying...
                      </div>
                    ) : timeLeft <= 0 ? (
                      "Code Expired"
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>

                  {/* Resend Button */}
                  <div className="text-center opacity-0 animate-fade-in-up delay-700">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendingOTP || resendCooldown > 0}
                      className={`text-sm transition-colors duration-200 ${
                        resendCooldown > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      {isResendingOTP
                        ? "Sending..."
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend verification code"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            {/* Attempts Warning */}
            {verificationAttempts >= 2 && (
              <div className="mt-6 opacity-0 animate-fade-in-up delay-800">
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
                        {" "}
                        {verificationData.max_attempts -
                          verificationAttempts}{" "}
                        attempts remaining
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="text-center mt-6 opacity-0 animate-fade-in-up delay-900">
              <p className="text-sm text-gray-500">
                Your vote is secure and anonymous
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div className="flex-1 relative hidden md:flex items-center justify-center overflow-hidden opacity-0 animate-fade-in delay-100">
          {/* Background Image */}
          <Image
            src="../../../../public/login_page_image.png"
            alt="University Campus"
            fill
            className="object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 bg-opacity-60 backdrop-blur-sm"></div>
        </div>
      </div>
    </>
  );
};

export default VoterVerificationForm;
