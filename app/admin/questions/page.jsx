"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
  deleteMultipleQuestions,
  bulkImportQuestions,
} from "../../../lib/firestore";
import { uploadQuestionImage } from "../../../lib/storage";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  Eye,
  Shuffle,
  Download,
  X,
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
   REUSABLE PRIMITIVES
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

function PillButton({
  onClick,
  icon: Icon,
  children,
  variant = "navy",
  size = "md",
  disabled,
  title,
}) {
  const isNavy = variant === "navy";
  const isOutline = variant === "outline";

  const base = {
    borderRadius: 0,
    fontWeight: 600,
    fontSize: size === "sm" ? "0.75rem" : "0.82rem",
    padding: size === "sm" ? "5px 10px" : "8px 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    whiteSpace: "nowrap",
    border: `1px solid ${colors.navy}`,
  };

  if (isOutline) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{ ...base, background: colors.white, color: colors.navy }}
      >
        {Icon && <Icon size={size === "sm" ? 13 : 15} />}
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...base, background: colors.navy, color: colors.white }}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
}

function IconButton({ onClick, icon: Icon, title, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        background: colors.white,
        color: colors.navy,
        border: `1px solid ${colors.navy}`,
        borderRadius: 0,
        padding: "7px 9px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={15} />
    </button>
  );
}

function DifficultyBadge({ level }) {
  const lvl = (level || "medium").toLowerCase();
  const map = { easy: "Easy", medium: "Medium", hard: "Hard" };
  return (
    <span
      style={{
        background: lvl === "hard" ? colors.navy : colors.surfaceAlt,
        color: lvl === "hard" ? colors.white : colors.navy,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 7px",
        display: "inline-block",
      }}
    >
      {map[lvl] || "Medium"}
    </span>
  );
}

/* ============================================================
   MOBILE QUESTION CARD
   ============================================================ */
function MobileQuestionCard({ q, selected, onToggle, onEdit, onDelete }) {
  const correctLetter = String.fromCharCode(65 + (q.correctAnswerIndex ?? 0));
  const correctText = q.options?.[q.correctAnswerIndex ?? 0];

  return (
    <div
      style={{
        background: selected ? colors.surface : colors.white,
        border: `1px solid ${colors.divider}`,
        padding: "14px",
        marginBottom: "10px",
      }}
    >
      {/* Header: checkbox + module + difficulty */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            style={{
              width: "18px",
              height: "18px",
              cursor: "pointer",
              accentColor: colors.navy,
            }}
          />
          <span
            style={{
              background: colors.surface,
              color: colors.navy,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "capitalize",
              padding: "3px 7px",
              letterSpacing: "0.03em",
            }}
          >
            {q.moduleType}
          </span>
          <DifficultyBadge level={q.difficulty} />
        </div>
      </div>

      {/* Question text */}
      <div
        style={{
          color: colors.navy,
          fontWeight: 600,
          fontSize: "0.875rem",
          lineHeight: 1.5,
          marginBottom: "10px",
          wordBreak: "break-word",
        }}
      >
        {q.questionText}
      </div>

      {/* Subject/topic */}
      {(q.subject || q.topic) && (
        <div
          style={{
            color: colors.muted,
            fontSize: "0.75rem",
            marginBottom: "10px",
            wordBreak: "break-word",
          }}
        >
          {q.subject}
          {q.topic ? ` • ${q.topic}` : ""}
        </div>
      )}

      {/* Correct answer box */}
      <div
        style={{
          background: colors.surface,
          padding: "8px 10px",
          marginBottom: "10px",
          wordBreak: "break-word",
        }}
      >
        <div
          style={{
            color: colors.muted,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
            marginBottom: "2px",
          }}
        >
          Correct Answer
        </div>
        <div
          style={{ color: colors.navy, fontSize: "0.82rem", fontWeight: 600 }}
        >
          Option {correctLetter}: {correctText}
        </div>
      </div>

      {/* Diagram link */}
      {q.imageUrl && (
        <a
          href={q.imageUrl}
          target="_blank"
          rel="noreferrer"
          className="text-decoration-none d-inline-flex align-items-center gap-1 mb-3"
          style={{ color: colors.navy, fontSize: "0.78rem", fontWeight: 600 }}
        >
          <ImageIcon size={13} />
          View Diagram
        </a>
      )}

      {/* Actions */}
      <div className="d-flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
          style={{
            background: colors.white,
            color: colors.navy,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          <Edit2 size={13} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="d-inline-flex align-items-center justify-content-center"
          style={{
            background: colors.white,
            color: colors.navy,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            padding: "8px 12px",
            cursor: "pointer",
          }}
          title="Delete question"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function QuestionBankPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({
    moduleType: "verbal",
    subject: "Analogies",
    topic: "",
    questionText: "",
    imageUrl: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    explanation: "",
    difficulty: "medium",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [rawImportData, setRawImportData] = useState([]);
  const [importedRows, setImportedRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deleteAllVerification, setDeleteAllVerification] = useState("");
  const [deleteAllScope, setDeleteAllScope] = useState("all");
  const [deletingAll, setDeletingAll] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const qList = await getQuestions(moduleFilter);
      const sanitized = qList.map((q) => ({
        ...q,
        questionText: String(q.questionText ?? ""),
        subject: String(q.subject ?? "General"),
        topic: String(q.topic ?? ""),
        options: Array.isArray(q.options)
          ? q.options.map((o) => String(o ?? ""))
          : ["", "", "", ""],
      }));
      setQuestions(sanitized);
      const existingIds = new Set(sanitized.map((q) => q.id));
      setSelectedIds((prev) => prev.filter((id) => existingIds.has(id)));
    } catch (err) {
      console.error(err);
      showToast("Error loading question bank.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [moduleFilter]);

  const handleOpenCreate = () => {
    setEditingQuestionId(null);
    setFormData({
      moduleType: moduleFilter !== "all" ? moduleFilter : "verbal",
      subject: "Analogies",
      topic: "",
      questionText: "",
      imageUrl: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      difficulty: "medium",
    });
    setImageFile(null);
    setImagePreview(null);
    setQuestionModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestionId(q.id);
    setFormData({
      moduleType: q.moduleType || "verbal",
      subject: String(q.subject ?? ""),
      topic: String(q.topic ?? ""),
      questionText: String(q.questionText ?? ""),
      imageUrl: q.imageUrl || "",
      options:
        q.options && q.options.length >= 4
          ? q.options.map((opt) => String(opt ?? ""))
          : ["", "", "", ""],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      explanation: String(q.explanation ?? ""),
      difficulty: q.difficulty || "medium",
    });
    setImageFile(null);
    setImagePreview(q.imageUrl || null);
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const cleanQText = String(formData.questionText ?? "").trim();
    if (!cleanQText) {
      showToast("Please enter question text.", "warning");
      return;
    }
    if (formData.options.some((opt) => !String(opt ?? "").trim())) {
      showToast("All 4 answer options must be filled.", "warning");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        showToast("Uploading diagram...", "info");
        finalImageUrl = await uploadQuestionImage(imageFile);
      }

      const payload = { ...formData, imageUrl: finalImageUrl || null };

      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, payload, user);
        showToast("Question updated successfully!", "success");
      } else {
        await createQuestion(payload, user);
        showToast("New question added to bank!", "success");
      }

      setQuestionModalOpen(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save question.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteQuestion(deletingId, user);
      showToast("Question deleted from bank.", "warning");
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      setDeleteModalOpen(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete question.", "error");
    }
  };

  const processUploadedRows = (rows, shouldRandomize) => {
    const validList = [];
    const errorList = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const text =
        row.questionText ||
        row["Question Text"] ||
        row.Question ||
        row.question;
      const optA = row.optionA || row["Option A"] || row.A;
      const optB = row.optionB || row["Option B"] || row.B;
      const optC = row.optionC || row["Option C"] || row.C;
      const optD = row.optionD || row["Option D"] || row.D;
      const ans =
        row.correctAnswer || row["Correct Answer"] || row.Answer || row.correct;
      const mod = (row.moduleType || row.Module || "academic").toLowerCase();
      const subj = row.subject || row.Subject || "General";

      if (
        !text ||
        optA === undefined ||
        optB === undefined ||
        optC === undefined ||
        optD === undefined
      ) {
        errorList.push(`Row ${rowNum}: Missing question text or options.`);
        return;
      }

      let correctIdx = 0;
      if (typeof ans === "string") {
        const letter = ans.trim().toUpperCase();
        const letterMap = {
          A: 0,
          "OPTION A": 0,
          OPTIONA: 0,
          B: 1,
          "OPTION B": 1,
          OPTIONB: 1,
          C: 2,
          "OPTION C": 2,
          OPTIONC: 2,
          D: 3,
          "OPTION D": 3,
          OPTIOND: 3,
          1: 0,
          2: 1,
          3: 2,
          4: 3,
          0: 0,
        };
        if (letterMap[letter] !== undefined) {
          correctIdx = letterMap[letter];
        } else {
          const t = ans.trim().toLowerCase();
          if (String(optA).trim().toLowerCase() === t) correctIdx = 0;
          else if (String(optB).trim().toLowerCase() === t) correctIdx = 1;
          else if (String(optC).trim().toLowerCase() === t) correctIdx = 2;
          else if (String(optD).trim().toLowerCase() === t) correctIdx = 3;
        }
      } else if (Number.isInteger(ans)) {
        correctIdx =
          ans >= 1 && ans <= 4 ? ans - 1 : Math.max(0, Math.min(3, ans));
      }

      let finalOptions = [
        String(optA).trim(),
        String(optB).trim(),
        String(optC).trim(),
        String(optD).trim(),
      ];
      let finalCorrectIdx = correctIdx;

      if (shouldRandomize) {
        const items = finalOptions.map((textVal, idx) => ({
          text: textVal,
          isCorrect: idx === correctIdx,
        }));
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        finalOptions = items.map((item) => item.text);
        const newIdx = items.findIndex((item) => item.isCorrect);
        finalCorrectIdx = newIdx >= 0 ? newIdx : 0;
      }

      validList.push({
        moduleType: mod.includes("verbal")
          ? mod.includes("non")
            ? "non-verbal"
            : "verbal"
          : "academic",
        subject: subj,
        topic: row.topic || row.Topic || "",
        questionText: String(text).trim(),
        imageUrl:
          row.imageUrl || row["Image URL"] || row.image || row.ImageUrl || null,
        disableOptionShuffle: Boolean(
          row.disableOptionShuffle || row.imageUrl || row["Image URL"],
        ),
        options: finalOptions,
        correctAnswerIndex: finalCorrectIdx,
        explanation: row.explanation || row.Explanation || "",
        difficulty: (
          row.difficulty ||
          row.Difficulty ||
          "medium"
        ).toLowerCase(),
      });
    });

    setImportedRows(validList);
    setImportErrors(errorList);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setRawImportData(data);
        processUploadedRows(data, randomizeOptions);
      } catch (parseErr) {
        console.error(parseErr);
        showToast("Error parsing spreadsheet file.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleToggleRandomize = (checked) => {
    setRandomizeOptions(checked);
    if (rawImportData.length > 0) {
      processUploadedRows(rawImportData, checked);
      showToast(
        checked ? "Options randomized!" : "Reset to original CSV order.",
        "info",
      );
    }
  };

  const handleReshuffle = () => {
    if (rawImportData.length > 0) {
      processUploadedRows(rawImportData, true);
      showToast("Options re-shuffled!", "info");
    }
  };

  const handleDownloadRandomizedCSV = () => {
    if (importedRows.length === 0) return;
    try {
      const exportData = importedRows.map((r) => ({
        questionText: r.questionText,
        optionA: r.options[0],
        optionB: r.options[1],
        optionC: r.options[2],
        optionD: r.options[3],
        correctAnswer: String.fromCharCode(65 + r.correctAnswerIndex),
        moduleType: r.moduleType,
        subject: r.subject,
        topic: r.topic || "",
        explanation: r.explanation || "",
        difficulty: r.difficulty || "medium",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Questions");
      XLSX.writeFile(wb, "questions_randomized.csv");
      showToast("Downloaded questions_randomized.csv!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to download CSV.", "error");
    }
  };

  const handleCommitBulkImport = async () => {
    if (importedRows.length === 0) return;
    setImporting(true);
    try {
      const count = await bulkImportQuestions(importedRows, user);
      showToast(`Successfully imported ${count} questions!`, "success");
      setImportModalOpen(false);
      setImportedRows([]);
      setRawImportData([]);
      setImportErrors([]);
      loadQuestions();
    } catch (err) {
      console.error(err);
      showToast("Bulk import failed.", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAllConfirm = async () => {
    if (deleteAllVerification.trim().toLowerCase() !== "delete all") {
      showToast('Please type "delete all" exactly to confirm.', "warning");
      return;
    }
    setDeletingAll(true);
    try {
      const count = await deleteAllQuestions(user, deleteAllScope);
      showToast(`Deleted ${count} questions.`, "warning");
      setDeleteAllModalOpen(false);
      setDeleteAllVerification("");
      await loadQuestions();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete questions.", "error");
    } finally {
      setDeletingAll(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const qText = String(q.questionText ?? "").toLowerCase();
    const qSubj = String(q.subject ?? "").toLowerCase();
    const qTop = String(q.topic ?? "").toLowerCase();
    const query = String(searchQuery ?? "").toLowerCase();
    const matchesSearch =
      qText.includes(query) || qSubj.includes(query) || qTop.includes(query);
    const matchesModule =
      moduleFilter === "all" || q.moduleType === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isAllFilteredSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedIds.includes(q.id));

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const visibleIds = new Set(filteredQuestions.map((q) => q.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const combined = new Set([
        ...selectedIds,
        ...filteredQuestions.map((q) => q.id),
      ]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const count = await deleteMultipleQuestions(selectedIds, user);
      showToast(`Deleted ${count} selected questions.`, "success");
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete selected questions.", "error");
    } finally {
      setBulkDeleting(false);
    }
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
          MCQ Question Bank
        </h1>
        <p
          className="mb-3"
          style={{
            color: colors.muted,
            fontSize: "0.875rem",
            maxWidth: "640px",
          }}
        >
          Create, edit, and bulk-import questions across Verbal, Non-Verbal, and
          Academic modules.
        </p>

        {/* Action buttons — stacked grid on mobile, row on desktop */}
        <div className="row g-2">
          <div className="col-6 col-md-auto">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "9px 14px",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={15} />
              Add Question
            </button>
          </div>

          <div className="col-6 col-md-auto">
            <button
              type="button"
              onClick={() => {
                setImportedRows([]);
                setImportErrors([]);
                setRawImportData([]);
                setImportModalOpen(true);
              }}
              className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "9px 14px",
                whiteSpace: "nowrap",
              }}
            >
              <Upload size={15} />
              Bulk Import
            </button>
          </div>

          <div className="col-12 col-md-auto">
            <button
              type="button"
              onClick={() => {
                setDeleteAllVerification("");
                setDeleteAllScope(
                  moduleFilter !== "all" ? moduleFilter : "all",
                );
                setDeleteAllModalOpen(true);
              }}
              disabled={questions.length === 0}
              className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "9px 14px",
                whiteSpace: "nowrap",
                opacity: questions.length === 0 ? 0.5 : 1,
                cursor: questions.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <Trash2 size={15} />
              Delete All
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SEARCH & FILTER
          ============================================================ */}
      <div
        className="p-3 mb-3"
        style={{ background: colors.white, borderRadius: 0 }}
      >
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="d-flex" style={{ position: "relative" }}>
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
                placeholder="Search by text, subject or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, borderLeft: 0 }}
              />
            </div>
          </div>

          <div className="col-12 col-md-4 col-lg-4">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Modules</option>
              <option value="verbal">Verbal Intelligence</option>
              <option value="non-verbal">Non-Verbal Intelligence</option>
              <option value="academic">Academic Test</option>
            </select>
          </div>

          <div className="col-12 col-md-2 col-lg-3 text-md-end">
            <span
              style={{
                color: colors.muted,
                fontSize: "0.8rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <strong style={{ color: colors.navy }}>
                {filteredQuestions.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: colors.navy }}>{questions.length}</strong>{" "}
              shown
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          BULK SELECTION BAR
          ============================================================ */}
      {selectedIds.length > 0 && (
        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 p-3"
          style={{ background: colors.navy, color: colors.white }}
        >
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={16} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {selectedIds.length} selected
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={bulkDeleting}
              style={{
                background: "transparent",
                color: colors.white,
                border: `1px solid rgba(255,255,255,0.5)`,
                borderRadius: 0,
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={bulkDeleting}
              className="d-inline-flex align-items-center gap-1"
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.white}`,
                borderRadius: 0,
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} />
              Delete ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          QUESTIONS LIST
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
              Loading question bank...
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
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
              <FileSpreadsheet size={26} strokeWidth={1.8} />
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: "4px",
              }}
            >
              No questions found
            </div>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              {searchQuery || moduleFilter !== "all"
                ? "Try adjusting your filter or search query."
                : "Click 'Add Question' or 'Bulk Import' to populate."}
            </div>
            {(searchQuery || moduleFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setModuleFilter("all");
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
                      <th
                        style={{
                          width: "44px",
                          background: colors.surface,
                          borderBottom: `1px solid ${colors.navy}`,
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAllFilteredSelected}
                          onChange={handleToggleSelectAllFiltered}
                          ref={(el) => {
                            if (el) {
                              const some = filteredQuestions.some((q) =>
                                selectedIds.includes(q.id),
                              );
                              el.indeterminate = some && !isAllFilteredSelected;
                            }
                          }}
                          style={{
                            width: "16px",
                            height: "16px",
                            accentColor: colors.navy,
                            cursor: "pointer",
                          }}
                        />
                      </th>
                      {[
                        { label: "Question", width: "40%" },
                        { label: "Module", width: "12%" },
                        { label: "Subject & Topic", width: "18%" },
                        { label: "Difficulty", width: "10%" },
                        { label: "Diagram", width: "8%" },
                        { label: "Actions", width: "12%", align: "end" },
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
                    {filteredQuestions.map((q) => {
                      const correctLetter = String.fromCharCode(
                        65 + (q.correctAnswerIndex ?? 0),
                      );
                      const isSelected = selectedIds.includes(q.id);

                      return (
                        <tr
                          key={q.id}
                          style={{
                            background: isSelected
                              ? colors.surface
                              : colors.white,
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              textAlign: "center",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(q.id)}
                              style={{
                                width: "16px",
                                height: "16px",
                                accentColor: colors.navy,
                                cursor: "pointer",
                              }}
                            />
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
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                lineHeight: 1.45,
                                marginBottom: "4px",
                                wordBreak: "break-word",
                              }}
                            >
                              {q.questionText}
                            </div>
                            <div
                              style={{
                                color: colors.muted,
                                fontSize: "0.75rem",
                                wordBreak: "break-word",
                              }}
                            >
                              Correct:{" "}
                              <strong style={{ color: colors.navy }}>
                                {correctLetter}
                              </strong>{" "}
                              — {q.options?.[q.correctAnswerIndex ?? 0]}
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            <span
                              style={{
                                background: colors.surface,
                                color: colors.navy,
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                padding: "3px 7px",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {q.moduleType}
                            </span>
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
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                marginBottom: "2px",
                                wordBreak: "break-word",
                              }}
                            >
                              {q.subject || "General"}
                            </div>
                            {q.topic && (
                              <div
                                style={{
                                  color: colors.muted,
                                  fontSize: "0.72rem",
                                  wordBreak: "break-word",
                                }}
                              >
                                {q.topic}
                              </div>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            <DifficultyBadge level={q.difficulty} />
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            {q.imageUrl ? (
                              <a
                                href={q.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none d-inline-flex align-items-center gap-1"
                                style={{
                                  color: colors.navy,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                <ImageIcon size={12} />
                                View
                              </a>
                            ) : (
                              <span
                                style={{
                                  color: colors.muted,
                                  fontSize: "0.75rem",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              textAlign: "end",
                            }}
                          >
                            <div className="d-inline-flex gap-1">
                              <IconButton
                                onClick={() => handleOpenEdit(q)}
                                icon={Edit2}
                                title="Edit"
                              />
                              <IconButton
                                onClick={() => {
                                  setDeletingId(q.id);
                                  setDeleteModalOpen(true);
                                }}
                                icon={Trash2}
                                title="Delete"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- MOBILE / TABLET CARDS ---- */}
            <div className="d-lg-none p-2">
              {filteredQuestions.map((q) => (
                <MobileQuestionCard
                  key={q.id}
                  q={q}
                  selected={selectedIds.includes(q.id)}
                  onToggle={() => handleToggleSelectOne(q.id)}
                  onEdit={() => handleOpenEdit(q)}
                  onDelete={() => {
                    setDeletingId(q.id);
                    setDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============================================================
          ADD / EDIT QUESTION MODAL
          ============================================================ */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestionId ? "Edit Question" : "Add New Question"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setQuestionModalOpen(false)}
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
              onClick={handleSaveQuestion}
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
                : editingQuestionId
                  ? "Save Changes"
                  : "Create Question"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveQuestion}>
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <FormField label="Module">
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
                </select>
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Subject">
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Topic (Optional)">
                <input
                  type="text"
                  placeholder="e.g. Number Series"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  style={inputStyle}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Question Text">
            <textarea
              rows={3}
              placeholder="Enter the question statement..."
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              required
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
            />
          </FormField>

          <FormField label="Diagram / Image (Optional)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0] || null;
                setImageFile(file);
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  setImagePreview(formData.imageUrl || null);
                }
              }}
              style={inputStyle}
            />
            {imagePreview && (
              <div
                className="d-flex align-items-center gap-3 mt-2 p-2"
                style={{ background: colors.surface }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxHeight: "60px",
                    maxWidth: "90px",
                    objectFit: "contain",
                  }}
                />
                <div className="flex-grow-1 small" style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: colors.navy,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageFile ? imageFile.name : "Saved Diagram"}
                  </div>
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.72rem",
                    }}
                  >
                    {imageFile
                      ? `${(imageFile.size / 1024).toFixed(1)} KB`
                      : "Cloud-hosted"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setFormData({ ...formData, imageUrl: "" });
                  }}
                  style={{
                    background: colors.white,
                    color: colors.navy,
                    border: `1px solid ${colors.navy}`,
                    borderRadius: 0,
                    padding: "6px 8px",
                    cursor: "pointer",
                  }}
                  title="Remove image"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </FormField>

          <FormField label="Answer Options — Select the correct one">
            <div className="d-flex flex-column gap-2">
              {formData.options.map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isCorrect = formData.correctAnswerIndex === optIdx;

                return (
                  <div
                    key={optIdx}
                    className="d-flex align-items-stretch"
                    style={{
                      border: `1px solid ${isCorrect ? colors.navy : colors.divider}`,
                      background: isCorrect ? colors.surface : colors.white,
                    }}
                  >
                    <label
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        padding: "0 12px",
                        cursor: "pointer",
                        background: isCorrect ? colors.navy : colors.surface,
                        color: isCorrect ? colors.white : colors.navy,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        minWidth: "48px",
                      }}
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={isCorrect}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            correctAnswerIndex: optIdx,
                          })
                        }
                        style={{ display: "none" }}
                      />
                      {letter}
                    </label>
                    <input
                      type="text"
                      placeholder={`Option ${letter}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[optIdx] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      required
                      style={{
                        border: 0,
                        outline: 0,
                        padding: "10px 12px",
                        fontSize: "0.85rem",
                        color: colors.navy,
                        flex: 1,
                        minWidth: 0,
                        background: "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </FormField>

          <div className="row g-2">
            <div className="col-12 col-md-8">
              <FormField label="Explanation (Optional)">
                <textarea
                  rows={2}
                  placeholder="Reasoning / working..."
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Difficulty">
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          BULK IMPORT MODAL
          ============================================================ */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import Questions"
        size="lg"
        footer={
          <>
            {importedRows.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadRandomizedCSV}
                className="me-auto d-inline-flex align-items-center gap-1"
                style={{
                  background: colors.white,
                  color: colors.navy,
                  border: `1px solid ${colors.navy}`,
                  borderRadius: 0,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                <Download size={13} />
                Download
              </button>
            )}
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              disabled={importing}
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
              onClick={handleCommitBulkImport}
              disabled={importing || importedRows.length === 0}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor:
                  importing || importedRows.length === 0
                    ? "not-allowed"
                    : "pointer",
                opacity: importing || importedRows.length === 0 ? 0.6 : 1,
              }}
            >
              {importing ? "Importing..." : `Import ${importedRows.length}`}
            </button>
          </>
        }
      >
        <div>
          <p
            className="mb-3"
            style={{ color: colors.muted, fontSize: "0.82rem" }}
          >
            CSV or Excel file with columns:{" "}
            <code>
              questionText, optionA, optionB, optionC, optionD, correctAnswer,
              moduleType, subject
            </code>
          </p>

          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            style={inputStyle}
          />

          <div
            className="mt-3 p-3"
            style={{ background: colors.surface, borderRadius: 0 }}
          >
            <label
              className="d-flex align-items-start gap-2 mb-2"
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => handleToggleRandomize(e.target.checked)}
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
                  Shuffle options order (A, B, C, D)
                </div>
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "0.75rem",
                    marginTop: "2px",
                  }}
                >
                  {randomizeOptions
                    ? "Options are shuffled on upload; correct answer stays linked."
                    : "Options imported in original CSV order."}
                </div>
              </div>
            </label>

            {randomizeOptions && rawImportData.length > 0 && (
              <button
                type="button"
                onClick={handleReshuffle}
                className="d-inline-flex align-items-center gap-1 mt-1"
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
                <Shuffle size={12} />
                Re-shuffle
              </button>
            )}
          </div>

          {importErrors.length > 0 && (
            <div
              className="mt-3 p-3"
              style={{
                background: colors.surface,
                borderLeft: `3px solid ${colors.navy}`,
              }}
            >
              <div
                style={{
                  color: colors.navy,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  marginBottom: "6px",
                }}
              >
                {importErrors.length} row
                {importErrors.length > 1 ? "s" : ""} skipped
              </div>
              <ul
                className="mb-0 ps-3"
                style={{ color: colors.muted, fontSize: "0.75rem" }}
              >
                {importErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              {importErrors.length > 5 && (
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "0.72rem",
                    marginTop: "4px",
                  }}
                >
                  ...and {importErrors.length - 5} more.
                </div>
              )}
            </div>
          )}

          {importedRows.length > 0 && (
            <div className="mt-3">
              <div
                style={{
                  color: colors.navy,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  marginBottom: "8px",
                }}
              >
                Preview — {importedRows.length} ready to import
              </div>

              {/* Mobile-friendly preview list */}
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                  border: `1px solid ${colors.divider}`,
                }}
              >
                {importedRows.slice(0, 20).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderBottom:
                        i < Math.min(importedRows.length, 20) - 1
                          ? `1px solid ${colors.divider}`
                          : 0,
                      background: colors.white,
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        style={{
                          background: colors.surface,
                          color: colors.navy,
                          fontSize: "0.66rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                          padding: "2px 6px",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {r.moduleType}
                      </span>
                      <span
                        style={{
                          color: colors.muted,
                          fontSize: "0.7rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.subject}
                      </span>
                    </div>

                    <div
                      style={{
                        color: colors.navy,
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        marginBottom: "6px",
                        wordBreak: "break-word",
                      }}
                    >
                      {r.questionText}
                    </div>

                    <div className="d-flex flex-column gap-1 mb-2">
                      {r.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === r.correctAnswerIndex;
                        const letter = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            className="d-flex align-items-start gap-2"
                            style={{
                              fontSize: "0.75rem",
                              color: isCorrect ? colors.navy : colors.muted,
                              fontWeight: isCorrect ? 600 : 400,
                              wordBreak: "break-word",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                flexShrink: 0,
                                minWidth: "16px",
                              }}
                            >
                              {letter}.
                            </span>
                            <span>
                              {opt}
                              {isCorrect && (
                                <span
                                  style={{
                                    marginLeft: "6px",
                                    background: colors.navy,
                                    color: colors.white,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    padding: "1px 5px",
                                    display: "inline-block",
                                  }}
                                >
                                  Correct
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {importedRows.length > 20 && (
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "0.72rem",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  Showing first 20 of {importedRows.length}.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ============================================================
          DELETE SINGLE MODAL
          ============================================================ */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Question"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
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
              onClick={handleDeleteConfirm}
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
              Yes, Delete
            </button>
          </>
        }
      >
        <p
          style={{
            color: colors.navy,
            fontSize: "0.85rem",
            marginBottom: "8px",
          }}
        >
          Are you sure you want to permanently delete this question?
        </p>
        <div
          className="p-3"
          style={{
            background: colors.surface,
            borderLeft: `3px solid ${colors.navy}`,
            fontSize: "0.78rem",
            color: colors.navy,
          }}
        >
          This action cannot be undone.
        </div>
      </Modal>

      {/* ============================================================
          BULK DELETE MODAL
          ============================================================ */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          if (!bulkDeleting) setBulkDeleteModalOpen(false);
        }}
        title={`Delete ${selectedIds.length} Selected`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={bulkDeleting}
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
              onClick={handleBulkDeleteConfirm}
              disabled={bulkDeleting}
              className="d-inline-flex align-items-center gap-1"
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor: "pointer",
                opacity: bulkDeleting ? 0.7 : 1,
              }}
            >
              <Trash2 size={13} />
              {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.length}`}
            </button>
          </>
        }
      >
        <div>
          <p
            style={{
              color: colors.navy,
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            You are about to permanently delete{" "}
            <strong>{selectedIds.length}</strong> question
            {selectedIds.length === 1 ? "" : "s"}.
          </p>
          <div
            className="p-3"
            style={{
              background: colors.surface,
              borderLeft: `3px solid ${colors.navy}`,
              fontSize: "0.78rem",
              color: colors.navy,
            }}
          >
            This action cannot be undone.
          </div>
        </div>
      </Modal>

      {/* ============================================================
          DELETE ALL MODAL
          ============================================================ */}
      <Modal
        isOpen={deleteAllModalOpen}
        onClose={() => {
          if (!deletingAll) {
            setDeleteAllModalOpen(false);
            setDeleteAllVerification("");
          }
        }}
        title="Delete All Questions"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteAllModalOpen(false);
                setDeleteAllVerification("");
              }}
              disabled={deletingAll}
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
              onClick={handleDeleteAllConfirm}
              disabled={
                deleteAllVerification.trim().toLowerCase() !== "delete all" ||
                deletingAll
              }
              className="d-inline-flex align-items-center gap-1"
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "8px 14px",
                cursor:
                  deleteAllVerification.trim().toLowerCase() !== "delete all" ||
                  deletingAll
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  deleteAllVerification.trim().toLowerCase() !== "delete all" ||
                  deletingAll
                    ? 0.5
                    : 1,
              }}
            >
              <Trash2 size={13} />
              {deletingAll ? "Deleting..." : "Delete Permanently"}
            </button>
          </>
        }
      >
        <div>
          <div
            className="p-3 mb-3"
            style={{
              background: colors.surface,
              borderLeft: `3px solid ${colors.navy}`,
              fontSize: "0.82rem",
              color: colors.navy,
            }}
          >
            <strong>Critical:</strong> This permanently deletes questions from
            the bank. Cannot be reversed.
          </div>

          <FormField label="Scope of Deletion">
            <select
              value={deleteAllScope}
              onChange={(e) => setDeleteAllScope(e.target.value)}
              disabled={deletingAll}
              style={inputStyle}
            >
              <option value="all">
                Entire Bank ({questions.length} questions)
              </option>
              <option value="verbal">Verbal only</option>
              <option value="non-verbal">Non-Verbal only</option>
              <option value="academic">Academic only</option>
            </select>
          </FormField>

          <FormField
            label={
              <>
                Type{" "}
                <code
                  style={{
                    background: colors.surface,
                    color: colors.navy,
                    padding: "1px 6px",
                    fontWeight: 700,
                  }}
                >
                  delete all
                </code>{" "}
                to confirm
              </>
            }
          >
            <input
              type="text"
              placeholder='Type "delete all"'
              value={deleteAllVerification}
              onChange={(e) => setDeleteAllVerification(e.target.value)}
              disabled={deletingAll}
              autoFocus
              style={{
                ...inputStyle,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
