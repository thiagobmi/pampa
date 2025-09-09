// src/pages/SimpleHistory.tsx
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSimpleHistory } from '@/hooks/useSimpleHistory';
import { Clock, User, Calendar } from 'lucide-react';

const SimpleHistory = () => {
  const { entries, loading } = useSimpleHistory();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">Carregando histórico...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Edições</h1>
            </div>
            <p className="text-gray-600">
              Registro de todas as edições realizadas no sistema
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Total de Edições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(entries.map(e => e.user)).size}
                </div>
                <div className="text-sm text-gray-600">Usuários Únicos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {entries.length > 0 ? new Date(entries[0].timestamp).toLocaleDateString('pt-BR') : '-'}
                </div>
                <div className="text-sm text-gray-600">Última Edição</div>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Registros de Edição</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma edição registrada
                  </h3>
                  <p className="text-gray-600">
                    As edições aparecerão aqui conforme forem realizadas no sistema.
                  </p>
                </div>
              ) : (
                entries.map((entry, index) => (
                  <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{entry.user}</h3>
                            {index === 0 && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Mais recente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Realizou uma edição no sistema</p>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <div className="font-medium">{entry.dateTime}</div>
                        <div className="text-xs">
                          {Math.floor((Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24))} dias atrás
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Info */}
          {entries.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Mostrando {entries.length} registro{entries.length !== 1 ? 's' : ''} de edição
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SimpleHistory;