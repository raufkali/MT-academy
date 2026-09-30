"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { registerCandidate } from "../../lib/auth";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

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

  // Redirect authenticated users
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
    setIsRegisterMode((previous) => !previous);
    setErrorMessage("");
    setPassword("");
    setName("");
    setUsernameOrEmail("");
  };

  return (
    <main className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <ShieldCheck size={25} />
          </div>

          <h1>MTacademy Login</h1>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="login-error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Register Name */}
          {isRegisterMode && (
            <div className="login-field">
              <label htmlFor="name">Full Name</label>

              <div className="login-input-wrapper">
                <User size={17} />

                <input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          {/* Username / Email */}
          <div className="login-field">
            <label htmlFor="username">
              {isRegisterMode ? "Email" : "Username or Email"}
            </label>

            <div className="login-input-wrapper">
              <User size={17} />

              <input
                id="username"
                type={isRegisterMode ? "email" : "text"}
                placeholder={isRegisterMode ? "Email" : "Username or Email"}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="login-input-wrapper">
              <Lock size={17} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>
                <span>{isRegisterMode ? "Register" : "Sign In"}</span>

                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Register / Login */}
        <div className="login-switch">
          <span>
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button type="button" onClick={switchMode}>
            {isRegisterMode ? "Sign In" : "Register"}
          </button>
        </div>

        {/* Home */}
        <Link href="/" className="login-home">
          Back to Home
        </Link>
      </div>

      <style jsx>{`
        /* =================================================
           PAGE
        ================================================= */

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          background: radial-gradient(
            circle at top,
            #e0f2fe 0%,
            #f5f9fc 35%,
            #f5f9fc 100%
          );
        }

        /* =================================================
           CARD
        ================================================= */

        .login-card {
          width: 100%;
          max-width: 390px;

          padding: 32px;

          background: #ffffff;

          border: 1px solid #dceaf3;
          border-radius: 14px;

          box-shadow: 0 10px 35px rgba(15, 59, 93, 0.07);
        }

        /* =================================================
           BRAND
        ================================================= */

        .login-brand {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-logo {
          width: 48px;
          height: 48px;

          margin: 0 auto 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #0f3b5d;
          color: #38bdf8;

          box-shadow: 0 5px 15px rgba(15, 59, 93, 0.12);
        }

        .login-brand h1 {
          margin: 0;

          color: #0f3b5d;

          font-size: 1.35rem;
          line-height: 1.2;

          font-weight: 700;
          letter-spacing: -0.025em;
        }

        /* =================================================
           ERROR
        ================================================= */

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 18px;
          padding: 10px 12px;

          color: #b42318;
          background: #fff5f5;

          border: 1px solid #fecaca;
          border-radius: 8px;

          font-size: 0.78rem;
          line-height: 1.4;
        }

        /* =================================================
           FIELDS
        ================================================= */

        .login-field {
          margin-bottom: 18px;
        }

        .login-field label {
          display: block;

          margin-bottom: 7px;

          color: #334155;

          font-size: 0.78rem;
          font-weight: 600;
        }

        .login-input-wrapper {
          display: flex;
          align-items: center;

          min-height: 44px;

          padding: 0 12px;

          background: #ffffff;

          border: 1px solid #dceaf3;
          border-radius: 8px;

          color: #94a3b8;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background-color 0.18s ease;
        }

        .login-input-wrapper:focus-within {
          background: #ffffff;
          border-color: #38bdf8;

          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .login-input-wrapper input {
          width: 100%;

          min-width: 0;

          padding: 0 10px;

          border: 0;
          outline: 0;

          background: transparent;

          color: #0f3b5d;

          font-size: 0.84rem;
        }

        .login-input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .password-toggle {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 3px;

          border: 0;
          background: transparent;

          color: #94a3b8;

          cursor: pointer;
        }

        .password-toggle:hover {
          color: #0284c7;
        }

        /* =================================================
           SUBMIT
        ================================================= */

        .login-submit {
          width: 100%;
          min-height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          margin-top: 4px;

          border: 1px solid #0284c7;
          border-radius: 8px;

          background: #0284c7;
          color: #ffffff;

          font-size: 0.84rem;
          font-weight: 600;

          cursor: pointer;

          transition:
            background-color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .login-submit:hover:not(:disabled) {
          background: #0369a1;
          border-color: #0369a1;
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(1px);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* =================================================
           MODE SWITCH
        ================================================= */

        .login-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 5px;

          margin-top: 20px;
          padding-top: 18px;

          border-top: 1px solid #e6f0f6;

          color: #64748b;

          font-size: 0.76rem;
        }

        .login-switch button {
          padding: 0;

          border: 0;
          background: transparent;

          color: #0284c7;

          font-size: inherit;
          font-weight: 600;

          cursor: pointer;
        }

        .login-switch button:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        /* =================================================
           HOME
        ================================================= */

        .login-home {
          display: block;

          margin-top: 20px;
          width: 100%;

          text-align: center;

          color: #94a3b8;

          font-size: 0.72rem;
          text-decoration: none;

          transition: color 0.18s ease;
        }

        .login-home:hover {
          color: #0284c7;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 575.98px) {
          .login-page {
            padding: 16px;
          }

          .login-card {
            max-width: 100%;
            padding: 25px 20px;
            border-radius: 12px;
          }

          .login-brand {
            margin-bottom: 24px;
          }

          .login-logo {
            width: 44px;
            height: 44px;
          }

          .login-brand h1 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </main>
  );
}
