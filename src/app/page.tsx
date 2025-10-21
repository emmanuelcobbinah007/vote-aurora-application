"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const HomePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      // Still checking session, show loading
      return;
    }

    if (status === "unauthenticated" || !session) {
      // No active session, redirect to login
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (status === "authenticated" && session?.user) {
      // User is authenticated, redirect based on role
      const timer = setTimeout(() => {
        const userRole = (session.user as any).role;

        switch (userRole) {
          case "SUPERADMIN":
            router.push(`/superadmin/${session.user.id}/dashboard`);
            break;
          case "ORCHESTRATOR":
            router.push(`/orchestrator/${session.user.id}/dashboard`);
            break;
          case "APPROVER":
            router.push(`/approver/${session.user.id}/dashboard`);
            break;
          default:
            // Unknown role, redirect to login
            router.push("/login");
            break;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  return (
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
      {/* University Logo/Crest Placeholder */}
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
        {/* Vote Aurora Crest */}
        <Image
          src="/voteAurora_crest.png"
          alt="Vote Aurora Crest"
          width={80}
          height={80}
          priority
          style={{
            objectFit: "contain",
          }}
        />
      </div>

      {/* Animated Loading Spinner */}
      <div
        style={{
          width: 60,
          height: 60,
          marginBottom: 32,
          border: "4px solid #e9ecef",
          borderTop: "4px solid #2ecc71",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

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
      `}</style>

      {/* Title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: "600",
          color: "#212529",
          textAlign: "center",
          marginBottom: 12,
          animation: "fadeInUp 0.8s ease-out",
        }}
      >
        VoteAurora Portal
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
        Secure • Transparent • Democratic
      </p>

      {/* Loading Progress */}
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
            backgroundColor: "#2ecc71",
            borderRadius: 2,
            animation: "progressBar 2s ease-in-out",
            transformOrigin: "left",
          }}
        />
      </div>

      {/* Status Text */}
      <p
        style={{
          fontSize: 14,
          color: "#6c757d",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        {status === "loading"
          ? "Checking authentication..."
          : status === "unauthenticated"
          ? "Redirecting to login..."
          : status === "authenticated"
          ? "Redirecting to dashboard..."
          : "Initializing secure connection..."}
      </p>

      <style>{`
        @keyframes progressBar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
