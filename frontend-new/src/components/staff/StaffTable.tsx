import React, { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type Table,
  flexRender,
} from "@tanstack/react-table";
import { Staff } from "@/lib/api/staff";
import { getFileUrl } from "@/lib/api";
import { getStateName } from "@/lib/helpers/genericDataHelpers";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Edit,
  Trash2,
  IdCard,
  UserCog,
  GraduationCap,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

// Separate component for the select all checkbox to properly use hooks
const SelectAllCheckbox: React.FC<{ table: Table<Staff> }> = ({ table }) => {
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

interface StaffTableProps {
  data: Staff[];
  isLoading?: boolean;
  onView?: (staff: Staff) => void;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
  onViewIDCard?: (staff: Staff) => void;
  onManageRoles?: (staff: Staff) => void;
  onViewCareer?: (staff: Staff) => void;
  selectedRows?: string[];
  onSelectRows?: (serviceNos: string[]) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onViewIDCard,
  onManageRoles,
  onViewCareer,
  // selectedRows = [],
  onSelectRows,
}) => {
  "use no memo"; // Disable React Compiler memoization - useReactTable returns unstable functions

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns: ColumnDef<Staff>[] = [
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
      accessorKey: "service_no",
      header: "Service No",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-slate-900">
          {row.original.service_no}
        </span>
      ),
    },
    {
      id: "full_name",
      header: "Full Name",
      accessorFn: (row) =>
        `${row.surname} ${row.first_name} ${row.other_names || ""}`,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.photo ? (
            <img
              src={getFileUrl(row.original.photo, row.original.updated_at)}
              alt={`${row.original.first_name} ${row.original.surname}`}
              className="object-cover w-10 h-10 border-2 rounded-full border-slate-200"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full bg-linear-to-br from-ncos-green-500 to-ncos-green-700 ${row.original.photo ? "hidden" : ""}`}
          >
            {row.original.first_name?.[0]}
            {row.original.surname?.[0]}
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {row.original.surname} {row.original.first_name}
            </div>
            {row.original.other_names && (
              <div className="text-xs text-slate-500">
                {row.original.other_names}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "present_rank",
      header: "Rank",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.original.present_rank || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {row.original.department || "N/A"}
        </span>
      ),
    },
    {
      id: "present_command",
      header: "Present Command",
      accessorFn: (row) => getStateName(row.present_command) || "",
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600">
          {(getValue() as string) || "N/A"}
        </span>
      ),
    },

    {
      id: "qualifications",
      header: "Qualifications",
      cell: ({ row }) => {
        const educationCount = row.original.education?.length || 0;
        if (educationCount > 0) {
          return (
            <Link
              to={`/qualifications?service_no=${row.original.service_no}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              View ({educationCount})
            </Link>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">
            No Qualifications
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.status === 1
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "career",
      header: "Career",
      cell: ({ row }) => (
        <button
          onClick={() => onViewCareer?.(row.original)}
          className="flex items-center gap-1 text-sm font-medium p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-ncos-green-700 transition-colors"
          title="View Career History"
        >
          <History className="w-4 h-4" /> View
        </button>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewIDCard?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
            title="View ID Card"
          >
            <IdCard className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onManageRoles?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
            title="Manage Roles"
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
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
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.service_no,
  });

  // Sync selection with parent
  React.useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.service_no);
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
                  <div className="w-20 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-20 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-3 rounded w-14 bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-24 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-3 rounded w-14 bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
              </tr>
            </thead>
            {/* Body skeleton */}
            <tbody className="divide-y divide-slate-100">
              {[...Array(8)].map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="animate-pulse"
                  style={{ animationDelay: `${rowIndex * 75}ms` }}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <div className="w-4 h-4 rounded bg-slate-200" />
                  </td>
                  {/* Service No */}
                  <td className="px-4 py-4">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                  </td>
                  {/* Full Name with Avatar */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-200 to-slate-300 shrink-0" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 rounded bg-slate-200" />
                        <div className="w-20 h-3 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  {/* Rank badge */}
                  <td className="px-4 py-4">
                    <div className="w-16 h-6 rounded-full bg-blue-100/70" />
                  </td>
                  {/* Department */}
                  <td className="px-4 py-4">
                    <div className="h-4 rounded w-28 bg-slate-200" />
                  </td>
                  {/* Email */}
                  <td className="px-4 py-4">
                    <div className="h-4 rounded w-36 bg-slate-200" />
                  </td>
                  {/* Phone */}
                  <td className="px-4 py-4">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                  </td>
                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <div
                      className={`h-6 rounded-full w-16 ${rowIndex % 3 === 0 ? "bg-red-100/70" : "bg-green-100/70"}`}
                    />
                  </td>
                  {/* Career */}
                  <td className="px-4 py-4">
                    <div className="rounded-lg w-7 h-7 bg-slate-100" />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="rounded-lg w-7 h-7 bg-indigo-50" />
                      <div className="rounded-lg w-7 h-7 bg-blue-50" />
                      <div className="rounded-lg w-7 h-7 bg-amber-50" />
                      <div className="rounded-lg w-7 h-7 bg-purple-50" />
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
      <div className="p-12 text-center border rounded-lg border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
            <UserCog className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-medium text-slate-900">
              No staff found
            </h3>
            <p className="text-sm text-slate-500">
              Try adjusting your filters or search criteria
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
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
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
