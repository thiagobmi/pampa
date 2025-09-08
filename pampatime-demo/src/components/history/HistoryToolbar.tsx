import { ChevronDown, ChevronUp } from "lucide-react";



interface HistoryToolbarProps {
    logCount: number; // Quantidade total de logs
    currentLogIndex: number; // Índice do log sendo visualizado
    currentLogDate: string; // Data do log sendo visualizado
    onNavigate: (direction: 'prev' | 'next') => void; // Função para navegar pelos logs
    onRestore: () => void; // Função para restaurar a versão
}

const HistoryToolbar = ({
    logCount,
    currentLogIndex,
    currentLogDate,
    onNavigate,
    onRestore
}: HistoryToolbarProps) => {

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="text-lg font-medium text-gray-800">
        {currentLogDate}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-black">
          {logCount} edições
        </button>

        <button
           onClick={() => onNavigate('prev')}
                        className="p-2 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
                        disabled={currentLogIndex >= logCount - 1} 
                    >
          <ChevronUp />
        </button>

        <button
           onClick={() => onNavigate('next')}
                        className="p-2 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
                        disabled={currentLogIndex <= 0} 
                    >
          <ChevronDown />
        </button>

        <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded">
          Restaurar versão
        </button>
      </div>
    </div>
  );
};

export default HistoryToolbar;
