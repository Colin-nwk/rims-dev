import { useState } from "react";
import { Field, FieldArray, Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Calendar,
  ChevronLeft,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type BulkStaffDocumentFormItem,
  type CreateBulkStaffDocumentsDTO,
  bulkStaffDocumentSchema,
  getStaffDocumentTypeSelectEntries,
} from "@/lib/api/staff-documents";
import { type Staff, useStaffList } from "@/lib/api/staff";
import { getFileUrl } from "@/lib/api";

interface StaffDocumentBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBulkStaffDocumentsDTO) => void;
  isLoading?: boolean;
  serviceNo?: string;
  isStaffMode?: boolean;
}

interface BulkUploadFormValues {
  service_no: string;
  documents: BulkStaffDocumentFormItem[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const emptyDocument: BulkStaffDocumentFormItem = {
  document_type: "",
  document_name: "",
  notes: "",
  expires_at: "",
  file: undefined,
};

export function StaffDocumentBulkUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  serviceNo,
  isStaffMode = false,
}: StaffDocumentBulkUploadModalProps) {
  const [stage, setStage] = useState<"search" | "form">(
    isStaffMode ? "form" : "search",
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearch, setStaffSearch] = useState("");

  const { data: staffData, isLoading: isSearchingStaff } = useStaffList(
    { page: 1, per_page: 10, search: staffSearch },
    {},
    { enabled: !isStaffMode && stage === "search" && staffSearch.length >= 2 },
  );

  const initialValues: BulkUploadFormValues = {
    service_no: serviceNo || selectedStaff?.service_no || "",
    documents: [emptyDocument],
  };

  function handleStaffSelect(staff: Staff) {
    setSelectedStaff(staff);
    setStage("form");
  }

  function handleBackToSearch() {
    setSelectedStaff(null);
    setStage("search");
  }

  function handleClose() {
    setStage(isStaffMode ? "form" : "search");
    setSelectedStaff(null);
    setStaffSearch("");
    onClose();
  }

  function handleSubmit(values: BulkUploadFormValues) {
    const resolvedServiceNo = serviceNo || selectedStaff?.service_no || "";
    onSubmit({
      service_no: resolvedServiceNo,
      documents: values.documents.map((doc) => ({
        document_type:
          doc.document_type as CreateBulkStaffDocumentsDTO["documents"][number]["document_type"],
        document_name: doc.document_name,
        notes: doc.notes || undefined,
        expires_at: doc.expires_at || undefined,
        file: doc.file as File,
      })),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        stage === "search" ? "Select Staff Member" : "Bulk Upload Documents"
      }
      description={
        stage === "search"
          ? "Search and select a staff member to upload multiple personnel documents"
          : "Upload multiple personnel documents at once (max 10 files)"
      }
      size="xl"
    >
      {stage === "search" && !isStaffMode ? (
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
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback)
                              (fallback as HTMLElement).style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold border-2 border-ncos-green-200 ${staff.photo ? "hidden" : ""}`}
                      >
                        {staff.surname[0]}
                        {staff.first_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {staff.surname} {staff.first_name}{" "}
                          {staff.other_names || ""}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{staff.service_no}</span>
                          <span>•</span>
                          <span>{staff.present_rank_name}</span>
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
          validationSchema={toFormikValidationSchema(bulkStaffDocumentSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form className="space-y-6">
              {selectedStaff && !isStaffMode && (
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-ncos-green-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change staff member
                </button>
              )}
              {selectedStaff && !isStaffMode && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Uploading for{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedStaff.surname} {selectedStaff.first_name} (
                      {selectedStaff.service_no})
                    </span>
                  </p>
                </div>
              )}

              <FieldArray name="documents">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700">
                          Documents
                        </h4>
                        <p className="text-xs text-slate-500">
                          Add up to 10 files for this staff member
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => push({ ...emptyDocument })}
                        disabled={values.documents.length >= 10}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </div>

                    {values.documents.map((doc, index) => {
                      const docErrors = (errors.documents?.[index] ||
                        {}) as Partial<
                        Record<keyof BulkStaffDocumentFormItem, string>
                      >;
                      const docTouched = (touched.documents?.[index] ||
                        {}) as Partial<
                        Record<keyof BulkStaffDocumentFormItem, boolean>
                      >;

                      return (
                        <div
                          key={`doc-${index}`}
                          className="p-4 border border-slate-200 rounded-xl space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-700">
                              Document {index + 1}
                            </h4>
                            {values.documents.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Document Type{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                as="select"
                                name={`documents.${index}.document_type`}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                              >
                                <option value="">Select document type</option>
                                {getStaffDocumentTypeSelectEntries(
                                  doc.document_type,
                                ).map((entry) => (
                                  <option
                                    key={entry.key}
                                    value={entry.value}
                                  >
                                    {entry.label}
                                  </option>
                                ))}
                              </Field>
                              {docErrors.document_type &&
                                docTouched.document_type && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {docErrors.document_type}
                                  </p>
                                )}
                            </div>

                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <FileText className="w-4 h-4" />
                                Document Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                name={`documents.${index}.document_name`}
                                type="text"
                                placeholder="Enter document name"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                              />
                              {docErrors.document_name &&
                                docTouched.document_name && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {docErrors.document_name}
                                  </p>
                                )}
                            </div>

                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                Expiry Date
                              </label>
                              <Field
                                name={`documents.${index}.expires_at`}
                                type="date"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Notes
                              </label>
                              <Field
                                name={`documents.${index}.notes`}
                                type="text"
                                placeholder="Optional notes"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <Upload className="w-4 h-4" />
                              File <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center justify-between gap-4 border border-dashed border-slate-300 rounded-lg px-4 py-3 bg-slate-50">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {doc.file
                                      ? doc.file.name
                                      : "No file selected"}
                                  </p>
                                  {doc.file && (
                                    <p className="text-xs text-slate-500">
                                      {formatFileSize(doc.file.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <label className="text-sm font-medium text-ncos-green-700 hover:text-ncos-green-800 cursor-pointer">
                                Select File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(event) => {
                                    const file = event.currentTarget.files?.[0];
                                    if (file) {
                                      setFieldValue(
                                        `documents.${index}.file`,
                                        file,
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {docErrors.file && docTouched.file && (
                              <p className="mt-1 text-sm text-red-600">
                                {docErrors.file}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => push({ ...emptyDocument })}
                        disabled={values.documents.length >= 10}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Document
                      </Button>
                      <p className="text-xs text-slate-500">
                        {values.documents.length}/10 documents
                      </p>
                    </div>
                  </div>
                )}
              </FieldArray>

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
                  Upload Documents
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
}
