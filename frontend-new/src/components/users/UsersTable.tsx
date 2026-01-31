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
  UserCog,
  Shield,
  Loader2,
} from "lucide-react";
import {
  type AdminUser,
  getUserStatusColor,
  getUserInitials,
} from "@/lib/api/users";

// Separate component for the select all checkbox
const SelectAllCheckbox: React.FC<{ table: Table<AdminUser> }> = ({
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

interface UsersTableProps {
  data: AdminUser[];
  isLoading?: boolean;
  currentUserId?: number;
  onView?: (user: AdminUser) => void;
  onEdit?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
  onManageRoles?: (user: AdminUser) => void;
  selectedRows?: number[];
  onSelectRows?: (ids: number[]) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  data,
  isLoading = false,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onManageRoles,
  onSelectRows,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<AdminUser>[]>(
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
      // User info column
      {
        id: "user",
        header: "User",
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const isCurrentUser = currentUserId === row.original.id;
          return (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-ncos-green-500 to-ncos-green-700 flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials(row.original.name)}
                </div>
                {isCurrentUser && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-ncos-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">You</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  {row.original.name}
                  {isCurrentUser && (
                    <span className="text-xs px-1.5 py-0.5 bg-ncos-green-100 text-ncos-green-700 rounded font-medium">
                      You
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">{row.original.email}</p>
              </div>
            </div>
          );
        },
      },
      // Status column
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getUserStatusColor(
              row.original.status,
            )}`}
          >
            {row.original.status}
          </span>
        ),
      },
      // Roles column
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => {
          const roles = row.original.roles || [];
          if (roles.length === 0) {
            return (
              <span className="text-sm text-slate-400 italic">No roles</span>
            );
          }
          return (
            <div className="flex gap-1 whitespace-nowrap">
              {roles.slice(0, 2).map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800"
                >
                  <Shield className="w-3 h-3" />
                  {role.name}
                </span>
              ))}
              {roles.length > 2 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  +{roles.length - 2} more
                </span>
              )}
            </div>
          );
        },
      },
      // Created date column
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isCurrentUser = currentUserId === row.original.id;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView?.(row.original)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit?.(row.original)}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="Edit User"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onManageRoles?.(row.original)}
                className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
                title="Manage Roles"
              >
                <UserCog className="w-4 h-4" />
              </button>
              {!isCurrentUser && (
                <button
                  onClick={() => onDelete?.(row.original)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [currentUserId, onView, onEdit, onDelete, onManageRoles],
  );

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
    getRowId: (row) => String(row.id),
  });

  // Sync selection with parent
  useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    onSelectRows?.(selected);
  }, [table, rowSelection, onSelectRows]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center text-slate-400">
          <UserCog className="w-12 h-12 mb-3 opacity-50" />
          <p className="font-medium">No users found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or create a new user
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
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
                className={`hover:bg-slate-50 transition-colors ${
                  row.getIsSelected() ? "bg-ncos-green-50" : ""
                }`}
              >
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
