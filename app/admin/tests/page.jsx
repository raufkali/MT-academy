"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getTests, createTest, updateTest } from "../../../lib/firestore";
import {
  Plus,
  Edit2,
  Clock,
  Layers,
  Award,
  Sliders,
  CheckCircle2,
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
function FormField({ label, hint, children }) {
  return (
    <div className="mb-3">
      <label
        className="d-block mb-1"
        style={{ color: colors.navy, fontSize: "0.78rem", fontWeight: 700 }}
      >
        {label}
        {hint && (
          <span
            style={{
              color: colors.muted,
              fontWeight: 400,
              marginLeft: "6px",
              fontSize: "0.72rem",
            }}
          >
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span
      style={{
        background: isActive ? colors.navy : colors.surfaceAlt,
        color: isActive ? colors.white : colors.navy,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 8px",
        display: "inline-block",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div style={{ background: colors.surface, padding: "10px 12px" }}>
      <div
        style={{
          color: colors.muted,
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        className="d-flex align-items-center gap-2"
        style={{ color: colors.navy, fontWeight: 600, fontSize: "0.82rem" }}
      >
        <Icon size={14} />
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function TestsConfigPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      showExplanations: true,
    },
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
        showExplanations: true,
      },
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
        showExplanations: true,
      },
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
      showToast(
        `Test ${newStatus === "active" ? "activated" : "deactivated"}.`,
        "info",
      );
      loadTests();
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.", "error");
    }
  };

  const toggleVisibility = (key) => {
    setFormData((prev) => ({
      ...prev,
      resultVisibility: {
        ...prev.resultVisibility,
        [key]: !prev.resultVisibility[key],
      },
    }));
  };

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
          Test &amp; Module Configuration
        </h1>
        <p
          className="mb-3"
          style={{
            color: colors.muted,
            fontSize: "0.875rem",
            maxWidth: "640px",
          }}
        >
          Configure examination durations, question counts, passing marks, and
          result visibility rules.
        </p>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-100 w-md-auto d-inline-flex align-items-center justify-content-center gap-2"
          style={{
            background: colors.navy,
            color: colors.white,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "10px 16px",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={15} />
          Create New Test
        </button>
      </div>

      {/* ============================================================
          TESTS GRID
          ============================================================ */}
      {loading ? (
        <div className="p-5 text-center">
          <div
            className="spinner-border mb-2"
            role="status"
            style={{ color: colors.navy, borderRadius: 0 }}
          />
          <div style={{ color: colors.muted, fontSize: "0.85rem" }}>
            Loading tests...
          </div>
        </div>
      ) : tests.length === 0 ? (
        <div
          className="p-5 text-center"
          style={{ background: colors.white, borderRadius: 0 }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: "56px",
              height: "56px",
              background: colors.surface,
              color: colors.navy,
            }}
          >
            <Sliders size={26} strokeWidth={1.8} />
          </div>
          <div
            style={{
              color: colors.navy,
              fontWeight: 600,
              fontSize: "0.95rem",
              marginBottom: "4px",
            }}
          >
            No tests configured yet
          </div>
          <div
            style={{
              color: colors.muted,
              fontSize: "0.82rem",
              marginBottom: "16px",
            }}
          >
            Click "Create New Test" to set up your first examination.
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="d-inline-flex align-items-center gap-2"
            style={{
              background: colors.navy,
              color: colors.white,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              fontWeight: 600,
              fontSize: "0.8rem",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Create New Test
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {tests.map((test) => (
            <div key={test.id} className="col-12 col-lg-6">
              <div
                className="h-100 d-flex flex-column"
                style={{
                  borderRadius: 0,
                  border: " 1.5px solid #c2c0c0",
                  overflow: "hidden",
                }}
              >
                {/* Header — title + module + status */}
                <div className="p-3">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <h5
                      className="mb-0 flex-grow-1"
                      style={{
                        color: colors.navy,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                      }}
                    >
                      {test.title}
                    </h5>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={test.status} />
                    </div>
                  </div>
                  <span
                    style={{
                      background: colors.surface,
                      color: colors.navy,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      padding: "3px 8px",
                      letterSpacing: "0.03em",
                      display: "inline-block",
                    }}
                  >
                    {test.moduleType || "General"} Module
                  </span>
                </div>

                {/* Body — description + stats grid */}
                <div className="px-3 pb-3 flex-grow-1">
                  {test.description && (
                    <p
                      className="mb-3"
                      style={{
                        color: colors.muted,
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {test.description}
                    </p>
                  )}

                  <div className="row g-2">
                    <div className="col-6">
                      <StatTile
                        icon={Clock}
                        label="Duration"
                        value={`${test.durationMinutes || 30} min`}
                      />
                    </div>
                    <div className="col-6">
                      <StatTile
                        icon={Layers}
                        label="Questions"
                        value={`${test.questionCount || 50} MCQs`}
                      />
                    </div>
                    <div className="col-6">
                      <StatTile
                        icon={Award}
                        label="Passing"
                        value={`${test.passingPercentage || 50}%`}
                      />
                    </div>
                    <div className="col-6">
                      <StatTile
                        icon={Sliders}
                        label="Randomization"
                        value={
                          test.randomizeQuestions !== false
                            ? "Enabled"
                            : "Sequential"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Footer — actions */}
                <div
                  className="p-3 d-flex align-items-center justify-content-between gap-2"
                  style={{
                    borderTop: `1px solid ${colors.divider}`,
                    background: colors.surface,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(test)}
                    style={{
                      background: colors.white,
                      color: colors.navy,
                      border: `1px solid ${colors.navy}`,
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                  >
                    {test.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(test)}
                    className="d-inline-flex align-items-center gap-1"
                    style={{
                      background: colors.navy,
                      color: colors.white,
                      border: `1px solid ${colors.navy}`,
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={13} />
                    Edit Config
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          EDIT / CREATE MODAL
          ============================================================ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingTestId ? "Edit Test Configuration" : "Create New Examination"
        }
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
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
              onClick={handleSaveTest}
              disabled={saving}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Saving..."
                : editingTestId
                  ? "Update Test"
                  : "Create Test"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTest}>
          <FormField label="Test Title">
            <input
              type="text"
              placeholder="e.g. Verbal Intelligence Test (PMA Long Course)"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              style={inputStyle}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={2}
              placeholder="Brief description for candidates..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }}
            />
          </FormField>

          <FormField label="Module Type">
            <select
              value={formData.moduleType}
              onChange={(e) =>
                setFormData({ ...formData, moduleType: e.target.value })
              }
              style={inputStyle}
            >
              <option value="verbal">Verbal Intelligence</option>
              <option value="non-verbal">Non-Verbal Intelligence</option>
              <option value="academic">Academic Test</option>
              <option value="full-mock">Full Mock Package (3-in-1)</option>
            </select>
          </FormField>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <FormField label="Duration (min)">
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Question Count">
                <input
                  type="number"
                  min={5}
                  max={250}
                  value={formData.questionCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionCount: Number(e.target.value),
                    })
                  }
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <FormField label="Passing Score (%)">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.passingPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingPercentage: Number(e.target.value),
                    })
                  }
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Status">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Randomize toggle */}
          <label
            className="d-flex align-items-start gap-2 mb-3 p-3"
            style={{ background: colors.surface, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={formData.randomizeQuestions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  randomizeQuestions: e.target.checked,
                })
              }
              style={{
                width: "16px",
                height: "16px",
                marginTop: "2px",
                accentColor: colors.navy,
                cursor: "pointer",
              }}
            />
            <div>
              <div
                style={{
                  color: colors.navy,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                Randomize Question Order
              </div>
              <div
                style={{
                  color: colors.muted,
                  fontSize: "0.75rem",
                  marginTop: "2px",
                }}
              >
                Each candidate receives questions in a different sequence.
              </div>
            </div>
          </label>

          {/* Result Visibility */}
          <div className="p-3" style={{ background: colors.surface }}>
            <div
              className="d-flex align-items-center gap-2 mb-3"
              style={{
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              <CheckCircle2 size={14} />
              Candidate Post-Exam Result Visibility
            </div>

            <div className="d-flex flex-column gap-2">
              {[
                {
                  key: "showOverallScore",
                  label: "Show Overall Percentage",
                },
                {
                  key: "showSectionScore",
                  label: "Show Section Breakdown",
                },
                {
                  key: "showAnswers",
                  label: "Allow Full Question Review",
                },
                {
                  key: "showExplanations",
                  label: "Show Answer Explanations",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(formData.resultVisibility[item.key])}
                    onChange={() => toggleVisibility(item.key)}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: colors.navy,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: colors.navy,
                      fontSize: "0.82rem",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
