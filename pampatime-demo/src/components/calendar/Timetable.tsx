// src/components/Timetable.tsx - Parte 1: Imports e Interfaces
import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EventCalendar } from './EventCalendar';
import { CalendarEvent, applyEventColors, CONFLICT_COLORS } from '@/types/Event';
import { useEventFilters } from '@/hooks/useEventFilters';
import { ConflictService } from '@/services/conflictService';

type FilterType = 'professor' | 'turma' | 'sala';

interface ConflictData {
  conflictIds: Set<string | number>;
  conflictDetails: Map<string | number, any[]>;
}

interface TimetableProps {
  events?: CalendarEvent[];
  conflicts?: ConflictData;
  onEventClick?: (event: CalendarEvent) => void;
  onEventChange?: (event: CalendarEvent) => void;
  onEventsChange?: (events: CalendarEvent[]) => void;
}

interface TimetableRef {
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string | number) => void;
  getEvents: () => CalendarEvent[];
}

// Parte 2: Início do Componente e Estados
const Timetable = forwardRef<TimetableRef, TimetableProps>(({
  events = [],
  conflicts,
  onEventClick,
  onEventChange,
  onEventsChange
}, ref) => {
  // Estados do componente
  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');
  const [showConflictPanel, setShowConflictPanel] = useState(false);
  const [selectedConflictType, setSelectedConflictType] = useState<'sala' | 'professor' | 'turma' | null>(null);

  // Use os eventos passados como props
  const filterManager = useEventFilters(events);

  // Apply conflict styling to filtered events
  const styledEvents = React.useMemo(() => {
    if (!conflicts) {
      return filterManager.filteredEvents.map(event => applyEventColors(event));
    }

    return filterManager.filteredEvents.map(event => {
      if (event.id && conflicts.conflictIds.has(event.id)) {
        return {
          ...event,
          backgroundColor: CONFLICT_COLORS.bg,
          borderColor: CONFLICT_COLORS.border,
          textColor: CONFLICT_COLORS.text,
          className: 'conflict-event',
          conflictInfo: conflicts.conflictDetails.get(event.id) || []
        };
      }
      
      return applyEventColors(event);
    });
  }, [filterManager.filteredEvents, conflicts]);

  // Conflict summary
  const conflictSummary = React.useMemo(() => {
    return conflicts ? ConflictService.createConflictSummary(conflicts) : { sala: [], professor: [], turma: [], total: 0 };
  }, [conflicts]);

  // Parte 3: Event Handlers
  const handleEventClick = (info: any) => {
    const eventData = createEventDataFromFullCalendar(info.event);
    setSelectedEventId(eventData.id);
    
    if (eventData.id && conflicts?.conflictDetails.has(eventData.id)) {
      const eventConflicts = conflicts.conflictDetails.get(eventData.id) || [];
      const conflictDesc = ConflictService.getConflictDescription(eventConflicts);
      
      if (conflictDesc) {
        const conflictingEvents = ConflictService.getConflictingEvents(eventData.id, events, conflicts);
        
        let message = `⚠️ CONFLITO DETECTADO:\n\n${conflictDesc}`;
        
        if (conflictingEvents.length > 0) {
          message += '\n\nEventos em conflito:';
          conflictingEvents.forEach((conflictEvent, index) => {
            const startTime = conflictEvent.start ? new Date(conflictEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
            message += `\n${index + 1}. ${conflictEvent.title} (${startTime})`;
          });
          message += '\n\nClique em "Editar" para resolver o conflito ou use os filtros para navegar até os eventos conflitantes.';
        }
      }
    }
    
    onEventClick?.(eventData);
  };

  const handleEventDrop = (info: any) => {
    const updatedEventData = createEventDataFromFullCalendar(info.event);
    const recoloredEvent = applyEventColors({
      ...updatedEventData,
      start: info.event.start,
      end: info.event.end
    });
    
    onEventChange?.(recoloredEvent);
    
    if (selectedEventId === info.event.id && onEventChange) {
      setTimeout(() => onEventChange(recoloredEvent), 0);
    }
  };

  const handleEventResize = (info: any) => {
    const resizedEventData = createEventDataFromFullCalendar(info.event);
    const recoloredEvent = applyEventColors({
      ...resizedEventData,
      start: info.event.start,
      end: info.event.end
    });
    
    onEventChange?.(recoloredEvent);
    
    if (selectedEventId === info.event.id && onEventChange) {
      setTimeout(() => onEventChange(recoloredEvent), 0);
    }
  };

  // Parte 4: handleEventReceive e Utility Functions
  const handleEventReceive = (info: any) => {
    console.log('Event received:', info.event);
    
    const eventData = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end || new Date(info.event.start.getTime() + 60*60*1000),
      extendedProps: info.event.extendedProps || {}
    };
    
    const newCalendarEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      room: eventData.extendedProps?.room || '',
      professor: eventData.extendedProps?.professor || '',
      semester: eventData.extendedProps?.semester || '',
      class: eventData.extendedProps?.class || '',
      type: eventData.extendedProps?.type || '',
      allDay: false
    };

    const coloredEvent = applyEventColors(newCalendarEvent);
    
    console.log('Adding new event:', coloredEvent);
    
    info.event.setProp('backgroundColor', coloredEvent.backgroundColor);
    info.event.setProp('borderColor', coloredEvent.borderColor);
    info.event.setProp('textColor', coloredEvent.textColor);
    info.event.setProp('id', coloredEvent.id);
    
    const updatedEvents = [...events, coloredEvent];
    onEventsChange?.(updatedEvents);

    if (onEventClick) {
      setTimeout(() => onEventClick(coloredEvent), 100);
    }
  };

  // Utility functions
  const createEventDataFromFullCalendar = (fcEvent: any): CalendarEvent => {
    return {
      id: fcEvent.id,
      title: fcEvent.title,
      start: fcEvent.start,
      end: fcEvent.end,
      room: fcEvent.extendedProps?.room,
      professor: fcEvent.extendedProps?.professor,
      semester: fcEvent.extendedProps?.semester,
      class: fcEvent.extendedProps?.class,
      type: fcEvent.extendedProps?.type,
      backgroundColor: fcEvent.backgroundColor,
      borderColor: fcEvent.borderColor,
      allDay: fcEvent.allDay || false
    };
  };

  // Parte 5: Função de Navegação e Grupos de Conflito
  const navigateToEvent = useCallback((event: CalendarEvent, conflictType?: 'sala' | 'professor' | 'turma') => {
    filterManager.clearAllFilters();
    
    if (conflictType) {
      switch (conflictType) {
        case 'sala':
          if (event.room) {
            filterManager.setFilter('sala', event.room);
            filterManager.setActiveFilterType('sala');
          }
          break;
        case 'professor':
          if (event.professor) {
            filterManager.setFilter('professor', event.professor);
            filterManager.setActiveFilterType('professor');
          }
          break;
        case 'turma':
          if (event.class) {
            filterManager.setFilter('turma', event.class);
            filterManager.setActiveFilterType('turma');
          }
          break;
      }
    } else {
      if (event.professor) {
        filterManager.setFilter('professor', event.professor);
        filterManager.setActiveFilterType('professor');
      } else if (event.room) {
        filterManager.setFilter('sala', event.room);
        filterManager.setActiveFilterType('sala');
      } else if (event.class) {
        filterManager.setFilter('turma', event.class);
        filterManager.setActiveFilterType('turma');
      }
    }
    
    setTimeout(() => {
      setSelectedEventId(event.id);
      onEventClick?.(event);
    }, 500);
  }, [filterManager, onEventClick]);

  // Obter eventos conflitantes agrupados por tipo
  const conflictGroups = React.useMemo(() => {
    if (!conflicts) return { sala: [], professor: [], turma: [] };
    
    const groups: {
      sala: { value: string; events: CalendarEvent[] }[];
      professor: { value: string; events: CalendarEvent[] }[];
      turma: { value: string; events: CalendarEvent[] }[];
    } = { sala: [], professor: [], turma: [] };
    
    // Agrupar por sala
    conflictSummary.sala.forEach(sala => {
      const eventsInSala = events.filter(event => 
        event.room === sala && event.id && conflicts.conflictIds.has(event.id)
      );
      if (eventsInSala.length > 0) {
        groups.sala.push({ value: sala, events: eventsInSala });
      }
    });
    
    // Agrupar por professor
    conflictSummary.professor.forEach(professor => {
      const eventsByProfessor = events.filter(event => 
        event.professor === professor && event.id && conflicts.conflictIds.has(event.id)
      );
      if (eventsByProfessor.length > 0) {
        groups.professor.push({ value: professor, events: eventsByProfessor });
      }
    });
    
    // Agrupar por turma
    conflictSummary.turma?.forEach(turma => {
      const eventsByTurma = events.filter(event => 
        event.class === turma && event.id && conflicts.conflictIds.has(event.id)
      );
      if (eventsByTurma.length > 0) {
        groups.turma.push({ value: turma, events: eventsByTurma });
      }
    });
    
    return groups;
  }, [conflicts, conflictSummary, events]);

  // Parte 6: Funções do Modal de Busca
  const openSearchModal = () => {
    setSearchModalTerm('');
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

  const selectFromModal = (value: string) => {
    filterManager.setFilter(filterManager.activeFilterType, value);
    closeSearchModal();
  };

  // Filter options for modal
  const filteredModalOptions = React.useMemo(() => {
    const currentOptions = filterManager.filterOptions[filterManager.activeFilterType];
    if (!searchModalTerm) return currentOptions;
    return currentOptions.filter(option =>
      option.toLowerCase().includes(searchModalTerm.toLowerCase())
    );
  }, [filterManager.filterOptions, filterManager.activeFilterType, searchModalTerm]);

  // Imperative handle for parent component
  useImperativeHandle(ref, () => ({
    addEvent: (event: CalendarEvent) => {
      const updatedEvents = [...events, event];
      onEventsChange?.(updatedEvents);
    },
    updateEvent: (event: CalendarEvent) => {
      const updatedEvents = events.map(e => e.id === event.id ? event : e);
      onEventsChange?.(updatedEvents);
    },
    deleteEvent: (eventId: string | number) => {
      const updatedEvents = events.filter(e => e.id !== eventId);
      onEventsChange?.(updatedEvents);
      
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
      }
    },
    getEvents: () => events
  }));

  // Close modal when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('search-modal');
      if (modal && !modal.contains(event.target as Node)) {
        closeSearchModal();
      }
    };

    if (showSearchModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchModal]);

  const currentFilterInfo = filterManager.getCurrentFilterInfo();
  // Parte 7: Return e CSS
  return (
    <>
      {/* CSS for conflict animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .conflict-event {
            animation: pulse-red 2s infinite;
          }
          
          @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 0 2px #dc2626; }
            50% { box-shadow: 0 0 0 4px #dc2626; }
          }
          
          .fc-event.conflict-event {
            border: 2px solid #dc2626 !important;
            background-color: #fee2e2 !important;
            color: #7f1d1d !important;
          }
          
          .fc-event.conflict-event:hover {
            background-color: #fecaca !important;
          }
          
          .fc-event.conflict-event::after {
            content: "⚠";
            position: absolute;
            top: 2px;
            right: 2px;
            color: #dc2626;
            font-weight: bold;
            font-size: 12px;
            text-shadow: 0 0 2px white;
          }
        `
      }} />
      
      <div className="w-full h-full flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white"></div>
      // Parte 8: Header com Navegação e Filtros
        {/* Header with navigation and filters */}
        <div className="flex items-center justify-between p-2 border-b">
          {/* Filter Navigation */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={filterManager.navigatePrevious}
              disabled={currentFilterInfo.total === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-[180px] text-center relative">
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {filterManager.activeFilterType.charAt(0).toUpperCase() + filterManager.activeFilterType.slice(1)}
              </div>
              <div 
                className="font-medium text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                onClick={openSearchModal}
                title="Clique para pesquisar"
              >
                {currentFilterInfo.displayText}
              </div>
              
              {/* Search Modal */}
              {showSearchModal && (
                <div 
                  id="search-modal"
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                >
                  <div className="p-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Pesquisar {filterManager.activeFilterType}
                    </div>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Digite para buscar ${filterManager.activeFilterType}...`}
                        value={searchModalTerm}
                        onChange={(e) => setSearchModalTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {currentFilterInfo.value && (
                      <div
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-red-50 border-b border-gray-100 text-red-600"
                        onClick={() => selectFromModal('')}
                      >
                        <div className="font-medium flex items-center">
                          <X size={14} className="mr-2" />
                          Limpar seleção
                        </div>
                      </div>
                    )}
                    
                    {filteredModalOptions.length > 0 ? (
                      filteredModalOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                            currentFilterInfo.value === option ? 'bg-blue-100 text-blue-800' : ''
                          }`}
                          onClick={() => selectFromModal(option)}
                        >
                          <div className="font-medium">{option}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        <Search size={16} className="mx-auto mb-2" />
                        Nenhum resultado encontrado para "{searchModalTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={filterManager.navigateNext}
              disabled={currentFilterInfo.total === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          // Parte 9: Botões de Filtro e Busca
          
          {/* Filter Type Buttons */}
          <div className="flex items-center divide-x divide-gray-200 rounded-md overflow-hidden border border-gray-300">
            {(['professor', 'turma', 'sala'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant="outline"
                className={`text-sm h-8 rounded-none border-none px-4 ${
                  filterManager.activeFilterType === filterType
                    ? 'bg-pampa-green text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => filterManager.setActiveFilterType(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
          
          {/* Search and Clear */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={filterManager.searchTerm}
                onChange={(e) => filterManager.setSearchTerm(e.target.value)}
                className="pl-7 pr-8 py-1 w-full border rounded-md text-xs min-w-[140px]"
              />
              {filterManager.searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-1"
                  onClick={() => filterManager.setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {filterManager.hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={filterManager.clearAllFilters}
                className="text-xs h-8 px-2"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
        // Parte 10: Status Bar
        {/* Status bar */}
        {(filterManager.hasActiveFilters || conflictSummary.total > 0) && (
          <div className="px-2 py-1 bg-blue-50 border-b border-blue-200 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-700">
                  Exibindo {filterManager.filteredEvents.length} de {events.length} eventos
                </span>
                
                {conflictSummary.total > 0 && (
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>⚠️ {conflictSummary.total} eventos com conflito</span>
                        <div className="text-xs opacity-75 flex items-center space-x-1">
                          {conflictSummary.sala.length > 0 && (
                            <span 
                              className={`px-1 rounded mr-1 cursor-pointer transition-colors ${
                                selectedConflictType === 'sala' && showConflictPanel
                                  ? 'bg-red-400 text-white shadow-sm' 
                                  : 'bg-red-200 hover:bg-red-300'
                              }`}
                              title={`Salas em conflito: ${conflictSummary.sala.join(', ')} - Clique para ver detalhes`}
                              onClick={() => {
                                setSelectedConflictType('sala');
                                if (!showConflictPanel) {
                                  setShowConflictPanel(true);
                                }
                              }}
                            >
                              🏢 {conflictSummary.sala.length} sala{conflictSummary.sala.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {conflictSummary.professor.length > 0 && (
                            <span 
                              className={`px-1 rounded mr-1 cursor-pointer transition-colors ${
                                selectedConflictType === 'professor' && showConflictPanel
                                  ? 'bg-red-400 text-white shadow-sm' 
                                  : 'bg-red-200 hover:bg-red-300'
                              }`}
                              title={`Professores em conflito: ${conflictSummary.professor.join(', ')} - Clique para ver detalhes`}
                              onClick={() => {
                                setSelectedConflictType('professor');
                                if (!showConflictPanel) {
                                  setShowConflictPanel(true);
                                }
                              }}
                            >
                              👨‍🏫 {conflictSummary.professor.length} prof{conflictSummary.professor.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {conflictSummary.turma && conflictSummary.turma.length > 0 && (
                            <span 
                              className={`px-1 rounded cursor-pointer transition-colors ${
                                selectedConflictType === 'turma' && showConflictPanel
                                  ? 'bg-red-400 text-white shadow-sm' 
                                  : 'bg-red-200 hover:bg-red-300'
                              }`}
                              title={`Turmas em conflito: ${conflictSummary.turma.join(', ')} - Clique para ver detalhes`}
                              onClick={() => {
                                setSelectedConflictType('turma');
                                if (!showConflictPanel) {
                                  setShowConflictPanel(true);
                                }
                              }}
                            >
                              🎓 {conflictSummary.turma.length} turma{conflictSummary.turma.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-red-700 hover:text-red-900 hover:bg-red-200"
                        onClick={() => setShowConflictPanel(!showConflictPanel)}
                      >
                        {showConflictPanel ? 'Ocultar' : 'Ver Detalhes'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              // Parte 11: Tags de Filtros Ativos
              {/* Active filters display */}
              <div className="flex items-center space-x-2">
                {filterManager.filters.professor && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                    Prof: {filterManager.filters.professor}
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer hover:bg-blue-200 rounded" 
                      onClick={() => filterManager.clearFilter('professor')}
                    />
                  </span>
                )}
                {filterManager.filters.sala && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center">
                    Sala: {filterManager.filters.sala}
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer hover:bg-green-200 rounded" 
                      onClick={() => filterManager.clearFilter('sala')}
                    />
                  </span>
                )}
                {filterManager.filters.turma && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center">
                    Turma: {filterManager.filters.turma}
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer hover:bg-purple-200 rounded" 
                      onClick={() => filterManager.clearFilter('turma')}
                    />
                  </span>
                )}
                {filterManager.searchTerm && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs flex items-center">
                    "{filterManager.searchTerm}"
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer hover:bg-gray-200 rounded" 
                      onClick={() => filterManager.setSearchTerm('')}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        // Parte 12: Painel de Conflitos - Início
        {/* Painel de Detalhes de Conflitos */}
        {showConflictPanel && conflictSummary.total > 0 && (
          <div className="border-b border-red-200 bg-red-50 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-red-800 flex items-center">
                <span className="mr-2">⚠️</span>
                Detalhes dos Conflitos
                {selectedConflictType && (
                  <span className="ml-2 text-sm font-normal">
                    ({selectedConflictType === 'sala' ? '🏢 Salas' : 
                      selectedConflictType === 'professor' ? '👨‍🏫 Professores' : 
                      '🎓 Turmas'})
                  </span>
                )}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:bg-red-200"
                onClick={() => setShowConflictPanel(false)}
              >
                <X size={12} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Conflitos de Sala */}
              {(!selectedConflictType || selectedConflictType === 'sala') && conflictGroups.sala.length > 0 && (
                <div className="bg-white p-2 rounded border border-red-200">
                  <h5 className="font-medium text-sm text-red-700 mb-2 flex items-center">
                    🏢 Conflitos de Sala ({conflictGroups.sala.length})
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {conflictGroups.sala.map((group, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-red-600 mb-1">Sala {group.value}:</div>
                        {group.events.map((event, eventIndex) => {
                          const time = event.start ? new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                          return (
                            <div 
                              key={eventIndex} 
                              className="pl-2 text-gray-700 hover:text-red-700 cursor-pointer hover:bg-red-50 rounded p-1"
                              onClick={() => navigateToEvent(event, 'sala')}
                              title="Clique para navegar até este evento"
                            >
                              • {event.title} ({time})
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
             // Parte 13: Conflitos de Professor e Turma
              {/* Conflitos de Professor */}
              {(!selectedConflictType || selectedConflictType === 'professor') && conflictGroups.professor.length > 0 && (
                <div className="bg-white p-2 rounded border border-red-200">
                  <h5 className="font-medium text-sm text-red-700 mb-2 flex items-center">
                    👨‍🏫 Conflitos de Professor ({conflictGroups.professor.length})
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {conflictGroups.professor.map((group, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-red-600 mb-1">{group.value}:</div>
                        {group.events.map((event, eventIndex) => {
                          const time = event.start ? new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                          return (
                            <div 
                              key={eventIndex} 
                              className="pl-2 text-gray-700 hover:text-red-700 cursor-pointer hover:bg-red-50 rounded p-1"
                              onClick={() => navigateToEvent(event, 'professor')}
                              title="Clique para navegar até este evento"
                            >
                              • {event.title} ({time})
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflitos de Turma */}
              {(!selectedConflictType || selectedConflictType === 'turma') && conflictGroups.turma.length > 0 && (
                <div className="bg-white p-2 rounded border border-red-200">
                  <h5 className="font-medium text-sm text-red-700 mb-2 flex items-center">
                    🎓 Conflitos de Turma ({conflictGroups.turma.length})
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {conflictGroups.turma.map((group, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-red-600 mb-1">Turma {group.value}:</div>
                        {group.events.map((event, eventIndex) => {
                          const time = event.start ? new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                          return (
                            <div 
                              key={eventIndex} 
                              className="pl-2 text-gray-700 hover:text-red-700 cursor-pointer hover:bg-red-50 rounded p-1"
                              onClick={() => navigateToEvent(event, 'turma')}
                              title="Clique para navegar até este evento"
                            >
                              • {event.title} ({time})
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-red-600 text-center">
              💡 Clique em qualquer evento acima para navegar até ele no calendário
            </div>
          </div>
        )}
        // Parte 14: Calendar e Fechamento Final
        {/* Calendar */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full">
            <EventCalendar 
              events={styledEvents}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              onEventReceive={handleEventReceive}
            />
          </div>
        </div>
      </div>
    </>
  );
});

Timetable.displayName = 'Timetable';

export default Timetable; 