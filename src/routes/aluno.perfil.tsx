import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/mocks/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/aluno/perfil")({
  component: AlunoPerfil,
});

function AlunoPerfil() {
  const { currentUser, courses, ppcs, updateUser, changePassword } = useStore();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [matricula, setMatricula] = useState(currentUser?.matricula ?? "");
  const [courseId, setCourseId] = useState(currentUser?.courseId ?? "");
  const [ppcId, setPpcId] = useState(currentUser?.ppcId ?? "");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const ppcOptions = useMemo(
    () => ppcs.filter((p) => p.courseId === courseId),
    [ppcs, courseId],
  );

  if (!currentUser) return null;

  const onCourseChange = (value: string) => {
    setCourseId(value);
    // Reset PPC if it doesn't belong to the new course
    if (!ppcs.some((p) => p.id === ppcId && p.courseId === value)) {
      setPpcId("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppcId) {
      toast.error("Selecione um PPC.");
      return;
    }
    setSaving(true);
    // TODO: Substituir por Supabase (update profiles)
    const res = updateUser(currentUser.id, { name, matricula, courseId, ppcId });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Perfil atualizado com sucesso.");
  };

  const onSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não corresponde à nova senha.");
      return;
    }
    setSavingPwd(true);
    // TODO: Substituir por Supabase Auth (updateUser({ password }))
    const res = changePassword(currentUser.id, currentPassword, newPassword);
    setSavingPwd(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível alterar a senha.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha alterada com sucesso.");
  };
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Atualize seus dados acadêmicos. O e-mail não pode ser alterado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={currentUser.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                O e-mail institucional não pode ser alterado.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={courseId} onValueChange={onCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>PPC</Label>
              <Select
                value={ppcId}
                onValueChange={setPpcId}
                disabled={!courseId || ppcOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !courseId
                        ? "Selecione um curso primeiro"
                        : ppcOptions.length === 0
                          ? "Nenhum PPC disponível"
                          : "Selecione o PPC"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ppcOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      PPC {p.year} — {p.totalRequiredHours}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Caso não saiba essa informação, procurar a secretaria.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={savingPwd}>
                {savingPwd ? "Salvando..." : "Alterar senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
