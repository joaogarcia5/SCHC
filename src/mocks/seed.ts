import type { Activity, Category, Certificate, Course, PPC, User } from "./types";

// Cursos oferecidos pela instituição (gerenciados pelo Coordenador)
export const seedCourses: Course[] = [
  { id: "course-si", name: "Sistemas de Informação" },
  { id: "course-adm", name: "Administração" },
  { id: "course-dir", name: "Direito" },
  { id: "course-eng", name: "Engenharia de Produção" },
  { id: "course-psi", name: "Psicologia" },
  { id: "course-geo", name: "Geografia" },
  { id: "course-agro", name: "Agronomia" },
  { id: "course-jor", name: "Jornalismo" },
  { id: "course-pp", name: "Publicidade e Propaganda" },
];

// PPCs por curso — cada PPC define a meta de horas complementares
export const seedPPCs: PPC[] = [
  { id: "ppc-si-2004", courseId: "course-si", year: "2004", totalRequiredHours: 180 },
  { id: "ppc-si-2021", courseId: "course-si", year: "2021", totalRequiredHours: 200 },
  { id: "ppc-adm-2021", courseId: "course-adm", year: "2021", totalRequiredHours: 200 },
  { id: "ppc-dir-2021", courseId: "course-dir", year: "2021", totalRequiredHours: 240 },
  { id: "ppc-eng-2021", courseId: "course-eng", year: "2021", totalRequiredHours: 200 },
];

export const seedUsers: User[] = [
  {
    id: "u-aluno-1",
    name: "Ana Souza",
    email: "ana.souza@discente.uemg.br",
    role: "ALUNO",
    password: "123456",
    matricula: "20231001",
    courseId: "course-si",
    ppcId: "ppc-si-2021",
    curso: "Sistemas de Informação",
    ppc: "PPC 2021",
    totalRequiredHours: 200,
  },
  {
    id: "u-aluno-2",
    name: "Bruno Lima",
    email: "bruno.lima@discente.uemg.br",
    role: "ALUNO",
    password: "123456",
    matricula: "20231002",
    courseId: "course-si",
    ppcId: "ppc-si-2004",
    curso: "Sistemas de Informação",
    ppc: "PPC 2004",
    totalRequiredHours: 180,
  },
  {
    id: "u-prof-1",
    name: "Prof. Carla Mendes",
    email: "carla.mendes@uemg.br",
    role: "PROFESSOR",
    password: "123456",
  },
  {
    id: "u-coord-1",
    name: "Coord. Daniel Rocha",
    email: "daniel.rocha@uemg.br",
    role: "COORDENADOR",
    password: "123456",
  },
];

export const seedCategories: Category[] = [
  { id: "c-ensino", name: "Ensino", isActive: true },
  { id: "c-pesquisa", name: "Pesquisa", isActive: true },
  { id: "c-extensao", name: "Extensão", isActive: true },
  { id: "c-outros", name: "Outros", isActive: true },
];

/**
 * Atividades tabeladas oficiais UEMG.
 * defaultHours = null indica carga horária variável (ex.: eventos sem apresentação)
 * — o aluno informa e o professor confirma, respeitando maxHours.
 */
export const seedActivities: Activity[] = [
  // ==== ENSINO ====
  { id: "a-en-1", title: "Cursos online (qualquer área)", categoryId: "c-ensino", defaultHours: 1, maxHours: 5, isActive: true },
  { id: "a-en-2", title: "Cursos pertinentes à formação", categoryId: "c-ensino", defaultHours: 2, maxHours: 10, isActive: true },
  { id: "a-en-3", title: "Cursos de Informática / Línguas", categoryId: "c-ensino", defaultHours: 2, maxHours: 10, isActive: true },
  { id: "a-en-4", title: "Visita técnica", categoryId: "c-ensino", defaultHours: 2, maxHours: 10, isActive: true },
  { id: "a-en-5", title: "Prêmios acadêmicos", categoryId: "c-ensino", defaultHours: 1, maxHours: 5, isActive: true },
  { id: "a-en-6", title: "Monitoria", categoryId: "c-ensino", defaultHours: 10, maxHours: 20, isActive: true },
  { id: "a-en-7", title: "Estágio não obrigatório", categoryId: "c-ensino", defaultHours: 10, maxHours: 20, isActive: true },

  // ==== EXTENSÃO ====
  { id: "a-ex-1", title: "Representação estudantil", categoryId: "c-extensao", defaultHours: 3, maxHours: 6, isActive: true },
  { id: "a-ex-2", title: "Projeto de TI", categoryId: "c-extensao", defaultHours: 5, maxHours: 15, isActive: true },
  { id: "a-ex-3", title: "Desenvolvimento de aplicações", categoryId: "c-extensao", defaultHours: 10, maxHours: 20, isActive: true },
  { id: "a-ex-4", title: "Eventos sem apresentação (carga variável)", categoryId: "c-extensao", defaultHours: null, maxHours: 5, isActive: true },
  { id: "a-ex-5", title: "Palestrante", categoryId: "c-extensao", defaultHours: 1, maxHours: 5, isActive: true },
  { id: "a-ex-6", title: "Organização de eventos", categoryId: "c-extensao", defaultHours: 5, maxHours: 10, isActive: true },
  { id: "a-ex-7", title: "Atividades culturais / esportivas", categoryId: "c-extensao", defaultHours: 1, maxHours: 5, isActive: true },
  { id: "a-ex-8", title: "Voluntariado", categoryId: "c-extensao", defaultHours: 1, maxHours: 5, isActive: true },

  // ==== PESQUISA ====
  { id: "a-pe-1", title: "Publicação científica (Artigos / Livros)", categoryId: "c-pesquisa", defaultHours: 10, maxHours: 20, isActive: true },
  { id: "a-pe-2", title: "Publicação de Resumos", categoryId: "c-pesquisa", defaultHours: 5, maxHours: 10, isActive: true },
  { id: "a-pe-3", title: "Iniciação Científica", categoryId: "c-pesquisa", defaultHours: 10, maxHours: 20, isActive: true },
  { id: "a-pe-4", title: "Apresentação de trabalho em evento", categoryId: "c-pesquisa", defaultHours: 5, maxHours: 10, isActive: true },

  // ==== OUTROS ====
  { id: "a-ou-1", title: "Outras atividades (a definir pelo professor)", categoryId: "c-outros", defaultHours: null, maxHours: 20, isActive: true },
];

export const seedCertificates: Certificate[] = [
  {
    id: "cert-1",
    studentId: "u-aluno-1",
    activityId: "a-ex-6",
    categoryId: "c-extensao",
    title: "Semana de Extensão UEMG 2024",
    date: "2024-09-12",
    time: "08:00",
    location: "Unidade Belo Horizonte - Auditório",
    yearSemester: "2024/2",
    hours: 5,
    fileUrl: "",
    fileName: "extensao-2024.pdf",
    status: "APROVADO",
    reviewedBy: "u-prof-1",
    reviewedAt: "2024-09-20T10:00:00.000Z",
    createdAt: "2024-09-15T10:00:00.000Z",
  },
  {
    id: "cert-2",
    studentId: "u-aluno-1",
    activityId: "a-pe-3",
    categoryId: "c-pesquisa",
    title: "Iniciação Científica - Projeto X",
    date: "2024-10-01",
    time: "14:00",
    location: "Lab. Pesquisa 2",
    yearSemester: "2024/2",
    hours: 10,
    fileUrl: "",
    fileName: "ic-projeto-x.pdf",
    status: "PENDENTE",
    createdAt: "2024-10-05T10:00:00.000Z",
  },
  {
    id: "cert-3",
    studentId: "u-aluno-1",
    activityId: "a-ou-1",
    categoryId: "c-outros",
    title: "Monitoria voluntária",
    date: "2024-08-10",
    time: "10:00",
    location: "Sala 12",
    yearSemester: "2024/2",
    hours: null,
    fileUrl: "",
    fileName: "monitoria.pdf",
    status: "REPROVADO",
    justification:
      "Documento ilegível em algumas páginas. Reenvie um PDF nítido contendo a assinatura do responsável.",
    reviewedBy: "u-prof-1",
    reviewedAt: "2024-08-20T10:00:00.000Z",
    createdAt: "2024-08-12T10:00:00.000Z",
  },
];
