// src/hooks/useSimpleHistory.ts
import { useState, useEffect } from 'react';
import historyService, { HistoryEntry } from '@/services/historyService';

export const useSimpleHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = historyService.subscribeToHistory((newEntries) => {
      setEntries(newEntries);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logEdit = async () => {
    await historyService.logEdit();
  };

  return {
    entries,
    loading,
    logEdit
  };
};