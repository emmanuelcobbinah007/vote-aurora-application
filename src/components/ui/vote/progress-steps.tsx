import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = completedSteps.has(stepNumber);
        const isCurrent = stepNumber === currentStep;
        const isPast = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`
                relative flex items-center justify-center 
                w-10 h-10 rounded-full border-2 
                transition-all duration-300 
                ${
                  isCurrent
                    ? "border-blue-600 bg-blue-600 text-white shadow-md"
                    : isCompleted || isPast
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 bg-gray-100 text-gray-500"
                }
              `}
            >
              {isCompleted || isPast ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="font-semibold">{stepNumber}</span>
              )}

              {/* Subtle glow for current step */}
              {isCurrent && (
                <motion.div
                  layoutId="glow"
                  className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"
                />
              )}
            </motion.div>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <div className="relative w-12 h-1 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: isCompleted || isPast ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute h-full bg-green-500"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
