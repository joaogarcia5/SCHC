// TODO: Substituir por Supabase - mover tipos para src/integrations/supabase/types.ts
export type Role = "ALUNO" | "PROFESSOR" | "COORDENADOR";
export type CertificateStatus = "PENDENTE" | "APROVADO" | "REPROVADO";

// Atualize a interface do Usuário para incluir os novos campos
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ALUNO" | "PROFESSOR" | "COORDENADOR";
  password?: string;
  
  // Novos campos que adicionamos:
  matricula?: string;
  courseId?: string;
  ppcId?: string;
  curso?: string;
  ppc?: string;
  totalRequiredHours?: number;
}

// Garanta que a interface de registro tenha os campos courseId e ppcId
export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  matricula: string;
  courseId: string;
  ppcId: string;
}

// Curso oferecido pela instituição. Gerenciado pelo Coordenador.
export interface Course {
  id: string;
  name: string;
}

// Projeto Pedagógico de Curso — múltiplos por curso, com meta de horas.
export interface PPC {
  id: string;
  courseId: string;
  year: string; // ex.: "2004", "2021"
  totalRequiredHours: number;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Atividade tabelada conforme regulamento UEMG.
 * - defaultHours: horas atribuídas por unidade (curso/projeto/evento). Se null, é variável.
 * - maxHours: limite total que o aluno pode acumular nessa atividade ao longo do curso.
 */
export interface Activity {
  id: string;
  title: string;
  categoryId: string;
  defaultHours: number | null;
  maxHours: number;
  isActive: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  activityId: string; // referência à Activity tabelada
  categoryId: string; // denormalizado para facilitar relatórios
  title: string;
  date: string;
  time: string;
  location: string;
  yearSemester: string;
  hours: number | null;
  originalHours?: number | null; // horas declaradas originalmente pelo aluno
  hoursEdited?: boolean; // marca quando o professor editou as horas na aprovação
  fileUrl: string;
  fileName: string;
  status: CertificateStatus;
  justification?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}
