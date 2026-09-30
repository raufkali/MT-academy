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
  deleteAccessGrant,
  deleteMultipleAccessGrants,
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
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";

/* ============================================================
   THEME — navy + white ONLY. No other hues.
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

/* ============================================================
   STATUS BADGE — flat, monochrome
   ============================================================ */
function StatusBadge({ status }) {
  const map = {
    active: { label: "Active", variant: "navy" },
    exhausted: { label: "Exhausted", variant: "muted" },
    expired: { label: "Expired", variant: "muted" },
    revoked: { label: "Revoked", variant: "muted" },
  };
  const { label, variant } = map[status] || {
    label: status || "Unknown",
    variant: "muted",
  };

  const bg = variant === "navy" ? colors.navy : colors.surfaceAlt;
  const fg = variant === "navy" ? colors.white : colors.navy;

  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 8px",
        borderRadius: 0,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

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

  /* ---- Give Credentials Modal ---- */
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

  /* ---- Credentials Slip Modal ---- */
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCredsOnly, setCopiedCredsOnly] = useState(false);

  /* ---- Password Reveal Map ---- */
  const [revealedPasswords, setRevealedPasswords] = useState({});

  /* ---- Extend Modal ---- */
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedGrantForExtend, setSelectedGrantForExtend] = useState(null);
  const [extraAttempts, setExtraAttempts] = useState(1);
  const [newExpiryDate, setNewExpiryDate] = useState("");

  /* ---- Delete ---- */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGrant, setDeletingGrant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Bulk Delete ---- */
  const [selectedGrantIds, setSelectedGrantIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const generateNewPassword = () =>
    "MTA" + Math.floor(1000 + Math.random() * 9000);

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
        `*MTACADEMY — PMA MOCK TEST LOGIN CREDENTIALS*\n\n` +
        `Dear Candidate *${result.name}*,\n` +
        `Your examination access has been authorized. Below are your official candidate credentials:\n\n` +
        `Login Portal: ${loginUrl}\n` +
        `Username: \`${result.username}\`\n` +
        `Email: \`${result.email}\`\n` +
        `Temporary Password: \`${result.temporaryPassword}\`\n\n` +
        `Assigned Test: ${chosenTest.title}\n` +
        `Duration: ${chosenTest.durationMinutes || 30} Minutes | ${chosenTest.questionCount || 84} MCQs\n` +
        `Attempts Allowed: ${permittedAttempts}\n` +
        `Valid Until: ${new Date(expiryDate).toLocaleDateString()}\n\n` +
        `How to Start Your Examination:\n` +
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
      `*MTACADEMY — PMA MOCK TEST LOGIN CREDENTIALS*\n\n` +
      `Dear Candidate *${grant.candidateName || uName}*,\n` +
      `Below are your official candidate credentials for your PMA examination on MTacademy:\n\n` +
      `Login Portal: ${loginUrl}\n` +
      `Username: \`${uName}\`\n` +
      `Email: \`${grant.candidateEmail}\`\n` +
      `Temporary Password: \`${tempPass}\`\n\n` +
      `Assigned Test: ${grant.testTitle}\n` +
      `Attempts Allowed: ${grant.permittedAttempts || 1} (Used: ${grant.usedAttempts || 0})\n` +
      `Valid Until: ${grant.expiryDate ? new Date(grant.expiryDate).toLocaleDateString() : "Active"}\n\n` +
      `How to Start Your Test:\n` +
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
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const handleDeleteClick = (grant) => {
    setDeletingGrant(grant);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingGrant) return;
    setDeleting(true);
    try {
      await deleteAccessGrant(deletingGrant.id, user);
      showToast("Candidate access record deleted successfully.", "success");
      setDeleteModalOpen(false);
      setDeletingGrant(null);
      setSelectedGrantIds((prev) =>
        prev.filter((id) => id !== deletingGrant.id),
      );
      loadData();
    } catch (err) {
      console.error("Delete grant error:", err);
      showToast("Failed to delete candidate access record.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (filteredGrants.length === 0) return;
    if (selectedGrantIds.length === filteredGrants.length) {
      setSelectedGrantIds([]);
    } else {
      setSelectedGrantIds(filteredGrants.map((g) => g.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedGrantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedGrantIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await deleteMultipleAccessGrants(selectedGrantIds, user);
      showToast(
        `${selectedGrantIds.length} candidate access records deleted.`,
        "success",
      );
      setBulkDeleteModalOpen(false);
      setSelectedGrantIds([]);
      loadData();
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast("Failed to delete selected access records.", "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  /* ---- Filtered records ---- */
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

  const allSelected =
    filteredGrants.length > 0 &&
    selectedGrantIds.length === filteredGrants.length;

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="mb-1"
            style={{
              color: colors.navy,
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Candidate Credentials &amp; Access
          </h1>
          <p
            className="mb-0"
            style={{
              color: colors.muted,
              fontSize: "0.875rem",
              maxWidth: "720px",
            }}
          >
            Issue candidates direct login credentials — username, email and
            temporary password — for PMA mock examinations. No tokens or
            redemption links required.
          </p>
        </div>

        <button
          type="button"
          className="btn d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
          style={{
            background: colors.navy,
            color: colors.white,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontWeight: 600,
            fontSize: "0.85rem",
            padding: "10px 18px",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={16} strokeWidth={2.2} />
          Give Candidate Credentials
        </button>
      </div>

      {/* ============================================================
          FILTER / SEARCH BAR
          ============================================================ */}
      <div
        className="p-3 mb-4"
        style={{ background: colors.white, borderRadius: 0 }}
      >
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="input-group">
              <span
                className="input-group-text d-flex align-items-center"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.divider}`,
                  borderRight: 0,
                  color: colors.navy,
                  borderRadius: 0,
                }}
              >
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by username, name, email or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: `1px solid ${colors.divider}`,
                  borderRadius: 0,
                  fontSize: "0.875rem",
                  color: colors.navy,
                }}
              />
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: `1px solid ${colors.divider}`,
                borderRadius: 0,
                fontSize: "0.875rem",
                color: colors.navy,
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="exhausted">Exhausted</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-5 text-md-end">
            <span
              style={{
                color: colors.muted,
                fontSize: "0.8rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              Showing{" "}
              <strong style={{ color: colors.navy }}>
                {filteredGrants.length}
              </strong>{" "}
              of <strong style={{ color: colors.navy }}>{grants.length}</strong>{" "}
              records
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          BATCH ACTION TOOLBAR
          ============================================================ */}
      {selectedGrantIds.length > 0 && (
        <div
          className="d-flex align-items-center justify-content-between py-2 px-3 mb-3"
          style={{
            background: colors.navy,
            color: colors.white,
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center"
              style={{
                background: colors.white,
                color: colors.navy,
                fontWeight: 700,
                fontSize: "0.75rem",
                minWidth: "24px",
                height: "24px",
                padding: "0 6px",
              }}
            >
              {selectedGrantIds.length}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              candidate access record
              {selectedGrantIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setSelectedGrantIds([])}
              style={{
                background: "transparent",
                color: colors.white,
                border: `1px solid rgba(255,255,255,0.4)`,
                borderRadius: 0,
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "5px 12px",
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => setBulkDeleteModalOpen(true)}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.white}`,
                borderRadius: 0,
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "5px 12px",
              }}
            >
              <Trash2 size={13} />
              Delete Selected ({selectedGrantIds.length})
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          ACCESS GRANTS LIST
          ============================================================ */}
      <div style={{ background: colors.white, borderRadius: 0 }}>
        {loading ? (
          <div className="p-5 text-center">
            <div
              className="spinner-border mb-2"
              role="status"
              style={{ color: colors.navy, borderRadius: 0 }}
            />
            <div
              style={{
                color: colors.muted,
                fontSize: "0.85rem",
              }}
            >
              Loading candidate credentials...
            </div>
          </div>
        ) : filteredGrants.length === 0 ? (
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
              <Key size={26} strokeWidth={1.8} />
            </div>
            <div
              style={{
                color: colors.navy,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: "4px",
              }}
            >
              No credential records found
            </div>
            <div
              style={{
                color: colors.muted,
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filter or search query."
                : "Click 'Give Candidate Credentials' to issue login details."}
            </div>
            {(searchQuery || statusFilter !== "all") && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                style={{
                  background: colors.navy,
                  color: colors.white,
                  border: `1px solid ${colors.navy}`,
                  borderRadius: 0,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "7px 16px",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ---- DESKTOP TABLE ---- */}
            <div className="d-none d-md-block">
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
                        }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          title="Select all"
                          style={{
                            borderColor: colors.navy,
                            borderRadius: 0,
                            cursor: "pointer",
                          }}
                        />
                      </th>
                      {[
                        "Candidate",
                        "Password",
                        "Assigned Test",
                        "Attempts",
                        "Expiry",
                        "Status",
                        "Actions",
                      ].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            background: colors.surface,
                            color: colors.navy,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            padding: "12px",
                            borderBottom: `1px solid ${colors.navy}`,
                            whiteSpace: "nowrap",
                            textAlign:
                              h === "Actions"
                                ? "end"
                                : i === 0
                                  ? "left"
                                  : "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrants.map((grant) => {
                      const used = grant.usedAttempts || 0;
                      const permitted = grant.permittedAttempts || 1;
                      const isRevealed = Boolean(revealedPasswords[grant.id]);
                      const pass = grant.temporaryPassword || "—";
                      const isSelected = selectedGrantIds.includes(grant.id);

                      return (
                        <tr
                          key={grant.id}
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
                            }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(grant.id)}
                              style={{
                                borderColor: colors.navy,
                                borderRadius: 0,
                                cursor: "pointer",
                              }}
                            />
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              maxWidth: "260px",
                            }}
                          >
                            <div
                              style={{
                                color: colors.navy,
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                marginBottom: "3px",
                              }}
                            >
                              {grant.candidateName || grant.candidateEmail}
                            </div>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                              {grant.candidateUsername && (
                                <span
                                  style={{
                                    background: colors.surface,
                                    color: colors.navy,
                                    fontFamily:
                                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    padding: "2px 6px",
                                  }}
                                >
                                  @{grant.candidateUsername}
                                </span>
                              )}
                              <span
                                style={{
                                  color: colors.muted,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {grant.candidateEmail}
                              </span>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            <div
                              className="d-inline-flex align-items-center gap-2"
                              style={{
                                background: colors.surface,
                                padding: "4px 8px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, monospace",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  color: colors.navy,
                                  letterSpacing: "0.02em",
                                }}
                              >
                                {isRevealed ? pass : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility(grant.id)
                                }
                                title={
                                  isRevealed
                                    ? "Hide password"
                                    : "Reveal password"
                                }
                                style={{
                                  background: "transparent",
                                  border: 0,
                                  color: colors.navy,
                                  padding: "2px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
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
                                  style={{
                                    background: "transparent",
                                    border: 0,
                                    color: colors.navy,
                                    padding: "2px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Copy size={13} />
                                </button>
                              )}
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          >
                            {grant.testTitle}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.navy,
                              fontSize: "0.85rem",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            <strong style={{ fontWeight: 700 }}>{used}</strong>
                            <span style={{ color: colors.muted }}>
                              {" "}
                              / {permitted}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                              color: colors.muted,
                              fontSize: "0.8rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {grant.expiryDate
                              ? new Date(grant.expiryDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "No expiry"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom: `1px solid ${colors.divider}`,
                              verticalAlign: "middle",
                            }}
                          >
                            <StatusBadge status={grant.computedStatus} />
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
                              <ActionButton
                                onClick={() => handleOpenSlip(grant)}
                                icon={Send}
                                label="WhatsApp Slip"
                                title="View & copy WhatsApp credentials slip"
                                variant="navy"
                              />
                              <ActionButton
                                onClick={() => handleOpenExtend(grant)}
                                icon={RotateCcw}
                                label="Extend"
                                title="Extend attempts or change expiry"
                                variant="outline"
                              />
                              {grant.computedStatus !== "revoked" && (
                                <ActionIcon
                                  onClick={() => handleRevoke(grant.id)}
                                  icon={ShieldAlert}
                                  title="Revoke access"
                                  variant="outline"
                                />
                              )}
                              <ActionIcon
                                onClick={() => handleDeleteClick(grant)}
                                icon={Trash2}
                                title="Delete access record"
                                variant="outline"
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

            {/* ---- MOBILE CARD LAYOUT ---- */}
            <div className="d-md-none p-2">
              {filteredGrants.map((grant) => {
                const used = grant.usedAttempts || 0;
                const permitted = grant.permittedAttempts || 1;
                const isRevealed = Boolean(revealedPasswords[grant.id]);
                const pass = grant.temporaryPassword || "—";

                return (
                  <MobileGrantCard
                    key={grant.id}
                    grant={grant}
                    used={used}
                    permitted={permitted}
                    isRevealed={isRevealed}
                    pass={pass}
                    onTogglePassword={() => togglePasswordVisibility(grant.id)}
                    onCopyPassword={() => {
                      navigator.clipboard.writeText(grant.temporaryPassword);
                      showToast("Password copied to clipboard!", "success");
                    }}
                    onOpenSlip={() => handleOpenSlip(grant)}
                    onExtend={() => handleOpenExtend(grant)}
                    onRevoke={() => handleRevoke(grant.id)}
                    onDelete={() => handleDeleteClick(grant)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ============================================================
          GIVE CREDENTIALS MODAL
          ============================================================ */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Give Candidate Credentials & Access"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleCreateAccess}
              disabled={creating}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              {creating ? "Issuing Credentials..." : "Save & Give Credentials"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAccess}>
          {/* Mode toggle */}
          <div className="d-flex mb-3" role="group">
            <button
              type="button"
              className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setIsExistingCandidate(false);
                setSelectedCandidateId("");
                setCandidateName("");
                setCandidateUsername("");
                setCandidateEmail("");
                setTemporaryPassword(generateNewPassword());
              }}
              style={{
                background: !isExistingCandidate ? colors.navy : colors.white,
                color: !isExistingCandidate ? colors.white : colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "9px 14px",
              }}
            >
              <UserPlus size={14} />
              New Candidate
            </button>
            <button
              type="button"
              className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setIsExistingCandidate(true);
                if (candidates.length > 0 && !selectedCandidateId) {
                  handleCandidateSelect(candidates[0].id);
                }
              }}
              style={{
                background: isExistingCandidate ? colors.navy : colors.white,
                color: isExistingCandidate ? colors.white : colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "9px 14px",
                borderLeft: "0",
              }}
            >
              <Users size={14} />
              Existing ({candidates.length})
            </button>
          </div>

          {/* Existing dropdown */}
          {isExistingCandidate && (
            <FormField label="Select Registered Candidate">
              <select
                className="form-select"
                value={selectedCandidateId}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">— Choose Candidate —</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "Candidate"} (
                    {c.username ? `@${c.username}` : c.email})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {/* Name + Username */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <FormField label="Candidate Full Name">
                <InputWithIcon icon={User}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Muhammad Ali"
                    value={candidateName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </InputWithIcon>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField
                label="Login Username"
                hint="Candidate enters this to log in"
              >
                <div className="d-flex">
                  <span style={prefixStyle}>@</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. pma_ali"
                    value={candidateUsername}
                    onChange={(e) =>
                      setCandidateUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    required
                    style={{
                      ...inputStyle,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      borderLeft: 0,
                    }}
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Email + Password */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <FormField
                label="Email Address"
                hint="Optional — defaults to @mtacademy.com format"
              >
                <InputWithIcon icon={Mail}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder={
                      candidateUsername
                        ? `${candidateUsername}@mtacademy.com`
                        : "student@example.com"
                    }
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    style={inputStyle}
                  />
                </InputWithIcon>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField
                label="Temporary Password"
                action={
                  <button
                    type="button"
                    onClick={() => setTemporaryPassword(generateNewPassword())}
                    className="d-inline-flex align-items-center gap-1"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: colors.navy,
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                }
              >
                <InputWithIcon icon={Key}>
                  <input
                    type="text"
                    className="form-control"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontWeight: 700,
                    }}
                  />
                </InputWithIcon>
              </FormField>
            </div>
          </div>

          {/* Test module */}
          <FormField label="Assigned PMA Test Module">
            <select
              className="form-select"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              required
              style={inputStyle}
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.durationMinutes || 30} mins •{" "}
                  {t.questionCount || 84} MCQs)
                </option>
              ))}
            </select>
          </FormField>

          {/* Attempts + Expiry */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <FormField label="Permitted Attempts">
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={10}
                  value={permittedAttempts}
                  onChange={(e) => setPermittedAttempts(e.target.value)}
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Validity (Days)">
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={90}
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
          </div>

          {/* Payment ref + Note */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField label="Payment Reference">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. JazzCash TID #948201 / Rs. 1500"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Internal Note (Optional)">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. WhatsApp batch 152"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          CREDENTIALS SLIP MODAL
          ============================================================ */}
      <Modal
        isOpen={Boolean(generatedResult)}
        onClose={() => setGeneratedResult(null)}
        title="Candidate Credentials Slip"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setGeneratedResult(null)}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleCopyCredsOnly}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              {copiedCredsOnly ? <Check size={14} /> : <Copy size={14} />}
              Copy Login Only
            </button>
            <button
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleCopyWhatsApp}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              {copied ? <Check size={14} /> : <Send size={14} />}
              {copied ? "Copied!" : "Copy WhatsApp Slip"}
            </button>
          </>
        }
      >
        {generatedResult && (
          <div>
            <div
              className="p-3 mb-3"
              style={{ background: colors.surface, borderRadius: 0 }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span
                  style={{
                    background: colors.navy,
                    color: colors.white,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                  }}
                >
                  MTacademy PMA Credentials
                </span>
                <span
                  style={{
                    color: colors.muted,
                    fontSize: "0.75rem",
                  }}
                >
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="row g-3" style={{ fontSize: "0.83rem" }}>
                <DetailField label="Candidate" value={generatedResult.name} />
                <DetailField
                  label="Assigned Test"
                  value={generatedResult.testTitle}
                />
                <DetailField
                  label="Username"
                  value={`@${generatedResult.username}`}
                  mono
                />
                <DetailField
                  label="Temporary Password"
                  value={generatedResult.temporaryPassword}
                  mono
                />
                <div className="col-12">
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "0.72rem",
                      marginBottom: "3px",
                    }}
                  >
                    Login Portal
                  </div>
                  <a
                    href={generatedResult.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none d-inline-flex align-items-center gap-1"
                    style={{
                      color: colors.navy,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      wordBreak: "break-all",
                    }}
                  >
                    {generatedResult.loginUrl}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <label
              className="mb-2 d-block"
              style={{
                color: colors.navy,
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              WhatsApp Formatted Message Preview
            </label>
            <div
              className="p-3 mb-2"
              style={{
                background: colors.white,
                border: `1px solid ${colors.divider}`,
                borderRadius: 0,
                maxHeight: "220px",
                overflowY: "auto",
              }}
            >
              <pre
                className="mb-0"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "0.76rem",
                  color: colors.navy,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  lineHeight: 1.6,
                }}
              >
                {generatedResult.whatsappMessage}
              </pre>
            </div>
            <small style={{ color: colors.muted, fontSize: "0.75rem" }}>
              Click "Copy WhatsApp Slip" to paste directly into your WhatsApp
              chat with the candidate.
            </small>
          </div>
        )}
      </Modal>

      {/* ============================================================
          EXTEND MODAL
          ============================================================ */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Extend Candidate Test Access"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setExtendModalOpen(false)}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleExtendSubmit}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Save Extension
            </button>
          </>
        }
      >
        {selectedGrantForExtend && (
          <form onSubmit={handleExtendSubmit}>
            <p
              style={{
                color: colors.muted,
                fontSize: "0.85rem",
                marginBottom: "16px",
              }}
            >
              Extending access for{" "}
              <strong style={{ color: colors.navy }}>
                {selectedGrantForExtend.candidateName ||
                  selectedGrantForExtend.candidateEmail}
              </strong>{" "}
              on{" "}
              <strong style={{ color: colors.navy }}>
                {selectedGrantForExtend.testTitle}
              </strong>
              .
            </p>

            <FormField label="Add Extra Attempts">
              <input
                type="number"
                className="form-control"
                min={0}
                max={10}
                value={extraAttempts}
                onChange={(e) => setExtraAttempts(e.target.value)}
                style={inputStyle}
              />
              <small
                style={{
                  color: colors.muted,
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Current: {selectedGrantForExtend.usedAttempts || 0} of{" "}
                {selectedGrantForExtend.permittedAttempts || 1} used
              </small>
            </FormField>

            <FormField label="New Expiry Date (Optional)">
              <input
                type="date"
                className="form-control"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                style={inputStyle}
              />
            </FormField>
          </form>
        )}
      </Modal>

      {/* ============================================================
          DELETE MODAL
          ============================================================ */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Candidate Access Record"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              <Trash2 size={14} />
              {deleting ? "Deleting Record..." : "Delete Access Record"}
            </button>
          </>
        }
      >
        {deletingGrant && (
          <div>
            <div
              className="p-3 mb-3 d-flex align-items-start gap-3"
              style={{ background: colors.surface, borderRadius: 0 }}
            >
              <div style={{ color: colors.navy, flexShrink: 0 }}>
                <AlertTriangle size={28} strokeWidth={1.8} />
              </div>
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <div
                  style={{
                    color: colors.navy,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    marginBottom: "2px",
                    wordBreak: "break-word",
                  }}
                >
                  {deletingGrant.candidateName || deletingGrant.candidateEmail}
                </div>
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "0.78rem",
                    wordBreak: "break-word",
                  }}
                >
                  {deletingGrant.candidateEmail}
                  {deletingGrant.candidateUsername &&
                    ` (@${deletingGrant.candidateUsername})`}
                </div>
                <div className="mt-2">
                  <span
                    style={{
                      background: colors.navy,
                      color: colors.white,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "3px 7px",
                    }}
                  >
                    {deletingGrant.testTitle}
                  </span>
                </div>
              </div>
            </div>

            <p
              style={{
                color: colors.navy,
                fontSize: "0.85rem",
                marginBottom: "12px",
              }}
            >
              Are you sure you want to permanently delete this candidate's
              examination access record?
            </p>

            <div
              className="p-3"
              style={{
                background: colors.surface,
                borderLeft: `3px solid ${colors.navy}`,
                fontSize: "0.8rem",
                color: colors.navy,
              }}
            >
              <strong style={{ fontWeight: 700 }}>Warning:</strong> Deleting
              this access record removes their credentials and authorized
              attempts for this test. The candidate will no longer be able to
              attempt or resume this test.
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================
          BULK DELETE MODAL
          ============================================================ */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => !bulkDeleting && setBulkDeleteModalOpen(false)}
        title="Delete Multiple Access Records"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={bulkDeleting}
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleConfirmBulkDelete}
              disabled={bulkDeleting}
              style={{
                background: colors.navy,
                color: colors.white,
                border: `1px solid ${colors.navy}`,
                borderRadius: 0,
                fontWeight: 600,
                padding: "7px 14px",
              }}
            >
              <Trash2 size={14} />
              {bulkDeleting
                ? "Deleting Records..."
                : `Delete ${selectedGrantIds.length} Records`}
            </button>
          </>
        }
      >
        <div>
          <div
            className="p-3 mb-3 d-flex align-items-center gap-3"
            style={{ background: colors.surface, borderRadius: 0 }}
          >
            <div style={{ color: colors.navy, flexShrink: 0 }}>
              <AlertTriangle size={28} strokeWidth={1.8} />
            </div>
            <div>
              <div
                style={{
                  color: colors.navy,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {selectedGrantIds.length} Candidate Access Records Selected
              </div>
              <div style={{ color: colors.muted, fontSize: "0.78rem" }}>
                Permanent bulk removal from database
              </div>
            </div>
          </div>

          <p
            style={{
              color: colors.navy,
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            Are you sure you want to permanently delete all{" "}
            <strong>{selectedGrantIds.length}</strong> selected candidate access
            records?
          </p>

          <div
            className="p-3"
            style={{
              background: colors.surface,
              borderLeft: `3px solid ${colors.navy}`,
              fontSize: "0.8rem",
              color: colors.navy,
            }}
          >
            <strong style={{ fontWeight: 700 }}>Irreversible Action:</strong>{" "}
            All selected access records and candidate test authorizations will
            be permanently erased.
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   REUSABLE PRIMITIVES
   ============================================================ */

const inputStyle = {
  border: `1px solid ${colors.divider}`,
  borderRadius: 0,
  fontSize: "0.875rem",
  color: colors.navy,
  padding: "8px 12px",
  background: colors.white,
};

const prefixStyle = {
  background: colors.surface,
  border: `1px solid ${colors.divider}`,
  borderRight: 0,
  color: colors.navy,
  padding: "8px 12px",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

function FormField({ label, hint, action, children }) {
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label
          style={{
            color: colors.navy,
            fontSize: "0.78rem",
            fontWeight: 700,
            margin: 0,
          }}
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
        {action}
      </div>
      {children}
    </div>
  );
}

function InputWithIcon({ icon: Icon, children }) {
  return (
    <div className="d-flex">
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
        <Icon size={14} />
      </span>
      <div className="flex-grow-1">{children}</div>
    </div>
  );
}

function DetailField({ label, value, mono = false }) {
  return (
    <div className="col-6">
      <div
        style={{
          color: colors.muted,
          fontSize: "0.72rem",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: colors.navy,
          fontSize: "0.85rem",
          fontWeight: 600,
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "Inter, sans-serif",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon: Icon, label, title, variant = "navy" }) {
  const isNavy = variant === "navy";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="d-inline-flex align-items-center gap-1"
      style={{
        background: isNavy ? colors.navy : colors.white,
        color: isNavy ? colors.white : colors.navy,
        border: `1px solid ${colors.navy}`,
        borderRadius: 0,
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "5px 9px",
        cursor: "pointer",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function ActionIcon({ onClick, icon: Icon, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="d-inline-flex align-items-center justify-content-center"
      style={{
        background: colors.white,
        color: colors.navy,
        border: `1px solid ${colors.navy}`,
        borderRadius: 0,
        padding: "5px 7px",
        cursor: "pointer",
      }}
    >
      <Icon size={14} />
    </button>
  );
}

/* ============================================================
   MOBILE GRANT CARD
   ============================================================ */
function MobileGrantCard({
  grant,
  used,
  permitted,
  isRevealed,
  pass,
  onTogglePassword,
  onCopyPassword,
  onOpenSlip,
  onExtend,
  onRevoke,
  onDelete,
}) {
  return (
    <div
      style={{
        background: colors.white,
        padding: "16px",
        marginBottom: "10px",
        border: `1px solid ${colors.divider}`,
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
        <div style={{ minWidth: 0, flexGrow: 1 }}>
          <div
            style={{
              color: colors.navy,
              fontWeight: 700,
              fontSize: "0.92rem",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {grant.candidateName || grant.candidateEmail}
          </div>
          {grant.candidateUsername && (
            <span
              style={{
                display: "inline-block",
                background: colors.surface,
                color: colors.navy,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: "2px 6px",
                marginBottom: "4px",
              }}
            >
              @{grant.candidateUsername}
            </span>
          )}
          <div
            className="d-flex align-items-center gap-1"
            style={{
              color: colors.muted,
              fontSize: "0.75rem",
              minWidth: 0,
            }}
          >
            <Mail size={12} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {grant.candidateEmail || "—"}
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusBadge status={grant.computedStatus} />
        </div>
      </div>

      {/* Test */}
      <div
        className="py-2"
        style={{ borderTop: `1px solid ${colors.divider}` }}
      >
        <div
          style={{
            color: colors.muted,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
            marginBottom: "3px",
          }}
        >
          Assigned Test
        </div>
        <div
          style={{
            color: colors.navy,
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {grant.testTitle || "—"}
        </div>
      </div>

      {/* Details grid */}
      <div
        className="py-3"
        style={{
          borderTop: `1px solid ${colors.divider}`,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <div className="row g-3">
          <div className="col-6">
            <div
              style={{
                color: colors.muted,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: "3px",
              }}
            >
              Attempts
            </div>
            <div
              style={{
                color: colors.navy,
                fontSize: "0.85rem",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {used} / {permitted}
            </div>
          </div>
          <div className="col-6">
            <div
              style={{
                color: colors.muted,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: "3px",
              }}
            >
              Expiry
            </div>
            <div
              style={{
                color: colors.navy,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {grant.expiryDate
                ? new Date(grant.expiryDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "No expiry"}
            </div>
          </div>
          <div className="col-12">
            <div
              style={{
                color: colors.muted,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: "5px",
              }}
            >
              Temporary Password
            </div>
            <div className="d-flex align-items-center gap-2">
              <code
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: colors.surface,
                  color: colors.navy,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "6px 10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {isRevealed ? pass : "••••••••"}
              </code>
              <button
                type="button"
                onClick={onTogglePassword}
                title={isRevealed ? "Hide password" : "Reveal password"}
                style={{
                  background: "transparent",
                  border: 0,
                  color: colors.navy,
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {grant.temporaryPassword && (
                <button
                  type="button"
                  onClick={onCopyPassword}
                  title="Copy password"
                  style={{
                    background: "transparent",
                    border: 0,
                    color: colors.navy,
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex align-items-center gap-2 mt-3">
        <button
          type="button"
          onClick={onOpenSlip}
          className="flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
          style={{
            background: colors.navy,
            color: colors.white,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          <Send size={13} />
          WhatsApp Slip
        </button>

        <button
          type="button"
          onClick={onExtend}
          className="d-inline-flex align-items-center justify-content-center gap-1"
          style={{
            background: colors.white,
            color: colors.navy,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={13} />
          Extend
        </button>

        {grant.computedStatus !== "revoked" && (
          <button
            type="button"
            onClick={onRevoke}
            title="Revoke access"
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              background: colors.white,
              color: colors.navy,
              border: `1px solid ${colors.navy}`,
              borderRadius: 0,
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            <ShieldAlert size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          title="Delete access record"
          className="d-inline-flex align-items-center justify-content-center"
          style={{
            background: colors.white,
            color: colors.navy,
            border: `1px solid ${colors.navy}`,
            borderRadius: 0,
            padding: "8px 10px",
            cursor: "pointer",
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE WRAPPER
   ============================================================ */
export default function AccessManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-5 text-center">
          <div
            className="spinner-border mb-2"
            role="status"
            style={{ color: colors.navy, borderRadius: 0 }}
          />
          <div style={{ color: colors.muted, fontSize: "0.85rem" }}>
            Loading credentials manager...
          </div>
        </div>
      }
    >
      <AccessManagementContent />
    </Suspense>
  );
}
