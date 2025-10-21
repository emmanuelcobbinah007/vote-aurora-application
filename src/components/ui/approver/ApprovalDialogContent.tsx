"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ApprovalDialogContentProps {
  election: any;
  comments: string;
  setComments: (v: string) => void;
  requestReview: boolean;
  setRequestReview: (v: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  isSubmitting?: boolean;
}

const ApprovalDialogContent: React.FC<ApprovalDialogContentProps> = React.memo(
  ({
    election,
    comments,
    setComments,
    requestReview,
    setRequestReview,
    onApprove,
    onReject,
    isSubmitting,
  }) => {
    // Local state to prevent re-renders and scroll jumping
    const [localComments, setLocalComments] = React.useState(comments);
    const [localRequestReview, setLocalRequestReview] =
      React.useState(requestReview);

    // Sync local state with props when election changes
    React.useEffect(() => {
      setLocalComments(comments);
      setLocalRequestReview(requestReview);
    }, [election?.id]); // Only reset when election changes

    // NO automatic syncing - only sync on form submission to prevent scroll jumping

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleApproveClick = () => {
      // Sync immediately before action
      setComments(localComments);
      setRequestReview(localRequestReview);
      setTimeout(() => onApprove(), 50);
    };

    const handleRejectClick = () => {
      // Sync immediately before action
      setComments(localComments);
      setRequestReview(localRequestReview);
      setTimeout(() => onReject(), 50);
    };

    if (!election) return null;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Election Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {election.title}
                </div>
                <div>
                  <span className="font-medium">Department:</span>{" "}
                  {election.department}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <Badge
                    className={
                      election.isGeneral
                        ? "bg-[#2ecc71]/20 text-[#2ecc71]"
                        : "bg-green-50 text-green-800"
                    }
                  >
                    {election.isGeneral
                      ? "General Election"
                      : "Departmental Election"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{election.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />{" "}
                  <span>Start: {formatDate(election.startDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />{" "}
                  <span>End: {formatDate(election.endDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[#2ecc71]/20 rounded-lg">
                  <div className="text-lg font-semibold text-[#2ecc71]">
                    {Array.isArray(election.portfolios)
                      ? election.portfolios.length
                      : election.portfolios}
                  </div>
                  <div className="text-xs text-gray-500">Portfolios</div>
                </div>
                <div className="text-center p-3 bg-[#2ecc71]/15 rounded-lg">
                  <div className="text-lg font-semibold text-[#2ecc71]">
                    {Array.isArray(election.candidates)
                      ? election.candidates.length
                      : election.candidates}
                  </div>
                  <div className="text-xs text-gray-500">Candidates</div>
                </div>
                <div className="text-center p-3 bg-[#2ecc71]/10 rounded-lg">
                  <div className="text-lg font-semibold text-[#2ecc71]">
                    {election.expectedVoters}
                  </div>
                  <div className="text-xs text-gray-500">Estimated Voters</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Portfolios and their candidates - placed immediately above comments */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Portfolios & Candidates
            </h3>
            <div className="space-y-3">
              {Array.isArray(election?.portfolios) &&
              election.portfolios.length > 0 ? (
                election.portfolios.map((p: any) => {
                  const pCandidates = (election?.candidates || []).filter(
                    (c: any) => c.portfolio_id === p.id
                  );

                  return (
                    <div
                      key={p.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {p.title}
                          </div>
                          {p.description ? (
                            <div className="text-xs text-gray-500 mt-1">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pCandidates.length} candidates
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {pCandidates.length > 0 ? (
                          pCandidates.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-3">
                              {c.photo_url ? (
                                <img
                                  src={c.photo_url}
                                  alt={c.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : null}
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {c.full_name}
                                </div>
                                {c.manifesto ? (
                                  <div className="text-xs text-gray-500 truncate max-w-lg">
                                    {c.manifesto}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No candidates
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No portfolios</div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="request-review"
                checked={localRequestReview}
                onCheckedChange={(checked) => setLocalRequestReview(!!checked)}
              />
              <label
                htmlFor="request-review"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Request review instead of outright rejection
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              {localRequestReview
                ? "This will keep the election in pending status for further review rather than sending it back to draft."
                : "Uncheck this to directly reject and send the election back to draft status."}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments/Feedback{" "}
                {localRequestReview
                  ? "(Required for review requests)"
                  : "(Optional)"}
              </label>
              <Textarea
                value={localComments}
                onChange={(e) => setLocalComments(e.target.value)}
                placeholder="Add any comments or feedback for the admin..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleApproveClick}
            className="bg-[#2ecc71] hover:bg-[#1e8e3e] text-white flex-1"
            disabled={!!isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Approve"}
          </Button>
          <Button
            onClick={handleRejectClick}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
            disabled={!!isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Reject"}
          </Button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the election ID or isSubmitting changes
    // Ignore comments/requestReview props to prevent re-renders
    return (
      prevProps.election?.id === nextProps.election?.id &&
      prevProps.isSubmitting === nextProps.isSubmitting
    );
  }
);

ApprovalDialogContent.displayName = "ApprovalDialogContent";

export default ApprovalDialogContent;
