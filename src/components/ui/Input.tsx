"use client";

import { forwardRef, useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, type, className = "", ...props }, ref) => {
    const [showPass, setShowPass] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPass ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-2">
        {label && <label className="text-[13px] font-semibold text-[var(--text2)]">{label}</label>}

        <div className="relative">
          {icon && <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)]">{icon}</div>}

          <input
            ref={ref}
            type={inputType}
            className={[
              "modern-input",
              error ? "border-[var(--red)] focus:shadow-[0_0_0_4px_rgba(248,113,113,0.12)]" : "",
              icon ? "pl-10" : "",
              isPassword ? "pr-11" : "",
              className,
            ].join(" ")}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)] transition-colors hover:text-[var(--text2)]"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>

        {error && <p className="animate-fade-in flex items-center gap-1.5 text-[12px] text-[var(--red)]"><span>⚠</span> {error}</p>}
        {hint && !error && <p className="text-[11px] text-[var(--text3)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
