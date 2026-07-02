"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Boxes, PackageSearch, Truck } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiJson, InlineNotice, WorkbenchSection } from "@/shared/components/workbench/shared"
import { getClientSiteLang } from "@/lib/i18n/runtime"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"

type Product = { id: string; name: string; sku: string | null; stockQty: number; minStockQty: number; salePrice: number; category?: string | null; unit?: string | null }
type Supplier = { id: string; name: string; contactName?: string | null }

function InventoryCard({ label, value, hint, accent, icon: Icon }: { label: string; value: string; hint: string; accent: string; icon: React.ComponentType<any> }) {
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

export default function MerchantInventoryWorkbench({ storeId, products, suppliers }: { storeId: string | null; products: Product[]; suppliers: Supplier[] }) {
  const router = useRouter()
  const lang = getClientSiteLang()
  const wm = getWorkspaceMessages(lang).workbench
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({ name: "", sku: "", category: "General", costPrice: "100", salePrice: "150", stockQty: "10", minStockQty: "5", unit: "pcs", vatIncluded: true })
  const [adjustForm, setAdjustForm] = useState({ productId: products[0]?.id ?? "", type: "in", qty: "1", costPrice: "", note: "Restock" })
  const [supplierForm, setSupplierForm] = useState({ name: "", contactName: "", phone: "", email: "" })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editProductForm, setEditProductForm] = useState({ name: "", sku: "", category: "", salePrice: "0", minStockQty: "0", unit: "pcs" })

  const lowStockProducts = useMemo(() => products.filter((product) => product.stockQty <= product.minStockQty), [products])
  const stockUnits = useMemo(() => products.reduce((sum, product) => sum + product.stockQty, 0), [products])

  async function act(key: string, fn: () => Promise<void>) {
    setLoading(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e: any) {
      setError(e?.message || wm.actionFailed)
    } finally {
      setLoading(null)
    }
  }

  if (!storeId) return <InlineNotice tone="danger">{wm.noProducts}</InlineNotice>

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[var(--border)] p-6 lg:p-8" style={{ background: "radial-gradient(circle at top right, rgba(139,92,246,.18), transparent 24%), var(--card)" }}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8b5cf6]">Merchant inventory cockpit</div>
              <div className="rounded-full bg-[rgba(139,92,246,.14)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b5cf6]">Live catalog + stock</div>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight lg:text-[42px]">สินค้า, stock movement และ supplier อยู่ใน workbench เดียว</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-2)]">
              หน้า inventory ถูกยกเป็น cockpit เต็มหน้าเพื่อให้ร้านเพิ่มสินค้า, ปรับสต็อก, เช็ก low stock และดู supplier ได้ต่อเนื่องโดยยังใช้ฐานข้อมูลจริงของ merchant mode
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InventoryCard label="Products" value={String(products.length)} hint="catalog ที่เปิดขายได้" accent="#8b5cf6" icon={Boxes} />
              <InventoryCard label="Stock units" value={stockUnits.toLocaleString("th-TH")} hint="ยอดรวมทุก SKU" accent="#22c55e" icon={PackageSearch} />
              <InventoryCard label="Suppliers" value={String(suppliers.length)} hint="คู่ค้าที่เชื่อมการจัดซื้อ" accent="#38bdf8" icon={Truck} />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-3)]">Low stock queue</div>
              <div className="mt-3 text-3xl font-black">{lowStockProducts.length}</div>
              <div className="mt-2 text-sm text-[var(--text-2)]">SKU ที่ต่ำกว่า min stock และควรปรับยอดหรือเตรียม reorder</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${products.length ? Math.min(100, (lowStockProducts.length / products.length) * 100) : 0}%` }} />
              </div>
            </div>
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-sm font-bold">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => document.getElementById("inventory-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">เพิ่มสินค้าใหม่</button>
                <button type="button" onClick={() => document.getElementById("inventory-adjust")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">ปรับยอดสต็อก</button>
                <button type="button" onClick={() => document.getElementById("supplier-create")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold">เพิ่ม supplier</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-6">
          <div id="inventory-catalog">
            <WorkbenchSection title={wm.inventoryCatalog[0]} subtitle={wm.inventoryCatalog[1]}>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void act("product", async () => {
                await apiJson("/api/merchant/products", { method: "POST", body: JSON.stringify({ storeId, ...productForm, costPrice: Number(productForm.costPrice), salePrice: Number(productForm.salePrice), stockQty: Number(productForm.stockQty), minStockQty: Number(productForm.minStockQty) }) })
                setMessage(wm.successProduct)
                setProductForm((state) => ({ ...state, name: "", sku: "" }))
              }) }}>
                <Input label="ชื่อสินค้า" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <Input label="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                <Input label="Category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
                <Input label="Unit" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                <Input label="Cost price" type="number" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })} required />
                <Input label="Sale price" type="number" value={productForm.salePrice} onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })} required />
                <Input label="Initial stock" type="number" value={productForm.stockQty} onChange={(e) => setProductForm({ ...productForm, stockQty: e.target.value })} required />
                <Input label="Min stock" type="number" value={productForm.minStockQty} onChange={(e) => setProductForm({ ...productForm, minStockQty: e.target.value })} required />
                <label className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--text-2)]"><input type="checkbox" checked={productForm.vatIncluded} onChange={(e) => setProductForm({ ...productForm, vatIncluded: e.target.checked })} />VAT included</label>
                <div className="md:col-span-2 flex justify-end"><Button type="submit" loading={loading === "product"}>{wm.addProduct}</Button></div>
              </form>
            </WorkbenchSection>
          </div>

          <div id="inventory-adjust">
            <WorkbenchSection title={wm.inventoryAdjust[0]} subtitle={wm.inventoryAdjust[1]}>
              {products.length === 0 ? <InlineNotice tone="neutral">{wm.noProducts}</InlineNotice> : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void act("adjust", async () => {
                  await apiJson("/api/merchant/inventory", { method: "POST", body: JSON.stringify({ productId: adjustForm.productId, type: adjustForm.type, qty: Number(adjustForm.qty), costPrice: adjustForm.costPrice ? Number(adjustForm.costPrice) : undefined, note: adjustForm.note }) })
                  setMessage(wm.successAdjust)
                }) }}>
                  <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">Product<select className="modern-input" value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.stockQty})</option>)}</select></label>
                  <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--text2)]">Type<select className="modern-input" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}><option value="in">In</option><option value="out">Out</option><option value="adjust">Adjust</option><option value="return">Return</option></select></label>
                  <Input label="Qty" type="number" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: e.target.value })} required />
                  <Input label="Cost price" type="number" value={adjustForm.costPrice} onChange={(e) => setAdjustForm({ ...adjustForm, costPrice: e.target.value })} />
                  <div className="md:col-span-2"><Input label="Note" value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} /></div>
                  <div className="md:col-span-2 flex justify-end"><Button type="submit" loading={loading === "adjust"}>{wm.saveMove}</Button></div>
                </form>
              )}
            </WorkbenchSection>
          </div>
        </div>

        <div className="space-y-6">
          <WorkbenchSection title={wm.productLifecycle[0]} subtitle={wm.productLifecycle[1]}>
            <div className="grid gap-3">
              {products.length ? products.slice(0, 10).map((product) => {
                const editing = editingProductId === product.id
                const isLowStock = product.stockQty <= product.minStockQty
                return (
                  <div key={product.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                    {editing ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input label="ชื่อ" value={editProductForm.name} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} />
                        <Input label="SKU" value={editProductForm.sku} onChange={(e) => setEditProductForm({ ...editProductForm, sku: e.target.value })} />
                        <Input label="Category" value={editProductForm.category} onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })} />
                        <Input label="Sale price" type="number" value={editProductForm.salePrice} onChange={(e) => setEditProductForm({ ...editProductForm, salePrice: e.target.value })} />
                        <Input label="Min stock" type="number" value={editProductForm.minStockQty} onChange={(e) => setEditProductForm({ ...editProductForm, minStockQty: e.target.value })} />
                        <Input label="Unit" value={editProductForm.unit} onChange={(e) => setEditProductForm({ ...editProductForm, unit: e.target.value })} />
                        <div className="md:col-span-2 flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditingProductId(null)}>{wm.cancel}</Button>
                          <Button type="button" loading={loading === `product-save-${product.id}`} onClick={() => void act(`product-save-${product.id}`, async () => {
                            await apiJson(`/api/merchant/products/${product.id}`, { method: "PATCH", body: JSON.stringify({ name: editProductForm.name, sku: editProductForm.sku || null, category: editProductForm.category || null, salePrice: Number(editProductForm.salePrice), minStockQty: Number(editProductForm.minStockQty), unit: editProductForm.unit || null }) })
                            setEditingProductId(null)
                            setMessage(`อัปเดต ${product.name} แล้ว`)
                          })}>{wm.save}</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-bold">{product.name}</div>
                            {isLowStock ? <span className="rounded-full bg-[rgba(245,158,11,.14)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f59e0b]">Low stock</span> : null}
                          </div>
                          <div className="text-[var(--text-3)]">SKU {product.sku || "—"} · {product.category || "Uncategorized"} · {product.unit || "pcs"}</div>
                          <div className="mt-1 text-[var(--text-2)]">Stock {product.stockQty} / Min {product.minStockQty} · Sale {product.salePrice.toLocaleString("th-TH")}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => { setEditingProductId(product.id); setEditProductForm({ name: product.name, sku: product.sku || "", category: product.category || "", salePrice: String(product.salePrice), minStockQty: String(product.minStockQty), unit: product.unit || "pcs" }) }}>{wm.edit}</Button>
                          <Button type="button" variant="outline" loading={loading === `product-archive-${product.id}`} onClick={() => void act(`product-archive-${product.id}`, async () => {
                            await apiJson(`/api/merchant/products/${product.id}`, { method: "DELETE" })
                            setMessage(`archive ${product.name} แล้ว`)
                          })}>{wm.archive}</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }) : <div className="text-sm text-[var(--text-3)]">ยังไม่มีสินค้า</div>}
            </div>
          </WorkbenchSection>

          <div id="supplier-create">
            <WorkbenchSection title={wm.supplierCreate[0]} subtitle={wm.supplierCreate[1]}>
              <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void act("supplier", async () => {
                await apiJson("/api/merchant/suppliers", { method: "POST", body: JSON.stringify({ storeId, ...supplierForm }) })
                setMessage(wm.successSupplier)
                setSupplierForm({ name: "", contactName: "", phone: "", email: "" })
              }) }}>
                <Input label="Supplier name" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                <Input label="Contact name" value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} />
                <Input label="Phone" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                <Input label="Email" type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                <Button type="submit" loading={loading === "supplier"}>{wm.addSupplier}</Button>
              </form>
              <div className="mt-4 grid gap-2">
                {suppliers.length ? suppliers.slice(0, 6).map((supplier) => <div key={supplier.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm"><div className="font-bold">{supplier.name}</div><div className="text-[var(--text-3)]">{supplier.contactName || "No contact"}</div></div>) : <div className="text-sm text-[var(--text-3)]">{wm.noSuppliers}</div>}
              </div>
            </WorkbenchSection>
          </div>

          {message ? <InlineNotice tone="success">{message}</InlineNotice> : null}
          {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
        </div>
      </div>
    </div>
  )
}
