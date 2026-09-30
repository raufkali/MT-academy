"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

/* THEME — only two colors: navy + white, surface shifts for hierarchy */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

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

  // Hide navbar on admin panels and active exam sessions
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
            name: isAdmin ? "Admin Portal" : "Client Portal",
            href: isAdmin ? "/admin" : "/dashboard",
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

  /* Portal destination depends on role */
  const portalHref = isAdmin ? "/admin" : "/dashboard";
  const portalLabel = isAdmin ? "Admin Portal" : "Client Portal";

  return (
    <>
      <nav
        className="navbar navbar-expand-lg sticky-top"
        style={{
          zIndex: 1050,
          background: colors.white,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <div className="container py-2">
          {/* Brand — logo + Amarante wordmark */}
          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-2 m-0"
            onClick={closeMenus}
            style={{ textDecoration: "none" }}
          >
            <span
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src="/logo.png"
                alt="MTacademy logo"
                width={42}
                height={42}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                }}
                priority
              />
            </span>

            <span
              className="amarante-regular"
              style={{
                color: colors.navy,
                fontSize: "1.35rem",
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              MTacademy
            </span>
          </Link>

          {/* Mobile toggler */}
          <button
            type="button"
            className="navbar-toggler border-0 shadow-none"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            style={{
              color: colors.navy,
              padding: "8px",
            }}
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

          {/* Collapsible area */}
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
                        color: colors.navy,
                        backgroundColor: active
                          ? colors.surface
                          : "transparent",
                        fontWeight: active ? 700 : 500,
                        borderRadius: 0,
                        padding: "9px 13px",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <Icon size={17} strokeWidth={2} />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right side — auth controls */}
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 pb-3 pb-lg-0">
              {loading ? (
                <div className="d-flex align-items-center px-3">
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{ color: colors.navy }}
                    role="status"
                  />
                </div>
              ) : user ? (
                <div className="d-flex align-items-center gap-2">
                  {/* Quick portal shortcut — label depends on role */}
                  <Link
                    href={portalHref}
                    onClick={closeMenus}
                    className="btn btn-sm d-inline-flex align-items-center gap-1"
                    style={{
                      backgroundColor: colors.navy,
                      color: colors.white,
                      borderRadius: 0,
                      fontWeight: 600,
                      padding: "8px 14px",
                      border: `1px solid ${colors.navy}`,
                    }}
                    title={portalLabel}
                  >
                    {isAdmin ? (
                      <ShieldCheck size={16} />
                    ) : (
                      <LayoutDashboard size={16} />
                    )}
                    <span className="d-none d-sm-inline">{portalLabel}</span>
                  </Link>

                  {/* Profile dropdown */}
                  <div className="position-relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((prev) => !prev)}
                      className="btn d-flex align-items-center gap-2"
                      style={{
                        border: 0,
                        backgroundColor: colors.surface,
                        color: colors.navy,
                        borderRadius: 0,
                        padding: "7px 11px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "34px",
                          height: "34px",
                          backgroundColor: colors.navy,
                          color: colors.white,
                          fontWeight: 800,
                          fontSize: "0.9rem",
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
                          transform: profileOpen
                            ? "rotate(180deg)"
                            : "rotate(0)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {profileOpen && (
                      <div
                        className="position-absolute end-0 mt-2"
                        style={{
                          width: "260px",
                          zIndex: 1100,
                          overflow: "hidden",
                          background: colors.white,
                          border: `1px solid ${colors.divider}`,
                        }}
                      >
                        {/* Profile header */}
                        <div
                          className="p-3"
                          style={{
                            backgroundColor: colors.surface,
                            borderBottom: `1px solid ${colors.divider}`,
                          }}
                        >
                          <div
                            className="fw-bold text-truncate"
                            style={{ color: colors.navy }}
                          >
                            {profile?.name || user.displayName || "User"}
                          </div>

                          <small
                            className="d-block text-truncate"
                            style={{ color: colors.muted }}
                          >
                            {user.email}
                          </small>

                          {isAdmin && (
                            <span
                              className="badge mt-2"
                              style={{
                                backgroundColor: colors.navy,
                                color: colors.white,
                                fontSize: "0.68rem",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                borderRadius: 0,
                                padding: "4px 8px",
                              }}
                            >
                              Administrator
                            </span>
                          )}
                        </div>

                        {/* Menu */}
                        <div className="p-2">
                          <Link
                            href={portalHref}
                            onClick={closeMenus}
                            className="dropdown-item d-flex align-items-center gap-2 py-2 fw-semibold"
                            style={{
                              color: colors.navy,
                              backgroundColor: colors.surface,
                            }}
                          >
                            {isAdmin ? (
                              <ShieldCheck size={17} />
                            ) : (
                              <LayoutDashboard size={17} />
                            )}
                            {portalLabel}
                          </Link>

                          <hr
                            className="my-2"
                            style={{ borderColor: colors.divider }}
                          />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="dropdown-item d-flex align-items-center gap-2 py-2"
                            style={{
                              color: colors.navy,
                              border: "none",
                              background: "transparent",
                              width: "100%",
                              textAlign: "left",
                              fontWeight: 500,
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
                    color: colors.white,
                    backgroundColor: colors.navy,
                    border: `1px solid ${colors.navy}`,
                    borderRadius: 0,
                    padding: "9px 20px",
                    fontWeight: 600,
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

      {/* Click-outside overlay for profile dropdown */}
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
