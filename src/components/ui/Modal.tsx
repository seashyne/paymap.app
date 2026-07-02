"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className={`w-full ${width} rounded-[28px] border border-[var(--border)] bg-[var(--s1)] shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-black">{title}</div>
            {description ? <div className="mt-1 text-sm text-[var(--text-3)]">{description}</div> : null}
          </div>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border2)] text-[var(--text-2)] hover:bg-white/5 hover:text-[var(--text)]">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer ? <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">{footer}</div> : null}
      </div>
    </div>
  );
}
