"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Modal from "../../../../components/Modal";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import {
  getAttemptById,
  getTestById,
  submitRetryRequest,
} from "../../../../lib/firestore";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  HelpCircle,
  Share2,
  Lock,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

export default function ExamResultPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId;

  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  // Retry modal
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [retryReason, setRetryReason] = useState("");
  const [submittingRetry, setSubmittingRetry] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;
      try {
        const att = await getAttemptById(attemptId);
        if (!att) {
          showToast("Result not found.", "error");
          router.push("/dashboard");
          return;
        }
        setAttempt(att);
        const t = await getTestById(att.testId);
        setTest(t);
      } catch (err) {
        console.error(err);
        showToast("Error loading examination result.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId, router, showToast]);

  const handleSendRetry = async (e) => {
    e.preventDefault();
    if (!attempt) return;
    setSubmittingRetry(true);
    try {
      await submitRetryRequest(user, attempt.id, retryReason);
      showToast("Retry request sent to administrator.", "success");
      setRetryModalOpen(false);
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
          <div
            className="spinner-border text-primary mx-auto mb-2"
            role="status"
          ></div>
          <small className="text-secondary">Generating result summary...</small>
        </div>
      </div>
    );
  }

  const score = attempt?.score || {
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    total: 0,
    percentage: 0,
    passed: false,
  };

  const isMultiStage = Boolean(attempt?.isMultiStage && attempt?.stages);
  const isScreenedOut = Boolean(attempt?.isScreenedOut || attempt?.failStage);
  const isPassed = !isScreenedOut && Boolean(score.passed);

  const questions = attempt?.questionsSnapshot || [];
  const answerKey = attempt?.serverAnswerKey || [];
  const savedAnswers = attempt?.savedAnswers || {};
  const visibility = test?.resultVisibility || {
    showOverallScore: true,
    showSectionScore: true,
    showAnswers: true,
    showExplanations: true,
  };

  // Duration used calculation
  const startMs = attempt?.startTime
    ? new Date(attempt.startTime).getTime()
    : 0;
  const endMs = attempt?.submissionTime
    ? new Date(attempt.submissionTime).getTime()
    : 0;
  const durationUsedMinutes =
    endMs > startMs ? Math.round((endMs - startMs) / (1000 * 60)) : 0;

  // Staged results calculation for multi-stage
  const stageResults = attempt?.stageResults || {};
  const stages = attempt?.stages || [];

  // Filter questions reviewable by candidate (only attempted stages)
  let maxReviewableIndex = questions.length;
  if (isMultiStage && stages.length > 0) {
    if (attempt?.failStage === "verbal") {
      maxReviewableIndex = stages[0]?.count || 84;
    } else if (attempt?.failStage === "non-verbal") {
      maxReviewableIndex = (stages[0]?.count || 84) + (stages[1]?.count || 64);
    }
  }
  const reviewableQuestions = questions.slice(0, maxReviewableIndex);

  return (
    <div className="min-h-screen d-flex flex-column bg-main">
      <main className="container py-5 flex-grow-1">
        <div className="mx-auto" style={{ maxWidth: "800px" }}>
          <div className="mb-3">
            <Link
              href="/dashboard"
              className="text-decoration-none small text-secondary d-inline-flex align-items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to My Dashboard
            </Link>
          </div>

          {/* Official Result Card */}
          <div className="card border-subtle shadow-sm bg-white overflow-hidden mb-4">
            {/* Top Pass/Fail Status Banner */}
            <div
              className={`p-4 text-center ${
                isPassed ? "bg-success text-white" : "bg-danger text-white"
              }`}
            >
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2 bg-white"
                style={{
                  width: "60px",
                  height: "60px",
                  color: isPassed ? "#16A34A" : "#DC2626",
                }}
              >
                {isPassed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
              </div>
              <h2 className="fw-bold mb-1 fs-3">
                {isPassed
                  ? "EXAMINATION QUALIFIED - RECOMMENDED"
                  : isScreenedOut
                  ? `SCREENED OUT (${attempt.failStage === "verbal" ? "VERBAL INTELLIGENCE" : "NON-VERBAL INTELLIGENCE"})`
                  : "DID NOT QUALIFY"}
              </h2>
              <p className="mb-0 small opacity-90">
                Official Result for {attempt?.testTitle} • Attempt #
                {attempt?.attemptNumber || 1}
              </p>
            </div>

            {/* Screened Out Alert Banner if eliminated */}
            {isScreenedOut && (
              <div className="p-3 bg-danger bg-opacity-10 border-bottom border-danger text-danger small d-flex align-items-start gap-2">
                <ShieldAlert size={20} className="flex-shrink-0 mt-1" />
                <div>
                  <strong>PMA Screening Elimination:</strong> Candidate failed to achieve the mandatory <strong>50% passing threshold</strong> in the{" "}
                  <strong>{attempt.failStage === "verbal" ? "Verbal Intelligence" : "Non-Verbal Intelligence"}</strong> phase. As per Pakistan Military Academy examination regulations, candidate was screened out immediately and subsequent testing stages were restricted.
                </div>
              </div>
            )}

            {/* Overall Score Metrics Grid */}
            <div className="p-4 bg-light border-bottom border-subtle">
              <div className="row g-3 text-center">
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-white rounded border border-subtle">
                    <small className="text-muted d-block mb-1">
                      {isMultiStage ? "Attempted Score" : "Percentage"}
                    </small>
                    <span
                      className={`fw-bold fs-4 ${isPassed ? "text-success" : "text-danger"}`}
                    >
                      {score.percentage}%
                    </span>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 bg-white rounded border border-subtle">
                    <small className="text-muted d-block mb-1">
                      Correct Answers
                    </small>
                    <span className="fw-bold fs-4 text-dark">
                      {score.correct} / {score.total}
                    </span>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 bg-white rounded border border-subtle">
                    <small className="text-muted d-block mb-1">
                      Incorrect Answers
                    </small>
                    <span className="fw-bold fs-4 text-danger">
                      {score.incorrect}
                    </span>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 bg-white rounded border border-subtle">
                    <small className="text-muted d-block mb-1">
                      Unanswered
                    </small>
                    <span className="fw-bold fs-4 text-secondary">
                      {score.unanswered}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attempt Details */}
            <div className="p-4">
              <h5 className="fs-6 fw-bold text-deep-blue mb-3">
                Attempt Summary
              </h5>
              <div className="row g-2 small text-secondary mb-4">
                <div className="col-sm-6">
                  <span className="text-muted">Candidate:</span>{" "}
                  <strong className="text-dark">
                    {attempt?.candidateName} ({attempt?.candidateEmail})
                  </strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Passing Threshold:</span>{" "}
                  <strong className="text-dark">
                    50% (Per Stage)
                  </strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Completed On:</span>{" "}
                  <strong className="text-dark">
                    {attempt?.submissionTime
                      ? new Date(attempt.submissionTime).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Duration Utilized:</span>{" "}
                  <strong className="text-dark">
                    {durationUsedMinutes} minutes
                  </strong>
                </div>
              </div>

              {/* PMA Multi-Stage 3-in-1 Breakdown */}
              {isMultiStage && stages.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-deep-blue mb-3 small text-uppercase">
                    PMA 3-Phase Elimination Breakdown
                  </h6>
                  <div className="row g-3">
                    {stages.map((stg, sIdx) => {
                      const sRes = stageResults[stg.stageId];
                      const isCompleted = Boolean(sRes);
                      const isStagePassed = sRes?.passed;
                      const isLocked = !isCompleted;

                      return (
                        <div key={stg.stageId} className="col-12 col-md-4">
                          <div
                            className={`p-3 rounded border h-100 ${
                              isLocked
                                ? "bg-light border-subtle opacity-75"
                                : isStagePassed
                                ? "border-success bg-white shadow-sm"
                                : "border-danger bg-white shadow-sm"
                            }`}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="badge bg-light text-secondary border small">
                                Phase {sIdx + 1}
                              </span>
                              {isLocked ? (
                                <span className="badge bg-secondary text-white d-inline-flex align-items-center gap-1">
                                  <Lock size={11} /> Locked
                                </span>
                              ) : isStagePassed ? (
                                <span className="badge bg-success text-white d-inline-flex align-items-center gap-1">
                                  <CheckCircle2 size={11} /> Qualified
                                </span>
                              ) : (
                                <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1">
                                  <XCircle size={11} /> Screened Out
                                </span>
                              )}
                            </div>

                            <h6 className="fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
                              {stg.title}
                            </h6>

                            {isLocked ? (
                              <p className="text-muted small mb-0 mt-2" style={{ fontSize: "0.785rem" }}>
                                Ineligible to enter. Screening terminated at previous phase.
                              </p>
                            ) : (
                              <div className="mt-2 small text-secondary">
                                <div className="d-flex justify-content-between mb-1">
                                  <span>Score:</span>
                                  <strong className="text-dark">
                                    {sRes.correct} / {sRes.total}
                                  </strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span>Percentage:</span>
                                  <strong className={isStagePassed ? "text-success" : "text-danger"}>
                                    {sRes.percentage}%
                                  </strong>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard Module Breakdown for single tests */}
              {!isMultiStage && score.moduleBreakdown &&
                Object.keys(score.moduleBreakdown).length > 1 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-deep-blue mb-2 small text-uppercase">
                      Module-wise Breakdown
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0 small">
                        <thead className="table-light">
                          <tr>
                            <th>Module</th>
                            <th>Score</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(score.moduleBreakdown).map(
                            ([modKey, modStats]) => {
                              const modPct =
                                modStats.total > 0
                                  ? Math.round(
                                      (modStats.correct / modStats.total) * 100,
                                    )
                                  : 0;
                              return (
                                <tr key={modKey}>
                                  <td className="fw-semibold text-capitalize">
                                    {modKey}
                                  </td>
                                  <td>
                                    {modStats.correct} / {modStats.total}
                                  </td>
                                  <td className="fw-bold">{modPct}%</td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="d-flex flex-wrap gap-2 pt-3 border-top border-subtle">
                <Link
                  href="/dashboard"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                >
                  <span>Go to My Dashboard</span>
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                  onClick={() => setRetryModalOpen(true)}
                >
                  <RotateCcw size={15} />
                  <span>Request Another Attempt</span>
                </button>

                {visibility.showAnswers && (
                  <button
                    type="button"
                    className="btn btn-light border ms-auto d-inline-flex align-items-center gap-1"
                    onClick={() => setShowAnswerReview(!showAnswerReview)}
                  >
                    <span>
                      {showAnswerReview
                        ? "Hide Question Review"
                        : "Review Attempted Questions"}
                    </span>
                    {showAnswerReview ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Question Review Accordion / List */}
          {showAnswerReview && visibility.showAnswers && (
            <div className="card border-subtle shadow-sm bg-white p-4">
              <h5 className="fs-6 fw-bold text-deep-blue mb-3 pb-2 border-bottom border-subtle">
                Detailed Question & Answer Review ({reviewableQuestions.length} Attempted Questions)
              </h5>

              <div className="d-flex flex-column gap-4">
                {reviewableQuestions.map((q, idx) => {
                  const chosen = savedAnswers[idx];
                  const correct = answerKey[idx];
                  const isCorrect = chosen !== undefined && chosen === correct;
                  const isUnanswered = chosen === undefined || chosen === null;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        isCorrect
                          ? "border-success bg-white"
                          : isUnanswered
                            ? "border-secondary bg-light"
                            : "border-danger bg-white"
                      }`}
                    >
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-secondary border">
                            Q {idx + 1}
                          </span>
                          <span className="badge badge-sky">{q.moduleType || q.subject}</span>
                          {q.topic && <span className="text-muted small">• {q.topic}</span>}
                        </div>
                        <div>
                          {isCorrect && (
                            <span className="badge badge-active d-inline-flex align-items-center gap-1">
                              <CheckCircle2 size={12} /> Correct
                            </span>
                          )}
                          {!isCorrect && !isUnanswered && (
                            <span className="badge badge-revoked d-inline-flex align-items-center gap-1">
                              <XCircle size={12} /> Incorrect
                            </span>
                          )}
                          {isUnanswered && (
                            <span className="badge bg-secondary text-white">
                              Unanswered
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="fw-semibold text-dark mb-2 small">
                        {q.questionText}
                      </p>

                      {q.imageUrl && (
                        <div className="mb-2 text-center p-2 bg-light rounded border border-subtle">
                          <img
                            src={q.imageUrl}
                            alt="Question diagram"
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>
                      )}

                      <div className="row g-2 mb-2">
                        {(q.options || []).map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isOptionCorrect = optIdx === correct;
                          const isOptionChosen = optIdx === chosen;

                          let badgeClass = "bg-light border text-muted";
                          if (isOptionCorrect)
                            badgeClass = "bg-success text-white border-success";
                          else if (isOptionChosen && !isOptionCorrect)
                            badgeClass = "bg-danger text-white border-danger";

                          return (
                            <div key={optIdx} className="col-12 col-sm-6">
                              <div
                                className={`p-2 rounded border small d-flex align-items-center gap-2 ${
                                  isOptionCorrect
                                    ? "border-success bg-light"
                                    : isOptionChosen
                                      ? "border-danger bg-light"
                                      : "border-subtle"
                                }`}
                              >
                                <span className={`badge ${badgeClass}`}>
                                  {letter}
                                </span>
                                <span className="text-dark">{opt}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {visibility.showExplanations && q.explanation && (
                        <div className="mt-2 pt-2 border-top border-subtle small text-secondary">
                          <strong className="text-dark">Explanation:</strong>{" "}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Retry Request Modal */}
          <Modal
            isOpen={retryModalOpen}
            onClose={() => setRetryModalOpen(false)}
            title="Request Extra Attempt"
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
                  {submittingRetry ? "Submitting..." : "Send Request"}
                </button>
              </>
            }
          >
            <div>
              <p className="small text-secondary mb-3">
                Send a formal request to the administrator for an additional
                attempt on <strong>{attempt?.testTitle}</strong>.
              </p>
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">
                  Reason / Note for Admin
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="Explain why you are requesting another attempt..."
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                ></textarea>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
