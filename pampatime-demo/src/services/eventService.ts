// src/services/eventService.ts
import { CalendarEvent, applyEventColors, createEventWithFixedDate } from '@/types/Event';

export interface CreateEventData {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  professor?: string;
  semester?: string;
  class?: string;
  type?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class EventService {
  /**
   * Creates a new event with proper validation and color application
   */
  static createEvent(data: CreateEventData): CalendarEvent {
    const validation = this.validateEventData(data);
    
    if (!validation.isValid) {
      throw new Error(`Invalid event data: ${validation.errors.join(', ')}`);
    }

    return createEventWithFixedDate(
      data.title,
      data.day,
      data.startTime,
      data.endTime,
      {
        room: data.room,
        professor: data.professor,
        semester: data.semester,
        class: data.class,
        type: data.type,
        id: `event-${Date.now()}-${Math.random()}`
      }
    );
  }

  /**
   * Updates an existing event with validation
   */
  static updateEvent(existingEvent: CalendarEvent, updates: Partial<CalendarEvent>): CalendarEvent {
    const updatedEvent = { ...existingEvent, ...updates };
    
    // Re-apply colors if type changed
    if (updates.type && updates.type !== existingEvent.type) {
      return applyEventColors(updatedEvent);
    }
    
    return updatedEvent;
  }

  /**
   * Validates and prepares an event (applies colors, validates fields)
   */
  static validateAndPrepareEvent(event: CalendarEvent): CalendarEvent {
    const validation = this.validateEvent(event);
    
    if (!validation.isValid) {
      console.warn('Event validation warnings:', validation.errors);
      // Don't throw error for warnings, just log them
    }

    return applyEventColors(event);
  }

  /**
   * Validates event data for creation
   */
  static validateEventData(data: CreateEventData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (!data.day?.trim()) {
      errors.push('Day is required');
    }

    if (!data.startTime?.trim()) {
      errors.push('Start time is required');
    }

    if (!data.endTime?.trim()) {
      errors.push('End time is required');
    }

    // Time validation
    if (data.startTime && data.endTime) {
      const startMinutes = this.timeToMinutes(data.startTime);
      const endMinutes = this.timeToMinutes(data.endTime);
      
      if (endMinutes <= startMinutes) {
        errors.push('End time must be after start time');
      }

      // Business hours validation (7:30 - 22:30)
      if (startMinutes < this.timeToMinutes('07:30')) {
        errors.push('Start time cannot be before 07:30');
      }
      
      if (endMinutes > this.timeToMinutes('22:30')) {
        errors.push('End time cannot be after 22:30');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates an existing event
   */
  static validateEvent(event: CalendarEvent): ValidationResult {
    const errors: string[] = [];

    if (!event.title?.trim()) {
      errors.push('Event title is empty');
    }

    if (!event.start) {
      errors.push('Event start time is missing');
    }

    if (!event.end) {
      errors.push('Event end time is missing');
    }

    if (event.start && event.end) {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      if (endDate <= startDate) {
        errors.push('Event end time must be after start time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Converts time string (HH:MM) to minutes since midnight
   */
  private static timeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converts minutes since midnight back to time string (HH:MM)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Gets all available time slots for end time based on start time
   */
  static getAvailableEndTimes(startTime: string): string[] {
    if (!startTime) return [];

    const startMinutes = this.timeToMinutes(startTime);
    const allTimes: string[] = [];

    // Generate half-hour time slots from 7:30 to 22:30
    for (let minutes = 7 * 60 + 30; minutes <= 22 * 60 + 30; minutes += 60) {
      allTimes.push(this.minutesToTime(minutes));
    }

    // Filter times that are after start time
    return allTimes.filter(time => this.timeToMinutes(time) > startMinutes);
  }

  /**
   * Checks if an event overlaps with any events in a list
   */
  static hasTimeOverlap(event: CalendarEvent, events: CalendarEvent[]): boolean {
    if (!event.start || !event.end) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    return events.some(otherEvent => {
      if (otherEvent.id === event.id) return false; // Skip self
      if (!otherEvent.start || !otherEvent.end) return false;

      const otherStart = new Date(otherEvent.start);
      const otherEnd = new Date(otherEvent.end);

      // Same day check
      const sameDay = eventStart.toDateString() === otherStart.toDateString();
      
      // Time overlap check
      const timeOverlap = sameDay && (eventStart < otherEnd) && (otherStart < eventEnd);
      
      return timeOverlap;
    });
  }

  /**
   * Formats event for display
   */
  static formatEvent(event: CalendarEvent): {
    displayTitle: string;
    displayTime: string;
    displayDetails: string;
  } {
    const start = event.start ? new Date(event.start) : null;
    const end = event.end ? new Date(event.end) : null;
    
    const displayTime = start && end 
      ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`
      : '';

    const details = [
      event.professor && `Prof: ${event.professor}`,
      event.room && `Sala: ${event.room}`,
      event.semester && `Sem: ${event.semester}`,
      event.class && `Turma: ${event.class}`
    ].filter(Boolean).join(' • ');

    return {
      displayTitle: event.title || 'Untitled Event',
      displayTime,
      displayDetails: details
    };
  }
}