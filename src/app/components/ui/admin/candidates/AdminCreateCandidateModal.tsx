"use client";

import React from "react";
import { X, Users, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ImageUpload from "@/app/components/ui/ImageUpload";
import { Candidate } from "@/services/adminApi";

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  election_id: string;
  created_at?: string;
}

interface CandidateFormData {
  full_name: string;
  photo_url?: string;
  manifesto?: string;
}

interface AdminCreateCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portfolioId: string, candidateData: CandidateFormData) => void;
  portfolios: Portfolio[];
  selectedCandidate?: Candidate | null;
  preselectedPortfolioId?: string;
  title: string;
  isEditMode?: boolean;
  isElectionLocked?: boolean;
}

// Validation schema
const validationSchema = Yup.object({
  portfolio_id: Yup.string().required("Portfolio is required"),
  full_name: Yup.string().trim().required("Candidate name is required"),
  photo_url: Yup.string(), // No validation since we use the ImageUpload component
  manifesto: Yup.string(),
});

const AdminCreateCandidateModal: React.FC<AdminCreateCandidateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  portfolios,
  selectedCandidate,
  preselectedPortfolioId,
  title,
  isEditMode = false,
  isElectionLocked = false,
}) => {
  const getInitialValues = () => {
    if (selectedCandidate) {
      return {
        portfolio_id: selectedCandidate.portfolio_id,
        full_name: selectedCandidate.full_name,
        photo_url: selectedCandidate.photo_url || "",
        manifesto: selectedCandidate.manifesto || "",
      };
    }
    return {
      portfolio_id: preselectedPortfolioId || "",
      full_name: "",
      photo_url: "",
      manifesto: "",
    };
  };

  const handleSubmit = async (
    values: any,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    try {
      const candidateData: CandidateFormData = {
        full_name: values.full_name,
        photo_url: values.photo_url || undefined,
        manifesto: values.manifesto || undefined,
      };

      await onSave(values.portfolio_id, candidateData);
    } catch (error: any) {
      console.error("Error saving candidate:", error);

      // Handle specific validation errors
      if (error.message?.includes("already exists")) {
        setFieldError("full_name", error.message);
      } else if (error.message?.includes("name is required")) {
        setFieldError("full_name", "Candidate name is required");
      } else if (error.message?.includes("Portfolio")) {
        setFieldError("portfolio_id", error.message);
      }
      // Don't close modal on error
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || isElectionLocked) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users
                    className="h-5 w-5 mr-2"
                    style={{ color: "#cc910d" }}
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
                {/* Portfolio Selection */}
                {!isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio *
                    </label>
                    <Field
                      as="select"
                      name="portfolio_id"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.portfolio_id && touched.portfolio_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      style={
                        {
                          "--tw-ring-color": "#cc910d",
                          "--tw-ring-opacity": "0.5",
                        } as React.CSSProperties
                      }
                    >
                      <option value="">Select a portfolio...</option>
                      {portfolios.map((portfolio) => (
                        <option key={portfolio.id} value={portfolio.id}>
                          {portfolio.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="portfolio_id"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                {/* Candidate Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <Field
                    type="text"
                    name="full_name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.full_name && touched.full_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    style={
                      {
                        "--tw-ring-color": "#cc910d",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="Enter candidate's full name..."
                  />
                  <ErrorMessage
                    name="full_name"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Candidate Photo
                  </label>
                  <ImageUpload
                    value={values.photo_url}
                    onChange={(url) => setFieldValue("photo_url", url)}
                    onRemove={() => setFieldValue("photo_url", "")}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Manifesto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Manifesto
                  </label>
                  <Field
                    as="textarea"
                    name="manifesto"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={
                      {
                        "--tw-ring-color": "#cc910d",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="Candidate's manifesto or campaign message (optional)..."
                  />
                </div>

                {/* Information Note */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#cc910d1a",
                    borderColor: "#cc910d",
                    borderWidth: "1px",
                  }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Users className="h-5 w-5" style={{ color: "#cc910d" }} />
                    </div>
                    <div className="ml-3">
                      <h3
                        className="text-sm font-medium"
                        style={{ color: "#8b7109" }}
                      >
                        Cloudinary Integration
                      </h3>
                      <div
                        className="mt-2 text-sm"
                        style={{ color: "#a0890b" }}
                      >
                        <p>
                          Photos are automatically uploaded to Cloudinary and
                          optimized. You can upload JPG, PNG, or GIF files up to
                          5MB in size.
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
                    backgroundColor: "#cc910d",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#b8820c";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#cc910d";
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedCandidate ? "Updating..." : "Adding..."}
                    </>
                  ) : selectedCandidate ? (
                    "Update Candidate"
                  ) : (
                    "Add Candidate"
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

export default AdminCreateCandidateModal;
