"use client"

import { useEffect, useMemo, useState } from "react"
import { firstError, readApi } from "@/lib/http"
import { useToast } from "@/components/ui/Toast"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

type Warehouse = {
  id: string
  code?: string | null
  name: string
  address?: string | null
  note?: string | null
  isActive: boolean
  productCount: number
  movementCount: number
}

type ProductBalance = {
  id: string
  qtyOnHand: number
  avgCost: number
  warehouse: { id: string; name: string; code?: string | null }
}

type Product = {
  id: string
  sku?: string | null
  name: string
  category?: string | null
  unit?: string | null
  costPrice: number
  salePrice: number
  vatRate: number
  reorderPoint: number
  currency: string
  status: string
  totalQty: number
  balances: ProductBalance[]
}

type InventoryBalance = {
  id: string
  qtyOnHand: number
  avgCost: number
  warehouse: { id: string; name: string; code?: string | null }
  product: { id: string; name: string; sku?: string | null; reorderPoint: number; unit?: string | null }
}

type InventoryMovement = {
  id: string
  movement: string
  qty: number
  qtyBefore: number
  qtyAfter: number
  movedAt: string
  warehouse: { id: string; name: string; code?: string | null }
  product: { id: string; name: string; sku?: string | null; unit?: string | null }
}

export default function BusinessInventoryWorkbench() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [balances, setBalances] = useState<InventoryBalance[]>([])
  const [recent, setRecent] = useState<InventoryMovement[]>([])
  const [warehouseForm, setWarehouseForm] = useState({ code: "", name: "", address: "", note: "" })
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    category: "",
    unit: "ชิ้น",
    costPrice: "0",
    salePrice: "0",
    vatRate: "7",
    reorderPoint: "0",
    currency: "THB",
    initialWarehouseId: "",
    initialQty: "0",
  })
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    warehouseId: "",
    movement: "in",
    qty: "1",
    unitCost: "",
    note: "",
  })

  async function load() {
    setLoading(true)
    try {
      const [warehouseRes, productRes, inventoryRes] = await Promise.all([
        fetch("/api/business/warehouses"),
        fetch("/api/business/products"),
        fetch("/api/business/inventory"),
      ])
      const [warehousePayload, productPayload, inventoryPayload] = await Promise.all([
        readApi<{ items: Warehouse[] }>(warehouseRes),
        readApi<{ items: Product[] }>(productRes),
        readApi<{ balances: InventoryBalance[]; recent: InventoryMovement[] }>(inventoryRes),
      ])
      if (!warehouseRes.ok) throw new Error(warehousePayload.error ?? firstError(warehousePayload.details) ?? "โหลดคลังไม่สำเร็จ")
      if (!productRes.ok) throw new Error(productPayload.error ?? firstError(productPayload.details) ?? "โหลดสินค้าไม่สำเร็จ")
      if (!inventoryRes.ok) throw new Error(inventoryPayload.error ?? firstError(inventoryPayload.details) ?? "โหลดสต็อกไม่สำเร็จ")
      setWarehouses(warehousePayload.data?.items ?? [])
      setProducts(productPayload.data?.items ?? [])
      setBalances(inventoryPayload.data?.balances ?? [])
      setRecent(inventoryPayload.data?.recent ?? [])
    } catch (error: any) {
      toast.error(error?.message ?? "โหลด inventory workbench ไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!adjustForm.productId && products[0]?.id) {
      setAdjustForm((current) => ({ ...current, productId: products[0].id }))
    }
    if (!adjustForm.warehouseId && warehouses[0]?.id) {
      setAdjustForm((current) => ({ ...current, warehouseId: warehouses[0].id }))
    }
    if (!productForm.initialWarehouseId && warehouses[0]?.id) {
      setProductForm((current) => ({ ...current, initialWarehouseId: warehouses[0].id }))
    }
  }, [products, warehouses, adjustForm.productId, adjustForm.warehouseId, productForm.initialWarehouseId])

  const summary = useMemo(() => {
    const lowStock = products.filter((product) => product.totalQty <= product.reorderPoint).length
    return {
      warehouses: warehouses.length,
      products: products.length,
      qty: balances.reduce((sum, balance) => sum + balance.qtyOnHand, 0),
      lowStock,
    }
  }, [balances, products, warehouses])

  async function act(key: string, fn: () => Promise<void>) {
    setSaving(key)
    try {
      await fn()
      await load()
    } finally {
      setSaving(null)
    }
  }

  async function createWarehouse() {
    await act("warehouse", async () => {
      const res = await fetch("/api/business/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: warehouseForm.code || null,
          name: warehouseForm.name,
          address: warehouseForm.address || null,
          note: warehouseForm.note || null,
        }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "เพิ่มคลังไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "เพิ่มคลังแล้ว")
      setWarehouseForm({ code: "", name: "", address: "", note: "" })
    })
  }

  async function createProduct() {
    await act("product", async () => {
      const res = await fetch("/api/business/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: productForm.sku || null,
          name: productForm.name,
          category: productForm.category || null,
          unit: productForm.unit || null,
          costPrice: Number(productForm.costPrice || 0),
          salePrice: Number(productForm.salePrice || 0),
          vatRate: Number(productForm.vatRate || 0),
          reorderPoint: Number(productForm.reorderPoint || 0),
          currency: productForm.currency || "THB",
          initialWarehouseId: productForm.initialWarehouseId || null,
          initialQty: Number(productForm.initialQty || 0),
        }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "เพิ่มสินค้าไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "เพิ่มสินค้าแล้ว")
      setProductForm((current) => ({
        ...current,
        sku: "",
        name: "",
        category: "",
        costPrice: "0",
        salePrice: "0",
        initialQty: "0",
      }))
    })
  }

  async function adjustInventory() {
    await act("inventory", async () => {
      const res = await fetch("/api/business/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustForm.productId,
          warehouseId: adjustForm.warehouseId,
          movement: adjustForm.movement,
          qty: Number(adjustForm.qty || 0),
          unitCost: adjustForm.unitCost ? Number(adjustForm.unitCost) : null,
          note: adjustForm.note || null,
        }),
      })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "ปรับสต็อกไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "บันทึกสต็อกแล้ว")
      setAdjustForm((current) => ({ ...current, qty: "1", unitCost: "", note: "" }))
    })
  }

  async function archiveWarehouse(id: string) {
    await act(`warehouse-${id}`, async () => {
      const res = await fetch(`/api/business/warehouses/${id}`, { method: "DELETE" })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "เก็บถาวรคลังไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "เก็บถาวรคลังแล้ว")
    })
  }

  async function archiveProduct(id: string) {
    await act(`product-${id}`, async () => {
      const res = await fetch(`/api/business/products/${id}`, { method: "DELETE" })
      const payload = await readApi(res)
      if (!res.ok) {
        toast.error(payload.error ?? "เก็บถาวรสินค้าไม่สำเร็จ", firstError(payload.details))
        return
      }
      toast.success(payload.message ?? "เก็บถาวรสินค้าแล้ว")
    })
  }

  return (
    <div className="space-y-6 min-w-0">
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-[var(--surface-2)] p-4"><div className="text-sm text-[var(--text-3)]">Warehouses</div><div className="mt-2 text-2xl font-black">{summary.warehouses}</div></div>
          <div className="rounded-2xl bg-[var(--surface-2)] p-4"><div className="text-sm text-[var(--text-3)]">Products</div><div className="mt-2 text-2xl font-black">{summary.products}</div></div>
          <div className="rounded-2xl bg-[var(--surface-2)] p-4"><div className="text-sm text-[var(--text-3)]">Qty on hand</div><div className="mt-2 text-2xl font-black">{summary.qty}</div></div>
          <div className="rounded-2xl bg-[var(--surface-2)] p-4"><div className="text-sm text-[var(--text-3)]">Low stock</div><div className="mt-2 text-2xl font-black">{summary.lowStock}</div></div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black">Warehouse master</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">ตั้งค่าคลังหลัก คลังย่อย หรือจุดเก็บของสำหรับแยก stock visibility</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="รหัสคลัง" value={warehouseForm.code} onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })} placeholder="WH-01" />
            <Input label="ชื่อคลัง" value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} placeholder="คลังสำนักงานใหญ่" />
            <Input label="ที่อยู่" value={warehouseForm.address} onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })} placeholder="ที่อยู่คลัง" />
            <Input label="หมายเหตุ" value={warehouseForm.note} onChange={(e) => setWarehouseForm({ ...warehouseForm, note: e.target.value })} placeholder="ใช้เก็บสินค้าพร้อมขาย" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={createWarehouse} loading={saving === "warehouse"} disabled={!warehouseForm.name.trim()}>เพิ่มคลัง</Button>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลดคลัง…</div> : warehouses.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มีคลังสินค้า</div> : warehouses.map((warehouse) => (
              <div key={warehouse.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{warehouse.name}{warehouse.code ? ` · ${warehouse.code}` : ""}</div>
                    <div className="mt-1 text-sm text-[var(--text-3)]">{warehouse.address || "ยังไม่ได้ระบุที่อยู่"}</div>
                    <div className="mt-2 text-xs text-[var(--text-3)]">Products {warehouse.productCount} · Movements {warehouse.movementCount}</div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => archiveWarehouse(warehouse.id)} loading={saving === `warehouse-${warehouse.id}`}>เก็บถาวร</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black">Product master</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">เก็บ SKU, ราคา, ภาษี, reorder point และ stock เริ่มต้นในคลังที่เลือก</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="SKU-001" />
            <Input label="ชื่อสินค้า" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="บริการรายเดือน / สินค้า A" />
            <Input label="หมวดหมู่" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="General" />
            <Input label="หน่วย" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
            <Input label="ต้นทุน" type="number" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })} />
            <Input label="ราคาขาย" type="number" value={productForm.salePrice} onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })} />
            <Input label="VAT %" type="number" value={productForm.vatRate} onChange={(e) => setProductForm({ ...productForm, vatRate: e.target.value })} />
            <Input label="Reorder point" type="number" value={productForm.reorderPoint} onChange={(e) => setProductForm({ ...productForm, reorderPoint: e.target.value })} />
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[var(--text2)]">คลังเริ่มต้น</span>
              <select className="modern-input" value={productForm.initialWarehouseId} onChange={(e) => setProductForm({ ...productForm, initialWarehouseId: e.target.value })}>
                <option value="">ไม่ลง stock ตอนนี้</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
            </label>
            <Input label="จำนวนเริ่มต้น" type="number" value={productForm.initialQty} onChange={(e) => setProductForm({ ...productForm, initialQty: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={createProduct} loading={saving === "product"} disabled={!productForm.name.trim()}>เพิ่มสินค้า</Button>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4">
          <h2 className="text-xl font-black">Inventory movement</h2>
          <p className="mt-1 text-sm text-[var(--text-3)]">ปรับ stock เข้า ออก นับใหม่ หรือคืนสินค้าในระดับคลัง</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--text2)]">สินค้า</span>
            <select className="modern-input" value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.totalQty})</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--text2)]">คลัง</span>
            <select className="modern-input" value={adjustForm.warehouseId} onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })}>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--text2)]">ประเภท</span>
            <select className="modern-input" value={adjustForm.movement} onChange={(e) => setAdjustForm({ ...adjustForm, movement: e.target.value })}>
              <option value="in">รับเข้า</option>
              <option value="out">ตัดออก</option>
              <option value="adjust">นับสต็อกใหม่</option>
              <option value="return">รับคืน</option>
            </select>
          </label>
          <Input label="จำนวน" type="number" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: e.target.value })} />
          <Input label="ต้นทุนต่อหน่วย" type="number" value={adjustForm.unitCost} onChange={(e) => setAdjustForm({ ...adjustForm, unitCost: e.target.value })} />
          <Input label="หมายเหตุ" value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={adjustInventory} loading={saving === "inventory"} disabled={!adjustForm.productId || !adjustForm.warehouseId}>บันทึก movement</Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Product registry</h3>
            <div className="text-sm text-[var(--text-3)]">พร้อมต่อยอดไป sales / purchase flow</div>
          </div>
          <div className="space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลดสินค้า…</div> : products.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มีสินค้า</div> : products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{product.name}{product.sku ? ` · ${product.sku}` : ""}</div>
                    <div className="mt-1 text-sm text-[var(--text-3)]">Qty {product.totalQty} · Reorder {product.reorderPoint} · Price {product.salePrice.toLocaleString("th-TH")} {product.currency}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                      {product.balances.map((balance) => <span key={balance.id} className="rounded-full bg-[var(--bg)] px-2 py-1">{balance.warehouse.name}: {balance.qtyOnHand}</span>)}
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => archiveProduct(product.id)} loading={saving === `product-${product.id}`}>เก็บถาวร</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Recent stock activity</h3>
            <div className="text-sm text-[var(--text-3)]">Movement ล่าสุดของธุรกิจ</div>
          </div>
          <div className="space-y-3">
            {loading ? <div className="text-sm text-[var(--text-3)]">กำลังโหลด movement…</div> : recent.length === 0 ? <div className="text-sm text-[var(--text-3)]">ยังไม่มี movement</div> : recent.map((movement) => (
              <div key={movement.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="font-black">{movement.product.name} · {movement.warehouse.name}</div>
                <div className="mt-1 text-sm text-[var(--text-3)]">{movement.movement.toUpperCase()} {movement.qty} | {movement.qtyBefore} {"->"} {movement.qtyAfter}</div>
                <div className="mt-1 text-xs text-[var(--text-3)]">{new Date(movement.movedAt).toLocaleString("th-TH")}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
