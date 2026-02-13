import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Table,
  type Updater,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  type StaffDocument,
  getStaffDocumentStatusStyle,
  getStaffDocumentStatusLabel,
  getStaffDocumentTypeLabel,
} from "@/lib/api/staff-documents";
import { getFileUrl } from "@/lib/api";

const SelectAllCheckbox: React.FC<{ table: Table<StaffDocument> }> = ({
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

interface StaffDocumentsTableProps {
  data: StaffDocument[];
  isLoading?: boolean;
  onView?: (document: StaffDocument) => void;
  onDownload?: (document: StaffDocument) => void;
  onEdit?: (document: StaffDocument) => void;
  onDelete?: (document: StaffDocument) => void;
  onVerify?: (document: StaffDocument) => void;
  onReject?: (document: StaffDocument) => void;
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

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < new Date().getTime();
}

export function StaffDocumentsTable({
  data,
  isLoading = false,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onVerify,
  onReject,
  onSelectRows,
}: StaffDocumentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleRowSelectionChange = useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      setRowSelection((prev) => {
        const newSelection =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;

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

  const columns = useMemo<ColumnDef<StaffDocument>[]>(
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
          `${row.staff?.surname ?? ""} ${row.staff?.first_name ?? ""}`,
        cell: ({ row }) => {
          const staff = row.original.staff;
          if (!staff) {
            return <span className="text-slate-400">N/A</span>;
          }

          return (
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {staff.photo ? (
                  <img
                    src={getFileUrl(staff.photo)}
                    alt={`${staff.surname} ${staff.first_name}`}
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
                  className={`w-10 h-10 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold text-sm border-2 border-ncos-green-200 ${staff.photo ? "hidden" : ""}`}
                >
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
                  {staff.present_rank}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 250,
      },
      {
        id: "document",
        header: "Document",
        accessorKey: "document_name",
        cell: ({ row }) => (
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-900">
                Name: {row.original.document_name}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Type: {getStaffDocumentTypeLabel(row.original.document_type)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatFileSize(row.original.file_size)}
              </p>
            </div>
          </div>
        ),
        enableSorting: true,
        size: 260,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "verification_status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStaffDocumentStatusStyle(
              row.original.verification_status,
            )}`}
          >
            {getStaffDocumentStatusLabel(row.original.verification_status)}
          </span>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: "expiry",
        header: "Expiry",
        accessorKey: "expires_at",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              {row.original.expires_at
                ? formatDate(row.original.expires_at)
                : "No expiry"}
            </p>
            {row.original.expires_at && isExpired(row.original.expires_at) && (
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Expired
              </span>
            )}
          </div>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: "created",
        header: "Uploaded",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateTime(row.original.created_at)}
          </div>
        ),
        enableSorting: true,
        size: 160,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isPending = row.original.verification_status === "pending";
          return (
            <div className="flex items-center gap-1">
              {onView && (
                <button
                  onClick={() => onView(row.original)}
                  className="p-1.5 text-slate-600 hover:text-ncos-green-600 hover:bg-ncos-green-50 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onDownload && (
                <button
                  onClick={() => onDownload(row.original)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
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
              {onVerify && (
                <button
                  onClick={() => onVerify(row.original)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPending
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                  title={
                    isPending
                      ? "Verify"
                      : "Only pending documents can be verified"
                  }
                  disabled={!isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(row.original)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPending
                      ? "text-amber-600 hover:bg-amber-50"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                  title={
                    isPending
                      ? "Reject"
                      : "Only pending documents can be rejected"
                  }
                  disabled={!isPending}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 160,
      },
    ],
    [onView, onDownload, onEdit, onDelete, onVerify, onReject],
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
            <p className="text-slate-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-900 font-medium mb-1">No documents found</p>
          <p className="text-slate-500 text-sm text-center">
            Try adjusting your filters or upload a new document
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
                  <td
                    key={cell.id}
                    className="px-4 py-4 text-sm whitespace-nowrap"
                  >
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
