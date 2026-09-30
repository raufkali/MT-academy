"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "admin" && role !== "super_admin") {
        router.push("/dashboard");
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center bg-main">
        <div className="text-center p-4">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div className="small text-muted">
            Verifying administrator authorization...
          </div>
        </div>
      </div>
    );
  }

  if (!user || (role !== "admin" && role !== "super_admin")) {
    return null;
  }

  return (
    <div className="d-flex min-h-screen bg-main" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className="d-flex flex-column flex-grow-1 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <AdminNavbar
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="p-3 p-md-4 flex-grow-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
