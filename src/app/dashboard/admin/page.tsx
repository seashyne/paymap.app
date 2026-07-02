import { prisma } from "@/lib/prisma";
import { requireRolePage } from "@/lib/authz";

export default async function AdminDashboardPage() {
  await requireRolePage("admin");

  const [users, txCount, auditCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true, _count: { select: { transactions: true } } },
    }),
    prisma.transaction.count(),
    prisma.auditLog.count(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <div className="text-sm text-[var(--text3)]">RBAC protected</div>
          <h1 className="text-3xl font-black">Admin Console</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] p-5"><div className="text-xs text-[var(--text3)]">ผู้ใช้ทั้งหมด</div><div className="mt-2 text-2xl font-black">{users.length}</div></div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] p-5"><div className="text-xs text-[var(--text3)]">ธุรกรรมทั้งหมด</div><div className="mt-2 text-2xl font-black">{txCount}</div></div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] p-5"><div className="text-xs text-[var(--text3)]">Audit logs</div><div className="mt-2 text-2xl font-black">{auditCount}</div></div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] font-semibold">ผู้ใช้ล่าสุด</div>
          <table className="w-full text-sm">
            <thead className="bg-[var(--s2)] text-left text-[var(--text3)]"><tr><th className="px-5 py-3">ชื่อ</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Transactions</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">{user.name}</td>
                  <td className="px-5 py-4 text-[var(--text2)]">{user.email}</td>
                  <td className="px-5 py-4">{user.role}</td>
                  <td className="px-5 py-4">{user.plan}</td>
                  <td className="px-5 py-4">{user._count.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
