import { prisma } from "@/lib/prisma"
import { calcOrderVat } from "@/lib/merchant/vat"
import { publishDomainEvent } from "@/modules/platform/events/bus"
import { DOMAIN_EVENTS } from "@/modules/platform/events/catalog"

export interface CreateMerchantSaleInput {
  storeId: string
  userId: string
  customerName?: string
  customerPhone?: string
  paymentMethod: "cash" | "qr" | "transfer" | "card"
  items: Array<{ productId: string; qty: number; salePrice: number }>
  note?: string
}

export async function createMerchantSaleService(input: CreateMerchantSaleInput) {
  const store = await prisma.store.findFirst({ where: { id: input.storeId, userId: input.userId } })
  if (!store) throw new Error("Store not found")

  const mergedItems = Array.from(input.items.reduce((map, item) => {
    const current = map.get(item.productId)
    if (current) {
      current.qty += item.qty
      current.salePrice = item.salePrice
    } else {
      map.set(item.productId, { ...item })
    }
    return map
  }, new Map<string, { productId: string; qty: number; salePrice: number }>()).values())

  const productIds = mergedItems.map((item) => item.productId)
  const products = await prisma.merchantProduct.findMany({ where: { id: { in: productIds }, storeId: store.id } })
  const productMap = new Map(products.map((product) => [product.id, product])) as Map<string, any>
  const stockState = new Map<string, number>(products.map((product) => [product.id, Number(product.stockQty)]))

  for (const item of mergedItems) {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Product not found: ${item.productId}`)
    const availableQty = stockState.get(item.productId) ?? 0
    if (Number(availableQty) < item.qty) throw new Error(`สต็อก ${product.name} ไม่เพียงพอ (มี ${availableQty})`)
    stockState.set(item.productId, availableQty - item.qty)
  }

  const vatItems = mergedItems.map((item) => {
    const product = productMap.get(item.productId)!
    return { amount: item.salePrice * item.qty, vatIncluded: Boolean(product.vatIncluded) }
  })
  const { subtotal, vatAmount, total } = calcOrderVat(vatItems)
  const orderNo = `SO${Date.now()}`

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.salesOrder.create({
      data: {
        storeId: store.id,
        orderNo,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        paymentMethod: input.paymentMethod,
        note: input.note,
        subtotal,
        vatAmount,
        totalAmount: total,
        status: "confirmed",
        items: {
          create: mergedItems.map((item) => {
            const product = productMap.get(item.productId)!
            return {
              productId: item.productId,
              qty: item.qty,
              costPrice: Number(product.costPrice),
              salePrice: item.salePrice,
              vatRate: 7,
              lineTotal: item.salePrice * item.qty,
            }
          }),
        },
      },
    })

    for (const item of mergedItems) {
      const product = productMap.get(item.productId)!
      const newQty = Number(product.stockQty) - item.qty
      await tx.merchantProduct.update({ where: { id: item.productId }, data: { stockQty: newQty } })
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          type: "out",
          qty: item.qty,
          qtyBefore: Number(product.stockQty),
          qtyAfter: newQty,
          refType: "sale",
          refId: createdOrder.id,
          note: `ขาย #${orderNo}`,
        },
      })
    }

    await tx.vatReport.upsert({
      where: {
        storeId_month_year: {
          storeId: store.id,
          month: createdOrder.soldAt.getMonth() + 1,
          year: createdOrder.soldAt.getFullYear(),
        },
      },
      update: {
        totalSales: { increment: Number(createdOrder.totalAmount) },
        salesVat: { increment: Number(createdOrder.vatAmount) },
        vatPayable: { increment: Number(createdOrder.vatAmount) },
      },
      create: {
        storeId: store.id,
        month: createdOrder.soldAt.getMonth() + 1,
        year: createdOrder.soldAt.getFullYear(),
        totalSales: Number(createdOrder.totalAmount),
        salesVat: Number(createdOrder.vatAmount),
        vatPayable: Number(createdOrder.vatAmount),
      },
    })

    return createdOrder
  })

  const costOfGoodsSold = mergedItems.reduce((sum, item) => {
    const product = productMap.get(item.productId)!
    return sum + Number(product.costPrice) * item.qty
  }, 0)

  await publishDomainEvent(DOMAIN_EVENTS.merchantSaleConfirmed, {
    userId: input.userId,
    saleOrderId: order.id,
    soldAt: order.soldAt.toISOString(),
    totalAmount: Number(order.totalAmount),
    netSales: Number(order.subtotal),
    vatAmount: Number(order.vatAmount),
    cogs: costOfGoodsSold,
  })

  return {
    order,
    costOfGoodsSold,
  }
}
