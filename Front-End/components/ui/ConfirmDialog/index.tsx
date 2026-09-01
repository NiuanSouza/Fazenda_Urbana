"use client";
import React from "react";
import { Modal } from "../Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="sm">
      <div style={{ marginBottom: "24px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
        {message}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="btn btn-ghost" onClick={onClose}>
          {cancelText}
        </button>
        <button
          className={`btn ${isDestructive ? "btn-danger" : "btn-primary"}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
