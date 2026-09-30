"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, ArrowRight, ShieldCheck, MessageCircle } from "lucide-react";

export default function RedeemPage() {
  const phoneNumber = process.env.PHONE_NUMBER || "923487417875";
  const whatsappNumber = phoneNumber.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello MTacademy, I need assistance accessing my candidate mock test account.",
      )}`
    : null;

  return (
    <div className="min-h-screen d-flex flex-column bg-main">
      <main className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="w-100" style={{ maxWidth: "540px" }}>
          <div className="card shadow-sm border-subtle p-4 p-md-5 bg-white text-center rounded-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#E0F2FE",
                color: "#0284C7",
              }}
            >
              <UserCheck size={32} />
            </div>

            <span className="badge badge-sky px-2 py-1 mb-2 align-self-center">
              Direct Candidate Access
            </span>

            <h1
              className="fw-bold fs-4 text-deep-blue mb-2"
              style={{ color: "#0F3B5D" }}
            >
              Temporary Credentials System
            </h1>

            <p className="text-secondary small mb-4" style={{ lineHeight: 1.7 }}>
              Invitation links and token redemption have been upgraded to direct
              <strong> Temporary Candidate Credentials</strong>. Your account
              and authorized mock test modules are provisioned directly by the MTacademy administrator.
            </p>

            <div className="p-3 bg-light rounded text-start small mb-4 border border-subtle">
              <div className="fw-semibold text-dark mb-1 d-flex align-items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                How to Access Your Examination:
              </div>
              <ol className="ps-3 mb-0 text-secondary" style={{ lineHeight: 1.8 }}>
                <li>Use the <strong>Username or Email</strong> provided by your administrator.</li>
                <li>Enter your assigned <strong>Temporary Password</strong>.</li>
                <li>Your authorized mock tests will be immediately available in your Dashboard.</li>
              </ol>
            </div>

            <div className="d-grid gap-2">
              <Link
                href="/login"
                className="btn btn-primary py-2 d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
              >
                <span>Proceed to Candidate Login</span>
                <ArrowRight size={17} />
              </Link>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary py-2 d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <MessageCircle size={17} className="text-success" />
                  <span>Contact MTacademy Support</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
