import React, { useState } from "react";
import { X, Mail, Send } from "lucide-react";
import { Election } from "./subadminTypes";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void> | void;
  election: Election | null;
}

interface ReassignmentData {
  requiresReassignment: true;
  currentAssignment: {
    electionId: string;
    electionTitle: string;
    electionStatus: string;
  };
  message: string;
}

export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  election,
}) => {
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .email("Please enter a valid email address")
      .required("Email is required"),
    // .test(
    //   "is-upsa-domain",
    //   "Email must be an @upsa.edu.gh address",
    //   (value) => !!value && value.endsWith("@upsa.edu.gh")
    // ),
  });

  // Local submitting flag to make spinner reliable across parent re-renders
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Force re-render trigger for button state
  const [, forceUpdate] = useState({});

  // Error state for modal feedback
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reassignment state
  const [reassignmentData, setReassignmentData] =
    useState<ReassignmentData | null>(null);
  const [showReassignmentConfirm, setShowReassignmentConfirm] = useState(false);
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Clear any previous errors
      setSubmitError(null);
      setReassignmentData(null);
      setShowReassignmentConfirm(false);

      // Set both states immediately
      setSubmitting(true);
      setLocalSubmitting(true);

      try {
        // First, try to send the invitation
        const response = await fetch(`/api/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            electionId: election?.id,
            email: values.email.trim(),
            role: "ADMIN",
          }),
        });

        const data = await response.json();

        // Check if this is a reassignment scenario (can happen with 200 or error status)
        if (data.requiresReassignment) {
          setReassignmentData(data);
          setShowReassignmentConfirm(true);
          setSubmitting(false);
          setLocalSubmitting(false);
          return;
        }

        if (!response.ok) {
          // Regular error
          throw new Error(data.error || "Failed to send invitation");
        }

        // Success - invitation sent
        toast.success("Invitation sent successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        resetForm();
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (err) {
        console.log("Caught error in onSubmit:", err);

        // Dismiss any loading toasts
        toast.dismiss();

        // Extract error message
        let errorMessage = "Failed to send invitation. Please try again.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        } else if (err && typeof err === "object" && "message" in err) {
          errorMessage = String(err.message);
        }

        setSubmitError(errorMessage);

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setSubmitting(false);
        setLocalSubmitting(false);
      }
    },
  });

  const handleReassignAdmin = async () => {
    if (!reassignmentData) return;

    setLocalSubmitting(true);

    try {
      const loadingToast = toast.loading("Reassigning admin...", {
        position: "top-right",
      });

      const response = await fetch(`/api/admin/reassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminEmail: formik.values.email.trim(),
          newElectionId: election?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reassign admin");
      }

      toast.dismiss(loadingToast);
      toast.success("Admin reassigned successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      formik.resetForm();
      setReassignmentData(null);
      setShowReassignmentConfirm(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      toast.dismiss();
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reassign admin";
      setSubmitError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleCancelReassignment = () => {
    setReassignmentData(null);
    setShowReassignmentConfirm(false);
  };

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null); // Clear any errors when closing
    setReassignmentData(null);
    setShowReassignmentConfirm(false);
    onClose();
  };

  if (!isOpen || !election) return null;

  const isSubmittingState = formik.isSubmitting || localSubmitting;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-300 animate-out fade-out-0 duration-300"
      onClick={showReassignmentConfirm ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 animate-out slide-out-to-bottom-4 zoom-out-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Invite Administrator
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Election Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-1">Election</h3>
          <p className="text-sm text-gray-600">{election.title}</p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="admin@upsa.edu.gh"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {submitError}
              </p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-[#2ecc71]">
              <strong>Note:</strong> The administrator will receive an email
              invitation to manage this election. They can accept the invitation
              to gain access.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingState}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#1e8e3e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingState ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Reassignment Confirmation Dialog */}
      {showReassignmentConfirm && reassignmentData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 animate-in fade-in-0 duration-300 animate-out fade-out-0 duration-300">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 animate-out slide-out-to-bottom-4 zoom-out-95 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reassign Admin
              </h3>
              <button
                onClick={handleCancelReassignment}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                {reassignmentData.message}
              </p>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">
                  Current Assignment
                </h4>
                <p className="text-sm text-amber-700">
                  <strong>Election:</strong>{" "}
                  {reassignmentData.currentAssignment.electionTitle}
                </p>
                <p className="text-sm text-amber-700">
                  <strong>Status:</strong>{" "}
                  {reassignmentData.currentAssignment.electionStatus}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelReassignment}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignAdmin}
                disabled={localSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {localSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Reassigning...
                  </>
                ) : (
                  "Reassign Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteAdminModal;
