import React, { useState } from "react";
import { Field, ErrorMessage, Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Calendar,
  ChevronLeft,
  Eye,
  File,
  FileText,
  Image,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type CreateStaffDocumentFormData,
  type StaffDocument,
  type UpdateStaffDocumentFormData,
  createStaffDocumentSchema,
  updateStaffDocumentSchema,
  STAFF_DOCUMENT_TYPE_OPTIONS,
  getStaffDocumentTypeLabel,
} from "@/lib/api/staff-documents";
import { type Staff, useStaffList } from "@/lib/api/staff";
import { getChangedFields } from "@/lib/utils";
import { getFileUrl } from "@/lib/api";

interface StaffDocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStaffDocumentFormData | UpdateStaffDocumentFormData,
    documentId?: number,
  ) => void;
  document?: StaffDocument | null;
  isLoading?: boolean;
  onViewFile?: (document: StaffDocument) => void;
}

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  return dateString.split("T")[0].split(" ")[0];
}

function isImageMimeType(mimeType: string | null | undefined): boolean {
  return !!mimeType && mimeType.startsWith("image/");
}

export function StaffDocumentFormModal({
  isOpen,
  onClose,
  onSubmit,
  document,
  isLoading = false,
  onViewFile,
}: StaffDocumentFormModalProps) {
  const [stage, setStage] = useState<"search" | "form">(
    document ? "form" : "search",
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [trackedDocumentId, setTrackedDocumentId] = useState<
    number | undefined
  >(document?.id);

  const isEditing = !!document;

  if (trackedDocumentId !== document?.id) {
    setTrackedDocumentId(document?.id);
    setNewFilePreview(null);
    setIsReplacingFile(false);
    setStage(document ? "form" : "search");
  }

  const { data: staffData, isLoading: isSearchingStaff } = useStaffList(
    { page: 1, per_page: 10, search: staffSearch },
    {},
    { enabled: !isEditing && stage === "search" && staffSearch.length >= 2 },
  );

  const initialValues:
    | CreateStaffDocumentFormData
    | UpdateStaffDocumentFormData =
    isEditing && document
      ? {
          service_no: document.service_no,
          document_type: document.document_type,
          document_name: document.document_name,
          notes: document.notes || "",
          expires_at: formatDateForInput(document.expires_at),
        }
      : {
          service_no: selectedStaff?.service_no || "",
          document_type: "",
          document_name: "",
          notes: "",
          expires_at: "",
        };

  const validationSchema = isEditing
    ? toFormikValidationSchema(updateStaffDocumentSchema)
    : toFormikValidationSchema(createStaffDocumentSchema);

  function handleStaffSelect(staff: Staff) {
    setSelectedStaff(staff);
    setStage("form");
  }

  function handleBackToSearch() {
    setSelectedStaff(null);
    setStage("search");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: File | undefined) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFieldValue("file", file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveNewFile(
    setFieldValue: (field: string, value: undefined) => void,
  ) {
    setFieldValue("file", undefined);
    setNewFilePreview(null);
    if (document?.file_path) {
      setIsReplacingFile(false);
    }
  }

  function handleStartReplaceFile() {
    setIsReplacingFile(true);
  }

  function handleCancelReplaceFile(
    setFieldValue: (field: string, value: undefined) => void,
  ) {
    setFieldValue("file", undefined);
    setNewFilePreview(null);
    setIsReplacingFile(false);
  }

  function handleClose() {
    setStage(document ? "form" : "search");
    setSelectedStaff(null);
    setStaffSearch("");
    setNewFilePreview(null);
    setIsReplacingFile(false);
    onClose();
  }

  function handleFormSubmit(
    values: CreateStaffDocumentFormData | UpdateStaffDocumentFormData,
  ) {
    if (isEditing && document) {
      const changedFields = getChangedFields(
        values as Record<string, unknown>,
        initialValues as Record<string, unknown>,
        ["service_no"],
      );

      if (Object.keys(changedFields).length === 0) {
        handleClose();
        return;
      }

      onSubmit(
        changedFields as
          | CreateStaffDocumentFormData
          | UpdateStaffDocumentFormData,
        document.id,
      );
      return;
    }

    if (selectedStaff) {
      values.service_no = selectedStaff.service_no;
    }
    onSubmit(values);
  }

  function getStaffDisplayName(): string {
    if (isEditing && document?.staff) {
      return `${document.staff.surname} ${document.staff.first_name}`;
    }
    if (selectedStaff) {
      return `${selectedStaff.surname} ${selectedStaff.first_name}`;
    }
    return "";
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        stage === "search"
          ? "Select Staff Member"
          : isEditing
            ? "Edit Document"
            : "Add Document"
      }
      description={
        stage === "search"
          ? "Search and select a staff member to upload a personnel document"
          : isEditing
            ? `Update document for ${getStaffDisplayName()}`
            : `Uploading document for ${getStaffDisplayName()}`
      }
      size="xl"
    >
      {stage === "search" && !isEditing ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or service number..."
              value={staffSearch}
              onChange={(event) => setStaffSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearchingStaff ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-ncos-green-600 animate-spin" />
              </div>
            ) : staffSearch.length < 2 ? (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Enter at least 2 characters to search</p>
              </div>
            ) : staffData?.data && staffData.data.length > 0 ? (
              <div className="space-y-2">
                {staffData.data.map((staff) => (
                  <button
                    key={staff.service_no}
                    onClick={() => handleStaffSelect(staff)}
                    className="w-full p-4 border border-slate-200 rounded-lg hover:border-ncos-green-500 hover:bg-ncos-green-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {staff.photo ? (
                        <img
                          src={getFileUrl(staff.photo)}
                          alt={`${staff.surname} ${staff.first_name}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold border-2 border-ncos-green-200">
                          {staff.surname[0]}
                          {staff.first_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {staff.surname} {staff.first_name}{" "}
                          {staff.other_names || ""}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{staff.service_no}</span>
                          <span>•</span>
                          <span>{staff.present_rank}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No staff found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ setFieldValue }) => (
            <Form className="space-y-6">
              {!isEditing && selectedStaff && (
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-ncos-green-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change staff member
                </button>
              )}

              {((isEditing && document?.staff) ||
                (!isEditing && selectedStaff)) && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const staff = isEditing ? document?.staff : selectedStaff;
                      if (!staff) return null;

                      return (
                        <>
                          {staff.photo ? (
                            <img
                              src={getFileUrl(staff.photo)}
                              alt={`${staff.surname} ${staff.first_name}`}
                              className="w-12 h-12 rounded-full object-cover shrink-0"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                const fallback =
                                  event.currentTarget.nextElementSibling;
                                if (fallback) {
                                  (fallback as HTMLElement).style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold shrink-0 ${staff.photo ? "hidden" : ""}`}
                          >
                            {staff.surname[0]}
                            {staff.first_name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 wrap-break-word">
                              {staff.surname} {staff.first_name}
                            </p>
                            <p className="text-sm text-slate-500 break-all">
                              {staff.service_no}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="document_name"
                    type="text"
                    placeholder="Enter document name"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                  />
                  <ErrorMessage
                    name="document_name"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="document_type"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                  >
                    <option value="">Select document type</option>
                    {STAFF_DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="document_type"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Expiry Date
                  </label>
                  <Field
                    name="expires_at"
                    type="date"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                  />
                  <ErrorMessage
                    name="expires_at"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>
                  <Field
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="Optional notes about this document"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                  />
                  <ErrorMessage
                    name="notes"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Upload className="w-4 h-4" />
                    Document File
                  </label>
                  <div className="space-y-3">
                    {document?.file_path &&
                    !isReplacingFile &&
                    !newFilePreview ? (
                      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {isImageMimeType(document.mime_type) ? (
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <Image className="w-6 h-6 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                <File className="w-6 h-6 text-red-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                {document.document_name}
                              </p>
                              <p className="text-xs text-slate-500 uppercase">
                                {getStaffDocumentTypeLabel(
                                  document.document_type,
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {onViewFile && (
                              <button
                                type="button"
                                onClick={() => onViewFile(document)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ncos-green-700 bg-ncos-green-100 rounded-lg hover:bg-ncos-green-200 transition-colors flex-1 sm:flex-none"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleStartReplaceFile}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors flex-1 sm:flex-none"
                            >
                              Replace
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : newFilePreview ? (
                      <div className="relative p-4 border border-ncos-green-200 rounded-lg bg-ncos-green-50">
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(setFieldValue)}
                          className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          title={
                            document?.file_path
                              ? "Cancel replacement"
                              : "Remove file"
                          }
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3">
                          {newFilePreview.startsWith("data:image") ? (
                            <img
                              src={newFilePreview}
                              alt="New document preview"
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {document?.file_path
                                ? "New File Selected"
                                : "File Selected"}
                            </p>
                            <p className="text-xs text-ncos-green-600">
                              {document?.file_path
                                ? "Will replace existing file on save"
                                : "Ready to upload"}
                            </p>
                          </div>
                        </div>
                        {document?.file_path && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelReplaceFile(setFieldValue)
                            }
                            className="mt-3 text-xs text-slate-600 hover:text-slate-800 underline"
                          >
                            Cancel and keep existing file
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              PDF, JPG, JPEG, or PNG (Max {isEditing ? "10MB" : "5MB"})
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(event) =>
                              handleFileChange(event, setFieldValue)
                            }
                          />
                        </label>
                      </div>
                    )}
                    {isReplacingFile &&
                      !newFilePreview &&
                      document?.file_path && (
                        <button
                          type="button"
                          onClick={() => handleCancelReplaceFile(setFieldValue)}
                          className="text-sm text-slate-600 hover:text-slate-800 underline"
                        >
                          Cancel and keep existing file
                        </button>
                      )}
                  </div>
                  <ErrorMessage
                    name="file"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>
              </div>

              <ModalFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isEditing ? "Update" : "Add"} Document
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
}
