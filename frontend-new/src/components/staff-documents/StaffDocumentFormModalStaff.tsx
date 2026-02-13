import React, { useState } from "react";
import { Field, ErrorMessage, Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Calendar,
  Eye,
  File,
  FileText,
  Image,
  Loader2,
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
import { getChangedFields } from "@/lib/utils";

interface StaffDocumentFormModalStaffProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStaffDocumentFormData | UpdateStaffDocumentFormData,
    documentId?: number,
  ) => void;
  document?: StaffDocument | null;
  isLoading?: boolean;
  serviceNo: string;
  onViewFile?: (document: StaffDocument) => void;
}

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  return dateString.split("T")[0].split(" ")[0];
}

function isImageMimeType(mimeType: string | null | undefined): boolean {
  return !!mimeType && mimeType.startsWith("image/");
}

export function StaffDocumentFormModalStaff({
  isOpen,
  onClose,
  onSubmit,
  document,
  isLoading = false,
  serviceNo,
  onViewFile,
}: StaffDocumentFormModalStaffProps) {
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  const isEditing = !!document;
  const title = isEditing ? "Edit Document" : "Add Document";

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
          service_no: serviceNo,
          document_type: "",
          document_name: "",
          notes: "",
          expires_at: "",
        };

  const validationSchema = isEditing
    ? toFormikValidationSchema(updateStaffDocumentSchema)
    : toFormikValidationSchema(createStaffDocumentSchema);

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

      changedFields.service_no = serviceNo;

      onSubmit(
        changedFields as
          | CreateStaffDocumentFormData
          | UpdateStaffDocumentFormData,
        document.id,
      );
      return;
    }

    values.service_no = serviceNo;
    onSubmit(values);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={
        isEditing
          ? "Update your personnel document details"
          : "Upload a new personnel document"
      }
      size="xl"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ setFieldValue, dirty }) => (
          <Form className="space-y-6">
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
                          onClick={() => handleCancelReplaceFile(setFieldValue)}
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
              <Button type="submit" disabled={isLoading || !dirty}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Update" : "Add"} Document
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
