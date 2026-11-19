import React, { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import { getDisplayName } from "@/lib/api/auth/types";
import {
  useComplaints,
  useComplaint,
  useCreateComplaint,
  useUpdateStatus,
  useAddMessage,
  useDeleteComplaint,
  type ComplaintStatus,
  type ComplaintPriority,
  type CreateComplaintFormData,
} from "@/lib/api/complaints";
import {
  ComplaintsList,
  ComplaintChat,
  NewComplaintModal,
  type DateFilter,
} from "@/components/complaints";

const Complaints: React.FC = () => {
  const { user, hasPermission } = useAuth();

  // State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ComplaintStatus>(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | ComplaintPriority
  >("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [listWidth, setListWidth] = useState(384); // Default: lg:w-96 = 384px
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track if we're on desktop for responsive behavior
  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Build server-side filters
  const serverFilters = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(priorityFilter !== "all" && { priority: priorityFilter }),
  };

  // Queries - use server-side filtering and pagination
  const { data: complaintsData, isLoading: isLoadingList } = useComplaints(
    serverFilters,
    page,
    15, // Standard page size
  );

  const {
    data: selectedComplaint,
    isLoading: isLoadingDetail,
    refetch: refetchComplaint,
    isRefetching: isRefetchingComplaint,
  } = useComplaint(selectedId || 0, !!selectedId);

  // Mutations
  const createComplaint = useCreateComplaint();
  const updateStatus = useUpdateStatus();
  const addMessage = useAddMessage();
  const deleteComplaint = useDeleteComplaint();

  // Get complaints and pagination data from response
  const complaints = complaintsData?.data || [];
  const totalPages = complaintsData?.last_page || 1;
  const totalItems = complaintsData?.total || 0;

  // Permission check for managing complaints
  const canManageComplaints = hasPermission("complaint.resolve");

  // Handlers
  const handleSelectComplaint = (id: number) => {
    setSelectedId(id);
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const handleFilterChange = (filter: "all" | ComplaintStatus) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handlePriorityFilterChange = (filter: "all" | ComplaintPriority) => {
    setPriorityFilter(filter);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenNewModal = () => {
    setIsNewModalOpen(true);
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
  };

  const handleCreateComplaint = async (data: CreateComplaintFormData) => {
    try {
      const newComplaint = await createComplaint.mutateAsync(data);
      toast.success("Ticket created successfully!");
      setSelectedId(newComplaint.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create ticket";
      toast.error(message);
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    try {
      await addMessage.mutateAsync({
        id: selectedId,
        data: { content },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    }
  };

  const handleEscalate = async () => {
    if (!selectedId || !user) return;

    if (window.confirm("Are you sure you want to escalate this ticket?")) {
      try {
        // Add system message FIRST
        await addMessage.mutateAsync({
          id: selectedId,
          data: {
            content: `*** TICKET ESCALATED BY ${getDisplayName(user).toUpperCase() || "USER"} ***`,
          },
        });
        // Then update status
        await updateStatus.mutateAsync({
          id: selectedId,
          data: { status: "escalated" },
        });
        toast.success("Ticket escalated successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to escalate ticket";
        toast.error(message);
      }
    }
  };

  const handleResolve = async () => {
    if (!selectedId || !user) return;

    try {
      // Add system message FIRST
      await addMessage.mutateAsync({
        id: selectedId,
        data: {
          content: `*** Ticket marked as Resolved by ${getDisplayName(user) || "User"} ***`,
        },
      });
      // Then update status
      await updateStatus.mutateAsync({
        id: selectedId,
        data: { status: "resolved" },
      });
      toast.success("Ticket resolved successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resolve ticket";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteComplaint.mutateAsync(selectedId);
        setSelectedId(null);
        toast.success("Ticket deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete ticket";
        toast.error(message);
      }
    }
  };

  // Toggle collapse handler
  const handleToggleCollapse = () => {
    setIsListCollapsed(!isListCollapsed);
  };

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Constrain width between 250px and 600px
      const constrainedWidth = Math.max(250, Math.min(600, newWidth));
      setListWidth(constrainedWidth);
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove mouse event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Staff Login Navigation Button - Top Right */}
      {/* <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => window.location.href = "/staff-login"}
          className="px-4 py-2 text-sm font-medium text-white bg-ncos-green-900 rounded-lg shadow-md hover:bg-ncos-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ncos-green-900 transition-colors"
        >
          Staff Login
        </button>
      </div> */}

      <div
        ref={containerRef}
        className="h-[calc(100vh-8.5rem)] flex gap-0 relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* Left Panel - Complaints List */}
        <div
          className={`
            border-r border-slate-200 shrink-0 transition-all duration-300
            ${selectedId ? "hidden md:block" : "block"}
            ${isListCollapsed ? "md:w-0 md:min-w-0 md:overflow-hidden" : "w-full md:w-auto"}
          `}
          style={{
            width: !isListCollapsed && isDesktop ? `${listWidth}px` : undefined,
          }}
        >
          <ComplaintsList
            complaints={complaints}
            selectedId={selectedId}
            onSelect={handleSelectComplaint}
            onNewTicket={handleOpenNewModal}
            statusFilter={statusFilter}
            onFilterChange={handleFilterChange}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={handlePriorityFilterChange}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            isLoading={isLoadingList}
            isCollapsed={isListCollapsed}
            onToggleCollapse={handleToggleCollapse}
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Right Panel - Chat View */}
        <div
          className={`
            flex-1 flex flex-col min-w-0 relative
            ${selectedId ? "flex" : "hidden md:flex"}
          `}
        >
          {/* Resize Handle */}
          {!isListCollapsed && (
            <div
              className="hidden md:block absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-ncos-green-500 transition-colors z-20 group"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>
          )}

          {isLoadingDetail && selectedId ? (
            <div className="flex-1 flex items-center justify-center bg-slate-50/50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading conversation...</p>
              </div>
            </div>
          ) : (
            <ComplaintChat
              complaint={selectedComplaint || null}
              currentUserId={user.id}
              onBack={handleBack}
              onSendMessage={handleSendMessage}
              onEscalate={handleEscalate}
              onResolve={handleResolve}
              onDelete={handleDelete}
              isSending={addMessage.isPending}
              isUpdating={updateStatus.isPending}
              canManage={canManageComplaints}
              isListCollapsed={isListCollapsed}
              onToggleList={handleToggleCollapse}
              onRefresh={() => refetchComplaint()}
              isRefreshing={isRefetchingComplaint}
            />
          )}
        </div>

        {/* New Complaint Modal */}
        <NewComplaintModal
          isOpen={isNewModalOpen}
          onClose={handleCloseNewModal}
          onSubmit={handleCreateComplaint}
          isLoading={createComplaint.isPending}
        />
      </div>
    </div>
  );
};

export default Complaints;
