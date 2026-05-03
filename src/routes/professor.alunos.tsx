import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, getStudentApprovedHours } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/mocks/types";

export const Route = createFileRoute("/professor/alunos")({
  component: AlunosPage,
});

function AlunosPage() {
  const { users, certificates, categories } = useStore();
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState<User | null>(null);

  const students = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "ALUNO" &&
          (!search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.matricula?.includes(search))
      ),
    [users, search]
  );

  const openedCerts = opened ? certificates.filter((c) => c.studentId === opened.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
        <p className="text-sm text-muted-foreground">
          Visualize informações e o histórico completo de certificados de cada aluno.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome ou matrícula…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Horas aprovadas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => {
                const approved = getStudentApprovedHours(certificates, s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.matricula}</TableCell>
                    <TableCell>{s.curso}</TableCell>
                    <TableCell>
                      {approved}h / {s.totalRequiredHours ?? 200}h
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpened(s)}>
                        Ver relatório
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!opened} onOpenChange={(o) => !o && setOpened(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{opened?.name}</DialogTitle>
            <DialogDescription>
              {opened?.curso} · {opened?.ppc} · Matrícula {opened?.matricula} · {opened?.email}
            </DialogDescription>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Download iniciado (PDF mock)")}
              >
                <FileText className="mr-2 h-4 w-4" /> Exportar PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Download iniciado")}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
              </Button>
            </div>
          </DialogHeader>

          {opened && (
            <div className="space-y-4">
              <div className="rounded-md bg-[image:var(--gradient-primary)] p-4 text-primary-foreground">
                <p className="text-sm opacity-80">Progresso</p>
                <p className="text-2xl font-bold">
                  {getStudentApprovedHours(certificates, opened.id)}h /{" "}
                  {opened.totalRequiredHours ?? 200}h
                </p>
                <Progress
                  value={Math.min(
                    100,
                    Math.round(
                      (getStudentApprovedHours(certificates, opened.id) /
                        (opened.totalRequiredHours ?? 200)) *
                        100
                    )
                  )}
                  className="mt-2 bg-white/25"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openedCerts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{categories.find((cc) => cc.id === c.categoryId)?.name}</TableCell>
                      <TableCell>{c.yearSemester}</TableCell>
                      <TableCell>{c.hours ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
