import { useState, useEffect } from 'react';
import { rtdb } from '@/firebase/config';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { ManagedItem } from '@/types/management';

// Opções opcionais para compatibilidade com chamadas existentes
type RealtimeOptions = {
  listenLive?: boolean;
};

const useRealtimeCollection = <T>(path: string, _options?: RealtimeOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const dbRef = ref(rtdb, path);

    const listener = onValue(dbRef, (snapshot: DataSnapshot) => {
      const value = snapshot.val();
      if (value) {
        const items: T[] = Object.keys(value).map(key => ({
          id: key,
          ...value[key]
        })) as T[];
        setData(items);
      } else {
        setData([]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Erro ao escutar Realtime Database:", err);
      setError("Erro ao carregar dados.");
      setLoading(false);
    });

    return () => {
      off(dbRef, 'value', listener);
    };
  }, [path]);

  return { data, loading, error };
};

export default useRealtimeCollection;