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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Rota mantém o nome /professor/categorias mas agora gerencia ATIVIDADES tabeladas.
export const Route = createFileRoute("/professor/categorias")({
  component: AtividadesPage,
});

function AtividadesPage() {
  const { activities, categories, addActivity, updateActivity } = useStore();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [defaultHours, setDefaultHours] = useState("");
  const [maxHours, setMaxHours] = useState("");
  const [variable, setVariable] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDefault, setEDefault] = useState("");
  const [eMax, setEMax] = useState("");
  const [eVariable, setEVariable] = useState(false);

  const create = async () => {
    if (!title.trim() || !categoryId || !maxHours) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    
    const res = await addActivity({
      title: title.trim(),
      categoryId,
      defaultHours: variable ? null : Number(defaultHours || 0),
      maxHours: Number(maxHours),
    });

    if (res.ok) {
      toast.success("Atividade salva no banco de dados.");
      setTitle("");
      setDefaultHours("");
      setMaxHours("");
      setVariable(false);
    } else {
      toast.error("Erro ao salvar: " + res.error);
    }
  };

  const startEdit = (id: string) => {
    const a = activities.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setETitle(a.title);
    setEDefault(a.defaultHours != null ? String(a.defaultHours) : "");
    setEMax(String(a.maxHours));
    setEVariable(a.defaultHours == null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await updateActivity(editingId, {
      title: eTitle.trim(),
      defaultHours: eVariable ? null : Number(eDefault || 0),
      maxHours: Number(eMax || 0),
    });

    if (res.ok) {
      setEditingId(null);
      toast.success("Atividade atualizada.");
    } else {
      toast.error("Erro ao atualizar.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de atividades</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre e gerencie as atividades tabeladas conforme o regulamento UEMG.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova atividade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Curso de Python (online)"
            />
          </div>
          <div className="grid gap-2">
            <Label>Categoria pai *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Limite máximo (h) *</Label>
            <Input
              type="number"
              min="1"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Carga variável?</Label>
            <div className="flex h-9 items-center gap-2">
              <Switch checked={variable} onCheckedChange={setVariable} />
              <span className="text-xs text-muted-foreground">
                {variable ? "Aluno/professor define" : "Horas fixas por unidade"}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Horas por unidade {variable ? "(desabilitado)" : "*"}</Label>
            <Input
              type="number"
              min="0"
              disabled={variable}
              value={defaultHours}
              onChange={(e) => setDefaultHours(e.target.value)}
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <Button onClick={create}>Cadastrar atividade</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividades cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Horas/unid.</TableHead>
                <TableHead>Máx.</TableHead>
                <TableHead>Ativa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((a) => {
                const cat = categories.find((c) => c.id === a.categoryId);
                const editing = editingId === a.id;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      {editing ? (
                        <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                      ) : (
                        <span className="font-medium">{a.title}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cat?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <Switch checked={eVariable} onCheckedChange={setEVariable} />
                          <Input
                            type="number"
                            className="w-20"
                            disabled={eVariable}
                            value={eDefault}
                            onChange={(e) => setEDefault(e.target.value)}
                          />
                        </div>
                      ) : a.defaultHours != null ? (
                        `${a.defaultHours}h`
                      ) : (
                        <Badge variant="secondary">variável</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Input
                          type="number"
                          className="w-20"
                          value={eMax}
                          onChange={(e) => setEMax(e.target.value)}
                        />
                      ) : (
                        `${a.maxHours}h`
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={a.isActive}
                        onCheckedChange={async (v) => {
                          const res = await updateActivity(a.id, { isActive: v });
                          if (!res.ok) toast.error("Falha ao alterar status.");
                        }}
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {editing ? (
                        <>
                          <Button size="sm" onClick={saveEdit}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEdit(a.id)}>
                          Editar
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
    </div>
  );
}
