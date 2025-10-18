"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Crown, User, Shield } from "lucide-react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";

interface Approver {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

interface HandleOrchestratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "replace";
  currentApprover?: Approver | null;
}

const HandleOrchestratorModal: React.FC<HandleOrchestratorModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentApprover,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    // .matches(
    //   /^[a-zA-Z0-9._%+-]+@st\.atu\.edu\.gh$/,
    //   "Email must be from UPSA domain (@st.atu.edu.gh)"
    // ),
  });

  // Form submission handler
  const handleSubmit = async (
    values: { email: string; role: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      // Call the API to create/replace approver
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          role: "APPROVER", // Specifically assigning the APPROVER role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }

      const data = await response.json();
      console.log(
        `${mode === "create" ? "Creating" : "Replacing"} approver:`,
        data
      );

      // Show success message and close modal
      toast.success(`Invitation sent successfully to ${values.email}`);
      handleClose();
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "replacing"} approver:`,
        error
      );

      // Use toast notifications for errors instead of inline field state
      const message =
        error?.message || "Failed to send invitation. Please try again.";
      if (
        message.includes("already exists") ||
        message.includes("pending invitation")
      ) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  const isCreateMode = mode === "create";
  const title = isCreateMode
    ? "Create New Approver"
    : "Replace Current Approver";
  const description = isCreateMode
    ? "Enter the UPSA email address of the person you want to designate as the election approver."
    : "Enter the UPSA email address of the new person who will replace the current approver.";
  const buttonText = isCreateMode ? "Create Approver" : "Replace Approver";
  const noteText = isCreateMode
    ? "An invitation email will be sent to this address with instructions to set up their approver account."
    : "The current approver will be notified of the change, and an invitation will be sent to the new approver.";

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-fade-out {
          animation: fadeOut 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }

        .animate-scale-out {
          animation: scaleOut 0.2s ease-out forwards;
        }
      `}</style>
      <ToastContainer />
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
            isClosing ? "animate-scale-out" : "animate-scale-in"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <Formik
            initialValues={{ email: "", role: "APPROVER" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  {/* Current Approver Info (for replace mode) */}
                  {!isCreateMode && currentApprover && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">
                        Current Approver
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            {currentApprover.full_name}
                          </p>
                          <p className="text-xs text-yellow-700">
                            {currentApprover.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 ${
                        isCreateMode ? "bg-blue-100" : "bg-yellow-100"
                      } rounded-full flex items-center justify-center`}
                    >
                      {isCreateMode ? (
                        <Crown className="w-8 h-8 text-blue-600" />
                      ) : (
                        <Shield className="w-8 h-8 text-yellow-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                      {isCreateMode
                        ? "Designate Election Approver"
                        : "Replace Election Approver"}
                    </h3>
                    <p className="text-gray-600 text-center text-sm">
                      {description}
                    </p>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="john.doe@upsamail.edu.gh"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                          errors.email && touched.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
                        <span className="mr-1"> </span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div
                    className={`mt-4 p-3 ${
                      isCreateMode
                        ? "bg-blue-50 border-blue-200"
                        : "bg-yellow-50 border-yellow-200"
                    } border rounded-lg`}
                  >
                    <p
                      className={`text-xs ${
                        isCreateMode ? "text-blue-700" : "text-yellow-700"
                      }`}
                    >
                      <strong>Note:</strong> {noteText}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                      isCreateMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {isCreateMode ? "Creating..." : "Replacing..."}
                        </span>
                      </>
                    ) : (
                      <>
                        {isCreateMode ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        <span>{buttonText}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </>
  );
};

export default HandleOrchestratorModal;
