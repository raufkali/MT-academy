"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, ShieldCheck, ExternalLink } from "lucide-react";

export default function AdminNavbar({ onToggleMobile }) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = (path) => {
    if (path === "/admin") return "Overview";
    if (path.startsWith("/admin/candidates")) return "Candidates";
    if (path.startsWith("/admin/admins")) return "Admin Team";
    if (path.startsWith("/admin/questions")) return "Question Bank";
    if (path.startsWith("/admin/tests")) return "Test Configuration";
    if (path.startsWith("/admin/access")) return "Candidate Credentials & Access";
    if (path.startsWith("/admin/results")) return "Results & Attempts";
    if (path.startsWith("/admin/retries")) return "Retry Requests";
    if (path.startsWith("/admin/audit")) return "Audit Logs";
    return "Admin Panel";
  };

  const title = getPageTitle(pathname);

  return (
    <header
      className="navbar bg-white border-bottom border-subtle px-3 py-2 sticky-top"
      style={{
        zIndex: 1020,
        boxShadow: "0 1px 4px rgba(15, 59, 93, 0.05)",
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between px-0">
        <div className="d-flex align-items-center gap-2">
          {/* Mobile menu trigger */}
          <button
            className="btn btn-sm btn-light border d-lg-none p-1 text-muted"
            type="button"
            onClick={onToggleMobile}
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>

          {/* Section Breadcrumb & Admin Identifier */}
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge d-none d-sm-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: "#F0F9FF",
                color: "#0284C7",
                border: "1px solid #BAE6FD",
                fontWeight: 700,
                fontSize: "0.72rem",
                padding: "5px 8px",
                letterSpacing: "0.5px",
              }}
            >
              <ShieldCheck size={13} />
              ADMIN CONTROL
            </span>
            <span className="text-muted d-none d-sm-inline" style={{ opacity: 0.5 }}>
              /
            </span>
            <span
              className="fw-bold fs-6"
              style={{ color: "#0F3B5D", letterSpacing: "-0.2px" }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Right side controls: Portal switcher & Admin profile */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Switch to Candidate Portal */}
          <Link
            href="/dashboard"
            className="btn btn-sm d-inline-flex align-items-center gap-1 py-1 px-2"
            title="Switch to Candidate Portal"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              backgroundColor: "#F8FAFC",
              color: "#0F3B5D",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
            }}
          >
            <ExternalLink size={14} style={{ color: "#0284C7" }} />
            <span className="d-none d-md-inline">Candidate Portal</span>
          </Link>

          {/* Admin User Identity */}
          <div className="text-end d-none d-sm-block">
            <div className="small fw-bold lh-1" style={{ color: "#0F3B5D" }}>
              {profile?.name || "Administrator"}
            </div>
            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
              {user?.email}
            </small>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2"
            title="Sign out of Admin Panel"
            style={{
              fontSize: "0.82rem",
              borderRadius: "8px",
              fontWeight: 600,
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
