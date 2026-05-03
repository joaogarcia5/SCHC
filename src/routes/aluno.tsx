import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/aluno")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("uemg-hc-session-v1");
    const u = raw ? JSON.parse(raw) : null;
    if (!u || u.role !== "ALUNO") throw redirect({ to: "/" });
  },
  component: AlunoLayout,
});

function AlunoLayout() {
  return (
    <AppShell
      nav={[
        { to: "/aluno", label: "Painel" },
        { to: "/aluno/certificados", label: "Meus Certificados" },
        { to: "/aluno/novo", label: "Enviar Certificado" },
        { to: "/aluno/perfil", label: "Editar Perfil" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
