"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getCandidateAccessGrants,
  getCandidateAttempts,
  getTests,
  submitRetryRequest
} from "../../lib/firestore";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Play,
  Award,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [grants, setGrants] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retry modal state
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [selectedAttemptForRetry, setSelectedAttemptForRetry] = useState(null);
  const [retryReason, setRetryReason] = useState("");
  const [submittingRetry, setSubmittingRetry] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [gData, aData, tData] = await Promise.all([
        getCandidateAccessGrants(user.email, user.uid),
        getCandidateAttempts(user.uid, user.email),
        getTests(true)
      ]);
      setGrants(gData);
      setAttempts(aData);
      setTests(tData);
    } catch (err) {
      console.error(err);
      showToast("Error loading your dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleOpenRetry = (attempt) => {
    setSelectedAttemptForRetry(attempt);
    setRetryReason("");
    setRetryModalOpen(true);
  };

  const handleSendRetry = async (e) => {
    e.preventDefault();
    if (!selectedAttemptForRetry) return;
    setSubmittingRetry(true);
    try {
      await submitRetryRequest(user, selectedAttemptForRetry.id, retryReason);
      showToast("Retry request sent to administrator for review.", "success");
      setRetryModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to submit retry request.", "error");
    } finally {
      setSubmittingRetry(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen d-flex flex-column bg-main">
        <div className="container py-5 text-center flex-grow-1 d-flex flex-column justify-content-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary small">Loading your examination portal...</p>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const activeGrantsCount = grants.filter(g => g.computedStatus === "active").length;
  const completedCount = attempts.filter(a => a.status === "submitted").length;
  const averageScore = completedCount > 0
    ? Math.round(attempts.filter(a => a.status === "submitted").reduce((acc, a) => acc + (a.score?.percentage || 0), 0) / completedCount)
    : 0;

  return (
    <div className="min-h-screen d-flex flex-column bg-main">

      <main className="container py-4 flex-grow-1">
        {/* Welcome Banner */}
        <div className="card border-subtle shadow-sm p-4 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <span className="badge badge-sky px-2 py-1 mb-2 d-inline-flex align-items-center gap-1">
                Candidate Portal
              </span>
              <h2 className="fw-bold fs-4 mb-1 text-deep-blue" style={{ color: "#0F3B5D" }}>
                Welcome, {profile?.name || user?.email?.split("@")[0]}
              </h2>
              <p className="text-secondary small mb-0">
                PMA Long Course Initial Mock Examinations Dashboard. Select your authorized module below to begin.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link href="/contact" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                <span>Support & Contact</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Top-Level Summary Cards (Max 3-4 cards as requested) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <StatCard
              title="Authorized Active Tests"
              value={activeGrantsCount}
              subtitle="Tests ready for examination"
              icon={BookOpen}
              color="primary"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <StatCard
              title="Completed Attempts"
              value={completedCount}
              subtitle="Examinations finalized"
              icon={CheckCircle2}
              color="success"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <StatCard
              title="Overall Performance"
              value={completedCount > 0 ? `${averageScore}%` : "N/A"}
              subtitle={completedCount > 0 ? "Average test score" : "No tests completed yet"}
              icon={Award}
              color="info"
            />
          </div>
        </div>

        {/* Authorized Tests Section */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="fs-5 fw-bold text-deep-blue mb-0" style={{ color: "#0F3B5D" }}>
                Authorized Mock Examinations
              </h3>
              <small className="text-muted">Modules enabled for your candidate account</small>
            </div>
          </div>

          {grants.length === 0 ? (
            <div className="card border-subtle p-5 bg-white text-center">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "48px", height: "48px", backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                <BookOpen size={24} />
              </div>
              <h5 className="fw-semibold text-dark mb-1">No Active Test Modules Assigned</h5>
              <p className="text-secondary small mb-3" style={{ maxWidth: "480px", margin: "0 auto" }}>
                Your candidate account does not have any active test modules assigned yet. Test access is authorized directly by your MTacademy administrator when credentials are issued. If you need new test modules or additional attempts, please contact your administrator.
              </p>
              <div>
                <Link href="/contact" className="btn btn-sm btn-primary">
                  Contact MTacademy Administrator
                </Link>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {grants.map((grant) => {
                const targetTest = tests.find(t => t.id === grant.testId) || {
                  title: grant.testTitle,
                  questionCount: 50,
                  durationMinutes: 30
                };
                const attemptsRemaining = Math.max(0, (grant.permittedAttempts || 1) - (grant.usedAttempts || 0));
                const isEligible = grant.computedStatus === "active" && attemptsRemaining > 0;

                const getStatusBadge = () => {
                  switch (grant.computedStatus) {
                    case "active":
                      return attemptsRemaining > 0
                        ? <span className="badge badge-active">Active</span>
                        : <span className="badge badge-expired">Attempts Exhausted</span>;
                    case "expired":
                      return <span className="badge badge-expired">Expired</span>;
                    case "revoked":
                      return <span className="badge badge-revoked">Revoked</span>;
                    default:
                      return <span className="badge bg-secondary">{grant.computedStatus}</span>;
                  }
                };

                return (
                  <div key={grant.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-subtle shadow-sm bg-white d-flex flex-column">
                      <div className="p-3 border-bottom border-subtle d-flex align-items-start justify-content-between">
                        <div className="pe-2">
                          <h5 className="fs-6 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
                            {grant.testTitle}
                          </h5>
                          <span className="text-muted small" style={{ fontSize: "0.785rem" }}>
                            {targetTest.moduleType ? targetTest.moduleType.toUpperCase() : "PMA MODULE"}
                          </span>
                        </div>
                        {getStatusBadge()}
                      </div>

                      <div className="p-3 flex-grow-1">
                        <div className="d-flex flex-column gap-2 small text-secondary">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-center gap-1">
                              <Layers size={14} className="text-muted" /> Questions:
                            </span>
                            <span className="fw-semibold text-dark">{targetTest.questionCount || 50} MCQs</span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={14} className="text-muted" /> Duration:
                            </span>
                            <span className="fw-semibold text-dark">{targetTest.durationMinutes || 30} Minutes</span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-center gap-1">
                              <RotateCcw size={14} className="text-muted" /> Remaining Attempts:
                            </span>
                            <span className={`fw-semibold ${attemptsRemaining > 0 ? "text-success" : "text-danger"}`}>
                              {attemptsRemaining} of {grant.permittedAttempts || 1}
                            </span>
                          </div>

                          {grant.expiryDate && (
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} className="text-muted" /> Access Expiry:
                              </span>
                              <span className="text-dark">
                                {new Date(grant.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-light border-top border-subtle mt-auto">
                        {isEligible ? (
                          <Link
                            href={`/exam/${grant.testId}/instructions`}
                            className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                          >
                            <Play size={16} />
                            <span>Start Examination</span>
                          </Link>
                        ) : (
                          <button className="btn btn-secondary w-100" disabled>
                            {grant.computedStatus === "expired" ? "Access Expired" : "No Attempts Remaining"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Attempts & Results Section */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="fs-5 fw-bold text-deep-blue mb-0" style={{ color: "#0F3B5D" }}>
                Attempt History & Results
              </h3>
              <small className="text-muted">Review your scores and request retries if needed</small>
            </div>
          </div>

          {attempts.length === 0 ? (
            <div className="card border-subtle p-4 bg-white text-center">
              <small className="text-muted">You have not completed any examination attempts yet.</small>
            </div>
          ) : (
            <div className="card border-subtle shadow-sm bg-white overflow-hidden">
              <div className="table-responsive">
                <table className="table table-pma mb-0">
                  <thead>
                    <tr>
                      <th>Test Module</th>
                      <th>Attempt #</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Result</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att) => {
                      const passed = att.score?.passed;
                      return (
                        <tr key={att.id}>
                          <td className="fw-semibold text-dark">{att.testTitle}</td>
                          <td>Attempt {att.attemptNumber || 1}</td>
                          <td className="text-muted">
                            {att.submissionTime
                              ? new Date(att.submissionTime).toLocaleDateString()
                              : new Date(att.startTime).toLocaleDateString()}
                          </td>
                          <td>
                            {att.score
                              ? `${att.score.correct} / ${att.score.total}`
                              : att.status === "active"
                              ? "In Progress"
                              : "Pending"}
                          </td>
                          <td>
                            {att.score ? (
                              <span className="fw-bold">{att.score.percentage}%</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            {att.status === "active" ? (
                              <span className="badge badge-warning">In Progress</span>
                            ) : passed ? (
                              <span className="badge badge-active">PASSED</span>
                            ) : (
                              <span className="badge badge-revoked">FAILED</span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              {att.status === "active" ? (
                                <Link
                                  href={`/exam/${att.testId}/session`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  Resume Exam
                                </Link>
                              ) : (
                                <>
                                  <Link
                                    href={`/exam/result/${att.id}`}
                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                  >
                                    <span>View Result</span>
                                    <ChevronRight size={14} />
                                  </Link>
                                  <button
                                    onClick={() => handleOpenRetry(att)}
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                    title="Request additional attempt"
                                  >
                                    <RotateCcw size={13} />
                                    <span className="d-none d-sm-inline">Request Retry</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Retry Request Modal */}
        <Modal
          isOpen={retryModalOpen}
          onClose={() => setRetryModalOpen(false)}
          title="Request Additional Examination Attempt"
          footer={
            <>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setRetryModalOpen(false)}
                disabled={submittingRetry}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleSendRetry}
                disabled={submittingRetry}
              >
                {submittingRetry ? "Submitting..." : "Submit Request to Admin"}
              </button>
            </>
          }
        >
          {selectedAttemptForRetry && (
            <div>
              <p className="small text-secondary mb-3">
                If you encountered technical issues or wish to retake <strong>{selectedAttemptForRetry.testTitle}</strong>,
                you may submit a formal retry request. The administrator will review your request and can grant extra attempts.
              </p>

              <div className="p-3 bg-light rounded border border-subtle small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Previous Score:</span>
                  <span className="fw-semibold text-dark">
                    {selectedAttemptForRetry.score?.correct || 0} / {selectedAttemptForRetry.score?.total || 0} ({selectedAttemptForRetry.score?.percentage || 0}%)
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status:</span>
                  <span className={selectedAttemptForRetry.score?.passed ? "text-success fw-bold" : "text-danger fw-bold"}>
                    {selectedAttemptForRetry.score?.passed ? "Passed" : "Not Passed"}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">
                  Reason for Retry Request (Optional)
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="e.g. Internet disconnected during session / preparing for next attempt..."
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
