"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Crown, User, Shield } from "lucide-react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

interface SuperAdmin {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

interface HandleSuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "replace";
  currentSuperAdmin?: SuperAdmin | null;
}

const HandleSuperAdminModal: React.FC<HandleSuperAdminModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentSuperAdmin,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Validation schema
  // const validationSchema = Yup.object({
  //   email: Yup.string()
  //     .email("Please enter a valid email address")
  //     .required("Email is required")
  //     .matches(
  //       /^[a-zA-Z0-9._%+-]+@upsa\.edu\.gh$/,
  //       "Email must be from UPSA domain (@upsa.edu.gh)"
  //     ),
  // });

  // For testing with any email address:
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    // .matches(
    //   /^[a-zA-Z0-9._%+-]+@upsa\.edu\.gh$/,
    //   "Email must be from UPSA domain (@upsa.edu.gh)"
    // ),
  });

  // Form submission handler
  const handleSubmit = async (
    values: { email: string; role: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const response = await axios.post("/api/invite", {
        email: values.email,
        role: "SUPERADMIN",
      });

      console.log(
        `${
          mode === "create" ? "Creating" : "Replacing"
        } superadmin invitation sent:`,
        response.data
      );

      // Call success callback if provided
      handleClose();
      toast.success("SuperAdmin Invite sent successfully");
    } catch (error: any) {
      toast.error("Something went wrong. Please try again later.");
      console.error(
        `Error ${mode === "create" ? "creating" : "replacing"} superadmin:`,
        error
      );

      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;

        // Handle specific error cases
        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("pending invitation")
        ) {
          setFieldError("email", errorMessage);
        } else {
          setFieldError("email", errorMessage);
        }
      } else {
        setFieldError("email", "Failed to send invitation. Please try again.");
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

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <ToastContainer />
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto ${
          isClosing ? "animate-scaleOut" : "animate-scaleIn"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === "create" ? "Create SuperAdmin" : "Replace SuperAdmin"}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === "create"
                  ? "Set up a new system superadmin"
                  : "Replace the current system superadmin"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Current SuperAdmin Info (for replace mode) */}
        {mode === "replace" && currentSuperAdmin && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Current SuperAdmin
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {currentSuperAdmin.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {currentSuperAdmin.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  {currentSuperAdmin.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <Formik
            initialValues={{
              email: "",
              role: "SUPERADMIN",
            }}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter UPSA email address"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email && touched.email
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {mode === "replace" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Replace SuperAdmin
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          This action will replace the current superadmin with
                          the new one. The current superadmin will lose all
                          administrative privileges.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      mode === "create"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting
                      ? mode === "create"
                        ? "Creating..."
                        : "Replacing..."
                      : mode === "create"
                      ? "Create SuperAdmin"
                      : "Replace SuperAdmin"}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>

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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-fadeOut {
          animation: fadeOut 0.2s ease-in;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .animate-scaleOut {
          animation: scaleOut 0.2s ease-in;
        }
      `}</style>
    </div>
  );
};

export default HandleSuperAdminModal;
