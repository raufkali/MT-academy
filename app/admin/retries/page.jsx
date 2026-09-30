"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getPendingRetryRequests, resolveRetryRequest } from "../../../lib/firestore";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export default function AdminRetriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionType, setDecisionType] = useState("approved"); // 'approved' or 'rejected'
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
        user
      );
      showToast(
        `Retry request ${decisionType === "approved" ? "approved" : "rejected"} successfully!`,
        "success"
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

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
            Candidate Retry Requests
          </h1>
          <p className="text-secondary small mb-0">
            Review candidate re-examination requests, grant extra attempts, and maintain an audit record.
          </p>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending Requests</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All History</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
            <div>Loading requests...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No {statusFilter !== "all" ? statusFilter : ""} retry requests found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-pma mb-0">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Test Module</th>
                  <th>Previous Score</th>
                  <th>Candidate Reason</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="fw-semibold text-dark">{req.candidateName || "Candidate"}</div>
                      <small className="text-muted">{req.candidateEmail}</small>
                    </td>
                    <td className="fw-medium text-dark">{req.testTitle}</td>
                    <td>
                      <span className="fw-bold">{req.previousPercentage || 0}%</span>
                      <small className="text-muted d-block">({req.previousScore || 0} correct)</small>
                    </td>
                    <td>
                      <small className="text-secondary" style={{ maxWidth: "250px", display: "inline-block" }}>
                        {req.reason || "No reason specified."}
                      </small>
                    </td>
                    <td className="text-muted small">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {req.status === "pending" ? (
                        <span className="badge badge-warning">Pending Review</span>
                      ) : req.status === "approved" ? (
                        <span className="badge badge-active">Approved (+{req.grantedAttempts})</span>
                      ) : (
                        <span className="badge badge-revoked">Rejected</span>
                      )}
                    </td>
                    <td className="text-end">
                      {req.status === "pending" ? (
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                            onClick={() => handleOpenDecision(req, "approved")}
                          >
                            <Check size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            onClick={() => handleOpenDecision(req, "rejected")}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <small className="text-muted">
                          Resolved by {req.resolvedBy?.split("@")[0] || "admin"}
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title={decisionType === "approved" ? "Approve Retry Request" : "Reject Retry Request"}
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setDecisionModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-sm ${decisionType === "approved" ? "btn-success" : "btn-danger"}`}
              onClick={handleSubmitDecision}
              disabled={processing}
            >
              {processing ? "Processing..." : decisionType === "approved" ? "Confirm & Grant Extra Attempt" : "Confirm Rejection"}
            </button>
          </>
        }
      >
        {selectedRequest && (
          <form onSubmit={handleSubmitDecision}>
            <p className="small text-secondary mb-3">
              Candidate <strong>{selectedRequest.candidateName}</strong> requested another attempt on{" "}
              <strong>{selectedRequest.testTitle}</strong>.
            </p>

            {decisionType === "approved" && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Additional Attempts to Grant
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={1}
                  max={5}
                  value={additionalAttempts}
                  onChange={(e) => setAdditionalAttempts(Number(e.target.value))}
                  required
                />
              </div>
            )}

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                Administrator Note (Optional)
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Reason or internal note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              ></textarea>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
