import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarEvent } from '@/types/Event';
import { useRealtimeCalendarEvents } from '@/hooks/useRealtimeCalendarEvents';
import { Download, Eye, Filter, FileText, X } from 'lucide-react';

// Interface estendida para incluir nossas propriedades personalizadas
interface ScheduleEvent extends CalendarEvent {
  hasConflict?: boolean;
  isExpandedSlot?: boolean;
  originalDuration?: string;
}

const ScheduleReportGenerator = () => {
  const { events, loading } = useRealtimeCalendarEvents();
  const [selectedFilters, setSelectedFilters] = useState({
    professores: [] as string[],
    salas: [] as string[],
    turmas: [] as string[],
    modalidades: [] as string[]
  });
  const [reportTitle, setReportTitle] = useState('Horários');
  const [showFilters, setShowFilters] = useState(false);

  // Extrair opções únicas dos eventos
  const filterOptions = useMemo(() => {
    const professors = [...new Set(events.map(e => e.professor).filter(Boolean))].sort();
    const salas = [...new Set(events.map(e => e.room).filter(Boolean))].sort();
    const turmas = [...new Set(events.map(e => e.class).filter(Boolean))].sort();
    const modalidades = [...new Set(events.map(e => e.type).filter(Boolean))].sort();

    return { professors, salas, turmas, modalidades };
  }, [events]);

  // Filtrar eventos baseado nos filtros selecionados
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesProfessor = selectedFilters.professores.length === 0 ||
        (event.professor && selectedFilters.professores.includes(event.professor));
      const matchesSala = selectedFilters.salas.length === 0 ||
        (event.room && selectedFilters.salas.includes(event.room));
      const matchesTurma = selectedFilters.turmas.length === 0 ||
        (event.class && selectedFilters.turmas.includes(event.class));
      const matchesModalidade = selectedFilters.modalidades.length === 0 ||
        (event.type && selectedFilters.modalidades.includes(event.type));

      return matchesProfessor && matchesSala && matchesTurma && matchesModalidade;
    });
  }, [events, selectedFilters]);

  // Função para expandir eventos que ocupam múltiplos horários
  const expandEventsToAllSlots = (events: CalendarEvent[]) => {
    const expandedEvents: ScheduleEvent[] = [];
    
    events.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end || startDate);
      
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
      
      for (let i = 0; i < durationHours; i++) {
        const slotStartDate = new Date(startDate);
        slotStartDate.setHours(startDate.getHours() + i);
        
        const slotEndDate = new Date(slotStartDate);
        slotEndDate.setHours(slotStartDate.getHours() + 1);
        
        expandedEvents.push({
          ...event,
          id: `${event.id}-slot-${i}`,
          start: slotStartDate,
          end: slotEndDate,
          isExpandedSlot: true,
          originalDuration: durationHours > 1 ? `${durationHours}h` : undefined
        });
      }
    });
    
    return expandedEvents;
  };

  // Organizar eventos por dia e horário, com detecção de conflitos
  const organizedEvents = useMemo(() => {
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const timeSlots = [
      '07:30', '08:30', '09:30', '10:30', '11:30', '12:30',
      '13:30', '14:30', '15:30', '16:30', '17:30', '18:30',
      '19:30', '20:30', '21:30', '22:30'
    ];

    const schedule: { [key: string]: { [key: string]: ScheduleEvent[] } } = {};
    
    // Inicializar estrutura
    daysOfWeek.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(time => {
        schedule[day][time] = [];
      });
    });

    const expandedEvents = expandEventsToAllSlots(filteredEvents);

    // Organizar eventos expandidos
    expandedEvents.forEach(event => {
      const startDate = new Date(event.start);
      const dayOfWeek = startDate.getDay();
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = dayNames[dayOfWeek];
      
      const startTime = startDate.toTimeString().slice(0, 5);
      
      if (schedule[dayName] && schedule[dayName][startTime]) {
        schedule[dayName][startTime].push(event);
      }
    });

    // --- INÍCIO: LÓGICA DE DETECÇÃO DE CONFLITOS ---
    daysOfWeek.forEach(day => {
      timeSlots.forEach(timeSlot => {
        const eventsInSlot = schedule[day][timeSlot];
        if (eventsInSlot.length <= 1) return; // Pula se não houver potencial para conflito

        const professorCount: { [key: string]: number } = {};
        const roomCount: { [key: string]: number } = {};
        const classCount: { [key: string]: number } = {};

        // Conta as ocorrências de professores, salas e turmas no mesmo horário
        eventsInSlot.forEach(event => {
          if (event.professor) professorCount[event.professor] = (professorCount[event.professor] || 0) + 1;
          if (event.room) roomCount[event.room] = (roomCount[event.room] || 0) + 1;
          if (event.class) classCount[event.class] = (classCount[event.class] || 0) + 1;
        });

        // Marca os eventos que estão em conflito
        eventsInSlot.forEach(event => {
          const hasProfessorConflict = event.professor && professorCount[event.professor] > 1;
          const hasRoomConflict = event.room && roomCount[event.room] > 1;
          const hasClassConflict = event.class && classCount[event.class] > 1;

          if (hasProfessorConflict || hasRoomConflict || hasClassConflict) {
            event.hasConflict = true;
          }
        });
      });
    });
    // --- FIM: LÓGICA DE DETECÇÃO DE CONFLITOS ---

    return { schedule, daysOfWeek, timeSlots };
  }, [filteredEvents]);

  // Funções para gerenciar filtros múltiplos
  const addFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: [...prev[filterType], value]
    }));
  };

  const removeFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      professores: [],
      salas: [],
      turmas: [],
      modalidades: []
    });
  };

  // Gerar CSS para o relatório
  const generateCSS = () => `
    <style type="text/css">
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }

      h1 {
        text-align: center;
        color: #004000;
        margin-bottom: 30px;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      }

      table.page {
        page-break-after: always;
        page-break-inside: avoid;
      }

      tr.header {
        background-color: #004000;
        color: white;
        font-weight: bold;
      }

      tr.odd {
        background-color: #CCFFCC;
        color: #003300;
      }

      tr.even {
        background-color: #99FF99;
        color: #003300;
      }

      td {
        border: 1px solid #98bf21;
        padding: 8px;
        text-align: center;
        vertical-align: top;
        font-size: 12px;
        min-height: 40px;
      }

      /* --- INÍCIO: ESTILO PARA CÉLULAS COM CONFLITO --- */
      td.conflict-cell {
        background-color: #ffcccc !important; /* Fundo vermelho claro */
        border: 1px dashed red !important;   /* Borda vermelha para reforçar */
      }
      /* --- FIM: ESTILO PARA CÉLULAS COM CONFLITO --- */

      td.time-column {
        width: 80px;
        font-weight: bold;
        background-color: #004000;
        color: white;
        text-align: center;
      }

      td.day-column {
        width: calc((100% - 80px) / 6);
      }

      .event-item {
        margin: 2px 0;
        padding: 3px 5px;
        background: rgba(255,255,255,0.9);
        border-radius: 3px;
        font-size: 10px;
        line-height: 1.3;
        border-left: 3px solid #004000;
      }

      .event-title {
        font-weight: bold;
        color: #000;
        margin-bottom: 2px;
      }

      .event-details {
        font-size: 9px;
        color: #333;
        opacity: 0.8;
      }

      .duration-indicator {
        font-size: 8px;
        color: #666;
        font-style: italic;
      }

      .report-footer {
        margin-top: 30px;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 15px;
      }

      @media print {
        thead { display: table-header-group; }
        .no-print { display: none; }
        body { margin: 0; font-size: 11px; }
        td { color: #000000; border: 1px solid #000000; }
        tr.header { background-color: #AAAAAA !important; }
        tr.odd { background-color: #EEEEEE !important; }
        tr.even { background-color: #CCCCCC !important; }
        .event-item { background: white !important; }
        td.conflict-cell { background-color: #ffcccc !important; }
      }
    </style>
  `;

  // Gerar o HTML do relatório
  const generateHTML = () => {
    const { schedule, daysOfWeek, timeSlots } = organizedEvents;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        ${generateCSS()}
      </head>
      <body>
        <h1>${reportTitle}</h1>
        
        <table class="page">
    `;

    // Cabeçalho da tabela
    html += `
          <tr class="header">
            <td class="time-column">Hora</td>
    `;
    
    daysOfWeek.forEach(day => {
      html += `<td class="day-column">${day}</td>`;
    });
    
    html += '</tr>';

    // Linhas de horários
    timeSlots.forEach((timeSlot, index) => {
      const rowClass = index % 2 === 0 ? 'even' : 'odd';
      html += `<tr class="${rowClass}">`;
      html += `<td class="time-column">${timeSlot}</td>`;
      
      daysOfWeek.forEach(day => {
        const eventsInSlot = schedule[day][timeSlot] || [];
        
        // --- INÍCIO: VERIFICA SE HÁ CONFLITO E APLICA A CLASSE ---
        const hasConflict = eventsInSlot.some(e => e.hasConflict);
        const tdClass = hasConflict ? 'day-column conflict-cell' : 'day-column';
        html += `<td class="${tdClass}">`;
        // --- FIM: VERIFICA SE HÁ CONFLITO E APLICA A CLASSE ---
        
        eventsInSlot.forEach(event => {
          html += `
            <div class="event-item">
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                ${event.professor ? `Prof: ${event.professor}<br>` : ''}
                ${event.room ? `Sala: ${event.room}<br>` : ''}
                ${event.class ? `Turma: ${event.class}<br>` : ''}
                ${event.type ? `${event.type}` : ''}
                ${event.originalDuration ? `<br><span class="duration-indicator">(${event.originalDuration})</span>` : ''}
              </div>
            </div>
          `;
        });
        
        html += '</td>';
      });
      
      html += '</tr>';
    });

    html += `
        </table>
        
        <div class="report-footer">
          <p><strong>Relatório gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Total de eventos:</strong> ${filteredEvents.length}</p>
          ${Object.values(selectedFilters).some(arr => arr.length > 0) ? '<p><strong>Filtros aplicados:</strong></p><ul>' : ''}
          ${selectedFilters.professores.length > 0 ? `<li>Professores: ${selectedFilters.professores.join(', ')}</li>` : ''}
          ${selectedFilters.salas.length > 0 ? `<li>Salas: ${selectedFilters.salas.join(', ')}</li>` : ''}
          ${selectedFilters.turmas.length > 0 ? `<li>Turmas: ${selectedFilters.turmas.join(', ')}</li>` : ''}
          ${selectedFilters.modalidades.length > 0 ? `<li>Modalidades: ${selectedFilters.modalidades.join(', ')}</li>` : ''}
          ${Object.values(selectedFilters).some(arr => arr.length > 0) ? '</ul>' : ''}
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const downloadReport = () => {
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openPreview = () => {
    const htmlContent = generateHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando eventos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gerador de Relatório de Horários</h2>
        </div>
        
        {/* Configurações do Relatório */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Relatório
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite o título do relatório"
          />
        </div>

        {/* Toggle de Filtros */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professores</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFilters.professores.map(prof => (
                  <span key={prof} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {prof}
                    <button
                      onClick={() => removeFilter('professores', prof)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedFilters.professores.includes(e.target.value)) {
                    addFilter('professores', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Adicionar professor...</option>
                {filterOptions.professors
                  .filter(prof => !selectedFilters.professores.includes(prof))
                  .map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
              </select>
            </div>

            {/* Sala */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFilters.salas.map(sala => (
                  <span key={sala} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {sala}
                    <button
                      onClick={() => removeFilter('salas', sala)}
                      className="ml-2 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedFilters.salas.includes(e.target.value)) {
                    addFilter('salas', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Adicionar sala...</option>
                {filterOptions.salas
                  .filter(sala => !selectedFilters.salas.includes(sala))
                  .map(sala => (
                    <option key={sala} value={sala}>{sala}</option>
                  ))}
              </select>
            </div>

            {/* Turma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Turmas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFilters.turmas.map(turma => (
                  <span key={turma} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {turma}
                    <button
                      onClick={() => removeFilter('turmas', turma)}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedFilters.turmas.includes(e.target.value)) {
                    addFilter('turmas', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Adicionar turma...</option>
                {filterOptions.turmas
                  .filter(turma => !selectedFilters.turmas.includes(turma))
                  .map(turma => (
                    <option key={turma} value={turma}>{turma}</option>
                  ))}
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidades</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFilters.modalidades.map(modalidade => (
                  <span key={modalidade} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {modalidade}
                    <button
                      onClick={() => removeFilter('modalidades', modalidade)}
                      className="ml-2 hover:text-orange-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedFilters.modalidades.includes(e.target.value)) {
                    addFilter('modalidades', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Adicionar modalidade...</option>
                {filterOptions.modalidades
                  .filter(modalidade => !selectedFilters.modalidades.includes(modalidade))
                  .map(modalidade => (
                    <option key={modalidade} value={modalidade}>{modalidade}</option>
                  ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full"
                disabled={Object.values(selectedFilters).every(arr => arr.length === 0)}
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-gray-600">Total de Eventos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{filteredEvents.length}</div>
              <div className="text-sm text-gray-600">Eventos Filtrados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{filterOptions.professors.length}</div>
              <div className="text-sm text-gray-600">Professores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{filterOptions.salas.length}</div>
              <div className="text-sm text-gray-600">Salas</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={openPreview}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
            disabled={filteredEvents.length === 0}
          >
            <Eye className="w-4 h-4" />
            Visualizar Relatório
          </Button>
          
          <Button
            onClick={downloadReport}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
            disabled={filteredEvents.length === 0}
          >
            <Download className="w-4 h-4" />
            Baixar HTML
          </Button>
        </div>

        {filteredEvents.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Nenhum evento encontrado com os filtros selecionados. 
              Ajuste os filtros ou verifique se existem eventos cadastrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleReportGenerator;

