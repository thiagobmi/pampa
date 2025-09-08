// src/config/calendarConfig.ts
import { CalendarOptions } from '@fullcalendar/core';

export const calendarConfig: CalendarOptions = {
  initialView: "timeGridWeek",
  initialDate: new Date(2020, 0, 6), // January 6, 2020 (Monday of first week)
  headerToolbar: false,
  dayHeaderFormat: { weekday: 'long' },
  hiddenDays: [0], // Hide only Sunday (0), show Saturday (6)
  editable: true,
  selectable: false,
  selectMirror: true,
  droppable: true,
  slotMinTime: "07:30:00",
  slotMaxTime: "22:30:00",
  allDaySlot: false,
  displayEventTime: true,
  displayEventEnd: true,
  
  // Navigation disabled to keep fixed week
  navLinks: false,
  
  // Button text customization
  buttonText: {
    dayGridWeek: 'Agenda Semanal'
  },

  titleFormat: () => 'Pampatime :P',
  
  // Update snap duration to 1 hour to match the 7:30, 8:30 pattern
  snapDuration: "01:00:00", 
  slotDuration: "01:00:00", 
  slotLabelInterval: "01:00:00",
  
  // Make default event duration match slot duration
  defaultTimedEventDuration: "01:00:00",
  forceEventDuration: true,
  
  // Additional constraints for time snapping
  eventDurationEditable: true,
  nowIndicator: false, // Disable now indicator since we're using fixed dates
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false
  },
  eventStartEditable: true,

  // Add event constraints
  eventConstraint: {
    startTime: "07:30",
    endTime: "22:30",
  },
  
  // Add drag scroll capability
  dragScroll: true,

  eventAllow: function(dropInfo, draggedEvent) { 
    // Allow Monday to Saturday (1-6)
    const day = dropInfo.start.getDay();
    return day >= 1 && day <= 6;
  },

  // Prevent navigation away from the fixed week
  datesSet: function(dateInfo) {
    // Always keep the calendar on the first week of 2020
    const targetDate = new Date(2020, 0, 6); // January 6, 2020
    if (dateInfo.start.getTime() !== targetDate.getTime()) {
      // Force calendar back to fixed week if user tries to navigate
      setTimeout(() => {
        if (dateInfo.view.calendar) {
          dateInfo.view.calendar.gotoDate(targetDate);
        }
      }, 0);
    }
  },

  // Disable all navigation
  customButtons: {},
};