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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  exportConsolidadoPDF,
  exportConsolidadoXLSX,
  exportIndividualPDF,
  exportIndividualXLSX,
} from "@/lib/exporters";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/professor/relatorio")({
  component: RelatorioPage,
});

type Filter = "ALL" | "COMPLETO" | "METADE" | "ZERO";

function RelatorioPage() {
  const { users, certificates, categories, activities } = useStore();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const students = useMemo(() => users.filter((u) => u.role === "ALUNO"), [users]);

  const rows = useMemo(() => {
    return students.map((s) => {
      const approved = getStudentApprovedHours(certificates, s.id);
      const required = s.totalRequiredHours ?? 200;
      const pct = required > 0 ? approved / required : 0;
      const byCat: Record<string, number> = {};
      certificates
        .filter((c) => c.studentId === s.id && c.status === "APROVADO" && c.hours)
        .forEach((c) => {
          const cat = categories.find((cc) => cc.id === c.categoryId);
          const name = cat?.name ?? "—";
          byCat[name] = (byCat[name] ?? 0) + (c.hours ?? 0);
        });
      return { student: s, approved, required, pct, byCat };
    });
  }, [students, certificates, categories]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "COMPLETO") return r.approved >= r.required;
      if (filter === "METADE") return r.pct >= 0.5 && r.pct < 1;
      if (filter === "ZERO") return r.approved === 0;
      return true;
    });
  }, [rows, filter]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportXLSX = () => {
    exportConsolidadoXLSX(filtered.map((r) => ({
      matricula: r.student.matricula,
      name: r.student.name,
      curso: r.student.curso,
      ppc: r.student.ppc,
      approved: r.approved,
      required: r.required,
      pct: r.pct,
    })));
    toast.success("Excel gerado com sucesso.");
  };

  const exportPDF = () => {
    exportConsolidadoPDF(filtered.map((r) => ({
      matricula: r.student.matricula,
      name: r.student.name,
      curso: r.student.curso,
      ppc: r.student.ppc,
      approved: r.approved,
      required: r.required,
      pct: r.pct,
    })));
    toast.success("PDF gerado com sucesso.");
  };

  const exportStudentPDF = (studentId: string) => {
    const row = rows.find((r) => r.student.id === studentId);
    if (!row) return;
    exportIndividualPDF({
      student: row.student,
      certificates: certificates.filter((c) => c.studentId === studentId),
      categories,
      activities,
      approved: row.approved,
      required: row.required,
    });
    toast.success("Relatório individual (PDF) gerado.");
  };

  const exportStudentXLSX = (studentId: string) => {
    const row = rows.find((r) => r.student.id === studentId);
    if (!row) return;
    exportIndividualXLSX({
      student: row.student,
      certificates: certificates.filter((c) => c.studentId === studentId),
      categories,
      activities,
      approved: row.approved,
      required: row.required,
    });
    toast.success("Relatório individual (Excel) gerado.");
  };

  const counts = {
    ALL: rows.length,
    COMPLETO: rows.filter((r) => r.approved >= r.required).length,
    METADE: rows.filter((r) => r.pct >= 0.5 && r.pct < 1).length,
    ZERO: rows.filter((r) => r.approved === 0).length,
  };

  const filterButton = (key: Filter, label: string) => (
    <Button
      key={key}
      size="sm"
      variant={filter === key ? "default" : "outline"}
      onClick={() => setFilter(key)}
    >
      {label} <Badge variant="secondary" className="ml-2">{counts[key]}</Badge>
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório consolidado</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso da turma e exporte o consolidado para a secretaria.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportXLSX}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button onClick={exportPDF}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros rápidos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {filterButton("ALL", "Todos")}
          {filterButton("COMPLETO", "Atingiu o total")}
          {filterButton("METADE", "Está na metade")}
          {filterButton("ZERO", "Sem horas cadastradas")}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Matrícula</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Curso / PPC</TableHead>
                <TableHead className="w-[260px]">Progresso</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum aluno corresponde a este filtro.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r) => {
                const isOpen = expanded.has(r.student.id);
                const studentCerts = certificates.filter((c) => c.studentId === r.student.id);
                return (
                  <>
                    <TableRow key={r.student.id}>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => toggle(r.student.id)}>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{r.student.matricula}</TableCell>
                      <TableCell className="font-medium">{r.student.name}</TableCell>
                      <TableCell className="text-xs">
                        {r.student.curso}
                        <br />
                        <span className="text-muted-foreground">{r.student.ppc}</span>
                      </TableCell>
                      <TableCell>
                        <Progress value={Math.min(100, Math.round(r.pct * 100))} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {Math.round(r.pct * 100)}%
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {r.approved}h / {r.required}h
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Exportar PDF individual"
                          onClick={() => exportStudentPDF(r.student.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Exportar Excel individual"
                          onClick={() => exportStudentXLSX(r.student.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${r.student.id}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(r.byCat).length === 0 ? (
                                <span className="text-sm text-muted-foreground">
                                  Nenhuma hora aprovada.
                                </span>
                              ) : (
                                Object.entries(r.byCat).map(([k, v]) => (
                                  <Badge key={k} variant="secondary">
                                    {k}: <strong className="ml-1">{v}h</strong>
                                  </Badge>
                                ))
                              )}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Atividade</TableHead>
                                  <TableHead>Categoria</TableHead>
                                  <TableHead>Período</TableHead>
                                  <TableHead>Horas</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {studentCerts.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground">
                                      Nenhum certificado enviado.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  studentCerts.map((c) => {
                                    const act = activities.find((a) => a.id === c.activityId);
                                    const cat = categories.find((cc) => cc.id === c.categoryId);
                                    return (
                                      <TableRow key={c.id}>
                                        <TableCell className="font-medium">
                                          {c.title}
                                          <p className="text-xs text-muted-foreground">
                                            {act?.title ?? "—"}
                                          </p>
                                        </TableCell>
                                        <TableCell>{cat?.name}</TableCell>
                                        <TableCell>{c.yearSemester}</TableCell>
                                        <TableCell>{c.hours ?? "—"}</TableCell>
                                        <TableCell>
                                          <StatusBadge status={c.status} />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
