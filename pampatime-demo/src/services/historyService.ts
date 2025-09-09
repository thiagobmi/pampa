// src/services/historyService.ts
import { ref, push, onValue, off } from 'firebase/database';
import { rtdb } from '@/firebase/config';
import { getAuth } from 'firebase/auth';

export interface HistoryEntry {
  id: string;
  user: string;
  timestamp: number;
  dateTime: string;
}

class HistoryService {
  private static instance: HistoryService;
  private historyPath = 'edit-history';

  static getInstance(): HistoryService {
    if (!this.instance) {
      this.instance = new HistoryService();
    }
    return this.instance;
  }

  // Registra uma nova edição
  async logEdit(): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('Usuário não autenticado, não foi possível registrar edição');
      return;
    }

    const now = new Date();
    const entry = {
      user: user.displayName || user.email || 'Usuário desconhecido',
      timestamp: now.getTime(),
      dateTime: now.toLocaleString('pt-BR')
    };

    try {
      const historyRef = ref(rtdb, this.historyPath);
      await push(historyRef, entry);
    } catch (error) {
      console.error('Erro ao registrar edição no histórico:', error);
    }
  }

  // Escuta mudanças no histórico em tempo real
  subscribeToHistory(callback: (entries: HistoryEntry[]) => void): () => void {
    const historyRef = ref(rtdb, this.historyPath);
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries: HistoryEntry[] = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Mais recente primeiro
        
        callback(entries);
      } else {
        callback([]);
      }
    });

    return () => off(historyRef, 'value', unsubscribe);
  }
}

export default HistoryService.getInstance();