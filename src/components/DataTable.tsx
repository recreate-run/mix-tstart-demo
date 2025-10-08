interface DataTableProps {
  data: string[][];
  maxRows?: number;
}

export function DataTable({ data, maxRows = 10 }: DataTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = data[0];
  const rows = data.slice(1, maxRows + 1);
  const hasMore = data.length > maxRows + 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {maxRows} of {data.length - 1} rows
        </p>
      )}
    </div>
  );
}
