import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Table,
  type Updater,
  type RowSelectionState,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
} from "lucide-react";
import {
  type StaffEducation,
  getEducationTypeColor,
  formatDateRange,
  getCertificateViewUrl,
} from "@/lib/api/staff-education";

// Separate component for the select all checkbox
const SelectAllCheckbox: React.FC<{ table: Table<StaffEducation> }> = ({
  table,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate =
        table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
    }
  }, [table]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
      className="w-4 h-4 rounded border-slate-300 text-ncos-green-900 focus:ring-ncos-green-500"
    />
  );
};

interface StaffQualificationsTableProps {
  data: StaffEducation[];
  isLoading?: boolean;
  onView?: (education: StaffEducation) => void;
  onEdit?: (education: StaffEducation) => void;
  onDelete?: (education: StaffEducation) => void;
  selectedRows?: number[];
  onSelectRows?: (ids: number[]) => void;
}

/**
 * Simplified qualifications table for staff self-service view.
 * Excludes the "Staff" column since staff are viewing their own records.
 */
export const StaffQualificationsTable: React.FC<
  StaffQualificationsTableProps
> = ({ data, isLoading = false, onView, onEdit, onDelete, onSelectRows }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Handle row selection change and notify parent directly (no useEffect needed)
  const handleRowSelectionChange = useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      setRowSelection((prev) => {
        const newSelection =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;

        // Notify parent of selection change
        if (onSelectRows) {
          const selectedIds = Object.keys(newSelection)
            .filter((key) => newSelection[key])
            .map((id) => parseInt(id, 10));
          onSelectRows(selectedIds);
        }

        return newSelection;
      });
    },
    [onSelectRows],
  );

  const columns = useMemo<ColumnDef<StaffEducation>[]>(
    () => [
      // Selection column
      {
        id: "select",
        header: ({ table }) => <SelectAllCheckbox table={table} />,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-slate-300 text-ncos-green-900 focus:ring-ncos-green-500"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      // Institution column
      {
        id: "institution",
        header: "Institution / Course",
        accessorKey: "institution",
        cell: ({ row }) => (
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-900">
                {row.original.institution}
              </p>
              {row.original.course && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {row.original.course}
                </p>
              )}
            </div>
          </div>
        ),
        enableSorting: true,
        size: 300,
      },
      // Type column
      {
        id: "type",
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEducationTypeColor()}`}
          >
            {row.original.type}
          </span>
        ),
        enableSorting: true,
        size: 140,
      },
      // Duration column
      {
        id: "duration",
        header: "Duration",
        accessorKey: "start_date",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              {formatDateRange(row.original.start_date, row.original.end_date)}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(row.original.start_date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {row.original.end_date
                ? new Date(row.original.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "Present"}
            </p>
          </div>
        ),
        enableSorting: true,
        size: 160,
      },
      // Certificate column
      {
        id: "certificate",
        header: "Certificate",
        accessorKey: "url",
        cell: ({ row }) =>
          row.original.url ? (
            <a
              href={getCertificateViewUrl(row.original.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ncos-green-700 bg-ncos-green-50 hover:bg-ncos-green-100 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic">No document</span>
          ),
        enableSorting: false,
        size: 120,
      },
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {onView && (
              <button
                onClick={() => onView(row.original)}
                className="p-1.5 text-slate-600 hover:text-ncos-green-600 hover:bg-ncos-green-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(row.original)}
                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(row.original)}
                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
        enableSorting: false,
        size: 120,
      },
    ],
    [onView, onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-ncos-green-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading your qualifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center h-64">
          <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-900 font-medium mb-1">
            No qualifications found
          </p>
          <p className="text-slate-500 text-sm">
            Add your first qualification to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b border-slate-200"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-2 cursor-pointer select-none hover:text-ncos-green-700"
                            : "flex items-center gap-2"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
