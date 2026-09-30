"use client";

import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getAllAdmins,
  updateUserAccountStatus,
  deleteAdminUser,
} from "../../../lib/firestore";
import { createAdminAccount } from "../../../lib/auth";
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Mail,
  Lock,
  User,
  Shield,
  Clock,
  Trash2,
} from "lucide-react";

export default function AdminsManagementPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Admin Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const isSuper = user?.email?.toLowerCase() === "ahmadraufbd@gmail.com";

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAllAdmins(user);
      setAdmins(data);
    } catch (err) {
      console.error(err);
      showToast("Error loading administrator team.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdmins();
    }
  }, [user]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (
      !newAdminName.trim() ||
      !newAdminEmail.trim() ||
      !newAdminPassword.trim()
    ) {
      showToast("Please fill in all administrator credentials.", "warning");
      return;
    }

    setCreating(true);
    try {
      await createAdminAccount(
        newAdminName,
        newAdminEmail,
        newAdminPassword,
        user,
      );
      showToast("New administrator account created successfully!", "success");
      setCreateModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      loadAdmins();
    } catch (err) {
      console.error(err);
      showToast(
        err.message || "Failed to create administrator account.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (adminObj) => {
    // Cannot suspend super admin
    if (adminObj.email?.toLowerCase() === "ahmadraufbd@gmail.com") {
      showToast("Cannot modify Super Administrator status.", "warning");
      return;
    }
    const newStatus =
      adminObj.accountStatus === "active" ? "suspended" : "active";
    try {
      await updateUserAccountStatus(adminObj.id, newStatus, user);
      showToast(
        `Administrator account ${newStatus === "active" ? "activated" : "suspended"}.`,
        "info",
      );
      loadAdmins();
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.", "error");
    }
  };

  const handleDeleteAdmin = async (adminObj) => {
    if (adminObj.email?.toLowerCase() === "ahmadraufbd@gmail.com") {
      showToast("Cannot delete Super Administrator.", "warning");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete administrator "${adminObj.name || adminObj.email}"?`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminUser(adminObj.id, user);
      showToast("Administrator deleted successfully.", "info");
      loadAdmins();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete administrator.", "error");
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1
            className="fs-4 fw-bold text-deep-blue mb-1"
            style={{ color: "#0F3B5D" }}
          >
            Administrator Team Management
          </h1>
          <p className="text-secondary small mb-0">
            Provision and manage authorized examination officers and portal
            administrators.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add New Administrator</span>
        </button>
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
                placeholder="Search administrators by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-8 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
            <span>Total Administrators: {admins.length}</span>
          </div>
        </div>
      </div>

      {/* Admins List */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
            <div>Loading administrative officers...</div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No administrators found. Click "Add New Administrator" to create
            one.
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-pma mb-0">
                  <thead>
                    <tr>
                      <th>Administrator</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created On</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((adm) => {
                      const isThisSuper =
                        adm.email?.toLowerCase() === "ahmadraufbd@gmail.com";

                      return (
                        <tr key={adm.id}>
                          <td>
                            <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                              <Shield
                                size={16}
                                className={
                                  isThisSuper
                                    ? "text-primary"
                                    : "text-secondary"
                                }
                              />
                              <span>{adm.name || "Administrator"}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">{adm.email}</span>
                          </td>
                          <td>
                            {isThisSuper ? (
                              <span className="badge badge-sky">
                                Super Admin
                              </span>
                            ) : (
                              <span className="badge bg-light text-secondary border">
                                Administrator
                              </span>
                            )}
                          </td>
                          <td className="text-muted small">
                            {adm.createdAt
                              ? new Date(adm.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            {adm.accountStatus === "suspended" ? (
                              <span className="badge badge-revoked">
                                Suspended
                              </span>
                            ) : (
                              <span className="badge badge-active">Active</span>
                            )}
                          </td>
                          <td className="text-end">
                            {!isThisSuper && (
                              <div className="d-inline-flex align-items-center gap-1">
                                <button
                                  type="button"
                                  className={`btn btn-sm ${
                                    adm.accountStatus === "suspended"
                                      ? "btn-outline-success"
                                      : "btn-outline-warning"
                                  }`}
                                  onClick={() => handleToggleStatus(adm)}
                                >
                                  {adm.accountStatus === "suspended"
                                    ? "Reactivate"
                                    : "Suspend"}
                                </button>
                                {isSuper && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                    onClick={() => handleDeleteAdmin(adm)}
                                    title="Delete Administrator"
                                  >
                                    <Trash2 size={13} />
                                    <span className="d-none d-sm-inline">
                                      Delete
                                    </span>
                                  </button>
                                )}
                              </div>
                            )}
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
              {filteredAdmins.map((adm) => {
                const isThisSuper =
                  adm.email?.toLowerCase() === "ahmadraufbd@gmail.com";

                return (
                  <div key={adm.id} className="admin-mobile-card">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <Shield
                            size={16}
                            className={
                              isThisSuper
                                ? "text-primary flex-shrink-0"
                                : "text-secondary flex-shrink-0"
                            }
                          />
                          <span className="fw-bold text-dark text-truncate">
                            {adm.name || "Administrator"}
                          </span>
                        </div>

                        <div className="admin-mobile-email">
                          <Mail size={13} className="flex-shrink-0" />
                          <span>{adm.email || "—"}</span>
                        </div>

                        <div className="mt-2">
                          {isThisSuper ? (
                            <span className="badge badge-sky">Super Admin</span>
                          ) : (
                            <span className="badge bg-light text-secondary border">
                              Administrator
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {adm.accountStatus === "suspended" ? (
                          <span className="badge badge-revoked">Suspended</span>
                        ) : (
                          <span className="badge badge-active">Active</span>
                        )}
                      </div>
                    </div>

                    <div className="admin-mobile-details">
                      <div>
                        <span>Created On</span>
                        <strong>
                          {adm.createdAt
                            ? new Date(adm.createdAt).toLocaleDateString()
                            : "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Role</span>
                        <strong>
                          {isThisSuper ? "Super Admin" : "Administrator"}
                        </strong>
                      </div>
                    </div>

                    {!isThisSuper && (
                      <div className="admin-mobile-actions">
                        <button
                          type="button"
                          className={`btn btn-sm flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1 ${
                            adm.accountStatus === "suspended"
                              ? "btn-outline-success"
                              : "btn-outline-warning"
                          }`}
                          onClick={() => handleToggleStatus(adm)}
                        >
                          {adm.accountStatus === "suspended" ? (
                            <>
                              <UserCheck size={14} />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              Suspend
                            </>
                          )}
                        </button>

                        {isSuper && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleDeleteAdmin(adm)}
                            title="Delete Administrator"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Create Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Administrator Account"
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
              onClick={handleCreateAdmin}
              disabled={creating}
            >
              {creating ? "Creating Account..." : "Create Administrator"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAdmin}>
          <p className="small text-secondary mb-3">
            Add a new examination officer to manage questions, review results,
            and generate candidate access grants.
          </p>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Administrator Name
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-subtle text-muted">
                <User size={15} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Major Tariq / Exam Coordinator"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Official Email Address
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-subtle text-muted">
                <Mail size={15} />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="officer@pma.edu.pk"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Initial Password
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-subtle text-muted">
                <Lock size={15} />
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Minimum 6 characters. The administrator can use these credentials
              to log in.
            </small>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .admin-mobile-card {
          background: #ffffff;
          border: 1px solid #dceaf3;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(15, 59, 93, 0.04);
        }

        .admin-mobile-card:last-child {
          margin-bottom: 0;
        }

        .admin-mobile-email {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 0.78rem;
          margin-top: 7px;
          min-width: 0;
        }

        .admin-mobile-email span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-mobile-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #e6f0f6;
          border-bottom: 1px solid #e6f0f6;
        }

        .admin-mobile-details > div {
          min-width: 0;
        }

        .admin-mobile-details span {
          display: block;
          color: #94a3b8;
          font-size: 0.69rem;
          margin-bottom: 4px;
        }

        .admin-mobile-details strong {
          display: block;
          color: #334155;
          font-size: 0.79rem;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .admin-mobile-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }

        .admin-mobile-actions .btn {
          min-height: 34px;
        }

        @media (max-width: 575.98px) {
          .admin-mobile-card {
            padding: 14px;
            border-radius: 10px;
          }

          .admin-mobile-actions {
            gap: 5px;
          }

          .admin-mobile-actions .btn {
            padding: 6px 8px;
            font-size: 0.78rem;
          }
        }
      `}</style>
    </div>
  );
}
