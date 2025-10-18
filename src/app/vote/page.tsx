"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import UPSA_crest from "../../../public/UPSA_crest.png";
import VoterVerificationForm from "@/components/ui/voter/VoterVerificationForm";

// Loading component
const VotingLoadingScreen = ({
  status,
  error,
}: {
  status: string;
  error?: string;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#ffffff",
      fontFamily: "var(--font-poppins), system-ui, sans-serif",
    }}
  >
    {/* University Logo */}
    <div
      style={{
        width: 120,
        height: 120,
        backgroundColor: "#f8f9fa",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        border: "3px solid #e9ecef",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Image
        src={UPSA_crest}
        alt="UPSA University Crest"
        width={80}
        height={80}
        style={{ objectFit: "contain" }}
      />
    </div>

    {/* Loading Spinner */}
    {!error && (
      <div
        style={{
          width: 60,
          height: 60,
          marginBottom: 32,
          border: "4px solid #e9ecef",
          borderTop: "4px solid #28a745",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    )}

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes progressBar {
        0% { transform: scaleX(0); }
        100% { transform: scaleX(1); }
      }
    `}</style>

    {/* Title */}
    <h1
      style={{
        fontSize: 28,
        fontWeight: "600",
        color: error ? "#dc3545" : "#212529",
        textAlign: "center",
        marginBottom: 12,
        animation: "fadeInUp 0.8s ease-out",
      }}
    >
      {error ? "Voting Access Error" : "VoteUPSA"}
    </h1>

    {/* Subtitle */}
    <p
      style={{
        fontSize: 16,
        color: "#6c757d",
        textAlign: "center",
        marginBottom: 32,
        animation: "fadeInUp 0.8s ease-out 0.2s both",
      }}
    >
      {error
        ? "Unable to access voting system"
        : "Secure • Anonymous • Verified"}
    </p>

    {/* Progress Bar (only if no error) */}
    {!error && (
      <div
        style={{
          width: 200,
          height: 4,
          backgroundColor: "#e9ecef",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#28a745",
            borderRadius: 2,
            animation: "progressBar 3s ease-in-out",
            transformOrigin: "left",
          }}
        />
      </div>
    )}

    {/* Status Text */}
    <p
      style={{
        fontSize: 14,
        color: error ? "#dc3545" : "#6c757d",
        animation: error ? "none" : "pulse 2s ease-in-out infinite",
        textAlign: "center",
        maxWidth: "400px",
        lineHeight: "1.5",
      }}
    >
      {error || status}
    </p>

    {/* Error Actions */}
    {error && (
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "12px",
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => window.close()}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Close
        </button>
      </div>
    )}
  </div>
);

// Main vote page component
const VotePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState(
    "Initializing secure connection..."
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    const initializeVoting = async () => {
      try {
        // Check if user was redirected due to expired token
        const isExpired = searchParams.get("expired");
        if (isExpired === "true") {
          setError(
            "Your voting session has expired. Please verify again to continue voting."
          );
          return;
        }

        // Get voter token from URL
        const voterToken = searchParams.get("token");

        if (!voterToken) {
          setError("Invalid voting link. No authentication token found.");
          return;
        }

        setLoadingStatus("Validating your voting credentials...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // UX delay

        setLoadingStatus("Checking election status...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        setLoadingStatus("Generating verification code...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        setLoadingStatus("Sending verification email...");

        // Call the initiate verification API
        const response = await fetch("/api/voter/verify/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ voter_token: voterToken }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to initiate verification");
        }

        setLoadingStatus("Verification code sent! Redirecting...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store verification data and show form
        setVerificationData({
          voterToken,
          ...result.data,
        });
        setShowVerificationForm(true);
      } catch (error) {
        console.error("Voting initialization failed:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    };

    initializeVoting();
  }, [searchParams]);

  // Show verification form
  if (showVerificationForm && verificationData) {
    return (
      <VoterVerificationForm
        verificationData={verificationData}
        onSuccess={(accessData) => {
          // Redirect to ballot page
          router.push(`/vote/ballot?access_token=${accessData.access_token}`);
        }}
        onError={(error) => {
          setError(error);
          setShowVerificationForm(false);
        }}
      />
    );
  }

  // Show loading or error screen
  return <VotingLoadingScreen status={loadingStatus} error={error} />;
};

// Main component with Suspense
const VotePage = () => {
  return (
    <Suspense
      fallback={<VotingLoadingScreen status="Loading voting system..." />}
    >
      <VotePageContent />
    </Suspense>
  );
};

export default VotePage;
