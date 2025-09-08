import { useCallback, useEffect, useMemo, useState } from 'react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { rtdb } from '@/firebase/config';
import { CalendarEvent } from '@/types/Event';
import { EventService } from '@/services/eventService';
import { ConflictService } from '@/services/conflictService';

export interface UseRealtimeCalendarReturn {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  addEvent: (event: CalendarEvent) => Promise<string | null>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string | number) => Promise<void>;
  selectEvent: (event: CalendarEvent | null) => void;
  conflicts: ReturnType<typeof ConflictService.detectConflicts>;
  eventCount: number;
  loading: boolean;
  error: string | null;
}

// Path onde os eventos do calendário serão persistidos
const CALENDAR_PATH = 'calendar-events';

// Converte um CalendarEvent para um objeto serializável (datas como ISO strings)
const serializeEvent = (event: CalendarEvent) => {
  return {
    id: event.id,
    title: event.title,
    start: event.start ? new Date(event.start).toISOString() : null,
    end: event.end ? new Date(event.end).toISOString() : null,
    room: event.room || '',
    professor: event.professor || '',
    semester: event.semester || '',
    class: event.class || '',
    type: event.type || '',
    backgroundColor: event.backgroundColor || '',
    borderColor: event.borderColor || '',
    textColor: (event as any).textColor || '',
    allDay: !!event.allDay,
  };
};

// Converte o objeto serializado de volta para CalendarEvent (mantém datas como string ISO para compatibilidade com FullCalendar)
const deserializeEvent = (data: any): CalendarEvent => {
  return {
    id: data.id,
    title: data.title,
    start: data.start,
    end: data.end,
    room: data.room || '',
    professor: data.professor || '',
    semester: data.semester || '',
    class: data.class || '',
    type: data.type || '',
    backgroundColor: data.backgroundColor || undefined,
    borderColor: data.borderColor || undefined,
    textColor: data.textColor || undefined,
    allDay: !!data.allDay,
  };
};

export const useRealtimeCalendarEvents = (): UseRealtimeCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leitura em tempo real
  useEffect(() => {
    setLoading(true);
    setError(null);
    const dbRef = ref(rtdb, CALENDAR_PATH);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const list: CalendarEvent[] = Object.keys(value).map((key) => {
          const item = value[key];
          const withId = { ...item, id: key };
          return EventService.validateAndPrepareEvent(deserializeEvent(withId));
        });
        setEvents(list);
      } else {
        setEvents([]);
      }
      setLoading(false);
    }, (e) => {
      console.error('Erro ao carregar eventos:', e);
      setError('Erro ao carregar eventos.');
      setLoading(false);
    });

    return () => {
      off(dbRef, 'value', unsubscribe);
    };
  }, []);

  const addEvent = useCallback(async (event: CalendarEvent) => {
    try {
      const prepared = EventService.validateAndPrepareEvent(event);
      const newRef = push(ref(rtdb, CALENDAR_PATH));
      const id = newRef.key as string;
      const toSave = serializeEvent({ ...prepared, id });
      await set(newRef, toSave);
      return id;
    } catch (e: any) {
      console.error('Erro ao adicionar evento:', e);
      setError(e?.message || 'Erro ao adicionar evento');
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (event: CalendarEvent) => {
    try {
      if (!event.id) throw new Error('Evento sem ID');
      const prepared = EventService.validateAndPrepareEvent(event);
      const itemRef = ref(rtdb, `${CALENDAR_PATH}/${event.id}`);
      await update(itemRef, serializeEvent(prepared));
      // Atualiza seleção se necessário
      if (selectedEvent && selectedEvent.id === event.id) setSelectedEvent(prepared);
    } catch (e: any) {
      console.error('Erro ao atualizar evento:', e);
      setError(e?.message || 'Erro ao atualizar evento');
    }
  }, [selectedEvent]);

  const deleteEvent = useCallback(async (eventId: string | number) => {
    try {
      const itemRef = ref(rtdb, `${CALENDAR_PATH}/${eventId}`);
      await remove(itemRef);
      if (selectedEvent && selectedEvent.id === eventId) setSelectedEvent(null);
    } catch (e: any) {
      console.error('Erro ao remover evento:', e);
      setError(e?.message || 'Erro ao remover evento');
    }
  }, [selectedEvent]);

  const selectEvent = useCallback((event: CalendarEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const conflicts = useMemo(() => ConflictService.detectConflicts(events), [events]);

  return {
    events,
    selectedEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    conflicts,
    eventCount: events.length,
    loading,
    error,
  };
};
