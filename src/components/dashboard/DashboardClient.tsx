"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  Download,
  Landmark,
  LayoutDashboard,
  Loader2,
  Moon,
  Monitor,
  PiggyBank,
  Plus,
  QrCode,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { COUNTRY_LIST } from "@/lib/i18n/countries";
import { AreaTrendChart, RingLegendChart } from "@/components/ui/Charts";
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { firstError, readApi } from "@/lib/http";
import PromptPayQR from "@/components/ui/PromptPayQR";
import BudgetForecast from "@/components/dashboard/BudgetForecast";
import { useTheme } from "@/components/ui/ThemeToggle";

// ── Types ────────────────────────────────────────────────────────────────────
type Tx = {
  id: string;
  type: string;
  amount: number;
  currency?: string;
  note?: string | null;
  happenedAt: string | Date;
  category?: { name: string; color?: string | null; icon?: string | null } | null;
};
type Budget = {
  id: string;
  categoryId: string;
  limitAmount: number;
  spent: number;
  percent: number;
  category: { name: string; color?: string | null; icon?: string | null };
};
type Goal = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  targetAmount: number;
  savedAmount: number;
  percent: number;
  deadline?: string | Date | null;
  completedAt?: string | Date | null;
};
type Sub = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextBillingAt: string | Date;
  logo?: string | null;
  color?: string | null;
  status: string;
};
type Cat = { id: string; name: string; type: string; color?: string | null };

type โหมด = "personal" | "business";
type ธีมName = "light" | "dark" | "executive" | "system";

interface Props {
  initialโหมด?: โหมด;
  user: { name: string; email: string; plan: string };
  year: number;
  month: number;
  locale: {
    currency: string;
    locale: string;
    country: string;
    timezone: string;
  };
  planLimits?: {
    budgets: number;
    goals: number;
    export: boolean;
    multiCurrency: boolean;
  };
  stats: {
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    allBalance: number;
    savingsRate: number;
  };
  cashflow: { month: string; income: number; expense: number }[];
  donut: { categoryId: string | null; name: string; color: string; amount: number }[];
  recentTransactions: Tx[];
  budgets: Budget[];
  savingsGoals: Goal[];
  subscriptions: { items: Sub[]; monthlyTotal: number; dueSoon: number };
  categories: Cat[];
  intelligence?: {
    health: { score: number; band: string };
    insights: { title: string; body: string; severity?: string }[];
    recurringDetections: { merchant: string; amount: number; interval: string; confidence: number; nextExpected?: string }[];
    monthlySummary: { headline: string; summary: string; callouts: string[] };
    smartCategories: { id: string; note?: string | null; suggested?: { keyword: string; category: string; confidence: number } | null }[];
  };
  business?: {
    invoices: { issued: number; outstanding: number; paidThisMonth: number; overdue: number };
    cashflow: { inflow: number; outflow: number; net: number };
    reports: { revenue: number; expenses: number; profit: number };
    receivables: number;
    payables: number;
    exportReady: boolean;
  };
  enterprise?: {
    organization: { name: string; teams: number; members: number; branches: number };
    approvals: { pending: number; approvedThisMonth: number; rejectedThisMonth: number };
    audit: { eventsToday: number; criticalFlags: number };
    reportByTeam: { name: string; spend: number }[];
    api: { version: string; webhookEndpoints: number; ssoReady: boolean };
  };
  showCharts?: boolean;
}

const PERSONAL_TABS = [
  { id: "overview",       icon: LayoutDashboard, label: "Overview" },
  { id: "transactions",   icon: Receipt,         label: "Transactions" },
  { id: "budget",         icon: Wallet,          label: "Budget" },
  { id: "savings",        icon: PiggyBank,       label: "Savings" },
  { id: "subscriptions",  icon: CreditCard,      label: "Subscriptions" },
  { id: "tax",            icon: Calculator,      label: "Tax" },
  { id: "promptpay",      icon: QrCode,          label: "PromptPay" },
] as const;

const BIZ_TABS = [
  { id: "overview", icon: Building2, label: "Overview" },
  { id: "transactions", icon: Receipt, label: "Cashflow" },
  { id: "budget", icon: Wallet, label: "Expenses" },
  { id: "subscriptions", icon: CreditCard, label: "Billing" },
] as const;

const ENT_TABS = [
  { id: "overview", icon: Landmark, label: "Executive" },
  { id: "transactions", icon: Receipt, label: "Audit" },
  { id: "budget", icon: Wallet, label: "Controls" },
  { id: "subscriptions", icon: CreditCard, label: "Plans" },
] as const;

const CYCLE_LABEL: Record<string, string> = {
  daily: "ทุกวัน",
  weekly: "ทุกสัปดาห์",
  monthly: "ทุกเดือน",
  quarterly: "ทุก 3 เดือน",
  yearly: "ทุกปี",
};

function makeFmt(currency: string, locale: string) {
  const fmtMoney = (n: number, curr?: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr ?? currency,
      maximumFractionDigits: 0,
    }).format(n);

  const fmtDate = (d: string | Date, opts?: Intl.DateTimeFormatOptions) =>
    new Date(d).toLocaleDateString(locale, opts);

  return { fmtMoney, fmtDate };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] ${className}`}>{children}</div>;
}

function โหมดBadge({ workspace }: { workspace: โหมด }) {
  const map = {
    personal: { label: "Personal Finance", icon: Target },
    business: { label: "Business Finance", icon: Building2 },
  } as const;
  const item = map[workspace];
  const Icon = item.icon;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--text-2)]">
      <Icon size={14} className="text-[var(--primary)]" />
      {item.label}
    </div>
  );
}

function CashflowChart({ data }: { data: Props["cashflow"] }) {
  return (
    <AreaTrendChart
      data={data.map((d) => ({ label: d.month, value: d.income, value2: d.expense }))}
      color="#34d399"
      secondaryColor="#fb7185"
    />
  );
}

function DonutLegend({ data, total }: { data: Props["donut"]; total: number; fmtMoney: (n: number) => string }) {
  if (!data.length || total <= 0) {
    return <EmptyState icon={<CreditCard size={22} />} title="ยังไม่มีข้อมูลรายจ่ายแยกหมวด" description="เมื่อเริ่มบันทึกรายจ่าย ระบบจะสรุปหมวดและสัดส่วนให้ดูในกราฟวงแหวนนี้" />;
  }
  const colors = data.map((item) => ({ label: item.name, value: item.amount, color: item.color }));
  return <RingLegendChart data={colors} total={total} />;
}

function QuickActions({ onRefresh, categories, currency }: { onRefresh: () => void; categories: Cat[]; currency: string; }) {
  const toast = useToast();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const filteredCats = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFieldError("จำนวนเงินต้องมากกว่า 0");
      return;
    }
    setFieldError("");
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: parsed, currency, categoryId: categoryId || null, note: note || null, happenedAt: new Date().toISOString() }),
    });
    const payload = await readApi(res);
    setLoading(false);
    if (res.ok && payload.success) {
      setAmount("");
      setCategoryId("");
      setNote("");
      toast.success(payload.message ?? "เพิ่มรายการสำเร็จ");
      onRefresh();
      return;
    }
    setFieldError(firstError(payload.details) ?? payload.error ?? "เพิ่มรายการไม่สำเร็จ");
    toast.error(payload.error ?? "เพิ่มรายการไม่สำเร็จ", firstError(payload.details));
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text)]">Quick add</h3>
          <p className="text-sm text-[var(--text-3)]">เพิ่มรายการได้ทันทีจาก dashboard</p>
        </div>
        <div className="rounded-2xl bg-[var(--primary-soft)] p-2 text-[var(--primary)]"><Plus size={16} /></div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["expense", "income"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${type === item ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-2)]"}`}
            >
              {item === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
        <div><input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="จำนวนเงิน" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none" required />{fieldError ? <div className="field-error">{fieldError}</div> : null}</div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none">
          <option value="">เลือกหมวดหมู่</option>
          {filteredCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="โน้ต (ไม่บังคับ)" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none" />
        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-contrast)] disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add transaction
        </button>
      </form>
    </Card>
  );
}

function BudgetPanel({ budgets: initialBudgets, fmtMoney }: { budgets: Budget[]; fmtMoney: (n: number) => string }) {
  const toast = useToast();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [newBudget, setNewBudget] = useState({ categoryId: "", limitAmount: "" });

  useEffect(() => {
    fetch("/api/categories?type=expense").then(r => r.json()).then(d => setCats(d.data ?? d ?? []));
  }, []);

  const addBudget = async () => {
    if (!newBudget.categoryId || !newBudget.limitAmount) return;
    setSaving(true);
    try {
      const now = new Date();
      const res = await fetch("/api/budget", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: newBudget.categoryId, limitAmount: Number(newBudget.limitAmount), month: now.getMonth() + 1, year: now.getFullYear() }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "เพิ่มไม่สำเร็จ"); return; }
      const b = data.data ?? data;
      const cat = cats.find(c => c.id === newBudget.categoryId);
      setBudgets(prev => [...prev, { ...b, limitAmount: Number(b.limitAmount), spent: 0, percent: 0, category: cat ?? { name: "?", color: null, icon: null } }]);
      setNewBudget({ categoryId: "", limitAmount: "" });
      setShowAdd(false);
      toast.success("เพิ่ม budget สำเร็จ");
    } finally { setSaving(false); }
  };

  const deleteBudget = async (id: string) => {
    if (!confirm("ลบ budget นี้?")) return;
    const res = await fetch(`/api/budget/${id}`, { method: "DELETE" });
    if (res.ok) { setBudgets(prev => prev.filter(b => b.id !== id)); toast.success("ลบสำเร็จ"); }
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Budget</h3>
          <p className="text-sm text-[var(--text-3)]">{budgets.length} หมวด · เดือนนี้</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}>
          <Plus size={14} /> เพิ่ม
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-2xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4 space-y-3">
          <select value={newBudget.categoryId} onChange={e => setNewBudget(p => ({ ...p, categoryId: e.target.value }))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none">
            <option value="">เลือกหมวด...</option>
            {cats.filter(c => c.type === "expense").map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input type="number" value={newBudget.limitAmount} onChange={e => setNewBudget(p => ({ ...p, limitAmount: e.target.value }))}
            placeholder="งบประมาณ (บาท)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={addBudget} disabled={saving}
              className="flex-1 rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--primary)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} บันทึก
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 rounded-xl text-sm" style={{ background: "var(--surface-2)" }}>ยกเลิก</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {budgets.length === 0 && <div className="text-sm text-center py-6 text-[var(--text-3)]">ยังไม่มี budget — กด เพิ่ม เพื่อตั้งงบหมวดค่าใช้จ่าย</div>}
        {budgets.map((b) => {
          const over = b.percent >= 100;
          const warn = b.percent >= 80;
          return (
            <div key={b.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {b.category.icon && <span>{b.category.icon}</span>}
                  <span className="font-medium">{b.category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${over ? "text-red-400" : warn ? "text-amber-400" : "text-[var(--text-3)]"}`}>
                    {fmtMoney(b.spent)} / {fmtMoney(b.limitAmount)}
                  </span>
                  <button onClick={() => deleteBudget(b.id)} className="text-[var(--text-3)] hover:text-red-400 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(b.percent, 100)}%`, background: over ? "var(--red)" : warn ? "var(--amber)" : (b.category.color ?? "var(--primary)") }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function GoalsPanel({ goals: initialGoals, fmtMoney }: { goals: Goal[]; fmtMoney: (n: number) => string }) {
  const toast = useToast();
  const [goals, setGoals] = useState(initialGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", icon: "🎯", color: "#8b5cf6", deadline: "" });
  const [saving, setSaving] = useState(false);

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/savings", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGoal.name, targetAmount: Number(newGoal.targetAmount), icon: newGoal.icon, color: newGoal.color, deadline: newGoal.deadline || null }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "เพิ่มไม่สำเร็จ"); return; }
      const g = data.data ?? data;
      setGoals(prev => [{ ...g, percent: 0, savedAmount: 0, targetAmount: Number(g.targetAmount) }, ...prev]);
      setNewGoal({ name: "", targetAmount: "", icon: "🎯", color: "#8b5cf6", deadline: "" });
      setShowAdd(false);
      toast.success("เพิ่มเป้าหมายสำเร็จ");
    } finally { setSaving(false); }
  };

  const deposit = async (goalId: string) => {
    if (!depositAmt || Number(depositAmt) <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/savings/${goalId}/deposit`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(depositAmt) }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "ฝากเงินไม่สำเร็จ"); return; }
      setGoals(prev => prev.map(g => {
        if (g.id !== goalId) return g;
        const newSaved = g.savedAmount + Number(depositAmt);
        const percent = Math.min(100, Math.round((newSaved / g.targetAmount) * 100));
        return { ...g, savedAmount: newSaved, percent };
      }));
      setDepositId(null); setDepositAmt("");
      toast.success(data.completed ? "🎉 บรรลุเป้าหมายแล้ว!" : "ฝากเงินสำเร็จ");
    } finally { setSaving(false); }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm("ลบเป้าหมายนี้?")) return;
    const res = await fetch(`/api/savings/${goalId}`, { method: "DELETE" });
    if (res.ok) { setGoals(prev => prev.filter(g => g.id !== goalId)); toast.success("ลบเป้าหมายสำเร็จ"); }
  };

  const EMOJIS = ["🎯","🏠","🚗","✈️","📱","💎","🎓","💒","🛒","💪"];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Savings Goals</h3>
            <p className="text-sm text-[var(--text-3)]">{goals.length} เป้าหมาย</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}>
            <Plus size={14} /> เพิ่ม
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-2xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex flex-wrap gap-1 mb-1">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewGoal(p => ({ ...p, icon: e }))}
                    className={`text-base rounded-lg p-1 ${newGoal.icon === e ? "bg-[var(--primary)] ring-2 ring-[var(--primary)]" : "bg-[var(--surface-2)]"}`}>{e}</button>
                ))}
              </div>
            </div>
            <input value={newGoal.name} onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))}
              placeholder="ชื่อเป้าหมาย เช่น ซื้อบ้าน"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal(p => ({ ...p, targetAmount: e.target.value }))}
                placeholder="เป้าหมาย (บาท)"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
              <input type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={addGoal} disabled={saving}
                className="flex-1 rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "var(--primary)" }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : null} บันทึก
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 rounded-xl text-sm" style={{ background: "var(--surface-2)" }}>ยกเลิก</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {goals.length === 0 && <div className="text-sm text-center py-6 text-[var(--text-3)]">ยังไม่มีเป้าหมาย — กด เพิ่ม เพื่อเริ่มออมเงิน</div>}
          {goals.map((g) => (
            <div key={g.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{g.icon ?? "🎯"}</span>
                  <div>
                    <div className="font-medium text-sm">{g.name}</div>
                    {g.completedAt && <div className="text-xs text-green-400">✓ สำเร็จแล้ว</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: g.color ?? "var(--primary)" }}>{g.percent}%</span>
                  <button onClick={() => deleteGoal(g.id)} className="text-[var(--text-3)] hover:text-red-400 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div className="h-2 rounded-full transition-all" style={{ width: `${g.percent}%`, background: g.color ?? "var(--primary)" }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--text-3)]">{fmtMoney(g.savedAmount)} / {fmtMoney(g.targetAmount)}</div>
                {!g.completedAt && (
                  depositId === g.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)}
                        placeholder="จำนวน" className="w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs focus:outline-none" />
                      <button onClick={() => deposit(g.id)} disabled={saving}
                        className="rounded-lg px-2 py-1 text-xs font-bold text-white" style={{ background: "var(--primary)" }}>ฝาก</button>
                      <button onClick={() => { setDepositId(null); setDepositAmt(""); }} className="rounded-lg px-2 py-1 text-xs" style={{ background: "var(--surface-2)" }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setDepositId(g.id); setDepositAmt(""); }}
                      className="text-xs font-semibold rounded-lg px-2 py-1" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>+ ฝากเงิน</button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SubsPanel({ subs: initialSubs, fmtMoney, fmtDate }: { subs: Props['subscriptions']; fmtMoney: (n: number) => string; fmtDate: (d: string | Date, opts?: Intl.DateTimeFormatOptions) => string }) {
  const toast = useToast();
  const [items, setItems] = useState(initialSubs?.items ?? []);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", amount: "", billingCycle: "monthly", nextBillingAt: "", color: "#8b5cf6" });

  const monthlyTotal = items.filter(s => s.status === "active").reduce((sum, s) => {
    const mult: Record<string,number> = { daily:30, weekly:4.33, monthly:1, quarterly:1/3, yearly:1/12 };
    return sum + s.amount * (mult[s.billingCycle] ?? 1);
  }, 0);

  const addSub = async () => {
    if (!newSub.name || !newSub.amount || !newSub.nextBillingAt) return;
    setSaving(true);
    try {
      const res = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSub.name, amount: Number(newSub.amount), billingCycle: newSub.billingCycle, nextBillingAt: newSub.nextBillingAt, color: newSub.color }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "เพิ่มไม่สำเร็จ"); return; }
      const s = data.data ?? data;
      setItems(prev => [...prev, { ...s, amount: Number(s.amount), status: "active" }]);
      setNewSub({ name: "", amount: "", billingCycle: "monthly", nextBillingAt: "", color: "#8b5cf6" });
      setShowAdd(false);
      toast.success("เพิ่ม subscription สำเร็จ");
    } finally { setSaving(false); }
  };

  const deleteSub = async (id: string) => {
    if (!confirm("ลบ subscription นี้?")) return;
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) { setItems(prev => prev.filter(s => s.id !== id)); toast.success("ลบสำเร็จ"); }
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Subscriptions</h3>
          <p className="text-sm text-[var(--text-3)]">จ่ายรายเดือน {fmtMoney(monthlyTotal)}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}>
          <Plus size={14} /> เพิ่ม
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-2xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4 space-y-3">
          <input value={newSub.name} onChange={e => setNewSub(p => ({ ...p, name: e.target.value }))}
            placeholder="ชื่อ เช่น Netflix, Spotify"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={newSub.amount} onChange={e => setNewSub(p => ({ ...p, amount: e.target.value }))}
              placeholder="ค่าบริการ (บาท)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none" />
            <select value={newSub.billingCycle} onChange={e => setNewSub(p => ({ ...p, billingCycle: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none">
              <option value="monthly">รายเดือน</option>
              <option value="yearly">รายปี</option>
              <option value="weekly">รายสัปดาห์</option>
              <option value="quarterly">รายไตรมาส</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-3)] mb-1 block">วันที่ชำระครั้งถัดไป</label>
            <input type="date" value={newSub.nextBillingAt} onChange={e => setNewSub(p => ({ ...p, nextBillingAt: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addSub} disabled={saving}
              className="flex-1 rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--primary)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} บันทึก
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 rounded-xl text-sm" style={{ background: "var(--surface-2)" }}>ยกเลิก</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-center py-6 text-[var(--text-3)]">ยังไม่มี subscription — กด เพิ่ม เพื่อเพิ่มรายการ</div>}
        {items.map((s) => {
          const now = new Date();
          const daysLeft = Math.ceil((new Date(s.nextBillingAt).getTime() - now.getTime()) / 86400000);
          const isDue = daysLeft <= 7 && daysLeft >= 0;
          return (
            <div key={s.id} className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${isDue ? "border-amber-500/30 bg-amber-500/5" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.name}</div>
                <div className="text-xs" style={{ color: isDue ? "var(--amber)" : "var(--text-3)" }}>
                  {CYCLE_LABEL[s.billingCycle] ?? s.billingCycle} · {isDue ? `${daysLeft} วัน` : fmtDate(s.nextBillingAt, { dateStyle: "medium" })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-sm font-semibold">{fmtMoney(s.amount)}</div>
                <button onClick={() => deleteSub(s.id)} className="text-[var(--text-3)] hover:text-red-400 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function InsightsPanel({ workspace, props, fmtMoney }: { workspace: โหมด; props: Props; fmtMoney: (n: number) => string }) {
  const topSpend = props.donut[0];
  const insights = workspace === "personal"
    ? [
        `คุณออมเงินได้ ${props.stats.savingsRate}% ของรายรับเดือนนี้`,
        topSpend ? `หมวดใช้จ่ายสูงสุดคือ ${topSpend.name} (${fmtMoney(topSpend.amount)})` : "ยังไม่มีค่าใช้จ่ายรายหมวดในเดือนนี้",
        props.subscriptions.dueSoon > 0 ? `มี subscription ครบกำหนด ${props.subscriptions.dueSoon} รายการใน 7 วัน` : "ยังไม่มี subscription ที่ใกล้ครบกำหนด",
      ]
    : workspace === "business"
      ? [
          `รายรับเดือนนี้ ${fmtMoney(props.stats.monthIncome)} และกำไรเบื้องต้น ${fmtMoney(props.stats.monthBalance)}`,
          `ควรติดตามค่าใช้จ่ายหมวดหลักเพื่อควบคุม margin ของธุรกิจ`,
          `ใช้ export/report เพื่อส่งต่อบัญชีและภาษีได้เร็วขึ้น`,
        ]
      : [
          `องค์กรพร้อมขยายด้วยโครงสร้าง role-based และ billing plan ระดับ ${props.user.plan}`,
          `ควรเพิ่ม approval flow และ audit policies สำหรับทีม`,
          `Executive theme เหมาะสำหรับการประชุมและรายงานผู้บริหาร`,
        ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI-style insights</h3>
          <p className="text-sm text-[var(--text-3)]">สรุปให้ดูแบบผู้บริหารและพร้อมตัดสินใจ</p>
        </div>
        <Sparkles className="text-[var(--primary)]" size={18} />
      </div>
      <div className="space-y-3">
        {insights.map((text) => (
          <div key={text} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-2)]">
            <div className="mt-0.5 rounded-xl bg-[var(--primary-soft)] p-1 text-[var(--primary)]"><Check size={14} /></div>
            <div>{text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TransactionsTable({ data: initialData, fmtMoney, fmtDate, currency, onRefresh }: { data: Tx[]; fmtMoney: (n: number, curr?: string) => string; fmtDate: (d: string | Date, opts?: Intl.DateTimeFormatOptions) => string; currency: string; onRefresh?: () => void }) {
  const toast = useToast();
  const [data, setData] = useState(initialData ?? []);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteTransaction = async (id: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => prev.filter(tx => tx.id !== id));
        toast.success("ลบรายการสำเร็จ");
        onRefresh?.();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "ลบไม่สำเร็จ");
      }
    } finally { setDeletingId(null); }
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">รายการล่าสุด</h3>
          <p className="text-sm text-[var(--text-3)]">{data.length} รายการ</p>
        </div>
        <Receipt className="text-[var(--primary)]" size={18} />
      </div>
      <div className="space-y-2">
        {data.length === 0 && <div className="text-center text-sm py-6 text-[var(--text-3)]">ยังไม่มีรายการ — กด + เพื่อเพิ่มรายการแรก</div>}
        {data.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 group hover:border-[var(--primary)]/30 transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
              style={{ background: tx.category?.color ? `${tx.category.color}22` : "var(--surface-3)" }}>
              {tx.category?.icon ?? (tx.type === "income" ? "💰" : "💸")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{tx.note ?? tx.category?.name ?? "รายการ"}</div>
              <div className="text-xs text-[var(--text-3)]">{fmtDate(tx.happenedAt, { dateStyle: "medium" })} {tx.category && `· ${tx.category.name}`}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                {tx.type === "income" ? "+" : "-"}{fmtMoney(tx.amount, tx.currency ?? currency)}
              </div>
              <button onClick={() => deleteTransaction(tx.id)} disabled={deletingId === tx.id}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-3)] hover:text-red-400 transition-all disabled:opacity-40">
                {deletingId === tx.id ? <Loader2 size={12} className="animate-spin" /> : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


function โหมดOverview({ workspace, props, fmtMoney, fmtDate, onRefresh }: { workspace: โหมด; props: Props; fmtMoney: (n: number, curr?: string) => string; fmtDate: (d: string | Date, opts?: Intl.DateTimeFormatOptions) => string; onRefresh: () => void }) {
  const cards = workspace === 'personal'
    ? [
        { label: 'Income', value: fmtMoney(props.stats.monthIncome), icon: TrendingUp, tone: 'text-emerald-500' },
        { label: 'Expense', value: fmtMoney(props.stats.monthExpense), icon: TrendingDown, tone: 'text-rose-500' },
        { label: 'Balance', value: fmtMoney(props.stats.monthBalance), icon: Wallet, tone: 'text-[var(--primary)]' },
        { label: 'Savings Rate', value: `${props.stats.savingsRate}%`, icon: PiggyBank, tone: 'text-sky-500' },
      ]
    : workspace === 'business'
      ? [
          { label: 'Revenue', value: fmtMoney(props.stats.monthIncome), icon: TrendingUp, tone: 'text-emerald-500' },
          { label: 'Operating Cost', value: fmtMoney(props.stats.monthExpense), icon: TrendingDown, tone: 'text-rose-500' },
          { label: 'Gross Profit', value: fmtMoney(props.stats.monthBalance), icon: Wallet, tone: 'text-[var(--primary)]' },
          { label: 'Recurring Cost', value: fmtMoney(props.subscriptions.monthlyTotal), icon: CreditCard, tone: 'text-sky-500' },
        ]
      : [
          { label: 'Org Cash Position', value: fmtMoney(props.stats.allBalance), icon: Landmark, tone: 'text-[var(--primary)]' },
          { label: 'Spend This Month', value: fmtMoney(props.stats.monthExpense), icon: TrendingDown, tone: 'text-rose-500' },
          { label: 'Controls Coverage', value: `${Math.max(70, 100 - Math.min(25, props.budgets.filter((b) => b.percent >= 100).length * 8))}%`, icon: Check, tone: 'text-emerald-500' },
          { label: 'Items for Review', value: `${props.subscriptions.dueSoon + props.budgets.filter((b) => b.percent >= 90).length}`, icon: Receipt, tone: 'text-sky-500' },
        ];

  const donutTotal = props.donut.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--text-3)]">{card.label}</div>
                  <div className="mt-1 text-2xl font-black tracking-tight">{card.value}</div>
                </div>
                <div className={`rounded-2xl bg-[var(--surface-2)] p-3 ${card.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-xs text-[var(--text-3)]">โหมด analytics</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_.95fr]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Cashflow</h3>
              <p className="text-sm text-[var(--text-3)]">แนวโน้ม 6 เดือนล่าสุด</p>
            </div>
            <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-3)]">{workspace}</div>
          </div>
          {props.showCharts !== false ? <CashflowChart data={props.cashflow} /> : <PreferenceDisabledBlock compact title="Cashflow chart ถูกปิด" />}
        </Card>

        <Card className="p-5">
          <div className="mb-5">
            <h3 className="font-semibold">Expense mix</h3>
            <p className="text-sm text-[var(--text-3)]">หมวดค่าใช้จ่ายหลักของเดือนนี้</p>
          </div>
          {props.showCharts !== false ? <DonutLegend data={props.donut} total={donutTotal} fmtMoney={fmtMoney} /> : <PreferenceDisabledBlock compact title="Expense mix chart ถูกปิด" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPanel workspace={workspace} props={props} fmtMoney={fmtMoney} />
          {props.intelligence ? (
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">AI insights</h3>
                  <p className="text-sm text-[var(--text-3)]">Health score, smart categorization, recurring detection และ monthly summary</p>
                </div>
                <Sparkles className="text-[var(--primary)]" size={18} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">Health score</div>
                  <div className="mt-2 text-3xl font-black">{props.intelligence.health.score}<span className="text-base font-semibold text-[var(--text-3)]">/100</span></div>
                  <div className="mt-1 text-sm capitalize text-[var(--text-2)]">{props.intelligence.health.band}</div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">Monthly summary</div>
                  <div className="mt-2 text-sm text-[var(--text-2)]">{props.intelligence.monthlySummary.summary}</div>
                  <div className="mt-3 space-y-1">
                    {(props.intelligence.monthlySummary?.callouts ?? []).map((item) => <div key={item} className="text-sm">• {item}</div>)}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="mb-2 font-medium">Recurring detection</div>
                  <div className="space-y-2">
                    {(props.intelligence.recurringDetections ?? []).length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่พบ recurring transaction</div> : props.intelligence.recurringDetections.map((item) => (
                      <div key={`${item.merchant}-${item.amount}`} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{item.merchant}</span>
                        <span className="font-semibold">{fmtMoney(item.amount)} · {item.interval}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="mb-2 font-medium">Smart categorization</div>
                  <div className="space-y-2">
                    {(props.intelligence.smartCategories ?? []).length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มี category suggestion</div> : props.intelligence.smartCategories.slice(0,4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-[var(--text-2)]">{item.note || 'ไม่มีโน้ต'}</span>
                        <span className="rounded-full bg-[var(--primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">{item.suggested?.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
          {workspace === 'business' && props.business ? (
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Business finance suite</h3>
                  <p className="text-sm text-[var(--text-3)]">Invoice / quotation, AR/AP, cashflow dashboard, simple P&L, export-ready</p>
                </div>
                <Building2 className="text-[var(--primary)]" size={18} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">Issued invoices {props.business.invoices.issued} · Outstanding {props.business.invoices.outstanding} · Overdue {props.business.invoices.overdue}</div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">Cashflow {fmtMoney(props.business.cashflow.inflow)} in / {fmtMoney(props.business.cashflow.outflow)} out / {fmtMoney(props.business.cashflow.net)} net</div>
              </div>
              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">Receivables {fmtMoney(props.business.receivables)} · Payables {fmtMoney(props.business.payables)} · Export ready {props.business.exportReady ? 'yes' : 'no'}</div>
            </Card>
          ) : null}
          {workspace === 'personal' ? <QuickActions onRefresh={onRefresh} categories={props.categories} currency={props.locale.currency} /> : null}
          {workspace === 'personal' ? <BudgetForecast /> : null}
          <BudgetPanel budgets={props.budgets} fmtMoney={fmtMoney} />
          <GoalsPanel goals={props.savingsGoals} fmtMoney={fmtMoney} />
        </div>
        <SubsPanel subs={props.subscriptions} fmtMoney={fmtMoney} fmtDate={fmtDate} />
      </div>

      <TransactionsTable data={props.recentTransactions} fmtMoney={fmtMoney} fmtDate={fmtDate} currency={props.locale.currency} onRefresh={onRefresh} />
    </div>
  );
}


// ─── Real Tax Calculator Panel ────────────────────────────────────────────────
function TaxPanel({ userCountry, currency }: { userCountry?: string; currency: string }) {
  const [country, setCountry] = useState(userCountry ?? "TH")
  const [income, setIncome] = useState("")
  const [otherIncome, setOtherIncome] = useState("")
  const [deductions, setDeductions] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [useActual, setUseActual] = useState(false)

  const selectedCountry = COUNTRY_LIST.find((c) => c.code === country) ?? COUNTRY_LIST[0]

  const DEDUCTION_FIELDS: Record<string, { label: string; max?: number; countries: string[] }> = {
    personalAllowance: { label: "Personal Allowance", countries: ["TH","SG","MY","JP","US","GB","AU","DE"] },
    ssf:               { label: "SSF / กองทุนรวมเพื่อการออม (THB)", max: 200_000, countries: ["TH"] },
    rmf:               { label: "RMF (THB)", max: 500_000, countries: ["TH"] },
    lifeInsurance:     { label: "ประกันชีวิต", countries: ["TH","MY"] },
    healthInsurance:   { label: "ประกันสุขภาพ", max: 25_000, countries: ["TH"] },
    socialSecurity:    { label: "ประกันสังคม", max: 9_000, countries: ["TH"] },
    donation:          { label: "บริจาค (ก่อน x2)", countries: ["TH"] },
    homeLoanInterest:  { label: "ดอกเบี้ยบ้าน", max: 100_000, countries: ["TH"] },
    spouseAllowance:   { label: "ค่าลดหย่อนคู่สมรส", countries: ["TH"] },
    childAllowance:    { label: "ค่าลดหย่อนบุตร (ต่อคน)", countries: ["TH"] },
    parentAllowance:   { label: "ค่าลดหย่อนพ่อแม่ (ต่อคน)", countries: ["TH"] },
  }

  const visibleFields = Object.entries(DEDUCTION_FIELDS).filter(([, v]) => v.countries.includes(country) || v.countries.includes("ALL"))

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const body: Record<string, any> = {
        country,
        year: new Date().getFullYear(),
        salaryIncome: Number(income) || 0,
        otherIncome: Number(otherIncome) || 0,
        useActualIncome: useActual,
      }
      for (const [k, v] of Object.entries(deductions)) {
        if (v) body[k] = Number(v)
      }
      const res = await fetch("/api/tax", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setResult({ error: data.error ?? "คำนวณไม่สำเร็จ" })
    } catch {
      setResult({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" })
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString(selectedCountry.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input panel */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[var(--primary-soft)] p-2"><Calculator size={16} className="text-[var(--primary)]" /></div>
            <div>
              <div className="font-bold text-sm">Tax Calculator</div>
              <div className="text-xs text-[var(--text-3)]">ปีภาษี {new Date().getFullYear()}</div>
            </div>
          </div>
          {/* Country picker */}
          <div className="relative">
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-xs">{selectedCountry.code}</span>
              <ChevronDown size={12} />
            </button>
            {showCountryPicker && (
              <div className="absolute right-0 top-10 z-50 max-h-64 w-52 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
                {COUNTRY_LIST.map((ct) => (
                  <button key={ct.code} onClick={() => { setCountry(ct.code); setShowCountryPicker(false); setResult(null) }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-2)] ${ct.code === country ? "font-bold text-[var(--primary)]" : ""}`}>
                    <span>{ct.flag}</span>
                    <span className="flex-1 text-left">{ct.name}</span>
                    <span className="text-xs text-[var(--text-3)]">{ct.currency}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Use actual income toggle */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <div onClick={() => setUseActual(!useActual)} className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${useActual ? "bg-[var(--primary)]" : "bg-[var(--surface-2)]"}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useActual ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-sm text-[var(--text-2)]">ดึงรายได้จริงจาก transactions อัตโนมัติ</span>
        </label>

        {!useActual && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">รายได้หลัก ({selectedCountry.currency})</label>
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">รายได้อื่น ({selectedCountry.currency})</label>
              <input type="number" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
          </div>
        )}

        {/* Deductions */}
        {visibleFields.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-[var(--text-3)] mb-2 flex items-center gap-1"><Info size={11} /> รายการลดหย่อน</div>
            <div className="space-y-2">
              {visibleFields.map(([key, field]) => (
                <div key={key}>
                  <label className="text-xs text-[var(--text-3)] mb-1 block">{field.label}{field.max ? ` (สูงสุด ${field.max.toLocaleString()})` : ""}</label>
                  <input type="number" value={deductions[key] ?? ""} onChange={(e) => setDeductions((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="0" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleCalculate} disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "var(--primary)" }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Calculator size={15} />}
          คำนวณภาษี
        </button>

        {result?.note && (
          <div className="mt-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-xs text-yellow-400">
            ⚠️ {result.note}
          </div>
        )}
      </Card>

      {/* Results panel */}
      <div className="space-y-4">
        {result?.error && (
          <Card className="p-5">
            <div className="text-red-400 text-sm">{result.error}</div>
          </Card>
        )}

        {result && !result.error && (
          <>
            {/* Summary */}
            <Card className="p-5">
              <div className="text-sm font-semibold text-[var(--text-3)] mb-3">สรุปภาษี {selectedCountry.flag} {selectedCountry.name}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["รายได้รวม", fmt(result.totalIncome), "var(--text)"],
                  ["ลดหย่อนรวม", fmt(result.totalDeductions), "var(--green)"],
                  ["รายได้ที่ต้องเสียภาษี", fmt(result.taxableIncome), "var(--amber)"],
                  ["ภาษีที่ต้องชำระ", fmt(result.tax), "var(--red)"],
                ].map(([label, val, color]) => (
                  <div key={label} className="rounded-xl bg-[var(--surface-2)] p-3">
                    <div className="text-xs text-[var(--text-3)] mb-1">{label}</div>
                    <div className="font-black text-lg" style={{ color }}>{val}</div>
                    <div className="text-xs text-[var(--text-3)]">{result.currency}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3 flex items-center justify-between">
                <span className="text-sm text-[var(--text-2)]">Effective Tax Rate</span>
                <span className="text-xl font-black text-[var(--primary)]">{result.effectiveRate}%</span>
              </div>
            </Card>

            {/* Brackets */}
            {result.brackets?.length > 0 && (
              <Card className="p-5">
                <div className="text-sm font-semibold text-[var(--text-3)] mb-3">Tax Brackets</div>
                <div className="space-y-2">
                  {result.brackets.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-[var(--text-3)] w-32 shrink-0">{b.bracket}</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--surface-2)]">
                        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(b.rate * 2, 100)}%` }} />
                      </div>
                      <div className="text-xs font-semibold w-10 text-right" style={{ color: "var(--text)" }}>{b.rate.toFixed(0)}%</div>
                      <div className="text-xs w-20 text-right" style={{ color: "var(--text-3)" }}>{fmt(b.tax)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <Card className="p-5">
                <div className="text-sm font-semibold text-[var(--text-3)] mb-3 flex items-center gap-1.5"><Sparkles size={14} className="text-[var(--amber)]" /> คำแนะนำ</div>
                <div className="space-y-2">
                  {result.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-[var(--text-2)]">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--green)" }} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {!result && (
          <Card className="p-8 text-center">
            <Globe size={32} className="mx-auto mb-3" style={{ color: "var(--text-3)" }} />
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-2)" }}>รองรับ {COUNTRY_LIST.length} ประเทศ</div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>เลือกประเทศ ใส่รายได้ แล้วกด คำนวณภาษี</div>
          </Card>
        )}
      </div>
    </div>
  )
}

function PlaceholderPanel({ title, description, bullets }: { title: string; description: string; bullets: string[] }) {
  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-2xl bg-[var(--primary-soft)] p-2 text-[var(--primary)]"><Sparkles size={18} /></div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-[var(--text-3)]">{description}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-[var(--text-2)]">
        {bullets.map((item) => <div key={item}>• {item}</div>)}
      </div>
    </Card>
  );
}

export default function DashboardClient(props: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [workspace, setโหมด] = useState<โหมด>(props.initialโหมด ?? "personal");
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<string>("overview");

  const currency = props.locale.currency;
  const localeCode = props.locale.locale;
  const { fmtMoney, fmtDate } = useMemo(() => makeFmt(currency, localeCode), [currency, localeCode]);

  useEffect(() => {
    setโหมด(props.initialโหมด ?? "personal");
  }, [props.initialโหมด]);

  useEffect(() => {
    window.localStorage.setItem("paymap-workspace", workspace);
    setTab("overview");
  }, [workspace]);

  const handleRefresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  // v1.8: Listen for QuickAdd events — refresh dashboard data immediately
  useEffect(() => {
    const onTxAdded = () => {
      startTransition(() => router.refresh());
    };
    window.addEventListener("paymap:tx-added", onTxAdded);
    return () => window.removeEventListener("paymap:tx-added", onTxAdded);
  }, [router]);

  const tabs = workspace === "personal" ? PERSONAL_TABS : workspace === "business" ? BIZ_TABS : ENT_TABS;

  function exportData(format: "csv" | "json") {
    window.open(`/api/export?format=${format}&type=transactions&year=${props.year}&month=${props.month}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {isPending && <div className="mb-4 h-1 rounded-full bg-[var(--primary)]/30"><div className="h-1 w-1/2 animate-pulse rounded-full bg-[var(--primary)]" /></div>}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <โหมดBadge workspace={workspace} />
                <h1 className="mt-4 text-3xl font-black tracking-tight">PayMap dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--text-3)]">
                  ภาพรวมการเงินส่วนตัวที่พร้อมใช้งานจริง ทั้งรายการ งบประมาณ เป้าหมาย และรายงานสำคัญ
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">โหมด</div>
                  <div className="mt-3 flex gap-2">
                    <div className="rounded-2xl px-3 py-2 text-xs font-semibold capitalize bg-[var(--primary)] text-[var(--primary-contrast)]">
                        personal
                      </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">ธีม</div>
                  <div className="mt-3 flex gap-2">
                    {(["light", "dark", "executive", "system"] as ธีมName[]).map((item) => (
                      <button key={item} onClick={() => void setTheme(item)} className={`inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold capitalize ${theme === item ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "bg-[var(--card)] text-[var(--text-2)] border border-[var(--border)]"}`}>
                        {item === 'light' ? <Sun size={12} /> : item === 'dark' ? <Moon size={12} /> : item === 'system' ? <Monitor size={12} /> : <Sparkles size={12} />}
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">บัญชี</div>
                <div className="mt-2 text-xl font-bold">{props.user.name}</div>
                <div className="text-sm text-[var(--text-3)]">{props.user.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                  <div className="text-[var(--text-3)]">Plan</div>
                  <div className="mt-1 font-semibold capitalize">{props.user.plan}</div>
                </div>
                <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                  <div className="text-[var(--text-3)]">Currency</div>
                  <div className="mt-1 font-semibold">{props.locale.currency}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportData("csv")} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text-2)]"><Download size={14} /> CSV</button>
                <button onClick={() => exportData("json")} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text-2)]"><Download size={14} /> JSON</button>
                <a href="/settings" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-3 py-2 text-sm font-bold text-[var(--primary-contrast)]"><Settings size={14} /> Settings</a>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${tab === item.id ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'border border-[var(--border)] bg-[var(--card)] text-[var(--text-2)]'}`}>
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && <โหมดOverview workspace={workspace} props={props} fmtMoney={fmtMoney} fmtDate={fmtDate} onRefresh={handleRefresh} />}

        {tab === "transactions" && (
          workspace === "personal" ? (
            <TransactionsTable data={props.recentTransactions} fmtMoney={fmtMoney} fmtDate={fmtDate} currency={props.locale.currency} onRefresh={handleRefresh} />
          ) : (
            <TransactionsTable data={props.recentTransactions} fmtMoney={fmtMoney} fmtDate={fmtDate} currency={props.locale.currency} onRefresh={handleRefresh} />
          )
        )}

        {tab === "budget" && (
          <BudgetPanel budgets={props.budgets} fmtMoney={fmtMoney} />
        )}

        {tab === "savings" && workspace === "personal" && <GoalsPanel goals={props.savingsGoals} fmtMoney={fmtMoney} />}
        {tab === "subscriptions" && <SubsPanel subs={props.subscriptions} fmtMoney={fmtMoney} fmtDate={fmtDate} />}
        {tab === "promptpay" && workspace === "personal" && (
          <div className="grid gap-6 md:grid-cols-2">
            <PromptPayQR />
            <div className="glass-card rounded-[28px] p-6">
              <div className="mb-4 text-sm font-black">วิธีใช้ PromptPay QR</div>
              <div className="space-y-3 text-sm text-[var(--text-2)]">
                <p>1. ใส่เบอร์โทรหรือเลขบัตรประชาชนของคุณ</p>
                <p>2. ระบุจำนวนเงินถ้าต้องการ (หรือเว้นว่างให้ผู้โอนกรอกเอง)</p>
                <p>3. กด "สร้าง QR" — ระบบสร้าง QR มาตรฐาน EMVCo ให้ทันที</p>
                <p>4. แชร์ QR หรือดาวน์โหลด PNG ใช้ได้ทุกแอปธนาคาร</p>
              </div>
              <div className="mt-5 rounded-2xl bg-sky-500/10 p-4 text-xs text-sky-400">
                🔒 ข้อมูลไม่ถูกส่งออกนอก payMap — QR สร้างในเครื่อง มาตรฐานเดียวกับธนาคาร
              </div>
            </div>
          </div>
        )}
        {tab === "tax" && workspace === "personal" && (
          <TaxPanel userCountry={props.locale.country} currency={props.locale.currency} />
        )}
      </div>
    </div>
  );
}
