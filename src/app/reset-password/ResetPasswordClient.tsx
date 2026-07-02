"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordStrength from "@/components/auth/PasswordStrength";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "อย่างน้อย 8 ตัวอักษร")
      .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่")
      .regex(/[0-9]/, "ต้องมีตัวเลข"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type F = z.infer<typeof schema>;

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const oobCode = params.get("oobCode") || params.get("token");

  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<F>({
    resolver: zodResolver(schema),
  });

  const pw = watch("password", "");

  const onSubmit = async (data: F) => {
    setErr(null);
    try {
      if (!oobCode) throw new Error("ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว");

      const { confirmPasswordReset } = await import("firebase/auth");
      const { firebaseAuth } = await import("@/lib/firebase-client");

      await confirmPasswordReset(firebaseAuth, oobCode, data.password);
      setOk(true);
      setTimeout(() => router.push("/login?reset=1"), 1200);
    } catch (error: any) {
      setErr(error?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  if (!oobCode) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Link ไม่ถูกต้อง</h1>
          <Link href="/forgot-password">
            <Button variant="outline">ขอ Link ใหม่</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[13px] text-[var(--text3)] hover:text-[var(--text2)] mb-8"
        >
          <ArrowLeft size={14} /> กลับ
        </Link>

        <div className="mb-7">
          <div className="w-12 h-12 rounded-2xl bg-[var(--amber-d)] border border-[var(--amber-b)] flex items-center justify-center mb-4">
            <Lock size={22} className="text-[var(--amber)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            ตั้ง Password ใหม่
          </h1>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] p-7">
          {ok ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-[var(--green)] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">เปลี่ยน Password สำเร็จ!</h3>
              <p className="text-[13px] text-[var(--text3)]">กำลังพาไปหน้า Login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              {err && (
                <div className="rounded-xl bg-[var(--red-d)] border border-[rgba(248,113,113,.25)] px-4 py-3 text-[13px] text-[var(--red)]">
                  ⚠ {err}
                </div>
              )}

              <div>
                <Input
                  label="Password ใหม่"
                  type="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <PasswordStrength password={pw} />
              </div>

              <Input
                label="ยืนยัน Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                บันทึก Password ใหม่
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
