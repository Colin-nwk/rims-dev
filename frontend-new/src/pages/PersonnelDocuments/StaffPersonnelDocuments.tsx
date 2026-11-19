import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  StaffDocumentBulkUploadModal,
  StaffDocumentDeleteModal,
  StaffDocumentFilters,
  StaffDocumentFormModalStaff,
  StaffDocumentViewModal,
  StaffDocumentsTableStaff,
} from "@/components/staff-documents";
import {
  type CreateBulkStaffDocumentsDTO,
  type CreateStaffDocumentFormData,
  type StaffDocument,
  type StaffDocumentFilters as StaffDocumentFiltersType,
  type StaffDocumentStatus,
  type UpdateStaffDocumentFormData,
  useBulkCreateStaffDocuments,
  useCreateStaffDocument,
  useDeleteStaffDocument,
  useDownloadStaffDocument,
  useStaffDocuments,
  useUpdateStaffDocument,
  useViewStaffDocument,
} from "@/lib/api/staff-documents";
import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import { formatNumberWithCommas } from "@/lib/utils";

function createBlobUrl(blob: Blob, mimeType?: string): string {
  const fileBlob =
    mimeType && blob.type !== mimeType
      ? new Blob([blob], { type: mimeType })
      : blob;
  return window.URL.createObjectURL(fileBlob);
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getFileExtensionFromMimeType(mimeType?: string | null): string {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "file";
  }
}

function buildFallbackFilename(document: StaffDocument): string {
  const hasExtension = document.document_name.includes(".");
  if (hasExtension) return document.document_name;
  const extension = getFileExtensionFromMimeType(document.mime_type);
  return `${document.document_name}.${extension}`;
}

const StaffPersonnelDocuments = () => {
  const { user } = useAuth();
  const staffUser = user && isStaffUser(user) ? user : null;
  const serviceNo = staffUser?.service_no || "";

  const [activeTab, setActiveTab] = useState<StaffDocumentStatus>("pending");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<StaffDocumentFiltersType>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<StaffDocument | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const baseFilters = useMemo(
    () => ({
      ...filters,
      service_no: serviceNo,
    }),
    [filters, serviceNo],
  );

  const effectiveFilters = useMemo(
    () => ({
      ...baseFilters,
      verification_status: activeTab,
    }),
    [baseFilters, activeTab],
  );

  const { data, isLoading, isFetching, refetch } = useStaffDocuments(
    { page, per_page: perPage },
    effectiveFilters,
  );

  const pendingStats = useStaffDocuments(
    { page: 1, per_page: 1 },
    { ...baseFilters, verification_status: "pending" },
  );
  const verifiedStats = useStaffDocuments(
    { page: 1, per_page: 1 },
    { ...baseFilters, verification_status: "verified" },
  );
  const rejectedStats = useStaffDocuments(
    { page: 1, per_page: 1 },
    { ...baseFilters, verification_status: "rejected" },
  );

  const createDocument = useCreateStaffDocument();
  const updateDocument = useUpdateStaffDocument();
  const deleteDocument = useDeleteStaffDocument();
  const bulkCreateDocuments = useBulkCreateStaffDocuments();
  const viewDocumentFile = useViewStaffDocument();
  const downloadDocumentFile = useDownloadStaffDocument();

  const handleFiltersChange = (newFilters: StaffDocumentFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleTabChange = (status: StaffDocumentStatus) => {
    setActiveTab(status);
    setSelectedRows([]);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handleCreate = () => {
    setSelectedDocument(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (document: StaffDocument) => {
    setSelectedDocument(document);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleView = (document: StaffDocument) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const handleDelete = (document: StaffDocument) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (
    formData: CreateStaffDocumentFormData | UpdateStaffDocumentFormData,
    documentId?: number,
  ) => {
    if (documentId) {
      const updateData = formData as UpdateStaffDocumentFormData;
      updateDocument.mutate(
        {
          id: documentId,
          data: {
            ...updateData,
            document_type: updateData.document_type || undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success("Document update submitted for approval");
            setIsFormModalOpen(false);
            setSelectedDocument(null);
            setIsEditMode(false);
            refetch();
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to submit document update");
          },
        },
      );
      return;
    }

    const createData = formData as CreateStaffDocumentFormData;
    if (!createData.document_type || !createData.file) {
      toast.error("Document type and file are required");
      return;
    }
    createDocument.mutate(
      {
        service_no: createData.service_no,
        document_type: createData.document_type,
        document_name: createData.document_name,
        file: createData.file,
        notes: createData.notes,
        expires_at: createData.expires_at,
      },
      {
        onSuccess: () => {
          toast.success("Document submitted for approval");
          setIsFormModalOpen(false);
          setSelectedDocument(null);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to submit document");
        },
      },
    );
  };

  const handleBulkUpload = (payload: CreateBulkStaffDocumentsDTO) => {
    bulkCreateDocuments.mutate(payload, {
      onSuccess: () => {
        toast.success("Bulk document upload submitted for approval");
        setIsBulkModalOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to submit bulk upload");
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedDocument) return;

    deleteDocument.mutate(selectedDocument.id, {
      onSuccess: () => {
        toast.success("Document deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedDocument(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete document");
      },
    });
  };

  const handleViewFile = (document: StaffDocument) => {
    viewDocumentFile.mutate(document.id, {
      onSuccess: ({ blob, mimeType }) => {
        const fileUrl = createBlobUrl(blob, mimeType);
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to open document");
      },
    });
  };

  const handleDownloadFile = (document: StaffDocument) => {
    downloadDocumentFile.mutate(document.id, {
      onSuccess: ({ blob, filename, mimeType }) => {
        const fileUrl = createBlobUrl(blob, mimeType);
        const fallbackName = buildFallbackFilename(document);
        triggerDownload(fileUrl, filename || fallbackName);
        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to download document");
      },
    });
  };

  const documentsData = data?.data || [];
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;

  const pendingTotal = pendingStats.data?.total || 0;
  const verifiedTotal = verifiedStats.data?.total || 0;
  const rejectedTotal = rejectedStats.data?.total || 0;
  const totalCount = pendingTotal + verifiedTotal + rejectedTotal;

  if (!staffUser) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">
            Please log in to view your personnel documents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                My Personnel Documents
              </h1>
              <p className="mt-1 text-slate-600">
                Upload and track your non-education personnel documents
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 w-full sm:w-max">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalCount}
                </p>
                <p className="text-xs text-slate-500">Total Documents</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {verifiedTotal}
                </p>
                <p className="text-xs text-slate-500">Verified</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {pendingTotal}
                </p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedTotal}
                </p>
                <p className="text-xs text-slate-500">Rejected</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-1 p-1 bg-white border rounded-lg shadow-sm border-slate-200">
              {(
                ["pending", "verified", "rejected"] as StaffDocumentStatus[]
              ).map((status) => {
                const isActive = activeTab === status;
                const count =
                  status === "pending"
                    ? pendingTotal
                    : status === "verified"
                      ? verifiedTotal
                      : rejectedTotal;

                return (
                  <button
                    key={status}
                    onClick={() => handleTabChange(status)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      isActive
                        ? "bg-ncos-green-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {status === "pending" && <Clock className="w-4 h-4" />}
                    {status === "verified" && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {status === "rejected" && <XCircle className="w-4 h-4" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {count > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <div>
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {formatNumberWithCommas(data?.total as number)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="perPage" className="text-sm text-slate-600">
                Show:
              </label>
              <select
                id="perPage"
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                className="bg-white px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <StaffDocumentFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            showServiceNo={false}
          />
        </div>

        {selectedRows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mb-4 border rounded-xl bg-ncos-green-50 border-ncos-green-200">
            <span className="text-sm font-medium text-ncos-green-900">
              {selectedRows.length} document(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRows([])}
                className="flex-1 sm:flex-none"
              >
                Clear Selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => toast.info("Bulk delete is not implemented yet")}
                className="flex-1 sm:flex-none"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <StaffDocumentsTableStaff
            data={documentsData}
            isLoading={isLoading}
            onView={handleView}
            onDownload={handleDownloadFile}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRows={selectedRows}
            onSelectRows={setSelectedRows}
          />
        </div>

        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        )}

        <StaffDocumentFormModalStaff
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedDocument(null);
            setIsEditMode(false);
          }}
          onSubmit={handleFormSubmit}
          document={isEditMode ? selectedDocument : null}
          isLoading={createDocument.isPending || updateDocument.isPending}
          serviceNo={serviceNo}
          onViewFile={handleViewFile}
        />

        <StaffDocumentBulkUploadModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSubmit={handleBulkUpload}
          isLoading={bulkCreateDocuments.isPending}
          serviceNo={serviceNo}
          isStaffMode
        />

        <StaffDocumentViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onViewFile={handleViewFile}
          onDownloadFile={handleDownloadFile}
        />

        <StaffDocumentDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedDocument(null);
          }}
          onConfirm={handleConfirmDelete}
          document={selectedDocument}
          isLoading={deleteDocument.isPending}
        />
      </div>
    </div>
  );
};

export default StaffPersonnelDocuments;
