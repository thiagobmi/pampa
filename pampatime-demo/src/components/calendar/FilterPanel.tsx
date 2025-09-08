// src/components/FilterPanel.tsx - Refactored version
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import SearchableFilter from './SearchableFilter';
import { CalendarEvent } from '@/types/Event';
import { EventService, CreateEventData } from '@/services/eventService';

interface FilterPanelProps {
  selectedEvent?: CalendarEvent | null;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventAdd?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string | number) => void;
  onClearSelection?: () => void;
}

// Simplified form state - only what the user inputs
interface FormState {
  disciplina: string;
  professor: string;
  semestre: string;
  horarioInicio: string;
  horarioFinal: string;
  sala: string;
  dia: string;
  turma: string;
  modalidade: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedEvent,
  onEventUpdate,
  onEventAdd,
  onEventDelete,
  onClearSelection
}) => {
  const [formData, setFormData] = useState<FormState>({
    disciplina: '',
    professor: '',
    semestre: '',
    horarioInicio: '',
    horarioFinal: '',
    sala: '',
    dia: '',
    turma: '',
    modalidade: ''
  });

  // Sync form with selected event
  useEffect(() => {
    if (selectedEvent) {
      const startTime = selectedEvent.start ? new Date(selectedEvent.start) : null;
      const endTime = selectedEvent.end ? new Date(selectedEvent.end) : null;

      setFormData({
        disciplina: selectedEvent.title || '',
        professor: selectedEvent.professor || '',
        semestre: selectedEvent.semester || '',
        horarioInicio: startTime ? formatTimeForInput(startTime) : '',
        horarioFinal: endTime ? formatTimeForInput(endTime) : '',
        sala: selectedEvent.room || '',
        dia: startTime ? getDayNameFromFixedDate(startTime) : '',
        turma: selectedEvent.class || '',
        modalidade: selectedEvent.type || ''
      });
    } else {
      // Clear form
      setFormData({
        disciplina: '',
        professor: '',
        semestre: '',
        horarioInicio: '',
        horarioFinal: '',
        sala: '',
        dia: '',
        turma: '',
        modalidade: ''
      });
    }
  }, [selectedEvent]);

  const formatTimeForInput = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  const getDayNameFromFixedDate = (date: Date): string => {
    const dayOfWeek = date.getDay();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek];
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-clear end time if start time changes
      if (field === 'horarioInicio' && prev.horarioFinal) {
        const availableEndTimes = EventService.getAvailableEndTimes(value);
        if (!availableEndTimes.includes(prev.horarioFinal)) {
          newData.horarioFinal = '';
        }
      }

      return newData;
    });
  };

  // Validate form completion
  const isFormValid = (): boolean => {
    const requiredFields: (keyof FormState)[] = [
      'disciplina', 'professor', 'semestre', 'horarioInicio',
      'horarioFinal', 'sala', 'dia', 'turma', 'modalidade'
    ];

    return requiredFields.every(field => formData[field].trim() !== '');
  };

  const handleAdd = () => {
    if (selectedEvent) {
      alert('Por favor, cancele a edição atual antes de adicionar um novo evento.');
      return;
    }

    if (!isFormValid()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const eventData: CreateEventData = {
        title: formData.disciplina,
        day: formData.dia,
        startTime: formData.horarioInicio,
        endTime: formData.horarioFinal,
        room: formData.sala,
        professor: formData.professor,
        semester: formData.semestre,
        class: formData.turma,
        type: formData.modalidade
      };

      const newEvent = EventService.createEvent(eventData);
      onEventAdd?.(newEvent);

      // Clear form after successful add
      setFormData({
        disciplina: '',
        professor: '',
        semestre: '',
        horarioInicio: '',
        horarioFinal: '',
        sala: '',
        dia: '',
        turma: '',
        modalidade: ''
      });
    } catch (error: any) {
      alert(`Erro ao criar evento: ${error.message}`);
    }
  };

  const handleEdit = () => {
    if (!selectedEvent || !isFormValid()) {
      alert('Selecione um evento e preencha todos os campos necessários.');
      return;
    }

    try {
      const eventData: CreateEventData = {
        title: formData.disciplina,
        day: formData.dia,
        startTime: formData.horarioInicio,
        endTime: formData.horarioFinal,
        room: formData.sala,
        professor: formData.professor,
        semester: formData.semestre,
        class: formData.turma,
        type: formData.modalidade
      };

      const updatedEvent = EventService.createEvent(eventData);
      updatedEvent.id = selectedEvent.id; // Keep the original ID

      onEventUpdate?.(updatedEvent);
    } catch (error: any) {
      alert(`Erro ao atualizar evento: ${error.message}`);
    }
  };

  const handleDelete = () => {
    if (!selectedEvent) {
      alert('Selecione um evento para excluir');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este evento?')) {
      onEventDelete?.(selectedEvent.id);
    }
  };

  // Get available end times based on start time
  const availableEndTimes = EventService.getAvailableEndTimes(formData.horarioInicio);

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      {/* Editing indicator */}
      {selectedEvent && (
        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
          <div className="text-sm font-medium text-blue-800">Editando Evento</div>
          <div className="text-xs text-blue-600">{selectedEvent.title}</div>
          {(selectedEvent.semester || selectedEvent.class) && (
            <div className="text-xs text-blue-500 mt-1">
              {selectedEvent.semester && `Semestre: ${selectedEvent.semester}`}
              {selectedEvent.semester && selectedEvent.class && ' • '}
              {selectedEvent.class && `Turma: ${selectedEvent.class}`}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="mt-1 h-6 px-2 text-xs"
          >
            Cancelar Edição
          </Button>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Disciplina
            </label>
            <SearchableFilter
              label="Disciplina"
              value={formData.disciplina}
              onSelect={(value) => handleFieldChange('disciplina', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Professor
            </label>
            <SearchableFilter
              label="Professor"
              value={formData.professor}
              onSelect={(value) => handleFieldChange('professor', value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Semestre
            </label>
            <SearchableFilter
              label="Semestre"
              value={formData.semestre}
              onSelect={(value) => handleFieldChange('semestre', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Modalidade
            </label>
            <SearchableFilter
              label="Modalidade"
              value={formData.modalidade}
              onSelect={(value) => handleFieldChange('modalidade', value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Horário Início
            </label>
            <SearchableFilter
              label="Horário Início"
              value={formData.horarioInicio}
              onSelect={(value) => handleFieldChange('horarioInicio', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Horário Final
            </label>
            <SearchableFilter
              label="Horário Final"
              value={formData.horarioFinal}
              options={availableEndTimes}
              onSelect={(value) => handleFieldChange('horarioFinal', value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Sala
            </label>
            <SearchableFilter
              label="Sala"
              value={formData.sala}
              onSelect={(value) => handleFieldChange('sala', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Dia
            </label>
            <SearchableFilter
              label="Dia"
              value={formData.dia}
              onSelect={(value) => handleFieldChange('dia', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Turma
          </label>
          <SearchableFilter
            label="Turma"
            value={formData.turma}
            onSelect={(value) => handleFieldChange('turma', value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`text-xs font-medium ${
            isFormValid() && !selectedEvent
              ? 'bg-white hover:bg-green-50 text-gray-900'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleAdd}
          disabled={!isFormValid() || !!selectedEvent}
          title={!isFormValid() ? 'Preencha todos os campos obrigatórios' : 'Adicionar evento'}
        >
          Adicionar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs font-medium ${
            selectedEvent && isFormValid()
              ? 'bg-white hover:bg-blue-50 text-gray-900'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleEdit}
          disabled={!selectedEvent || !isFormValid()}
          title={
            !selectedEvent
              ? 'Selecione um evento para editar'
              : !isFormValid()
                ? 'Preencha todos os campos obrigatórios'
                : 'Editar evento'
          }
        >
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs font-medium ${
            selectedEvent
              ? 'bg-white hover:bg-red-50 text-gray-900'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleDelete}
          disabled={!selectedEvent}
          title={!selectedEvent ? 'Selecione um evento para excluir' : 'Excluir evento'}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;