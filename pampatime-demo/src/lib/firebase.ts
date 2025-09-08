// src/lib/firebase.ts
import { app, database } from '@/firebase/config';
import { ref, update, push, serverTimestamp, get } from 'firebase/database';

export const updateTimetableEvent = async (eventId, updatedData, author, action) => {
  try {
    const eventRef = ref(database, `timetables/${eventId}`);
    await update(eventRef, updatedData);

    const logRef = ref(database, 'history-logs');
    await push(logRef, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      author,
      action,
      timestamp: serverTimestamp(),
      eventId, // Adicionamos o ID do evento para facilitar a restauração
      updatedData, // Adicionamos os dados para ter o histórico completo
    });

    console.log(`Evento ${eventId} atualizado e log criado com sucesso.`);
  } catch (error) {
    console.error("Erro ao atualizar evento e criar log:", error);
    throw error;
  }
};

// --- NOVO: Função para restaurar a versão do calendário ---
export const restoreTimetableVersion = async (logId, author) => {
  try {
    // 1. Busque o log de histórico para obter os dados da versão antiga
    const logRef = ref(database, `history-logs/${logId}`);
    const snapshot = await get(logRef);
    const logData = snapshot.val();

    if (!logData || !logData.eventId || !logData.updatedData) {
      console.error("Dados de log incompletos ou não encontrados.");
      return;
    }

    // 2. Use os dados do log para sobrescrever o evento atual do calendário
    const eventRef = ref(database, `timetables/${logData.eventId}`);
    await update(eventRef, logData.updatedData);

    // 3. Adicione um novo log para registrar a ação de restauração
    const newLogRef = ref(database, 'history-logs');
    await push(newLogRef, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      author,
      action: "Restauração de versão",
      timestamp: serverTimestamp(),
      restoredFromLogId: logId,
    });

    console.log(`Versão restaurada com sucesso a partir do log ${logId}.`);
  } catch (error) {
    console.error("Erro ao restaurar a versão:", error);
    throw error;
  }
};
// --- FIM NOVO ---