import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateForm } from "@/components/CertificateForm";
import { useStore } from "@/mocks/store";

export const Route = createFileRoute("/aluno/novo")({
  component: NovoCertificado,
});

function NovoCertificado() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Enviar novo certificado</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificateForm
            studentId={currentUser.id}
            onDone={() => navigate({ to: "/aluno/certificados" })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
