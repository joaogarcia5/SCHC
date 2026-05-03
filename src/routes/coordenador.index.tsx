import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileCheck2, Clock } from "lucide-react";

export const Route = createFileRoute("/coordenador/")({
  component: CoordenadorDashboard,
});

function CoordenadorDashboard() {
  const { users, certificates } = useStore();
  const profs = users.filter((u) => u.role === "PROFESSOR").length;
  const alunos = users.filter((u) => u.role === "ALUNO").length;
  const aprov = certificates.filter((c) => c.status === "APROVADO").length;
  const pend = certificates.filter((c) => c.status === "PENDENTE").length;

  const stats = [
    { icon: BookOpen, label: "Professores", value: profs },
    { icon: Users, label: "Alunos", value: alunos },
    { icon: FileCheck2, label: "Certificados aprovados", value: aprov },
    { icon: Clock, label: "Em análise", value: pend },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel da coordenação</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do sistema de horas complementares.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atalhos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link
            to="/coordenador/cursos"
            className="text-primary underline-offset-4 hover:underline"
          >
            Gerenciar cursos e PPCs (meta de horas) →
          </Link>
          <Link
            to="/coordenador/professores"
            className="text-primary underline-offset-4 hover:underline"
          >
            Gerenciar professores responsáveis pela validação →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
