import { useId, useState } from "react";
import { Eye, EyeOff, GraduationCap, Library } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Role = "student" | "librarian";

/* ---------- Field wrapper ---------- */
export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error && <p className="text-[12px] text-status-occupied">{error}</p>}
    </div>
  );
}

/* ---------- Password input with reveal toggle ---------- */
export function PasswordInput({
  error,
  ...props
}: InputProps & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        aria-invalid={error || undefined}
        className="pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/* ---------- Role segmented control ---------- */
const ROLES: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "librarian", label: "Librarian", icon: Library },
];

export function RoleToggle({
  value,
  onChange,
}: {
  value: Role;
  onChange: (r: Role) => void;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/50 p-1.5"
    >
      {ROLES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            id={`${id}-${r.value}`}
            onClick={() => onChange(r.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
              active
                ? "bg-surface text-primary shadow-xs ring-1 ring-primary/15"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <r.icon className="size-4" />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- "or" divider ---------- */
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
