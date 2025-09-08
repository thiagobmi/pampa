// src/components/calendar/SearchableFilter.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import useRealtimeCollection from '@/hooks/useRealtimeCollection';
import { TeacherItem, BookingItem, SubjectItem, SemesterItem } from '@/types/management';

type FilterOption = {
  id: string;
  display: string;
  searchText: string;
  additionalInfo?: string;
  // tipo?: 'nome' | 'codigo'; // se necessário no futuro
};

interface SearchableFilterProps {
  label: string;
  options?: string[];
  onSelect: (value: string, id?: string) => void;
  className?: string;
  value?: string;
}

const SearchableFilter: React.FC<SearchableFilterProps> = ({ 
  label, 
  options = [], 
  onSelect, 
  className = "",
  value = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedId, setSelectedId] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Fontes do RTDB
  const { data: professores } = useRealtimeCollection<TeacherItem>('professores');
  const { data: semestres } = useRealtimeCollection<SemesterItem>('semestres');
  const { data: salas } = useRealtimeCollection<BookingItem>('salas');
  const { data: disciplinas } = useRealtimeCollection<SubjectItem>('disciplinas');
  const { data: turmas } = useRealtimeCollection<any>('turmas'); // opcional

  // Listas estáticas
  const horariosBase = useMemo(() => [
    '07:30','08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:30','18:30','19:30','20:30','21:30','22:30'
  ], []);
  const diasBase = useMemo(() => (
    ['Segunda','Terça','Quarta','Quinta','Sexta']
  ), []);
  const modalidadesBase = useMemo(() => (
    ['Teórica','Prática','Assíncrona']
  ), []);

  // Construir opções dinamicamente
  const currentOptions: FilterOption[] = useMemo(() => {
    // Caso especial: Horário Final com options calculadas externamente
    if (options.length > 0 && label === 'Horário Final') {
      return options.map((hora, idx) => ({
        id: `${hora}-${idx}`,
        display: hora,
        searchText: hora.toLowerCase(),
      }));
    }

    switch (label) {
      case 'Professor':
        return (professores || []).map(p => ({
          id: p.id,
          display: p.name,
          searchText: `${p.name} ${p.email || ''}`.toLowerCase(),
          additionalInfo: p.email || ''
        }));

      case 'Semestre':
        return (semestres || []).map(s => ({
          id: s.id,
          display: s.name,
          searchText: `${s.name}`.toLowerCase(),
          additionalInfo: ''
        }));

      case 'Horário Início':
        return horariosBase.map((h, idx) => ({ id: `h_${idx}`, display: h, searchText: h.toLowerCase() }));

      case 'Horário Final':
        return horariosBase.map((h, idx) => ({ id: `hf_${idx}`, display: h, searchText: h.toLowerCase() }));

      case 'Sala':
        return (salas || []).map(s => ({
          id: s.id,
          display: s.code,
          searchText: `${s.code} ${s.name || ''} ${s.type || ''} ${s.capacity ?? ''}`.toLowerCase(),
          additionalInfo: `${s.type || 'Sala'}${s.capacity ? ` - Capacidade: ${s.capacity}` : ''}`
        }));

      case 'Dia':
        return diasBase.map((d, idx) => ({ id: `dia_${idx}`, display: d, searchText: d.toLowerCase(), additionalInfo: d }));

      case 'Turma': {
        const baseTurmas = (turmas || []).map((t: any) => t.code || t.nome || t.codigo).filter(Boolean);
        const unique = Array.from(new Set(baseTurmas.length ? baseTurmas : ['A','B','C']));
        return unique.map((t, idx) => ({ id: `tur_${idx}`, display: String(t), searchText: String(t).toLowerCase() }));
      }

      case 'Modalidade':
        return modalidadesBase.map((m, idx) => ({ id: `mod_${idx}`, display: m, searchText: m.toLowerCase(), additionalInfo: 'Modalidade de Ensino' }));

      case 'Disciplina':
        return (disciplinas || []).map(d => ({
          id: d.id,
          display: d.name,
          searchText: `${d.name} ${d.code || ''}`.toLowerCase(),
          additionalInfo: d.code || ''
        }));

      case 'Código Disciplina':
        return (disciplinas || []).map(d => ({
          id: d.id,
          display: d.code,
          searchText: `${d.code} ${d.name || ''}`.toLowerCase(),
          additionalInfo: d.name || ''
        }));

      default:
        return [];
    }
  }, [label, options, professores, semestres, salas, disciplinas, turmas, horariosBase, diasBase, modalidadesBase]);
  
  // Filter options based on search term
  const filteredOptions = currentOptions.filter(option =>
    option.searchText.includes(searchTerm.toLowerCase()) ||
    option.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: FilterOption) => {
    setSelectedValue(option.display);
    setSelectedId(option.id);
    setSearchTerm('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(option.display, option.id);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue('');
    setSelectedId('');
    setSearchTerm('');
    if (onSelect) {
      onSelect('', '');
    }
  };

  // Informações adicionais (derivadas das listas carregadas)
  const additionalInfo = useMemo(() => {
    if (!selectedValue) return '';
    switch (label) {
      case 'Professor': {
        const p = (professores || []).find(x => x.name === selectedValue);
        return p?.email || '';
      }
      case 'Sala': {
        const s = (salas || []).find(x => x.code === selectedValue);
        return s ? `${s.type || 'Sala'}${s.capacity ? ` - Capacidade: ${s.capacity}` : ''}` : '';
      }
      case 'Disciplina': {
        const d = (disciplinas || []).find(x => x.name === selectedValue);
        return d?.code || '';
      }
      case 'Código Disciplina': {
        const d = (disciplinas || []).find(x => x.code === selectedValue);
        return d?.name || '';
      }
      case 'Semestre':
        return selectedValue; // já é o nome/código
      case 'Horário Início':
      case 'Horário Final':
        return '';
      case 'Dia':
        return selectedValue;
      case 'Turma':
        return '';
      case 'Modalidade':
        return 'Modalidade de Ensino';
      default:
        return '';
    }
  }, [selectedValue, label, professores, salas, disciplinas]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          {selectedValue ? (
            <div className="flex flex-col">
              <span className="text-sm text-gray-900 truncate">{selectedValue}</span>
              {additionalInfo && (
                <span className="text-xs text-gray-500 truncate">{additionalInfo}</span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500">{label}</span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {selectedValue && (
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-w-sm">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={`Buscar ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                return (
                  <div
                    key={option.id}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="font-medium">{option.display}</div>
                    {option.additionalInfo && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.additionalInfo}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableFilter;