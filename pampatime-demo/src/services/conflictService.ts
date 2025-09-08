// src/services/conflictService.ts
import { CalendarEvent } from '@/types/Event';

export interface ConflictInfo {
  eventId: string | number;
  conflictType: 'sala' | 'professor' | 'semestre';
  conflictValue: string;
  conflictWith: string | number;
}

export interface ConflictData {
  conflictIds: Set<string | number>;
  conflictDetails: Map<string | number, ConflictInfo[]>;
}

export interface ConflictSummary {
  sala: string[];
  professor: string[];
  semestre: string[];
  total: number;
}

export class ConflictService {
  /**
   * Detects all conflicts in a list of events
   */
  static detectConflicts(events: CalendarEvent[]): ConflictData {
    const conflictIds = new Set<string | number>();
    const conflictDetails = new Map<string | number, ConflictInfo[]>();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];
        
        const conflicts = this.checkEventConflicts(event1, event2);
        
        if (conflicts.length > 0) {
          // Add to conflict sets
          if (event1.id) conflictIds.add(event1.id);
          if (event2.id) conflictIds.add(event2.id);
          
          // Store conflict details
          conflicts.forEach(conflict => {
            const existing = conflictDetails.get(conflict.eventId) || [];
            existing.push(conflict);
            conflictDetails.set(conflict.eventId, existing);
          });
        }
      }
    }

    return { conflictIds, conflictDetails };
  }

  /**
   * Checks for conflicts between two specific events
   */
  static checkEventConflicts(event1: CalendarEvent, event2: CalendarEvent): ConflictInfo[] {
    if (!this.hasTimeOverlap(event1, event2) || !event1.id || !event2.id) {
      return [];
    }

    const conflicts: ConflictInfo[] = [];

    // Room conflict
    if (event1.room && event2.room && event1.room === event2.room) {
      conflicts.push(
        {
          eventId: event1.id,
          conflictType: 'sala',
          conflictValue: event1.room,
          conflictWith: event2.id
        },
        {
          eventId: event2.id,
          conflictType: 'sala',
          conflictValue: event2.room,
          conflictWith: event1.id
        }
      );
    }

    // Professor conflict
    if (event1.professor && event2.professor && event1.professor === event2.professor) {
      conflicts.push(
        {
          eventId: event1.id,
          conflictType: 'professor',
          conflictValue: event1.professor,
          conflictWith: event2.id
        },
        {
          eventId: event2.id,
          conflictType: 'professor',
          conflictValue: event2.professor,
          conflictWith: event1.id
        }
      );
    }

    // Semester conflict (different subjects in same semester at same time)
    if (event1.semester && event2.semester && 
        event1.semester.trim() === event2.semester.trim() && 
        event1.title !== event2.title) {
      conflicts.push(
        {
          eventId: event1.id,
          conflictType: 'semestre',
          conflictValue: event1.semester,
          conflictWith: event2.id
        },
        {
          eventId: event2.id,
          conflictType: 'semestre',
          conflictValue: event2.semester,
          conflictWith: event1.id
        }
      );
    }

    return conflicts;
  }

  /**
   * Checks if two events have time overlap
   */
  private static hasTimeOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    if (!event1.start || !event2.start || !event1.end || !event2.end) {
      return false;
    }

    const start1 = new Date(event1.start);
    const end1 = new Date(event1.end);
    const start2 = new Date(event2.start);
    const end2 = new Date(event2.end);

    // Same day check
    const sameDay = start1.toDateString() === start2.toDateString();
    
    // Time overlap: (start1 < end2) && (start2 < end1)
    const hasOverlap = sameDay && (start1 < end2) && (start2 < end1);

    return hasOverlap;
  }

  /**
   * Creates a summary of conflicts by type
   */
  static createConflictSummary(conflictData: ConflictData): ConflictSummary {
    const summary = { 
      sala: new Set<string>(), 
      professor: new Set<string>(), 
      semestre: new Set<string>() 
    };

    conflictData.conflictDetails.forEach((conflicts) => {
      conflicts.forEach((conflict) => {
        summary[conflict.conflictType].add(conflict.conflictValue);
      });
    });

    return {
      sala: Array.from(summary.sala),
      professor: Array.from(summary.professor),
      semestre: Array.from(summary.semestre),
      total: conflictData.conflictIds.size
    };
  }

  /**
   * Generates human-readable conflict descriptions
   */
  static getConflictDescription(conflictInfo: ConflictInfo[]): string {
    if (!conflictInfo || conflictInfo.length === 0) return '';

    const conflictsByType = conflictInfo.reduce((acc, conflict) => {
      if (!acc[conflict.conflictType]) {
        acc[conflict.conflictType] = new Set();
      }
      acc[conflict.conflictType].add(conflict.conflictValue);
      return acc;
    }, {} as Record<string, Set<string>>);

    const descriptions = [];

    if (conflictsByType.sala) {
      const salas = Array.from(conflictsByType.sala);
      descriptions.push(`Sala ${salas.join(', ')} ocupada`);
    }

    if (conflictsByType.professor) {
      const professores = Array.from(conflictsByType.professor);
      descriptions.push(`Prof. ${professores.join(', ')} em conflito`);
    }

    if (conflictsByType.semestre) {
      const semestres = Array.from(conflictsByType.semestre);
      descriptions.push(`Semestre ${semestres.join(', ')} sobreposto`);
    }

    return descriptions.join(' • ');
  }

  /**
   * Gets all conflicts for a specific event
   */
  static getEventConflicts(eventId: string | number, conflictData: ConflictData): ConflictInfo[] {
    return conflictData.conflictDetails.get(eventId) || [];
  }

  /**
   * Checks if an event has any conflicts
   */
  static hasConflicts(eventId: string | number, conflictData: ConflictData): boolean {
    return conflictData.conflictIds.has(eventId);
  }

  /**
   * Gets conflicting events for a specific event
   */
  static getConflictingEvents(eventId: string | number, events: CalendarEvent[], conflictData: ConflictData): CalendarEvent[] {
    const conflicts = this.getEventConflicts(eventId, conflictData);
    const conflictingIds = new Set(conflicts.map(c => c.conflictWith));
    
    return events.filter(event => event.id && conflictingIds.has(event.id));
  }

  /**
   * Suggests resolution for conflicts
   */
  static suggestResolution(conflictInfo: ConflictInfo[]): string[] {
    const suggestions: string[] = [];

    const hasRoomConflict = conflictInfo.some(c => c.conflictType === 'sala');
    const hasProfessorConflict = conflictInfo.some(c => c.conflictType === 'professor');
    const hasSemesterConflict = conflictInfo.some(c => c.conflictType === 'semestre');

    if (hasRoomConflict) {
      suggestions.push('• Alterar a sala de uma das aulas');
      suggestions.push('• Verificar disponibilidade de outras salas no mesmo horário');
    }

    if (hasProfessorConflict) {
      suggestions.push('• Alterar o horário de uma das aulas do professor');
      suggestions.push('• Verificar se outro professor pode assumir uma das aulas');
    }

    if (hasSemesterConflict) {
      suggestions.push('• Alterar o horário de uma das disciplinas');
      suggestions.push('• Verificar se as disciplinas podem ser oferecidas em semestres diferentes');
    }

    return suggestions;
  }
}