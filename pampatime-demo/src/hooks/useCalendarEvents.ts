import { useState } from 'react';

interface Event {
  title: string;
  start: Date | string;
  allDay: boolean;
  room?: string;
  teacher?: string;
  id: number;
  end?: Date | string;
  backgroundColor?: string;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState([
    { title: 'Cálculo 1', id: 1, room: '101', teacher: 'Prof. Celso', backgroundColor: '#ffcdd2', start: new Date(), allDay: false },
    { title: 'Mat. Discreta', id: 2, room: '102', teacher: 'Prof. Thielo', backgroundColor: '#bbdefb', start: new Date(), allDay: false },
    { title: 'Cálculo 2', id: 3, room: '103', teacher: 'Prof. Amanda', backgroundColor: '#c8e6c9', start: new Date(), allDay: false },
    { title: 'Álgebra Linear', id: 4, room: '104', teacher: 'Prof. Paulo', backgroundColor: '#fff9c4', start: new Date(), allDay: false },
    { title: 'Física 1', id: 5, room: '105', teacher: 'Prof. Thielo', backgroundColor: '#e1bee7', start: new Date(), allDay: false },
    { title: 'Física 2', id: 6, room: '106', teacher: 'Prof. Celso', backgroundColor: '#b2dfdb', start: new Date(), allDay: false },
    { title: 'Química', id: 7, room: '107', teacher: 'Prof. Aline', backgroundColor: '#ffe0b2', start: new Date(), allDay: false },
    { title: 'Biologia', id: 8, room: '108', teacher: 'Prof. Marcelo', backgroundColor: '#d1c4e9', start: new Date(), allDay: false },
    { title: 'História', id: 9, room: '109', teacher: 'Prof. Basso', backgroundColor: '#b3e5fc', start: new Date(), allDay: false },
    { title: 'Geografia', id: 10, room: '110', teacher: 'Prof. Dionatan', backgroundColor: '#f8bbd0', start: new Date(), allDay: false },
  ]);

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([...events]);
  const [showmodal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  
  // Helper function to snap times to the 7:30-based half-hour slots
  const snapToHalfHour = (date: Date): Date => {
    const roundedDate = new Date(date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // If minutes are less than 15, snap to the previous :30
    if (minutes < 15) {
      if (hours === 0) {
        // Special case: very early morning
        roundedDate.setHours(0);
        roundedDate.setMinutes(30, 0, 0);
      } else {
        roundedDate.setHours(hours - 1);
        roundedDate.setMinutes(30, 0, 0);
      }
    } 
    // If minutes are between 15 and 45, snap to the current hour's :30
    else if (minutes >= 15 && minutes < 45) {
      roundedDate.setMinutes(30, 0, 0);
    } 
    // If minutes are 45 or more, snap to the next hour's :30
    else {
      roundedDate.setHours(hours + 1);
      roundedDate.setMinutes(30, 0, 0);
    }
    
    return roundedDate;
  };

  const handleEventReceive = (info: any) => {
    console.log('Received event:', info.event);
  
    const startDate = info.event.start || new Date();
    // Snap the start time to the correct half-hour slot
    const snappedStart = snapToHalfHour(startDate);
    
    // Properly access extendedProps
    const teacher = info.event.teacher || '';
    const room = info.event.room || '';
    const backgroundColor = info.event.backgroundColor || '';
    
    // Get the original ID (important: make sure it's a number)
    const originalId = parseInt(info.event.id);
    
    // Check if event already exists in allEvents to prevent duplicates
    const eventExists = allEvents.some(event => event.id === originalId);
    
    if (!eventExists) {
      const newEvent = {
        id: originalId,
        title: info.event.title,
        start: snappedStart,
        allDay: false,
        teacher,
        room,
        backgroundColor,
        borderColor: backgroundColor
      };
      
      console.log('New event with props:', newEvent);
      
      // Add to calendar events
      setAllEvents(prev => [...prev, newEvent]);
      
      // Remove from available events
      setAvailableEvents(prev => prev.filter(event => event.id !== originalId));
    }
    
    // Remove the temporary event created by FullCalendar during drag
    info.event.remove();
  };

  const handleEventDrop = (info: any) => {
    // Enforce half-hour snapping on drop
    if (info.event.start) {
      const snappedStart = snapToHalfHour(info.event.start);
      info.event.setStart(snappedStart);
    }
    
    if (info.event.end) {
      const snappedEnd = snapToHalfHour(info.event.end);
      info.event.setEnd(snappedEnd);
    }
    
    // Update the event in state to persist the changes
    setAllEvents(prev => {
      return prev.map(event => {
        if (event.id === Number(info.event.id)) {
          return {
            ...event,
            start: info.event.start,
            end: info.event.end
          };
        }
        return event;
      });
    });
  };

  const handleEventResize = (info: any) => {
    // Force snap to correct half-hour slots on resize
    if (info.event.start) {
      const snappedStart = snapToHalfHour(info.event.start);
      info.event.setStart(snappedStart);
    }
    
    if (info.event.end) {
      const snappedEnd = snapToHalfHour(info.event.end);
      info.event.setEnd(snappedEnd);
    }
    
    console.log('Event resized:', info.event.start, info.event.end);
    
    // Update the event in state to persist the changes
    setAllEvents(prev => {
      return prev.map(event => {
        if (event.id === Number(info.event.id)) {
          return {
            ...event,
            start: info.event.start,
            end: info.event.end
          };
        }
        return event;
      });
    });
  };

  const handleEventClick = (info: any) => {
    console.log('Event clicked:', info.event);
    const eventId = Number(info.event.id);
    
    // Find the event in allEvents
    const eventToDelete = allEvents.find(event => event.id === eventId);
    
    if (eventToDelete) {
      // Remove from calendar
      setAllEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Find the original event from 'events' list
      const originalEvent = events.find(event => event.id === eventId);
      
      if (originalEvent) {
        // Check if it's already in availableEvents
        const alreadyAvailable = availableEvents.some(event => event.id === eventId);
        
        if (!alreadyAvailable) {
          // Return it to the available events
          setAvailableEvents(prev => [...prev, originalEvent]);
        }
      }
    }
  };

  return {
    events,
    allEvents,
    availableEvents,
    handleEventReceive,
    handleEventDrop,
    handleEventResize,
    handleEventClick,
    showmodal,
    setShowModal,
    showDeleteModal,
    setShowDeleteModal,
    idToDelete,
    setIdToDelete
  };
}