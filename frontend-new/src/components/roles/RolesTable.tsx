import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { type Role, getScopeDescription } from "@/lib/api/roles";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Trash2,
  Shield,
  Globe,
  MapPin,
} from "lucide-react";

interface RolesTableProps {
  data: Role[];
  isLoading?: boolean;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onManagePermissions,
}) => {
  "use no memo";

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-900">
            {row.original.name}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {row.original.slug}
          </span>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: ({ row }) => {
        const role = row.original;
        const isScopeless = role.scopeless;

        return (
          <div className="flex items-center gap-2">
            {isScopeless ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <Globe className="w-3 h-3" />
                Full Access
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]" title={getScopeDescription(role)}>
                  {getScopeDescription(role)}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        const displayCount = Math.min(permissions.length, 3);
        const remaining = permissions.length - displayCount;

        return (
          <div className="flex flex-wrap items-center gap-1">
            {permissions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No permissions
              </span>
            ) : (
              <>
                {permissions.slice(0, displayCount).map((perm) => (
                  <span
                    key={perm.id}
                    className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full"
                    title={perm.description || perm.name}
                  >
                    {perm.name}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-ncos-green-100 text-ncos-green-800 rounded-full">
                    +{remaining} more
                  </span>
                )}
              </>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onManagePermissions?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
            title="Manage Permissions"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
            title="Edit Role"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(row.original)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="Delete Role"
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
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => String(row.id),
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="w-20 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-24 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="w-16 h-3 rounded bg-slate-300 animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="animate-pulse"
                  style={{ animationDelay: `${rowIndex * 75}ms` }}
                >
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="w-32 h-4 rounded bg-slate-200" />
                      <div className="w-24 h-3 rounded bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-24 h-6 rounded-full bg-purple-100/70" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <div className="w-16 h-5 rounded-full bg-slate-100" />
                      <div className="w-16 h-5 rounded-full bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="rounded-lg w-7 h-7 bg-emerald-50" />
                      <div className="rounded-lg w-7 h-7 bg-amber-50" />
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
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-medium text-slate-900">
              No roles found
            </h3>
            <p className="text-sm text-slate-500">
              Create your first role to get started
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
                  <td key={cell.id} className="px-4 py-3">
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
