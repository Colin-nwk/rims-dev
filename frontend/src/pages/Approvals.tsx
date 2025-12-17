import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input } from '../components/ui/Components';
import { useApprovals, useDocuments } from '../App';
import { 
  CheckCircle, XCircle, Clock, Check, X, Eye, FileText, Download, 
  Search, Filter, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Settings2, User, FileUser, Calendar
} from 'lucide-react';
import { ApprovalItem } from '../types';
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

// --- Checkbox Component ---
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

const Approvals = () => {
  const { approvals, processApproval } = useApprovals();
  const { documents } = useDocuments();

  // --- State ---
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [reviewItem, setReviewItem] = useState<ApprovalItem | null>(null);
  const [fieldDecisions, setFieldDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // UI State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // --- Handlers ---
  const handleAction = (id: string, action: 'approve' | 'reject') => {
    processApproval(id, action === 'approve' ? 'approved' : 'rejected');
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} requests?`)) {
      selectedIds.forEach(id => {
        processApproval(id, action === 'approve' ? 'approved' : 'rejected');
      });
      setRowSelection({});
    }
  };

  const openReviewModal = (item: ApprovalItem) => {
    setReviewItem(item);
    if (item.data && item.type === 'Bio Data') {
        const initialDecisions: Record<string, 'approved' | 'rejected'> = {};
        Object.keys(item.data).forEach(key => {
            initialDecisions[key] = 'approved';
        });
        setFieldDecisions(initialDecisions);
    }
  };

  const closeReviewModal = () => {
    setReviewItem(null);
    setFieldDecisions({});
  };

  const submitBioDataReview = () => {
      if (!reviewItem) return;
      const allApproved = Object.values(fieldDecisions).every(status => status === 'approved');
      const allRejected = Object.values(fieldDecisions).every(status => status === 'rejected');
      let overallStatus: 'approved' | 'rejected' | 'partially_approved' = 'partially_approved';
      if (allApproved) overallStatus = 'approved';
      if (allRejected) overallStatus = 'rejected';
      processApproval(reviewItem.id, overallStatus, fieldDecisions);
      closeReviewModal();
  };

  const getLinkedDocument = () => {
    if (reviewItem?.type === 'Document' && reviewItem.data?.documentId) {
        return documents.find(d => d.id === reviewItem.data.documentId);
    }
    return null;
  };

  const linkedDoc = getLinkedDocument();

  // --- Table Data Preparation ---
  const filteredData = useMemo(() => {
    return approvals.filter(item => {
      // Tab Filter
      const statusMatch = activeTab === 'pending' 
        ? item.status === 'pending' 
        : item.status !== 'pending';
      
      if (!statusMatch) return false;

      // Search Filter
      const searchMatch = 
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type Filter
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;

      return searchMatch && typeMatch;
    });
  }, [approvals, activeTab, searchTerm, typeFilter]);

  // --- Table Columns ---
  const columnHelper = createColumnHelper<ApprovalItem>();

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
    columnHelper.accessor('type', {
      header: 'Request Type',
      cell: info => {
        const type = info.getValue();
        let Icon = FileText;
        let color = 'text-slate-500';
        
        if (type === 'Leave Request') { Icon = Calendar; color = 'text-purple-500'; }
        if (type === 'Profile Update') { Icon = User; color = 'text-blue-500'; }
        if (type === 'Bio Data') { Icon = FileUser; color = 'text-gold-500'; }
        if (type === 'Document') { Icon = FileText; color = 'text-emerald-500'; }

        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-medium text-navy-900 dark:text-white">{type}</span>
          </div>
        );
      }
    }),
    columnHelper.accessor('user', {
      header: 'Staff Member',
      cell: info => <span className="text-slate-700 dark:text-slate-200">{info.getValue()}</span>
    }),
    columnHelper.accessor('detail', {
      header: 'Details',
      cell: info => <span className="text-slate-500 dark:text-slate-400 text-sm truncate block max-w-xs" title={info.getValue()}>{info.getValue()}</span>
    }),
    columnHelper.accessor('date', {
      header: 'Date Submitted',
      cell: info => (
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
          <Clock className="w-3 h-3" />
          {info.getValue()}
        </div>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <Badge variant={
          info.getValue() === 'approved' ? 'success' : 
          info.getValue() === 'rejected' ? 'error' : 
          info.getValue() === 'partially_approved' ? 'warning' : 'default'
        }>
          {info.getValue().replace('_', ' ')}
        </Badge>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => {
        const item = info.row.original;
        if (item.status !== 'pending') return null;

        return (
          <div className="flex items-center justify-end gap-2">
            {(item.type === 'Bio Data' || item.type === 'Document') ? (
               <Button 
                size="sm"
                variant="secondary"
                onClick={() => openReviewModal(item)}
               >
                 Review
               </Button>
            ) : (
              <>
                <button 
                  onClick={() => handleAction(item.id, 'approve')}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-sm transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'reject')}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        );
      }
    })
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    getRowId: row => row.id,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-medium text-navy-900 dark:text-white">Approval Center</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and process staff requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-navy-700">
        <button 
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'pending' ? 'text-navy-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200'}`}
          onClick={() => { setActiveTab('pending'); setRowSelection({}); }}
        >
          Pending Requests
          <span className="ml-2 bg-gold-500 text-white dark:text-navy-900 text-[10px] px-1.5 py-0.5 rounded-full">{approvals.filter(a => a.status === 'pending').length}</span>
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-navy-900 dark:bg-gold-500"></span>}
        </button>
        <button 
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-navy-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200'}`}
          onClick={() => { setActiveTab('history'); setRowSelection({}); }}
        >
          History
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-navy-900 dark:bg-gold-500"></span>}
        </button>
      </div>

      <Card noPadding className="overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800 flex flex-col gap-4">
           {/* Top Row: Search and Columns */}
           <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search requests..." 
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
                                             {column.id}
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Leave Request">Leave Requests</option>
                <option value="Profile Update">Profile Updates</option>
                <option value="Document">Documents</option>
                <option value="Bio Data">Bio Data</option>
              </select>
           </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && activeTab === 'pending' && (
            <div className="bg-navy-50 dark:bg-navy-900 border-b border-navy-100 dark:border-navy-700 px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                 <div className="text-sm font-medium text-navy-900 dark:text-white flex items-center gap-2">
                     <span className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 text-xs px-2 py-0.5 rounded-full">{selectedCount}</span>
                     requests selected
                 </div>
                 <div className="flex gap-2">
                     <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleBulkAction('reject')}>
                         <XCircle className="w-3.5 h-3.5 mr-2" /> Reject Selected
                     </Button>
                     <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleBulkAction('approve')}>
                         <CheckCircle className="w-3.5 h-3.5 mr-2" /> Approve Selected
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
                              <p className="text-base font-medium text-slate-600 dark:text-slate-300">No requests found</p>
                              <p className="text-sm mt-1">Try adjusting your filters.</p>
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 dark:bg-navy-800 gap-4">
           <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
               <span>
                   Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
               </span>
               <span className="hidden sm:inline">•</span>
               <span className="hidden sm:inline">
                   {table.getFilteredRowModel().rows.length} Total Requests
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

      {/* Review Modal (Handles Bio Data & Documents) */}
      <Modal 
        isOpen={!!reviewItem} 
        onClose={closeReviewModal}
        title={reviewItem?.type === 'Document' ? 'Review Document' : 'Review Bio Data'}
        className="max-w-3xl"
      >
          {/* --- Document Review Logic --- */}
          {reviewItem?.type === 'Document' && (
              <div className="space-y-6">
                 {linkedDoc ? (
                     <div className="flex flex-col items-center p-8 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-200 dark:border-navy-700">
                         <div className="w-16 h-16 bg-white dark:bg-navy-800 rounded-full flex items-center justify-center shadow-xs mb-4">
                             <FileText className="w-8 h-8 text-navy-900 dark:text-white" />
                         </div>
                         <h3 className="text-xl font-medium text-navy-900 dark:text-white">{linkedDoc.title}</h3>
                         <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                             <span className="px-2 py-0.5 bg-slate-200 dark:bg-navy-700 rounded-full text-xs font-bold uppercase">{linkedDoc.type}</span>
                             <span>{linkedDoc.size}</span>
                             <span>•</span>
                             <span>Version {linkedDoc.version}</span>
                         </div>
                         <p className="mt-4 text-center text-slate-600 dark:text-slate-300 italic max-w-md">
                             "{linkedDoc.notes || 'No notes provided.'}"
                         </p>
                         
                         <Button variant="outline" className="mt-6">
                             <Download className="w-4 h-4 mr-2" /> Download to View
                         </Button>
                     </div>
                 ) : (
                     <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-navy-900/50 rounded-lg">
                         Document not found or has been deleted.
                     </div>
                 )}

                 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
                    <Button variant="ghost" onClick={closeReviewModal}>Cancel</Button>
                    <Button 
                        variant="danger" 
                        onClick={() => {
                            processApproval(reviewItem.id, 'rejected');
                            closeReviewModal();
                        }}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button 
                        onClick={() => {
                            processApproval(reviewItem.id, 'approved');
                            closeReviewModal();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                 </div>
              </div>
          )}

          {/* --- Bio Data Review Logic --- */}
          {reviewItem?.type === 'Bio Data' && reviewItem.data && (
              <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-navy-900/50 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                      Reviewing Bio Data submission for <span className="font-bold text-navy-900 dark:text-white">{reviewItem.user}</span>. 
                      Please review each field below.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                     {Object.entries(reviewItem.data).map(([key, value]) => (
                         <div 
                           key={key} 
                           className={`p-4 border rounded-lg transition-colors flex flex-col justify-between ${
                               fieldDecisions[key] === 'rejected' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700'
                           }`}
                         >
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <p className={`font-medium text-lg mt-1 ${fieldDecisions[key] === 'rejected' ? 'text-red-700 dark:text-red-400 line-through decoration-red-500' : 'text-navy-900 dark:text-white'}`}>
                                    {String(value) || '-'}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100/50 dark:border-navy-700">
                                <button 
                                  onClick={() => setFieldDecisions(prev => ({...prev, [key]: 'approved'}))}
                                  className={`flex-1 flex items-center justify-center py-1.5 rounded text-sm font-medium transition-colors ${
                                      fieldDecisions[key] === 'approved' 
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-navy-700 dark:text-slate-400 dark:hover:bg-navy-600'
                                  }`}
                                >
                                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                </button>
                                <button 
                                  onClick={() => setFieldDecisions(prev => ({...prev, [key]: 'rejected'}))}
                                  className={`flex-1 flex items-center justify-center py-1.5 rounded text-sm font-medium transition-colors ${
                                      fieldDecisions[key] === 'rejected' 
                                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-navy-700 dark:text-slate-400 dark:hover:bg-navy-600'
                                  }`}
                                >
                                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                                </button>
                            </div>
                         </div>
                     ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
                     <Button variant="ghost" onClick={closeReviewModal}>Cancel Review</Button>
                     <Button onClick={submitBioDataReview}>Finalize Review</Button>
                  </div>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default Approvals;