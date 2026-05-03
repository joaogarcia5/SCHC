import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/mocks/store";
import type { Activity } from "@/mocks/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Certificate } from "@/mocks/types";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/professor/")({
  component: AnaliseProfessor,
});

function AnaliseProfessor() {
  const { currentUser, certificates, users, categories, activities, reviewCertificate } = useStore();
  const [studentFilter, setStudentFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("PENDENTE");
  const [search, setSearch] = useState("");

  const [reviewing, setReviewing] = useState<Certificate | null>(null);
  const [hoursInput, setHoursInput] = useState("");
  const [justification, setJustification] = useState("");

  const students = useMemo(() => users.filter((u) => u.role === "ALUNO"), [users]);

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      if (studentFilter !== "ALL" && c.studentId !== studentFilter) return false;
      if (categoryFilter !== "ALL" && c.categoryId !== categoryFilter) return false;
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [certificates, studentFilter, categoryFilter, statusFilter, search]);

  const openReview = (c: Certificate) => {
    setReviewing(c);
    setHoursInput(c.hours != null ? String(c.hours) : "");
    setJustification("");
  };

  const approve = async () => {
    if (!reviewing || !currentUser) return;
    const act: Activity | undefined = activities.find((a) => a.id === reviewing.activityId);
    if (!hoursInput || Number(hoursInput) <= 0) {
      toast.error("Informe a carga horária para aprovar.");
      return;
    }
    const hours = Number(hoursInput);
    if (act && hours > act.maxHours) {
      toast.error(`Esta atividade permite no máximo ${act.maxHours}h.`);
      return;
    }

    const res = await reviewCertificate(reviewing.id, "APROVADO", { 
      hours, 
      reviewerId: currentUser.id 
    });

    if (res.ok) {
      toast.success("Certificado aprovado no banco de dados.");
      setReviewing(null);
    } else {
      toast.error("Erro na aprovação: " + res.error);
    }
  };

  const reject = async () => {
    if (!reviewing || !currentUser || !justification.trim()) {
      toast.error("Justificativa obrigatória.");
      return;
    }

    const res = await reviewCertificate(reviewing.id, "REPROVADO", {
      justification: justification.trim(),
      reviewerId: currentUser.id,
    });

    if (res.ok) {
      toast.success("Certificado reprovado.");
      setReviewing(null);
    } else {
      toast.error("Erro ao processar.");
    }
  };

  const reviewingCat = reviewing ? categories.find((c) => c.id === reviewing.categoryId) : null;
  const reviewingActivity = reviewing ? activities.find((a) => a.id === reviewing.activityId) : null;
  const reviewingStudent = reviewing ? users.find((u) => u.id === reviewing.studentId) : null;
  const reviewNeedsHours =
    !!reviewing && (reviewingCat?.name === "Outros" || reviewingActivity?.defaultHours == null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Análise de certificados</h1>
        <p className="text-sm text-muted-foreground">
          Revise os envios dos alunos e registre aprovações ou justifique reprovações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input
            placeholder="Buscar por título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Aluno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os alunos</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="APROVADO">Aprovado</SelectItem>
              <SelectItem value="REPROVADO">Reprovado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum certificado encontrado.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => {
                const stu = users.find((u) => u.id === c.studentId);
                const cat = categories.find((cc) => cc.id === c.categoryId);
                return (
                  <TableRow key={c.id}>
                    <TableCell>{stu?.name}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{cat?.name}</TableCell>
                    <TableCell>{c.yearSemester}</TableCell>
                    <TableCell>{c.hours ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openReview(c)}>
                        Analisar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reviewing?.title}</DialogTitle>
            <DialogDescription>
              {reviewingStudent?.name} · {reviewingCat?.name} · {reviewing?.yearSemester}
            </DialogDescription>
          </DialogHeader>

          {reviewing && (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {reviewing.fileUrl ? (
                  <iframe
                    src={reviewing.fileUrl}
                    title="Preview do certificado"
                    className="h-[60vh] w-full rounded-md border"
                  />
                ) : (
                  <div className="flex h-[60vh] items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                    PDF não disponível para preview ({reviewing.fileName})
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1 text-sm">
                  <Info label="Data" value={reviewing.date} />
                  <Info label="Horário" value={reviewing.time} />
                  <Info label="Local" value={reviewing.location} />
                  <Info
                    label="Horas declaradas"
                    value={reviewing.hours != null ? `${reviewing.hours}h` : "—"}
                  />
                </div>

                <div className="grid gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                  <Label htmlFor="hours">
                    Carga horária a aprovar *
                    {reviewing.hours != null && Number(hoursInput) !== reviewing.hours && (
                      <span className="ml-2 text-xs font-normal text-warning">
                        (editada — original: {reviewing.hours}h)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max={reviewingActivity?.maxHours}
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Você pode ajustar a carga horária antes de aprovar
                    {reviewingActivity ? ` (máx. ${reviewingActivity.maxHours}h).` : "."}
                    {reviewNeedsHours && " Esta atividade exige definição manual."}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="just">Justificativa (obrigatória se reprovar)</Label>
                  <Textarea
                    id="just"
                    rows={4}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explique o motivo para que o aluno possa corrigir e reenviar."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={approve} className="bg-success hover:bg-success/90">
                    <Check className="mr-2 h-4 w-4" /> Aprovar
                  </Button>
                  <Button variant="destructive" onClick={reject}>
                    <X className="mr-2 h-4 w-4" /> Reprovar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
