"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getAllAttempts,
  getTests,
  deleteAttempt,
  deleteMultipleAttempts,
  deleteAllAttempts,
} from "../../../lib/firestore";
import {
  Search,
  Download,
  Eye,
  Clock,
  Layers,
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

/* ============================================================
   THEME — navy + white only
   ============================================================ */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

const inputStyle = {
  border: `1px solid ${colors.divider}`,
  borderRadius: 0,
  fontSize: "0.875rem",
  color: colors.navy,
  padding: "8px 12px",
  background: colors.white,
  width: "100%",
};

/* ============================================================
   PRIMITIVES
   ============================================================ */
function OutcomeBadge({ status, passed }) {
  if (status === "active") {
    return (
      <span
        style={{
          background: colors.surfaceAlt,
          color: colors.navy,
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 8px",
          display: "inline-block",
        }}
      >
        In Progress
      </span>
    );
  }
  if (passed) {
    return (
      <span
        style={{
          background: colors.navy,
          color: colors.white,
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 8px",
          display: "inline-block",
        }}
      >
        Passed
      </span>
    );
  }
  return (
    <span
      style={{
        background: colors.surfaceAlt,
        color: colors.navy,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 8px",
        display: "inline-block",
      }}
    >
      Failed
    </span>
  );
}

/* ============================================================
   MOBILE ATTEMPT CARD
   ============================================================ */
function MobileAttemptCard({ att, onInspect }) {
  const passed = att.score?.passed;

  return (
    <div
      style={{
        background: colors.white,
        borderLeft: `3px solid ${colors.navy}`,
        boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
        padding: "14px",
        marginBottom: "10px",
      }}
    >
      {/* Header — candidate + outcome */}
      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
        <div style={{ minWidth: 0, flexGrow: 1 }}>
          <div
            style={{
              color: colors.navy,
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "2px",
              wordBreak: "break-word",
            }}
          >
            {att.candidateName || "Candidate"}
          </div>
          <div
            style={{
              color: colors.muted,
              fontSize: "0.75rem",
              wordBreak: "break-word",
            }}
          >
            {att.candidateEmail}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <OutcomeBadge status={att.status} passed={passed} />
        </div>
      </div>

      {/* Test */}
      <div
        style={{
          color: colors.navy,
          fontSize: "0.82rem",
          fontWeight: 600,
          marginBottom: "10px",
          wordBreak: "break-word",
        }}
      >
        {att.testTitle}
      </div>

      {/* Stats grid */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div style={{ background: colors.surface, padding: "8px 10px" }}>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Score
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.82rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {att.score ? `${att.score.correct} / ${att.score.total}` : "—"}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div style={{ background: colors.surface, padding: "8px 10px" }}>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Percentage
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.82rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {att.score ? `${att.score.percentage}%` : "—"}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div style={{ background: colors.surface, padding: "8px 10px" }}>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Attempt
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.82rem",
              }}
            >
              #{att.attemptNumber || 1}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div style={{ background: colors.surface, padding: "8px 10px" }}>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Completed
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.72rem",
                lineHeight: 1.3,
              }}
            >
              {att.submissionTime
                ? new Date(att.submissionTime).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "In Progress"}
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onInspect}
        className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
        style={{
          background: colors.navy,
          color: colors.white,
          border: `1px solid ${colors.navy}`,
          borderRadius: 0,
          fontWeight: 600,
          fontSize: "0.8rem",
          padding: "9px 14px",
          cursor: "pointer",
        }}
      >
        <Eye size={14} />
        Inspect Attempt
      </button>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AdminResultsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aData, tData] = await Promise.all([
        getAllAttempts(),
        getTests(false),
      ]);
      setAttempts(aData);
      setTests(tData);
    } catch (err) {
      console.error(err);
      showToast("Error loading examination results.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (filteredAttempts.length === 0) {
      showToast("No records to export.", "warning");
      return;
    }

    const headers = [
      "Candidate Name",
      "Candidate Email",
      "Test Title",
      "Attempt Number",
      "Score",
      "Total Questions",
      "Percentage",
      "Result Status",
      "Submission Date",
    ];

    const rows = filteredAttempts.map((a) => [
      `"${a.candidateName || ""}"`,
      `"${a.candidateEmail || ""}"`,
      `"${a.testTitle || ""}"`,
      a.attemptNumber || 1,
      a.score?.correct || 0,
      a.score?.total || 0,
      `"${a.score?.percentage || 0}%"`,
      a.score?.passed ? "PASSED" : "FAILED",
      a.submissionTime
        ? `"${new Date(a.submissionTime).toISOString()}"`
        : "In Progress",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `PMA_Exam_Results_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Results exported to CSV successfully!", "success");
  };

  const filteredAttempts = attempts.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (a.candidateName && a.candidateName.toLowerCase().includes(q)) ||
      (a.candidateEmail && a.candidateEmail.toLowerCase().includes(q)) ||
      (a.testTitle && a.testTitle.toLowerCase().includes(q));

    const matchesTest = testFilter === "all" || a.testId === testFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "passed" && a.score?.passed) ||
      (statusFilter === "failed" && a.score && !a.score.passed) ||
      (statusFilter === "active" && a.status === "active");

    return matchesSearch && matchesTest && matchesStatus;
  });

  return (
    <div style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="mb-4">
        <h1
          className="mb-1"
          style={{
            color: colors.navy,
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Examination Results &amp; Scoring
        </h1>
        <p
          className="mb-3"
          style={{
            color: colors.muted,
            fontSize: "0.875rem",
            maxWidth: "640px",
          }}
        >
          View completed candidate attempts, inspect individual question
          responses, and export scores to CSV.
        </p>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredAttempts.length === 0}
          className="w-100 w-md-auto d-inline-flex align-items-center justify-content-center gap-2"
          style={{
            background: colors.white,
            color: colors.navy,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "10px 16px",
            cursor: filteredAttempts.length === 0 ? "not-allowed" : "pointer",
            opacity: filteredAttempts.length === 0 ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <Download size={15} />
          Export Results (CSV)
        </button>
      </div>

      {/* ============================================================
          FILTERS
          ============================================================ */}
      <div
        className="p-3 mb-3"
        style={{ background: colors.white, borderRadius: 0 }}
      >
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5 col-lg-4">
            <div className="d-flex">
              <span
                className="d-flex align-items-center justify-content-center"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.divider}`,
                  borderRight: 0,
                  color: colors.navy,
                  padding: "0 10px",
                }}
              >
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search name, email, or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, borderLeft: 0 }}
              />
            </div>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <select
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Tests</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3 col-lg-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Outcomes</option>
              <option value="passed">Qualified (Passed)</option>
              <option value="failed">Did Not Qualify</option>
              <option value="active">In Progress</option>
            </select>
          </div>

          <div className="col-12 col-lg-2 text-lg-end">
            <span
              style={{
                color: colors.muted,
                fontSize: "0.78rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <strong style={{ color: colors.navy }}>
                {filteredAttempts.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: colors.navy }}>{attempts.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          RESULTS LIST
          ============================================================ */}
      <div style={{ background: colors.white, borderRadius: 0 }}>
        {loading ? (
          <div className="p-5 text-center">
            <div
              className="spinner-border mb-2"
              role="status"
              style={{ color: colors.navy, borderRadius: 0 }}
            />
            <div style={{ color: colors.muted, fontSize: "0.85rem" }}>
              Loading results...
            </div>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="p-5 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "56px",
                height: "56px",
                background: colors.surface,
                color: colors.navy,
              }}
            >
              <Layers size={26} strokeWidth={1.8} />
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: "4px",
              }}
            >
              No results found
            </div>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              {searchQuery || testFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "No examination attempts recorded yet."}
            </div>
            {(searchQuery ||
              testFilter !== "all" ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTestFilter("all");
                  setStatusFilter("all");
                }}
                style={{
                  background: colors.navy,
                  color: colors.white,
                  border: `1px solid ${colors.navy}`,
                  borderRadius: 0,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ---- DESKTOP TABLE ---- */}
            <div className="d-none d-lg-block">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      {[
                        { label: "Candidate", width: "22%" },
                        { label: "Test Module", width: "20%" },
                        { label: "Attempt", width: "8%" },
                        { label: "Score", width: "10%" },
                        { label: "Percentage", width: "10%" },
                        { label: "Completed", width: "14%" },
                        { label: "Outcome", width: "8%" },
                        { label: "Action", width: "8%", align: "end" },
                      ].map((h) => (
                        <th
                          key={h.label}
                          style={{
                            width: h.width,
                            background: colors.surface,
                            color: colors.navy,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            padding: "12px",
                            borderBottom: `1px solid ${colors.navy}`,
                            textAlign: h.align || "left",
                          }}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((att) => {
                      const passed = att.score?.passed;
                      return (
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
                                fontSize: "0.85rem",
                                marginBottom: "2px",
                                wordBreak: "break-word",
                              }}
                            >
                              {att.candidateName || "Candidate"}
                            </div>
                            <div
                              style={{
                                color: colors.muted,
                                fontSize: "0.75rem",
                                wordBreak: "break-word",
                              }}
                            >
                              {att.candidateEmail}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.82rem",
                              fontWeight: 500,
                              wordBreak: "break-word",
                            }}
                          >
                            {att.testTitle}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.82rem",
                            }}
                          >
                            #{att.attemptNumber || 1}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.82rem",
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
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.85rem",
                              fontWeight: 700,
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
                              color: colors.muted,
                              fontSize: "0.78rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {att.submissionTime
                              ? new Date(att.submissionTime).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "In Progress"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            <OutcomeBadge status={att.status} passed={passed} />
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              textAlign: "end",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAttempt(att);
                                setInspectModalOpen(true);
                              }}
                              className="d-inline-flex align-items-center gap-1"
                              style={{
                                background: colors.white,
                                color: colors.navy,
                                border: `1px solid ${colors.navy}`,
                                borderRadius: 0,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                padding: "5px 10px",
                                cursor: "pointer",
                              }}
                            >
                              <Eye size={13} />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- MOBILE CARDS ---- */}
            <div className="d-lg-none p-2">
              {filteredAttempts.map((att) => (
                <MobileAttemptCard
                  key={att.id}
                  att={att}
                  onInspect={() => {
                    setSelectedAttempt(att);
                    setInspectModalOpen(true);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============================================================
          INSPECT MODAL
          ============================================================ */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Candidate Attempt Inspection"
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setInspectModalOpen(false)}
            style={{
              background: colors.navy,
              color: colors.white,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontWeight: 600,
              fontSize: "0.82rem",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        }
      >
        {selectedAttempt && (
          <div>
            {/* Summary card */}
            <div
              className="p-3 mb-3"
              style={{ background: colors.surface, borderRadius: 0 }}
            >
              <div className="row g-3" style={{ fontSize: "0.82rem" }}>
                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      marginBottom: "3px",
                    }}
                  >
                    Candidate
                  </div>
                  <div
                    style={{
                      color: colors.navy,
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedAttempt.candidateName}
                  </div>
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.75rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedAttempt.candidateEmail}
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      marginBottom: "3px",
                    }}
                  >
                    Test
                  </div>
                  <div
                    style={{
                      color: colors.navy,
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedAttempt.testTitle}
                  </div>
                </div>

                <div className="col-6">
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      marginBottom: "3px",
                    }}
                  >
                    Score
                  </div>
                  <div
                    style={{
                      color: colors.navy,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {selectedAttempt.score?.correct} /{" "}
                    {selectedAttempt.score?.total} (
                    {selectedAttempt.score?.percentage}%)
                  </div>
                </div>

                <div className="col-6">
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      marginBottom: "3px",
                    }}
                  >
                    Outcome
                  </div>
                  <OutcomeBadge
                    passed={selectedAttempt.score?.passed}
                    status={selectedAttempt.status}
                  />
                </div>
              </div>
            </div>

            {/* Question-by-question audit */}
            <div
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "10px",
              }}
            >
              Question-by-Question Audit
            </div>

            <div
              className="d-flex flex-column gap-2"
              style={{ maxHeight: "380px", overflowY: "auto" }}
            >
              {(selectedAttempt.questionsSnapshot || []).length === 0 ? (
                <div
                  className="text-center py-4"
                  style={{ color: colors.muted, fontSize: "0.82rem" }}
                >
                  No question snapshot stored for this attempt.
                </div>
              ) : (
                (selectedAttempt.questionsSnapshot || []).map((q, idx) => {
                  const chosen = selectedAttempt.savedAnswers?.[idx];
                  const correct = selectedAttempt.serverAnswerKey?.[idx];
                  const isCorrect = chosen !== undefined && chosen === correct;
                  const isUnanswered = chosen === undefined || chosen === null;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: colors.white,
                        borderLeft: `3px solid ${colors.navy}`,
                        boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
                      }}
                    >
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                        <div
                          style={{
                            color: colors.navy,
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            flexGrow: 1,
                          }}
                        >
                          Q{idx + 1}: {q.questionText}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {isCorrect ? (
                            <span
                              style={{
                                background: colors.navy,
                                color: colors.white,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "3px 7px",
                              }}
                            >
                              Correct
                            </span>
                          ) : isUnanswered ? (
                            <span
                              style={{
                                background: colors.surfaceAlt,
                                color: colors.navy,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "3px 7px",
                              }}
                            >
                              Skipped
                            </span>
                          ) : (
                            <span
                              style={{
                                background: colors.surfaceAlt,
                                color: colors.navy,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "3px 7px",
                              }}
                            >
                              Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          color: colors.muted,
                          fontSize: "0.75rem",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        <div>
                          Candidate:{" "}
                          <strong
                            style={{
                              color: colors.navy,
                              fontWeight: isCorrect ? 700 : 600,
                            }}
                          >
                            {chosen !== undefined && chosen !== null
                              ? `${String.fromCharCode(65 + chosen)}: ${
                                  q.options?.[chosen] || "—"
                                }`
                              : "None"}
                          </strong>
                        </div>
                        <div>
                          Correct:{" "}
                          <strong
                            style={{ color: colors.navy, fontWeight: 700 }}
                          >
                            {String.fromCharCode(65 + correct)}:{" "}
                            {q.options?.[correct] || "—"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
