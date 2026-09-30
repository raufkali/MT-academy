"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  ClipboardList,
  Key,
  Award,
  RotateCcw,
  History,
  ShieldCheck,
  ExternalLink,
  UserCog,
} from "lucide-react";

/* THEME — navy + white only, surface shifts for hierarchy */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Candidates", href: "/admin/candidates", icon: Users },
    { label: "Admin Team", href: "/admin/admins", icon: UserCog },
    { label: "Question Bank", href: "/admin/questions", icon: FileQuestion },
    { label: "Test Config", href: "/admin/tests", icon: ClipboardList },
    { label: "Give Credentials", href: "/admin/access", icon: Key },
    { label: "Results & Attempts", href: "/admin/results", icon: Award },
    { label: "Retry Requests", href: "/admin/retries", icon: RotateCcw },
  ];

  const content = (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ background: colors.white }}
    >
      {/* Brand — logo + Amarante wordmark */}
      <div
        className="d-flex align-items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: `1px solid ${colors.divider}` }}
      >
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "40px",
            height: "40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src="/logo.png"
            alt="MTacademy logo"
            width={40}
            height={40}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
            }}
            priority
          />
        </span>

        <div className="d-flex flex-column">
          <span
            className="amarante-regular"
            style={{
              color: colors.navy,
              fontSize: "1.15rem",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
            }}
          >
            MTacademy
          </span>
          <small
            style={{
              color: colors.muted,
              fontSize: "0.7rem",
              letterSpacing: "0.5px",
            }}
          >
            CONTROL CENTER
          </small>
        </div>
      </div>
      {/* Nav List */}
      <div className="nav flex-column flex-grow-1">
        <small
          className="text-uppercase fw-semibold px-2 mb-2"
          style={{
            fontSize: "0.68rem",
            color: colors.muted,
            letterSpacing: "1.5px",
          }}
        >
          Platform Management
        </small>

        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className="d-flex align-items-center gap-3 text-decoration-none"
              style={{
                padding: "0.65rem 0.85rem",
                color: colors.navy,
                fontSize: "0.9rem",
                fontWeight: active ? 600 : 500,
                background: active ? colors.surface : "transparent",
                borderLeft: active
                  ? `3px solid ${colors.navy}`
                  : "3px solid transparent",
                transition: "background-color 0.15s ease",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = colors.surface;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Bottom — Candidate portal link
      <div
        className="pt-3 mt-auto"
        style={{ borderTop: `1px solid ${colors.divider}` }}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="d-flex align-items-center gap-3 text-decoration-none"
          style={{
            padding: "0.65rem 0.85rem",
            color: colors.navy,
            fontSize: "0.85rem",
            fontWeight: 500,
            background: colors.surface,
            borderLeft: `3px solid transparent`,
            transition: "background-color 0.15s ease",
          }}
        >
          <ExternalLink size={16} strokeWidth={1.9} />
          <span>Candidate Portal</span>
        </Link>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className="d-none d-lg-block flex-shrink-0"
        style={{
          minWidth: "260px",
          background: colors.white,
          borderRight: `1px solid ${colors.divider}`,
          minHeight: "100vh",
        }}
      >
        {content}
      </aside>

      {/* Mobile Offcanvas Drawer */}
      <div
        className={`offcanvas offcanvas-start ${mobileOpen ? "show" : ""}`}
        tabIndex="-1"
        style={{
          visibility: mobileOpen ? "visible" : "hidden",
          width: "280px",
          borderRight: `1px solid ${colors.divider}`,
        }}
        aria-labelledby="admin-offcanvas-label"
      >
        <div className="offcanvas-body p-0">{content}</div>
      </div>

      {mobileOpen && (
        <div
          className="offcanvas-backdrop fade show d-lg-none"
          onClick={onCloseMobile}
          style={{ background: "rgba(15, 47, 80, 0.5)" }}
        ></div>
      )}
    </>
  );
}
