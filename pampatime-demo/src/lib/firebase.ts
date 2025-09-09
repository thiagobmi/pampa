// src/lib/firebase.ts
import { app, database } from '@/firebase/config';

import { ref, update, push, serverTimestamp, get, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Util para diffs simples
const diffObjects = (before: any, after: any) => {
  const changed: Record<string, { before: any; after: any }> = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  keys.forEach(k => {
    if (before?.[k] !== after?.[k]) {
      changed[k] = { before: before?.[k] ?? null, after: after?.[k] ?? null };
    }
  });
  return changed;
};

const currentAuthor = () => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  return user ? (user.displayName || user.email || user.uid) : 'Desconhecido';
};

const pushLog = async (entry: any) => {
  const logRef = ref(database, 'history-logs');
  await push(logRef, {
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR'),
    timestamp: serverTimestamp(),
    author: currentAuthor(),
    ...entry
  });
};


export const createTimetableEvent = async (eventId: string, data: any) => {
  const eventRef = ref(database, `timetables/${eventId}`);
  await set(eventRef, data);
  await pushLog({ action: 'create', eventId, fullAfter: data });
};


export const updateTimetableEvent = async (eventId: string, updatedData: any, action: string = 'update') => {
  const eventRef = ref(database, `timetables/${eventId}`);
  const beforeSnap = await get(eventRef);
  const beforeVal = beforeSnap.exists() ? beforeSnap.val() : {};
  await update(eventRef, updatedData);
  const afterVal = { ...beforeVal, ...updatedData };
  const changed = diffObjects(beforeVal, afterVal);
  await pushLog({ action, eventId, changed, fullAfter: afterVal });
};

export const deleteTimetableEvent = async (eventId: string) => {
  const eventRef = ref(database, `timetables/${eventId}`);
  const beforeSnap = await get(eventRef);
  const beforeVal = beforeSnap.exists() ? beforeSnap.val() : null;
  await remove(eventRef);
  await pushLog({ action: 'delete', eventId, fullAfter: beforeVal });
};




export const restoreTimetableVersion = async (logId: string) => {
  const logRef = ref(database, `history-logs/${logId}`);
  const snapshot = await get(logRef);
  const logData = snapshot.val();
  if (!logData || !logData.eventId || !logData.fullAfter) {
    console.error('Log inválido para restauração');
    return;
  }

  const eventRef = ref(database, `timetables/${logData.eventId}`);
  await set(eventRef, logData.fullAfter);
  await pushLog({ action: 'restore', eventId: logData.eventId, restoredFromLogId: logId, fullAfter: logData.fullAfter });
};

