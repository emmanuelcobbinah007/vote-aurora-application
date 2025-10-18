"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, User, Shield } from "lucide-react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

interface AddOrchestratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddOrchestratorModal: React.FC<AddOrchestratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation schema - now accepts any valid email
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  // Form submission handler
  const handleSubmit = async (
    values: { email: string; role: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      setSubmitError(null);

      const response = await axios.post("/api/invite", {
        email: values.email,
        role: "ORCHESTRATOR",
      });

      console.log("Invitation sent successfully:", response.data);

      // Call success callback to refresh the orchestrator list
      if (onSuccess) {
        onSuccess();
      }

      handleClose();
      toast.success("Invitation sent successfully.");
    } catch (error: any) {
      console.error("Error sending invitation:", error);

      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;

        // Use toast notifications for errors instead of inline submitError/state
        // Handle specific error cases
        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("pending invitation")
        ) {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to send invitation. Please try again.");
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
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Orchestrator
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <Formik
            initialValues={{ email: "", role: "ORCHESTRATOR" }}
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
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                      Invite New Orchestrator
                    </h3>
                    <p className="text-gray-600 text-center text-sm">
                      Enter the email address of the person you want to invite
                      as an orchestrator. They can use any valid email address.
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
                        placeholder="john.doe@gmail.com"
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

                  {/* General Error Message */}
                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm flex items-center">
                        <span className="mr-1"> </span>
                        {submitError}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> An invitation email will be sent to
                      this address with instructions to set up their
                      orchestrator account.
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Invitation</span>
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

export default AddOrchestratorModal;
