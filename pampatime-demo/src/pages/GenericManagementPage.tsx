import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilter from "@/components/management/SearchFilter";
import GenericTable, { TableColumn } from "@/components/management/GenericTable";
import ManagementNav from "@/components/management/ManagementNav";
import GenericItemModal from "@/components/management/GenericItemModal";
import { ManagedItem } from "@/types/management";
import useRealtimeCollection from "@/hooks/useRealtimeCollection";
import useRealtimeOperations from "@/hooks/useRealtimeOperations";
import { entityFormConfigs } from '@/config/formConfig';
import Papa from 'papaparse';

interface GenericManagementPageProps<T extends ManagedItem> {
  title: string;
  collectionPath: string; 
  searchPlaceholder?: string;
  columns: TableColumn<T>[];
  addBtnLabel: string;
}

const GenericManagementPage = (props: GenericManagementPageProps<any>) => {
  const {
    title,
    collectionPath,
    searchPlaceholder,
    columns,
    addBtnLabel,
  } = props;

  const { data: fetchedData, loading, error: fetchError } = useRealtimeCollection<any>(collectionPath);
  const { deleteDocument, updateDocument, addDocument, bulkAddDocuments, loading: opLoading, error: opError, success: opSuccess } = useRealtimeOperations<any>(collectionPath);

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const currentFormConfig = entityFormConfigs[collectionPath];

  useEffect(() => {
    setFilteredData(fetchedData);
  }, [fetchedData]);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredData(fetchedData);
      return;
    }
    const lowerCaseTerm = term.toLowerCase();
    const filtered = fetchedData.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === 'string' && value.toLowerCase().includes(lowerCaseTerm)
      )
    );
    setFilteredData(filtered);
  };

  const handleItemSaved = () => {
    console.log(`Item em ${collectionPath} salvo com sucesso!`);
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleEdit = (item: any) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      await deleteDocument(itemId);
      if (opSuccess) {
          console.log("Item excluído com sucesso!");
      } else if (opError) {
          console.error("Erro ao excluir item:", opError);
      }
    }
  };
  
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[]; 
          if (data.length > 0) {
            console.log("Dados do CSV parseados:", data);
            const dataToSave = data.map(item => {
              const { id, ...rest } = item;
              return rest;
            });
            bulkAddDocuments(dataToSave);
          }
        },
      });
    }
  };

  const dynamicColumns = columns.map(col => {
    if (col.key === 'id' && col.header === 'Ações') {
      return {
        ...col,
        render: (item: any) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Editar <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:underline flex items-center gap-1"
            >
              Excluir <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ),
      };
    }
    return col;
  });

  if (loading || opLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
          <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-end gap-4">
              <ManagementNav className="mx-auto" />
              <SearchFilter placeholder={searchPlaceholder} onSearch={() => {}} />
              <button className="w-64 px-6 py-2 bg-green-500 text-white rounded-md flex items-center justify-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {addBtnLabel}
              </button>
          </div>
        <main className="flex-grow container mx-auto px-4 py-10 mt-12 text-center text-lg">
          {loading ? `Carregando ${title.toLowerCase()}...` : "Processando operação..."}
        </main>
        <Footer />
      </div>
    );
  }

  if (fetchError || opError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
          <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-end gap-4">
              <ManagementNav className="mx-auto" />
              <SearchFilter placeholder={searchPlaceholder} onSearch={() => {}} />
              <button className="w-64 px-6 py-2 bg-green-500 text-white rounded-md flex items-center justify-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {addBtnLabel}
              </button>
          </div>
        <main className="flex-grow container mx-auto px-4 py-10 mt-12 text-center text-red-600 text-lg">
          Erro: {fetchError || opError}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
        <div className="container mx-auto flex flex-col md:flex-row md:items-center gap-4 pt-5">
          <ManagementNav className="mx-auto" />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <SearchFilter
              onSearch={handleSearch}
              placeholder={searchPlaceholder}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center justify-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold">Importar CSV</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCsvUpload} 
                  className="hidden" 
                />
              </label>
              
              <button
                onClick={handleAdd}
                className="flex-1 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {addBtnLabel}
              </button>
            </div>
          </div>
        </div>

      <main className="flex-grow container mx-auto px-4 py-10 mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        {filteredData.length === 0 ? (
           <p className="text-gray-500 text-center py-8">Nenhum registro de {title.toLowerCase().replace('gerenciar ', '').replace(/s$/, '')} encontrado.</p>
        ) : (
           <GenericTable data={filteredData} columns={dynamicColumns} />
        )}
      </main>
      <Footer />
      {currentFormConfig && (
        <GenericItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          collectionPath={collectionPath}
          formConfig={currentFormConfig}
          initialItem={itemToEdit}
          onItemSaved={handleItemSaved}
        />
      )}
    </div>
  );
};

export default GenericManagementPage;