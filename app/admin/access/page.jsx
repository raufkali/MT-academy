"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getAllAccessGrants,
  updateAccessGrantStatus,
  extendAccessGrant,
  getTests,
  getAllCandidates,
} from "../../../lib/firestore";
import { createTemporaryCandidateAccount } from "../../../lib/auth";
import {
  Plus,
  Copy,
  Check,
  Search,
  RotateCcw,
  ShieldAlert,
  User,
  Users,
  UserPlus,
  Mail,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

function AccessManagementContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [grants, setGrants] = useState([]);
  const [tests, setTests] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Give Credentials Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isExistingCandidate, setIsExistingCandidate] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateUsername, setCandidateUsername] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");
  const [permittedAttempts, setPermittedAttempts] = useState(1);
  const [expiryDays, setExpiryDays] = useState(14);
  const [paymentRef, setPaymentRef] = useState("JazzCash / Easypaisa Manual");
  const [internalNote, setInternalNote] = useState("");
  const [creating, setCreating] = useState(false);

  // Generated Details Display Modal (WhatsApp Credentials Slip)
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCredsOnly, setCopiedCredsOnly] = useState(false);

  // Track password visibility in table: { [grantId]: boolean }
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Extend Modal
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedGrantForExtend, setSelectedGrantForExtend] = useState(null);
  const [extraAttempts, setExtraAttempts] = useState(1);
  const [newExpiryDate, setNewExpiryDate] = useState("");

  const generateNewPassword = () => {
    return "MTA" + Math.floor(1000 + Math.random() * 9000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [gData, tData, cData] = await Promise.all([
        getAllAccessGrants(),
        getTests(false),
        getAllCandidates(),
      ]);
      setGrants(gData);
      setTests(tData);
      setCandidates(cData);
      if (tData.length > 0 && !selectedTestId) {
        setSelectedTestId(tData[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading candidate credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check URL query parameter for pre-selecting candidate
  useEffect(() => {
    const candidateIdParam = searchParams.get("candidateId");
    if (candidateIdParam && candidates.length > 0) {
      const found = candidates.find((c) => c.id === candidateIdParam);
      if (found) {
        setIsExistingCandidate(true);
        setSelectedCandidateId(found.id);
        setCandidateName(found.name || "");
        setCandidateUsername(
          found.username || found.email?.split("@")[0] || "",
        );
        setCandidateEmail(found.email || "");
        setTemporaryPassword(found.temporaryPassword || generateNewPassword());
        setPermittedAttempts(1);
        setExpiryDays(14);
        setPaymentRef("JazzCash / Easypaisa Manual");
        setInternalNote("");
        setCreateModalOpen(true);
      }
    }
  }, [searchParams, candidates]);

  const handleOpenCreate = () => {
    setIsExistingCandidate(false);
    setSelectedCandidateId("");
    setCandidateName("");
    setCandidateUsername("");
    setCandidateEmail("");
    setTemporaryPassword(generateNewPassword());
    setPermittedAttempts(1);
    setExpiryDays(14);
    setPaymentRef("JazzCash / Easypaisa Manual");
    setInternalNote("");
    setCreateModalOpen(true);
  };

  const handleCandidateSelect = (candId) => {
    setSelectedCandidateId(candId);
    const found = candidates.find((c) => c.id === candId);
    if (found) {
      setCandidateName(found.name || "");
      setCandidateUsername(found.username || found.email?.split("@")[0] || "");
      setCandidateEmail(found.email || "");
      setTemporaryPassword(found.temporaryPassword || generateNewPassword());
    }
  };

  const handleNameChange = (val) => {
    setCandidateName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 16);
    if (!candidateUsername || candidateUsername.startsWith("pma_")) {
      setCandidateUsername(slug ? `pma_${slug}` : "");
    }
  };

  const handleCreateAccess = async (e) => {
    e.preventDefault();
    if (!selectedTestId) {
      showToast("Please select an examination module.", "warning");
      return;
    }
    const chosenTest = tests.find((t) => t.id === selectedTestId);
    const expiryDate = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    setCreating(true);
    try {
      const result = await createTemporaryCandidateAccount(
        {
          name: candidateName,
          username: candidateUsername,
          email: candidateEmail,
          temporaryPassword,
          testId: chosenTest.id,
          testTitle: chosenTest.title,
          permittedAttempts,
          expiryDate,
          paymentRef,
          internalNote,
        },
        user,
      );

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const loginUrl = `${origin}/login`;

      const whatsappMessage =
        `*🇵🇰 MTACADEMY — PMA MOCK TEST LOGIN CREDENTIALS*\n\n` +
        `Dear Candidate *${result.name}*,\n` +
        `Your examination access has been authorized. Below are your official candidate credentials:\n\n` +
        `🔗 *Login Portal:* ${loginUrl}\n` +
        `👤 *Username:* \`${result.username}\`\n` +
        `📧 *Email:* \`${result.email}\`\n` +
        `🔑 *Temporary Password:* \`${result.temporaryPassword}\`\n\n` +
        `📝 *Assigned Test:* ${chosenTest.title}\n` +
        `⏱️ *Duration:* ${chosenTest.durationMinutes || 30} Minutes | ${chosenTest.questionCount || 84} MCQs\n` +
        `🎯 *Attempts Allowed:* ${permittedAttempts}\n` +
        `📅 *Valid Until:* ${new Date(expiryDate).toLocaleDateString()}\n\n` +
        `*How to Start Your Examination:*\n` +
        `1. Open the portal: ${loginUrl}\n` +
        `2. Enter your username or email along with your temporary password.\n` +
        `3. Your test is unlocked and ready on your candidate dashboard. Best of luck!`;

      setGeneratedResult({
        name: result.name,
        username: result.username,
        email: result.email,
        temporaryPassword: result.temporaryPassword,
        testTitle: chosenTest.title,
        durationMinutes: chosenTest.durationMinutes || 30,
        questionCount: chosenTest.questionCount || 84,
        permittedAttempts,
        expiryDate,
        loginUrl,
        whatsappMessage,
      });

      showToast("Candidate credentials issued successfully!", "success");
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(
        err.message || "Failed to issue candidate credentials.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCopyWhatsApp = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.whatsappMessage);
    setCopied(true);
    showToast("WhatsApp credentials message copied!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCredsOnly = () => {
    if (!generatedResult) return;
    const text = `Username: ${generatedResult.username}\nEmail: ${generatedResult.email}\nPassword: ${generatedResult.temporaryPassword}\nLogin Portal: ${generatedResult.loginUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedCredsOnly(true);
    showToast("Username and password copied!", "success");
    setTimeout(() => setCopiedCredsOnly(false), 2500);
  };

  const handleOpenSlip = (grant) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const loginUrl = `${origin}/login`;
    const tempPass = grant.temporaryPassword || "Contact Admin";
    const uName =
      grant.candidateUsername ||
      grant.candidateEmail?.split("@")[0] ||
      "candidate";

    const whatsappMessage =
      `*🇵🇰 MTACADEMY — PMA MOCK TEST LOGIN CREDENTIALS*\n\n` +
      `Dear Candidate *${grant.candidateName || uName}*,\n` +
      `Below are your official candidate credentials for your PMA examination on MTacademy:\n\n` +
      `🔗 *Login Portal:* ${loginUrl}\n` +
      `👤 *Username:* \`${uName}\`\n` +
      `📧 *Email:* \`${grant.candidateEmail}\`\n` +
      `🔑 *Temporary Password:* \`${tempPass}\`\n\n` +
      `📝 *Assigned Test:* ${grant.testTitle}\n` +
      `🎯 *Attempts Allowed:* ${grant.permittedAttempts || 1} (Used: ${grant.usedAttempts || 0})\n` +
      `📅 *Valid Until:* ${grant.expiryDate ? new Date(grant.expiryDate).toLocaleDateString() : "Active"}\n\n` +
      `*How to Start Your Test:*\n` +
      `1. Open: ${loginUrl}\n` +
      `2. Sign in with your username/email and temporary password.\n` +
      `3. Launch your examination from the dashboard.`;

    setGeneratedResult({
      name: grant.candidateName || uName,
      username: uName,
      email: grant.candidateEmail,
      temporaryPassword: tempPass,
      testTitle: grant.testTitle,
      permittedAttempts: grant.permittedAttempts || 1,
      expiryDate: grant.expiryDate,
      loginUrl,
      whatsappMessage,
    });
  };

  const togglePasswordVisibility = (id) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRevoke = async (grantId) => {
    if (
      !confirm(
        "Are you sure you want to revoke this candidate's examination access?",
      )
    )
      return;
    try {
      await updateAccessGrantStatus(grantId, "revoked", user);
      showToast("Access grant revoked.", "warning");
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to revoke access.", "error");
    }
  };

  const handleOpenExtend = (grant) => {
    setSelectedGrantForExtend(grant);
    setExtraAttempts(1);
    setNewExpiryDate("");
    setExtendModalOpen(true);
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrantForExtend) return;
    try {
      await extendAccessGrant(
        selectedGrantForExtend.id,
        Number(extraAttempts) || 0,
        newExpiryDate ? new Date(newExpiryDate).toISOString() : null,
        user,
      );
      showToast("Access extended successfully!", "success");
      setExtendModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to extend access.", "error");
    }
  };

  // Filtered records
  const filteredGrants = grants.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (g.candidateEmail && g.candidateEmail.toLowerCase().includes(q)) ||
      (g.candidateUsername && g.candidateUsername.toLowerCase().includes(q)) ||
      (g.candidateName && g.candidateName.toLowerCase().includes(q)) ||
      (g.testTitle && g.testTitle.toLowerCase().includes(q)) ||
      (g.paymentRef && g.paymentRef.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" || g.computedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (grant) => {
    switch (grant.computedStatus) {
      case "active":
        return <span className="badge badge-active">Active</span>;
      case "exhausted":
        return <span className="badge badge-expired">Exhausted</span>;
      case "expired":
        return <span className="badge badge-expired">Expired</span>;
      case "revoked":
        return <span className="badge badge-revoked">Revoked</span>;
      default:
        return (
          <span className="badge bg-secondary">{grant.computedStatus}</span>
        );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="fs-4 fw-bold text-deep-blue mb-1"
            style={{ color: "#0F3B5D" }}
          >
            Candidate Credentials & Access
          </h1>
          <p className="text-secondary small mb-0">
            Give candidates direct login credentials (username, email &
            temporary password) to access PMA mock examinations. No tokens or
            redemption links.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          <span>Give Candidate Credentials</span>
        </button>
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
                placeholder="Search by username, name, email or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="exhausted">Exhausted</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div className="col-12 col-md-3 col-lg-6 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
            <span>
              Showing {filteredGrants.length} of {grants.length} credential
              records
            </span>
          </div>
        </div>
      </div>

      {/* Access Grants List */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div
              className="spinner-border spinner-border-sm text-primary mb-2"
              role="status"
            ></div>
            <div>Loading candidate credentials...</div>
          </div>
        ) : filteredGrants.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No candidate credential records match your filter criteria. Click
            "Give Candidate Credentials" to issue login details.
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-pma mb-0">
                  <thead>
                    <tr>
                      <th>Candidate (Username & Email)</th>
                      <th>Temporary Password</th>
                      <th>Assigned Test</th>
                      <th>Attempts (Used / Total)</th>
                      <th>Access Expiry</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrants.map((grant) => {
                      const used = grant.usedAttempts || 0;
                      const permitted = grant.permittedAttempts || 1;
                      const isRevealed = Boolean(revealedPasswords[grant.id]);
                      const pass = grant.temporaryPassword || "—";

                      return (
                        <tr key={grant.id}>
                          <td>
                            <div className="fw-semibold text-dark mb-1">
                              {grant.candidateName || grant.candidateEmail}
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              {grant.candidateUsername && (
                                <span
                                  className="badge bg-light text-primary border font-monospace"
                                  style={{ fontSize: "0.72rem" }}
                                >
                                  @{grant.candidateUsername}
                                </span>
                              )}
                              <small className="text-muted">
                                {grant.candidateEmail}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="d-inline-flex align-items-center gap-1 bg-light px-2 py-1 rounded border border-subtle">
                              <span className="font-monospace small fw-bold text-dark">
                                {isRevealed ? pass : "••••••••"}
                              </span>
                              <button
                                type="button"
                                className="btn btn-xs text-muted p-0 ms-1"
                                onClick={() =>
                                  togglePasswordVisibility(grant.id)
                                }
                                title={
                                  isRevealed
                                    ? "Hide password"
                                    : "Reveal password"
                                }
                              >
                                {isRevealed ? (
                                  <EyeOff size={13} />
                                ) : (
                                  <Eye size={13} />
                                )}
                              </button>
                              {grant.temporaryPassword && (
                                <button
                                  type="button"
                                  className="btn btn-xs text-muted p-0 ms-1"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      grant.temporaryPassword,
                                    );
                                    showToast(
                                      "Password copied to clipboard!",
                                      "success",
                                    );
                                  }}
                                  title="Copy password"
                                >
                                  <Copy size={12} />
                                </button>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="fw-medium text-dark">
                              {grant.testTitle}
                            </span>
                          </td>

                          <td>
                            <span className="fw-bold text-dark">{used}</span> /{" "}
                            {permitted} used
                          </td>

                          <td className="text-muted small">
                            {grant.expiryDate
                              ? new Date(grant.expiryDate).toLocaleDateString()
                              : "No expiry"}
                          </td>

                          <td>{renderStatusBadge(grant)}</td>

                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 py-1 px-2"
                                onClick={() => handleOpenSlip(grant)}
                                title="View & copy WhatsApp credentials slip"
                              >
                                <Send size={12} />
                                <span>WhatsApp Slip</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 py-1 px-2"
                                onClick={() => handleOpenExtend(grant)}
                                title="Extend attempts or change expiry"
                              >
                                <RotateCcw size={12} />
                                <span>Extend</span>
                              </button>

                              {grant.computedStatus !== "revoked" && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border text-danger d-inline-flex align-items-center p-1"
                                  onClick={() => handleRevoke(grant.id)}
                                  title="Revoke access"
                                >
                                  <ShieldAlert size={14} />
                                </button>
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

            {/* Mobile: card layout */}
            <div className="d-md-none p-2">
              {filteredGrants.map((grant) => {
                const used = grant.usedAttempts || 0;
                const permitted = grant.permittedAttempts || 1;
                const isRevealed = Boolean(revealedPasswords[grant.id]);
                const pass = grant.temporaryPassword || "—";

                return (
                  <div key={grant.id} className="grant-mobile-card">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <div className="min-w-0 flex-grow-1">
                        <div className="fw-bold text-dark text-truncate">
                          {grant.candidateName || grant.candidateEmail}
                        </div>

                        {grant.candidateUsername && (
                          <div className="mt-1">
                            <span
                              className="badge bg-light text-primary border font-monospace"
                              style={{ fontSize: "0.72rem" }}
                            >
                              @{grant.candidateUsername}
                            </span>
                          </div>
                        )}

                        <div className="grant-mobile-email">
                          <Mail size={13} className="flex-shrink-0" />
                          <span>{grant.candidateEmail || "—"}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {renderStatusBadge(grant)}
                      </div>
                    </div>

                    <div className="grant-mobile-test">
                      <span>Assigned Test</span>
                      <strong>{grant.testTitle || "—"}</strong>
                    </div>

                    <div className="grant-mobile-details">
                      <div>
                        <span>Attempts</span>
                        <strong>
                          {used} / {permitted} used
                        </strong>
                      </div>
                      <div>
                        <span>Expiry</span>
                        <strong>
                          {grant.expiryDate
                            ? new Date(grant.expiryDate).toLocaleDateString()
                            : "No expiry"}
                        </strong>
                      </div>
                      <div className="grant-mobile-full">
                        <span>Temporary Password</span>
                        <div className="grant-mobile-pass">
                          <code>{isRevealed ? pass : "••••••••"}</code>
                          <button
                            type="button"
                            className="btn btn-xs text-muted p-0"
                            onClick={() => togglePasswordVisibility(grant.id)}
                            title={
                              isRevealed ? "Hide password" : "Reveal password"
                            }
                          >
                            {isRevealed ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                          {grant.temporaryPassword && (
                            <button
                              type="button"
                              className="btn btn-xs text-muted p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  grant.temporaryPassword,
                                );
                                showToast(
                                  "Password copied to clipboard!",
                                  "success",
                                );
                              }}
                              title="Copy password"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grant-mobile-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-success flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleOpenSlip(grant)}
                      >
                        <Send size={14} />
                        WhatsApp Slip
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border d-inline-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleOpenExtend(grant)}
                      >
                        <RotateCcw size={14} />
                        Extend
                      </button>

                      {grant.computedStatus !== "revoked" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-danger"
                          onClick={() => handleRevoke(grant.id)}
                          title="Revoke access"
                        >
                          <ShieldAlert size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Give Credentials Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Give Candidate Credentials & Access"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCreateAccess}
              disabled={creating}
            >
              {creating ? "Issuing Credentials..." : "Save & Give Credentials"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAccess}>
          {/* Candidate Mode Toggle: New vs Existing */}
          <div className="btn-group w-100 mb-3" role="group">
            <button
              type="button"
              className={`btn btn-sm ${!isExistingCandidate ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setIsExistingCandidate(false);
                setSelectedCandidateId("");
                setCandidateName("");
                setCandidateUsername("");
                setCandidateEmail("");
                setTemporaryPassword(generateNewPassword());
              }}
            >
              <UserPlus size={14} className="me-1" />
              New Candidate Account
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isExistingCandidate ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setIsExistingCandidate(true);
                if (candidates.length > 0 && !selectedCandidateId) {
                  handleCandidateSelect(candidates[0].id);
                }
              }}
            >
              <Users size={14} className="me-1" />
              Existing Candidate ({candidates.length})
            </button>
          </div>

          {/* Existing Candidate Dropdown */}
          {isExistingCandidate ? (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Select Registered Candidate
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedCandidateId}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Candidate --</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "Candidate"} (
                    {c.username ? `@${c.username}` : c.email})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Candidate Name & Username */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Candidate Full Name
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Muhammad Ali"
                  value={candidateName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Login Username{" "}
                <span className="text-muted fw-normal">
                  (candidate enters this to log in)
                </span>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light font-monospace small">
                  @
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  placeholder="e.g. pma_ali"
                  value={candidateUsername}
                  onChange={(e) =>
                    setCandidateUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Candidate Email & Temporary Password */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Email Address{" "}
                <span className="text-muted fw-normal">
                  (Optional or student email)
                </span>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder={
                    candidateUsername
                      ? `${candidateUsername}@mtacademy.com`
                      : "student@example.com"
                  }
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                />
              </div>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                Defaults automatically to @mtacademy.com format if left blank.
              </small>
            </div>

            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">
                  Temporary Password
                </label>
                <button
                  type="button"
                  className="btn btn-xs btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: "0.74rem" }}
                  onClick={() => setTemporaryPassword(generateNewPassword())}
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
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Test Module Select */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Assigned PMA Test Module
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

          {/* Attempts and Expiry */}
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
                value={permittedAttempts}
                onChange={(e) => setPermittedAttempts(e.target.value)}
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
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Ref and Internal Note */}
          <div className="row g-2 mb-2">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Payment Reference
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. JazzCash TID #948201 / Rs. 1500"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Internal Note (Optional)
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. WhatsApp candidate batch 152"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Generated WhatsApp Credentials Slip Modal */}
      <Modal
        isOpen={Boolean(generatedResult)}
        onClose={() => setGeneratedResult(null)}
        title="Candidate Credentials Slip"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setGeneratedResult(null)}
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
              {copied ? <Check size={14} /> : <Send size={14} />}
              <span>{copied ? "Copied!" : "Copy WhatsApp Slip"}</span>
            </button>
          </>
        }
      >
        {generatedResult && (
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
                  <strong className="text-dark">{generatedResult.name}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Assigned Test:</span>
                  <strong className="text-dark">
                    {generatedResult.testTitle}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Username:</span>
                  <code className="text-primary fw-bold font-monospace">
                    @{generatedResult.username}
                  </code>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">
                    Temporary Password:
                  </span>
                  <code className="text-danger fw-bold font-monospace">
                    {generatedResult.temporaryPassword}
                  </code>
                </div>
                <div className="col-12">
                  <span className="text-muted d-block">Login Portal:</span>
                  <a
                    href={generatedResult.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none small fw-semibold"
                  >
                    {generatedResult.loginUrl}
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
                {generatedResult.whatsappMessage}
              </pre>
            </div>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Click "Copy WhatsApp Slip" to paste directly into your WhatsApp
              chat with the candidate.
            </small>
          </div>
        )}
      </Modal>

      {/* Extend Access Modal */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Extend Candidate Test Access"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => setExtendModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleExtendSubmit}
            >
              Save Extension
            </button>
          </>
        }
      >
        {selectedGrantForExtend && (
          <form onSubmit={handleExtendSubmit}>
            <p className="small text-secondary mb-3">
              Extend access for{" "}
              <strong>
                {selectedGrantForExtend.candidateName ||
                  selectedGrantForExtend.candidateEmail}
              </strong>{" "}
              on <strong>{selectedGrantForExtend.testTitle}</strong>.
            </p>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Add Extra Attempts
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                min={0}
                max={10}
                value={extraAttempts}
                onChange={(e) => setExtraAttempts(e.target.value)}
              />
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Current attempts: {selectedGrantForExtend.usedAttempts || 0} of{" "}
                {selectedGrantForExtend.permittedAttempts || 1}
              </small>
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary">
                New Expiry Date (Optional)
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

      <style jsx>{`
        .grant-mobile-card {
          background: #ffffff;
          border: 1px solid #dceaf3;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(15, 59, 93, 0.04);
        }

        .grant-mobile-card:last-child {
          margin-bottom: 0;
        }

        .grant-mobile-email {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 0.78rem;
          margin-top: 7px;
          min-width: 0;
        }

        .grant-mobile-email span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .grant-mobile-test {
          padding: 10px 0;
          border-top: 1px solid #e6f0f6;
        }

        .grant-mobile-test span {
          display: block;
          color: #94a3b8;
          font-size: 0.69rem;
          margin-bottom: 4px;
        }

        .grant-mobile-test strong {
          display: block;
          color: #0f3b5d;
          font-size: 0.82rem;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .grant-mobile-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #e6f0f6;
          border-bottom: 1px solid #e6f0f6;
        }

        .grant-mobile-details > div {
          min-width: 0;
        }

        .grant-mobile-details span {
          display: block;
          color: #94a3b8;
          font-size: 0.69rem;
          margin-bottom: 4px;
        }

        .grant-mobile-details strong {
          display: block;
          color: #334155;
          font-size: 0.79rem;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .grant-mobile-full {
          grid-column: 1 / -1;
        }

        .grant-mobile-pass {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .grant-mobile-pass code {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #334155;
          background: #f5f9fc;
          border: 1px solid #dceaf3;
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 0.78rem;
        }

        .grant-mobile-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }

        .grant-mobile-actions .btn {
          min-height: 34px;
        }

        @media (max-width: 575.98px) {
          .grant-mobile-card {
            padding: 14px;
            border-radius: 10px;
          }

          .grant-mobile-actions {
            gap: 5px;
          }

          .grant-mobile-actions .btn {
            padding: 6px 8px;
            font-size: 0.78rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function AccessManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-5 text-center text-muted small">
          <div
            className="spinner-border spinner-border-sm text-primary mb-2"
            role="status"
          ></div>
          <div>Loading credentials manager...</div>
        </div>
      }
    >
      <AccessManagementContent />
    </Suspense>
  );
}
