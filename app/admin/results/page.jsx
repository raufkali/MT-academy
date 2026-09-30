"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getAllAttempts, getTests } from "../../../lib/firestore";
import {
  Award,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Calendar
} from "lucide-react";

export default function AdminResultsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspect Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aData, tData] = await Promise.all([
        getAllAttempts(),
        getTests(false)
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
      "Submission Date"
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
      a.submissionTime ? `"${new Date(a.submissionTime).toISOString()}"` : "In Progress"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PMA_Exam_Results_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
            Examination Results & Scoring
          </h1>
          <p className="text-secondary small mb-0">
            View completed candidate attempts, inspect individual question responses, and export scores to CSV.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={handleExportCSV}
          disabled={filteredAttempts.length === 0}
        >
          <Download size={15} />
          <span>Export Results (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card border-subtle shadow-sm bg-white p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-5 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-subtle text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate name, email, or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
            >
              <option value="all">All Tests</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2 col-lg-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="passed">Qualified (Passed)</option>
              <option value="failed">Did Not Qualify</option>
              <option value="active">In Progress</option>
            </select>
          </div>

          <div className="col-12 col-md-2 col-lg-3 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
            <span>Showing {filteredAttempts.length} of {attempts.length} attempts</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
            <div>Loading results...</div>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No examination attempts match the current search or filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-pma mb-0">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Test Module</th>
                  <th>Attempt #</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Completion Date</th>
                  <th>Outcome</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((att) => {
                  const passed = att.score?.passed;

                  return (
                    <tr key={att.id}>
                      <td>
                        <div className="fw-semibold text-dark">{att.candidateName || "Candidate"}</div>
                        <small className="text-muted">{att.candidateEmail}</small>
                      </td>
                      <td className="fw-medium text-dark">{att.testTitle}</td>
                      <td>Attempt {att.attemptNumber || 1}</td>
                      <td>
                        {att.score ? (
                          <span>{att.score.correct} / {att.score.total}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {att.score ? (
                          <span className={`fw-bold ${passed ? "text-success" : "text-danger"}`}>
                            {att.score.percentage}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-muted small">
                        {att.submissionTime
                          ? new Date(att.submissionTime).toLocaleString()
                          : "In Progress"}
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
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => {
                            setSelectedAttempt(att);
                            setInspectModalOpen(true);
                          }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Attempt Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Candidate Attempt Inspection"
        size="lg"
        footer={
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setInspectModalOpen(false)}
          >
            Close
          </button>
        }
      >
        {selectedAttempt && (
          <div>
            <div className="p-3 bg-light rounded border border-subtle mb-3">
              <div className="row g-2 small">
                <div className="col-sm-6">
                  <span className="text-muted">Candidate:</span>{" "}
                  <strong className="text-dark">{selectedAttempt.candidateName} ({selectedAttempt.candidateEmail})</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Test:</span>{" "}
                  <strong className="text-dark">{selectedAttempt.testTitle}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Score:</span>{" "}
                  <span className={`fw-bold ${selectedAttempt.score?.passed ? "text-success" : "text-danger"}`}>
                    {selectedAttempt.score?.correct} / {selectedAttempt.score?.total} ({selectedAttempt.score?.percentage}%)
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted">Outcome:</span>{" "}
                  <span className={`badge ${selectedAttempt.score?.passed ? "badge-active" : "badge-revoked"}`}>
                    {selectedAttempt.score?.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Answer-by-Answer Review */}
            <h6 className="fw-bold text-deep-blue fs-6 mb-2">Question-by-Question Audit</h6>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: "380px", overflowY: "auto" }}>
              {(selectedAttempt.questionsSnapshot || []).map((q, idx) => {
                const chosen = selectedAttempt.savedAnswers?.[idx];
                const correct = selectedAttempt.serverAnswerKey?.[idx];
                const isCorrect = chosen !== undefined && chosen === correct;
                const isUnanswered = chosen === undefined || chosen === null;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border small ${
                      isCorrect ? "border-success bg-white" : isUnanswered ? "border-secondary bg-light" : "border-danger bg-white"
                    }`}
                  >
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold text-dark">Q{idx + 1}: {q.questionText}</span>
                      <span className={`badge ${isCorrect ? "badge-active" : isUnanswered ? "bg-secondary text-white" : "badge-revoked"}`}>
                        {isCorrect ? "Correct" : isUnanswered ? "Unanswered" : "Incorrect"}
                      </span>
                    </div>

                    <div className="text-muted small">
                      Candidate selected:{" "}
                      <strong className={isCorrect ? "text-success" : "text-danger"}>
                        {chosen !== undefined && chosen !== null
                          ? `${String.fromCharCode(65 + chosen)}: ${q.options?.[chosen]}`
                          : "None"}
                      </strong>
                      {" • "}
                      Correct:{" "}
                      <strong className="text-success">
                        {String.fromCharCode(65 + correct)}: {q.options?.[correct]}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
