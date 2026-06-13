import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, ChevronLeft, LogOut, UserCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, clearUser } from "@/lib/auth";

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden font-mono text-[13px] tabular-nums text-muted-foreground sm:inline">
      {now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const user     = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back home"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="h-5 w-px bg-border" />
          <Link to="/" aria-label="DeskGuard home">
            <Logo />
          </Link>
          <span className="hidden items-center gap-2 md:flex">
            <span className="h-5 w-px bg-border" />
            <span className="text-sm font-medium tracking-tight">Dome Building</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              Main Library
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* live indicator */}
          <span className="hidden items-center gap-1.5 text-[12px] font-medium text-status-available sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-available" />
            </span>
            Live
          </span>

          <LiveClock />

          {/* dashboard — admin only */}
          {user?.role === "admin" && (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
          )}

          {/* user pill */}
          {user && (
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 sm:flex">
              <UserCircle className="size-4 shrink-0 text-muted-foreground" />
              <span className="max-w-[120px] truncate text-[12px] font-medium text-foreground">
                {user.email.split("@")[0]}
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {user.role}
              </span>
            </div>
          )}

          {/* logout */}
          <button
            onClick={handleLogout}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
