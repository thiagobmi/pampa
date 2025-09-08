// src/types/AcademicData.ts

export interface Professor {
  id: string;
  nome: string;
  departamento: string;
  especialidade: string;
}

export interface Semestre {
  id: string;
  codigo: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
}

export interface Horario {
  id: string;
  hora: string;
  periodo: string;
}

export interface Sala {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  capacidade: number;
  bloco: string;
  andar: number;
  recursos: string[];
}

export interface Dia {
  id: string;
  nome: string;
  nomeCompleto: string;
  ordem: number;
}

export interface Turma {
  id: string;
  codigo: string;
  nome: string;
  curso: string;
  semestre: number;
  ano: number;
}

export interface Tipo {
  id: string;
  nome: string;
  categoria: 'Modalidade';
  cor: string;
}

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  cargaHoraria: number;
  prerequisitos: string[];
}

export interface AcademicData {
  professores: Professor[];
  semestres: Semestre[];
  horarios: Horario[];
  salas: Sala[];
  dias: Dia[];
  turmas: Turma[];
  tipos: Tipo[];
  disciplinas: Disciplina[];
}

// Tipos para as opções do SearchableFilter
export interface FilterOption {
  id: string;
  display: string;
  searchText: string;
  additionalInfo?: string;
  tipo?: 'nome' | 'codigo'; // Para disciplinas
}