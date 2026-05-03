import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/mocks/store";
import type { Certificate } from "@/mocks/types";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface Props {
  studentId: string;
  initial?: Certificate;
  onDone?: () => void;
}

const MAX_BYTES = 25 * 1024 * 1024;

// Opções de Ano/Semestre — gera os 3 últimos anos + ano atual + próximo
const yearSemesterOptions = (() => {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let y = current + 1; y >= current - 3; y--) {
    years.push(`${y}/2`);
    years.push(`${y}/1`);
  }
  return years;
})();

export function CertificateForm({ studentId, initial, onDone }: Props) {
  const { activities, categories, addCertificate, updateCertificate } = useStore();
  const activeActivities = useMemo(() => activities.filter((a) => a.isActive), [activities]);

  const [activityId, setActivityId] = useState(initial?.activityId ?? activeActivities[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [yearSemester, setYearSemester] = useState(initial?.yearSemester ?? "");
  const [hours, setHours] = useState<string>(initial?.hours != null ? String(initial.hours) : "");
  const [fileUrl, setFileUrl] = useState<string>(initial?.fileUrl ?? "");
  const [fileName, setFileName] = useState<string>(initial?.fileName ?? "");

  const selectedActivity = activities.find((a) => a.id === activityId);
  const selectedCategory = selectedActivity
    ? categories.find((c) => c.id === selectedActivity.categoryId)
    : null;

  // Atividade variável (defaultHours = null) ou categoria "Outros" → professor define depois
  const isVariableHours = selectedActivity?.defaultHours == null;
  const isOutros = selectedCategory?.name === "Outros";
  // Regra de negócio: o aluno NUNCA edita horas. O valor é fixo da atividade
  // ou fica indefinido até o professor avaliar (variável / Outros).
  const studentCannotSetHours = isVariableHours || isOutros;

  // Auto-preenchimento ao trocar de atividade (sempre, exceto na edição inicial)
  useEffect(() => {
    if (!selectedActivity) return;
    if (initial && initial.activityId === activityId) return;
    if (selectedActivity.defaultHours != null && !isOutros) {
      setHours(String(selectedActivity.defaultHours));
    } else {
      setHours("");
    }
  }, [activityId, selectedActivity, isOutros, initial]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("O arquivo excede 25 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
      setFileName(f.name);
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!activityId || !title || !date || !time || !location || !yearSemester) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!selectedActivity) {
      toast.error("Selecione uma atividade válida.");
      return;
    }
    if (!studentCannotSetHours && !hours) {
      toast.error("As horas dessa atividade não foram definidas. Selecione outra atividade.");
      return;
    }
    const numericHours = studentCannotSetHours ? null : Number(hours);
    if (numericHours != null && numericHours > selectedActivity.maxHours) {
      toast.error(`Esta atividade permite no máximo ${selectedActivity.maxHours}h.`);
      return;
    }
    if (!fileUrl && !initial) {
      toast.error("Anexe o certificado em PDF.");
      return;
    }

    const payload = {
      studentId,
      activityId,
      categoryId: selectedActivity.categoryId,
      title,
      date,
      time,
      location,
      yearSemester,
      hours: numericHours,
      fileUrl,
      fileName,
    };

    // TODO: Substituir por Supabase - upload para Storage + insert em certificates
    if (initial) {
      updateCertificate(initial.id, {
        ...payload,
        status: "PENDENTE",
        justification: undefined,
      });
      toast.success("Certificado atualizado e reenviado para análise.");
    } else {
      addCertificate(payload);
      toast.success("Certificado enviado para análise.");
    }
    onDone?.();
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Atividade *</Label>
        <Select value={activityId} onValueChange={setActivityId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {categories.map((cat) => {
              const list = activeActivities.filter((a) => a.categoryId === cat.id);
              if (list.length === 0) return null;
              return (
                <div key={cat.id}>
                  <div className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                    {cat.name}
                  </div>
                  {list.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                      {a.defaultHours != null
                        ? ` — ${a.defaultHours}h (máx. ${a.maxHours}h)`
                        : ` — variável (máx. ${a.maxHours}h)`}
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectContent>
        </Select>
        {selectedCategory && (
          <p className="text-xs text-muted-foreground">
            Categoria: <strong>{selectedCategory.name}</strong>
            {selectedActivity && ` · Limite máximo: ${selectedActivity.maxHours}h`}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Título da atividade *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Data *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Horário *</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Local (Unidade / Sala) *</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Ano / Semestre *</Label>
          <Select value={yearSemester} onValueChange={setYearSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {yearSemesterOptions.map((ys) => (
                <SelectItem key={ys} value={ys}>
                  {ys}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>
            Horas{" "}
            {studentCannotSetHours
              ? "(serão definidas pelo professor)"
              : "(automático conforme atividade)"}
          </Label>
          <Input
            type="number"
            value={studentCannotSetHours ? "" : hours}
            disabled
            placeholder={studentCannotSetHours ? "A definir" : ""}
            readOnly
          />
          {selectedActivity && (
            <p className="text-xs text-muted-foreground">
              {studentCannotSetHours
                ? `Carga variável — limite máximo ${selectedActivity.maxHours}h.`
                : `Valor padrão da atividade: ${selectedActivity.defaultHours}h (máx. ${selectedActivity.maxHours}h).`}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Certificado (PDF, até 25 MB) *</Label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/60">
          <Upload className="h-4 w-4" />
          <span>{fileName || "Clique para selecionar o PDF"}</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onDone && (
          <Button variant="outline" onClick={onDone}>
            Cancelar
          </Button>
        )}
        <Button onClick={submit}>{initial ? "Reenviar para análise" : "Enviar certificado"}</Button>
      </div>
    </div>
  );
}
