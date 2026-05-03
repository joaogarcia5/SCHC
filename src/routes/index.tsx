import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "../mocks/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/mocks/types";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

type Mode = "LOGIN" | "REGISTER";

function LoginPage() {
  const { login, registerStudent, courses, ppcs } = useStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("LOGIN");
  const [tab, setTab] = useState<Role>("ALUNO");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields (aluno)
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rMatricula, setRMatricula] = useState("");
  const [rCurso, setRCurso] = useState("");
  const [rPpc, setRPpc] = useState("");

  const goTo = (role: Role) => {
    const dest = role === "ALUNO" ? "/aluno" : role === "PROFESSOR" ? "/professor" : "/coordenador";
    // Redireciona imediatamente fora do call stack para evitar delay
    setTimeout(() => {
      navigate({ to: dest, replace: true });
    }, 0);
  };

  // AJUSTE AQUI: Transformado em async
  const submitLogin = async (role: Role) => {
    // AJUSTE AQUI: Adicionado o await
    const r = await login(email, password, role);
    
    if (!r.ok || !r.user) {
      toast.error(r.error ?? "Falha ao entrar");
      return;
    }
    toast.success("Bem-vindo(a)!");
    goTo(r.user.role);
  };

  // AJUSTE AQUI: Transformado em async
  const submitRegister = async () => {
    // AJUSTE AQUI: Adicionado o await
    const r = await registerStudent({
      name: rName,
      email: rEmail,
      password: rPassword,
      matricula: rMatricula,
      courseId: rCurso,
      ppcId: rPpc,
    });
    
    if (!r.ok || !r.user) {
      toast.error(r.error ?? "Falha no cadastro");
      return;
    }
    toast.success("Conta criada com sucesso!");
    goTo(r.user.role);
  };

  const presets: Record<Role, { email: string; password: string }> = {
    ALUNO: { email: "ana.souza@discente.uemg.br", password: "123456" },
    PROFESSOR: { email: "carla.mendes@uemg.br", password: "123456" },
    COORDENADOR: { email: "daniel.rocha@uemg.br", password: "123456" },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-center gap-6 text-primary-foreground lg:flex">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Sistema de Gestão de
            <br />
            Horas Complementares
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Plataforma oficial da UEMG para envio, validação e acompanhamento das atividades
            complementares dos cursos de graduação.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: GraduationCap, label: "Aluno" },
              { icon: BookOpen, label: "Professor" },
              { icon: ShieldCheck, label: "Coordenação" },
            ].map((i) => (
              <div
                key={i.label}
                className="rounded-lg bg-white/10 p-4 text-center backdrop-blur-sm"
              >
                <i.icon className="mx-auto mb-2 h-5 w-5" />
                <p className="text-xs font-medium">{i.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle>{mode === "LOGIN" ? "Acesse sua conta" : "Criar conta de aluno"}</CardTitle>
            <CardDescription>
              {mode === "LOGIN"
                ? "Selecione seu perfil e informe o e-mail institucional."
                : "Preencha os dados abaixo. O cadastro é exclusivo para alunos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="LOGIN">Entrar</TabsTrigger>
                <TabsTrigger value="REGISTER">Criar conta</TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "LOGIN" ? (
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  const role = v as Role;
                  setTab(role);
                  setEmail("");
                  setPassword("");
                }}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ALUNO">Aluno</TabsTrigger>
                  <TabsTrigger value="PROFESSOR">Professor</TabsTrigger>
                  <TabsTrigger value="COORDENADOR">Coordenador</TabsTrigger>
                </TabsList>

                {(["ALUNO", "PROFESSOR", "COORDENADOR"] as Role[]).map((role) => (
                  <TabsContent key={role} value={role} className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`email-${role}`}>E-mail institucional</Label>
                      <Input
                        id={`email-${role}`}
                        type="email"
                        placeholder={
                          role === "ALUNO" ? "nome@discente.uemg.br" : "nome@uemg.br"
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`pwd-${role}`}>Senha</Label>
                      <Input
                        id={`pwd-${role}`}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" onClick={() => submitLogin(role)}>
                      Entrar como {role.charAt(0) + role.slice(1).toLowerCase()}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
                      onClick={() => {
                        setEmail(presets[role].email);
                        setPassword(presets[role].password);
                      }}
                    >
                      Usar conta de demonstração ({presets[role].email})
                    </button>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="r-name">Nome completo</Label>
                  <Input id="r-name" value={rName} onChange={(e) => setRName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email">E-mail institucional</Label>
                  <Input
                    id="r-email"
                    type="email"
                    placeholder="nome@discente.uemg.br"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-pwd">Senha (mín. 6 caracteres)</Label>
                  <Input
                    id="r-pwd"
                    type="password"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="r-mat">Matrícula</Label>
                    <Input
                      id="r-mat"
                      value={rMatricula}
                      onChange={(e) => setRMatricula(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <Select
                      value={rCurso}
                      onValueChange={(v) => {
                        setRCurso(v);
                        setRPpc(""); // PPC depende do curso
                      }}
                    >
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
                </div>
                <div className="space-y-2">
                  <Label>PPC</Label>
                  <Select value={rPpc} onValueChange={setRPpc} disabled={!rCurso}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={rCurso ? "Selecione o PPC" : "Selecione o curso primeiro"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {ppcs
                        .filter((p) => p.courseId === rCurso)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            PPC {p.year} — {p.totalRequiredHours}h exigidas
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Caso não saiba essa informação, procurar a secretaria.
                  </p>
                </div>
                <Button className="w-full" onClick={submitRegister}>
                  Criar conta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}