// src/hooks/useEvents.ts
import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent } from '@/types/Event';
import { EventService } from '@/services/eventService';
import { ConflictService } from '@/services/conflictService';

export interface UseEventsReturn {
  // State
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  
  // Actions
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string | number) => void;
  selectEvent: (event: CalendarEvent | null) => void;
  
  // Computed values
  conflicts: ReturnType<typeof ConflictService.detectConflicts>;
  eventCount: number;
}

export const useEvents = (onEventsChange?: (events: CalendarEvent[]) => void): UseEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Memoized conflict detection
  const conflicts = useMemo(() => {
    return ConflictService.detectConflicts(events);
  }, [events]);

  const addEvent = useCallback((event: CalendarEvent) => {
    const validatedEvent = EventService.validateAndPrepareEvent(event);
    
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, validatedEvent];
      onEventsChange?.(newEvents);
      return newEvents;
    });
  }, [onEventsChange]);

  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    const validatedEvent = EventService.validateAndPrepareEvent(updatedEvent);
    
    setEvents(prevEvents => {
      const newEvents = prevEvents.map(event => 
        event.id === updatedEvent.id ? validatedEvent : event
      );
      onEventsChange?.(newEvents);
      return newEvents;
    });

    // Update selected event if it's the same one
    if (selectedEvent && selectedEvent.id === updatedEvent.id) {
      setSelectedEvent(validatedEvent);
    }
  }, [selectedEvent, onEventsChange]);

  const deleteEvent = useCallback((eventId: string | number) => {
    setEvents(prevEvents => {
      const newEvents = prevEvents.filter(event => event.id !== eventId);
      onEventsChange?.(newEvents);
      return newEvents;
    });

    // Clear selection if deleted event was selected
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(null);
    }
  }, [selectedEvent, onEventsChange]);

  const selectEvent = useCallback((event: CalendarEvent | null) => {
    setSelectedEvent(event);
  }, []);

  return {
    // State
    events,
    selectedEvent,
    
    // Actions
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    
    // Computed values
    conflicts,
    eventCount: events.length
  };
};