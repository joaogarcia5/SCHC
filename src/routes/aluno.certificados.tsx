import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CertificateForm } from "@/components/CertificateForm";
import { AlertCircle, Eye, Pencil } from "lucide-react";
import type { Certificate } from "@/mocks/types";

export const Route = createFileRoute("/aluno/certificados")({
  component: MeusCertificados,
});

function MeusCertificados() {
  const { currentUser, certificates, categories, users } = useStore();
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [viewing, setViewing] = useState<Certificate | null>(null);

  if (!currentUser) return null;
  const myCerts = certificates.filter((c) => c.studentId === currentUser.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meus certificados</h1>
        <p className="text-sm text-muted-foreground">
          Você pode editar e reenviar certificados pendentes ou reprovados. Aprovados ficam
          bloqueados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myCerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum certificado enviado.
                  </TableCell>
                </TableRow>
              )}
              {myCerts.map((c) => {
                const cat = categories.find((cc) => cc.id === c.categoryId);
                const canEdit = c.status !== "APROVADO";
                const reviewer = c.reviewedBy ? users.find((u) => u.id === c.reviewedBy) : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.title}
                      {c.status === "APROVADO" && c.hoursEdited && reviewer && (
                        <p className="mt-1 text-xs text-warning">
                          Horas editadas pelo professor {reviewer.name}
                          {c.originalHours != null && ` (original: ${c.originalHours}h)`}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{cat?.name}</TableCell>
                    <TableCell>{c.yearSemester}</TableCell>
                    <TableCell>{c.hours ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                          <Pencil className="mr-1 h-4 w-4" /> Editar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar e reenviar certificado</DialogTitle>
            <DialogDescription>
              O certificado retornará ao status “Pendente” após o reenvio.
            </DialogDescription>
          </DialogHeader>
          {editing?.status === "REPROVADO" && editing.justification && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Motivo da reprovação:</p>
                <p className="text-foreground">{editing.justification}</p>
              </div>
            </div>
          )}
          {editing && (
            <CertificateForm
              studentId={currentUser.id}
              initial={editing}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing && categories.find((c) => c.id === viewing.categoryId)?.name} ·{" "}
              {viewing?.yearSemester}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Info label="Data" value={viewing.date} />
                <Info label="Horário" value={viewing.time} />
                <Info label="Local" value={viewing.location} />
                <Info label="Horas" value={viewing.hours != null ? `${viewing.hours}h` : "—"} />
              </div>
              {viewing.justification && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="font-medium text-destructive">Motivo da reprovação</p>
                  <p>{viewing.justification}</p>
                </div>
              )}
              {viewing.fileUrl ? (
                <iframe
                  src={viewing.fileUrl}
                  title="Preview do certificado"
                  className="h-[60vh] w-full rounded-md border"
                />
              ) : (
                <p className="text-muted-foreground">Arquivo: {viewing.fileName}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
