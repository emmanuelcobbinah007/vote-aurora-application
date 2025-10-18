import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStatesProps {
  type: "no-election" | "analytics-error" | "no-data";
  onBack: () => void;
  onRetry?: () => void;
}

const ErrorStates: React.FC<ErrorStatesProps> = ({ type, onBack, onRetry }) => {
  const getErrorContent = () => {
    switch (type) {
      case "no-election":
        return {
          emoji: " ",
          title: "No Election Assigned",
          message:
            "You don't have an election assigned yet. Please contact your administrator.",
          showRetry: false,
        };
      case "analytics-error":
        return {
          emoji: " ",
          title: "Error Loading Analytics",
          message: "Failed to load analytics data. Please try again.",
          showRetry: true,
        };
      case "no-data":
        return {
          emoji: "📊",
          title: "No Analytics Data",
          message: "No analytics data available for this election.",
          showRetry: false,
        };
      default:
        return {
          emoji: " ",
          title: "Unknown Error",
          message: "An unexpected error occurred.",
          showRetry: false,
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full mx-4 max-w-md">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">{content.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 mb-4">{content.message}</p>
          <div className="space-y-2">
            {content.showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                Try Again
              </Button>
            )}
            <Button
              onClick={onBack}
              variant={content.showRetry ? "outline" : "default"}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorStates;
