import React, { useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Loader2,
  Upload,
  X,
  GraduationCap,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
  File,
  Image,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type StaffEducation,
  type CreateStaffEducationFormData,
  type UpdateStaffEducationFormData,
  createStaffEducationSchema,
  updateStaffEducationSchema,
} from "@/lib/api/staff-education";
import { useGenericData } from "@/lib/api/statistics";
import { getFileUrl } from "@/lib/api";
import { getChangedFields } from "@/lib/utils";

interface StaffQualificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStaffEducationFormData | UpdateStaffEducationFormData,
    educationId?: number,
  ) => void;
  education?: StaffEducation | null;
  isLoading?: boolean;
  /** The service number of the logged-in staff user */
  serviceNo: string;
}

/**
 * Simplified form modal for staff self-service.
 * Skips staff search and auto-fills service_no from the logged-in user.
 */
export const StaffQualificationFormModal: React.FC<
  StaffQualificationFormModalProps
> = ({
  isOpen,
  onClose,
  onSubmit,
  education,
  isLoading = false,
  serviceNo,
}) => {
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  const isEditing = !!education;
  const title = isEditing ? "Edit Qualification" : "Add Qualification";

  const educationUrl = education?.url;
  const existingFileUrl = useMemo(
    () => (educationUrl ? getFileUrl(educationUrl) : null),
    [educationUrl],
  );

  const { data: genericData } = useGenericData();

  // Helper to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return "";
    // Extract just the date part (YYYY-MM-DD) from potential datetime string
    return dateString.split("T")[0].split(" ")[0];
  };

  // Initial form values
  const initialValues:
    | CreateStaffEducationFormData
    | UpdateStaffEducationFormData =
    isEditing && education
      ? {
          service_no: education.service_no,
          institution: education.institution,
          course: education.course || "",
          type: education.type,
          start_date: formatDateForInput(education.start_date),
          end_date: formatDateForInput(education.end_date),
        }
      : {
          service_no: serviceNo,
          institution: "",
          course: "",
          type: "",
          start_date: "",
          end_date: "",
        };

  const typeSelectOptions = useMemo(() => {
    const activeTypes =
      genericData?.degree_types?.filter((dt) => dt.status) ?? [];
    const titleSet = new Set(activeTypes.map((dt) => dt.title.trim()));
    const rawInitialType = initialValues.type ?? "";
    const initialTrimmed = rawInitialType.trim();

    const options = activeTypes.map((degreeType) => (
      <option key={degreeType.id} value={degreeType.title}>
        {degreeType.title}
      </option>
    ));

    if (initialTrimmed.length > 0 && !titleSet.has(initialTrimmed)) {
      options.push(
        <option key={`legacy-type-${rawInitialType}`} value={rawInitialType}>
          {rawInitialType}
        </option>,
      );
    }

    return options;
  }, [genericData?.degree_types, initialValues.type]);

  const validationSchema = isEditing
    ? toFormikValidationSchema(updateStaffEducationSchema)
    : toFormikValidationSchema(createStaffEducationSchema);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: File | undefined) => void,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue("url", file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewFile = (
    setFieldValue: (field: string, value: undefined) => void,
  ) => {
    setFieldValue("url", undefined);
    setNewFilePreview(null);
    // If we had an existing file, go back to showing it
    if (existingFileUrl) {
      setIsReplacingFile(false);
    }
  };

  const handleStartReplaceFile = () => {
    setIsReplacingFile(true);
  };

  const handleCancelReplaceFile = (
    setFieldValue: (field: string, value: undefined) => void,
  ) => {
    setFieldValue("url", undefined);
    setNewFilePreview(null);
    setIsReplacingFile(false);
  };

  // Helper to get file extension from URL
  const getFileExtension = (url: string): string => {
    const parts = url.split(".");
    return parts[parts.length - 1]?.toLowerCase() || "";
  };

  // Helper to check if file is an image
  const isImageFile = (url: string): boolean => {
    const ext = getFileExtension(url);
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  };

  const handleClose = () => {
    setNewFilePreview(null);
    setIsReplacingFile(false);
    onClose();
  };

  const handleFormSubmit = (
    values: CreateStaffEducationFormData | UpdateStaffEducationFormData,
  ) => {
    if (isEditing) {
      // Only send changed fields for updates
      const changedFields = getChangedFields(
        values as Record<string, unknown>,
        initialValues as Record<string, unknown>,
        ["service_no"],
      );
      // Always include service_no for identification
      changedFields.service_no = serviceNo;
      onSubmit(
        changedFields as
          | CreateStaffEducationFormData
          | UpdateStaffEducationFormData,
        education?.id,
      );
    } else {
      // For create, send all fields
      values.service_no = serviceNo;
      onSubmit(values);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={
        isEditing
          ? "Update your qualification details"
          : "Add a new qualification to your profile"
      }
      size="xl"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Institution */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Institution <span className="text-red-500">*</span>
                </label>
                <Field
                  name="institution"
                  type="text"
                  placeholder="Enter institution name"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                />
                <ErrorMessage
                  name="institution"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Course */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Course/Degree
                </label>
                <Field
                  name="course"
                  type="text"
                  placeholder="e.g., B.Sc Computer Science"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                />
                <ErrorMessage
                  name="course"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  name="type"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                >
                  <option value="">Select type</option>
                  {typeSelectOptions}
                </Field>
                <ErrorMessage
                  name="type"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Field
                  name="start_date"
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                />
                <ErrorMessage
                  name="start_date"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* End Date */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  End Date (Leave empty if ongoing)
                </label>
                <Field
                  name="end_date"
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
                />
                <ErrorMessage
                  name="end_date"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Certificate Upload */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Upload className="w-4 h-4" />
                  Certificate/Document
                </label>
                <div className="space-y-3">
                  {/* Show existing file when editing and not replacing */}
                  {existingFileUrl && !isReplacingFile && !newFilePreview ? (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {isImageFile(existingFileUrl) ? (
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
                              Certificate Attached
                            </p>
                            <p className="text-xs text-slate-500 uppercase">
                              {getFileExtension(existingFileUrl)} file
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <a
                            href={existingFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ncos-green-700 bg-ncos-green-100 rounded-lg hover:bg-ncos-green-200 transition-colors flex-1 sm:flex-none"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                          <button
                            type="button"
                            onClick={handleStartReplaceFile}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors flex-1 sm:flex-none"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Replace
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : newFilePreview ? (
                    /* Show newly selected file preview */
                    <div className="relative p-4 border border-ncos-green-200 rounded-lg bg-ncos-green-50">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(setFieldValue)}
                        className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        title={
                          existingFileUrl ? "Cancel replacement" : "Remove file"
                        }
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3">
                        {newFilePreview.startsWith("data:image") ? (
                          <img
                            src={newFilePreview}
                            alt="New certificate preview"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {existingFileUrl
                              ? "New File Selected"
                              : "File Selected"}
                          </p>
                          <p className="text-xs text-ncos-green-600">
                            {existingFileUrl
                              ? "Will replace existing file on save"
                              : "Ready to upload"}
                          </p>
                        </div>
                      </div>
                      {existingFileUrl && (
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
                    /* Show upload area */
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
                            PDF, JPG, JPEG, or PNG (Max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, setFieldValue)}
                        />
                      </label>
                    </div>
                  )}
                  {/* Cancel replace button when in replace mode but no file selected yet */}
                  {isReplacingFile && !newFilePreview && existingFileUrl && (
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
                  name="url"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>
            </div>

            {/* Form Footer */}
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
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Update" : "Add"} Qualification
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
