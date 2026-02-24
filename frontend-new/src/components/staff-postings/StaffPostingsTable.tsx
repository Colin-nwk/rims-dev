import React, { useEffect, useMemo, useRef, useState } from "react";
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  STAFF_POSTING_STATUS_LABELS,
  STAFF_POSTING_STATUS_STYLES,
  STAFF_POSTING_TYPE_LABELS,
  type StaffPosting,
} from "@/lib/api/staff-postings";
import { getFileUrl } from "@/lib/api";

const SelectAllCheckbox: React.FC<{ table: Table<StaffPosting> }> = ({
  table,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate =
      table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
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

interface StaffPostingsTableProps {
  data: StaffPosting[];
  isLoading?: boolean;
  onEdit?: (posting: StaffPosting) => void;
  onComplete?: (posting: StaffPosting) => void;
  onDelete?: (posting: StaffPosting) => void;
  selectedRows?: number[];
  onSelectRows?: (ids: number[]) => void;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTypeLabel(type: string): string {
  return (
    STAFF_POSTING_TYPE_LABELS[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function StaffPostingsTable({
  data,
  isLoading = false,
  onEdit,
  onComplete,
  onDelete,
  onSelectRows,
}: StaffPostingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<StaffPosting>[]>(
    () => [
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
      {
        id: "staff",
        header: "Staff",
        accessorFn: (row) =>
          row.staff
            ? `${row.staff.surname} ${row.staff.first_name}`
            : row.service_no,
        cell: ({ row }) => {
          const staff = row.original.staff;
          const serviceNo = row.original.service_no;
          if (!staff) {
            return (
              <div>
                <p className="font-medium text-slate-900">{serviceNo}</p>
                <p className="text-xs text-slate-500">Unknown staff</p>
              </div>
            );
          }

          const staffName = `${staff.surname} ${staff.first_name}`;
          const photoUrl = staff.photo ? getFileUrl(staff.photo) : "";

          return (
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={staffName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const fallback = event.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-10 h-10 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold text-sm border-2 border-ncos-green-200 ${photoUrl ? "hidden" : ""}`}
                >
                  {staff.surname?.[0]}
                  {staff.first_name?.[0]}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">
                  {staffName}
                </p>
                <p className="text-sm text-slate-500 truncate">{serviceNo}</p>
                {staff.present_rank_name ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {staff.present_rank_name}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
        size: 240,
      },
      {
        id: "station",
        header: "Station",
        accessorKey: "station_name",
        cell: ({ row }) => (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-900">
                {row.original.station_name}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {row.original.station_location || "Location not set"}
              </p>
            </div>
          </div>
        ),
        size: 260,
      },
      {
        id: "type",
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => (
          <span className="inline-flex whitespace-nowrap items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {formatTypeLabel(row.original.type)}
          </span>
        ),
        size: 140,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              STAFF_POSTING_STATUS_STYLES[row.original.status]
            }`}
          >
            {STAFF_POSTING_STATUS_LABELS[row.original.status]}
          </span>
        ),
        size: 120,
      },
      {
        id: "duration",
        header: "Duration",
        accessorKey: "start_date",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              {formatDate(row.original.start_date)}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.end_date
                ? `Ends ${formatDate(row.original.end_date)}`
                : "No end date"}
            </p>
          </div>
        ),
        size: 160,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
          return (
            <div className="flex items-center gap-1">
              {onComplete ? (
                <button
                  onClick={() => onComplete(row.original)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                  title={
                    isActive ? "Mark as completed" : "Posting is not active"
                  }
                  disabled={!isActive}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : null}
              {onEdit ? (
                <button
                  onClick={() => onEdit(row.original)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              ) : null}
              {onDelete ? (
                <button
                  onClick={() => onDelete(row.original)}
                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          );
        },
        enableSorting: false,
        size: 140,
      },
    ],
    [onComplete, onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (!onSelectRows) return;
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    onSelectRows(selectedIds);
  }, [rowSelection, table, onSelectRows]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-ncos-green-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading postings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center h-64">
          <MapPin className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-900 font-medium mb-1">
            No postings found
          </p>
          <p className="text-slate-500 text-sm">
            Try adjusting your filters or add a new posting
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
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-slate-900"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                          )
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
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
}
