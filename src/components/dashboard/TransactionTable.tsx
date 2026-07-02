"use client";
import { memo, useEffect, useMemo, useState } from "react";
import { Pencil, Receipt, Trash2, Wallet, Clock3, Tags, FileText, PanelRightOpen } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { firstError, readApi } from "@/lib/http";
import SidePanel from "@/components/ui/SidePanel";
import AdvancedTable, { type AdvancedTableColumn } from "@/components/ui/AdvancedTable";

type Row = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string | null;
  happenedAt: Date | string;
  category?: { name: string; color?: string | null } | null;
};

function TransactionTableInner({ transactions }: { transactions: Row[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(transactions);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [form, setForm] = useState({ amount: "", note: "" });
  const [fieldError, setFieldError] = useState<string>("");

  useEffect(() => setRows(transactions), [transactions]);

  const hasRows = rows.length > 0;
  const totalIn = useMemo(() => rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [rows]);
  const totalOut = useMemo(() => rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [rows]);

  function openEdit(tx: Row) {
    setEditing(tx);
    setFieldError("");
    setForm({ amount: String(tx.amount), note: tx.note ?? "" });
  }

  async function removeTx(id: string) {
    const previous = rows;
    setBusyId(id);
    setRows((curr) => curr.filter((item) => item.id !== id));
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const payload = await readApi(res);
    setBusyId(null);
    if (!res.ok || !payload.success) {
      setRows(previous);
      toast.error(payload.error ?? "Failed to remove transaction", firstError(payload.details));
      return;
    }
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
    toast.success(payload.message ?? "Transaction removed");
  }

  async function saveEdit() {
    if (!editing) return;
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFieldError("Amount must be greater than 0");
      return;
    }

    setFieldError("");
    const previous = rows;
    const nextRow: Row = { ...editing, amount, note: form.note.trim() || null };
    setBusyId(editing.id);
    setRows((curr) => curr.map((item) => item.id === editing.id ? nextRow : item));
    setSelected((curr) => curr?.id === editing.id ? nextRow : curr);

    const res = await fetch(`/api/transactions/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note: form.note.trim() || null }),
    });
    const payload = await readApi<Row>(res);
    setBusyId(null);
    if (!res.ok || !payload.success) {
      setRows(previous);
      setFieldError(firstError(payload.details) ?? payload.error ?? "Unable to save changes");
      toast.error(payload.error ?? "Unable to save changes", firstError(payload.details));
      return;
    }

    const updated = payload.data ?? nextRow;
    setRows((curr) => curr.map((item) => item.id === editing.id ? { ...item, ...updated } : item));
    setSelected((curr) => curr?.id === editing.id ? { ...nextRow, ...updated } : curr);
    setEditing(null);
    toast.success(payload.message ?? "Transaction updated");
  }

  const columns = useMemo<AdvancedTableColumn<Row>[]>(() => [
    { key: "happenedAt", label: "Time", sortable: true, searchValue: (row) => `${formatDateTime(row.happenedAt)}`, render: (tx) => <span className="text-[var(--text-2)]">{formatDateTime(tx.happenedAt)}</span> },
    { key: "type", label: "Type", sortable: true, render: (tx) => <span className={`rounded-full px-2.5 py-1 text-xs ${tx.type === "income" ? "bg-[var(--green-d)] text-[var(--green)]" : "bg-[var(--red-d)] text-[var(--red)]"}`}>{tx.type === "income" ? "Income" : "Expense"}</span> },
    { key: "category", label: "Category", sortable: false, searchValue: (row) => row.category?.name ?? "", render: (tx) => tx.category ? <span className="rounded-full border border-[var(--border2)] px-2.5 py-1 text-xs" style={{ color: tx.category.color ?? "var(--text-2)" }}>{tx.category.name}</span> : <span className="text-[var(--text-3)]">-</span> },
    { key: "note", label: "Note", sortable: false, searchValue: (row) => row.note ?? "", render: (tx) => <span className="line-clamp-1">{tx.note ?? "-"}</span> },
    { key: "amount", label: "Amount", sortable: true, className: "text-right font-semibold", headerClassName: "text-right", render: (tx) => <span className={tx.type === "income" ? "text-[var(--green)]" : "text-[var(--amber2)]"}>{tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}</span> },
    { key: "actions", label: "Actions", sortable: false, className: "text-right", headerClassName: "text-right", render: (tx) => <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}><button onClick={() => openEdit(tx)} disabled={busyId === tx.id} className="inline-flex items-center gap-1 rounded-xl border border-[var(--border2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)]"><Pencil size={12} /> Edit</button><button onClick={() => setDeleting(tx)} disabled={busyId === tx.id} className="inline-flex items-center gap-1 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300"><Trash2 size={12} /> Delete</button></div> },
  ], [busyId]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--s1)] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Recent transactions</div>
            <div className="text-xs text-[var(--text3)]">A faster table for reviewing, editing, and clearing financial activity on desktop.</div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">Income {formatCurrency(totalIn)}</div>
            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">Expenses {formatCurrency(totalOut)}</div>
          </div>
        </div>

        {hasRows ? (
          <AdvancedTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            onRowSelect={setSelected}
            defaultSortKey="happenedAt"
            title="Table-first review"
            description="Sort, search, hide columns, and open a side panel without leaving the dashboard."
          />
        ) : (
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--s1)] p-5">
            <EmptyState icon={<Receipt size={26} />} title="No financial records yet" description="Start with a quick add above and your new items will appear here immediately." />
          </div>
        )}
      </div>

      <SidePanel
        open={!!selected}
        title={selected ? `${selected.type === "income" ? "Income" : "Expense"} transaction` : "Transaction details"}
        description="Review details, edit the note, or remove this transaction without leaving the table."
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]"><Clock3 size={13} /> Time</div><div className="mt-2 text-sm font-semibold text-[var(--text)]">{formatDateTime(selected.happenedAt)}</div></div>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]"><Tags size={13} /> Category</div><div className="mt-2 text-sm font-semibold text-[var(--text)]">{selected.category?.name ?? "Uncategorized"}</div></div>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">Amount</div>
              <div className={`mt-2 text-3xl font-black tracking-tight ${selected.type === "income" ? "text-[var(--green)]" : "text-[var(--amber2)]"}`}>{selected.type === "income" ? "+" : "-"}{formatCurrency(selected.amount)}</div>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]"><FileText size={13} /> Note</div>
              <div className="mt-2 text-sm leading-7 text-[var(--text-2)]">{selected.note ?? "No note added for this transaction yet."}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button onClick={() => openEdit(selected)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text)]"><Pencil size={14} /> Edit</button>
              <button onClick={() => setDeleting(selected)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-300"><Trash2 size={14} /> Delete</button>
              <button onClick={() => setSelected(null)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-2)]"><PanelRightOpen size={14} /> Close</button>
            </div>
          </div>
        ) : null}
      </SidePanel>

      <Modal
        open={!!editing}
        title="Edit transaction"
        description="Update the amount or note and keep your table in sync immediately."
        onClose={() => setEditing(null)}
        footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setEditing(null)} className="rounded-2xl border border-[var(--border2)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">Cancel</button><button onClick={saveEdit} disabled={!editing || !form.amount || busyId === editing?.id} className="rounded-2xl bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busyId === editing?.id ? "Saving..." : "Save changes"}</button></div>}
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Amount</span>
            <div className="relative">
              <Wallet size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} type="number" className="modern-input pl-11" />
            </div>
            {fieldError ? <div className="field-error">{fieldError}</div> : null}
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Note</span>
            <textarea value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} rows={4} className="modern-input min-h-[112px] resize-y" placeholder="Transaction details" />
          </label>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete this transaction" description="The entry will be removed from the table and your dashboard summary will update immediately." confirmLabel="Delete transaction" busy={busyId === deleting?.id} onClose={() => setDeleting(null)} onConfirm={() => deleting && removeTx(deleting.id)} />
    </>
  );
}

const TransactionTable = memo(TransactionTableInner)
export default TransactionTable
