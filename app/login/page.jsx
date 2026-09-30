"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { registerCandidate } from "../../lib/auth";
import { Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

/* ============================================================
   THEME — navy + white only
   ============================================================ */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

const inputWrapperStyle = {
  display: "flex",
  alignItems: "center",
  minHeight: "46px",
  padding: "0 12px",
  background: colors.white,
  border: `1px solid ${colors.divider}`,
  borderRadius: 0,
  color: colors.navy,
  transition: "border-color 0.15s ease, background-color 0.15s ease",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, role, login } = useAuth();
  const { showToast } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user && role) {
      if (role === "admin" || role === "super_admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, role, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }

        await registerCandidate(name.trim(), usernameOrEmail.trim(), password);
        showToast("Registration successful.", "success");

        setIsRegisterMode(false);
        setName("");
        setUsernameOrEmail("");
        setPassword("");
      } else {
        const res = await login(usernameOrEmail.trim(), password);
        showToast("Login successful.", "success");

        if (
          res.profile?.role === "admin" ||
          res.profile?.role === "super_admin"
        ) {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);

      let message = err?.message || "Authentication failed.";

      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/user-not-found"
      ) {
        message = "Invalid username, email, or password.";
      } else if (err?.code === "auth/email-already-in-use") {
        message = "An account with this email already exists.";
      }

      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegisterMode((prev) => !prev);
    setErrorMessage("");
    setPassword("");
    setName("");
    setUsernameOrEmail("");
  };

  return (
    <main
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: colors.surface,
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: colors.white,
          borderLeft: `3px solid ${colors.navy}`,
          boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
          padding: "32px 28px",
        }}
      >
        {/* ============================================================
            BRAND
            ============================================================ */}
        <div className="text-center mb-4">
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: "56px",
              height: "56px",
              position: "relative",
              marginBottom: "14px",
              overflow: "hidden",
            }}
          >
            <Image
              src="/logo.png"
              alt="MTacademy logo"
              width={56}
              height={56}
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
              }}
              priority
            />
          </span>

          <h1
            className="amarante-regular mb-1"
            style={{
              color: colors.navy,
              fontSize: "1.5rem",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            MTacademy
          </h1>

          <p
            className="mb-0"
            style={{
              color: colors.muted,
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {isRegisterMode ? "Candidate Registration" : "Candidate Login"}
          </p>
        </div>

        {/* ============================================================
            ERROR
            ============================================================ */}
        {errorMessage && (
          <div
            role="alert"
            className="d-flex align-items-start gap-2 mb-3 p-3"
            style={{
              background: colors.surface,
              borderLeft: `3px solid ${colors.navy}`,
              color: colors.navy,
              fontSize: "0.8rem",
              lineHeight: 1.45,
            }}
          >
            <AlertCircle
              size={16}
              style={{ flexShrink: 0, marginTop: "1px" }}
            />
            <span style={{ wordBreak: "break-word" }}>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================
            FORM
            ============================================================ */}
        <form onSubmit={handleSubmit}>
          {/* Full Name (register only) */}
          {isRegisterMode && (
            <div className="mb-3">
              <label
                htmlFor="name"
                className="d-block mb-1"
                style={{
                  color: colors.navy,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                Full Name
              </label>
              <div style={inputWrapperStyle}>
                <User size={17} style={{ flexShrink: 0 }} />
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  style={{
                    width: "100%",
                    minWidth: 0,
                    padding: "0 10px",
                    border: 0,
                    outline: 0,
                    background: "transparent",
                    color: colors.navy,
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>
          )}

          {/* Username / Email */}
          <div className="mb-3">
            <label
              htmlFor="username"
              className="d-block mb-1"
              style={{
                color: colors.navy,
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {isRegisterMode ? "Email" : "Username or Email"}
            </label>
            <div style={inputWrapperStyle}>
              <User size={17} style={{ flexShrink: 0 }} />
              <input
                id="username"
                type={isRegisterMode ? "email" : "text"}
                placeholder={
                  isRegisterMode ? "student@example.com" : "Username or Email"
                }
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                required
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "0 10px",
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: colors.navy,
                  fontSize: "0.875rem",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="d-block mb-1"
              style={{
                color: colors.navy,
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              Password
            </label>
            <div style={inputWrapperStyle}>
              <Lock size={17} style={{ flexShrink: 0 }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                required
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "0 10px",
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: colors.navy,
                  fontSize: "0.875rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  border: 0,
                  background: "transparent",
                  color: colors.navy,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              minHeight: "46px",
              background: colors.navy,
              color: colors.white,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "6px",
            }}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                style={{ color: colors.white }}
              />
            ) : (
              <>
                <span>{isRegisterMode ? "Create Account" : "Sign In"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* ============================================================
            MODE SWITCH
            ============================================================ */}
        <div
          className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-4 pt-3"
          style={{
            borderTop: `1px solid ${colors.divider}`,
            color: colors.muted,
            fontSize: "0.78rem",
          }}
        >
          <span>
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>
          <button
            type="button"
            onClick={switchMode}
            style={{
              padding: 0,
              border: 0,
              background: "transparent",
              color: colors.navy,
              fontSize: "inherit",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {isRegisterMode ? "Sign In" : "Register"}
          </button>
        </div>

        {/* ============================================================
            BACK TO HOME
            ============================================================ */}
        <Link
          href="/"
          className="d-block text-center text-decoration-none mt-3"
          style={{
            color: colors.muted,
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
