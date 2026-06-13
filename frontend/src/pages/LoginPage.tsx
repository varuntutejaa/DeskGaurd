import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, GraduationCap } from "lucide-react";
import { AuthLayout } from "@/app/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PasswordInput } from "@/components/auth/auth-parts";
import { validateCredentials, setUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Tab = "student" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tab,      setTab]      = useState<Tab>("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const switchTab = (next: Tab) => {
    setTab(next);
    setEmail("");
    setPassword("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const user = await validateCredentials(email, password);
    if (!user) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    if (tab === "admin" && user.role !== "admin") {
      setError("These credentials do not have admin access.");
      setLoading(false);
      return;
    }

    setUser(user);
    const redirect = searchParams.get("redirect");
    setTimeout(() => {
      navigate(redirect ?? (user.role === "admin" ? "/dashboard" : "/library"));
    }, 600);
  };

  const signInAs = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    const user = await validateCredentials(demoEmail, demoPassword);
    if (!user) { setLoading(false); return; }
    setUser(user);
    setTimeout(() => {
      navigate(user.role === "admin" ? "/dashboard" : "/library");
    }, 600);
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue to DeskGuard.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-xl border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => switchTab("student")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-all",
            tab === "student"
              ? "bg-surface shadow-xs text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="size-3.5" />
          Student
        </button>
        <button
          type="button"
          onClick={() => switchTab("admin")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-all",
            tab === "admin"
              ? "bg-surface shadow-xs text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck className="size-3.5" />
          Admin
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={tab === "admin" ? "admin@library.edu" : "you@muj.manipal.edu"}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint={
            tab === "student" ? (
              <a href="#" className="text-[12px] font-medium text-primary hover:underline">
                Forgot password?
              </a>
            ) : undefined
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            error={!!error}
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-status-occupied/20 bg-status-occupied/5 px-3 py-2 text-[13px] text-status-occupied">
            {error}
          </p>
        )}

        {tab === "student" && (
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-[hsl(var(--primary))]"
              defaultChecked
            />
            Keep me signed in
          </label>
        )}

        {tab === "admin" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            <span>Admin credentials are required. Contact your library IT administrator if you need access.</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {tab === "admin" ? "Sign in as Admin" : "Sign in"}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Microsoft SSO — student only */}
      {tab === "student" && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => signInAs("student@muj.manipal.edu", "1234567890")}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-[14px] font-medium text-foreground shadow-xs transition-all hover:bg-muted hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
              <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
              <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </button>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            Use your university account ·{" "}
            <span className="font-medium text-foreground">@muj.manipal.edu</span>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
