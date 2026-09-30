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
  Sparkles,
  BarChart2,
  TrendingUp,
  Activity,
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
  Cell,
} from "recharts";

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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <p className="text-secondary small">
          Gathering platform analytics from Firestore...
        </p>
      </div>
    );
  }

  const COLORS = ["#38BDF8", "#0284C7", "#0F3B5D", "#16A34A"];

  return (
    <div>
      {/* Top Welcome & Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="fs-4 fw-bold text-deep-blue mb-1"
            style={{ color: "#0F3B5D" }}
          >
            Admin Dashboard Overview
          </h1>
          <p className="text-secondary small mb-0">
            Real-time examination telemetry, candidate volume, and manual access
            statistics.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            href="/admin/access"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
          >
            <span>+ Give Candidate Credentials</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Candidates"
            value={stats?.totalCandidates || 0}
            subtitle="Registered accounts"
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Tests"
            value={stats?.activeTests || 0}
            subtitle="Available modules"
            icon={ClipboardList}
            color="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Completed Attempts"
            value={stats?.totalCompletedAttempts || 0}
            subtitle="Graded examinations"
            icon={CheckCircle2}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Retries"
            value={stats?.pendingRetriesCount || 0}
            subtitle="Candidate requests"
            icon={RotateCcw}
            color={stats?.pendingRetriesCount > 0 ? "warning" : "primary"}
          />
        </div>
      </div>

      {/* Analytics Charts (col-12 col-lg-6 as requested) */}
      <div className="row g-4 mb-4">
        {/* Module Average Scores Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-subtle shadow-sm bg-white p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
              <div>
                <h6
                  className="fw-bold text-deep-blue mb-0"
                  style={{ color: "#0F3B5D" }}
                >
                  Average Score by Module (%)
                </h6>
                <small className="text-muted">
                  Academic, Verbal & Non-Verbal proficiency
                </small>
              </div>
              <BarChart2 size={18} className="text-primary" />
            </div>

            <div style={{ height: "260px", width: "100%" }}>
              {stats?.moduleAverages?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.moduleAverages}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="module"
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "6px",
                      }}
                      formatter={(val) => [`${val}%`, "Average Score"]}
                    />
                    <Bar dataKey="avg" fill="#0284C7" radius={[4, 4, 0, 0]}>
                      {stats.moduleAverages.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#0284C7"
                              : index === 1
                                ? "#38BDF8"
                                : "#0F3B5D"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                  No completed examinations to compute module averages.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Performance Distribution Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-subtle shadow-sm bg-white p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
              <div>
                <h6
                  className="fw-bold text-deep-blue mb-0"
                  style={{ color: "#0F3B5D" }}
                >
                  Candidate Performance Distribution
                </h6>
                <small className="text-muted">
                  Count of completed attempts by score bracket
                </small>
              </div>
              <TrendingUp size={18} className="text-primary" />
            </div>

            <div style={{ height: "260px", width: "100%" }}>
              {stats?.performanceDistribution?.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.performanceDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "6px",
                      }}
                      formatter={(val) => [val, "Attempts"]}
                    />
                    <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                  No examination attempts recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Examinations Feed */}
      <div className="card border-subtle shadow-sm bg-white p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
          <div>
            <h6
              className="fw-bold text-deep-blue mb-0"
              style={{ color: "#0F3B5D" }}
            >
              Recent Examination Submissions
            </h6>
            <small className="text-muted">
              Real-time candidate attempts stream
            </small>
          </div>
          <Link
            href="/admin/results"
            className="small text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
          >
            <span>View All Results</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="py-4 text-center text-muted small">
            No completed attempts recorded in the database yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-pma mb-0">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Test Module</th>
                  <th>Submission Date</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((att) => (
                  <tr key={att.id}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {att.candidateName}
                      </div>
                      <small className="text-muted">{att.candidateEmail}</small>
                    </td>
                    <td>{att.testTitle}</td>
                    <td className="text-muted small">
                      {att.submissionTime
                        ? new Date(att.submissionTime).toLocaleString()
                        : "In Progress"}
                    </td>
                    <td>
                      {att.score
                        ? `${att.score.correct} / ${att.score.total}`
                        : "—"}
                    </td>
                    <td>
                      {att.score ? (
                        <strong>{att.score.percentage}%</strong>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {att.status === "active" ? (
                        <span className="badge badge-warning">Active</span>
                      ) : att.score?.passed ? (
                        <span className="badge badge-active">PASSED</span>
                      ) : (
                        <span className="badge badge-revoked">FAILED</span>
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
