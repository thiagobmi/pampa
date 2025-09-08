// src/types/Event.ts - Fixed version
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string;
  end?: Date | string;
  room?: string;
  professor?: string;
  semester?: string;
  class?: string;
  type?: string; // Modalidade (Teórica, Prática, Assíncrona)
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  allDay?: boolean; // Make this optional to match your usage
}

export interface EventColors {
  bg: string;
  border: string;
  text: string;
}

// Cores específicas para modalidades
const MODALIDADE_COLORS: { [key: string]: EventColors } = {
  'Teórica': {
    bg: '#dbeafe',     // blue-100
    border: '#3b82f6', // blue-500
    text: '#1e3a8a'    // blue-900
  },
  'Prática': {
    bg: '#dcfce7',     // green-100
    border: '#22c55e', // green-500
    text: '#14532d'    // green-900
  },
  'Assíncrona': {
    bg: '#fef3c7',     // yellow-100
    border: '#eab308', // yellow-500
    text: '#713f12'    // yellow-900
  }
};

// Cores para conflitos
export const CONFLICT_COLORS: EventColors = {
  bg: '#fee2e2',       // red-100
  border: '#dc2626',   // red-600
  text: '#7f1d1d'      // red-900
};

// Cor padrão para modalidades não reconhecidas
const DEFAULT_COLORS: EventColors = {
  bg: '#f3f4f6',       // gray-100
  border: '#9ca3af',   // gray-400
  text: '#374151'      // gray-700
};

// Função principal para obter cores baseadas na modalidade
export const getEventTypeColors = (modalidade: string = ''): EventColors => {
  const normalizedModalidade = modalidade.trim();
  
  if (MODALIDADE_COLORS[normalizedModalidade]) {
    return MODALIDADE_COLORS[normalizedModalidade];
  }
  
  return DEFAULT_COLORS;
};

// Helper function to apply colors to an event (sempre usa cores da modalidade, não do conflito)
export const applyEventColors = (event: Partial<CalendarEvent>): CalendarEvent => {
  const colors = getEventTypeColors(event.type || '');
  
  return {
    ...event,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    textColor: colors.text,
  } as CalendarEvent;
};

// Fixed week dates - first week of 2020 (January 6-10, 2020)
export const FIXED_WEEK_DATES = {
  monday: new Date(2020, 0, 6),
  tuesday: new Date(2020, 0, 7),
  wednesday: new Date(2020, 0, 8),
  thursday: new Date(2020, 0, 9),
  friday: new Date(2020, 0, 10),
  saturday: new Date(2020, 0, 11)
} as const;

// Helper function to get fixed date for a day
export const getFixedDateForDay = (dayName: string): Date => {
  const dayMap: { [key: string]: Date } = {
    'Segunda': FIXED_WEEK_DATES.monday,
    'Terça': FIXED_WEEK_DATES.tuesday,
    'Quarta': FIXED_WEEK_DATES.wednesday,
    'Quinta': FIXED_WEEK_DATES.thursday,
    'Sexta': FIXED_WEEK_DATES.friday,
    'Sábado': FIXED_WEEK_DATES.saturday,
    'Monday': FIXED_WEEK_DATES.monday,
    'Tuesday': FIXED_WEEK_DATES.tuesday,
    'Wednesday': FIXED_WEEK_DATES.wednesday,
    'Thursday': FIXED_WEEK_DATES.thursday,
    'Friday': FIXED_WEEK_DATES.friday,
    'Saturday': FIXED_WEEK_DATES.saturday
  };
  
  return dayMap[dayName] || FIXED_WEEK_DATES.monday;
};

// Helper function to create event with fixed date and auto-generated colors
export const createEventWithFixedDate = (
  title: string,
  dayName: string,
  startTime: string,
  endTime: string,
  options: {
    room?: string;
    professor?: string;
    semester?: string;
    class?: string;
    type?: string; // Modalidade
    id?: string | number;
  } = {}
): CalendarEvent => {
  const baseDate = getFixedDateForDay(dayName);
  
  // Parse start time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startDate = new Date(baseDate);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  // Parse end time
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endDate = new Date(baseDate);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  // Create base event
  const baseEvent: Partial<CalendarEvent> = {
    id: options.id || `event-${Date.now()}-${Math.random()}`,
    title,
    start: startDate,
    end: endDate,
    room: options.room,
    professor: options.professor,
    semester: options.semester,
    class: options.class,
    type: options.type || '', // Modalidade
    allDay: false,
  };
  
  // Apply colors and return complete event
  return applyEventColors(baseEvent);
};

// Helper function to snap times to half-hour slots (7:30 based)
export const snapToHalfHour = (date: Date): Date => {
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