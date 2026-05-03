import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpenCheck, Pencil, Plus, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/coordenador/cursos")({
  component: CursosPage,
});

function CursosPage() {
  const { 
    courses, 
    ppcs, 
    users, 
    addCourse, 
    updateCourse, 
    removeCourse, 
    addPPC, 
    updatePPC, 
    removePPC 
  } = useStore();

  const [newCourse, setNewCourse] = useState("");
  const [editingCourse, setEditingCourse] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // PPC dialog
  const [ppcDialogCourseId, setPpcDialogCourseId] = useState<string | null>(null);
  const [ppcYear, setPpcYear] = useState("");
  const [ppcHours, setPpcHours] = useState("200");
  const [editingPpc, setEditingPpc] = useState<{ id: string; year: string; totalRequiredHours: number } | null>(null);

  const studentsByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    users.filter((u) => u.role === "ALUNO").forEach((u) => {
      if (u.courseId) map[u.courseId] = (map[u.courseId] ?? 0) + 1;
    });
    return map;
  }, [users]);

  const studentsByPpc = useMemo(() => {
    const map: Record<string, number> = {};
    users.filter((u) => u.role === "ALUNO").forEach((u) => {
      if (u.ppcId) map[u.ppcId] = (map[u.ppcId] ?? 0) + 1;
    });
    return map;
  }, [users]);

  const handleAddCourse = async () => {
    if (!newCourse.trim()) return;
    
    setIsLoading(true);
    const r = await addCourse(newCourse.trim());
    setIsLoading(false);

    if (!r.ok) {
      toast.error(r.error ?? "Erro ao criar curso");
      return;
    }
    toast.success("Curso criado com sucesso.");
    setNewCourse("");
  };

  const handleSaveCourseEdit = async () => {
    if (!editingCourse) return;
    if (!editingCourse.name.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }

    setIsLoading(true);
    const r = await updateCourse(editingCourse.id, { name: editingCourse.name.trim() });
    setIsLoading(false);

    if (!r.ok) {
      toast.error(r.error ?? "Erro ao atualizar curso");
      return;
    }
    toast.success("Curso atualizado.");
    setEditingCourse(null);
  };

  const handleRemoveCourse = async (id: string) => {
    const r = await removeCourse(id);
    if (!r.ok) {
      toast.error(r.error ?? "Erro ao remover curso");
      return;
    }
    toast.success("Curso removido.");
  };

  const openAddPpc = (courseId: string) => {
    setEditingPpc(null);
    setPpcYear("");
    setPpcHours("200");
    setPpcDialogCourseId(courseId);
  };

  const openEditPpc = (courseId: string, ppc: { id: string; year: string; totalRequiredHours: number }) => {
    setEditingPpc(ppc);
    setPpcYear(ppc.year);
    setPpcHours(String(ppc.totalRequiredHours));
    setPpcDialogCourseId(courseId);
  };

  const handleSubmitPpc = async () => {
    if (!ppcDialogCourseId) return;
    const hours = Number(ppcHours);

    setIsLoading(true);
    if (editingPpc) {
      const r = await updatePPC(editingPpc.id, { 
        year: ppcYear.trim(), 
        totalRequiredHours: hours 
      });
      if (r.ok) {
        toast.success("PPC atualizado.");
        setPpcDialogCourseId(null);
      } else {
        toast.error(r.error ?? "Erro ao atualizar PPC");
      }
    } else {
      const r = await addPPC(ppcDialogCourseId, ppcYear.trim(), hours);
      if (r.ok) {
        toast.success("PPC criado.");
        setPpcDialogCourseId(null);
      } else {
        toast.error(r.error ?? "Erro ao criar PPC");
      }
    }
    setIsLoading(false);
  };

  const handleRemovePpc = async (id: string) => {
    const r = await removePPC(id);
    if (!r.ok) {
      toast.error(r.error ?? "Erro ao remover PPC");
      return;
    }
    toast.success("PPC removido.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cursos e PPCs</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os cursos da instituição e os Projetos Pedagógicos vigentes. A meta de horas
          complementares do aluno é definida pelo PPC selecionado no cadastro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Ex.: Sistemas de Informação"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              className="sm:flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleAddCourse} disabled={isLoading || !newCourse.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} 
              Adicionar curso
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {courses.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground text-center">
              Nenhum curso cadastrado no banco de dados.
            </CardContent>
          </Card>
        )}
        {courses.map((course) => {
          const list = ppcs.filter((p) => p.courseId === course.id);
          return (
            <Card key={course.id}>
              <CardHeader className="flex flex-col items-start justify-between gap-4 space-y-0 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-primary" />
                    {course.name}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {list.length} PPC(s) · {studentsByCourse[course.id] ?? 0} aluno(s) vinculado(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse({ id: course.id, name: course.name })}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Renomear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                  </Button>
                  <Button size="sm" onClick={() => openAddPpc(course.id)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Novo PPC
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                {list.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground italic">
                    Este curso ainda não possui PPCs cadastrados.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Ano vigente</TableHead>
                        <TableHead>Horas exigidas</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead className="text-right pr-6">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="pl-6">
                            <Badge variant="secondary">PPC {p.year}</Badge>
                          </TableCell>
                          <TableCell>{p.totalRequiredHours}h</TableCell>
                          <TableCell>{studentsByPpc[p.id] ?? 0}</TableCell>
                          <TableCell className="text-right pr-6 space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPpc(course.id, p)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemovePpc(p.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog: editar curso */}
      <Dialog open={!!editingCourse} onOpenChange={(o) => !o && setEditingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear curso</DialogTitle>
            <DialogDescription>Atualize o nome exibido para os alunos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Nome do curso</Label>
            <Input
              value={editingCourse?.name ?? ""}
              onChange={(e) =>
                setEditingCourse((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCourse(null)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCourseEdit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: novo/editar PPC */}
      <Dialog open={!!ppcDialogCourseId} onOpenChange={(o) => !o && setPpcDialogCourseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPpc ? "Editar PPC" : "Novo PPC"}</DialogTitle>
            <DialogDescription>
              Defina o ano vigente e a meta de horas exigidas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Ano vigente</Label>
              <Input
                placeholder="Ex.: 2021"
                value={ppcYear}
                onChange={(e) => setPpcYear(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Total de horas exigidas</Label>
              <Input
                type="number"
                min="1"
                value={ppcHours}
                onChange={(e) => setPpcHours(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPpcDialogCourseId(null)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitPpc} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPpc ? "Salvar" : "Criar PPC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}