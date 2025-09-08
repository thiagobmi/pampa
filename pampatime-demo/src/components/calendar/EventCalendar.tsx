// src/components/EventCalendar.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { calendarConfig } from '@/config/calendarConfig';
import { createEventContent } from '@/utils/calendarUtils';

interface Event {
    title: string;
    room?: string;
    professor?: string;
    start: Date | string;
    allDay: boolean;
    id: number;
    end?: Date | string;
    backgroundColor?: string;
    borderColor?: string;
    semester?: string;
    class?: string;
    type?: string;
}

interface EventCalendarProps {
    events: Event[];
    onEventReceive?: (info: any) => void;
    onEventDrop?: (info: any) => void;
    onEventResize?: (info: any) => void;
    onEventClick?: (info: any) => void;
}

const renderDayHeaderContent = (arg: any) => {
    const englishAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const ptDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    const dayIndex = arg.date.getDay();
    
    return {
      html: `
        <div class="fc-day-header-custom">
          <div class="fc-day-abbr">${englishAbbr[dayIndex]}</div>
          <div class="fc-day-name">${ptDays[dayIndex]}</div>
        </div>
      `
    };
};

export const EventCalendar: React.FC<EventCalendarProps> = ({
    events,
    onEventReceive,
    onEventDrop,
    onEventResize,
    onEventClick
}) => {
    // Helper function to snap times to the 7:30-based half-hour slots
    const snapToHalfHour = (date: Date): Date => {
        const roundedDate = new Date(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        if (minutes < 15) {
            if (hours === 0) {
                roundedDate.setHours(0);
                roundedDate.setMinutes(30, 0, 0);
            } else {
                roundedDate.setHours(hours - 1);
                roundedDate.setMinutes(30, 0, 0);
            }
        } 
        else if (minutes >= 15 && minutes < 45) {
            roundedDate.setMinutes(30, 0, 0);
        } 
        else {
            roundedDate.setHours(hours + 1);
            roundedDate.setMinutes(30, 0, 0);
        }
        
        return roundedDate;
    };

    // Transform events to ensure properties are preserved in extendedProps
    const transformedEvents = events.map(event => {
        console.log('Original event:', event);
        
        const transformedEvent = {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.backgroundColor,
            borderColor: event.borderColor,
            allDay: event.allDay || false,
            // FullCalendar preserves custom properties in extendedProps
            extendedProps: {
                professor: event.professor,
                room: event.room,
                semester: event.semester,
                class: event.class,
                type: event.type
            }
        };
        
        console.log('Transformed for FullCalendar:', transformedEvent);
        return transformedEvent;
    });

    return (
        <FullCalendar
            {...calendarConfig}
            plugins={[interactionPlugin, timeGridPlugin, listPlugin, dayGridPlugin]}
            locale={ptBrLocale}
            events={transformedEvents}
            slotEventOverlap={false}
            eventContent={createEventContent}
            eventReceive={onEventReceive}
            eventDrop={onEventDrop}
            eventResize={onEventResize}
            eventClick={onEventClick}
            height="100%"
            dayHeaderContent={renderDayHeaderContent}
            
            eventResizeStart={(info) => {
                if (info.event.start) {
                    const snappedStart = snapToHalfHour(info.event.start);
                    info.event.setStart(snappedStart);
                }
            }}
            eventResizeStop={(info) => {
                if (info.event.end) {
                    const snappedEnd = snapToHalfHour(info.event.end);
                    info.event.setEnd(snappedEnd);
                }
                
                if (info.event.start) {
                    const snappedStart = snapToHalfHour(info.event.start);
                    info.event.setStart(snappedStart);
                }
            }}
            eventConstraint={{
                startTime: "07:30",
                endTime: "22:30",
            }}
        />
    );
};