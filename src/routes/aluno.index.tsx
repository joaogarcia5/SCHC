import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, getStudentApprovedHours } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Award, Clock, FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/aluno/")({
  component: AlunoDashboard,
});

function AlunoDashboard() {
  const { currentUser, certificates, categories } = useStore();
  if (!currentUser) return null;

  const myCerts = certificates.filter((c) => c.studentId === currentUser.id);
  const total = currentUser.totalRequiredHours ?? 200;
  const approved = getStudentApprovedHours(certificates, currentUser.id);
  const pending = myCerts.filter((c) => c.status === "PENDENTE").length;
  const pct = Math.min(100, Math.round((approved / total) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá, {currentUser.name}</h1>
          <p className="text-sm text-muted-foreground">
            {currentUser.curso} · {currentUser.ppc} · Matrícula {currentUser.matricula}
          </p>
        </div>
        <Button asChild>
          <Link to="/aluno/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo certificado
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-[image:var(--gradient-primary)] p-6 text-primary-foreground">
          <p className="text-sm opacity-80">Progresso de horas complementares</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-bold">{approved}h</span>
            <span className="pb-1 text-lg opacity-80">/ {total}h</span>
          </div>
          <Progress value={pct} className="mt-4 bg-white/25" />
          <p className="mt-2 text-sm opacity-90">{pct}% concluído</p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Award} label="Horas aprovadas" value={`${approved}h`} />
        <StatCard icon={Clock} label="Em análise" value={String(pending)} />
        <StatCard icon={FileText} label="Total enviados" value={String(myCerts.length)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos envios</CardTitle>
        </CardHeader>
        <CardContent>
          {myCerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Você ainda não enviou certificados.{" "}
              <Link to="/aluno/novo" className="text-primary underline-offset-4 hover:underline">
                Enviar agora
              </Link>
            </p>
          ) : (
            <ul className="divide-y">
              {myCerts.slice(0, 5).map((c) => {
                const cat = categories.find((cc) => cc.id === c.categoryId);
                return (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name} · {c.yearSemester} · {c.hours ?? "—"}h
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
