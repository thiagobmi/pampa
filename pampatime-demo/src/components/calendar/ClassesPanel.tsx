// src/components/ClassesPanel.tsx
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import ClassCard from './ClassCard';
import { Search, Filter, X } from 'lucide-react';
import { Draggable } from '@fullcalendar/interaction';
import useRealtimeCollection from '@/hooks/useRealtimeCollection';
import { SubjectItem, CourseItem } from '@/types/management';

interface ClassesPanelProps {
  // Removemos a dependência de existingEvents
}

const ClassesPanel: React.FC<ClassesPanelProps> = () => {
  const draggableContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState('');
  const [showCourseFilter, setShowCourseFilter] = React.useState(false);

  useEffect(() => {
    if (draggableContainerRef.current) {
      // Inicializa o Draggable do FullCalendar
      new Draggable(draggableContainerRef.current, {
        itemSelector: '.class-card',
        eventData: function(eventEl) {
          const eventData = eventEl.getAttribute('data-event');
          return eventData ? JSON.parse(eventData) : null;
        }
      });
    }
  }, []);

  // Obter disciplinas e cursos da base em tempo real
  const { data: allDisciplinas } = useRealtimeCollection<SubjectItem>('disciplinas');
  const { data: allCursos } = useRealtimeCollection<CourseItem>('cursos');

  // Filtrar disciplinas baseado na pesquisa e curso selecionado
  const filteredDisciplinas = React.useMemo(() => {
    if (!allDisciplinas) return [];
    
    let filtered = allDisciplinas;
    
    // Filtrar por curso se selecionado
    if (selectedCourse) {
      filtered = filtered.filter(disciplina => 
        disciplina.course === selectedCourse
      );
    }
    
    // Filtrar por termo de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(disciplina =>
        (disciplina.name || '').toLowerCase().includes(searchLower) ||
        (disciplina.code || '').toLowerCase().includes(searchLower) ||
        (disciplina.course || '').toLowerCase().includes(searchLower) ||
        (disciplina.tipoSalaPreferencial || '').toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [allDisciplinas, searchTerm, selectedCourse]);

  // Obter lista de cursos únicos das disciplinas para o filtro
  const availableCourses = React.useMemo(() => {
    if (!allDisciplinas) return [];
    const coursesSet = new Set(allDisciplinas.map(d => d.course).filter(Boolean));
    return Array.from(coursesSet).sort();
  }, [allDisciplinas]);

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    setShowCourseFilter(false);
  };

  const clearFilters = () => {
    setSelectedCourse('');
    setSearchTerm('');
  };

  return (
    <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-base font-semibold text-gray-700">
            Disciplinas Disponíveis ({filteredDisciplinas.length})
          </h3>
          {(selectedCourse || searchTerm) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        {/* Filtro por Curso */}
        <div className="mb-2 relative">
          <Button
            variant="outline"
            onClick={() => setShowCourseFilter(!showCourseFilter)}
            className="w-full justify-between h-9 text-sm font-normal bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700">
                {selectedCourse || 'Todos os cursos'}
              </span>
            </div>
            <svg 
              className={`h-4 w-4 transition-transform ${showCourseFilter ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          
          {showCourseFilter && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              <div 
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                onClick={() => handleCourseSelect('')}
              >
                <div className="font-medium">Todos os cursos</div>
                <div className="text-xs text-gray-500">Mostrar todas as disciplinas</div>
              </div>
              {availableCourses.map((course, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                    selectedCourse === course ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="font-medium">{course}</div>
                  <div className="text-xs text-gray-500">
                    {allDisciplinas?.filter(d => d.course === course).length || 0} disciplinas
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Busca por texto */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, código..." 
            className="pl-8 pr-10 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Indicador de filtros ativos */}
        {selectedCourse && (
          <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Filter className="h-3 w-3 mr-1" />
            <span>Filtrando por: {selectedCourse}</span>
          </div>
        )}
      </div>
        
      <div ref={draggableContainerRef} className="space-y-2 overflow-y-auto flex-1 pr-1">
        {filteredDisciplinas.length > 0 ? (
          filteredDisciplinas.map((disciplina) => (
            <ClassCard 
              key={`disciplina-${disciplina.id}`}
              title={disciplina.name}
              type={disciplina.code} // Usar código como tipo para exibição
              // Adicionar informação do curso no card
              roomInfo={disciplina.course}
              // Passar dados mínimos como evento para arrastar
              event={{
                id: `disciplina-${disciplina.id}`,
                title: disciplina.name,
                type: '', // Deixar vazio - será preenchido no formulário
                room: '',
                professor: '',
                semester: '',
                class: '',
                codigo: disciplina.code,
                course: disciplina.course
              }}
              className="hover:shadow-md transition-shadow"
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {selectedCourse || searchTerm ? (
              <div>
                <p className="text-sm mb-2">Nenhuma disciplina encontrada</p>
                <div className="text-xs space-y-1">
                  {selectedCourse && (
                    <p>Curso: {selectedCourse}</p>
                  )}
                  {searchTerm && (
                    <p>Busca: "{searchTerm}"</p>
                  )}
                </div>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-blue-500 hover:underline mt-2"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-2">Nenhuma disciplina disponível</p>
                <p className="text-xs">Verifique os dados acadêmicos</p>
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ClassesPanel;