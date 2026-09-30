"use client";

import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
}) {
  const iconColors = {
    primary: { bg: "#E0F2FE", color: "#0284C7" },
    success: { bg: "#DCFCE7", color: "#16A34A" },
    warning: { bg: "#FEF3C7", color: "#F59E0B" },
    danger: { bg: "#FEE2E2", color: "#DC2626" },
    info: { bg: "#F0F9FF", color: "#38BDF8" },
  };

  const scheme = iconColors[color] || iconColors.primary;

  return (
    <div className="card h-100 border-subtle shadow-sm">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-secondary small fw-medium">{title}</span>
          {Icon && (
            <div
              className="d-flex align-items-center justify-content-center rounded"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: scheme.bg,
                color: scheme.color,
              }}
            >
              <Icon size={18} />
            </div>
          )}
        </div>
        <div className="d-flex align-items-baseline gap-2">
          <h3
            className="fw-bold mb-0 text-dark"
            style={{ letterSpacing: "-0.02em" }}
          >
            {value}
          </h3>
        </div>
        {subtitle && (
          <small
            className="text-muted d-block mt-1"
            style={{ fontSize: "0.785rem" }}
          >
            {subtitle}
          </small>
        )}
      </div>
    </div>
  );
}
