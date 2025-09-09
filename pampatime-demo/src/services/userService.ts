import { rtdb } from '@/firebase/config';
import { ref, get, set, update } from 'firebase/database';
import { AppUser, UserRole } from '@/types/auth';

const USERS_PATH = 'users';

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await get(ref(rtdb, `${USERS_PATH}/${uid}`));
  return snap.exists() ? (snap.val() as AppUser) : null;
}

export async function listUsers(): Promise<AppUser[]> {
  const snap = await get(ref(rtdb, USERS_PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val).map(k => val[k]);
}

export async function createUserRecord(user: AppUser) {
  const now = Date.now();
  await set(ref(rtdb, `${USERS_PATH}/${user.uid}`), { ...user, active: user.active ?? true, createdAt: now, updatedAt: now });
}

export async function updateUserRole(uid: string, role: UserRole) {
  await update(ref(rtdb, `${USERS_PATH}/${uid}`), { role, updatedAt: Date.now() });
}

export async function setUserActive(uid: string, active: boolean) {
  await update(ref(rtdb, `${USERS_PATH}/${uid}`), { active, updatedAt: Date.now() });
}
