"use client";

import React from "react";
import { X, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Portfolio, PortfolioFormData } from "./ElectionDetailsTypes";

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portfolioData: PortfolioFormData) => void;
  selectedPortfolio?: Portfolio | null;
  title: string;
}

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string().trim().required("Portfolio title is required"),
  description: Yup.string(),
});

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedPortfolio,
  title,
}) => {
  const getInitialValues = (): PortfolioFormData => {
    if (selectedPortfolio) {
      return {
        title: selectedPortfolio.title,
        description: selectedPortfolio.description || "",
      };
    }
    return {
      title: "",
      description: "",
    };
  };

  const handleSubmit = async (
    values: PortfolioFormData,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    try {
      await onSave(values);
    } catch (error: any) {
      console.error("Error saving portfolio:", error);

      // Handle specific validation errors
      if (error.message.includes("already exists")) {
        setFieldError("title", error.message);
      } else if (error.message.includes("title is required")) {
        setFieldError("title", "Portfolio title is required");
      }
      // Don't close modal on error
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings
                    className="h-5 w-5 mr-2"
                    style={{ color: "#2ecc71" }}
                  />
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Title *
                  </label>
                  <Field
                    type="text"
                    name="title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.title && touched.title
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    style={
                      {
                        "--tw-ring-color": "#2ecc71",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="e.g., President, Secretary, Treasurer..."
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={
                      {
                        "--tw-ring-color": "#2ecc71",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="Optional description of this portfolio/position..."
                  />
                </div>

                {/* Information Note */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#2ecc711a",
                    borderColor: "#2ecc71",
                    borderWidth: "1px",
                  }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Settings
                        className="h-5 w-5"
                        style={{ color: "#2ecc71" }}
                      />
                    </div>
                    <div className="ml-3">
                      <h3
                        className="text-sm font-medium"
                        style={{ color: "#1a7f37" }}
                      >
                        Portfolio Guidelines
                      </h3>
                      <div
                        className="mt-2 text-sm"
                        style={{ color: "#166534" }}
                      >
                        <p>
                          Each portfolio represents a position candidates can
                          run for. After creating portfolios, you can add
                          candidates to compete for these positions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white"
                  style={{
                    backgroundColor: "#2ecc71",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#27ae60";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2ecc71";
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedPortfolio ? "Updating..." : "Creating..."}
                    </>
                  ) : selectedPortfolio ? (
                    "Update Portfolio"
                  ) : (
                    "Create Portfolio"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
