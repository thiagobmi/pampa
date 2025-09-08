import React, { useRef, useEffect } from 'react';

interface ClassCardProps {
  title: string;
  room?: string;
  professor?: string;
  type: string; // Para disciplinas, será o código
  className?: string;
  roomInfo?: string;
  event?: any;
}

const ClassCard: React.FC<ClassCardProps> = ({
  title,
  room,
  professor,
  type, // Para disciplinas, type será o código
  className,
  roomInfo,
  event
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Para disciplinas arrastáveis, usar sempre cor cinza
  const cardStyle = {
    backgroundColor: '#f3f4f6', // gray-100
    borderLeft: `4px solid #9ca3af`, // gray-400
    color: '#374151', // gray-700
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '8px'
  };
  
  // Create event data for FullCalendar dragging com campos vazios
  const eventData = {
    title: title,
    backgroundColor: '#f3f4f6', // gray-100
    borderColor: '#9ca3af', // gray-400
    textColor: '#374151', // gray-700
    extendedProps: {
      room: '', // Vazio
      professor: '', // Vazio
      type: '', // Vazio - será preenchido no formulário
      semester: '', // Vazio
      class: '', // Vazio
      codigo: event?.codigo || '', // Manter código para referência
    }
  };
  
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.setAttribute('data-event', JSON.stringify(eventData));
    }
  }, [title, type, event]);
  
  return (
    <div
      ref={cardRef}
      className={`class-card shadow-sm ${className || ''} cursor-move hover:shadow-lg transition-shadow`}
      style={cardStyle}
      draggable="true"
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs opacity-75 font-semibold">
        Código: {type}
      </div>
    </div>
  );
};

export default ClassCard;