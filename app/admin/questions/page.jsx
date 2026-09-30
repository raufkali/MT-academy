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
  Filter,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  HelpCircle,
  Eye,
  Shuffle,
  Download,
} from "lucide-react";

export default function QuestionBankPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Multiple Selection for Bulk Delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Create / Edit Modal
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

  // Bulk Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [rawImportData, setRawImportData] = useState([]);
  const [importedRows, setImportedRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  // Delete Single Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Delete All Questions Modal
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
        showToast("Uploading diagram to Cloudflare R2...", "info");
        finalImageUrl = await uploadQuestionImage(imageFile);
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl || null,
      };

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
        errorList.push(
          `Row ${rowNum}: Missing question text or required 4 options.`,
        );
        return;
      }

      // Determine initial correct answer index (0 to 3)
      let correctIdx = 0;
      if (typeof ans === "string") {
        const letter = ans.trim().toUpperCase();
        if (letter === "A" || letter === "OPTION A" || letter === "OPTIONA")
          correctIdx = 0;
        else if (
          letter === "B" ||
          letter === "OPTION B" ||
          letter === "OPTIONB"
        )
          correctIdx = 1;
        else if (
          letter === "C" ||
          letter === "OPTION C" ||
          letter === "OPTIONC"
        )
          correctIdx = 2;
        else if (
          letter === "D" ||
          letter === "OPTION D" ||
          letter === "OPTIOND"
        )
          correctIdx = 3;
        else if (letter === "1") correctIdx = 0;
        else if (letter === "2") correctIdx = 1;
        else if (letter === "3") correctIdx = 2;
        else if (letter === "4") correctIdx = 3;
        else if (letter === "0") correctIdx = 0;
        else {
          const trimmedAns = ans.trim().toLowerCase();
          if (String(optA).trim().toLowerCase() === trimmedAns) correctIdx = 0;
          else if (String(optB).trim().toLowerCase() === trimmedAns)
            correctIdx = 1;
          else if (String(optC).trim().toLowerCase() === trimmedAns)
            correctIdx = 2;
          else if (String(optD).trim().toLowerCase() === trimmedAns)
            correctIdx = 3;
        }
      } else if (Number.isInteger(ans)) {
        if (ans >= 1 && ans <= 4) correctIdx = ans - 1;
        else correctIdx = Math.max(0, Math.min(3, ans));
      }

      let finalOptions = [
        String(optA).trim(),
        String(optB).trim(),
        String(optC).trim(),
        String(optD).trim(),
      ];
      let finalCorrectIdx = correctIdx;

      if (shouldRandomize) {
        // Tag each option with whether it's the correct one
        const items = finalOptions.map((textVal, idx) => ({
          text: textVal,
          isCorrect: idx === correctIdx,
        }));

        // Fisher-Yates shuffle
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

  // Bulk File Upload and Parsing (CSV or XLSX)
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
      showToast(
        `Successfully deleted ${count} questions from the question bank.`,
        "warning",
      );
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

  // Filtered
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

  // Multiple Selection Helpers
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
      showToast(
        `Successfully deleted ${count} selected questions from the bank.`,
        "success",
      );
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
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="fs-4 fw-bold text-deep-blue mb-1"
            style={{ color: "#0F3B5D" }}
          >
            MCQ Question Bank
          </h1>
          <p className="text-secondary small mb-0">
            Create, edit, and bulk-import questions across Verbal, Non-Verbal,
            and Academic modules.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
            onClick={() => {
              setDeleteAllVerification("");
              setDeleteAllScope(moduleFilter !== "all" ? moduleFilter : "all");
              setDeleteAllModalOpen(true);
            }}
            disabled={questions.length === 0}
            title={
              questions.length === 0
                ? "Question bank is already empty"
                : "Permanently delete all questions"
            }
          >
            <Trash2 size={15} />
            <span>Delete All Questions</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={() => {
              setImportedRows([]);
              setImportErrors([]);
              setRawImportData([]);
              setImportModalOpen(true);
            }}
          >
            <Upload size={15} />
            <span>Bulk Import (CSV / Excel)</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            onClick={handleOpenCreate}
          >
            <Plus size={15} />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-subtle shadow-sm bg-white p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-subtle text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search questions by text or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="all">All Modules</option>
              <option value="verbal">Verbal Intelligence</option>
              <option value="non-verbal">Non-Verbal Intelligence</option>
              <option value="academic">Academic Test</option>
            </select>
          </div>

          <div className="col-12 col-md-3 col-lg-5 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
            <span>
              Showing {filteredQuestions.length} of {questions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="alert alert-primary d-flex flex-wrap align-items-center justify-content-between p-2.5 mb-3 shadow-sm border-primary rounded-3">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
            <span className="fw-semibold text-dark small">
              {selectedIds.length} question{selectedIds.length === 1 ? "" : "s"}{" "}
              selected
            </span>
            {selectedIds.length < questions.length && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2 text-decoration-none small text-primary fw-semibold"
                onClick={() => setSelectedIds(questions.map((q) => q.id))}
              >
                Select all {questions.length} questions in bank
              </button>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSelectedIds([])}
              disabled={bulkDeleting}
            >
              Clear Selection
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={bulkDeleting}
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div
              className="spinner-border spinner-border-sm text-primary mb-2"
              role="status"
            ></div>
            <div>Loading question bank...</div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No questions found in this category. Click "Add New Question" or
            "Bulk Import" to populate questions.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-pma mb-0">
              <thead>
                <tr>
                  <th
                    style={{ width: "42px" }}
                    className="text-center align-middle"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isAllFilteredSelected}
                      ref={(el) => {
                        if (el) {
                          const someSelected = filteredQuestions.some((q) =>
                            selectedIds.includes(q.id),
                          );
                          el.indeterminate =
                            someSelected && !isAllFilteredSelected;
                        }
                      }}
                      onChange={handleToggleSelectAllFiltered}
                      title="Select / deselect all visible questions"
                    />
                  </th>
                  <th style={{ width: "42%" }}>Question</th>
                  <th>Module</th>
                  <th>Subject & Topic</th>
                  <th>Difficulty</th>
                  <th>Diagram</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    className={selectedIds.includes(q.id) ? "table-active" : ""}
                  >
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(q.id)}
                        onChange={() => handleToggleSelectOne(q.id)}
                        title="Select question"
                      />
                    </td>
                    <td>
                      <div
                        className="fw-semibold text-dark mb-1 small"
                        style={{ lineHeight: 1.4 }}
                      >
                        {q.questionText}
                      </div>
                      <div className="small text-muted d-flex gap-2">
                        <span>
                          Correct:{" "}
                          <strong>
                            {String.fromCharCode(
                              65 + (q.correctAnswerIndex ?? 0),
                            )}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>{q.options?.[q.correctAnswerIndex ?? 0]}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-sky text-capitalize">
                        {q.moduleType}
                      </span>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">
                        {q.subject || "General"}
                      </div>
                      <small className="text-muted">{q.topic}</small>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          q.difficulty === "easy"
                            ? "bg-light text-success border border-success"
                            : q.difficulty === "hard"
                              ? "bg-light text-danger border border-danger"
                              : "bg-light text-warning border border-warning"
                        }`}
                      >
                        {q.difficulty || "medium"}
                      </span>
                    </td>
                    <td>
                      {q.imageUrl ? (
                        <a
                          href={q.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="badge bg-light text-primary border text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          <ImageIcon size={12} />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border p-1 text-secondary"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit Question"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border p-1 text-danger"
                          onClick={() => {
                            setDeletingId(q.id);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestionId ? "Edit Question" : "Add New Question to Bank"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setQuestionModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleSaveQuestion}
              disabled={saving}
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
              <label className="form-label small fw-semibold text-secondary">
                Module Category
              </label>
              <select
                className="form-select form-select-sm"
                value={formData.moduleType}
                onChange={(e) =>
                  setFormData({ ...formData, moduleType: e.target.value })
                }
              >
                <option value="verbal">Verbal Intelligence</option>
                <option value="non-verbal">Non-Verbal Intelligence</option>
                <option value="academic">Academic Test</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">
                Subject
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Mathematics, English, Analogies"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">
                Topic (Optional)
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Number Series, Trigonometry"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Question Text
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              placeholder="Enter question statement..."
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              required
            ></textarea>
          </div>

          {/* Diagram Upload (Cloudflare Images) */}
          <div
            className={`mb-3 p-3 rounded border ${formData.moduleType === "non-verbal" ? "border-primary bg-primary bg-opacity-10" : "bg-light border-subtle"}`}
          >
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1 mb-0">
                <ImageIcon size={15} />
                Question Diagram / Image
                {formData.moduleType === "non-verbal" && (
                  <span
                    className="badge bg-primary text-white ms-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Recommended for Non-Verbal
                  </span>
                )}
              </label>
              <span
                className="badge bg-light text-secondary border"
                style={{ fontSize: "0.7rem" }}
              >
                Cloudflare R2 Storage
              </span>
            </div>
            <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
              Upload diagrams, matrices, or visual sequences. Stored in
              Cloudflare R2 (mtacademy/mta-directory).
            </p>
            <input
              type="file"
              accept="image/*"
              className="form-control form-control-sm mb-2"
              onChange={(e) => {
                const file = e.target.files[0] || null;
                setImageFile(file);
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  setImagePreview(formData.imageUrl || null);
                }
              }}
            />
            {imagePreview && (
              <div className="d-flex align-items-center gap-3 p-2 bg-white rounded border border-subtle mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded"
                  style={{
                    maxHeight: "80px",
                    maxWidth: "120px",
                    objectFit: "contain",
                  }}
                />
                <div className="flex-grow-1 small">
                  <div className="fw-semibold text-dark">
                    {imageFile ? imageFile.name : "Saved Diagram"}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {imageFile
                      ? `${(imageFile.size / 1024).toFixed(1)} KB`
                      : "Cloudflare Hosted"}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setFormData({ ...formData, imageUrl: "" });
                  }}
                  title="Remove Image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Answer Options & Correct Selection */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Answer Options (Select the correct answer option using the radio
              button)
            </label>
            <div className="d-flex flex-column gap-2">
              {formData.options.map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isCorrect = formData.correctAnswerIndex === optIdx;

                return (
                  <div key={optIdx} className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-subtle">
                      <input
                        type="radio"
                        name="correctAnswer"
                        className="form-check-input mt-0"
                        checked={isCorrect}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            correctAnswerIndex: optIdx,
                          })
                        }
                        title={`Mark Option ${letter} as Correct`}
                      />
                    </span>
                    <span className="input-group-text bg-white border-subtle fw-bold text-secondary">
                      {letter}
                    </span>
                    <input
                      type="text"
                      className={`form-control ${isCorrect ? "border-primary bg-light" : ""}`}
                      placeholder={`Option ${letter} text`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[optIdx] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      required
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="row g-2 mb-2">
            <div className="col-12 col-md-8">
              <label className="form-label small fw-semibold text-secondary">
                Explanation (Shown after exam)
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Reasoning / mathematical working..."
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
              ></textarea>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">
                Difficulty Level
              </label>
              <select
                className="form-select form-select-sm"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import Questions (CSV / Excel)"
        size="lg"
        footer={
          <>
            {importedRows.length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary me-auto d-inline-flex align-items-center gap-1"
                onClick={handleDownloadRandomizedCSV}
                title="Download the randomized CSV file to your computer"
              >
                <Download size={14} />
                <span>Download Randomized CSV</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setImportModalOpen(false)}
              disabled={importing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCommitBulkImport}
              disabled={importing || importedRows.length === 0}
            >
              {importing
                ? "Importing..."
                : `Import ${importedRows.length} Questions`}
            </button>
          </>
        }
      >
        <div>
          <p className="small text-secondary mb-3">
            Select a CSV or Excel file containing columns:{" "}
            <code>questionText</code>, <code>optionA</code>,{" "}
            <code>optionB</code>, <code>optionC</code>, <code>optionD</code>,{" "}
            <code>correctAnswer</code> (A, B, C, or D), <code>moduleType</code>,{" "}
            <code>subject</code>.
          </p>

          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            className="form-control form-control-sm mb-3"
            onChange={handleFileUpload}
          />

          {/* Randomization Setting Switch */}
          <div className="card bg-light border-subtle p-3 mb-3">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="randomizeSwitch"
                  checked={randomizeOptions}
                  onChange={(e) => handleToggleRandomize(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label
                  className="form-check-label fw-semibold small text-dark"
                  htmlFor="randomizeSwitch"
                  style={{ cursor: "pointer" }}
                >
                  Randomize / Shuffle Options Order (A, B, C, D)
                </label>
              </div>
              {randomizeOptions && rawImportData.length > 0 && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: "0.75rem", height: "26px" }}
                  onClick={handleReshuffle}
                  title="Generate a new random shuffle"
                >
                  <Shuffle size={12} />
                  <span>Re-shuffle</span>
                </button>
              )}
            </div>
            <div
              className="text-muted small mt-1"
              style={{ fontSize: "0.78rem" }}
            >
              {randomizeOptions
                ? "✨ Active: Each question's 4 options are automatically shuffled on upload while keeping the correct answer accurately linked. No external Python script needed!"
                : "Options will be imported in their exact original order from the CSV file."}
            </div>
          </div>

          {importErrors.length > 0 && (
            <div className="alert alert-warning py-2 small mb-3">
              <strong>Validation Issues:</strong>
              <ul className="mb-0 ps-3">
                {importErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              {importErrors.length > 5 && (
                <div className="mt-1">
                  ...and {importErrors.length - 5} more invalid rows skipped.
                </div>
              )}
            </div>
          )}

          {importedRows.length > 0 && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-bold text-dark">
                  Preview of Valid Questions ({importedRows.length} ready to
                  import)
                </span>
                {randomizeOptions && (
                  <span className="badge bg-success-subtle text-success border border-success-subtle small">
                    ✓ Options Randomized
                  </span>
                )}
              </div>
              <div
                className="table-responsive border rounded"
                style={{ maxHeight: "280px", overflowY: "auto" }}
              >
                <table className="table table-sm table-hover mb-0 small">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: "12%" }}>Module</th>
                      <th style={{ width: "36%" }}>Question Statement</th>
                      <th style={{ width: "32%" }}>Shuffled Options</th>
                      <th style={{ width: "20%" }}>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedRows.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td className="text-capitalize align-middle">
                          <span className="badge badge-sky">
                            {r.moduleType}
                          </span>
                        </td>
                        <td
                          className="align-middle text-truncate"
                          style={{ maxWidth: "250px" }}
                          title={r.questionText}
                        >
                          {r.questionText}
                        </td>
                        <td className="align-middle">
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem", lineHeight: 1.35 }}
                          >
                            <div>
                              <strong>A:</strong> {r.options[0]}
                            </div>
                            <div>
                              <strong>B:</strong> {r.options[1]}
                            </div>
                            <div>
                              <strong>C:</strong> {r.options[2]}
                            </div>
                            <div>
                              <strong>D:</strong> {r.options[3]}
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-success text-white">
                            Option{" "}
                            {String.fromCharCode(65 + r.correctAnswerIndex)}:{" "}
                            {r.options[r.correctAnswerIndex]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importedRows.length > 20 && (
                <div
                  className="text-muted small mt-1 text-end"
                  style={{ fontSize: "0.75rem" }}
                >
                  Showing first 20 of {importedRows.length} questions.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Question"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={handleDeleteConfirm}
            >
              Yes, Delete Question
            </button>
          </>
        }
      >
        <p className="small text-secondary mb-0">
          Are you sure you want to permanently delete this question from the
          question bank? This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Selected Questions Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          if (!bulkDeleting) setBulkDeleteModalOpen(false);
        }}
        title={`Delete Selected Questions (${selectedIds.length})`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
              onClick={handleBulkDeleteConfirm}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Permanently Delete ({selectedIds.length})</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div>
          <div className="alert alert-danger d-flex align-items-start gap-2 mb-3 py-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-1" />
            <div className="small">
              <strong>CONFIRM BATCH DELETION:</strong> You are about to
              permanently delete <strong>{selectedIds.length}</strong> selected
              question{selectedIds.length === 1 ? "" : "s"} from the MTacademy
              question bank.
            </div>
          </div>
          <p className="small text-secondary mb-3">
            This action cannot be undone. These questions will no longer appear
            in practice sets, candidate mocks, or scoring pools.
          </p>
          {selectedIds.length <= 8 && (
            <div
              className="border rounded bg-light p-2 small text-muted"
              style={{ maxHeight: "160px", overflowY: "auto" }}
            >
              <div className="fw-semibold text-dark mb-1">
                Selected Questions:
              </div>
              <ul className="mb-0 ps-3">
                {questions
                  .filter((q) => selectedIds.includes(q.id))
                  .map((q) => (
                    <li key={q.id} className="text-truncate">
                      {q.questionText || "(Empty question text)"}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete All Questions Confirmation Modal */}
      <Modal
        isOpen={deleteAllModalOpen}
        onClose={() => {
          if (!deletingAll) {
            setDeleteAllModalOpen(false);
            setDeleteAllVerification("");
          }
        }}
        title="⚠️ Delete All Questions"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => {
                setDeleteAllModalOpen(false);
                setDeleteAllVerification("");
              }}
              disabled={deletingAll}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
              onClick={handleDeleteAllConfirm}
              disabled={
                deleteAllVerification.trim().toLowerCase() !== "delete all" ||
                deletingAll
              }
            >
              {deletingAll ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Deleting Questions...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Permanently Delete Questions</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div>
          <div className="alert alert-danger d-flex align-items-start gap-2 mb-3 py-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-1" />
            <div className="small">
              <strong>CRITICAL ACTION:</strong> This will permanently delete
              questions from the question bank. This action cannot be reversed.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Scope of Deletion:
            </label>
            <select
              className="form-select form-select-sm"
              value={deleteAllScope}
              onChange={(e) => setDeleteAllScope(e.target.value)}
              disabled={deletingAll}
            >
              <option value="all">
                Entire Question Bank (All {questions.length} questions)
              </option>
              <option value="verbal">Verbal Intelligence questions only</option>
              <option value="non-verbal">
                Non-Verbal Intelligence questions only
              </option>
              <option value="academic">Academic Test questions only</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">
              To confirm deletion, type{" "}
              <span className="badge bg-danger-subtle text-danger border border-danger font-monospace px-2 py-1">
                delete all
              </span>{" "}
              in the box below:
            </label>
            <input
              type="text"
              className="form-control form-control-sm font-monospace"
              placeholder='Type "delete all"'
              value={deleteAllVerification}
              onChange={(e) => setDeleteAllVerification(e.target.value)}
              disabled={deletingAll}
              autoFocus
            />
            <div
              className="form-text small text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              The delete button will remain disabled until you type{" "}
              <code>delete all</code> exactly.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
