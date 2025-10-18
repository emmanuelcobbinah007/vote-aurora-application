"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApprovalModal from "@/components/ui/approver/ApprovalModal";
import ApprovalDialogContent from "@/components/ui/approver/ApprovalDialogContent";
import { getElectionWithDetails, mockElections } from "@/data/elections";

export default function ApprovedElectionsRefactor() {
  const params = useParams();
  const approverId = params?.approverId ?? "unknown";

  const approvedList = useMemo(
    () =>
      mockElections.filter((e) =>
        ["APPROVED", "LIVE", "CLOSED"].includes(e.status)
      ),
    []
  );

  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(
    null
  );
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedElection = useMemo(() => {
    const raw = selectedElectionId
      ? getElectionWithDetails(selectedElectionId)
      : null;
    if (!raw) return null;

    return {
      ...raw,
      startDate: raw.start_time,
      endDate: raw.end_time,
      approvedAt: raw.updated_at,
      portfolios: raw.portfolios?.length ?? 0,
      candidates: raw.candidates?.length ?? 0,
      expectedVoters: raw.total_voters ?? raw.total_votes ?? 0,
    } as any;
  }, [selectedElectionId]);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approved Elections</h1>
        <div className="text-sm text-gray-600">Approver: {approverId}</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvedList.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base font-medium">{e.title}</span>
                <Badge className="bg-blue-50 text-blue-800">{e.status}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{e.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Estimated Voters: {e.total_voters ?? 0}</div>
                <div>Total Votes: {e.total_votes ?? 0}</div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={() => setSelectedElectionId(e.id)}>
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ApprovalModal
        isOpen={!!selectedElection}
        onClose={() => setSelectedElectionId(null)}
        title={selectedElection?.title ?? "Election Details"}
        portfolios={selectedElection?.portfolios ?? 0}
        candidates={selectedElection?.candidates ?? 0}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setSelectedElectionId(null)}>
              Close
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Revoke Approval
            </Button>
          </div>
        }
      >
        <ApprovalDialogContent
          election={selectedElection}
          comments={comments}
          setComments={setComments}
          requestReview={false}
          setRequestReview={() => {}} // No-op for approved view
          onApprove={() => {
            /* noop for approved listing view */
          }}
          onReject={() => {
            /* noop for approved listing view */
          }}
          isSubmitting={isSubmitting}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            className="w-full border rounded-md p-2"
            rows={3}
            placeholder="Optional notes about this approved election"
          />
        </div>
      </ApprovalModal>
    </div>
  );
}
