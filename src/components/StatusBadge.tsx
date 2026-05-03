import { Badge } from "@/components/ui/badge";
import type { CertificateStatus } from "@/mocks/types";

export function StatusBadge({ status }: { status: CertificateStatus }) {
  const map: Record<CertificateStatus, { label: string; className: string }> = {
    PENDENTE: { label: "Pendente", className: "bg-warning text-warning-foreground" },
    APROVADO: { label: "Aprovado", className: "bg-success text-success-foreground" },
    REPROVADO: { label: "Reprovado", className: "bg-destructive text-destructive-foreground" },
  };
  const cfg = map[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}
