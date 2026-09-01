"use client";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, width = "md" }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-box ${styles[width]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className="modal-title" style={{ marginBottom: 0 }}>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <FiX size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
