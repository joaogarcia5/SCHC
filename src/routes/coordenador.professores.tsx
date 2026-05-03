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
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/coordenador/professores")({
  component: ProfessoresPage,
});

function ProfessoresPage() {
  const { users, addProfessor, removeUser } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Novo estado de loading

  const profs = users.filter((u) => u.role === "PROFESSOR");

  // Função transformada em ASYNC
  const create = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha nome, e-mail e senha.");
      return;
    }

    setIsLoading(true);
    try {
      // Agora usamos AWAIT para esperar o Supabase
      const r = await addProfessor(name.trim(), email.trim(), password);
      
      if (!r.ok) {
        toast.error(r.error ?? "Erro ao cadastrar.");
        return;
      }

      toast.success("Professor cadastrado com sucesso.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de professores</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre os professores responsáveis pela validação de certificados, definindo o login de
          acesso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo professor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>E-mail (@uemg.br)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@uemg.br"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Senha (mín. 6 caracteres)</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={create} 
              className="w-full lg:w-auto" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professores cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Nenhum professor cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {profs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        removeUser(p.id);
                        toast.success("Professor removido.");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}