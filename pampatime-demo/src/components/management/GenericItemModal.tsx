import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ManagedItem, EntityFormConfig, FormField, CourseItem } from '@/types/management';
import useRealtimeOperations from '@/hooks/useRealtimeOperations';
import useRealtimeCollection from '@/hooks/useRealtimeCollection';

interface GenericItemModalProps<T extends ManagedItem> {
  isOpen: boolean; 
  onClose: () => void; 
  collectionPath: string; 
  formConfig: EntityFormConfig<T>; 
  initialItem: T | null; 
  onItemSaved: () => void; 
}

const GenericItemModal = <T extends ManagedItem>({
  isOpen,
  onClose,
  collectionPath,
  formConfig,
  initialItem,
  onItemSaved,
}: GenericItemModalProps<T>) => {
  const [formData, setFormData] = useState<Omit<T, 'id'>>(() => 
    initialItem ? (initialItem as Omit<T, 'id'>) : formConfig.defaultValues
  );

  const { addDocument, updateDocument, loading, error, success } = useRealtimeOperations<T>(collectionPath);
  
  // Carregar cursos para o dropdown se estivermos no formulário de disciplinas ou turmas
  const { data: cursos } = useRealtimeCollection<CourseItem>('cursos');

  // Estado para guardar as configurações de campo atualizadas
  const [updatedFormConfig, setUpdatedFormConfig] = useState(formConfig);

  useEffect(() => {
    if (initialItem) {
      setFormData(initialItem as Omit<T, 'id'>);
    } else {
      setFormData(formConfig.defaultValues);
    }
  }, [isOpen, initialItem, formConfig]);

  useEffect(() => {
    // Atualizar as opções do campo curso quando os cursos forem carregados
    if ((collectionPath === 'disciplinas' || collectionPath === 'turmas') && cursos.length > 0) {
      const updatedFields = formConfig.fields.map(field => {
        if (field.id === 'course' && field.type === 'select') {
          return {
            ...field,
            options: cursos.map(curso => ({
              value: curso.name, // Usar o nome do curso como valor
              label: `${curso.code} - ${curso.name}` // Mostrar código e nome
            }))
          };
        }
        return field;
      });

      setUpdatedFormConfig({
        ...formConfig,
        fields: updatedFields
      });
    } else {
      setUpdatedFormConfig(formConfig);
    }
  }, [cursos, collectionPath, formConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldType = updatedFormConfig.fields.find(field => field.id === id)?.type;
    const typedValue = fieldType === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [id]: typedValue } as Omit<T, 'id'>));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    for (const field of updatedFormConfig.fields) {
      if (field.required && (!formData[field.id as keyof Omit<T, 'id'>] || String(formData[field.id as keyof Omit<T, 'id'>]).trim() === '')) {
        alert(`Por favor, preencha o campo ${field.label}.`);
        return;
      }
    }

    try {
      if (initialItem) {
        const changedFields: Partial<Omit<T, 'id'>> = {};
        Object.keys(formData).forEach(key => {
          // Compara o valor atual do formulário com o valor inicial do item
          if (formData[key as keyof Omit<T, 'id'>] !== (initialItem as any)[key]) {
            (changedFields as any)[key] = formData[key as keyof Omit<T, 'id'>];
          }
        });

        if (Object.keys(changedFields).length > 0) {
          await updateDocument(initialItem.id, changedFields);
        } else {
          onClose();
          return;
        }
      } else {
        await addDocument(formData);
      }

      if (success) {
        alert(`${initialItem ? 'Alterações salvas' : formConfig.title.replace('Adicionar ', '')} com sucesso!`);
        onItemSaved();
        onClose(); 
      }
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message || error}`);
    }
  };

  const modalTitle = initialItem ? `Editar ${formConfig.title.replace('Adicionar ', '')}` : formConfig.title;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {initialItem ? `Altere os dados da ${modalTitle.toLowerCase()}` : `Preencha os dados da nova ${formConfig.title.replace('Adicionar ', '').toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {updatedFormConfig.fields.map((field: FormField) => (
            <div className="grid grid-cols-4 items-center gap-4" key={field.id}>
              <Label htmlFor={field.id} className="text-right">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === 'select' ? (
                <select 
                  id={field.id} 
                  value={String((formData as any)[field.id] || '')} 
                  onChange={handleChange} 
                  className="col-span-3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required={field.required}
                >
                  <option value="">Selecione...</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.id}
                  type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                  value={String((formData as any)[field.id] || '')}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="col-span-3"
                  required={field.required}
                />
              )}
            </div>
          ))}

          <DialogFooter className="flex justify-end gap-4 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading ? 'Salvando...' : (initialItem ? 'Salvar Alterações' : formConfig.title)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenericItemModal;