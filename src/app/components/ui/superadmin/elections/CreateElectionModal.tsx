"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Calendar,
  FileText,
  Clock,
  Building2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import type { Election } from "./ElectionTypes";
import { mockDepartments } from "@/data/departments";
import axios from "axios";

interface CreateElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElection: Election | null;
  onSave?: (electionData: Partial<Election>) => void;
}

interface ElectionFormData {
  title: string;
  description: string;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "LIVE"
    | "CLOSED"
    | "ARCHIVED";
  start_time: string;
  end_time: string;
  is_general: string; // Changed to string for radio button handling
  department: string;
}

// Dynamic validation schema based on election status
const createValidationSchema = (electionStatus?: string) => {
  return Yup.object({
    title: Yup.string().trim().required("Election title is required"),
    description: Yup.string(),
    is_general: Yup.string().required(),
    department: Yup.string().when("is_general", {
      is: "false",
      then: (schema) => schema.required("Please select a department"),
      otherwise: (schema) => schema.notRequired(),
    }),
    start_time: Yup.string().required("Start time is required"),
    end_time: Yup.string()
      .required("End time is required")
      .test(
        "is-after-start",
        "End time must be after start time",
        function (value) {
          const { start_time } = this.parent;
          if (!value || !start_time) return false;
          return new Date(value) > new Date(start_time);
        }
      )
      // For LIVE elections, end time must be in the future
      .test(
        "live-end-time-future",
        "End time must be in the future for live elections",
        function (value) {
          if (electionStatus === "LIVE" && value) {
            return new Date(value) > new Date();
          }
          return true;
        }
      ),
  });
};

const CreateElectionModal: React.FC<CreateElectionModalProps> = ({
  isOpen,
  onClose,
  selectedElection,
  onSave,
}) => {
  const [departments, setDepartments] = useState(mockDepartments);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // Determine if election is editable based on status
  const isEditingMode = !!selectedElection;
  const electionStatus = selectedElection?.status;
  const isLiveElection = electionStatus === "LIVE";
  const isClosedElection =
    electionStatus === "CLOSED" || electionStatus === "ARCHIVED";
  const isReadOnlyMode = isClosedElection;
  const isRestrictedMode = isLiveElection;

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoadingDepartments(true);
        setDepartmentError(null);
        const response = await axios.get("/api/university/departments");

        if (response.data.success) {
          console.log("Fetched departments:", response.data.data);
          setDepartments(response.data.data);

          // Show warning if using mock data
          if (response.data.source === "mock_data" && response.data.warning) {
            console.warn(
              "University database unavailable:",
              response.data.warning
            );
            setDepartmentError(`Warning: ${response.data.warning}`);
          }
        } else {
          console.error("Failed to fetch departments:", response.data.error);
          setDepartmentError(
            response.data.error || "Failed to fetch departments"
          );
          // Keep using mock departments as fallback
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentError("Network error while fetching departments");
        // Keep using mock departments as fallback
      } finally {
        setLoadingDepartments(false);
      }
    }

    if (isOpen && !isReadOnlyMode) {
      fetchDepartments();
    }
  }, [isOpen, isReadOnlyMode]);

  // Get initial values based on whether we're editing or creating
  const getInitialValues = (): ElectionFormData => {
    if (selectedElection) {
      return {
        title: selectedElection.title,
        description: selectedElection.description || "",
        status: selectedElection.status,
        start_time: new Date(selectedElection.start_time)
          .toISOString()
          .slice(0, 16),
        end_time: new Date(selectedElection.end_time)
          .toISOString()
          .slice(0, 16),
        is_general:
          (selectedElection as any).is_general ?? true ? "true" : "false",
        department: (selectedElection as any).department || "General",
      };
    }
    return {
      title: "",
      description: "",
      status: "DRAFT",
      start_time: "",
      end_time: "",
      is_general: "true",
      department: "General",
    };
  };

  const handleSubmit = async (
    values: ElectionFormData,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      let electionData: any = {};

      if (isRestrictedMode) {
        // For LIVE elections, only allow end_time changes
        electionData = {
          end_time: new Date(values.end_time).toISOString(),
        };
      } else if (!isReadOnlyMode) {
        // For other editable statuses, allow all fields
        electionData = {
          ...values,
          start_time: new Date(values.start_time).toISOString(),
          end_time: new Date(values.end_time).toISOString(),
          is_general: values.is_general === "true",
        };
      }

      if (onSave) {
        await onSave(electionData);
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Error saving election:", error);
      // Handle error (could show a toast notification here)
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to determine if a field should be disabled
  const isFieldDisabled = (fieldName: string) => {
    if (isReadOnlyMode) return true;
    if (isRestrictedMode && fieldName !== "end_time") return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={createValidationSchema(electionStatus)}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar
                    className="h-5 w-5 mr-2"
                    style={{ color: "#cc910d" }}
                  />
                  {selectedElection ? "Edit Election" : "Create New Election"}
                  {isReadOnlyMode && (
                    <Lock className="h-4 w-4 ml-2 text-red-500" />
                  )}
                  {isRestrictedMode && (
                    <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                  )}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Status Warning Banner */}
              {(isReadOnlyMode || isRestrictedMode) && (
                <div
                  className={`p-4 border-b ${
                    isReadOnlyMode
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center">
                    {isReadOnlyMode ? (
                      <Lock className="h-5 w-5 text-red-500 mr-3" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                    )}
                    <div>
                      <h4
                        className={`font-medium ${
                          isReadOnlyMode ? "text-red-800" : "text-amber-800"
                        }`}
                      >
                        {isReadOnlyMode
                          ? "Election is Closed - Read Only"
                          : "Election is Live - Limited Editing"}
                      </h4>
                      <p
                        className={`text-sm ${
                          isReadOnlyMode ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {isReadOnlyMode
                          ? "This election has ended and cannot be modified."
                          : "Only the end time can be modified while the election is live."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Election Title *
                    {isFieldDisabled("title") && (
                      <Lock className="inline h-3 w-3 ml-1 text-gray-400" />
                    )}
                  </label>
                  <Field
                    type="text"
                    name="title"
                    disabled={isFieldDisabled("title")}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.title && touched.title
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${
                      isFieldDisabled("title")
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    style={
                      {
                        "--tw-ring-color": "#cc910d",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="Enter election title..."
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
                    {isFieldDisabled("description") && (
                      <Lock className="h-3 w-3 ml-1 text-gray-400" />
                    )}
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    disabled={isFieldDisabled("description")}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                      isFieldDisabled("description")
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    style={
                      {
                        "--tw-ring-color": "#cc910d",
                        "--tw-ring-opacity": "0.5",
                      } as React.CSSProperties
                    }
                    placeholder="Optional description for the election..."
                  />
                </div>

                {/* Election Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Election Type *
                    {isFieldDisabled("is_general") && (
                      <Lock className="inline h-3 w-3 ml-1 text-gray-400" />
                    )}
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Field
                        type="radio"
                        name="is_general"
                        value="true"
                        disabled={isFieldDisabled("is_general")}
                        className={`h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500 ${
                          isFieldDisabled("is_general")
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <label
                        className={`ml-3 text-sm ${
                          isFieldDisabled("is_general")
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        General Election (University-wide)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Field
                        type="radio"
                        name="is_general"
                        value="false"
                        disabled={isFieldDisabled("is_general")}
                        className={`h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500 ${
                          isFieldDisabled("is_general")
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <label
                        className={`ml-3 text-sm ${
                          isFieldDisabled("is_general")
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        Department-Specific Election
                      </label>
                    </div>
                  </div>
                </div>

                {/* Department Selection - Only show when department-specific is selected */}
                {values.is_general === "false" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      Department *
                      {isFieldDisabled("department") && (
                        <Lock className="h-3 w-3 ml-1 text-gray-400" />
                      )}
                      {loadingDepartments && !isFieldDisabled("department") && (
                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                      )}
                    </label>
                    <Field
                      as="select"
                      name="department"
                      disabled={
                        isFieldDisabled("department") || loadingDepartments
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.department && touched.department
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        isFieldDisabled("department") || loadingDepartments
                          ? "bg-gray-50 cursor-not-allowed text-gray-500"
                          : ""
                      }`}
                      style={
                        {
                          "--tw-ring-color": "#cc910d",
                          "--tw-ring-opacity": "0.5",
                        } as React.CSSProperties
                      }
                    >
                      <option value="">
                        {loadingDepartments
                          ? "Loading departments..."
                          : "Select a department..."}
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name} {dept.code && `(${dept.code})`}{" "}
                          {dept.faculty &&
                            dept.faculty !== "General" &&
                            `- ${dept.faculty}`}
                        </option>
                      ))}
                    </Field>
                    {departmentError && !isFieldDisabled("department") && (
                      <p className="text-amber-600 text-sm mt-1 flex items-center">
                        <span className="mr-1"> </span>
                        {departmentError} (Using default departments)
                      </p>
                    )}
                    <ErrorMessage
                      name="department"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                {/* Status Field - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    value={values.status.replace(/_/g, " ")}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="Status is automatically managed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Status is automatically managed based on election lifecycle
                  </p>
                </div>

                {/* DateTime Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Start Time *
                      {isFieldDisabled("start_time") && (
                        <Lock className="h-3 w-3 ml-1 text-gray-400" />
                      )}
                    </label>
                    <Field
                      type="datetime-local"
                      name="start_time"
                      disabled={isFieldDisabled("start_time")}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.start_time && touched.start_time
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        isFieldDisabled("start_time")
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                      style={
                        {
                          "--tw-ring-color": "#cc910d",
                          "--tw-ring-opacity": "0.5",
                        } as React.CSSProperties
                      }
                    />
                    <ErrorMessage
                      name="start_time"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      End Time *
                      {isRestrictedMode && (
                        <span className="ml-1 text-xs text-amber-600 font-normal">
                          (Editable)
                        </span>
                      )}
                      {isReadOnlyMode && (
                        <Lock className="h-3 w-3 ml-1 text-gray-400" />
                      )}
                    </label>
                    <Field
                      type="datetime-local"
                      name="end_time"
                      disabled={isFieldDisabled("end_time")}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.end_time && touched.end_time
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        isFieldDisabled("end_time")
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : ""
                      } ${
                        isRestrictedMode && !isFieldDisabled("end_time")
                          ? "border-amber-300 bg-amber-50"
                          : ""
                      }`}
                      style={
                        {
                          "--tw-ring-color": isRestrictedMode
                            ? "#f59e0b"
                            : "#cc910d",
                          "--tw-ring-opacity": "0.5",
                        } as React.CSSProperties
                      }
                    />
                    <ErrorMessage
                      name="end_time"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                    {isRestrictedMode && !isFieldDisabled("end_time") && (
                      <p className="text-xs text-amber-600 mt-1">
                        You can extend the election end time while it's live
                      </p>
                    )}
                  </div>
                </div>

                {/* Information Note */}
                {!isReadOnlyMode && (
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
                        <Calendar
                          className="h-5 w-5"
                          style={{ color: "#cc910d" }}
                        />
                      </div>
                      <div className="ml-3">
                        <h3
                          className="text-sm font-medium"
                          style={{ color: "#8b7109" }}
                        >
                          {isRestrictedMode
                            ? "Live Election"
                            : "Election Setup"}
                        </h3>
                        <div
                          className="mt-2 text-sm"
                          style={{ color: "#a0890b" }}
                        >
                          <p>
                            {isRestrictedMode
                              ? "This election is currently live. Only the end time can be modified to extend the voting period."
                              : "After creating the election, you can add portfolios and candidates from the election details page."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {isReadOnlyMode ? "Close" : "Cancel"}
                </Button>
                {!isReadOnlyMode && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white"
                    style={{
                      backgroundColor: isRestrictedMode ? "#f59e0b" : "#cc910d",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isRestrictedMode
                        ? "#d97706"
                        : "#b8820c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isRestrictedMode
                        ? "#f59e0b"
                        : "#cc910d";
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isRestrictedMode
                          ? "Updating End Time..."
                          : selectedElection
                          ? "Updating..."
                          : "Creating..."}
                      </>
                    ) : isRestrictedMode ? (
                      "Update End Time"
                    ) : selectedElection ? (
                      "Update Election"
                    ) : (
                      "Create Election"
                    )}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateElectionModal;
