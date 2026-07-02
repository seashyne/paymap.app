"use client";

interface Props {
  password: string;
}

interface Rule {
  label: string;
  test: (p: string) => boolean;
}

const rules: Rule[] = [
  { label: "อย่างน้อย 8 ตัวอักษร",     test: (p) => p.length >= 8 },
  { label: "ตัวพิมพ์ใหญ่ (A–Z)",         test: (p) => /[A-Z]/.test(p) },
  { label: "ตัวเลข (0–9)",              test: (p) => /[0-9]/.test(p) },
  { label: "อักขระพิเศษ (!@#$…)",       test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): { score: number; label: string; color: string } {
  const score = rules.filter((r) => r.test(password)).length;
  if (score === 0) return { score: 0, label: "",         color: "transparent" };
  if (score === 1) return { score: 1, label: "อ่อนมาก",  color: "#f87171" };
  if (score === 2) return { score: 2, label: "ปานกลาง",  color: "#fb923c" };
  if (score === 3) return { score: 3, label: "ดี",        color: "#fbbf24" };
  return             { score: 4, label: "แข็งแกร่ง",    color: "#34d399" };
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);

  return (
    <div className="mt-2 animate-fade-in">
      {/* Bar */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? color : "var(--s4)",
            }}
          />
        ))}
      </div>

      {/* Label + rules */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold" style={{ color }}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <div
              key={r.label}
              className="flex items-center gap-1.5 text-[11px] transition-colors duration-200"
              style={{ color: ok ? "#34d399" : "var(--text4)" }}
            >
              <span>{ok ? "✓" : "○"}</span>
              <span>{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
