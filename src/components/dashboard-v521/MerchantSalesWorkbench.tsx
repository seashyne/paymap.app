"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Receipt, ShoppingCart, Wallet } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection, formatMoney } from "@/shared/components/workbench/shared"

type Product = { id: string; name: string; sku: string | null; stockQty: number; salePrice: number }
type Order = { id: string; orderNo: string; totalAmount: number; status: string; customerName?: string | null }
type DraftItem = { productId: string; qty: string; salePrice: string }

function SalesCard({ label, value, hint, accent, icon: Icon }: { label: string; value: string; hint: string; accent: string; icon: React.ComponentType<any> }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[16px]" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-[var(--text-3)]">{hint}</div>
    </div>
  )
}

export default function MerchantSalesWorkbench({ storeId, products, recentOrders }: { storeId: string | null; products: Product[]; recentOrders: Order[] }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const first = products[0]
  const [saleForm, setSaleForm] = useState({ customerName: "Walk-in customer", customerPhone: "", paymentMethod: "cash", note: "" })
  const [items, setItems] = useState<DraftItem[]>([{ productId: first?.id ?? "", qty: "1", salePrice: first ? String(first.salePrice) : "0" }])

  const selectedTotals = useMemo(() => items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.salePrice || 0), 0), [items])
  const totalUnits = useMemo(() => items.reduce((sum, item) => sum + Number(item.qty || 0), 0), [items])
  const availableProducts = useMemo(() => products.filter((product) => product.stockQty > 0).length, [products])

  async function act(key: string, fn: () => Promise<void>) {
    setLoading(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Sale failed")
    } finally {
      setLoading(null)
    }
  }

  if (!storeId) return <InlineNotice tone="danger">ยังไม่พบ store สำหรับ merchant mode</InlineNotice>

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[var(--border)] p-6 lg:p-8" style={{ background: "radial-gradient(circle at top right, rgba(251,113,133,.18), transparent 24%), var(--card)" }}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#fb7185]">Merchant sales cockpit</div>
              <div className="rounded-full bg-[rgba(251,113,133,.14)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#fb7185]">Live POS order flow</div>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight lg:text-[42px]">สร้าง order, ตรวจ cart และจัดการสถานะออเดอร์จากหน้าเดียว</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)]">
              workbench นี้ถูกยกให้เหมือน counter cockpit สำหรับร้านจริง โดยยังคงเชื่อม `/api/merchant/sales` และ inventory deduction เดิมของระบบทั้งหมด
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SalesCard label="Catalog" value={String(products.length)} hint="สินค้าในหน้าขาย" accent="#fb7185" icon={ShoppingCart} />
              <SalesCard label="Available now" value={String(availableProducts)} hint="สินค้าที่ยังมี stock" accent="#22c55e" icon={Receipt} />
              <SalesCard label="Recent orders" value={String(recentOrders.length)} hint="รายการล่าสุดในระบบ" accent="#38bdf8" icon={BarChart3} />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Draft basket</div>
              <div className="mt-3 text-3xl font-black">{formatMoney(selectedTotals)}</div>
              <div className="mt-1 text-sm text-[var(--text-2)]">{totalUnits} units · {items.length} lines</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#fb7185]" style={{ width: `${Math.min(100, totalUnits * 10)}%` }} />
              </div>
            </div>
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-sm font-bold">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => document.getElementById("sales-lifecycle")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">สร้างออเดอร์ใหม่</button>
                <button type="button" onClick={() => document.getElementById("recent-orders")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">ตรวจรายการล่าสุด</button>
                <button type="button" onClick={() => setItems((prev) => [...prev, { productId: first?.id ?? products[0]?.id ?? "", qty: "1", salePrice: String(first?.salePrice ?? products[0]?.salePrice ?? 0) }])} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">เพิ่มสินค้าบรรทัดใหม่</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-6">
          <div id="sales-lifecycle">
            <WorkbenchSection title="Sales lifecycle" subtitle="รองรับ draft multi-line sale, สร้าง order จริง และ cancel order เพื่อคืน stock ได้จาก dashboard">
              {products.length === 0 ? <InlineNotice tone="neutral">ยังไม่มีสินค้าใน catalog กรุณาเพิ่มสินค้าจากหน้า Inventory ก่อน</InlineNotice> : (
                <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void act("sale", async () => {
                  await apiJson("/api/merchant/sales", {
                    method: "POST",
                    body: JSON.stringify({
                      storeId,
                      customerName: saleForm.customerName,
                      customerPhone: saleForm.customerPhone,
                      paymentMethod: saleForm.paymentMethod,
                      note: saleForm.note,
                      items: items.map((item) => ({ productId: item.productId, qty: Number(item.qty), salePrice: Number(item.salePrice) })),
                    }),
                  })
                  setMessage("บันทึกการขายเรียบร้อย")
                }) }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Customer name" value={saleForm.customerName} onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })} />
                    <Input label="Customer phone" value={saleForm.customerPhone} onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })} />
                  </div>
                  <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">
                    Payment method
                    <select className="modern-input" value={saleForm.paymentMethod} onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}>
                      <option value="cash">Cash</option>
                      <option value="qr">QR</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                    </select>
                  </label>
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const product = products.find((p) => p.id === item.productId)
                      return (
                        <div key={`${item.productId}-${idx}`} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                          <div className="grid items-end gap-3 md:grid-cols-[1.6fr_.5fr_.6fr_auto]">
                            <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">Product<select className="modern-input" value={item.productId} onChange={(e) => {
                              const next = products.find((p) => p.id === e.target.value)
                              setItems((prev) => prev.map((row, rowIndex) => rowIndex === idx ? { ...row, productId: e.target.value, salePrice: String(next?.salePrice ?? 0) } : row))
                            }}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stockQty})</option>)}</select></label>
                            <Input label="Qty" type="number" min="1" value={item.qty} onChange={(e) => setItems((prev) => prev.map((row, rowIndex) => rowIndex === idx ? { ...row, qty: e.target.value } : row))} />
                            <Input label="Sale price" type="number" min="0.01" value={item.salePrice} onChange={(e) => setItems((prev) => prev.map((row, rowIndex) => rowIndex === idx ? { ...row, salePrice: e.target.value } : row))} />
                            <Button type="button" variant="outline" onClick={() => setItems((prev) => prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== idx))}>ลบ</Button>
                          </div>
                          {product ? <div className="mt-3 text-xs text-[var(--text-3)]">{product.sku || "—"} · stock {product.stockQty} · line total {formatMoney(Number(item.qty || 0) * Number(item.salePrice || 0))}</div> : null}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button type="button" variant="outline" onClick={() => setItems((prev) => [...prev, { productId: first?.id ?? products[0]?.id ?? "", qty: "1", salePrice: String(first?.salePrice ?? products[0]?.salePrice ?? 0) }])}>เพิ่มสินค้าอีกบรรทัด</Button>
                    <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-2)]">Estimated total {formatMoney(selectedTotals)}</div>
                  </div>
                  <Input label="Note" value={saleForm.note} onChange={(e) => setSaleForm({ ...saleForm, note: e.target.value })} />
                  <div className="flex justify-end"><Button type="submit" loading={loading === "sale"}>บันทึกการขาย</Button></div>
                </form>
              )}
            </WorkbenchSection>
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-card rounded-[30px] p-5 lg:p-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Checkout rail</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Draft total</div>
                <div className="mt-2 text-2xl font-black">{formatMoney(selectedTotals)}</div>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Items in cart</div>
                <div className="mt-2 text-2xl font-black">{totalUnits}</div>
                <div className="mt-1 text-xs text-[var(--text-3)]">รวมจำนวนชิ้นที่กำลังจะขาย</div>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-bold">Payment lane</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">ใช้ payment method ในฟอร์มด้านซ้ายเพื่อบันทึก cash, QR, transfer หรือ card ลง order จริง</div>
              </div>
            </div>
          </section>

          <div id="recent-orders">
            <WorkbenchSection title="Recent orders" subtitle="ดู order ล่าสุดและจัดการ cancel / reopen note ได้ทันที">
              <div className="space-y-2">
                {recentOrders.length ? recentOrders.map((order) => (
                  <div key={order.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-bold">{order.orderNo}</div>
                          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ background: order.status === "cancelled" ? "rgba(244,63,94,.12)" : "rgba(34,197,94,.12)", color: order.status === "cancelled" ? "#f43f5e" : "#22c55e" }}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[var(--text-3)]">{order.customerName || "Walk-in"}</div>
                        <div className="mt-1 text-[var(--text-2)]">{formatMoney(order.totalAmount)}</div>
                      </div>
                      <div className="flex gap-2">
                        {order.status !== "cancelled" ? <Button type="button" variant="outline" loading={loading === `void-${order.id}`} onClick={() => void act(`void-${order.id}`, async () => {
                          await apiJson(`/api/merchant/sales/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", note: "Voided from workbench" }) })
                          setMessage(`cancel ${order.orderNo} แล้ว`)
                        })}>Cancel order</Button> : null}
                        {order.status === "cancelled" ? <Button type="button" variant="outline" loading={loading === `reopen-${order.id}`} onClick={() => void act(`reopen-${order.id}`, async () => {
                          await apiJson(`/api/merchant/sales/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: "confirmed", note: "Re-marked as confirmed (stock not re-deducted)" }) })
                          setMessage(`อัปเดตสถานะ ${order.orderNo} แล้ว`)
                        })}>Mark confirmed</Button> : null}
                      </div>
                    </div>
                  </div>
                )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี order</div>}
              </div>
            </WorkbenchSection>
          </div>

          <section className="glass-card rounded-[30px] p-5 lg:p-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Sales guidance</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-sm font-bold"><Wallet size={15} /> Payment mix</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">เลือกรูปแบบรับเงินก่อนบันทึกออเดอร์เพื่อให้ downstream accounting และ sales report แยกช่องทางชำระเงินได้ถูกต้อง</div>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center gap-2 text-sm font-bold"><BarChart3 size={15} /> Order health</div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-2)]">รายการล่าสุดด้านบนใช้สถานะจริงจากฐานข้อมูล จึงเหมาะกับการตรวจว่ามี order ไหนต้อง void หรือยืนยันใหม่</div>
              </div>
            </div>
          </section>

          {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
          {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
        </div>
      </div>
    </div>
  )
}
