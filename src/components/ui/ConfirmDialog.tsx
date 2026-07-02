"use client";
import Modal from "@/components/ui/Modal";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  tone = "danger",
  busy = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      width="max-w-md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-[var(--border2)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)] hover:text-[var(--text)]">
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white ${tone === "danger" ? "bg-rose-500" : "bg-[var(--amber)]"} disabled:opacity-60`}
          >
            {busy ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 p-4 text-sm leading-6 text-[var(--text-2)]">
        {description ?? "การกระทำนี้อาจย้อนกลับไม่ได้"}
      </div>
    </Modal>
  );
}
