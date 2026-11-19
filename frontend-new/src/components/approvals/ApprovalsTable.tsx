import React, { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type Table,
  flexRender,
} from "@tanstack/react-table";
import {
  type ChangeRequest,
  getModelName,
  getStatusColor,
  getTypeColor,
  getIdentifier,
} from "@/lib/api/change-requests";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";

// Separate component for the select all checkbox to properly use hooks
const SelectAllCheckbox: React.FC<{ table: Table<ChangeRequest> }> = ({
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

interface ApprovalsTableProps {
  data: ChangeRequest[];
  isLoading?: boolean;
  onView?: (request: ChangeRequest) => void;
  onApprove?: (request: ChangeRequest) => void;
  onReject?: (request: ChangeRequest) => void;
  selectedRows?: number[];
  onSelectRows?: (ids: number[]) => void;
  showActions?: boolean;
}

export const ApprovalsTable: React.FC<ApprovalsTableProps> = ({
  data,
  isLoading = false,
  onView,
  onApprove,
  onReject,
  onSelectRows,
  showActions = true,
}) => {
  "use no memo";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get requester name
  const getRequesterName = (request: ChangeRequest): string => {
    if (request.requested_by) {
      const requester = request.requested_by;
      if (requester.name) return requester.name;
      if (requester.surname && requester.first_name) {
        return `${requester.first_name} ${requester.surname}`;
      }
      if (requester.email) return requester.email;
    }
    return "Unknown";
  };

  const columns: ColumnDef<ChangeRequest>[] = [
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
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(row.original.type)}`}
        >
          {row.original.type}
        </span>
      ),
    },
    {
      id: "model",
      header: "Model",
      accessorFn: (row) => getModelName(row.model_type),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100">
            {getModelName(row.original.model_type) === "Staff" ? (
              <User className="w-4 h-4 text-slate-600" />
            ) : (
              <FileText className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {getModelName(row.original.model_type)}
          </span>
        </div>
      ),
    },
    {
      id: "identifier",
      header: "Service No / Email",
      accessorFn: (row) => getIdentifier(row),
      cell: ({ row }) => {
        const identifier = getIdentifier(row.original);
        const isEmail = identifier.includes("@");
        return (
          <span
            className={`text-sm text-slate-900 ${isEmail ? "" : "font-mono"}`}
            title={identifier}
          >
            {identifier}
          </span>
        );
      },
    },
    {
      id: "requester",
      header: "Requested By",
      accessorFn: (row) => getRequesterName(row),
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <span className="text-slate-800 font-semibold">
            {getRequesterName(row.original)}
          </span>
          <span className="text-slate-600">
            {row.original.requested_by?.email}
          </span>
        </div>
      ),
    },
    {
      id: "preview",
      header: "Changes Preview",
      cell: ({ row }) => (
        <Button
          onClick={() => onView?.(row.original)}
          size="sm"
          title={JSON.stringify(row.original.data, null, 2)}
        >
          <Eye className="w-4 h-4 mr-1.5" /> View Details
        </Button>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.original.status)}`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isPending = row.original.status === "PENDING";
        return (
          <div className="flex items-center gap-1">
            {showActions && isPending && (
              <>
                <button
                  onClick={() => onApprove?.(row.original)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onReject?.(row.original)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: (row) => row.original.status === "PENDING",
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => String(row.id),
  });

  // Sync selection with parent
  React.useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    onSelectRows?.(selected);
  }, [table, rowSelection, onSelectRows]);

  if (isLoading) {
    return (
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header skeleton */}
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <div className="w-4 h-4 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-20 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-24 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-32 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-24 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-20 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
              </tr>
            </thead>
            {/* Body skeleton */}
            <tbody className="divide-y divide-slate-100">
              {[...Array(6)].map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="animate-pulse"
                  style={{ animationDelay: `${rowIndex * 75}ms` }}
                >
                  <td className="px-4 py-4">
                    <div className="w-4 h-4 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-16 h-6 rounded-full bg-blue-100/70" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200" />
                      <div className="w-12 h-4 rounded bg-slate-200" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-28 h-4 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-40 h-4 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className={`h-6 rounded-full w-16 ${rowIndex % 3 === 0 ? "bg-amber-100/70" : rowIndex % 3 === 1 ? "bg-emerald-100/70" : "bg-red-100/70"}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32 h-4 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="rounded-lg w-7 h-7 bg-blue-50" />
                      <div className="rounded-lg w-7 h-7 bg-emerald-50" />
                      <div className="rounded-lg w-7 h-7 bg-red-50" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center border rounded-lg border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-medium text-slate-900">
              No requests found
            </h3>
            <p className="text-sm text-slate-500">
              There are no change requests matching your criteria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-slate-50 border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-700 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-400">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4" />
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
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors ${row.getIsSelected() ? "bg-ncos-green-50" : "hover:bg-slate-50"}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
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
