import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/mocks/store";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
}

export function AppShell({ children, nav }: { children: ReactNode; nav: NavItem[] }) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-[var(--shadow-card)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">UEMG · Horas Complementares</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.name} · {currentUser?.role}
              </p>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
