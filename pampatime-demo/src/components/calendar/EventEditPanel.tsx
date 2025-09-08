// src/components/EventEditPanel.tsx - Versão corrigida
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, MapPin, User, BookOpen, Users } from 'lucide-react';
import { CalendarEvent, getEventTypeColors, applyEventColors } from '@/types/Event';

interface EventEditPanelProps {
  selectedEvent: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string | number) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Internal form data interface that matches the form inputs
interface FormData {
  id?: string | number;
  title: string;
  start: string; // datetime-local input always returns string
  end: string;   // datetime-local input always returns string
  room?: string;
  professor?: string;
  semester?: string;
  class?: string;
  type?: string;
}

const EventEditPanel: React.FC<EventEditPanelProps> = ({
  selectedEvent,
  onSave,
  onDelete,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    start: '',
    end: '',
    room: '',
    professor: '',
    semester: '',
    class: '',
    type: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      // Convert dates to datetime-local format
      const startDate = selectedEvent.start ? new Date(selectedEvent.start) : new Date();
      const endDate = selectedEvent.end ? new Date(selectedEvent.end) : new Date(startDate.getTime() + 60*60*1000);
      
      setFormData({
        id: selectedEvent.id,
        title: selectedEvent.title || '',
        start: formatDateTimeLocal(startDate),
        end: formatDateTimeLocal(endDate),
        room: selectedEvent.room || '',
        professor: selectedEvent.professor || '',
        semester: selectedEvent.semester || '',
        class: selectedEvent.class || '',
        type: selectedEvent.type || ''
      });
    } else {
      // Reset form for new event
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60*60*1000);
      
      setFormData({
        title: '',
        start: formatDateTimeLocal(now),
        end: formatDateTimeLocal(nextHour),
        room: '',
        professor: '',
        semester: '',
        class: '',
        type: ''
      });
    }
  }, [selectedEvent]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para o evento.');
      return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (endDate <= startDate) {
      alert('O horário final deve ser posterior ao horário inicial.');
      return;
    }

    // Create base event with proper Date objects and regenerated colors
    const baseEvent: Partial<CalendarEvent> = {
      id: formData.id || `event-${Date.now()}`,
      title: formData.title,
      start: startDate, // Convert to Date object
      end: endDate,     // Convert to Date object
      room: formData.room,
      professor: formData.professor,
      semester: formData.semester,
      class: formData.class,
      type: formData.type,
      allDay: false
    };

    // Apply fresh colors based on the current type
    const eventToSave = applyEventColors(baseEvent);
    onSave(eventToSave);
  };

  const handleDelete = () => {
    if (formData.id && window.confirm('Tem certeza que deseja excluir este evento?')) {
      onDelete(formData.id);
    }
  };

  // Get current colors for preview - this will update when formData.type changes
  const currentColors = React.useMemo(() => {
    const colors = getEventTypeColors(formData.type || '');
    console.log('EventEditPanel - Type changed to:', formData.type, 'Colors:', colors);
    return colors;
  }, [formData.type]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isEditing ? 'Editar Evento' : 'Novo Evento'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className=" text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o título do evento"
          />
        </div>

        {/* Tipo do Evento com Preview de Cor */}
        <div>
          <label className=" text-sm font-medium mb-1">Tipo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Cálculo, Matemática, Programação..."
              list="common-types"
            />
            <div 
              className="w-12 h-10 rounded border-2 flex items-center justify-center text-xs font-bold"
              key={formData.type} // Force re-render when type changes
              style={{
                backgroundColor: currentColors.bg,
                borderColor: currentColors.border,
                color: currentColors.text
              }}
              title="Preview da cor baseada no tipo"
            >
              {formData.type ? formData.type.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
          <datalist id="common-types">
            <option value="Cálculo" />
            <option value="Matemática" />
            <option value="Programação" />
            <option value="Física" />
            <option value="Química" />
            <option value="Laboratório" />
            <option value="Práticas" />
            <option value="Desafios" />
            <option value="Estatística" />
            <option value="Redes" />
          </datalist>
        </div>

        {/* Data e Hora Início */}
        <div>
          <label className=" text-sm font-medium mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Data e Hora Início *
          </label>
          <input
            type="datetime-local"
            value={formData.start}
            onChange={(e) => handleInputChange('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Data e Hora Fim */}
        <div>
          <label className=" text-sm font-medium mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Data e Hora Fim *
          </label>
          <input
            type="datetime-local"
            value={formData.end}
            onChange={(e) => handleInputChange('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sala */}
        <div>
          <label className=" text-sm font-medium mb-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Sala
          </label>
          <input
            type="text"
            value={formData.room || ''}
            onChange={(e) => handleInputChange('room', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: A101, Lab02"
          />
        </div>

        {/* Professor */}
        <div>
          <label className=" text-sm font-medium mb-1 flex items-center gap-1">
            <User className="w-4 h-4" />
            Professor
          </label>
          <input
            type="text"
            value={formData.professor || ''}
            onChange={(e) => handleInputChange('professor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do professor"
          />
        </div>

        {/* Grid com Semestre e Turma */}
        <div className="grid grid-cols-2 gap-4">
          {/* Semestre */}
          <div>
            <label className=" text-sm font-medium mb-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Semestre
            </label>
            <input
              type="text"
              value={formData.semester || ''}
              onChange={(e) => handleInputChange('semester', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 2024/1"
            />
          </div>

          {/* Turma */}
          <div>
            <label className=" text-sm font-medium mb-1 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Turma
            </label>
            <input
              type="text"
              value={formData.class || ''}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: A, B, C"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave}
            className="flex-1 bg-pampa-green hover:bg-pampa-green/90 text-white"
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Evento'}
          </Button>
          
          {isEditing && (
            <Button 
              onClick={handleDelete}
              variant="destructive"
              className="px-4"
            >
              Excluir
            </Button>
          )}
          
          <Button 
            onClick={onCancel}
            variant="outline"
            className="px-4"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventEditPanel;