import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Map, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, clearUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearUser();
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-xs backdrop-blur-sm transition-colors hover:bg-muted"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white uppercase">
          {name[0]}
        </span>
        <span className="capitalize">{name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", open && "rotate-180")}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-surface shadow-md"
          >
            <div className="p-1">
              <Link
                to="/library"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted"
              >
                <Map className="size-3.5 text-muted-foreground" />
                Live Map
              </Link>
              {role === "admin" && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted"
                >
                  <LayoutDashboard className="size-3.5 text-muted-foreground" />
                  Dashboard
                </Link>
              )}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-status-occupied hover:bg-status-occupied/8"
              >
                <LogOut className="size-3.5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAuth();
  const navigate = useNavigate();
  const name = user ? user.email.split("@")[0] : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6",
          scrolled ? "mt-2.5" : "mt-4"
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-300",
            scrolled ? "glass" : "border border-transparent"
          )}
        >
          <Link to="/" className="pl-1" aria-label="DeskGuard home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user && name ? (
              <UserMenu name={name} role={user.role} />
            ) : (
              <Button variant="primary" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          <button
            className="grid h-9 w-9 place-items-center rounded-md text-foreground hover:bg-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-2 md:hidden"
          >
            <div className="glass rounded-2xl p-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 border-t border-border/70 pt-3 space-y-1.5">
                {user && name ? (
                  <>
                    <p className="px-2 py-1 text-[12px] font-semibold capitalize text-foreground">
                      {name}
                    </p>
                    <Link
                      to="/library"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-foreground hover:bg-muted"
                    >
                      <Map className="size-3.5 text-muted-foreground" />
                      Live Map
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="size-3.5 text-muted-foreground" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { clearUser(); setOpen(false); navigate("/"); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-status-occupied hover:bg-status-occupied/8"
                    >
                      <LogOut className="size-3.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" className="w-full" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
