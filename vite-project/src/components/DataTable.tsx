import type { CSSProperties, Key, ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  width?: string | number;
};

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => Key;
  emptyText?: string;
}

export default function DataTable<T>({ columns, data, rowKey, emptyText = "No data" }: DataTableProps<T>) {
  const th: CSSProperties = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' };
  const td: CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6' };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ ...th, width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '16px', color: '#6b7280', textAlign: 'center' }}>{emptyText}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col, idx) => (
                  <td key={idx} style={td}>
                    {col.render ? col.render(row) : String(col.accessor ? (row as any)[col.accessor] ?? '' : '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

