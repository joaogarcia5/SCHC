import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Activity, Category, Certificate, Course, PPC, Role, User } from "./types";
import {
  seedActivities,
  seedCategories,
  seedCertificates,
  seedCourses,
  seedPPCs,
} from "./seed";
import { supabase } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "uemg-hc-store-v3";
const SESSION_KEY = "uemg-hc-session-v1";

interface StoreState {
  users: User[];
  categories: Category[];
  activities: Activity[];
  certificates: Certificate[];
  courses: Course[];
  ppcs: PPC[];
}

export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  matricula: string;
  courseId: string; 
  ppcId: string;    
}

interface StoreContextValue extends StoreState {
  currentUser: User | null;
  login: (email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string; user?: User }>;
  registerStudent: (input: RegisterStudentInput) => Promise<{ ok: boolean; error?: string; user?: User }>;
  logout: () => void;
  addCertificate: (c: Omit<Certificate, "id" | "createdAt" | "status">) => Promise<{ ok: boolean; error?: string; data?: Certificate }>;
  updateCertificate: (id: string, patch: Partial<Certificate>) => Promise<{ ok: boolean; error?: string }>;
  reviewCertificate: (
    id: string,
    decision: "APROVADO" | "REPROVADO",
    payload: { hours?: number | null; justification?: string; reviewerId: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  addActivity: (a: Omit<Activity, "id" | "isActive">) => Promise<{ ok: boolean; error?: string }>;
  updateActivity: (id: string, patch: Partial<Activity>) => Promise<{ ok: boolean; error?: string }>;
  addProfessor: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  removeUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (id: string, patch: { name?: string; matricula?: string; courseId?: string; ppcId?: string }) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (id: string, currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  addCourse: (name: string) => Promise<{ ok: boolean; error?: string }>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<{ ok: boolean; error?: string }>;
  removeCourse: (id: string) => Promise<{ ok: boolean; error?: string }>;
  addPPC: (courseId: string, year: string, totalRequiredHours: number) => Promise<{ ok: boolean; error?: string }>;
  updatePPC: (id: string, patch: Partial<PPC>) => Promise<{ ok: boolean; error?: string }>;
  removePPC: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): StoreState {
  const fallback: StoreState = {
    users: [],
    categories: seedCategories,
    activities: seedActivities,
    certificates: seedCertificates,
    courses: seedCourses,
    ppcs: seedPPCs,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      return {
        users: parsed.users ?? fallback.users,
        categories: parsed.categories ?? fallback.categories,
        activities: parsed.activities ?? fallback.activities,
        certificates: parsed.certificates ?? fallback.certificates,
        courses: parsed.courses ?? fallback.courses,
        ppcs: parsed.ppcs ?? fallback.ppcs,
      };
    }
  } catch {}
  return fallback;
}

function loadSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadSession());

  useEffect(() => {
    async function syncDatabase() {
      const [
        { data: coursesDB },
        { data: ppcsDB },
        { data: categoriesDB },
        { data: activitiesDB },
        { data: certificatesDB },
        { data: profilesDB }
      ] = await Promise.all([
        supabase.from('cursos').select('*'),
        supabase.from('ppcs').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('atividades').select('*'),
        supabase.from('certificados').select('*'),
        supabase.from('perfis').select('*')
      ]);

      setState(s => ({
        ...s,
        courses: coursesDB ? coursesDB.map((c: any) => ({ id: c.id, name: c.nome })) : s.courses,
        ppcs: ppcsDB ? ppcsDB.map((p: any) => ({ 
          id: p.id, 
          courseId: p.curso_id, 
          year: p.ano_vigente, 
          totalRequiredHours: p.horas_totais 
        })) : s.ppcs,
        categories: categoriesDB ? categoriesDB.map((cat: any) => ({ 
          id: cat.id, 
          name: cat.nome,
          isActive: true 
        })) : s.categories,
        activities: activitiesDB ? activitiesDB.map((a: any) => ({
          id: a.id,
          title: a.titulo,
          categoryId: a.categoria_id,
          defaultHours: a.horas_padrao,
          maxHours: a.limite_maximo,
          isActive: a.ativa === true 
        })) : s.activities,
        certificates: certificatesDB ? certificatesDB.map((c: any) => ({
          id: c.id,
          studentId: c.aluno_id,
          activityId: c.atividade_id,
          categoryId: c.categoria_id || "",
          title: c.titulo_evento,
          date: c.data_atividade,
          originalHours: c.horas_originais,
          hours: c.horas_validadas,
          time: "", 
          location: "",
          yearSemester: c.ano_semestre || "",
          fileName: "documento.pdf",
          fileUrl: c.arquivo_url,
          status: c.status as any,
          justification: c.justificativa,
          reviewedBy: c.avaliado_por,
          reviewedAt: c.revisado_em,
          createdAt: c.criado_em,
        })) : s.certificates,
        users: profilesDB ? profilesDB.map((p: any) => ({
          id: p.id,
          name: p.nome,
          email: p.email,
          role: p.role as Role,
          matricula: p.matricula,
          courseId: p.curso_id,
          ppcId: p.ppc_id
        })) : s.users
      }));
    }

    syncDatabase();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  const value: StoreContextValue = useMemo(() => {
    return {
      ...state,
      currentUser,

      login: async (email, password, role) => {
        const e = email.trim().toLowerCase();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: e,
          password: password,
        });

        if (authError) return { ok: false, error: "E-mail ou senha incorretos." };
        if (!authData.user) return { ok: false, error: "Falha na autenticação." };

        const { data: profile, error: profileError } = await supabase
          .from('perfis')
          .select('*, ppcs(horas_totais)')
          .eq('id', authData.user.id)
          .single();

        if (profileError || !profile) {
            await supabase.auth.signOut();
            return { ok: false, error: "Perfil não encontrado." };
        }

        if (profile.role !== role) {
           await supabase.auth.signOut();
           return { ok: false, error: `Permissão de ${role} negada.` };
        }

        const user: User = {
            id: profile.id,
            name: profile.nome,
            email: profile.email,
            role: profile.role,
            matricula: profile.matricula,
            courseId: profile.curso_id,
            ppcId: profile.ppc_id,
            totalRequiredHours: (profile as any).ppcs?.horas_totais ?? 200,
        };

        setCurrentUser(user);
        return { ok: true, user };
      },

      registerStudent: async (input) => {
        const e = input.email.trim().toLowerCase();
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: e,
          password: input.password,
        });

        if (authError) return { ok: false, error: authError.message };
        if (!authData.user) return { ok: false, error: "Erro ao criar acesso." };

        const { data: ppcData } = await supabase
          .from('ppcs')
          .select('horas_totais')
          .eq('id', input.ppcId)
          .single();

        const totalHours = ppcData?.horas_totais ?? 200;

        const { error: profileError } = await supabase
          .from('perfis')
          .insert({
            id: authData.user.id,
            nome: input.name.trim(),
            email: e,
            role: 'ALUNO',
            matricula: input.matricula.trim(),
            curso_id: input.courseId,
            ppc_id: input.ppcId
          });

        if (profileError) return { ok: false, error: "Erro ao salvar dados do perfil." };

        const user: User = {
          id: authData.user.id,
          name: input.name.trim(),
          email: e,
          role: "ALUNO",
          matricula: input.matricula.trim(),
          courseId: input.courseId,
          ppcId: input.ppcId,
          totalRequiredHours: totalHours,
        };

        setCurrentUser(user);
        return { ok: true, user };
      },

      addProfessor: async (name, email, password) => {
        const e = email.trim().toLowerCase();
        try {
          const tempSupabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            { auth: { persistSession: false } }
          );

          const { data: authData, error: authError } = await tempSupabase.auth.signUp({
            email: e,
            password: password,
          });

          if (authError) return { ok: false, error: authError.message };
          if (!authData.user) return { ok: false, error: "Erro ao gerar credenciais." };

          const { error: profileError } = await supabase
            .from('perfis')
            .insert({
              id: authData.user.id,
              nome: name.trim(),
              email: e,
              role: 'PROFESSOR'
            });

          if (profileError) return { ok: false, error: "Erro ao criar perfil de professor." };

          const newProf: User = {
            id: authData.user.id,
            name: name.trim(),
            email: e,
            role: "PROFESSOR",
          };

          setState((s) => ({ ...s, users: [newProf, ...s.users] }));
          return { ok: true };
        } catch (err) {
          return { ok: false, error: "Falha na conexão com o servidor." };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
      },

      addCertificate: async (c) => {
        const { data, error } = await supabase
          .from('certificados')
          .insert({
            aluno_id: c.studentId,
            atividade_id: c.activityId,
            categoria_id: c.categoryId,
            titulo_evento: c.title,
            data_atividade: c.date,
            ano_semestre: c.yearSemester,
            horas_originais: c.hours,
            arquivo_url: c.fileUrl,
            status: 'PENDENTE'
          })
          .select()
          .single();

        if (error) return { ok: false, error: error.message };

        const newCert: Certificate = {
          id: data.id,
          studentId: data.aluno_id,
          activityId: data.atividade_id,
          categoryId: data.categoria_id,
          title: data.titulo_evento,
          date: data.data_atividade,
          yearSemester: data.ano_semestre,
          hours: data.horas_validadas || data.horas_originais,
          originalHours: data.horas_originais,
          fileUrl: data.arquivo_url,
          fileName: c.fileName,
          status: data.status,
          createdAt: data.criado_em || new Date().toISOString(),
          time: c.time,
          location: c.location
        };

        setState(s => ({ ...s, certificates: [newCert, ...s.certificates] }));
        return { ok: true, data: newCert };
      },

      updateCertificate: async (id, patch) => {
        const updateData: any = {};
        if (patch.title) updateData.titulo_evento = patch.title;
        if (patch.date) updateData.data_atividade = patch.date;
        if (patch.yearSemester) updateData.ano_semestre = patch.yearSemester;
        if (patch.hours) updateData.horas_originais = patch.hours;
        if (patch.fileUrl) updateData.arquivo_url = patch.fileUrl;
        if (patch.activityId) updateData.atividade_id = patch.activityId;
        updateData.status = 'PENDENTE';

        const { error } = await supabase.from('certificados').update(updateData).eq('id', id);
        if (error) return { ok: false, error: error.message };

        setState(s => ({
          ...s,
          certificates: s.certificates.map(c => c.id === id ? { ...c, ...patch, status: 'PENDENTE' } : c)
        }));
        return { ok: true };
      },

      reviewCertificate: async (id, decision, payload) => {
        try {
          const { error } = await supabase
            .from('certificados')
            .update({
              status: decision,
              horas_validadas: payload.hours,
              justificativa: payload.justification,
              avaliado_por: payload.reviewerId,
              revisado_em: new Date().toISOString()
            })
            .eq('id', id);

          if (error) return { ok: false, error: error.message };

          setState((s) => ({
            ...s,
            certificates: s.certificates.map((c) => {
              if (c.id !== id) return c;
              return { 
                ...c, 
                status: decision, 
                hours: payload.hours ?? c.hours, 
                justification: payload.justification,
                reviewedBy: payload.reviewerId, 
                reviewedAt: new Date().toISOString() 
              };
            }),
          }));
          return { ok: true };
        } catch (err) {
          return { ok: false, error: "Erro de rede." };
        }
      },

      addActivity: async (a) => {
        const cat = state.categories.find((c) => c.id === a.categoryId);
        const { data, error } = await supabase
          .from('atividades')
          .insert({
            titulo: a.title,
            categoria: cat?.name,
            categoria_id: a.categoryId,
            horas_padrao: a.defaultHours,
            limite_maximo: a.maxHours,
            ativa: true
          })
          .select().single();

        if (error) return { ok: false, error: error.message };

        const newActivity: Activity = {
          id: data.id,
          title: data.titulo,
          categoryId: data.categoria_id,
          defaultHours: data.horas_padrao,
          maxHours: data.limite_maximo,
          isActive: !!data.ativa
        };

        setState((s) => ({ ...s, activities: [...s.activities, newActivity] }));
        return { ok: true };
      },

      updateActivity: async (id, patch) => {
        const updateData: any = {};
        if (patch.title !== undefined) updateData.titulo = patch.title;
        if (patch.defaultHours !== undefined) updateData.horas_padrao = patch.defaultHours;
        if (patch.maxHours !== undefined) updateData.limite_maximo = patch.maxHours;
        if (patch.isActive !== undefined) updateData.ativa = patch.isActive;

        const { error } = await supabase.from('atividades').update(updateData).eq('id', id);
        if (error) return { ok: false, error: error.message };

        setState((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
        }));
        return { ok: true };
      },

      addCourse: async (name) => {
        const { data, error } = await supabase.from('cursos').insert({ nome: name }).select().single();
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, courses: [...s.courses, { id: data.id, name: data.nome }] }));
        return { ok: true };
      },

      updateCourse: async (id, patch) => {
        const { error } = await supabase.from('cursos').update({ nome: patch.name }).eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, courses: s.courses.map(c => c.id === id ? { ...c, ...patch } : c) }));
        return { ok: true };
      },

      removeCourse: async (id) => {
        if (state.users.some(u => u.courseId === id)) return { ok: false, error: "Existem alunos vinculados." };
        const { error } = await supabase.from('cursos').delete().eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, courses: s.courses.filter(c => c.id !== id) }));
        return { ok: true };
      },

      addPPC: async (courseId, year, totalRequiredHours) => {
        const { data, error } = await supabase.from('ppcs').insert({
          curso_id: courseId, ano_vigente: year, horas_totais: totalRequiredHours
        }).select().single();
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, ppcs: [...s.ppcs, { id: data.id, courseId, year, totalRequiredHours }] }));
        return { ok: true };
      },

      updatePPC: async (id, patch) => {
        const updateData: any = {};
        if (patch.year) updateData.ano_vigente = patch.year;
        if (patch.totalRequiredHours) updateData.horas_totais = patch.totalRequiredHours;
        const { error } = await supabase.from('ppcs').update(updateData).eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, ppcs: s.ppcs.map(p => p.id === id ? { ...p, ...patch } : p) }));
        return { ok: true };
      },

      removePPC: async (id) => {
        if (state.users.some(u => u.ppcId === id)) return { ok: false, error: "Existem alunos vinculados." };
        const { error } = await supabase.from('ppcs').delete().eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, ppcs: s.ppcs.filter(p => p.id !== id) }));
        return { ok: true };
      },

      removeUser: async (id) => {
        const { error } = await supabase.from('perfis').delete().eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
        return { ok: true };
      },

      updateUser: async (id, patch) => {
        const updateData: any = {};
        if (patch.name) updateData.nome = patch.name;
        if (patch.matricula) updateData.matricula = patch.matricula;
        if (patch.courseId) updateData.curso_id = patch.courseId;
        if (patch.ppcId) updateData.ppc_id = patch.ppcId;

        const { error } = await supabase.from('perfis').update(updateData).eq('id', id);
        if (error) return { ok: false, error: error.message };
        setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
        return { ok: true };
      },

      changePassword: async (id, currentPassword, newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      }
    };
  }, [state, currentUser]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}

export function getStudentApprovedHours(certs: Certificate[], studentId: string) {
  return certs
    .filter((c) => c.studentId === studentId && c.status === "APROVADO" && c.hours)
    .reduce((sum, c) => sum + (c.hours ?? 0), 0);
}