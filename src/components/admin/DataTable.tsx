import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    searchable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    keyExtractor,
    emptyMessage = 'Veri bulunamadı',
    searchPlaceholder = 'Ara...',
    showSearch = true
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filtering
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;

        return columns
            .filter(col => col.searchable !== false)
            .some(col => {
                const value = col.key as keyof T;
                const cellValue = item[value];
                return String(cellValue).toLowerCase().includes(searchTerm.toLowerCase());
            });
    });

    // Sorting
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        const column = columns.find(col => col.key === key);
        if (!column?.sortable) return;

        setSortConfig(current => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    };

    return (
        <div className="w-full">
            {/* Search Bar */}
            {showSearch && (
                <div className="mb-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(column => (
                                <th
                                    key={String(column.key)}
                                    onClick={() => handleSort(String(column.key))}
                                    className={`px-4 py-3 text-left text-xs font-bold uppercase text-gray-500 tracking-wider ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable !== false && (
                                            <div className="flex flex-col">
                                                <ChevronUp
                                                    size={12}
                                                    className={`-mb-1 ${sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                                        ? 'text-amber-600'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                                <ChevronDown
                                                    size={12}
                                                    className={`-mt-1 ${sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                                        ? 'text-amber-600'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-gray-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map(item => (
                                <tr
                                    key={keyExtractor(item)}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map(column => (
                                        <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-900">
                                            {column.render
                                                ? column.render(item)
                                                : String(item[column.key as keyof T])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results Count */}
            {sortedData.length > 0 && (
                <div className="mt-3 text-sm text-gray-500">
                    {sortedData.length} sonuç gösteriliyor
                    {searchTerm && ` (${data.length} içinden)`}
                </div>
            )}
        </div>
    );
}
