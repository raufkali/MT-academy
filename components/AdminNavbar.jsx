"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, ShieldCheck, UserCheck } from "lucide-react";

export default function AdminNavbar({ onToggleMobile }) {
  const { user, profile, logout } = useAuth();

  return (
    <header className="navbar bg-white border-bottom border-subtle px-3 py-2 sticky-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
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
        </div>

        {/* Right side controls */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <div className="small fw-semibold text-dark lh-1">
              {profile?.name || "Administrator"}
            </div>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              {user?.email}
            </small>
          </div>

          <button
            onClick={logout}
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2"
            title="Sign out of Admin Panel"
          >
            <LogOut size={15} />
            <span className="d-none d-sm-inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
