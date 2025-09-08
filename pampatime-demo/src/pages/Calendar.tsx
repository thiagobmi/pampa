// src/pages/Calendar.tsx - Versão corrigida com sincronização funcional
import React, { useRef, useCallback } from 'react';
import SidePanel from '@/components/calendar/SidePanel';
import Timetable from '@/components/calendar/Timetable';
import Header from '@/components/Header';
// import { useEvents } from '@/hooks/useEvents';
import { CalendarEvent } from '@/types/Event';
import { useRealtimeCalendarEvents } from '@/hooks/useRealtimeCalendarEvents';

const Index = () => {
  const timetableRef = useRef<any>(null);
  
  // Centralized event management com callback para sincronização
  // Persistência em tempo real (Firebase RTDB)
  const eventManager = useRealtimeCalendarEvents();

  // Handle event click from calendar
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('Index: Event clicked', event);
    eventManager.selectEvent(event);
  }, [eventManager]);

  // Handle real-time event changes (drag, resize)
  const handleEventChange = useCallback((updatedEvent: CalendarEvent) => {
    console.log('Index: Event changed in real-time', updatedEvent);
    eventManager.updateEvent(updatedEvent);
  }, [eventManager]);

  // Handle event add from form
  const handleEventAdd = useCallback((newEvent: CalendarEvent) => {
    console.log('Index: Adding new event via form', newEvent);
    eventManager.addEvent(newEvent);
  }, [eventManager]);

  // Handle event update from form
  const handleEventUpdate = useCallback((updatedEvent: CalendarEvent) => {
    console.log('Index: Updating event via form', updatedEvent);
    eventManager.updateEvent(updatedEvent);
    // Clear selection after update
    eventManager.selectEvent(null);
  }, [eventManager]);

  // Handle event delete from form
  const handleEventDelete = useCallback((eventId: string | number) => {
    console.log('Index: Deleting event', eventId);
    eventManager.deleteEvent(eventId);
  }, [eventManager]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    eventManager.selectEvent(null);
  }, [eventManager]);

  // Handle events list changes from Timetable (quando eventos são arrastados do painel lateral)
  const handleEventsChange = useCallback((newEvents: CalendarEvent[]) => {
    console.log('Index: Events list updated from Timetable', newEvents.length);
    
    // Encontrar novos eventos (que não existem no estado atual)
    const currentEventIds = new Set(eventManager.events.map(e => e.id));
    const newEventsToAdd = newEvents.filter(event => !currentEventIds.has(event.id));
    
    // Adicionar apenas os novos eventos
    newEventsToAdd.forEach(newEvent => {
      console.log('Index: Adding new event from drag & drop', newEvent);
      eventManager.addEvent(newEvent);
    });
  }, [eventManager]);

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

export default Index;