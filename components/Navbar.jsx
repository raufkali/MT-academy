"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Info,
  MessageCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, logout, loading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // SEPARATION: Do not render the user navbar on admin panels or in active timed exam sessions
  if (
    pathname?.startsWith("/admin") ||
    (pathname?.includes("/exam/") && pathname?.includes("/session"))
  ) {
    return null;
  }

  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    profile?.role === "admin" ||
    profile?.role === "super_admin";

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      setMobileOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const links = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "About Us",
      href: "/about",
      icon: Info,
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: MessageCircle,
    },
    ...(user
      ? [
          {
            name: "Candidate Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-white sticky-top border-bottom"
        style={{
          zIndex: 1050,
          boxShadow: "0 2px 14px rgba(15, 59, 93, 0.08)",
        }}
      >
        <div className="container py-1">
          {/* Brand */}
          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-2"
            onClick={closeMenus}
            style={{
              color: "#0F3B5D",
              fontWeight: 800,
              fontSize: "1.25rem",
              letterSpacing: "-0.4px",
            }}
          >
            <span
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #0284C7 0%, #0F3B5D 100%)",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "1.15rem",
              }}
            >
              M
            </span>

            <span>
              MT<span style={{ color: "#0284C7" }}>academy</span>
            </span>
          </Link>

          {/* Mobile button */}
          <button
            type="button"
            className="navbar-toggler border-0 shadow-none"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            style={{
              color: "#0F3B5D",
              padding: "8px",
            }}
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

          {/* Navigation links */}
          <div
            className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`}
          >
            <ul className="navbar-nav mx-auto align-items-lg-center gap-lg-1 py-3 py-lg-0">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <li className="nav-item" key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenus}
                      className="nav-link d-flex align-items-center gap-2"
                      style={{
                        color: active ? "#0284C7" : "#475569",
                        backgroundColor: active ? "#F0F9FF" : "transparent",
                        fontWeight: active ? 700 : 500,
                        borderRadius: "10px",
                        padding: "9px 13px",
                        transition: "0.2s ease",
                      }}
                    >
                      <Icon size={17} strokeWidth={2} />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Authentication & User Panel Controls */}
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 pb-3 pb-lg-0">
              {loading ? (
                <div className="d-flex align-items-center px-3">
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{ color: "#0284C7" }}
                  />
                </div>
              ) : user ? (
                <div className="d-flex align-items-center gap-2">
                  {/* Distinct Admin Switcher if user has Admin privileges */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="btn btn-sm d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: "#0F3B5D",
                        color: "#FFFFFF",
                        borderRadius: "9px",
                        fontWeight: 600,
                        padding: "7px 12px",
                        boxShadow: "0 2px 6px rgba(15, 59, 93, 0.2)",
                      }}
                      title="Switch to Admin Panel"
                    >
                      <ShieldCheck size={16} style={{ color: "#38BDF8" }} />
                      <span className="d-none d-sm-inline">Admin Panel</span>
                    </Link>
                  )}

                  <div className="position-relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((prev) => !prev)}
                      className="btn d-flex align-items-center gap-2"
                      style={{
                        border: "1px solid #BAE6FD",
                        backgroundColor: "#F0F9FF",
                        color: "#0F3B5D",
                        borderRadius: "11px",
                        padding: "7px 11px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "34px",
                          height: "34px",
                          backgroundColor: "#38BDF8",
                          color: "#FFFFFF",
                          fontWeight: 800,
                        }}
                      >
                        {(
                          profile?.name?.charAt(0) ||
                          user.displayName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"
                        ).toUpperCase()}
                      </span>

                      <span
                        className="d-none d-xl-inline text-truncate"
                        style={{ maxWidth: "120px" }}
                      >
                        {profile?.name?.split(" ")[0] ||
                          user.displayName?.split(" ")[0] ||
                          user.email?.split("@")[0] ||
                          "Account"}
                      </span>

                      <ChevronDown
                        size={16}
                        style={{
                          transform: profileOpen ? "rotate(180deg)" : "rotate(0)",
                          transition: "0.2s",
                        }}
                      />
                    </button>

                    {profileOpen && (
                      <div
                        className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow"
                        style={{
                          width: "250px",
                          zIndex: 1100,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="p-3 border-bottom"
                          style={{ backgroundColor: "#F8FAFC" }}
                        >
                          <div
                            className="fw-bold text-truncate"
                            style={{ color: "#0F3B5D" }}
                          >
                            {profile?.name || user.displayName || "User"}
                          </div>

                          <small className="text-secondary d-block text-truncate">
                            {user.email}
                          </small>
                          {isAdmin && (
                            <span
                              className="badge mt-1"
                              style={{
                                backgroundColor: "#E0F2FE",
                                color: "#0369A1",
                                fontSize: "0.7rem",
                              }}
                            >
                              Administrator
                            </span>
                          )}
                        </div>

                        <div className="p-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={closeMenus}
                              className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2 fw-semibold mb-1"
                              style={{ color: "#0F3B5D", backgroundColor: "#F0F9FF" }}
                            >
                              <ShieldCheck size={17} style={{ color: "#0284C7" }} />
                              Admin Control Panel
                            </Link>
                          )}

                          <Link
                            href="/dashboard"
                            onClick={closeMenus}
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2 fw-semibold"
                            style={{ color: "#0284C7" }}
                          >
                            <LayoutDashboard size={17} />
                            Candidate Dashboard
                          </Link>

                          <hr className="my-2" />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                            style={{
                              color: "#DC2626",
                              border: "none",
                              background: "transparent",
                              width: "100%",
                              textAlign: "left",
                            }}
                          >
                            <LogOut size={17} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="btn d-flex align-items-center justify-content-center gap-2"
                  style={{
                    color: "#FFFFFF",
                    backgroundColor: "#0284C7",
                    border: "1px solid #0284C7",
                    borderRadius: "10px",
                    padding: "9px 18px",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(2,132,199,0.16)",
                  }}
                >
                  <LogIn size={17} />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside profile dropdown */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1040,
          }}
        />
      )}
    </>
  );
}
