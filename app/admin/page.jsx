"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "../../components/StatCard";
import {
  getAdminDashboardStats,
  getAllAttempts,
  seedInitialDataIfEmpty,
} from "../../lib/firestore";
import { useToast } from "../../context/ToastContext";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  RotateCcw,
  BarChart2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ============================================================
   THEME — navy + white ONLY. No other hues. Ever.
   ============================================================ */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
  grid: "#E1E7ED",
};

/* ============================================================
   STATUS BADGE — flat, monochrome
   ============================================================ */
function StatusBadge({ label, variant = "navy" }) {
  const bg = variant === "navy" ? colors.navy : colors.surfaceAlt;
  const fg = variant === "navy" ? colors.white : colors.navy;

  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 8px",
        borderRadius: 0,
      }}
    >
      {label}
    </span>
  );
}

export default function AdminOverviewPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sData, aData] = await Promise.all([
        getAdminDashboardStats(),
        getAllAttempts(),
      ]);
      setStats(sData);
      setRecentAttempts(aData.slice(0, 5));
    } catch (err) {
      console.error(err);
      showToast("Error loading analytics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await seedInitialDataIfEmpty();
      showToast(
        "Default PMA tests and demonstration questions populated!",
        "success",
      );
      loadDashboard();
    } catch (err) {
      console.error(err);
      showToast("Failed to populate seed data.", "error");
    } finally {
      setSeeding(false);
    }
  };

  /* ============================================================
     LOADING
     ============================================================ */
  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border mb-2"
          role="status"
          style={{ color: colors.navy, borderRadius: 0 }}
        />
        <p
          style={{
            color: colors.muted,
            fontSize: "0.875rem",
          }}
        >
          Gathering platform analytics...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="mb-1"
            style={{
              color: colors.navy,
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Admin Dashboard Overview
          </h1>
          <p
            className="mb-0"
            style={{
              color: colors.muted,
              fontSize: "0.875rem",
            }}
          >
            Real-time examination telemetry, candidate volume, and manual access
            statistics.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            href="/admin/access"
            className="btn btn-sm d-inline-flex align-items-center gap-2"
            style={{
              background: colors.navy,
              color: colors.white,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontWeight: 600,
              fontSize: "0.82rem",
              padding: "8px 16px",
              letterSpacing: "0.01em",
            }}
          >
            + Give Candidate Credentials
          </Link>
        </div>
      </div>

      {/* ============================================================
          KPI CARDS — no color prop, icons navy inside StatCard
          ============================================================ */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Candidates"
            value={stats?.totalCandidates || 0}
            subtitle="Registered accounts"
            icon={Users}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Tests"
            value={stats?.activeTests || 0}
            subtitle="Available modules"
            icon={ClipboardList}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Completed Attempts"
            value={stats?.totalCompletedAttempts || 0}
            subtitle="Graded examinations"
            icon={CheckCircle2}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Retries"
            value={stats?.pendingRetriesCount || 0}
            subtitle="Candidate requests"
            icon={RotateCcw}
          />
        </div>
      </div>

      {/* ============================================================
          ANALYTICS CHARTS
          ============================================================ */}
      <div className="row g-4 mb-4">
        {/* ---- Chart 1 — Module Averages ---- */}
        <div className="col-12 col-lg-6">
          <div
            className="h-100 p-3 p-md-4"
            style={{
              background: colors.white,
              border: 0,
              borderRadius: 0,
            }}
          >
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-3"
              style={{ borderBottom: `1px solid ${colors.divider}` }}
            >
              <div>
                <h6
                  className="mb-1"
                  style={{
                    color: colors.navy,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Average Score by Module
                </h6>
                <small
                  style={{
                    color: colors.muted,
                    fontSize: "0.78rem",
                  }}
                >
                  Academic, Verbal &amp; Non-Verbal proficiency (%)
                </small>
              </div>
              <BarChart2 size={18} color={colors.navy} strokeWidth={1.9} />
            </div>

            <div style={{ height: "260px", width: "100%" }}>
              {stats?.moduleAverages?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.moduleAverages}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke={colors.grid}
                    />
                    <XAxis
                      dataKey="module"
                      tick={{
                        fill: colors.muted,
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: colors.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fill: colors.muted,
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: colors.divider }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.navy}`,
                        borderRadius: 0,
                        fontSize: "0.8rem",
                        color: colors.navy,
                      }}
                      cursor={{ fill: colors.surface }}
                      formatter={(val) => [`${val}%`, "Average Score"]}
                    />
                    <Bar
                      dataKey="avg"
                      fill={colors.navy}
                      radius={0}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="h-100 d-flex align-items-center justify-content-center"
                  style={{
                    color: colors.muted,
                    fontSize: "0.85rem",
                  }}
                >
                  No completed examinations to compute module averages.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Chart 2 — Performance Distribution ---- */}
        <div className="col-12 col-lg-6">
          <div
            className="h-100 p-3 p-md-4"
            style={{
              background: colors.white,
              border: 0,
              borderRadius: 0,
            }}
          >
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-3"
              style={{ borderBottom: `1px solid ${colors.divider}` }}
            >
              <div>
                <h6
                  className="mb-1"
                  style={{
                    color: colors.navy,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Candidate Performance Distribution
                </h6>
                <small
                  style={{
                    color: colors.muted,
                    fontSize: "0.78rem",
                  }}
                >
                  Count of completed attempts by score bracket
                </small>
              </div>
              <TrendingUp size={18} color={colors.navy} strokeWidth={1.9} />
            </div>

            <div style={{ height: "260px", width: "100%" }}>
              {stats?.performanceDistribution?.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.performanceDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke={colors.grid}
                    />
                    <XAxis
                      dataKey="range"
                      tick={{
                        fill: colors.muted,
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: colors.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: colors.muted,
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: colors.divider }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.navy}`,
                        borderRadius: 0,
                        fontSize: "0.8rem",
                        color: colors.navy,
                      }}
                      cursor={{ fill: colors.surface }}
                      formatter={(val) => [val, "Attempts"]}
                    />
                    <Bar
                      dataKey="count"
                      fill={colors.navyLight}
                      radius={0}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="h-100 d-flex align-items-center justify-content-center"
                  style={{
                    color: colors.muted,
                    fontSize: "0.85rem",
                  }}
                >
                  No examination attempts recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          RECENT SUBMISSIONS TABLE
          ============================================================ */}
      <div
        className="p-3 p-md-4"
        style={{ background: colors.white, borderRadius: 0 }}
      >
        <div
          className="d-flex align-items-center justify-content-between mb-3 pb-3"
          style={{ borderBottom: `1px solid ${colors.divider}` }}
        >
          <div>
            <h6
              className="mb-1"
              style={{
                color: colors.navy,
                fontSize: "0.95rem",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Recent Examination Submissions
            </h6>
            <small
              style={{
                color: colors.muted,
                fontSize: "0.78rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Real-time candidate attempts stream
            </small>
          </div>
          <Link
            href="/admin/results"
            className="text-decoration-none d-inline-flex align-items-center gap-1"
            style={{
              color: colors.navy,
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
            }}
          >
            View All Results
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div
            className="py-4 text-center"
            style={{
              color: colors.muted,
              fontSize: "0.85rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            No completed attempts recorded in the database yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="table mb-0"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <thead>
                <tr>
                  {[
                    "Candidate",
                    "Test Module",
                    "Submission Date",
                    "Score",
                    "Percentage",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        background: colors.surface,
                        color: colors.navy,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "10px 12px",
                        borderBottom: `1px solid ${colors.navy}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((att) => (
                  <tr key={att.id}>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          color: colors.navy,
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        {att.candidateName}
                      </div>
                      <small
                        style={{
                          color: colors.muted,
                          fontSize: "0.75rem",
                        }}
                      >
                        {att.candidateEmail}
                      </small>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        color: colors.navy,
                        fontSize: "0.85rem",
                        verticalAlign: "middle",
                      }}
                    >
                      {att.testTitle}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        color: colors.muted,
                        fontSize: "0.8rem",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {att.submissionTime
                        ? new Date(att.submissionTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "In Progress"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        color: colors.navy,
                        fontSize: "0.85rem",
                        verticalAlign: "middle",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {att.score
                        ? `${att.score.correct} / ${att.score.total}`
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        color: colors.navy,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        verticalAlign: "middle",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {att.score ? `${att.score.percentage}%` : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.divider}`,
                        verticalAlign: "middle",
                      }}
                    >
                      {att.status === "active" ? (
                        <StatusBadge label="Active" variant="muted" />
                      ) : att.score?.passed ? (
                        <StatusBadge label="Passed" variant="navy" />
                      ) : (
                        <StatusBadge label="Failed" variant="muted" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
