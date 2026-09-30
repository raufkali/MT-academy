"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getAllCandidates,
  updateUserAccountStatus,
  getCandidateAccessGrants,
  getCandidateAttempts,
  updateCandidateUser,
  deleteCandidateUser,
  getTests,
} from "../../../lib/firestore";
import { createTemporaryCandidateAccount } from "../../../lib/auth";
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  BookOpen,
  Award,
  ChevronRight,
  Eye,
  Mail,
  Calendar,
  Key,
  Edit2,
  Trash2,
  Plus,
  Send,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  User as UserIcon,
} from "lucide-react";

export default function CandidatesManagementPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect Candidate Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateGrants, setCandidateGrants] = useState([]);
  const [candidateAttempts, setCandidateAttempts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Candidate Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Candidate Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Assign Test Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningCandidate, setAssigningCandidate] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [assignAttempts, setAssignAttempts] = useState(1);
  const [assignExpiryDays, setAssignExpiryDays] = useState(14);
  const [assignPaymentRef, setAssignPaymentRef] = useState(
    "JazzCash / Easypaisa Manual",
  );
  const [assignInternalNote, setAssignInternalNote] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Credentials Slip Modal (After test assignment)
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [generatedSlip, setGeneratedSlip] = useState(null);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [copiedCredsOnly, setCopiedCredsOnly] = useState(false);

  const generateNewPassword = () => {
    return "MTA" + Math.floor(1000 + Math.random() * 9000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, tData] = await Promise.all([
        getAllCandidates(),
        getTests(false),
      ]);
      setCandidates(cData);
      setTests(tData);
      if (tData.length > 0 && !selectedTestId) {
        setSelectedTestId(tData[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading candidates and tests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (cand) => {
    const newStatus = cand.accountStatus === "active" ? "suspended" : "active";
    try {
      await updateUserAccountStatus(cand.id, newStatus, user);
      showToast(
        `Account ${newStatus === "active" ? "activated" : "suspended"}.`,
        "info",
      );
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update account status.", "error");
    }
  };

  const handleInspect = async (cand) => {
    setSelectedCandidate(cand);
    setInspectModalOpen(true);
    setLoadingDetails(true);
    try {
      const [gData, aData] = await Promise.all([
        getCandidateAccessGrants(cand.email, cand.id),
        getCandidateAttempts(cand.id),
      ]);
      setCandidateGrants(gData);
      setCandidateAttempts(aData);
    } catch (err) {
      console.error(err);
      showToast("Error fetching candidate records.", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cand) => {
    setEditingCandidate(cand);
    setEditName(cand.name || "");
    setEditUsername(cand.username || cand.email?.split("@")[0] || "");
    setEditEmail(cand.email || "");
    setEditPassword(cand.temporaryPassword || generateNewPassword());
    setEditStatus(cand.accountStatus || "active");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCandidate) return;
    setSavingEdit(true);
    try {
      await updateCandidateUser(
        editingCandidate.id,
        {
          name: editName,
          username: editUsername,
          email: editEmail,
          temporaryPassword: editPassword,
          accountStatus: editStatus,
        },
        user,
      );
      showToast("Candidate account updated successfully!", "success");
      setEditModalOpen(false);
      loadData();
      if (selectedCandidate?.id === editingCandidate.id) {
        setSelectedCandidate((prev) => ({
          ...prev,
          name: editName,
          username: editUsername,
          email: editEmail,
          temporaryPassword: editPassword,
          accountStatus: editStatus,
        }));
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update candidate.", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (cand) => {
    setDeletingCandidate(cand);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCandidate) return;
    setDeleting(true);
    try {
      await deleteCandidateUser(
        deletingCandidate.id,
        deletingCandidate.email,
        user,
      );
      showToast(
        `Candidate account for ${deletingCandidate.name || deletingCandidate.email} deleted.`,
        "warning",
      );
      setDeleteModalOpen(false);
      if (inspectModalOpen && selectedCandidate?.id === deletingCandidate.id) {
        setInspectModalOpen(false);
      }
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete candidate.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Open Assign Test Modal
  const handleOpenAssignTest = (cand) => {
    setAssigningCandidate(cand);
    if (tests.length > 0 && !selectedTestId) {
      setSelectedTestId(tests[0].id);
    }
    setAssignAttempts(1);
    setAssignExpiryDays(14);
    setAssignPaymentRef("JazzCash / Easypaisa Manual");
    setAssignInternalNote("");
    setAssignModalOpen(true);
  };

  const handleConfirmAssignTest = async (e) => {
    e.preventDefault();
    if (!assigningCandidate || !selectedTestId) {
      showToast("Please choose a test module to assign.", "warning");
      return;
    }

    const chosenTest = tests.find((t) => t.id === selectedTestId);
    const expiryDate = new Date(
      Date.now() + assignExpiryDays * 24 * 60 * 60 * 1000,
    ).toISOString();
    const tempPass =
      assigningCandidate.temporaryPassword || generateNewPassword();

    setAssigning(true);
    try {
      const result = await createTemporaryCandidateAccount(
        {
          name:
            assigningCandidate.name || assigningCandidate.email?.split("@")[0],
          username:
            assigningCandidate.username ||
            assigningCandidate.email?.split("@")[0],
          email: assigningCandidate.email,
          temporaryPassword: tempPass,
          testId: chosenTest.id,
          testTitle: chosenTest.title,
          permittedAttempts: assignAttempts,
          expiryDate,
          paymentRef: assignPaymentRef,
          internalNote: assignInternalNote,
        },
        user,
      );

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const loginUrl = `${origin}/login`;

      const whatsappMessage =
        `*🇵🇰 MTACADEMY — PMA MOCK TEST LOGIN CREDENTIALS*\n\n` +
        `Dear Candidate *${result.name}*,\n` +
        `Your examination module has been assigned. Below are your official login credentials:\n\n` +
        `🔗 *Login Portal:* ${loginUrl}\n` +
        `👤 *Username:* \`${result.username}\`\n` +
        `📧 *Email:* \`${result.email}\`\n` +
        `🔑 *Temporary Password:* \`${result.temporaryPassword}\`\n\n` +
        `📝 *Assigned Test:* ${chosenTest.title}\n` +
        `⏱️ *Duration:* ${chosenTest.durationMinutes || 30} Minutes | ${chosenTest.questionCount || 84} MCQs\n` +
        `🎯 *Attempts Allowed:* ${assignAttempts}\n` +
        `📅 *Valid Until:* ${new Date(expiryDate).toLocaleDateString()}\n\n` +
        `*How to Start Your Examination:*\n` +
        `1. Open: ${loginUrl}\n` +
        `2. Enter your username or email along with your password.\n` +
        `3. Your test is unlocked and ready on your dashboard. Good luck!`;

      setGeneratedSlip({
        name: result.name,
        username: result.username,
        email: result.email,
        temporaryPassword: result.temporaryPassword,
        testTitle: chosenTest.title,
        permittedAttempts: assignAttempts,
        expiryDate,
        loginUrl,
        whatsappMessage,
      });

      showToast(`Test ${chosenTest.title} assigned to candidate!`, "success");
      setAssignModalOpen(false);
      setSlipModalOpen(true);
      loadData();
      if (inspectModalOpen && selectedCandidate?.id === assigningCandidate.id) {
        handleInspect(selectedCandidate);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to assign test.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleCopyWhatsApp = () => {
    if (!generatedSlip) return;
    navigator.clipboard.writeText(generatedSlip.whatsappMessage);
    setCopiedSlip(true);
    showToast("WhatsApp credentials message copied!", "success");
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  const handleCopyCredsOnly = () => {
    if (!generatedSlip) return;
    const text = `Username: ${generatedSlip.username}\nEmail: ${generatedSlip.email}\nPassword: ${generatedSlip.temporaryPassword}\nLogin Portal: ${generatedSlip.loginUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedCredsOnly(true);
    showToast("Login credentials copied!", "success");
    setTimeout(() => setCopiedCredsOnly(false), 2500);
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div>
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1
              className="fs-4 fw-bold text-deep-blue mb-1"
              style={{ color: "#0F3B5D" }}
            >
              Candidate Management
            </h1>
            <p className="text-secondary small mb-0">
              View registered candidate accounts, edit credentials, assign PMA
              test modules, and manage account status.
            </p>
          </div>

          <Link
            href="/admin/access"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <Plus size={16} />
            <span>Give New Candidate Credentials</span>
          </Link>
        </div>

        {/* Search Bar */}
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
                  placeholder="Search candidates by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-8 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
              <span>
                Showing {filteredCandidates.length} of {candidates.length}{" "}
                candidates
              </span>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="card border-subtle shadow-sm bg-white overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted small">
              <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
              <div>Loading candidates...</div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-5 text-center text-muted small">
              No candidate accounts found. Click "Give New Candidate
              Credentials" to issue credentials.
            </div>
          ) : (
            <>
              {/* Desktop: compact table with username + email stacked */}
              <div className="d-none d-md-block">
                <div className="table-responsive">
                  <table className="table table-pma mb-0 align-middle">
                    <thead>
                      <tr>
                        <th style={{ minWidth: "220px" }}>Candidate</th>
                        <th style={{ minWidth: "170px" }}>
                          Temporary Password
                        </th>
                        <th>Registered On</th>
                        <th>Account Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((cand) => (
                        <tr key={cand.id}>
                          <td>
                            <div className="fw-semibold text-dark">
                              {cand.name || "Candidate"}
                            </div>
                            <div className="mt-1">
                              <span
                                className="badge bg-light text-primary border font-monospace"
                                style={{ fontSize: "0.72rem" }}
                              >
                                @{cand.username || cand.email?.split("@")[0]}
                              </span>
                            </div>
                            <div
                              className="small text-muted mt-1 candidate-email-desktop"
                              title={cand.email || ""}
                            >
                              <Mail size={12} className="me-1" />
                              {cand.email || "—"}
                            </div>
                          </td>
                          <td>
                            <code className="text-dark font-monospace small bg-light px-2 py-1 rounded border">
                              {cand.temporaryPassword || "—"}
                            </code>
                          </td>
                          <td className="text-muted small">
                            {cand.createdAt
                              ? new Date(cand.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            {cand.accountStatus === "suspended" ? (
                              <span className="badge badge-revoked">
                                Suspended
                              </span>
                            ) : (
                              <span className="badge badge-active">Active</span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 py-1 px-2"
                                onClick={() => handleOpenAssignTest(cand)}
                                title="Assign PMA Test Module"
                              >
                                <BookOpen size={13} />
                                <span className="d-none d-xl-inline">
                                  Assign Test
                                </span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light border d-inline-flex align-items-center p-1 text-primary"
                                onClick={() => handleOpenEdit(cand)}
                                title="Edit Candidate Account"
                              >
                                <Edit2 size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light border d-inline-flex align-items-center p-1"
                                onClick={() => handleInspect(cand)}
                                title="View Profile & Examination History"
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  cand.accountStatus === "suspended"
                                    ? "btn-outline-success"
                                    : "btn-outline-secondary"
                                } p-1`}
                                onClick={() => handleToggleStatus(cand)}
                                title={
                                  cand.accountStatus === "suspended"
                                    ? "Reactivate Account"
                                    : "Suspend Account"
                                }
                              >
                                {cand.accountStatus === "suspended" ? (
                                  <UserCheck size={13} />
                                ) : (
                                  <UserX size={13} />
                                )}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light border text-danger p-1"
                                onClick={() => handleOpenDelete(cand)}
                                title="Delete Candidate Record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile: card layout, no horizontal scrolling */}
              <div className="d-md-none p-2">
                {filteredCandidates.map((cand) => (
                  <div key={cand.id} className="candidate-mobile-card">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div className="min-w-0 flex-grow-1">
                        <div className="fw-bold text-dark">
                          {cand.name || "Candidate"}
                        </div>

                        <div className="mt-1">
                          <span className="badge bg-light text-primary border font-monospace">
                            @{cand.username || cand.email?.split("@")[0]}
                          </span>
                        </div>

                        <div className="candidate-mobile-email">
                          <Mail size={13} className="flex-shrink-0" />
                          <span>{cand.email || "—"}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {cand.accountStatus === "suspended" ? (
                          <span className="badge badge-revoked">Suspended</span>
                        ) : (
                          <span className="badge badge-active">Active</span>
                        )}
                      </div>
                    </div>

                    <div className="candidate-mobile-details">
                      <div>
                        <span>Temporary Password</span>
                        <code>{cand.temporaryPassword || "—"}</code>
                      </div>

                      <div>
                        <span>Registered On</span>
                        <strong>
                          {cand.createdAt
                            ? new Date(cand.createdAt).toLocaleDateString()
                            : "—"}
                        </strong>
                      </div>
                    </div>

                    <div className="candidate-mobile-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleOpenAssignTest(cand)}
                      >
                        <BookOpen size={14} />
                        Assign Test
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border text-primary"
                        onClick={() => handleOpenEdit(cand)}
                        title="Edit Candidate"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={() => handleInspect(cand)}
                        title="View Profile"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${
                          cand.accountStatus === "suspended"
                            ? "btn-outline-success"
                            : "btn-light border"
                        }`}
                        onClick={() => handleToggleStatus(cand)}
                        title={
                          cand.accountStatus === "suspended"
                            ? "Reactivate Account"
                            : "Suspend Account"
                        }
                      >
                        {cand.accountStatus === "suspended" ? (
                          <UserCheck size={15} />
                        ) : (
                          <UserX size={15} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border text-danger"
                        onClick={() => handleOpenDelete(cand)}
                        title="Delete Candidate"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Inspect Profile Modal */}
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title="Candidate Profile & History"
          size="lg"
          footer={
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    setInspectModalOpen(false);
                    handleOpenAssignTest(selectedCandidate);
                  }}
                >
                  <BookOpen size={14} />
                  <span>Assign Test Module</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    setInspectModalOpen(false);
                    handleOpenEdit(selectedCandidate);
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit Account</span>
                </button>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setInspectModalOpen(false)}
              >
                Close
              </button>
            </div>
          }
        >
          {selectedCandidate && (
            <div>
              <div className="p-3 bg-light rounded border border-subtle mb-4">
                <div className="row g-2 small">
                  <div className="col-sm-6">
                    <span className="text-muted">Full Name:</span>{" "}
                    <strong className="text-dark">
                      {selectedCandidate.name || "Candidate"}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Username:</span>{" "}
                    <code className="text-primary fw-bold font-monospace">
                      @
                      {selectedCandidate.username ||
                        selectedCandidate.email?.split("@")[0]}
                    </code>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Email:</span>{" "}
                    <strong className="text-dark">
                      {selectedCandidate.email}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Temporary Password:</span>{" "}
                    <code className="text-danger fw-bold font-monospace">
                      {selectedCandidate.temporaryPassword || "—"}
                    </code>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Account Status:</span>{" "}
                    <span
                      className={`badge ${selectedCandidate.accountStatus === "suspended" ? "badge-revoked" : "badge-active"}`}
                    >
                      {selectedCandidate.accountStatus || "active"}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Registered On:</span>{" "}
                    <span className="text-dark">
                      {selectedCandidate.createdAt
                        ? new Date(selectedCandidate.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Access Grants */}
              <div className="d-flex align-items-center justify-content-between mb-2 gap-2">
                <h6 className="fw-bold text-deep-blue fs-6 mb-0">
                  Assigned Test Modules
                </h6>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1 flex-shrink-0"
                  onClick={() => handleOpenAssignTest(selectedCandidate)}
                >
                  <Plus size={12} />
                  <span>Assign Another Test</span>
                </button>
              </div>

              {loadingDetails ? (
                <div className="p-3 text-center text-muted small">
                  Loading candidate records...
                </div>
              ) : candidateGrants.length === 0 ? (
                <p className="text-muted small mb-4">
                  No active test grants assigned to this candidate.
                </p>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="d-none d-md-block mb-4">
                    <div className="table-responsive border rounded">
                      <table className="table table-sm table-striped mb-0 small align-middle">
                        <thead>
                          <tr>
                            <th>Module Title</th>
                            <th>Attempts (Used / Total)</th>
                            <th>Expiry</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidateGrants.map((g) => (
                            <tr key={g.id}>
                              <td className="fw-semibold">{g.testTitle}</td>
                              <td>
                                {g.usedAttempts || 0} of{" "}
                                {g.permittedAttempts || 1}
                              </td>
                              <td>
                                {g.expiryDate
                                  ? new Date(g.expiryDate).toLocaleDateString()
                                  : "No expiry"}
                              </td>
                              <td>
                                <span className="badge badge-sky text-capitalize">
                                  {g.computedStatus || g.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="d-md-none candidate-history-cards mb-4">
                    {candidateGrants.map((g) => (
                      <div key={g.id} className="candidate-history-card">
                        <div className="candidate-history-title">
                          {g.testTitle || "Test Module"}
                        </div>
                        <div className="candidate-history-grid">
                          <div>
                            <span>Attempts</span>
                            <strong>
                              {g.usedAttempts || 0} / {g.permittedAttempts || 1}
                            </strong>
                          </div>
                          <div>
                            <span>Expiry</span>
                            <strong>
                              {g.expiryDate
                                ? new Date(g.expiryDate).toLocaleDateString()
                                : "No expiry"}
                            </strong>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="badge badge-sky text-capitalize">
                            {g.computedStatus || g.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Candidate Examination History */}
              <h6 className="fw-bold text-deep-blue fs-6 mb-2">
                Examination Attempt History
              </h6>
              {candidateAttempts.length === 0 ? (
                <p className="text-muted small mb-0">
                  Candidate has not taken any examinations yet.
                </p>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive border rounded">
                      <table className="table table-sm table-striped mb-0 small align-middle">
                        <thead>
                          <tr>
                            <th>Module</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Date</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidateAttempts.map((a) => (
                            <tr key={a.id}>
                              <td>{a.testTitle}</td>
                              <td>
                                {a.score
                                  ? `${a.score.correct} / ${a.score.total}`
                                  : "—"}
                              </td>
                              <td>
                                {a.score ? (
                                  <strong>{a.score.percentage}%</strong>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>
                                {a.submissionTime
                                  ? new Date(
                                      a.submissionTime,
                                    ).toLocaleDateString()
                                  : "In progress"}
                              </td>
                              <td>
                                {a.score?.passed ? (
                                  <span className="badge badge-active">
                                    PASSED
                                  </span>
                                ) : (
                                  <span className="badge badge-revoked">
                                    FAILED
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="d-md-none candidate-history-cards">
                    {candidateAttempts.map((a) => (
                      <div key={a.id} className="candidate-history-card">
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <div className="candidate-history-title flex-grow-1">
                            {a.testTitle || "Examination"}
                          </div>
                          <div className="flex-shrink-0">
                            {a.score?.passed ? (
                              <span className="badge badge-active">PASSED</span>
                            ) : (
                              <span className="badge badge-revoked">
                                FAILED
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="candidate-history-grid">
                          <div>
                            <span>Score</span>
                            <strong>
                              {a.score
                                ? `${a.score.correct} / ${a.score.total}`
                                : "—"}
                            </strong>
                          </div>
                          <div>
                            <span>Percentage</span>
                            <strong>
                              {a.score ? `${a.score.percentage}%` : "—"}
                            </strong>
                          </div>
                          <div className="candidate-history-full">
                            <span>Date</span>
                            <strong>
                              {a.submissionTime
                                ? new Date(
                                    a.submissionTime,
                                  ).toLocaleDateString()
                                : "In progress"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>

        {/* Edit Candidate Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Candidate Account"
          size="md"
          footer={
            <>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Saving Changes..." : "Save Candidate"}
              </button>
            </>
          }
        >
          {editingCandidate && (
            <form onSubmit={handleSaveEdit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Full Name
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light">
                    <UserIcon size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Username
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light font-monospace small">
                    @
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Email Address
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    className="btn btn-xs btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "0.74rem" }}
                    onClick={() => setEditPassword(generateNewPassword())}
                  >
                    <RefreshCw size={11} />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light">
                    <Key size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace fw-bold"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary">
                  Account Status
                </label>
                <select
                  className="form-select form-select-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="active">Active (Permitted to test)</option>
                  <option value="suspended">
                    Suspended (Blocked from testing)
                  </option>
                </select>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Candidate Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Candidate Record"
          footer={
            <>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Permanently Delete Candidate"}
              </button>
            </>
          }
        >
          {deletingCandidate && (
            <div>
              <div className="d-flex align-items-center gap-3 p-3 bg-danger bg-opacity-10 text-danger rounded border border-danger border-opacity-25 mb-3">
                <AlertTriangle size={32} className="flex-shrink-0" />
                <div className="small">
                  <strong>Warning:</strong> You are about to permanently delete
                  candidate{" "}
                  <strong>
                    {deletingCandidate.name || deletingCandidate.email}
                  </strong>
                  .
                </div>
              </div>
              <p className="small text-secondary mb-2">
                Deleting this candidate will permanently remove:
              </p>
              <ul className="small text-secondary mb-3 ps-3">
                <li>Candidate login profile and temporary credentials</li>
                <li>All authorized PMA mock test access grants</li>
                <li>
                  All completed and in-progress examination attempts and scores
                </li>
              </ul>
              <p className="small text-danger fw-semibold mb-0">
                This action cannot be undone. Are you sure you wish to proceed?
              </p>
            </div>
          )}
        </Modal>

        {/* Assign Test Modal */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title="Assign PMA Test Module"
          size="md"
          footer={
            <>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setAssignModalOpen(false)}
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleConfirmAssignTest}
                disabled={assigning}
              >
                {assigning ? "Assigning Module..." : "Assign & Generate Slip"}
              </button>
            </>
          }
        >
          {assigningCandidate && (
            <form onSubmit={handleConfirmAssignTest}>
              <div className="p-3 bg-light rounded border border-subtle mb-3 small">
                <div>
                  <strong>Candidate:</strong>{" "}
                  {assigningCandidate.name || assigningCandidate.email}
                </div>
                <div>
                  <strong>Username:</strong> @
                  {assigningCandidate.username ||
                    assigningCandidate.email?.split("@")[0]}
                </div>
                <div>
                  <strong>Email:</strong> {assigningCandidate.email}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Select Examination Module
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  required
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.durationMinutes || 30} mins •{" "}
                      {t.questionCount || 84} MCQs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Permitted Attempts
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min={1}
                    max={10}
                    value={assignAttempts}
                    onChange={(e) => setAssignAttempts(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min={1}
                    max={90}
                    value={assignExpiryDays}
                    onChange={(e) => setAssignExpiryDays(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. JazzCash TID #849182 / Rs. 1500"
                    value={assignPaymentRef}
                    onChange={(e) => setAssignPaymentRef(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Internal Note (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Batch 152 PMA"
                    value={assignInternalNote}
                    onChange={(e) => setAssignInternalNote(e.target.value)}
                  />
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* Generated WhatsApp Slip Modal */}
        <Modal
          isOpen={slipModalOpen}
          onClose={() => setSlipModalOpen(false)}
          title="Candidate Credentials Slip"
          size="md"
          footer={
            <>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setSlipModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                onClick={handleCopyCredsOnly}
              >
                {copiedCredsOnly ? <Check size={14} /> : <Copy size={14} />}
                <span>Copy Login Only</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                onClick={handleCopyWhatsApp}
              >
                {copiedSlip ? <Check size={14} /> : <Send size={14} />}
                <span>{copiedSlip ? "Copied!" : "Copy WhatsApp Slip"}</span>
              </button>
            </>
          }
        >
          {generatedSlip && (
            <div>
              <div className="card bg-light border-subtle p-3 mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge badge-sky">
                    MTacademy PMA Credentials
                  </span>
                  <span className="small text-muted">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Candidate:</span>
                    <strong className="text-dark">{generatedSlip.name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Assigned Test:</span>
                    <strong className="text-dark">
                      {generatedSlip.testTitle}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Username:</span>
                    <code className="text-primary fw-bold font-monospace">
                      @{generatedSlip.username}
                    </code>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">
                      Temporary Password:
                    </span>
                    <code className="text-danger fw-bold font-monospace">
                      {generatedSlip.temporaryPassword}
                    </code>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block">Login Portal:</span>
                    <a
                      href={generatedSlip.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-decoration-none small fw-semibold"
                    >
                      {generatedSlip.loginUrl}
                    </a>
                  </div>
                </div>
              </div>

              <label className="form-label small fw-semibold text-secondary mb-1">
                WhatsApp Formatted Message Preview:
              </label>
              <div className="p-3 bg-white rounded border border-subtle mb-2">
                <pre
                  className="small mb-0 text-dark font-monospace"
                  style={{
                    whiteSpace: "pre-wrap",
                    maxHeight: "200px",
                    overflowY: "auto",
                    fontSize: "0.78rem",
                  }}
                >
                  {generatedSlip.whatsappMessage}
                </pre>
              </div>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Click "Copy WhatsApp Slip" to paste directly into your WhatsApp
                chat with the candidate.
              </small>
            </div>
          )}
        </Modal>
      </div>

      <style jsx>{`
        .candidate-email-desktop {
          display: flex;
          align-items: center;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .candidate-mobile-card {
          background: #ffffff;
          border: 1px solid #dceaf3;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(15, 59, 93, 0.04);
        }

        .candidate-mobile-card:last-child {
          margin-bottom: 0;
        }

        .candidate-mobile-email {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 0.78rem;
          margin-top: 7px;
          min-width: 0;
        }

        .candidate-mobile-email span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .candidate-mobile-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #e6f0f6;
          border-bottom: 1px solid #e6f0f6;
        }

        .candidate-mobile-details > div {
          min-width: 0;
        }

        .candidate-mobile-details span,
        .candidate-history-grid span {
          display: block;
          color: #94a3b8;
          font-size: 0.69rem;
          margin-bottom: 4px;
        }

        .candidate-mobile-details strong,
        .candidate-history-grid strong {
          display: block;
          color: #334155;
          font-size: 0.79rem;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .candidate-mobile-details code {
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #334155;
          background: #f5f9fc;
          border: 1px solid #dceaf3;
          border-radius: 5px;
          padding: 3px 7px;
          font-size: 0.76rem;
        }

        .candidate-mobile-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }

        .candidate-mobile-actions .btn {
          min-height: 34px;
        }

        .candidate-history-card {
          background: #ffffff;
          border: 1px solid #dceaf3;
          border-radius: 10px;
          padding: 13px;
          margin-bottom: 9px;
        }

        .candidate-history-card:last-child {
          margin-bottom: 0;
        }

        .candidate-history-title {
          color: #0f3b5d;
          font-weight: 700;
          font-size: 0.82rem;
          overflow-wrap: anywhere;
        }

        .candidate-history-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 9px;
        }

        .candidate-history-full {
          grid-column: 1 / -1;
        }

        @media (max-width: 575.98px) {
          .candidate-mobile-card {
            padding: 14px;
            border-radius: 10px;
          }

          .candidate-mobile-actions {
            gap: 5px;
          }

          .candidate-mobile-actions .btn {
            padding: 6px 8px;
          }

          .candidate-mobile-actions .btn-primary {
            font-size: 0.78rem;
          }
        }
      `}</style>
    </>
  );
}
