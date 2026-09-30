"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getPendingRetryRequests,
  resolveRetryRequest,
} from "../../../lib/firestore";
import { Check, X, RotateCcw, AlertCircle } from "lucide-react";

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
function StatusBadge({ status, grantedAttempts }) {
  if (status === "pending") {
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
        Pending
      </span>
    );
  }
  if (status === "approved") {
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
        Approved +{grantedAttempts || 1}
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
      Rejected
    </span>
  );
}

/* ============================================================
   MOBILE REQUEST CARD
   ============================================================ */
function MobileRequestCard({ req, onApprove, onReject }) {
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
      {/* Header */}
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
            {req.candidateName || "Candidate"}
          </div>
          <div
            style={{
              color: colors.muted,
              fontSize: "0.75rem",
              wordBreak: "break-word",
            }}
          >
            {req.candidateEmail}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusBadge
            status={req.status}
            grantedAttempts={req.grantedAttempts}
          />
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
        {req.testTitle}
      </div>

      {/* Stats */}
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
              Prev. Score
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.82rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {req.previousPercentage || 0}%
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
              Requested
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.72rem",
                lineHeight: 1.3,
              }}
            >
              {req.createdAt
                ? new Date(req.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      {req.reason && (
        <div
          style={{
            background: colors.surface,
            padding: "8px 10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              color: colors.muted,
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}
          >
            Candidate Reason
          </div>
          <div
            style={{
              color: colors.navy,
              fontSize: "0.8rem",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {req.reason}
          </div>
        </div>
      )}

      {/* Actions */}
      {req.status === "pending" ? (
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              background: colors.navy,
              color: colors.white,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontWeight: 600,
              fontSize: "0.8rem",
              padding: "9px 12px",
              cursor: "pointer",
            }}
          >
            <Check size={14} />
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              background: colors.white,
              color: colors.navy,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontWeight: 600,
              fontSize: "0.8rem",
              padding: "9px 12px",
              cursor: "pointer",
            }}
          >
            <X size={14} />
            Reject
          </button>
        </div>
      ) : (
        <div
          style={{
            color: colors.muted,
            fontSize: "0.75rem",
            textAlign: "center",
            paddingTop: "6px",
          }}
        >
          Resolved by {req.resolvedBy?.split("@")[0] || "admin"}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AdminRetriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionType, setDecisionType] = useState("approved");
  const [additionalAttempts, setAdditionalAttempts] = useState(1);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingRetryRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      showToast("Error loading retry requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenDecision = (req, type) => {
    setSelectedRequest(req);
    setDecisionType(type);
    setAdditionalAttempts(1);
    setAdminNote("");
    setDecisionModalOpen(true);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await resolveRetryRequest(
        selectedRequest.id,
        decisionType,
        additionalAttempts,
        adminNote,
        user,
      );
      showToast(
        `Retry request ${
          decisionType === "approved" ? "approved" : "rejected"
        } successfully!`,
        "success",
      );
      setDecisionModalOpen(false);
      loadRequests();
    } catch (err) {
      console.error(err);
      showToast("Failed to process retry request.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const filterLabel =
    statusFilter === "all"
      ? "requests"
      : statusFilter === "pending"
        ? "pending requests"
        : statusFilter === "approved"
          ? "approved requests"
          : "rejected requests";

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
          Candidate Retry Requests
        </h1>
        <p
          className="mb-3"
          style={{
            color: colors.muted,
            fontSize: "0.875rem",
            maxWidth: "640px",
          }}
        >
          Review candidate re-examination requests, grant extra attempts, and
          maintain an audit record.
        </p>

        <div className="row g-2">
          <div className="col-12 col-md-4 col-lg-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="pending">Pending Requests</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All History</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          REQUESTS LIST
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
              Loading requests...
            </div>
          </div>
        ) : filtered.length === 0 ? (
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
              <RotateCcw size={26} strokeWidth={1.8} />
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: "4px",
              }}
            >
              No {filterLabel} found
            </div>
            <div style={{ color: colors.muted, fontSize: "0.82rem" }}>
              {statusFilter === "pending"
                ? "Candidates haven't submitted any new requests."
                : "Try switching the filter to view other records."}
            </div>
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
                        { label: "Candidate", width: "20%" },
                        { label: "Test Module", width: "18%" },
                        { label: "Previous Score", width: "12%" },
                        { label: "Reason", width: "22%" },
                        { label: "Requested", width: "12%" },
                        { label: "Status", width: "10%" },
                        {
                          label: "Actions",
                          width: "12%",
                          align: "end",
                        },
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
                    {filtered.map((req) => (
                      <tr key={req.id}>
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
                            {req.candidateName || "Candidate"}
                          </div>
                          <div
                            style={{
                              color: colors.muted,
                              fontSize: "0.75rem",
                              wordBreak: "break-word",
                            }}
                          >
                            {req.candidateEmail}
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
                          {req.testTitle}
                        </td>

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
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {req.previousPercentage || 0}%
                          </div>
                          <div
                            style={{
                              color: colors.muted,
                              fontSize: "0.72rem",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {req.previousScore || 0} correct
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: `1px solid ${colors.divider}`,
                            verticalAlign: "middle",
                            color: colors.muted,
                            fontSize: "0.78rem",
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                            maxWidth: "260px",
                          }}
                        >
                          {req.reason || "No reason specified."}
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
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: `1px solid ${colors.divider}`,
                            verticalAlign: "middle",
                          }}
                        >
                          <StatusBadge
                            status={req.status}
                            grantedAttempts={req.grantedAttempts}
                          />
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: `1px solid ${colors.divider}`,
                            verticalAlign: "middle",
                            textAlign: "end",
                          }}
                        >
                          {req.status === "pending" ? (
                            <div className="d-inline-flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDecision(req, "approved")
                                }
                                className="d-inline-flex align-items-center gap-1"
                                style={{
                                  background: colors.navy,
                                  color: colors.white,
                                  border: `1px solid ${colors.navy}`,
                                  borderRadius: 0,
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  padding: "5px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                <Check size={13} />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDecision(req, "rejected")
                                }
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
                                <X size={13} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                color: colors.muted,
                                fontSize: "0.75rem",
                              }}
                            >
                              by {req.resolvedBy?.split("@")[0] || "admin"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- MOBILE CARDS ---- */}
            <div className="d-lg-none p-2">
              {filtered.map((req) => (
                <MobileRequestCard
                  key={req.id}
                  req={req}
                  onApprove={() => handleOpenDecision(req, "approved")}
                  onReject={() => handleOpenDecision(req, "rejected")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============================================================
          DECISION MODAL
          ============================================================ */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title={
          decisionType === "approved"
            ? "Approve Retry Request"
            : "Reject Retry Request"
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setDecisionModalOpen(false)}
              disabled={processing}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitDecision}
              disabled={processing}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor: processing ? "not-allowed" : "pointer",
                opacity: processing ? 0.7 : 1,
              }}
            >
              {processing
                ? "Processing..."
                : decisionType === "approved"
                  ? "Confirm & Grant Attempt"
                  : "Confirm Rejection"}
            </button>
          </>
        }
      >
        {selectedRequest && (
          <form onSubmit={handleSubmitDecision}>
            {/* Summary block */}
            <div
              className="p-3 mb-3"
              style={{
                background: colors.surface,
                borderLeft: `3px solid ${colors.navy}`,
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{
                  color: colors.navy,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                }}
              >
                <AlertCircle size={15} />
                {decisionType === "approved"
                  ? "Approving Retry Request"
                  : "Rejecting Retry Request"}
              </div>
              <div
                style={{
                  color: colors.navy,
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                }}
              >
                Candidate <strong>{selectedRequest.candidateName}</strong>{" "}
                requested another attempt on{" "}
                <strong>{selectedRequest.testTitle}</strong>.
              </div>
              {selectedRequest.reason && (
                <div
                  style={{
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: `1px solid ${colors.divider}`,
                    color: colors.muted,
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  <strong style={{ color: colors.navy }}>Reason:</strong>{" "}
                  {selectedRequest.reason}
                </div>
              )}
            </div>

            {decisionType === "approved" && (
              <div className="mb-3">
                <label
                  className="d-block mb-1"
                  style={{
                    color: colors.navy,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Additional Attempts to Grant
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={additionalAttempts}
                  onChange={(e) =>
                    setAdditionalAttempts(Number(e.target.value))
                  }
                  required
                  style={inputStyle}
                />
              </div>
            )}

            <div className="mb-2">
              <label
                className="d-block mb-1"
                style={{
                  color: colors.navy,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                Administrator Note
                <span
                  style={{
                    color: colors.muted,
                    fontWeight: 400,
                    marginLeft: "6px",
                    fontSize: "0.72rem",
                  }}
                >
                  — Optional
                </span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason or internal note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "70px",
                }}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
