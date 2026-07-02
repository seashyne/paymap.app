import { prisma } from "@/lib/prisma"

const INCOME_CATS = [
  { name:"Salary",        color:"#34d399", icon:"💰" },
  { name:"Freelance",     color:"#60a5fa", icon:"💻" },
  { name:"Investment",    color:"#f59e0b", icon:"📈" },
  { name:"Other Income",  color:"#a78bfa", icon:"🎁" },
]
const EXPENSE_CATS = [
  { name:"Food & Drink",  color:"#f59e0b", icon:"🍜" },
  { name:"Transport",     color:"#60a5fa", icon:"🚗" },
  { name:"Housing",       color:"#f87171", icon:"🏠" },
  { name:"Health",        color:"#34d399", icon:"💊" },
  { name:"Shopping",      color:"#f472b6", icon:"🛍️" },
  { name:"Entertainment", color:"#fb923c", icon:"🎬" },
  { name:"Utilities",     color:"#94a3b8", icon:"💡" },
  { name:"Education",     color:"#2dd4bf", icon:"📚" },
  { name:"Subscription",  color:"#818cf8", icon:"📱" },
  { name:"Travel",        color:"#34d399", icon:"✈️" },
]

export async function ensureDefaultCategories(userId: string) {
  const all = [
    ...INCOME_CATS.map(c => ({ ...c, type: "income" as const })),
    ...EXPENSE_CATS.map(c => ({ ...c, type: "expense" as const })),
  ]
  for (const cat of all) {
    await prisma.category.upsert({
      where:  { userId_name_type: { userId, name: cat.name, type: cat.type } },
      update: { color: cat.color, icon: cat.icon, isSystem: true },
      create: { userId, ...cat, isSystem: true },
    })
  }
}
