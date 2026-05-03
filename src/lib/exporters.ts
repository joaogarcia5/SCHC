// Exportadores reais — XLSX (sheetjs) e PDF (jsPDF + autotable)
// TODO: Substituir por Supabase Edge Function se quiser geração no servidor.
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Activity, Category, Certificate, User } from "@/mocks/types";

interface RowConsolidado {
  matricula?: string;
  name: string;
  curso?: string;
  ppc?: string;
  approved: number;
  required: number;
  pct: number;
}

export function exportConsolidadoXLSX(rows: RowConsolidado[]) {
  const data = rows.map((r) => ({
    Matrícula: r.matricula ?? "",
    Aluno: r.name,
    Curso: r.curso ?? "",
    PPC: r.ppc ?? "",
    "Horas Aprovadas": r.approved,
    "Horas Exigidas": r.required,
    "Progresso (%)": Math.round(r.pct * 100),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 14 }, { wch: 28 }, { wch: 26 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consolidado");
  XLSX.writeFile(wb, "relatorio-horas-uemg.xlsx");
}

export function exportConsolidadoPDF(rows: RowConsolidado[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("UEMG — Relatório Consolidado de Horas Complementares", 14, 16);
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["Matrícula", "Aluno", "Curso", "PPC", "Aprovadas", "Exigidas", "%"]],
    body: rows.map((r) => [
      r.matricula ?? "",
      r.name,
      r.curso ?? "",
      r.ppc ?? "",
      `${r.approved}h`,
      `${r.required}h`,
      `${Math.round(r.pct * 100)}%`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
  });
  doc.save("relatorio-horas-uemg.pdf");
}

interface IndividualParams {
  student: User;
  certificates: Certificate[];
  categories: Category[];
  activities: Activity[];
  approved: number;
  required: number;
}

export function exportIndividualXLSX({
  student,
  certificates,
  categories,
  activities,
  approved,
  required,
}: IndividualParams) {
  const wb = XLSX.utils.book_new();

  const info = XLSX.utils.aoa_to_sheet([
    ["Aluno", student.name],
    ["Matrícula", student.matricula ?? ""],
    ["Curso", student.curso ?? ""],
    ["PPC", student.ppc ?? ""],
    ["E-mail", student.email],
    ["Horas Aprovadas", approved],
    ["Horas Exigidas", required],
    ["Progresso", `${Math.round((approved / required) * 100)}%`],
  ]);
  info["!cols"] = [{ wch: 18 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, info, "Aluno");

  const certData = certificates.map((c) => {
    const cat = categories.find((cc) => cc.id === c.categoryId);
    const act = activities.find((a) => a.id === c.activityId);
    return {
      Atividade: act?.title ?? "",
      Título: c.title,
      Categoria: cat?.name ?? "",
      "Ano/Semestre": c.yearSemester,
      Data: c.date,
      Local: c.location,
      Horas: c.hours ?? "—",
      Status: c.status,
      Justificativa: c.justification ?? "",
    };
  });
  const certSheet = XLSX.utils.json_to_sheet(certData);
  certSheet["!cols"] = [
    { wch: 32 }, { wch: 32 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 24 }, { wch: 8 }, { wch: 12 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, certSheet, "Certificados");

  XLSX.writeFile(wb, `relatorio-${student.matricula ?? student.id}.xlsx`);
}

export function exportIndividualPDF({
  student,
  certificates,
  categories,
  activities,
  approved,
  required,
}: IndividualParams) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("UEMG — Relatório Individual do Aluno", 14, 16);
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    theme: "plain",
    body: [
      ["Aluno", student.name],
      ["Matrícula", student.matricula ?? ""],
      ["Curso", student.curso ?? ""],
      ["PPC", student.ppc ?? ""],
      ["E-mail", student.email],
      ["Horas Aprovadas", `${approved}h`],
      ["Horas Exigidas", `${required}h`],
      ["Progresso", `${Math.round((approved / required) * 100)}%`],
    ],
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  autoTable(doc, {
    head: [["Atividade", "Categoria", "Período", "Horas", "Status"]],
    body: certificates.map((c) => {
      const cat = categories.find((cc) => cc.id === c.categoryId);
      const act = activities.find((a) => a.id === c.activityId);
      return [
        `${c.title}\n${act?.title ?? ""}`,
        cat?.name ?? "",
        c.yearSemester,
        c.hours != null ? `${c.hours}h` : "—",
        c.status,
      ];
    }),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  doc.save(`relatorio-${student.matricula ?? student.id}.pdf`);
}
