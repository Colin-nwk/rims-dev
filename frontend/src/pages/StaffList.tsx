import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_USERS } from '../constants';
import { Card, Input, Button, Badge, Modal, Stepper, Select, DatePicker } from '../components/ui/Components';
import { Search, Filter, Phone, MapPin, UserPlus, Edit2, Trash2, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Settings2, Download, Trash, CreditCard, User as UserIcon, Briefcase, Map, Shield } from 'lucide-react';
import { useAuth } from '../App';
import { User, Role } from '../types';
import IDCardModal from '../components/IDCardModal';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  );
}

const StaffList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // --- Filtering State with Persistence ---
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_staff_filters');
      return saved ? JSON.parse(saved).search : '';
    } catch { return ''; }
  });

  const [filterRole, setFilterRole] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_staff_filters');
      return saved ? JSON.parse(saved).role : 'all';
    } catch { return 'all'; }
  });

  const [filterStatus, setFilterStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_staff_filters');
      return saved ? JSON.parse(saved).status : 'all';
    } catch { return 'all'; }
  });

  const [filterDepartment, setFilterDepartment] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_staff_filters');
      return saved ? JSON.parse(saved).department : 'all';
    } catch { return 'all'; }
  });

  useEffect(() => {
    const filters = {
      search: searchTerm,
      role: filterRole,
      status: filterStatus,
      department: filterDepartment
    };
    localStorage.setItem('nexus_staff_filters', JSON.stringify(filters));
  }, [searchTerm, filterRole, filterStatus, filterDepartment]);

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // UI State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { id: 1, title: 'Official Info', icon: Briefcase },
    { id: 2, title: 'Personal Details', icon: UserIcon },
    { id: 3, title: 'Posting & Origin', icon: Map },
    { id: 4, title: 'System Access', icon: Shield },
  ];

  // ID Card Modal State
  const [idCardUser, setIdCardUser] = useState<User | null>(null);

  const generateStaffId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `NCoS/${year}/${random}`;
  };

  const initialFormState: Partial<User> = {
    serviceNumber: '',
    firstName: '',
    surname: '',
    otherNames: '',
    email: '',
    phone: '',
    role: 'staff',
    department: '',
    presentRank: '',
    initialRank: '',
    level: '',
    fileNumber: '',
    duty: '',
    assignedState: '',
    prison: '',
    gender: '',
    dateOfBirth: '',
    stateOfOrigin: '',
    lga: '',
    username: '',
    status: 'active'
  };
  const [formData, setFormData] = useState<Partial<User>>(initialFormState);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helpers ---
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(users.map(u => u.department))).sort();
  }, [users]);

  const canManageRole = (targetRole: Role) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; 
    if (currentUser.role === 'hr') return targetRole === 'staff';
    return false;
  };

  const canEditUser = (targetUser: User) => {
    if (currentUser?.id === targetUser.id) return false; 
    return canManageRole(targetUser.role);
  };

  const getAvailableRoles = (): Role[] => {
    if (currentUser?.role === 'admin') return ['hr', 'staff', 'admin'];
    if (currentUser?.role === 'hr') return ['staff'];
    return [];
  };

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      ...initialFormState,
      serviceNumber: generateStaffId(),
      role: currentUser?.role === 'hr' ? 'staff' : 'hr'
    });
    setCurrentStep(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setCurrentStep(0);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== userId));
      setRowSelection({});
    }
  };

  const performBulkDelete = () => {
      const selectedIds = Object.keys(rowSelection);
      if (selectedIds.length === 0) return;
      
      if (window.confirm(`Permanently delete ${selectedIds.length} users?`)) {
          setUsers(prev => prev.filter(u => !rowSelection[u.id]));
          setRowSelection({});
      }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date().toISOString().split('T')[0],
        avatarUrl: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.surname}&background=random`,
        ...formData
      } as User;
      setUsers([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // --- Table Configuration ---
  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(() => [
    {
        id: 'select',
        header: ({ table }: any) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
                className: "w-4 h-4 rounded-sm border-slate-300 dark:border-navy-600 text-navy-900 focus:ring-navy-900 focus:ring-offset-0 dark:bg-navy-900"
              }}
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected ? row.getIsSomeSelected() : false,
                onChange: row.getToggleSelectedHandler(),
                className: "w-4 h-4 rounded-sm border-slate-300 dark:border-navy-600 text-navy-900 focus:ring-navy-900 focus:ring-offset-0 dark:bg-navy-900"
              }}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    columnHelper.accessor(row => `${row.firstName} ${row.surname}`, {
      id: 'employee',
      header: 'Staff Member',
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt="" 
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-navy-600 object-cover"
            />
            <div>
              <div className="font-medium text-navy-900 dark:text-white">{user.firstName} {user.surname}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
            </div>
          </div>
        );
      },
      sortingFn: 'alphanumeric', 
    }),
    columnHelper.accessor('serviceNumber', {
        header: 'Service No.',
        cell: info => <span className="font-mono text-xs text-navy-900 dark:text-slate-200 font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('presentRank', {
      header: 'Rank & Dept',
      cell: info => {
        const user = info.row.original;
        return (
          <div>
            <div className="text-slate-900 dark:text-slate-200">{user.presentRank}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              {user.department}
              {user.level && <span className="text-[10px] bg-slate-100 dark:bg-navy-800 px-1 rounded-sm border border-slate-200 dark:border-navy-700">Lvl {user.level}</span>}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('prison', {
        header: 'Station',
        cell: info => <span className="text-sm text-slate-600 dark:text-slate-400">{info.getValue() || '-'}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <Badge variant={
          info.getValue() === 'active' ? 'success' : 
          info.getValue() === 'on-leave' ? 'warning' : 'default'
        }>
          {info.getValue()}
        </Badge>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
               onClick={() => setIdCardUser(user)}
               className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-gold-500 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
               title="View ID Card"
            >
                <CreditCard className="w-4 h-4" />
            </button>
            {canEditUser(user) && (
              <>
                <button 
                  onClick={() => handleOpenEdit(user)}
                  className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        );
      }
    })
  ], [users, currentUser]);

  // Filter Data
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesDept = filterDepartment === 'all' || user.department === filterDepartment;
      
      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, searchTerm, filterRole, filterStatus, filterDepartment]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination, columnVisibility, rowSelection },
    enableRowSelection: true,
    getRowId: row => row.id,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium text-navy-900 dark:text-white">Staff Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view all employee records</p>
        </div>
        <div className="flex gap-2">
            {currentUser?.role === 'admin' && (
                 <Button variant="outline" className="hidden sm:flex">
                    <Download className="w-4 h-4 mr-2" /> Export
                 </Button>
            )}
            <Button onClick={handleOpenCreate}>
                <UserPlus className="w-4 h-4 mr-2" />
                {currentUser?.role === 'hr' ? 'Add Staff' : 'Add User'}
            </Button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800 flex flex-col gap-4">
           {/* Top Row */}
           <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search name, Service No, email..." 
                    className="pl-9 bg-white dark:bg-navy-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-600 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                    >
                        <Settings2 className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Columns</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    
                    {showColumnDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-800 rounded-lg shadow-xl border border-slate-200 dark:border-navy-700 z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-2 py-1 mb-1">Toggle Columns</div>
                             {table.getAllLeafColumns().map(column => {
                                 if (column.id === 'select' || column.id === 'actions') return null;
                                 return (
                                     <label key={column.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-sm cursor-pointer">
                                         <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={column.getToggleVisibilityHandler()}
                                            className="rounded-sm border-slate-300 dark:border-navy-600 text-navy-900 focus:ring-navy-900"
                                         />
                                         <span className="text-sm text-slate-700 dark:text-slate-200 capitalize">
                                             {column.id === 'serviceNumber' ? 'Service No.' : column.id}
                                         </span>
                                     </label>
                                 );
                             })}
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Filters */}
           <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider mr-1">
                 <Filter className="w-3 h-3" /> Filters:
              </div>
              
              <select 
                className="h-9 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>

              <select 
                className="h-9 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select 
                className="h-9 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>

              {(filterRole !== 'all' || filterDepartment !== 'all' || filterStatus !== 'all' || searchTerm) && (
                  <button 
                    onClick={() => {
                        setFilterRole('all');
                        setFilterDepartment('all');
                        setFilterStatus('all');
                        setSearchTerm('');
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto sm:ml-2"
                  >
                      Reset Filters
                  </button>
              )}
           </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && currentUser?.role === 'admin' && (
            <div className="bg-navy-50 dark:bg-navy-900 border-b border-navy-100 dark:border-navy-700 px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                 <div className="text-sm font-medium text-navy-900 dark:text-white flex items-center gap-2">
                     <span className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 text-xs px-2 py-0.5 rounded-full">{selectedCount}</span>
                     selected
                 </div>
                 <div className="flex gap-2">
                     <Button size="sm" variant="danger" onClick={performBulkDelete}>
                         <Trash className="w-3.5 h-3.5 mr-2" /> Delete Selected
                     </Button>
                 </div>
            </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-navy-700">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 cursor-pointer select-none group first:px-4" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                            <span className="text-slate-400">
                                {{
                                asc: <ChevronUp className="w-4 h-4 text-navy-900 dark:text-white" />,
                                desc: <ChevronDown className="w-4 h-4 text-navy-900 dark:text-white" />,
                                }[header.column.getIsSorted() as string] ?? <ChevronsUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
              {table.getRowModel().rows.length === 0 ? (
                  <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center">
                              <Search className="w-10 h-10 mb-3 opacity-20" />
                              <p className="text-base font-medium text-slate-600 dark:text-slate-300">No users found</p>
                              <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                          </div>
                      </td>
                  </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                    <tr 
                        key={row.id} 
                        className={`transition-colors ${row.getIsSelected() ? 'bg-blue-50 dark:bg-navy-800/80' : 'hover:bg-slate-50 dark:hover:bg-navy-800'}`}
                    >
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 first:px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 dark:bg-navy-800 gap-4">
           <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
               <span>
                   Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
               </span>
               <span className="hidden sm:inline">•</span>
               <span className="hidden sm:inline">
                   {table.getFilteredRowModel().rows.length} Total Rows
               </span>
           </div>
           
           <div className="flex items-center gap-2">
                <select 
                  className="h-8 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 text-xs focus:outline-hidden"
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
                >
                  {[5, 10, 20, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1">
                    <button
                        className="p-1.5 rounded-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-navy-900"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-sm border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-navy-900"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
           </div>
        </div>
      </Card>

      <IDCardModal isOpen={!!idCardUser} onClose={() => setIdCardUser(null)} user={idCardUser} />

      {/* Wizard Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Staff Profile' : 'New Staff Registration'}
        className="max-w-3xl"
      >
        <div className="mb-6">
           <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <form onSubmit={handleSubmit} className="min-h-[300px]">
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Service Number" 
                  value={formData.serviceNumber}
                  onChange={e => setFormData({...formData, serviceNumber: e.target.value})}
                  required
                  disabled={!!editingUser}
                  placeholder="NCoS/YY/XXXX"
                />
                <Input 
                  label="File Number" 
                  value={formData.fileNumber}
                  onChange={e => setFormData({...formData, fileNumber: e.target.value})}
                  placeholder="File No."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                  label="Department" 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  required
                />
                 <Input 
                  label="Duty / Role Description" 
                  value={formData.duty}
                  onChange={e => setFormData({...formData, duty: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  label="Present Rank" 
                  value={formData.presentRank}
                  onChange={e => setFormData({...formData, presentRank: e.target.value})}
                  required
                />
                <Input 
                  label="Initial Rank" 
                  value={formData.initialRank}
                  onChange={e => setFormData({...formData, initialRank: e.target.value})}
                />
                <Select 
                  label="Grade Level" 
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option value="">Select</option>
                  {[...Array(17)].map((_, i) => <option key={i} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>)}
                </Select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Surname" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} required />
                <Input label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Other Names" value={formData.otherNames} onChange={e => setFormData({...formData, otherNames: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </Select>
                <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <h4 className="font-medium text-navy-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-2">Origin</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="State of Origin" value={formData.stateOfOrigin} onChange={e => setFormData({...formData, stateOfOrigin: e.target.value})} />
                  <Input label="LGA" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
                </div>
                
                <h4 className="font-medium text-navy-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-2 pt-2">Current Posting</h4>
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Assigned State" value={formData.assignedState} onChange={e => setFormData({...formData, assignedState: e.target.value})} />
                   <Input label="Correctional Facility / Station" value={formData.prison} onChange={e => setFormData({...formData, prison: e.target.value})} placeholder="e.g. Kuje Medium Security" />
                </div>
             </div>
          )}

          {currentStep === 3 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
               <div className="grid grid-cols-2 gap-4">
                 <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                 {!editingUser && <Input label="Initial Password" type="password" placeholder="Default: surname@123" disabled />}
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <Select label="System Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} disabled={currentUser?.role !== 'admin'}>
                      <option value="staff">Staff</option>
                      <option value="hr">HR Manager</option>
                      <option value="admin">Administrator</option>
                   </Select>
                   <Select label="Account Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                      <option value="retired">Retired</option>
                   </Select>
               </div>
               
               <div className="bg-blue-50 dark:bg-navy-900/50 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mt-4">
                   <p className="font-bold mb-1">Summary:</p>
                   <p>{formData.firstName} {formData.surname} ({formData.serviceNumber})</p>
                   <p>{formData.presentRank} - {formData.department}</p>
               </div>
             </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-navy-700 mt-6">
             <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
             </Button>
             
             {currentStep === steps.length - 1 ? (
                <Button type="submit">
                   {editingUser ? 'Save Changes' : 'Create Staff Record'}
                </Button>
             ) : (
                <Button type="button" onClick={nextStep}>
                   Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
             )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffList;