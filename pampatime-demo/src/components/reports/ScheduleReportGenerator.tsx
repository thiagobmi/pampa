// src/components/reports/ScheduleReportGenerator.tsx
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarEvent } from '@/types/Event';
import { useRealtimeCalendarEvents } from '@/hooks/useRealtimeCalendarEvents';
import { Download, Eye, Filter, FileText } from 'lucide-react';

const ScheduleReportGenerator = () => {
  const { events, loading } = useRealtimeCalendarEvents();
  const [selectedFilters, setSelectedFilters] = useState({
    professor: '',
    sala: '',
    turma: '',
    semestre: '',
    modalidade: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [reportTitle, setReportTitle] = useState('Horários');
  const [showFilters, setShowFilters] = useState(false);

  // Extrair opções únicas dos eventos
  const filterOptions = useMemo(() => {
    const professors = [...new Set(events.map(e => e.professor).filter(Boolean))].sort();
    const salas = [...new Set(events.map(e => e.room).filter(Boolean))].sort();
    const turmas = [...new Set(events.map(e => e.class).filter(Boolean))].sort();
    const semestres = [...new Set(events.map(e => e.semester).filter(Boolean))].sort();
    const modalidades = [...new Set(events.map(e => e.type).filter(Boolean))].sort();

    return { professors, salas, turmas, semestres, modalidades };
  }, [events]);

  // Filtrar eventos baseado nos filtros selecionados
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      return (!selectedFilters.professor || event.professor === selectedFilters.professor) &&
             (!selectedFilters.sala || event.room === selectedFilters.sala) &&
             (!selectedFilters.turma || event.class === selectedFilters.turma) &&
             (!selectedFilters.semestre || event.semester === selectedFilters.semestre) &&
             (!selectedFilters.modalidade || event.type === selectedFilters.modalidade);
    });
  }, [events, selectedFilters]);

  // Organizar eventos por dia e horário
  const organizedEvents = useMemo(() => {
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const timeSlots = [
      '07:30', '08:30', '09:30', '10:30', '11:30', '12:30',
      '13:30', '14:30', '15:30', '16:30', '17:30', '18:30',
      '19:30', '20:30', '21:30', '22:30'
    ];

    const schedule: { [key: string]: { [key: string]: CalendarEvent[] } } = {};
    
    // Inicializar estrutura
    daysOfWeek.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(time => {
        schedule[day][time] = [];
      });
    });

    // Organizar eventos
    filteredEvents.forEach(event => {
      const startDate = new Date(event.start);
      const dayOfWeek = startDate.getDay();
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = dayNames[dayOfWeek];
      
      const startTime = startDate.toTimeString().slice(0, 5);
      
      if (schedule[dayName] && schedule[dayName][startTime]) {
        schedule[dayName][startTime].push(event);
      }
    });

    return { schedule, daysOfWeek, timeSlots };
  }, [filteredEvents]);

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
        html += '<td class="day-column">';
        
        eventsInSlot.forEach(event => {
          html += `
            <div class="event-item">
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                ${event.professor ? `Prof: ${event.professor}<br>` : ''}
                ${event.room ? `Sala: ${event.room}<br>` : ''}
                ${event.class ? `Turma: ${event.class}<br>` : ''}
                ${event.type ? `${event.type}` : ''}
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
          ${Object.values(selectedFilters).some(v => v) ? '<p><strong>Filtros aplicados:</strong></p><ul>' : ''}
          ${selectedFilters.professor ? `<li>Professor: ${selectedFilters.professor}</li>` : ''}
          ${selectedFilters.sala ? `<li>Sala: ${selectedFilters.sala}</li>` : ''}
          ${selectedFilters.turma ? `<li>Turma: ${selectedFilters.turma}</li>` : ''}
          ${selectedFilters.semestre ? `<li>Semestre: ${selectedFilters.semestre}</li>` : ''}
          ${selectedFilters.modalidade ? `<li>Modalidade: ${selectedFilters.modalidade}</li>` : ''}
          ${Object.values(selectedFilters).some(v => v) ? '</ul>' : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
              <select
                value={selectedFilters.professor}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, professor: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {filterOptions.professors.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
              <select
                value={selectedFilters.sala}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, sala: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todas</option>
                {filterOptions.salas.map(sala => (
                  <option key={sala} value={sala}>{sala}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select
                value={selectedFilters.turma}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, turma: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todas</option>
                {filterOptions.turmas.map(turma => (
                  <option key={turma} value={turma}>{turma}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
              <select
                value={selectedFilters.semestre}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, semestre: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {filterOptions.semestres.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
              <select
                value={selectedFilters.modalidade}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, modalidade: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todas</option>
                {filterOptions.modalidades.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setSelectedFilters({
                  professor: '', sala: '', turma: '', semestre: '', modalidade: ''
                })}
                className="w-full"
              >
                Limpar Filtros
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