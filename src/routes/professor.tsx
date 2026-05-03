import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/professor")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("uemg-hc-session-v1");
    const u = raw ? JSON.parse(raw) : null;
    if (!u || u.role !== "PROFESSOR") throw redirect({ to: "/" });
  },
  component: ProfessorLayout,
});

function ProfessorLayout() {
  return (
    <AppShell
      nav={[
        { to: "/professor", label: "Análise" },
        { to: "/professor/categorias", label: "Atividades" },
        { to: "/professor/alunos", label: "Alunos" },
        { to: "/professor/relatorio", label: "Relatório de Horas" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
