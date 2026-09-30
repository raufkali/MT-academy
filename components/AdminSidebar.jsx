"use client";

import React from "react";
import Link from "next/link";
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
    { label: "Audit Logs", href: "/admin/audit", icon: History },
  ];

  const content = (
    <div className="d-flex flex-column h-100 p-3 bg-white">
      {/* Brand */}
      <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-subtle">
        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#0F3B5D",
            color: "#38BDF8",
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <div
            className="fw-bold lh-1"
            style={{ color: "#0F3B5D", fontSize: "1rem" }}
          >
            MTacademy
          </div>
          <small className="text-muted" style={{ fontSize: "0.72rem" }}>
            PMA Control Center
          </small>
        </div>
      </div>

      {/* Nav List */}
      <div className="nav flex-column flex-grow-1">
        <small
          className="text-uppercase text-muted fw-semibold px-2 mb-2"
          style={{ fontSize: "0.68rem" }}
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
              className={`sidebar-nav-link ${active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom candidate portal link */}
      <div className="pt-3 border-top border-subtle mt-auto">
        <Link
          href="/dashboard"
          className="sidebar-nav-link text-primary"
          style={{ fontSize: "0.85rem" }}
        >
          <ExternalLink size={16} />
          <span>Candidate Portal</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className="sidebar d-none d-lg-block flex-shrink-0"
        style={{ minWidth: "250px" }}
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
        }}
        aria-labelledby="admin-offcanvas-label"
      >
        <div className="offcanvas-body p-0">{content}</div>
      </div>
      {mobileOpen && (
        <div
          className="offcanvas-backdrop fade show d-lg-none"
          onClick={onCloseMobile}
        ></div>
      )}
    </>
  );
}
