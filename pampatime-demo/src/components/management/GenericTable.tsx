import React from 'react';
import { ManagedItem } from '@/types/management';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface GenericTableProps<T extends ManagedItem> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  emptyMessage?: string;
}

const GenericTable = <T extends ManagedItem>({ data, columns, title, emptyMessage = "item não encontrado." }: GenericTableProps<T>) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${String(column.key)}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render ? column.render(item) : String(item[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GenericTable;