"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, ShieldCheck, ExternalLink } from "lucide-react";

/* THEME — navy + white only */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

export default function AdminNavbar({ onToggleMobile }) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = (path) => {
    if (path === "/admin") return "Overview";
    if (path.startsWith("/admin/candidates")) return "Candidates";
    if (path.startsWith("/admin/admins")) return "Admin Team";
    if (path.startsWith("/admin/questions")) return "Question Bank";
    if (path.startsWith("/admin/tests")) return "Test Configuration";
    if (path.startsWith("/admin/access"))
      return "Candidate Credentials & Access";
    if (path.startsWith("/admin/results")) return "Results & Attempts";
    if (path.startsWith("/admin/retries")) return "Retry Requests";
    if (path.startsWith("/admin/audit")) return "Audit Logs";
    return "Admin Panel";
  };

  const title = getPageTitle(pathname);

  return (
    <header
      className="navbar sticky-top px-3 py-2"
      style={{
        zIndex: 1020,
        background: colors.white,
        borderBottom: `1px solid ${colors.divider}`,
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between px-0">
        {/* LEFT — mobile toggle + admin badge + page title */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <button
            className="btn btn-sm d-lg-none p-1 d-flex align-items-center justify-content-center"
            type="button"
            onClick={onToggleMobile}
            aria-label="Open sidebar navigation"
            style={{
              color: colors.navy,
              background: colors.surface,
              border: 0,
              borderRadius: 0,
            }}
          >
            <Menu size={20} />
          </button>

          <div className="d-flex align-items-center gap-2">
            {/* Admin badge — solid navy, uppercase, letter-spaced */}
            <span
              className="d-none d-sm-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: colors.navy,
                color: colors.white,
                fontWeight: 700,
                fontSize: "0.68rem",
                padding: "5px 9px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                borderRadius: 0,
              }}
            >
              <ShieldCheck size={12} strokeWidth={2.2} />
              Admin Control
            </span>

            <span
              className="d-none d-sm-inline"
              style={{ color: colors.divider, opacity: 0.9 }}
            >
              /
            </span>

            {/* Page title — Amarante serif */}
            <span
              className="amarante-regular"
              style={{
                color: colors.navy,
                fontSize: "1.15rem",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* RIGHT — portal switcher + identity + sign out */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Switch to Candidate Portal */}
          {/* <Link
            href="/dashboard"
            className="btn btn-sm d-inline-flex align-items-center gap-1 py-1 px-2 text-decoration-none"
            title="Switch to Candidate Portal"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              backgroundColor: colors.white,
              color: colors.navy,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
            }}
          >
            <ExternalLink size={14} />
            <span className="d-none d-md-inline">Candidate Portal</span>
          </Link> */}

          {/* Admin identity (name + email) — desktop only */}
          <div className="text-end d-none d-lg-block">
            <div
              className="fw-bold lh-1"
              style={{ color: colors.navy, fontSize: "0.85rem" }}
            >
              {profile?.name || "Administrator"}
            </div>
            <small
              style={{
                color: colors.muted,
                fontSize: "0.72rem",
              }}
            >
              {user?.email}
            </small>
          </div>

          {/* Sign out — navy outline, minimal */}
          <button
            onClick={logout}
            className="btn btn-sm d-inline-flex align-items-center gap-1 py-1 px-2"
            title="Sign out of Admin Panel"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              backgroundColor: colors.white,
              color: colors.navy,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
            }}
          >
            <LogOut size={14} />
            <span className="d-none d-sm-inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
