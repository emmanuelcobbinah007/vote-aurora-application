"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  GripVertical,
  Settings,
  Users,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Lock,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useCandidates } from "@/hooks/useCandidates";
import { useBallotOrder, useUpdateBallotOrder } from "@/hooks/useBallots";
import { useElectionWithDetails } from "@/hooks/useElections";

interface BallotSetupManagerProps {
  electionId: string;
  election?: {
    status: string;
  };
}

interface BallotOrder {
  portfolioId: string;
  portfolioTitle: string;
  order: number;
  candidatesCount: number;
}

// Sortable Portfolio Item Component
interface SortablePortfolioItemProps {
  item: BallotOrder;
  index: number;
  isLocked?: boolean;
}

const SortablePortfolioItem: React.FC<SortablePortfolioItemProps> = ({
  item,
  index,
  isLocked = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.portfolioId,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
        isDragging
          ? "border-blue-300 bg-blue-50 shadow-lg scale-105"
          : item.candidatesCount === 0
          ? "border-orange-200 bg-orange-50"
          : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className={`p-1 rounded transition-colors ${
              isLocked
                ? "cursor-not-allowed text-gray-300"
                : "cursor-grab active:cursor-grabbing hover:bg-gray-100"
            }`}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <span className="text-sm font-mono text-gray-500 w-8">
            #{item.order}
          </span>
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.portfolioTitle}</h4>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-600">
              {item.candidatesCount} candidate
              {item.candidatesCount !== 1 ? "s" : ""}
            </span>
            {item.candidatesCount === 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                No Candidates
              </Badge>
            )}
            {item.candidatesCount > 0 && (
              <Badge className="bg-green-200 text-green-900 border-green-400">
                Ready
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isDragging && (
        <div className="text-xs text-blue-600 font-medium">Dragging...</div>
      )}
    </div>
  );
};

const BallotSetupManager: React.FC<BallotSetupManagerProps> = ({
  electionId,
  election,
}) => {
  const [ballotOrder, setBallotOrder] = useState<BallotOrder[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get election details to check status - use passed election or fetch if not provided
  const { data: fetchedElection } = useElectionWithDetails(electionId);
  const electionData = election || fetchedElection;

  // TanStack Query hooks
  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios(electionId);

  const { data: candidates = [], isLoading: candidatesLoading } =
    useCandidates(electionId);

  const {
    data: ballots = [],
    isLoading: ballotsLoading,
    error: ballotsError,
  } = useBallotOrder(electionId);

  const updateBallotOrderMutation = useUpdateBallotOrder(electionId);

  const isLoading = portfoliosLoading || candidatesLoading || ballotsLoading;

  // Check if election is locked (LIVE or CLOSED)
  const isElectionLocked =
    electionData?.status === "LIVE" || electionData?.status === "CLOSED";

  // Set up sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize ballot order from existing ballots or create default order
  useEffect(() => {
    if (portfolios.length === 0) return;

    if (ballots.length > 0) {
      // Load existing ballot order from API response
      const initialOrder = ballots
        .map((ballot) => ({
          portfolioId: ballot.portfolio_id,
          portfolioTitle: ballot.portfolio.title,
          order: ballot.ballot_order,
          candidatesCount: ballot.portfolio._count.candidates,
        }))
        .sort((a, b) => a.order - b.order);

      setBallotOrder(initialOrder);
    } else {
      // Create default order from portfolios
      const defaultOrder = portfolios.map((portfolio, index) => ({
        portfolioId: portfolio.id,
        portfolioTitle: portfolio.title,
        order: index + 1,
        candidatesCount: candidates.filter(
          (c) => c.portfolio_id === portfolio.id
        ).length,
      }));

      setBallotOrder(defaultOrder);
    }
  }, [portfolios, candidates, ballots]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (isElectionLocked) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      setBallotOrder((items) => {
        const oldIndex = items.findIndex(
          (item) => item.portfolioId === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.portfolioId === over?.id
        );

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Update order numbers
        const updatedOrder = newOrder.map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        setHasUnsavedChanges(true);
        return updatedOrder;
      });
    }
  };

  const resetToAlphabetical = () => {
    if (isElectionLocked) return;

    const alphabeticalOrder = [...ballotOrder]
      .sort((a, b) => a.portfolioTitle.localeCompare(b.portfolioTitle))
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));

    setBallotOrder(alphabeticalOrder);
    setHasUnsavedChanges(true);
  };

  const saveChanges = () => {
    if (isElectionLocked) return;

    // Convert ballotOrder to API format
    const ballotOrderForAPI = ballotOrder.map((item) => ({
      portfolioId: item.portfolioId,
      order: item.order,
    }));

    updateBallotOrderMutation.mutate(ballotOrderForAPI, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
      },
    });
  };

  const discardChanges = () => {
    if (isElectionLocked) return;

    // Reset to original ballot order from API data
    if (ballots.length > 0) {
      const resetOrder = ballots
        .map((ballot) => ({
          portfolioId: ballot.portfolio_id,
          portfolioTitle: ballot.portfolio.title,
          order: ballot.ballot_order,
          candidatesCount: ballot.portfolio._count.candidates,
        }))
        .sort((a, b) => a.order - b.order);

      setBallotOrder(resetOrder);
    }
    setHasUnsavedChanges(false);
  };

  if (portfolios.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No portfolios available
        </h3>
        <p className="text-gray-500 mb-4">
          You need to create portfolios first before setting up the ballot.
        </p>
        <Button variant="outline" className="text-gray-600">
          Go to Portfolios Tab
        </Button>
      </Card>
    );
  }

  const totalCandidates = candidates.length;
  const portfoliosWithCandidates = ballotOrder.filter(
    (item) => item.candidatesCount > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2" style={{ color: "#2ecc71" }} />
            Ballot Setup
          </h2>
          <p className="text-gray-600 mt-1">
            Configure the order of portfolios as they will appear on the voting
            ballot
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={resetToAlphabetical}
            disabled={isElectionLocked}
            className="flex items-center space-x-2"
            title={
              isElectionLocked
                ? "Ballot reordering is locked while election is live or closed"
                : "Reset to alphabetical order"
            }
          >
            <RotateCcw className="h-4 w-4" />
            <span>Alphabetical Order</span>
          </Button>
          {hasUnsavedChanges && !isElectionLocked && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={discardChanges}
                className="text-gray-600"
                disabled={updateBallotOrderMutation.isPending}
              >
                Discard Changes
              </Button>
              <Button
                onClick={saveChanges}
                className="text-white"
                style={{ backgroundColor: "#2ecc71" }}
                disabled={updateBallotOrderMutation.isPending}
              >
                {updateBallotOrderMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Election Locked Warning */}
      {isElectionLocked && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">
                Ballot Setup Locked
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Ballot modifications are not allowed while the election is{" "}
                {electionData?.status?.toLowerCase()}. The ballot structure is
                now fixed and cannot be changed until the election ends.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#2ecc711a" }}
            >
              <Settings className="h-5 w-5" style={{ color: "#2ecc71" }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Portfolios</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolios.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCandidates}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 bg-opacity-10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-[#2ecc71]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready Portfolios</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfoliosWithCandidates}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ballot Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ballot Order Preview
          </h3>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Unsaved Changes
              </Badge>
            )}
            {isElectionLocked && (
              <Badge className="bg-green-200 text-green-900 border-green-400">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ballotOrder.map((item) => item.portfolioId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {ballotOrder.map((item, index) => (
                <SortablePortfolioItem
                  key={item.portfolioId}
                  item={item}
                  index={index}
                  isLocked={isElectionLocked}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      {/* Warnings */}
      {portfoliosWithCandidates < portfolios.length && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">
                Incomplete Ballot Setup
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {portfolios.length - portfoliosWithCandidates} portfolio
                {portfolios.length - portfoliosWithCandidates !== 1
                  ? "s have"
                  : " has"}{" "}
                no candidates yet. Voters won't be able to vote for these
                positions until candidates are added.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">
              Ballot Setup Instructions
            </h4>
            <div className="text-sm text-green-700 mt-1 space-y-1">
              <p>
                • Click and drag portfolios by the grip handle (⋮⋮) to reorder
                them as they will appear on the ballot
              </p>
              <p>
                • The order determines the sequence voters will see when casting
                their votes
              </p>
              <p>• Save changes to apply the new ballot structure</p>
              <p>
                • Portfolios without candidates will show as "No Candidates"
                warnings
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BallotSetupManager;
