// src/utils/academicDataUtils.ts
import academicData from '@/data/academicData.json';
import type { AcademicData, Professor, Sala, Turma, Disciplina, Tipo, Semestre, Horario, Dia } from '@/types/AcademicData';

const data = academicData as AcademicData;

// Funções para buscar por ID
export const getProfessorById = (id: string): Professor | undefined => {
  return data.professores.find(prof => prof.id === id);
};

export const getSalaById = (id: string): Sala | undefined => {
  return data.salas.find(sala => sala.id === id);
};

export const getTurmaById = (id: string): Turma | undefined => {
  return data.turmas.find(turma => turma.id === id);
};

export const getDisciplinaById = (id: string): Disciplina | undefined => {
  return data.disciplinas.find(disc => disc.id === id);
};

export const getTipoById = (id: string): Tipo | undefined => {
  return data.tipos.find(tipo => tipo.id === id);
};

export const getSemestreById = (id: string): Semestre | undefined => {
  return data.semestres.find(sem => sem.id === id);
};

export const getHorarioById = (id: string): Horario | undefined => {
  return data.horarios.find(hor => hor.id === id);
};

export const getDiaById = (id: string): Dia | undefined => {
  return data.dias.find(dia => dia.id === id);
};

// Funções para buscar por nome/código
export const getProfessorByNome = (nome: string): Professor | undefined => {
  return data.professores.find(prof => prof.nome === nome);
};

export const getSalaByCodigo = (codigo: string): Sala | undefined => {
  return data.salas.find(sala => sala.codigo === codigo);
};

export const getTurmaByCodigo = (codigo: string): Turma | undefined => {
  return data.turmas.find(turma => turma.codigo === codigo);
};

export const getDisciplinaByNome = (nome: string): Disciplina | undefined => {
  return data.disciplinas.find(disc => disc.nome === nome);
};

export const getDisciplinaByCodigo = (codigo: string): Disciplina | undefined => {
  return data.disciplinas.find(disc => disc.codigo === codigo);
};

export const getTipoByNome = (nome: string): Tipo | undefined => {
  return data.tipos.find(tipo => tipo.nome === nome);
};

export const getSemestreByCodigo = (codigo: string): Semestre | undefined => {
  return data.semestres.find(sem => sem.codigo === codigo);
};

export const getHorarioByHora = (hora: string): Horario | undefined => {
  return data.horarios.find(hor => hor.hora === hora);
};

export const getDiaByNome = (nome: string): Dia | undefined => {
  return data.dias.find(dia => dia.nome === nome);
};

// Funções para obter listas filtradas
export const getSalasByTipo = (tipo: string): Sala[] => {
  return data.salas.filter(sala => sala.tipo === tipo);
};

export const getDisciplinasByTipo = (tipo: string): Disciplina[] => {
  return data.disciplinas.filter(disc => disc.tipo === tipo);
};

export const getTiposByCategoria = (categoria: 'Modalidade'): Tipo[] => {
  return data.tipos.filter(tipo => tipo.categoria === categoria);
};

export const getProfessoresByDepartamento = (departamento: string): Professor[] => {
  return data.professores.filter(prof => prof.departamento === departamento);
};

// Funções para validação
export const isValidProfessorId = (id: string): boolean => {
  return data.professores.some(prof => prof.id === id);
};

export const isValidSalaId = (id: string): boolean => {
  return data.salas.some(sala => sala.id === id);
};

export const isValidTurmaId = (id: string): boolean => {
  return data.turmas.some(turma => turma.id === id);
};

// Exportar os dados completos para casos especiais
export const getAcademicData = (): AcademicData => {
  return data;
};

// Constantes para tipos de salas
export const TIPOS_SALA = {
  SALA_AULA: 'Sala de Aula',
  LAB_INFORMATICA: 'Laboratório de Informática',
  LAB_PRATICO: 'Laboratório Prático'
} as const;

// Constantes para categorias de tipos
export const CATEGORIAS_TIPO = {
  MODALIDADE: 'Modalidade'
} as const;