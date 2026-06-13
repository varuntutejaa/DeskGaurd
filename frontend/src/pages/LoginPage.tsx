import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { AuthLayout } from "@/app/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PasswordInput } from "@/components/auth/auth-parts";
import { validateCredentials, setUser } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = validateCredentials(email, password);
    if (!user) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    setLoading(true);
    setUser(user);
    const redirect = searchParams.get("redirect");
    setTimeout(() => {
      navigate(redirect ?? (user.role === "admin" ? "/dashboard" : "/library"));
    }, 600);
  };

  const signInAs = (email: string, password: string) => {
    const user = validateCredentials(email, password);
    if (!user) return;
    setLoading(true);
    setUser(user);
    setTimeout(() => {
      navigate(user.role === "admin" ? "/dashboard" : "/library");
    }, 600);
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue to DeskGuard.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@muj.manipal.edu"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint={
            <a href="#" className="text-[12px] font-medium text-primary hover:underline">
              Forgot password?
            </a>
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

        <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-border accent-[hsl(var(--primary))]"
            defaultChecked
          />
          Keep me signed in
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* divider */}
      <div className="mt-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Microsoft SSO */}
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
    </AuthLayout>
  );
}
