import React from "react";
import type { Vote } from "@/types/prisma";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "./types";

interface VotesTableProps {
  votes: Vote[];
  candidates: Candidate[];
}

const VotesTable: React.FC<VotesTableProps> = ({ votes, candidates }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 overflow-auto">
      <h2 className="text-lg font-medium mb-3">Raw votes</h2>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="py-2 text-sm text-gray-600">ID</th>
            <th className="py-2 text-sm text-gray-600">Candidate</th>
            <th className="py-2 text-sm text-gray-600">Cast at</th>
          </tr>
        </thead>
        <tbody>
          {votes.map((v) => {
            const c = candidates.find((x) => x.id === v.candidate_id);
            return (
              <tr key={v.id} className="border-t">
                <td className="py-2 text-sm text-gray-700">{v.id}</td>
                <td className="py-2 text-sm text-gray-700">{c?.full_name || 'Unknown'}</td>
                <td className="py-2 text-sm text-gray-500">
                  {new Date(v.cast_at).toLocaleString()}
                </td>
              </tr>
            );
          })}
          {votes.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                No votes cast yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VotesTable;
