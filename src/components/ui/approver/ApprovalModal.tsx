"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";

type ApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  portfolios?: number;
  candidates?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function ApprovalModal({
  isOpen,
  onClose,
  title = "Election Details",
  portfolios,
  candidates,
  children,
  footer,
}: ApprovalModalProps) {
  // Keep implementation simple: return nothing when closed to avoid mounting dialog primitives.
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    // play exit animation then call onClose
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Save previously focused element to restore on close
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the modal
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    // Prevent body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Key handler for Escape and basic focus trap
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      // Restore focus
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={handleClose}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={panelRef}
          className={`bg-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto ${
            isClosing ? "animate-scaleOut" : "animate-scaleIn"
          }`}
        >
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <DialogTitle>{title}</DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 rounded-md p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">{children}</div>

          {footer ? (
            <div className="p-6 border-t border-gray-100 flex justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.2s ease-in;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-scaleOut {
          animation: scaleOut 0.2s ease-in;
        }
      `}</style>
    </div>
  );
}
