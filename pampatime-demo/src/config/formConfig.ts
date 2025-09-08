// src/config/formConfig.ts
import { EntityFormConfig, FormField, BookingItem, TeacherItem, CourseItem, SubjectItem, SemesterItem, TurmaItem } from '@/types/management';

export const entityFormConfigs: { [key: string]: EntityFormConfig<any> } = {
  disciplinas: {
    title: 'Adicionar Disciplina',
    fields: [
      { id: 'code', label: 'CÓDIGO', type: 'text', required: true, placeholder: 'Ex: CC01' },
      { id: 'name', label: 'NOME', type: 'text', required: true, placeholder: 'Ex: Algoritmos e Estruturas de Dados' },
      { 
        id: 'course', 
        label: 'CURSO', 
        type: 'select', 
        required: true, 
        placeholder: 'Selecione um curso',
        // As opções serão preenchidas dinamicamente pelo componente
        options: []
      },
      { id: 'chTeorica', label: 'CH TEÓRICA', type: 'text', required: true, placeholder: 'Ex: 40h' },
      { id: 'chPratica', label: 'CH PRÁTICA', type: 'text', required: true, placeholder: 'Ex: 20h' },
      { id: 'tipoSalaPreferencial', label: 'TIPO DE SALA PREFERENCIAL', type: 'text', placeholder: 'Ex: Laboratório' },
    ] as FormField[],
    defaultValues: {
      code: '',
      name: '',
      course: '',
      chTeorica: '',
      chPratica: '',
      tipoSalaPreferencial: '',
    } as Omit<SubjectItem, 'id'>,
  },
  professores: {
    title: 'Adicionar Professor',
    fields: [
      { id: 'name', label: 'NOME', type: 'text', required: true, placeholder: 'Ex: Prof. Ana Silva' },
      { id: 'email', label: 'EMAIL', type: 'email', required: true, placeholder: 'Ex: professor@escola.com' },
    ] as FormField[],
    defaultValues: {
      name: '',
      email: '',
    } as Omit<TeacherItem, 'id'>,
  },
  salas: {
    title: 'Adicionar Sala',
    fields: [
      {id: 'code', label: 'CÓDIGO', type: 'text', required: true, placeholder: 'Ex: S201' },
      { id: 'name', label: 'NOME DA SALA', type: 'text', required: true, placeholder: 'Ex: Sala 201' },
      { id: 'capacity', label: 'CAPACIDADE', type: 'number', required: true, placeholder: 'Ex: 45' },
      { id: 'type', label: 'TIPO', type: 'text', required: true, placeholder: 'Ex: Sala de Aula, Laboratório' },
    ] as FormField[],
    defaultValues: {
      name: '',
      capacity: 0,
      type: '',
      code: '',
    } as Omit<BookingItem, 'id'>,
  },
  cursos: {
    title: 'Adicionar Curso',
    fields: [
      { id: 'code', label: 'CÓDIGO', type: 'text', required: true, placeholder: 'Ex: T10' },
      { id: 'name', label: 'NOME DO CURSO', type: 'text', required: true, placeholder: 'Ex: Engenharia de Software' },
    ] as FormField[],
    defaultValues: {
      code: '',
      name: '',
    } as Omit<CourseItem, 'id'>,
  },
  turmas: {
    title: 'Adicionar Turma',
    fields: [
      { id: 'name', label: 'NOME DA TURMA', type: 'text', required: true, placeholder: 'Ex: Turma A, 2024.1 - A' },
      { 
        id: 'course', 
        label: 'CURSO', 
        type: 'select', 
        required: true, 
        placeholder: 'Selecione um curso',
        // As opções serão preenchidas dinamicamente pelo componente
        options: []
      },
    ] as FormField[],
    defaultValues: {
      name: '',
      course: '',
    } as Omit<TurmaItem, 'id'>,
  },
  semestres: {
    title: 'Adicionar Semestre',
    fields: [
      { id: 'name', label: 'NOME DO SEMESTRE', type: 'text', required: true, placeholder: 'Ex: SEMESTRE 02/2025' },
    ] as FormField[],
    defaultValues: {
      name: '',
    } as Omit<SemesterItem, 'id'>,
  },
};