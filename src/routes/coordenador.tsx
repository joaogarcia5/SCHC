import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/coordenador")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("uemg-hc-session-v1");
    const u = raw ? JSON.parse(raw) : null;
    if (!u || u.role !== "COORDENADOR") throw redirect({ to: "/" });
  },
  component: CoordenadorLayout,
});

function CoordenadorLayout() {
  return (
    <AppShell
      nav={[
        { to: "/coordenador", label: "Painel" },
        { to: "/coordenador/cursos", label: "Cursos & PPCs" },
        { to: "/coordenador/professores", label: "Professores" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
