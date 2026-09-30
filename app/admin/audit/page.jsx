"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getAdminAuditLogs } from "../../../lib/firestore";
import { History, ShieldAlert, Search, Filter } from "lucide-react";

export default function AdminAuditLogPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error(err);
      showToast("Error loading audit logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      (l.adminEmail && l.adminEmail.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.targetType && l.targetType.toLowerCase().includes(q)) ||
      JSON.stringify(l.details || {}).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-deep-blue mb-1" style={{ color: "#0F3B5D" }}>
            Administrator Audit Logs
          </h1>
          <p className="text-secondary small mb-0">
            Immutable security event logs tracking privileged access generation, test updates, and approvals.
          </p>
        </div>
      </div>

      {/* Search */}
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
                placeholder="Search audit trail by admin, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-8 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
            <span>Showing {filteredLogs.length} audit records</span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card border-subtle shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted small">
            <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
            <div>Loading audit log entries...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-5 text-center text-muted small">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-pma mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-muted small">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{log.adminEmail}</span>
                    </td>
                    <td>
                      <span className="badge badge-sky">{log.action}</span>
                    </td>
                    <td className="text-muted small">{log.targetType}</td>
                    <td>
                      <code className="text-dark small" style={{ fontSize: "0.75rem" }}>
                        {JSON.stringify(log.details)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
