// src/pages/Calendar.tsx - Versão atualizada com histórico
import React, { useRef, useCallback } from 'react';
import SidePanel from '@/components/calendar/SidePanel';
import Timetable from '@/components/calendar/Timetable';
import Header from '@/components/Header';
import { CalendarEvent } from '@/types/Event';
import { useRealtimeCalendarEvents } from '@/hooks/useRealtimeCalendarEvents';
import { useSimpleHistory } from '@/hooks/useSimpleHistory';

const Calendar = () => {
  const timetableRef = useRef<any>(null);
  const { logEdit } = useSimpleHistory();
  
  // Centralized event management com callback para sincronização
  const eventManager = useRealtimeCalendarEvents();

  // Handle event click from calendar
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('Calendar: Event clicked', event);
    eventManager.selectEvent(event);
  }, [eventManager]);

  // Handle real-time event changes (drag, resize) with history logging
  const handleEventChange = useCallback(async (updatedEvent: CalendarEvent) => {
    console.log('Calendar: Event changed in real-time', updatedEvent);
    await eventManager.updateEvent(updatedEvent);
    await logEdit(); // Registra a edição no histórico
  }, [eventManager, logEdit]);

  // Handle event add from form with history logging
  const handleEventAdd = useCallback(async (newEvent: CalendarEvent) => {
    console.log('Calendar: Adding new event via form', newEvent);
    await eventManager.addEvent(newEvent);
    await logEdit(); // Registra a edição no histórico
  }, [eventManager, logEdit]);

  // Handle event update from form with history logging
  const handleEventUpdate = useCallback(async (updatedEvent: CalendarEvent) => {
    console.log('Calendar: Updating event via form', updatedEvent);
    await eventManager.updateEvent(updatedEvent);
    await logEdit(); // Registra a edição no histórico
    // Clear selection after update
    eventManager.selectEvent(null);
  }, [eventManager, logEdit]);

  // Handle event delete from form with history logging
  const handleEventDelete = useCallback(async (eventId: string | number) => {
    console.log('Calendar: Deleting event', eventId);
    await eventManager.deleteEvent(eventId);
    await logEdit(); // Registra a edição no histórico
  }, [eventManager, logEdit]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    eventManager.selectEvent(null);
  }, [eventManager]);

  // Handle events list changes from Timetable (quando eventos são arrastados do painel lateral) with history logging
  const handleEventsChange = useCallback(async (newEvents: CalendarEvent[]) => {
    console.log('Calendar: Events list updated from Timetable', newEvents.length);
    
    // Encontrar novos eventos (que não existem no estado atual)
    const currentEventIds = new Set(eventManager.events.map(e => e.id));
    const newEventsToAdd = newEvents.filter(event => !currentEventIds.has(event.id));
    
    // Adicionar apenas os novos eventos
    if (newEventsToAdd.length > 0) {
      for (const newEvent of newEventsToAdd) {
        console.log('Calendar: Adding new event from drag & drop', newEvent);
        await eventManager.addEvent(newEvent);
      }
      await logEdit(); // Registra a edição no histórico
    }
  }, [eventManager, logEdit]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header />
      <main className="flex-1 p-2 md:p-4 min-h-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-2 md:gap-4 h-full">
          {/* Side Panel */}
          <div className="w-full lg:w-80 xl:w-96 2xl:w-[430px] flex-shrink-0 h-[50vh] lg:h-full overflow-hidden">
            <SidePanel 
              selectedEvent={eventManager.selectedEvent}
              onEventUpdate={handleEventUpdate}
              onEventAdd={handleEventAdd}
              onEventDelete={handleEventDelete}
              onClearSelection={handleClearSelection}
            />
          </div>
          
          {/* Timetable */}
          <div className="flex-1 min-w-0 h-[50vh] lg:h-full">
            <Timetable 
              ref={timetableRef}
              events={eventManager.events}
              conflicts={eventManager.conflicts}
              onEventClick={handleEventClick}
              onEventChange={handleEventChange}
              onEventsChange={handleEventsChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;