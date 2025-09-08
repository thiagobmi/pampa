import { useState } from 'react';
import { rtdb } from '@/firebase/config';
import { ref, push, set, update, remove, serverTimestamp } from 'firebase/database'; 
import { ManagedItem } from '@/types/management';

const useRealtimeOperations = <T extends ManagedItem>(path: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const addDocument = async (data: Omit<T, 'id'>): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const dataToSave = path === 'semestres'
        ? { ...data, lastModified: serverTimestamp() }
        : data;

      const newRef = push(ref(rtdb, path));
      await set(newRef, dataToSave);
      setSuccess(true);
      return newRef.key;
    } catch (e: any) {
      setError(e.message);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, data: Partial<Omit<T, 'id'>>): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const dataToUpdate = path === 'semestres'
        ? { ...data, lastModified: serverTimestamp() }
        : data;

      const itemRef = ref(rtdb, `${path}/${id}`);
      await update(itemRef, dataToUpdate);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const itemRef = ref(rtdb, `${path}/${id}`);
      await remove(itemRef);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const bulkAddDocuments = async (items: Omit<T, 'id'>[]): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const dbRef = ref(rtdb, path);
      const promises = items.map(item => {
        const itemWithTimestamp = path === 'semestres'
          ? { ...item, lastModified: serverTimestamp() }
          : item;
        const newRef = push(dbRef);
        return set(newRef, itemWithTimestamp);
      });
      await Promise.all(promises);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { addDocument, updateDocument, deleteDocument, bulkAddDocuments, loading, error, success };
};

export default useRealtimeOperations;