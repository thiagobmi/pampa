import React, { useState } from 'react';
import useRealtimeCollection from '@/hooks/useRealtimeCollection';
import { HistoryLogItem } from '@/types/management';

const ClockIcon = () => (<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>);
const UserIcon = () => (<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);

const EditHistory = () => {
  const { data, loading, error } = useRealtimeCollection<HistoryLogItem>('history-logs');
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="w-80 h-full sticky top-0 overflow-y-auto bg-white border-l border-gray-200 px-6 pt-[90px]">
        <p className="p-4 text-center text-gray-500">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 h-full sticky top-0 overflow-y-auto bg-white border-l border-gray-200 px-6 pt-[90px]">
        <p className="p-4 text-center text-red-500">Erro ao carregar histórico.</p>
      </div>
    );
  }

  // Ordena por timestamp desc se disponível, caso contrário por id (fallback)
  const historyEntries = React.useMemo(() => {
    return [...data].sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [data]);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="w-80 h-full sticky top-0 overflow-y-auto bg-white border-l border-gray-200 px-6 pt-5">
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon />
        <h2 className="text-lg font-semibold text-gray-900">Histórico de edições</h2>
      </div>
      <div className="flex flex-col gap-3">
        {historyEntries.map((entry, index) => {
          const hasDiff = entry.changed && Object.keys(entry.changed).length > 0;
          const expanded = openId === entry.id;
          return (
            <div key={entry.id} className={`p-4 rounded-md border transition-colors duration-150 ${index === 0 ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'}`}>              
              <button onClick={()=>toggle(entry.id)} className="w-full text-left">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">{entry.date}, {entry.time}</div>
                  {index === 0 && (<span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-green-100 text-green-800">Atual</span>)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon />
                  <span>{entry.action}: {entry.author}</span>
                </div>
                {hasDiff && <div className="mt-2 text-xs text-emerald-700">Clique para ver detalhes</div>}
              </button>
              {expanded && hasDiff && (
                <div className="mt-3 border-t pt-2 space-y-2 max-h-40 overflow-auto text-xs">
                  {Object.entries(entry.changed!).map(([field, change]) => (
                    <div key={field}>
                      <div className="font-semibold text-gray-700">{field}</div>
                      <div className="flex gap-2">
                        <span className="line-through text-red-500 max-w-[120px] truncate" title={String(change.before)}>{String(change.before)}</span>
                        <span className="text-green-600 max-w-[120px] truncate" title={String(change.after)}>{String(change.after)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditHistory;