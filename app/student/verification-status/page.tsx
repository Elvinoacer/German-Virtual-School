"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerificationStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log("[CLIENT DEBUG] VerificationStatusPage render - status:", status);
  console.log("[CLIENT DEBUG] session?.user:", session?.user);

  useEffect(() => {
    console.log("[CLIENT DEBUG] useEffect triggered - status:", status, ", isVerified:", session?.user?.isVerified);
    if (status === "authenticated" && session?.user?.isVerified) {
      console.log("[CLIENT DEBUG] User is verified, redirecting to dashboard");
      router.push("/student/dashboard");
    }
    if (status === "unauthenticated") {
      console.log("[CLIENT DEBUG] User is unauthenticated, redirecting to login");
      router.push("/login");
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading session...</p>
      </div>
    );
  }

  // Simple test render without framer-motion
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      padding: "24px",
      backgroundColor: "#f8fafc"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: "32px",
        textAlign: "center"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 24px",
          backgroundColor: "#fef3c7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px"
        }}>
          ⏳
        </div>
        
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px", color: "#1e293b" }}>
          Account Verification Pending
        </h1>
        
        <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
          Thank you for registering! Your account is currently being reviewed by our administration.
          This process typically takes 24-48 hours.
        </p>
        
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px 24px",
            backgroundColor: "transparent",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#475569"
          }}
        >
          Log Out
        </button>
        
        <p style={{ marginTop: "16px", fontSize: "12px", color: "#94a3b8" }}>
          Logged in as: {session?.user?.email || "Unknown"}
        </p>
      </div>
    </div>
  );
}
