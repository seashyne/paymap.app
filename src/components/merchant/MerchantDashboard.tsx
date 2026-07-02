"use client";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart2, Package, Pencil, Plus, Search, ShoppingCart, Store, Trash2, TrendingUp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { AreaTrendChart, GroupedBarChart, RingLegendChart } from "@/components/ui/Charts";
import PreferenceDisabledBlock from "@/components/ui/PreferenceDisabledBlock";
import { firstError, readApi } from "@/lib/http";

type StoreType = { id: string; name: string; vatRegistered: boolean; currency: string } | null;
type InventoryItem = { id: string; name: string; sku: string | null; salePrice: number; stockQty: number; minStockQty: number; category: string | null; status: string };

interface Props {
  user: { name: string };
  store: StoreType;
  todaySales: { total: number; orders: number };
  monthSales: { total: number; vat: number; orders: number };
  lowStockCount: number;
  inventoryItems: InventoryItem[];
  topProducts: { productId: string; name: string; sku: string | null; qty: number; revenue: number }[];
}

function fmt(n: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n); }

export default function MerchantDashboard({ user, store, todaySales, monthSales, lowStockCount, inventoryItems, topProducts, showCharts = true }: Props & { showCharts?: boolean }) {
  const [tab, setTab] = useState<"overview" | "inventory" | "pos" | "reports">("overview");
  const tabs = [{ id: "overview", label: "Overview" }, { id: "inventory", label: "Inventory" }, { id: "pos", label: "POS" }, { id: "reports", label: "Reports" }] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="glass-card mb-6 rounded-[30px] p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-title">Merchant workspace</div>
            <div className="mt-2 text-3xl font-black">{store?.name ?? `สวัสดี ${user.name}`}</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">หน้าร้านเวอร์ชัน polish เน้นดูตัวเลขเร็ว แก้ไขข้อมูลได้สบายขึ้น และใช้งานบนมือถือได้ดีขึ้น</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniInfo label="วันนี้" value={fmt(todaySales.total)} icon={<ShoppingCart size={15} />} />
            <MiniInfo label="เดือนนี้" value={fmt(monthSales.total)} icon={<TrendingUp size={15} />} />
            <MiniInfo label="Low stock" value={`${lowStockCount} รายการ`} icon={<AlertTriangle size={15} />} />
          </div>
        </div>
      </section>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-pill ${tab === t.id ? "active" : ""}`} style={tab === t.id ? { background: "linear-gradient(135deg,#fb7185,#e11d48)" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <MerchantOverview store={store} todaySales={todaySales} monthSales={monthSales} lowStockCount={lowStockCount} topProducts={topProducts} showCharts={showCharts} />}
      {tab === "inventory" && <InventoryTab store={store} lowStockCount={lowStockCount} inventoryItems={inventoryItems} />}
      {tab === "pos" && <POSTab store={store} inventoryItems={inventoryItems} />}
      {tab === "reports" && <ReportsTab store={store} monthSales={monthSales} inventoryItems={inventoryItems} topProducts={topProducts} showCharts={showCharts} />}
    </div>
  );
}

function MiniInfo({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="soft-panel rounded-[22px] px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{icon}{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>;
}

function StatCard({ icon: Icon, label, value, sub, color = "#fb7185" }: any) {
  return <div className="stat-tile"><div className="mb-4 w-fit rounded-[20px] p-3" style={{ background: `${color}18` }}><Icon size={20} style={{ color }} /></div><div className="text-2xl font-black md:text-3xl">{value}</div><div className="mt-1 text-sm text-[var(--text-2)]">{label}</div>{sub ? <div className="mt-1 text-xs font-mono text-[var(--text-3)]">{sub}</div> : null}</div>;
}

function InsightCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return <div className="soft-panel rounded-[24px] p-4"><div className="text-xs font-mono uppercase tracking-[0.16em]" style={{ color: tone }}>Insight</div><div className="mt-2 text-base font-bold">{title}</div><p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{body}</p></div>;
}

function MerchantOverview({ store, todaySales, monthSales, lowStockCount, topProducts, showCharts = true }: any) {
  if (!store) return <NoStorePrompt />;
  const chartItems = topProducts?.length ? topProducts.map((p: any) => ({ label: p.name.slice(0, 10), value: p.revenue, value2: p.qty })) : [
    { label: "A", value: monthSales.total * 0.36, value2: 18 },
    { label: "B", value: monthSales.total * 0.25, value2: 14 },
    { label: "C", value: monthSales.total * 0.22, value2: 11 },
    { label: "D", value: monthSales.total * 0.17, value2: 8 },
  ];
  const ringData = chartItems.map((item: any, idx: number) => ({ ...item, color: ["#fb7185", "#38bdf8", "#34d399", "#f59e0b", "#a78bfa"][idx % 5] }));
  const trendData = [
    { label: "W1", value: monthSales.total * 0.16, value2: monthSales.total * 0.1 },
    { label: "W2", value: monthSales.total * 0.2, value2: monthSales.total * 0.13 },
    { label: "W3", value: monthSales.total * 0.27, value2: monthSales.total * 0.18 },
    { label: "W4", value: monthSales.total * 0.37, value2: monthSales.total * 0.24 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShoppingCart} label="ยอดขายวันนี้" value={fmt(todaySales.total)} sub={`${todaySales.orders} orders`} />
        <StatCard icon={TrendingUp} label="ยอดขายเดือนนี้" value={fmt(monthSales.total)} sub={`${monthSales.orders} orders`} color="#34d399" />
        <StatCard icon={AlertTriangle} label="สินค้าใกล้หมด" value={lowStockCount} sub="ต้องสั่งเพิ่ม" color="#f59e0b" />
        <StatCard icon={BarChart2} label="VAT เดือนนี้" value={fmt(monthSales.vat)} sub="ภ.พ.30" color="#a78bfa" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard title="ดีกว่า Excel ตรงไหน" body="ขายแล้วตัดสต็อก, รวม VAT เดือนนี้ และเห็นสินค้าขายดีอัตโนมัติในหน้าเดียว" tone="#38bdf8" />
        <InsightCard title="Smart reorder" body={lowStockCount > 0 ? `มี ${lowStockCount} รายการที่ควรสั่งเพิ่ม เพื่อไม่ให้ของขาดหน้าร้าน` : "สต็อกโดยรวมยังปลอดภัย ยังไม่มีรายการเร่งด่วน"} tone="#f59e0b" />
        <InsightCard title="สินค้าเด่นเดือนนี้" body={topProducts?.[0] ? `${topProducts[0].name} ทำยอดสูงสุด ${fmt(topProducts[0].revenue)}` : "เริ่มขายรายการแรกเพื่อให้ระบบสรุปสินค้าทำเงินให้"} tone="#34d399" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="glass-card rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Sales trend</h3><span className="text-xs font-mono text-[var(--text-3)]">revenue vs margin</span></div>
          {showCharts ? <AreaTrendChart data={trendData} color="#fb7185" secondaryColor="#38bdf8" /> : <PreferenceDisabledBlock compact title="Sales trend chart ถูกปิด" />}
        </div>
        <div className="glass-card rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Top products</h3><span className="text-xs font-mono text-[var(--text-3)]">mix</span></div>
          {showCharts ? <RingLegendChart data={ringData} total={ringData.reduce((sum: number, item: any) => sum + item.value, 0)} /> : <PreferenceDisabledBlock compact title="Top products chart ถูกปิด" />}
        </div>
      </div>

      <div className="glass-card rounded-[30px] p-6">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Revenue vs units</h3><span className="text-xs font-mono text-[var(--text-3)]">professional bars</span></div>
        {showCharts ? <GroupedBarChart data={chartItems} firstLabel="Revenue" secondLabel="Units" firstColor="#fb7185" secondColor="#f59e0b" /> : <PreferenceDisabledBlock compact title="Revenue vs units chart ถูกปิด" />}
      </div>
    </div>
  );
}

function InventoryTab({ store, lowStockCount, inventoryItems }: { store: StoreType; lowStockCount: number; inventoryItems: InventoryItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: "", salePrice: "", stockQty: "" });
  const [fieldError, setFieldError] = useState("");
  const filtered = useMemo(() => items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || (item.sku ?? "").toLowerCase().includes(q) || (item.category ?? "").toLowerCase().includes(q);
  }), [items, query]);

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setFieldError("");
    setForm({ name: item.name, salePrice: String(item.salePrice), stockQty: String(item.stockQty) });
  }

  async function archiveProduct(id: string) {
    const previous = items;
    setItems((curr) => curr.filter((item) => item.id !== id));
    const res = await fetch(`/api/merchant/products/${id}`, { method: "DELETE" });
    const payload = await readApi(res);
    if (!res.ok || !payload.success) {
      setItems(previous);
      toast.error(payload.error ?? "ลบสินค้าไม่สำเร็จ", firstError(payload.details));
      return;
    }
    setDeleting(null);
    toast.success(payload.message ?? "ย้ายสินค้าออกจากรายการแล้ว");
    startTransition(() => router.refresh());
  }

  async function saveProduct() {
    if (!editing) return;
    const salePrice = Number(form.salePrice);
    const stockQty = Number(form.stockQty);
    if (!form.name.trim()) return setFieldError("กรอกชื่อสินค้า");
    if (!Number.isFinite(salePrice) || salePrice <= 0) return setFieldError("ราคาขายต้องมากกว่า 0");
    if (!Number.isFinite(stockQty) || stockQty < 0) return setFieldError("สต็อกต้องเป็น 0 หรือมากกว่า");
    setFieldError("");

    if (editing.id === "__new__") {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store!.id, name: form.name.trim(), salePrice, stockQty, costPrice: 0, minStockQty: 5 }),
      });
      const payload = await readApi<InventoryItem>(res);
      if (!res.ok || !payload.success) { setFieldError(payload.error ?? "เพิ่มสินค้าไม่สำเร็จ"); toast.error(payload.error ?? "เพิ่มสินค้าไม่สำเร็จ"); return; }
      if (payload.data) setItems(prev => [...prev, { ...payload.data!, salePrice: Number((payload.data as any).salePrice) }]);
      setEditing(null); toast.success("เพิ่มสินค้าสำเร็จ");
      startTransition(() => router.refresh()); return;
    }

    const previous = items;
    const optimistic = items.map((item) => item.id === editing.id ? { ...item, name: form.name.trim(), salePrice, stockQty } : item);
    setItems(optimistic);
    const res = await fetch(`/api/merchant/products/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name.trim(), salePrice, stockQty }),
    });
    const payload = await readApi<InventoryItem>(res);
    if (!res.ok || !payload.success) {
      setItems(previous);
      setFieldError(firstError(payload.details) ?? payload.error ?? "บันทึกสินค้าไม่สำเร็จ");
      toast.error(payload.error ?? "บันทึกสินค้าไม่สำเร็จ", firstError(payload.details));
      return;
    }
    const updated = payload.data;
    if (updated) setItems((curr) => curr.map((item) => item.id === editing.id ? { ...item, ...updated } : item));
    setEditing(null);
    toast.success(payload.message ?? "บันทึกสินค้าแล้ว");
    startTransition(() => router.refresh());
  }

  if (!store) return <NoStorePrompt />;
  return (
    <>
      <div className="glass-card overflow-hidden rounded-[30px]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">จัดการสต็อกสินค้า</h3>
            {lowStockCount > 0 ? <p className="mt-1 text-xs text-amber-300">⚠ {lowStockCount} รายการใกล้หมด</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาสินค้า / SKU" className="modern-input py-2.5 pl-9 pr-3 text-sm" />
            </div>
            <button onClick={() => { setEditing({ id: "__new__", name: "", sku: null, salePrice: 0, stockQty: 0, minStockQty: 5, category: null, status: "active" }); setForm({ name: "", salePrice: "", stockQty: "" }); setFieldError(""); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20"><Plus size={14} /> เพิ่มสินค้า</button>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead><tr className="bg-[var(--surface-2)] text-left">{["สินค้า", "หมวดหมู่", "ราคา", "คงเหลือ", "สถานะ", "จัดการ"].map((head) => <th key={head} className="px-4 py-3 text-xs font-mono uppercase tracking-[0.16em] text-[var(--text-3)]">{head}</th>)}</tr></thead>
            <tbody>
              {filtered.length ? filtered.map((item) => {
                const low = item.stockQty <= item.minStockQty;
                return (
                  <tr key={item.id} className="border-t border-[var(--border)] hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><div className="font-semibold">{item.name}</div><div className="text-xs text-[var(--text-3)]">{item.sku ?? "ไม่มี SKU"}</div></td>
                    <td className="px-4 py-3 text-[var(--text-2)]">{item.category ?? "—"}</td>
                    <td className="px-4 py-3 font-mono">{fmt(item.salePrice)}</td>
                    <td className="px-4 py-3 font-mono">{item.stockQty} / min {item.minStockQty}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-mono ${low ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>{low ? "low stock" : item.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEdit(item)} disabled={isPending} className="inline-flex items-center gap-1 rounded-xl border border-[var(--border2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)]"><Pencil size={12} /> แก้ไข</button><button onClick={() => setDeleting(item)} disabled={isPending} className="inline-flex items-center gap-1 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300"><Trash2 size={12} /> ลบ</button></div></td>
                  </tr>
                );
              }) : <tr><td colSpan={6} className="px-4 py-8"><EmptyState icon={<Package size={22} />} title="ไม่พบสินค้าที่ตรงกับคำค้น" description="ลองค้นหาด้วยชื่อสินค้า SKU หรือหมวดหมู่อื่น หรือเพิ่มสินค้าใหม่เพื่อเริ่มใช้งาน inventory" /></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {filtered.length ? filtered.map((item) => {
            const low = item.stockQty <= item.minStockQty;
            return (
              <div key={item.id} className="rounded-3xl border border-[var(--border)] bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="font-semibold">{item.name}</div><div className="mt-1 text-xs text-[var(--text-3)]">{item.sku ?? "ไม่มี SKU"} · {item.category ?? "—"}</div></div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-mono ${low ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>{low ? "low" : item.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-3 text-sm"><div><div className="text-[var(--text-3)]">ราคา</div><div className="mt-1 font-bold">{fmt(item.salePrice)}</div></div><div><div className="text-[var(--text-3)]">คงเหลือ</div><div className="mt-1 font-bold">{item.stockQty} / min {item.minStockQty}</div></div></div>
                <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => openEdit(item)} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-[var(--border2)] px-3 py-2.5 text-xs font-semibold text-[var(--text-2)]"><Pencil size={12} /> แก้ไข</button><button onClick={() => setDeleting(item)} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-xs font-semibold text-rose-300"><Trash2 size={12} /> ลบ</button></div>
              </div>
            );
          }) : <EmptyState icon={<Package size={22} />} title="ยังไม่มีสินค้าในรายการ" description="เริ่มต้นด้วยการเพิ่มสินค้า หรือเคลียร์คำค้นหาเพื่อดู inventory ทั้งหมด" />}
        </div>
      </div>

      <Modal open={!!editing} title={editing?.id === "__new__" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า"} description="ปรับชื่อสินค้า ราคา และจำนวนคงเหลือได้จากหน้ารายการนี้" onClose={() => setEditing(null)} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setEditing(null)} className="rounded-2xl border border-[var(--border2)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">ยกเลิก</button><button onClick={saveProduct} className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white">บันทึกสินค้า</button></div>}>
        <div className="grid gap-4">
          <label className="grid gap-2"><span className="text-sm font-semibold">ชื่อสินค้า</span><input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="modern-input" />{fieldError ? <div className="field-error">{fieldError}</div> : null}</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2"><span className="text-sm font-semibold">ราคาขาย</span><input value={form.salePrice} onChange={(e) => setForm((s) => ({ ...s, salePrice: e.target.value }))} type="number" className="modern-input" /></label>
            <label className="grid gap-2"><span className="text-sm font-semibold">จำนวนคงเหลือ</span><input value={form.stockQty} onChange={(e) => setForm((s) => ({ ...s, stockQty: e.target.value }))} type="number" className="modern-input" /></label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} title="ลบสินค้าออกจากรายการ" description="สินค้าในโหมดเดโมจะถูกย้ายเป็น archived และไม่แสดงในรายการปัจจุบัน" confirmLabel="ลบสินค้า" busy={isPending} onClose={() => setDeleting(null)} onConfirm={() => deleting && archiveProduct(deleting.id)} />
    </>
  );
}

type CartItem = InventoryItem & { qty: number };

function POSTab({ store, inventoryItems }: any) {
  const router = useRouter();
  const toast = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payMethod, setPayMethod] = useState<"cash" | "qr" | "transfer" | "card">("cash");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const filtered = (inventoryItems as InventoryItem[]).filter(item => {
    const q = query.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || (item.sku ?? "").toLowerCase().includes(q);
  });

  function addToCart(item: InventoryItem) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c);
      return [...prev, {...item, qty: 1}];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => {
      const item = prev.find(c => c.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? {...c, qty: newQty} : c);
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
  const vat = store?.vatRegistered ? Math.round(subtotal * 7 / 107 * 100) / 100 : 0;

  async function checkout() {
    if (cart.length === 0) { toast.error("ยังไม่มีสินค้าในตะกร้า"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          customerName: customerName || undefined,
          paymentMethod: payMethod,
          items: cart.map(c => ({ productId: c.id, qty: c.qty, salePrice: c.salePrice })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Checkout ไม่สำเร็จ"); return; }
      setLastOrder(data.data);
      setCart([]); setCustomerName("");
      setReceiptOpen(true);
      toast.success("ขายสำเร็จ! 🎉");
      router.refresh();
    } catch { toast.error("เกิดข้อผิดพลาด"); }
    finally { setLoading(false); }
  }

  if (!store) return <NoStorePrompt />;

  const PAY_METHODS = [
    { id: "cash", label: "💵 เงินสด" },
    { id: "qr", label: "📱 QR/PromptPay" },
    { id: "transfer", label: "🏦 โอน" },
    { id: "card", label: "💳 บัตร" },
  ] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Products */}
      <div className="glass-card rounded-[30px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">สินค้า</h3>
          <span className="text-xs text-[var(--text-3)]">{inventoryItems.length} รายการ</span>
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาสินค้า / SKU"
          className="modern-input w-full py-2.5 px-4 mb-4 text-sm" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 max-h-[440px] overflow-y-auto pr-1">
          {filtered.length === 0
            ? <p className="col-span-full text-center py-8 text-sm text-[var(--text-3)]">ไม่พบสินค้า</p>
            : filtered.map(item => (
              <button key={item.id} onClick={() => addToCart(item)}
                disabled={item.stockQty === 0}
                className="rounded-[20px] border border-[var(--border)] bg-white/[0.03] p-4 text-left hover:bg-white/[0.06] transition-colors disabled:opacity-40 disabled:cursor-not-allowed relative">
                {item.stockQty <= item.minStockQty && item.stockQty > 0 &&
                  <span className="absolute top-2 right-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400">สต็อกต่ำ</span>}
                {item.stockQty === 0 &&
                  <span className="absolute top-2 right-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-400">หมด</span>}
                <div className="font-semibold text-sm leading-snug">{item.name}</div>
                {item.sku && <div className="mt-0.5 text-[10px] text-[var(--text-3)]">{item.sku}</div>}
                <div className="mt-3 text-base font-black">{fmt(item.salePrice)}</div>
                <div className="text-[10px] text-[var(--text-3)]">คงเหลือ {item.stockQty}</div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Cart */}
      <div className="glass-card rounded-[30px] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={18} /> ตะกร้า
            {cart.length > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{cart.length}</span>}
          </h3>
          {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:text-rose-300">ล้างทั้งหมด</button>}
        </div>

        {cart.length === 0
          ? <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-center text-[var(--text-3)]">เลือกสินค้าจากด้านซ้าย</p>
            </div>
          : <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
              {cart.map(item => (
                <div key={item.id} className="soft-panel flex items-center gap-3 rounded-[18px] px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{fmt(item.salePrice)} × {item.qty} = {fmt(item.salePrice * item.qty)}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded-full border border-[var(--border2)] text-sm font-bold flex items-center justify-center hover:bg-white/10">−</button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded-full border border-[var(--border2)] text-sm font-bold flex items-center justify-center hover:bg-white/10">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-1 text-rose-400 hover:text-rose-300 text-xs">✕</button>
                  </div>
                </div>
              ))}
            </div>
        }

        <div className="border-t border-[var(--border)] pt-4 space-y-3">
          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="ชื่อลูกค้า (ไม่บังคับ)" className="modern-input w-full py-2.5 px-4 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                className={`rounded-xl py-2 text-xs font-semibold transition-colors ${payMethod === m.id ? "bg-rose-500 text-white" : "border border-[var(--border2)] text-[var(--text-2)] hover:bg-white/5"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3 space-y-1 text-sm">
            <div className="flex justify-between text-[var(--text-2)]"><span>ยอดรวม</span><span>{fmt(subtotal)}</span></div>
            {vat > 0 && <div className="flex justify-between text-[var(--text-3)]"><span>VAT 7% (รวมแล้ว)</span><span>{fmt(vat)}</span></div>}
            <div className="flex justify-between font-black text-base pt-1 border-t border-[var(--border)]"><span>รวมทั้งหมด</span><span>{fmt(subtotal)}</span></div>
          </div>
          <button onClick={checkout} disabled={loading || cart.length === 0}
            className="w-full rounded-2xl bg-rose-500 py-3.5 text-sm font-black text-white disabled:opacity-50 hover:bg-rose-400 transition-colors">
            {loading ? "กำลังบันทึก..." : `ยืนยันการขาย ${fmt(subtotal)}`}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal open={receiptOpen} title="ขายสำเร็จ ✓" description="บันทึกการขายเรียบร้อยแล้ว"
        onClose={() => setReceiptOpen(false)}
        footer={<button onClick={() => setReceiptOpen(false)} className="w-full rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white">ปิด</button>}>
        {lastOrder && (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-white/[0.04] p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-3)]">Order ID</span><span className="font-mono text-xs">{lastOrder.id?.slice(-8)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-3)]">ยอดรวม</span><span className="font-bold">{fmt(Number(lastOrder.totalAmount ?? lastOrder.total ?? 0))}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-3)]">ชำระโดย</span><span>{payMethod === "qr" ? "QR/PromptPay" : payMethod === "cash" ? "เงินสด" : payMethod === "card" ? "บัตร" : "โอน"}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReportsTab({ store, monthSales, inventoryItems, topProducts, showCharts = true }: any) {
  if (!store) return <NoStorePrompt />;
  const revenue = monthSales.total;
  const costEstimate = inventoryItems.reduce((sum: number, item: InventoryItem) => sum + item.salePrice * Math.max(item.minStockQty, 1) * 0.45, 0);
  const profit = Math.max(revenue - costEstimate, 0);
  const chartItems = (topProducts?.length
    ? topProducts
    : inventoryItems.slice(0, 5).map((item: InventoryItem, idx: number) => ({
        name: item.name,
        revenue: item.salePrice * (idx + 2),
        qty: idx + 1,
      }))
  ).map((item: any) => ({
    label: item.name.slice(0, 10),
    value: item.revenue,
    value2: item.qty,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label="รายรับ" value={fmt(revenue)} color="#34d399" />
        <StatCard icon={Package} label="ต้นทุนประเมิน" value={fmt(costEstimate)} color="#f59e0b" />
        <StatCard icon={BarChart2} label="กำไรขั้นต้น" value={fmt(profit)} color="#38bdf8" />
      </div>

      <div className="glass-card rounded-[30px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Revenue by product</h3>
          <span className="text-xs font-mono text-[var(--text-3)]">reporting view</span>
        </div>

        {showCharts ? (
          <GroupedBarChart
            data={chartItems}
            firstLabel="Revenue"
            secondLabel="Units"
            firstColor="#38bdf8"
            secondColor="#fb7185"
          />
        ) : (
          <PreferenceDisabledBlock compact title="Reporting view chart ถูกปิด" />
        )}
      </div>
    </div>
  );
}

function NoStorePrompt({ onCreated }: { onCreated?: () => void } = {}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [vatReg, setVatReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function createStore() {
    if (!name.trim()) { setErr("กรุณากรอกชื่อร้านค้า"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/merchant/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), vatRegistered: vatReg }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "สร้างร้านค้าไม่สำเร็จ"); return; }
      toast.success("สร้างร้านค้าสำเร็จ!");
      setOpen(false);
      onCreated?.();
      router.refresh();
    } catch { setErr("เกิดข้อผิดพลาด"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="glass-card rounded-[30px] p-12 text-center">
        <div className="mb-4 text-5xl">🏪</div>
        <h3 className="mb-2 text-lg font-bold">ยังไม่มีร้านค้า</h3>
        <p className="mb-6 text-sm text-[var(--text-3)]">สร้าง Store เพื่อเริ่มใช้งาน POS, Inventory และ Reports</p>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white hover:bg-rose-400 transition-colors">
          <Store size={14} /> สร้างร้านค้า
        </button>
      </div>
      <Modal open={open} title="สร้างร้านค้าใหม่" description="ใช้สำหรับ POS, Inventory และออกใบเสร็จ"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={() => setOpen(false)} className="rounded-2xl border border-[var(--border2)] px-4 py-2.5 text-sm font-semibold text-[var(--text-2)]">ยกเลิก</button>
            <button onClick={createStore} disabled={loading} className="rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {loading ? "กำลังสร้าง..." : "สร้างร้านค้า"}
            </button>
          </div>
        }>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && createStore()}
            placeholder="ชื่อร้านค้า เช่น ร้านกาแฟ ABC" className="modern-input w-full py-3 px-4" autoFocus />
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={vatReg} onChange={e => setVatReg(e.target.checked)} className="rounded" />
            จดทะเบียนภาษีมูลค่าเพิ่ม (VAT 7%)
          </label>
          {err && <p className="text-xs text-rose-400">{err}</p>}
        </div>
      </Modal>
    </>
  );
}
