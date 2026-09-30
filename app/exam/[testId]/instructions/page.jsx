"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import {
  getTestById,
  getCandidateAccessGrants,
  startExamAttempt,
} from "../../../../lib/firestore";
import {
  ShieldAlert,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowLeft,
  FileText,
} from "lucide-react";

export default function ExamInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId;

  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const t = await getTestById(testId);
        if (!t) {
          setErrorMsg("Test not found.");
        } else {
          setTest(t);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load test details.");
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchTest();
  }, [testId]);

  const handleStartExam = async () => {
    if (!confirmed) {
      showToast(
        "Please confirm that you have read and agreed to the examination rules.",
        "warning",
      );
      return;
    }
    setStarting(true);
    try {
      const attempt = await startExamAttempt(testId, user);
      showToast(
        attempt.isResumed
          ? "Resuming ongoing active session..."
          : "Examination session started!",
        "success",
      );
      router.push(`/exam/${testId}/session`);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to start exam.", "error");
      setErrorMsg(err.message || "Failed to start exam.");
      setStarting(false);
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
          <small className="text-secondary">Loading instructions...</small>
        </div>
      </div>
    );
  }

  if (errorMsg && !test) {
    return (
      <div className="min-h-screen d-flex flex-column bg-main">
        <div className="container py-5 text-center flex-grow-1">
          <div className="alert alert-danger d-inline-block p-4">
            {errorMsg}
          </div>
          <div className="mt-3">
            <Link href="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen d-flex flex-column bg-main">
      <main className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="w-100" style={{ maxWidth: "720px" }}>
          <div className="mb-3">
            <Link
              href="/dashboard"
              className="text-decoration-none small text-secondary d-inline-flex align-items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to My Dashboard
            </Link>
          </div>

          <div className="card shadow-sm border-subtle bg-white overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-white border-bottom border-subtle">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge badge-sky px-2 py-1">
                  PMA Candidate Examination
                </span>
                <span className="badge bg-light text-secondary border">
                  Official Standard
                </span>
              </div>
              <h1
                className="fw-bold fs-4 text-deep-blue mb-2"
                style={{ color: "#0F3B5D" }}
              >
                {test?.title}
              </h1>
              <p className="text-secondary small mb-0">{test?.description}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-4 bg-light border-bottom border-subtle">
              <div className="row g-3 text-center">
                <div className="col-4">
                  <div className="p-2 bg-white rounded border border-subtle">
                    <small className="text-muted d-block">Questions</small>
                    <span className="fw-bold fs-5 text-dark">
                      {test?.questionCount || 50} MCQs
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-white rounded border border-subtle">
                    <small className="text-muted d-block">Time Limit</small>
                    <span className="fw-bold fs-5 text-dark">
                      {test?.durationMinutes || 30} Mins
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-white rounded border border-subtle">
                    <small className="text-muted d-block">Passing Score</small>
                    <span className="fw-bold fs-5 text-dark">
                      {test?.passingPercentage || 50}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules Body */}
            <div className="p-4">
              <h5 className="fw-semibold fs-6 text-deep-blue mb-3 d-flex align-items-center gap-2">
                <FileText size={18} className="text-primary" />
                Examination Instructions & Attempt Rules
              </h5>

              <ul
                className="text-secondary small mb-4 ps-3"
                style={{ lineHeight: 1.7 }}
              >
                <li>
                  <strong>Server-Enforced Timer:</strong> The examination
                  countdown begins the moment you click "Begin Examination" and
                  cannot be paused.
                </li>
                <li>
                  <strong>Autosave & Persistence:</strong> Your answers are
                  saved automatically in real time. If your browser or internet
                  connection drops, you can return and resume your remaining
                  time.
                </li>
                <li>
                  <strong>Navigation & Review:</strong> You can move forward,
                  backward, or jump to any question using the Question
                  Navigator. You can also "Mark for Review" questions to revisit
                  them before submission.
                </li>
                <li>
                  <strong>Automatic Submission:</strong> When the time limit
                  expires, the examination will automatically finalize and
                  calculate your score based on saved answers.
                </li>
                <li>
                  <strong>Single Attempt Session:</strong> Each started test
                  uses one authorized attempt from your access grant. Do not
                  open the test in multiple browser tabs simultaneously.
                </li>
              </ul>

              {test?.moduleType === "full-mock" && (
                <div className="alert alert-warning py-3 small mb-4 border-warning">
                  <div className="d-flex align-items-start gap-2">
                    <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-1" />
                    <div>
                      <strong className="d-block mb-1 text-dark fs-6">PMA 3-Stage Screening Protocol:</strong>
                      <p className="mb-2 text-secondary">This Full Mock Examination strictly simulates the authentic Pakistan Military Academy initial testing sequence:</p>
                      <ol className="mb-0 ps-3 text-secondary" style={{ lineHeight: 1.6 }}>
                        <li><strong>Phase 1: Verbal Intelligence Test (84 Questions, 30 Mins):</strong> Mandatory 50% cutoff. If you fail, you are screened out immediately.</li>
                        <li><strong>Phase 2: Non-Verbal Intelligence Test (64 Questions, 30 Mins):</strong> <em>Gated:</em> Only unlocked if you qualify Verbal. If you fail Non-Verbal, you are screened out immediately.</li>
                        <li><strong>Phase 3: Academic Test (50 Questions, 30 Mins):</strong> <em>Gated:</em> Only unlocked if you qualify both Verbal and Non-Verbal intelligence.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="alert alert-danger py-2 small mb-3">
                  {errorMsg}
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="p-3 bg-light rounded border border-subtle mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="confirmCheck"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <label
                    className="form-check-label small fw-semibold text-dark"
                    htmlFor="confirmCheck"
                  >
                    I have read and understood the instructions. I am ready to
                    start my timed examination now.
                  </label>
                </div>
              </div>

              {/* Start Button */}
              <button
                type="button"
                className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleStartExam}
                disabled={!confirmed || starting}
              >
                {starting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Initializing Secure Session...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Begin Examination</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
