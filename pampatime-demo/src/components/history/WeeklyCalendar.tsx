import React, { useState } from 'react';
import useRealtimeCollection from '@/hooks/useRealtimeCollection';
import { TimetableDay } from '@/types/management';
import { updateTimetableEvent } from '@/lib/firebase'; 

const ChevronLeft = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
);

const WeeklyCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDays = React.useMemo(() => {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const week = [];
    
    let day = new Date(currentWeek);
    day.setDate(day.getDate() - day.getDay() + (day.getDay() === 0 ? -6 : 1));

    for (let i = 0; i < 7; i++) {
      week.push({
        date: day.toLocaleDateString('pt-BR'),
        dayName: days[day.getDay() === 0 ? 6 : day.getDay() - 1],
        events: [],
      });
      day.setDate(day.getDate() + 1);
    }
    return week;
  }, [currentWeek]);
  

  const { data: weeklyData, loading, error } = useRealtimeCollection<TimetableDay>('timetables');
  
  const timeSlots = [
    '7:30','8:30', '9:30', '10:30', '11:30', '12:30', '13:30', '14:30',
    '15:30', '16:30', '17:30', '18:30', '19:30', '20:30', '21:30'
  ];
 

  const getEventColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 border-blue-300 text-blue-900',
      green: 'bg-green-100 border-green-300 text-green-900',
      purple: 'bg-purple-100 border-purple-300 text-purple-900',
      orange: 'bg-orange-100 border-orange-300 text-orange-900'
    };
    return colors[color] || colors.blue;
  };

  const navigateWeek = (direction: string) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  // --- NOVO: Função para simular a edição de um evento e registrar no histórico ---
  const handleEditEvent = async (eventId: string, newTitle: string) => {
    // Você pode ter um modal ou formulário para pegar os dados de edição
    const updatedData = { title: newTitle }; 
    const author = "Você"; // Ou o usuário logado
    const action = "Edição de evento";

    await updateTimetableEvent(eventId, updatedData, author, action);
  };
  // --- FIM NOVO ---

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-0">
    

      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-100">
          <div className="p-4 text-sm font-medium text-gray-600 border-r border-gray-200">Hora</div>
          {weekDays.map((day, i) => ( 
            <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{day.dayName}</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{day.date.split('/')[0]}</div>
            </div>
          ))}
        </div>

        <div className="relative">
          {timeSlots.map((time, timeIdx) => (
            <div key={timeIdx} className="grid grid-cols-8 border-b border-gray-200 min-h-[60px]">
              <div className="p-3 text-sm text-gray-500 border-r border-gray-200 bg-gray-100 flex items-start">
                {time}
              </div>
              {weeklyData.map((day, dayIdx) => {
                const events = day.events.filter(event => event.time === time);
                return (
                  <div key={dayIdx} className="p-2 border-r border-gray-200 last:border-r-0">
                    {events.map((event) => (
                      // Exemplo: um clique no evento dispara a edição
                      <div 
                        key={event.id}
                        onClick={() => handleEditEvent(event.id, `Novo Título para ${event.id}`)}
                        className={`p-3 border rounded mb-2 text-sm font-medium ${getEventColorClass(event.color)} cursor-pointer`}
                      >
                        <div>{event.title}</div>
                        {event.location && (<div className="text-xs opacity-75">{event.location}</div>)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;