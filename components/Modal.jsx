"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md" // sm, md, lg, xl
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "420px",
    md: "540px",
    lg: "720px",
    xl: "960px"
  };

  return (
    <div
      className="custom-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="custom-modal-content"
        style={{ maxWidth: maxWidths[size] || "540px" }}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-subtle">
          <h5 id="modal-title" className="mb-0 fs-6 fw-semibold text-deep-blue" style={{ color: "#0F3B5D" }}>
            {title}
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 p-1 text-muted"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4" style={{ maxHeight: "calc(85vh - 130px)", overflowY: "auto" }}>
          {children}
        </div>

        {footer && (
          <div className="d-flex align-items-center justify-content-end gap-2 p-3 bg-light border-top border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
