// src/hooks/useEventFilters.ts
import { useState, useMemo, useCallback } from 'react';
import { CalendarEvent } from '@/types/Event';

export type FilterType = 'professor' | 'turma' | 'sala';

export interface FilterState {
  professor: string;
  turma: string;
  sala: string;
}

export interface UseEventFiltersReturn {
  // Filter state
  filters: FilterState;
  searchTerm: string;
  activeFilterType: FilterType;
  
  // Filtered results
  filteredEvents: CalendarEvent[];
  hasActiveFilters: boolean;
  
  // Filter options
  filterOptions: Record<FilterType, string[]>;
  
  // Actions
  setFilter: (filterType: FilterType, value: string) => void;
  setSearchTerm: (term: string) => void;
  setActiveFilterType: (type: FilterType) => void;
  clearAllFilters: () => void;
  clearFilter: (filterType: FilterType) => void;
  
  // Navigation for filter values
  navigatePrevious: () => void;
  navigateNext: () => void;
  getCurrentFilterInfo: () => {
    value: string;
    index: number;
    total: number;
    displayText: string;
  };
}

export const useEventFilters = (events: CalendarEvent[]): UseEventFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>({
    professor: '',
    turma: '',
    sala: ''
  });
  const [searchTerm, setSearchTermState] = useState('');
  const [activeFilterType, setActiveFilterType] = useState<FilterType>('professor');

  // Memoized filter options
  const filterOptions = useMemo(() => {
    const profs = Array.from(new Set(events.map(e => e.professor).filter(Boolean))) as string[];
    const turmas = Array.from(new Set(events.map(e => e.class).filter(Boolean))) as string[];
    const salas = Array.from(new Set(events.map(e => e.room).filter(Boolean))) as string[];

    return {
      professor: profs.sort(),
      turma: turmas.sort(),
      sala: salas.sort(),
    };
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.professor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.class?.toLowerCase().includes(searchTerm.toLowerCase());

      // Individual filters
      const matchesProfessor = !filters.professor || event.professor === filters.professor;
      const matchesSala = !filters.sala || event.room === filters.sala;
      const matchesTurma = !filters.turma || event.class === filters.turma;

      return matchesSearch && matchesProfessor && matchesSala && matchesTurma;
    });
  }, [events, searchTerm, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '') || searchTerm !== '';
  }, [filters, searchTerm]);

  // Current filter navigation info
  const getCurrentFilterInfo = useCallback(() => {
    const currentOptions = filterOptions[activeFilterType];
    const currentValue = filters[activeFilterType];
    const currentIndex = currentOptions.indexOf(currentValue);
    
    const displayText = currentValue === '' 
      ? `Selecione ${activeFilterType}` 
      : `${currentValue} (${currentIndex + 1}/${currentOptions.length})`;

    return {
      value: currentValue,
      index: currentIndex,
      total: currentOptions.length,
      displayText
    };
  }, [activeFilterType, filters, filterOptions]);

  // Actions
  const setFilter = useCallback((filterType: FilterType, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      professor: '',
      turma: '',
      sala: ''
    });
    setSearchTermState('');
  }, []);

  const clearFilter = useCallback((filterType: FilterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  }, []);

  // Navigation functions
  const navigatePrevious = useCallback(() => {
    const currentOptions = filterOptions[activeFilterType];
    const currentValue = filters[activeFilterType];
    
    if (currentOptions.length === 0) return;
    
    if (currentValue === '') {
      // If no selection, go to last option
      setFilter(activeFilterType, currentOptions[currentOptions.length - 1]);
    } else {
      const currentIndex = currentOptions.indexOf(currentValue);
      if (currentIndex > 0) {
        setFilter(activeFilterType, currentOptions[currentIndex - 1]);
      } else {
        // Go to no selection
        setFilter(activeFilterType, '');
      }
    }
  }, [activeFilterType, filters, filterOptions, setFilter]);

  const navigateNext = useCallback(() => {
    const currentOptions = filterOptions[activeFilterType];
    const currentValue = filters[activeFilterType];
    
    if (currentOptions.length === 0) return;
    
    if (currentValue === '') {
      // If no selection, go to first option
      setFilter(activeFilterType, currentOptions[0]);
    } else {
      const currentIndex = currentOptions.indexOf(currentValue);
      if (currentIndex < currentOptions.length - 1) {
        setFilter(activeFilterType, currentOptions[currentIndex + 1]);
      } else {
        // Go to no selection
        setFilter(activeFilterType, '');
      }
    }
  }, [activeFilterType, filters, filterOptions, setFilter]);

  return {
    // State
    filters,
    searchTerm,
    activeFilterType,
    
    // Computed
    filteredEvents,
    hasActiveFilters,
    filterOptions,
    
    // Actions
    setFilter,
    setSearchTerm,
    setActiveFilterType,
    clearAllFilters,
    clearFilter,
    
    // Navigation
    navigatePrevious,
    navigateNext,
    getCurrentFilterInfo
  };
};