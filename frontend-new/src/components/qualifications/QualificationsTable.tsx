import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Table,
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
import { getFileUrl } from "@/lib/api";

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

interface QualificationsTableProps {
  data: StaffEducation[];
  isLoading?: boolean;
  onView?: (education: StaffEducation) => void;
  onEdit?: (education: StaffEducation) => void;
  onDelete?: (education: StaffEducation) => void;
  selectedRows?: number[];
  onSelectRows?: (ids: number[]) => void;
}

export const QualificationsTable: React.FC<QualificationsTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onSelectRows,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

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
      // Staff info column
      {
        id: "staff",
        header: "Staff",
        accessorFn: (row) => `${row.staff?.surname} ${row.staff?.first_name}`,
        cell: ({ row }) => {
          const staff = row.original.staff;
          if (!staff) return <span className="text-slate-400">N/A</span>;

          return (
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {staff.photo ? (
                  <img
                    src={getFileUrl(staff.photo)}
                    alt={`${staff.surname} ${staff.first_name}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold text-sm border-2 border-ncos-green-200 ${staff.photo ? 'hidden' : ''}`}>
                  {staff.surname[0]}
                  {staff.first_name[0]}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">
                  {staff.surname} {staff.first_name}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {staff.service_no}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {staff.present_rank_name}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 250,
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
        size: 280,
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
        size: 120,
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
        size: 150,
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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  // Sync row selection with parent
  useEffect(() => {
    if (onSelectRows) {
      const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);
      onSelectRows(selectedIds);
    }
  }, [rowSelection, table, onSelectRows]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-ncos-green-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading qualifications...</p>
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
            Try adjusting your filters or add a new qualification
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
                  <td key={cell.id} className="px-4 py-4 text-sm whitespace-nowrap">
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
