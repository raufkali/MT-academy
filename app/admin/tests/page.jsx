"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getTests, createTest, updateTest } from "../../../lib/firestore";
import {
  ClipboardList,
  Plus,
  Edit2,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  Eye,
  Sliders,
  Settings
} from "lucide-react";

export default function TestsConfigPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    moduleType: "verbal",
    durationMinutes: 30,
    questionCount: 84,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    }
  });
  const [saving, setSaving] = useState(false);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await getTests(false);
      setTests(data);
    } catch (err) {
      console.error(err);
      showToast("Error loading tests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleOpenCreate = () => {
    setEditingTestId(null);
    setFormData({
      title: "",
      description: "",
      moduleType: "verbal",
      durationMinutes: 30,
      questionCount: 84,
      passingPercentage: 50,
      randomizeQuestions: true,
      status: "active",
      resultVisibility: {
        showOverallScore: true,
        showSectionScore: true,
        showAnswers: true,
        showExplanations: true
      }
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTestId(t.id);
    setFormData({
      title: t.title || "",
      description: t.description || "",
      moduleType: t.moduleType || "verbal",
      durationMinutes: t.durationMinutes || 30,
      questionCount: t.questionCount || 50,
      passingPercentage: t.passingPercentage || 50,
      randomizeQuestions: t.randomizeQuestions !== false,
      status: t.status || "active",
      resultVisibility: t.resultVisibility || {
        showOverallScore: true,
        showSectionScore: true,
        showAnswers: true,
        showExplanations: true
      }
    });
    setModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a test title.", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingTestId) {
        await updateTest(editingTestId, formData, user);
        showToast("Test configuration updated!", "success");
      } else {
        await createTest(formData, user);
        showToast("New examination created!", "success");
      }
      setModalOpen(false);
      loadTests();
    } catch (err) {
      console.error(err);
      showToast("Failed to save test.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (test) => {
    const newStatus = test.status === "active" ? "inactive" : "active";
    try {
      await updateTest(test.id, { status: newStatus }, user);
      showToast(`Test ${newStatus === "active" ? "activated" : "deactivated"}.`, "info");
      loadTests();
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.", "error");
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
            Test & Module Configuration
          </h1>
          <p className="text-secondary small mb-0">
            Configure examination durations, question counts, passing marks, and result visibility rules.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
            <div>Loading tests...</div>
          </div>
        ) : tests.length === 0 ? (
          <div className="col-12">
            <div className="card border-subtle p-5 text-center text-muted small bg-white">
              No tests configured. Click "Create New Test" or use the seed button on the overview page.
            </div>
          </div>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="col-12 col-md-6 col-xl-6">
              <div className="card h-100 border-subtle shadow-sm bg-white d-flex flex-column">
                <div className="p-3 border-bottom border-subtle d-flex align-items-start justify-content-between">
                  <div>
                    <h5 className="fs-6 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
                      {test.title}
                    </h5>
                    <span className="badge badge-sky text-capitalize">
                      {test.moduleType || "General"} Module
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <span
                      className={`badge ${
                        test.status === "active" ? "badge-active" : "badge-expired"
                      }`}
                    >
                      {test.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-3 flex-grow-1">
                  <p className="small text-secondary mb-3">{test.description}</p>

                  <div className="row g-2 small text-secondary">
                    <div className="col-6">
                      <div className="p-2 bg-light rounded border border-subtle">
                        <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Duration</span>
                        <strong className="text-dark d-flex align-items-center gap-1">
                          <Clock size={13} className="text-primary" /> {test.durationMinutes || 30} Minutes
                        </strong>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-2 bg-light rounded border border-subtle">
                        <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Question Pool</span>
                        <strong className="text-dark d-flex align-items-center gap-1">
                          <Layers size={13} className="text-primary" /> {test.questionCount || 50} MCQs
                        </strong>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-2 bg-light rounded border border-subtle">
                        <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Passing Score</span>
                        <strong className="text-dark d-flex align-items-center gap-1">
                          <Award size={13} className="text-success" /> {test.passingPercentage || 50}%
                        </strong>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-2 bg-light rounded border border-subtle">
                        <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Randomization</span>
                        <strong className="text-dark">
                          {test.randomizeQuestions !== false ? "Enabled" : "Sequential"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-light border-top border-subtle d-flex align-items-center justify-content-between mt-auto">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      test.status === "active" ? "btn-outline-danger" : "btn-outline-success"
                    }`}
                    onClick={() => handleToggleStatus(test)}
                  >
                    {test.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    onClick={() => handleOpenEdit(test)}
                  >
                    <Edit2 size={13} />
                    <span>Edit Config</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTestId ? "Edit Test Configuration" : "Create New Examination"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleSaveTest}
              disabled={saving}
            >
              {saving ? "Saving..." : editingTestId ? "Update Test" : "Create Test"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTest}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Test Title</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Verbal Intelligence Test (PMA Long Course)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Description</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              placeholder="Brief description for candidates..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">Module Type</label>
              <select
                className="form-select form-select-sm"
                value={formData.moduleType}
                onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
              >
                <option value="verbal">Verbal Intelligence</option>
                <option value="non-verbal">Non-Verbal Intelligence</option>
                <option value="academic">Academic Test</option>
                <option value="full-mock">Full Mock Package (3-in-1)</option>
              </select>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Duration (Mins)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min={5}
                max={180}
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                required
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Question Count</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min={5}
                max={250}
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Passing Score (%)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min={1}
                max={100}
                value={formData.passingPercentage}
                onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                required
              />
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Status</label>
              <select
                className="form-select form-select-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="randomCheck"
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
              />
              <label className="form-check-label small fw-semibold text-secondary" htmlFor="randomCheck">
                Randomize Question Order for Each Candidate Attempt
              </label>
            </div>
          </div>

          {/* Result Visibility Configuration */}
          <div className="p-3 bg-light rounded border border-subtle mb-2">
            <label className="form-label small fw-semibold text-dark mb-2 d-block">
              Candidate Post-Exam Result Visibility Permissions
            </label>
            <div className="row g-2">
              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="visScore"
                    checked={formData.resultVisibility.showOverallScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultVisibility: { ...formData.resultVisibility, showOverallScore: e.target.checked }
                      })
                    }
                  />
                  <label className="form-check-label small text-secondary" htmlFor="visScore">
                    Show Overall Percentage
                  </label>
                </div>
              </div>

              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="visSec"
                    checked={formData.resultVisibility.showSectionScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultVisibility: { ...formData.resultVisibility, showSectionScore: e.target.checked }
                      })
                    }
                  />
                  <label className="form-check-label small text-secondary" htmlFor="visSec">
                    Show Section Breakdown
                  </label>
                </div>
              </div>

              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="visAns"
                    checked={formData.resultVisibility.showAnswers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultVisibility: { ...formData.resultVisibility, showAnswers: e.target.checked }
                      })
                    }
                  />
                  <label className="form-check-label small text-secondary" htmlFor="visAns">
                    Allow Full Question Review
                  </label>
                </div>
              </div>

              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="visExp"
                    checked={formData.resultVisibility.showExplanations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resultVisibility: { ...formData.resultVisibility, showExplanations: e.target.checked }
                      })
                    }
                  />
                  <label className="form-check-label small text-secondary" htmlFor="visExp">
                    Show Answer Explanations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
