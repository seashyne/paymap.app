"use client";
// v0.4: This component is now integrated into DashboardClient as AddTxForm.
// Kept for backward compatibility. Uses router.refresh() instead of window.location.reload()
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

type Category = { id: string; name: string; type: "income" | "expense"; color?: string | null };

export default function AddTransactionForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [type, setType]             = useState<"income" | "expense">("expense");
  const [amount, setAmount]         = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote]             = useState("");
  const [happenedAt, setHappenedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState<string | null>(null);
  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: Number(amount), categoryId: categoryId || null, note: note || null, happenedAt: new Date(happenedAt).toISOString() }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setMessage(json.error ?? "บันทึกรายการไม่สำเร็จ"); return; }
    setAmount(""); setCategoryId(""); setNote("");
    setMessage("บันทึกรายการสำเร็จ ✓");
    // v0.4: router.refresh() instead of window.location.reload()
    setTimeout(() => router.refresh(), 500);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">เพิ่มรายการใหม่</div>
        <PlusCircle size={18} className="text-[var(--amber)]"/>
      </div>
      {message && <p className={`text-[13px] ${message.includes("สำเร็จ")?"text-[var(--green)]":"text-[var(--red)]"}`}>{message}</p>}
      <input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="จำนวนเงิน" required
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--s3)] text-[var(--text)] text-[14px] px-3 py-2.5 focus:outline-none focus:border-[var(--amber)]"/>
      <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--s3)] text-[var(--text)] text-[14px] px-3 py-2.5 focus:outline-none focus:border-[var(--amber)]">
        <option value="">หมวดหมู่</option>
        {filteredCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--amber)] text-black font-bold py-2.5 text-[14px] transition-colors disabled:opacity-50">
        บันทึก
      </button>
    </form>
  );
}
