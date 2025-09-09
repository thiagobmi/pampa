// Definição de papéis suportados (apenas dois conforme requisitos)
export type UserRole = 'admin' | 'coordenador';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  active: boolean; // se false usuário não pode acessar
  createdAt?: number;
  updatedAt?: number;
}
