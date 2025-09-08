import React from 'react';
import { ManagedItem, BookingItem, TeacherItem, CourseItem, SubjectItem, SemesterItem } from '@/types/management';

export interface ManagementRouteConfig<T extends ManagedItem> {
  path: string;
  title: string;
  collectionPath: string;
  searchPlaceholder: string;
  addBtnLabel: string;
  onAddClick: () => void;
  columns: { key: keyof T; header: string; render?: (item: T) => React.ReactNode; }[];
}

export const managementRoutes: { [key: string]: ManagementRouteConfig<any> } = {
  salas: {
    path: "/salas",
    title: "Gerenciar Salas",
    collectionPath: "salas",
    searchPlaceholder: "Buscar sala...",
    addBtnLabel: "Adicionar Sala",
    onAddClick: () => alert("Abrir formulário para adicionar sala!"),
    columns: [
      { key: "code", header: "Código" },
      { key: "name", header: "Nome da Sala" },
      { key: "type", header: "Tipo" },
      { key: "capacity", header: "Capacidade" },
      { key: "id", header: "Ações" } 
    ],
  },
  professores: {
    path: "/professores",
    title: "Gerenciar Professores",
    collectionPath: "professores",
    searchPlaceholder: "Buscar professor...",
    addBtnLabel: "Adicionar Professor",
    onAddClick: () => alert("Abrir formulário para adicionar professor!"),
    columns: [
      { key: "name", header: "Nome" },
      { key: "email", header: "Email" },
      { key: "id", header: "Ações" }
    ],
  },
  cursos: {
    path: "/cursos",
    title: "Gerenciar Cursos",
    collectionPath: "cursos",
    searchPlaceholder: "Buscar curso...",
    addBtnLabel: "Adicionar Curso",
    onAddClick: () => alert("Abrir formulário para adicionar curso!"),
    columns: [
      { key: "code", header: "Código" },
      { key: "name", header: "Nome" },
      { key: "id", header: "Ações" }
    ],
  },
  disciplinas: {
    path: "/disciplinas",
    title: "Gerenciar Disciplinas",
    collectionPath: "disciplinas",
    searchPlaceholder: "Buscar disciplina...",
    addBtnLabel: "Adicionar Disciplina",
    onAddClick: () => alert("Abrir formulário para adicionar disciplina!"),
    columns: [
      { key: "code", header: "Código" },
      { key: "name", header: "Nome" },
      { key: "course", header: "Curso" },
      { key: "chTeorica", header: "CH Teórica" },
      { key: "chPratica", header: "CH Prática" },
      { key: "id", header: "Ações" }
    ],
  },
  semestres: {
    title: 'Histórico de Semestres',
    path: "/semestres",
    collectionPath: "semestres",
    searchPlaceholder: "Buscar semestre...",
    addBtnLabel: "Adicionar Novo Horário",
    onAddClick: () => alert("Abrir formulário para adicionar semestre!"),
    columns: [
      { key: "name", header: "NOME DO SEMESTRE" },
      {
        key: "lastModified",
        header: "ÚLTIMA MODIFICAÇÃO",
        render: (item: SemesterItem) => {
          const { lastModified } = item;
          let date: Date | null = null;

          if (typeof lastModified === 'number') {
            date = new Date(lastModified);
          } else if (lastModified instanceof Date) {
            date = lastModified;
          }

          if (date) {
            const formattedDate = date.toLocaleDateString('pt-BR');
            const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `${formattedDate} ${formattedTime}`;
          }
          return 'N/A';
        },
      },
      { key: "id", header: "Ações" } 
    ]
  },
};