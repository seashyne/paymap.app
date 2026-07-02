"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text2)] hover:text-[var(--text)]"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      ออกจากระบบ
    </button>
  );
}
