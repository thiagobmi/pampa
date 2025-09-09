import React from "react";
import {FieldValue} from "firebase/firestore";

export interface ManagedItem {
  id: string;
  [key: string]: any;
}

export interface TeacherItem extends ManagedItem {
  name: string;
  email: string;
}

export interface BookingItem extends ManagedItem {
  name: string;
  capacity: number;
  type: string;
  code: string;
}

export interface CourseItem extends ManagedItem {
  code: string; 
  name: string;
}

export interface TurmaItem extends ManagedItem {
  name: string;
  course: string;
}

export interface SubjectItem extends ManagedItem {
  code: string;
  name: string;
  course: string;
  chTeorica: string;
  chPratica: string;
  tipoSalaPreferencial?: string;
}

export interface TableColumn<T extends ManagedItem> {
  key: keyof T | 'id';
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface ManagementRouteConfig<T extends ManagedItem> {
  path: string;
  title: string;
  collectionPath: string;
  searchPlaceholder?: string;
  columns: TableColumn<T>[];
  addBtnLabel: string;
  onAddClick: () => void;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface EntityFormConfig<T extends ManagedItem> {
  title: string;
  fields: FormField[];
  defaultValues: Omit<T, 'id'>;
}

export interface SemesterItem extends ManagedItem {
  name: string;
  lastModified: FieldValue | Date;
}

export interface TimetableEvent {
  id: string;
  day: string;
  time: string; 
  title: string;
  location: string;
  color: string;
}

export interface TimetableDay {
  date: string;
  dayName: string;
  events: TimetableEvent[];
}

export interface HistoryLogItem extends ManagedItem {
  date: string;
  time: string;
  author: string;
  action: string;
  timestamp: number; 
  eventId?: string;
  changed?: Record<string, { before: any; after: any }>;
  fullAfter?: any;
  restoredFromLogId?: string;
}