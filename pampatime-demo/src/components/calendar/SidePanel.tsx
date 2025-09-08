// src/components/SidePanel.tsx - Fixed version
import React from 'react';
import FilterPanel from './FilterPanel';
import ClassesPanel from './ClassesPanel';
import { CalendarEvent } from '@/types/Event';

interface SidePanelProps {
  selectedEvent?: CalendarEvent | null;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventAdd?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string | number) => void;
  onClearSelection?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedEvent,
  onEventUpdate,
  onEventAdd,
  onEventDelete,
  onClearSelection
}) => {
  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden min-h-[600px]">
      {/* Filter Panel - Dynamic size based on content, but with limits */}
      <div className={`flex-shrink-0 overflow-hidden ${
        selectedEvent 
          ? 'max-h-[420px] lg:max-h-[450px]' // When editing, take more space
          : 'max-h-[320px] lg:max-h-[350px]' // When not editing, take less space
      }`}>
        <div className="h-full overflow-y-auto">
          <FilterPanel 
            selectedEvent={selectedEvent}
            onEventUpdate={onEventUpdate}
            onEventAdd={onEventAdd}
            onEventDelete={onEventDelete}
            onClearSelection={onClearSelection}
          />
        </div>
      </div>
      
      {/* Classes Panel - Takes remaining space with guaranteed minimum */}
      <div className="flex-1 min-h-[200px] overflow-hidden">
        <ClassesPanel />
      </div>
    </div>
  );
};

export default SidePanel;