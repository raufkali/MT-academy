"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Modal from "../../../../components/Modal";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import {
  startExamAttempt,
  saveExamAnswer,
  finalizeAttempt,
  advanceStageOrFinalize,
  startNextStage,
  getAttemptById
} from "../../../../lib/firestore";
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Menu,
  X,
  ShieldCheck,
  RotateCcw,
  Award,
  ArrowRight,
  Lock
} from "lucide-react";

export default function ExamSessionPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId;

  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedReviews, setMarkedReviews] = useState([]);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saving' | 'saved' | 'error'
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Multi-stage state
  const [stageTransitionModalOpen, setStageTransitionModalOpen] = useState(false);
  const [stageTransitionData, setStageTransitionData] = useState(null);
  const [transitioningStage, setTransitioningStage] = useState(false);

  const timerRef = useRef(null);

  // Authenticate candidate
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load or Resume Attempt
  useEffect(() => {
    let isMounted = true;

    const initAttempt = async () => {
      if (!user || !testId) return;
      try {
        const att = await startExamAttempt(testId, user);
        if (!isMounted) return;

        if (att.status === "submitted") {
          router.replace(`/exam/result/${att.id}`);
          return;
        }

        setAttempt(att);
        setAnswers(att.savedAnswers || {});
        setMarkedReviews(att.markedForReview || []);

        const isMultiStage = Boolean(att.isMultiStage && att.stages);
        const stageIdx = att.currentStageIndex || 0;
        const currentStage = isMultiStage && att.stages ? att.stages[stageIdx] : null;

        // If resuming a multi-stage attempt, set currentIndex to the active stage's start
        if (isMultiStage && currentStage) {
          const stageStart = currentStage.startIndex || 0;
          const stageEnd = stageStart + (currentStage.count || 0);
          // Pick first unanswered within this stage, or default to start
          let resumeIdx = stageStart;
          for (let i = stageStart; i < stageEnd; i++) {
            if (att.savedAnswers?.[i] === undefined || att.savedAnswers?.[i] === null) {
              resumeIdx = i;
              break;
            }
          }
          setCurrentIndex(resumeIdx);
        } else {
          setCurrentIndex(0);
        }

        // Calculate remaining seconds synced to stage expiry or overall expiry
        const targetExpiryStr = isMultiStage && att.stageExpiryTime ? att.stageExpiryTime : att.expiryTime;
        const expiryDate = new Date(targetExpiryStr);
        const now = new Date();
        const diffSecs = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
        setSecondsRemaining(diffSecs);
      } catch (err) {
        console.error(err);
        showToast(err.message || "Failed to initialize examination session.", "error");
        router.push("/dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAttempt();
    return () => {
      isMounted = false;
    };
  }, [user, testId, router, showToast]);

  const isMultiStage = Boolean(attempt?.isMultiStage && attempt?.stages);
  const currentStageIndex = isMultiStage ? (attempt?.currentStageIndex || 0) : 0;
  const currentStage = isMultiStage ? (attempt?.stages?.[currentStageIndex] || null) : null;
  const totalQuestions = attempt?.questionsSnapshot?.length || 0;

  const stageStartIndex = isMultiStage && currentStage ? currentStage.startIndex : 0;
  const stageCount = isMultiStage && currentStage ? currentStage.count : totalQuestions;
  const stageEndIndex = stageStartIndex + stageCount;

  // Finalize or Advance Submission
  const handleFinalize = useCallback(
    async (isAuto = false) => {
      if (!attempt || submitting) return;
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        if (isMultiStage) {
          const result = await advanceStageOrFinalize(attempt.id, currentStageIndex, isAuto);

          if (!result.canProceed) {
            // Either screened out OR fully completed!
            if (result.screenedOut) {
              showToast(`Screened out: Did not achieve qualifying score in ${currentStage?.title || "Intelligence Test"}.`, "error");
            } else {
              showToast("Examination finalized and submitted successfully!", "success");
            }
            router.push(`/exam/result/${attempt.id}`);
            return;
          }

          // Candidate successfully passed this stage! Show transition modal to next stage!
          setSubmitModalOpen(false);
          setStageTransitionData(result);
          setStageTransitionModalOpen(true);
          setSubmitting(false);
        } else {
          // Standard single test finalization
          const finalized = await finalizeAttempt(attempt.id);
          if (isAuto) {
            showToast("Time expired! Your examination was automatically submitted.", "warning");
          } else {
            showToast("Examination submitted successfully!", "success");
          }
          router.push(`/exam/result/${attempt.id}`);
        }
      } catch (err) {
        console.error("Submission error:", err);
        showToast("Error processing submission. Retrying...", "error");
        setSubmitting(false);
      }
    },
    [attempt, submitting, isMultiStage, currentStageIndex, currentStage, router, showToast]
  );

  // Live countdown timer synced to server deadline
  useEffect(() => {
    if (!attempt || attempt.status !== "active") return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalize(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt, handleFinalize]);

  // Handle Option Select with Autosave
  const handleSelectOption = async (optionIndex) => {
    if (!attempt) return;

    // Update local state immediately
    const updatedAnswers = { ...answers, [currentIndex]: optionIndex };
    setAnswers(updatedAnswers);
    setSaveStatus("saving");

    try {
      await saveExamAnswer(attempt.id, currentIndex, optionIndex, null);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Autosave error:", err);
      setSaveStatus("error");
      showToast("Connection issue. Unable to save answer.", "error");
    }
  };

  // Toggle Mark for Review
  const handleToggleReview = async () => {
    if (!attempt) return;

    let updatedReviews = [...markedReviews];
    const isCurrentlyMarked = updatedReviews.includes(currentIndex);

    if (isCurrentlyMarked) {
      updatedReviews = updatedReviews.filter((i) => i !== currentIndex);
    } else {
      updatedReviews.push(currentIndex);
    }

    setMarkedReviews(updatedReviews);
    setSaveStatus("saving");

    try {
      await saveExamAnswer(attempt.id, currentIndex, answers[currentIndex] ?? null, !isCurrentlyMarked);
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  // Begin next stage when unlocked
  const handleBeginNextStage = async () => {
    if (!stageTransitionData || transitioningStage) return;
    setTransitioningStage(true);

    try {
      const nextIdx = stageTransitionData.nextStageIndex;
      const updatedAtt = await startNextStage(attempt.id, nextIdx);
      setAttempt(updatedAtt);

      const targetStage = updatedAtt.stages[nextIdx];
      setCurrentIndex(targetStage.startIndex);

      // Reset timer for the newly started stage
      const targetExpiry = new Date(updatedAtt.stageExpiryTime);
      const diffSecs = Math.max(0, Math.floor((targetExpiry.getTime() - new Date().getTime()) / 1000));
      setSecondsRemaining(diffSecs);

      setStageTransitionModalOpen(false);
      setStageTransitionData(null);
      showToast(`Phase ${nextIdx + 1} (${targetStage.title}) started. Good luck!`, "success");
    } catch (err) {
      console.error("Error starting next stage:", err);
      showToast("Failed to begin next stage. Please try again.", "error");
    } finally {
      setTransitioningStage(false);
    }
  };

  // Format Time Helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center bg-main">
        <div className="text-center p-4">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h5 className="fw-semibold text-deep-blue">Preparing Examination Session</h5>
          <p className="text-muted small">Loading secured question set and syncing server timer...</p>
        </div>
      </div>
    );
  }

  const questions = attempt?.questionsSnapshot || [];
  const currentQ = questions[currentIndex] || {};

  // Compute answers count for current stage scope
  let activeSectionAnsweredCount = 0;
  for (let i = stageStartIndex; i < stageEndIndex; i++) {
    if (answers[i] !== undefined && answers[i] !== null) {
      activeSectionAnsweredCount++;
    }
  }
  const activeSectionUnansweredCount = stageCount - activeSectionAnsweredCount;
  const isTimerCritical = secondsRemaining < 300; // < 5 mins

  // Local index within current stage
  const localQuestionNumber = currentIndex - stageStartIndex + 1;

  // Next stage name if multi-stage
  const nextStageInfo = isMultiStage && attempt?.stages?.[currentStageIndex + 1]
    ? attempt.stages[currentStageIndex + 1]
    : null;

  return (
    <div className="min-h-screen d-flex flex-column bg-main" style={{ minHeight: "100vh" }}>
      {/* Top Fixed Header with Timer */}
      <header className="navbar bg-white border-bottom border-subtle px-3 py-2 sticky-top shadow-sm">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-light border d-lg-none p-1 text-muted"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Toggle Question Navigator"
            >
              <Menu size={20} />
            </button>
            <div>
              {isMultiStage ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white px-2 py-1 small">
                    Phase {currentStageIndex + 1}/3: {currentStage?.title}
                  </span>
                  <span className="badge bg-light text-secondary border d-none d-md-inline small">
                    PMA Full Mock
                  </span>
                </div>
              ) : (
                <span className="badge badge-sky px-2 py-1 small">
                  {attempt?.testTitle}
                </span>
              )}
            </div>
            <div className="small text-muted d-none d-md-block ms-1">
              Question {localQuestionNumber} of {stageCount}
            </div>
          </div>

          {/* Central Timer */}
          <div
            className={`d-flex align-items-center gap-2 px-3 py-1 rounded-pill border ${
              isTimerCritical
                ? "bg-danger text-white border-danger animate-pulse"
                : "bg-light text-dark border-subtle"
            }`}
          >
            <Clock size={16} className={isTimerCritical ? "text-white" : "text-primary"} />
            <span className="font-monospace fw-bold fs-6">
              {formatTime(secondsRemaining)}
            </span>
          </div>

          {/* Right Header Status & Submit */}
          <div className="d-flex align-items-center gap-2">
            {/* Autosave status indicator */}
            <div className="d-none d-sm-flex align-items-center gap-1 small text-muted me-2" style={{ fontSize: "0.785rem" }}>
              {saveStatus === "saving" && (
                <span className="text-warning d-flex align-items-center gap-1">
                  <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }}></span>
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-success d-flex align-items-center gap-1">
                  <CheckCircle2 size={13} />
                  Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-danger d-flex align-items-center gap-1">
                  <AlertTriangle size={13} />
                  Not saved
                </span>
              )}
            </div>

            <button
              onClick={() => setSubmitModalOpen(true)}
              className="btn btn-sm btn-primary px-3 d-inline-flex align-items-center gap-1"
            >
              <Send size={14} />
              <span>
                {isMultiStage
                  ? currentStageIndex === 2
                    ? "Submit Examination"
                    : `Submit ${currentStage?.title || "Section"}`
                  : "Submit Test"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Multi-Stage Progress Tracker Bar */}
      {isMultiStage && attempt?.stages && (
        <div className="bg-white border-bottom border-subtle py-2 px-3">
          <div className="container-fluid d-flex align-items-center justify-content-center gap-2 gap-md-4 small">
            {attempt.stages.map((stg, sIdx) => {
              const isActive = sIdx === currentStageIndex;
              const isPast = sIdx < currentStageIndex;
              const isFuture = sIdx > currentStageIndex;

              return (
                <div
                  key={stg.stageId}
                  className={`d-flex align-items-center gap-1 ${
                    isActive ? "fw-bold text-primary" : isPast ? "text-success" : "text-muted opacity-60"
                  }`}
                >
                  <span
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                      isActive
                        ? "bg-primary text-white"
                        : isPast
                        ? "bg-success text-white"
                        : "bg-light border text-muted"
                    }`}
                    style={{ width: "22px", height: "22px", fontSize: "0.75rem" }}
                  >
                    {isPast ? <CheckCircle2 size={13} /> : isFuture ? <Lock size={11} /> : sIdx + 1}
                  </span>
                  <span>{stg.title}</span>
                  {sIdx < attempt.stages.length - 1 && (
                    <ArrowRight size={14} className="text-muted ms-1 ms-md-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Examination Body */}
      <div className="container-fluid py-3 flex-grow-1">
        <div className="row g-3">
          {/* Main Question & Options Area */}
          <div className="col-12 col-lg-8 col-xl-9">
            <div className="card border-subtle shadow-sm bg-white p-4 h-100 d-flex flex-column">
              {/* Question Header Metadata */}
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-secondary border">
                    Q {localQuestionNumber} of {stageCount}
                  </span>
                  {currentQ.subject && (
                    <span className="badge badge-sky">{currentQ.subject}</span>
                  )}
                  {currentQ.topic && (
                    <span className="text-muted small d-none d-sm-inline">
                      • {currentQ.topic}
                    </span>
                  )}
                </div>

                {/* Mark for Review Button */}
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`btn btn-sm ${
                    markedReviews.includes(currentIndex)
                      ? "btn-warning text-white"
                      : "btn-outline-secondary"
                  } d-inline-flex align-items-center gap-1`}
                >
                  <Bookmark size={14} />
                  <span>
                    {markedReviews.includes(currentIndex) ? "Marked for Review" : "Mark for Review"}
                  </span>
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <p className="fs-5 fw-semibold text-dark mb-3" style={{ lineHeight: 1.5 }}>
                  {currentQ.questionText}
                </p>

                {/* Optional Image for Non-Verbal questions */}
                {currentQ.imageUrl && (
                  <div className="my-3 text-center p-3 bg-light rounded border border-subtle">
                    <img
                      src={currentQ.imageUrl}
                      alt="Question diagram"
                      className="img-fluid rounded"
                      style={{ maxHeight: "280px", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              {/* Clickable Option Cards */}
              <div className="d-flex flex-column gap-3 mb-4">
                {(currentQ.options || []).map((optText, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'

                  return (
                    <div
                      key={optIdx}
                      className={`exam-option-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectOption(optIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleSelectOption(optIdx);
                      }}
                    >
                      <div className="option-badge">{letter}</div>
                      <div className="flex-grow-1 text-dark fs-6" style={{ wordBreak: "break-word" }}>
                        {optText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="d-flex align-items-center justify-content-between pt-3 border-top border-subtle mt-auto">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                  onClick={() => setCurrentIndex((prev) => Math.max(stageStartIndex, prev - 1))}
                  disabled={currentIndex <= stageStartIndex}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="text-muted small">
                  {localQuestionNumber} / {stageCount}
                </div>

                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                  onClick={() => setCurrentIndex((prev) => Math.min(stageEndIndex - 1, prev + 1))}
                  disabled={currentIndex >= stageEndIndex - 1}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Side: Question Navigator (Desktop Sidebar) */}
          <div className="col-12 col-lg-4 col-xl-3 d-none d-lg-block">
            <div className="card border-subtle shadow-sm bg-white p-3 sticky-top" style={{ top: "70px" }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
                <h6 className="fw-bold text-deep-blue mb-0" style={{ color: "#0F3B5D" }}>
                  {isMultiStage ? currentStage?.title : "Question Navigator"}
                </h6>
                <span className="badge badge-sky small">
                  {activeSectionAnsweredCount}/{stageCount} Answered
                </span>
              </div>

              {/* Status Legend */}
              <div className="d-flex flex-wrap gap-2 mb-3 pb-2 border-bottom border-subtle text-secondary small" style={{ fontSize: "0.75rem" }}>
                <div className="d-flex align-items-center gap-1">
                  <span className="q-grid-btn answered" style={{ width: "16px", height: "16px" }}></span>
                  <span>Answered</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="q-grid-btn review" style={{ width: "16px", height: "16px" }}></span>
                  <span>Review</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="q-grid-btn unanswered" style={{ width: "16px", height: "16px" }}></span>
                  <span>Unanswered</span>
                </div>
              </div>

              {/* Grid of Question Numbers for the Active Stage */}
              <div
                className="d-flex flex-wrap gap-2"
                style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}
              >
                {Array.from({ length: stageCount }, (_, i) => {
                  const globalIdx = stageStartIndex + i;
                  const isCurrent = globalIdx === currentIndex;
                  const isAnswered = answers[globalIdx] !== undefined && answers[globalIdx] !== null;
                  const isMarked = markedReviews.includes(globalIdx);

                  let stateClass = "unanswered";
                  if (isMarked) stateClass = "review";
                  else if (isAnswered) stateClass = "answered";

                  return (
                    <button
                      key={globalIdx}
                      type="button"
                      className={`q-grid-btn ${stateClass} ${isCurrent ? "current" : ""}`}
                      onClick={() => setCurrentIndex(globalIdx)}
                      title={`Question ${i + 1} (${stateClass})`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Offcanvas Navigator */}
      <div
        className={`offcanvas offcanvas-end ${mobileDrawerOpen ? "show" : ""}`}
        tabIndex="-1"
        style={{ visibility: mobileDrawerOpen ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header border-bottom border-subtle">
          <h5 className="offcanvas-title fs-6 fw-bold text-deep-blue">
            {isMultiStage ? currentStage?.title : "Question Navigator"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body p-3">
          <div className="d-flex flex-wrap gap-2 mb-3 pb-2 border-bottom border-subtle text-secondary small">
            <div className="d-flex align-items-center gap-1">
              <span className="q-grid-btn answered" style={{ width: "16px", height: "16px" }}></span>
              <span>Answered ({activeSectionAnsweredCount})</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="q-grid-btn review" style={{ width: "16px", height: "16px" }}></span>
              <span>Review</span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {Array.from({ length: stageCount }, (_, i) => {
              const globalIdx = stageStartIndex + i;
              const isCurrent = globalIdx === currentIndex;
              const isAnswered = answers[globalIdx] !== undefined && answers[globalIdx] !== null;
              const isMarked = markedReviews.includes(globalIdx);

              let stateClass = "unanswered";
              if (isMarked) stateClass = "review";
              else if (isAnswered) stateClass = "answered";

              return (
                <button
                  key={globalIdx}
                  type="button"
                  className={`q-grid-btn ${stateClass} ${isCurrent ? "current" : ""}`}
                  onClick={() => {
                    setCurrentIndex(globalIdx);
                    setMobileDrawerOpen(false);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {mobileDrawerOpen && (
        <div
          className="offcanvas-backdrop fade show d-lg-none"
          onClick={() => setMobileDrawerOpen(false)}
        ></div>
      )}

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={isMultiStage ? `Submit ${currentStage?.title}` : "Confirm Examination Submission"}
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setSubmitModalOpen(false)}
              disabled={submitting}
            >
              Continue Section
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => handleFinalize(false)}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : isMultiStage
                ? currentStageIndex === 2
                  ? "Submit Final Examination"
                  : `Submit & Check Qualification`
                : "Yes, Submit Final Examination"}
            </button>
          </>
        }
      >
        <div>
          <p className="small text-secondary mb-3">
            {isMultiStage ? (
              <>
                You are about to submit <strong>{currentStage?.title}</strong>. Once submitted, your answers for this section will be evaluated immediately.
              </>
            ) : (
              "Are you sure you want to finish and submit your examination? Once submitted, you cannot modify your answers."
            )}
          </p>

          <div className="p-3 bg-light rounded border border-subtle small mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Section Questions:</span>
              <span className="fw-semibold text-dark">{stageCount}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Answered:</span>
              <span className="fw-bold text-success">{activeSectionAnsweredCount}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Unanswered:</span>
              <span className={`fw-bold ${activeSectionUnansweredCount > 0 ? "text-danger" : "text-muted"}`}>
                {activeSectionUnansweredCount}
              </span>
            </div>
          </div>

          {isMultiStage && nextStageInfo && (
            <div className="alert alert-info py-2 small d-flex align-items-start gap-2 mb-3">
              <ShieldCheck size={18} className="flex-shrink-0 mt-1 text-primary" />
              <div>
                <strong>PMA Screening Rule:</strong> A minimum score of <strong>50%</strong> is mandatory to unlock <strong>{nextStageInfo.title}</strong>. Candidates who fail this section will be screened out immediately and cannot proceed.
              </div>
            </div>
          )}

          {activeSectionUnansweredCount > 0 && (
            <div className="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-0">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <div>
                You still have <strong>{activeSectionUnansweredCount} unanswered questions</strong>. They will be marked as incorrect if you submit now.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Stage Transition & Qualification Modal (Multi-Stage Only) */}
      <Modal
        isOpen={stageTransitionModalOpen}
        onClose={() => {}} // Cannot dismiss without proceeding
        title="Section Qualification Verified"
        footer={
          <button
            type="button"
            className="btn btn-sm btn-success px-4 d-inline-flex align-items-center gap-2 fw-semibold"
            onClick={handleBeginNextStage}
            disabled={transitioningStage}
          >
            {transitioningStage ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Starting {stageTransitionData?.nextStageTitle}...</span>
              </>
            ) : (
              <>
                <span>Begin {stageTransitionData?.nextStageTitle}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        }
      >
        <div className="text-center py-2">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 bg-success bg-opacity-10 text-success"
            style={{ width: "64px", height: "64px" }}
          >
            <Award size={36} />
          </div>

          <h4 className="fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
            Congratulations! You Qualified!
          </h4>
          <p className="text-secondary small mb-3">
            You scored <strong>{stageTransitionData?.stageResult?.percentage}%</strong> in {stageTransitionData?.stageResult?.title} (Passing requirement: {stageTransitionData?.stageResult?.passingRequirement}%).
          </p>

          <div className="p-3 bg-light rounded border border-subtle text-start small mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Section Score:</span>
              <span className="fw-bold text-success">
                {stageTransitionData?.stageResult?.correct} / {stageTransitionData?.stageResult?.total} ({stageTransitionData?.stageResult?.percentage}%)
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Status:</span>
              <span className="badge bg-success text-white">QUALIFIED</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Next Unlocked Phase:</span>
              <span className="fw-bold text-primary">{stageTransitionData?.nextStageTitle}</span>
            </div>
          </div>

          <div className="alert alert-success py-2 small text-start d-flex align-items-start gap-2 mb-0">
            <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-1" />
            <div>
              <strong>Phase {stageTransitionData?.nextStageIndex + 1} Unlocked:</strong> You are now authorized to proceed to <strong>{stageTransitionData?.nextStageTitle}</strong> ({stageTransitionData?.nextStageCount} Questions, {stageTransitionData?.nextStageDuration} Minutes). Click below when you are ready to begin.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
