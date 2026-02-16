import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Loader2,
  Upload,
  X,
  Search,
  ChevronLeft,
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
import { type Staff, useStaffList } from "@/lib/api/staff";
import { useGenericData } from "@/lib/api/statistics";
import { getFileUrl } from "@/lib/api";
import { getChangedFields } from "@/lib/utils";

interface QualificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStaffEducationFormData | UpdateStaffEducationFormData,
    educationId?: number,
  ) => void;
  education?: StaffEducation | null;
  isLoading?: boolean;
}

export const QualificationFormModal: React.FC<QualificationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  education,
  isLoading = false,
}) => {
  const [stage, setStage] = useState<"search" | "form">(
    education ? "form" : "search",
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  // Track newly selected file preview (base64 data URL)
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  // Track if user wants to replace the existing file
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  const isEditing = !!education;

  // Compute existingFileUrl directly from education prop (derived state)
  const existingFileUrl = education?.url ? getFileUrl(education.url) : null;

  const [trackedEducationId, setTrackedEducationId] = useState<
    number | undefined
  >(education?.id);
  if (trackedEducationId !== education?.id) {
    setTrackedEducationId(education?.id);
    setNewFilePreview(null);
    setIsReplacingFile(false);
    setStage(education ? "form" : "search");
  }
  const title = isEditing ? "Edit Qualification" : "Add Qualification";

  const { data: genericData } = useGenericData();
  const { data: staffData, isLoading: isSearchingStaff } = useStaffList(
    { page: 1, per_page: 10, search: staffSearch },
    {},
    { enabled: !isEditing && stage === "search" && staffSearch.length >= 2 },
  );

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
          service_no: selectedStaff?.service_no || "",
          institution: "",
          course: "",
          type: "",
          start_date: "",
          end_date: "",
        };

  const validationSchema = isEditing
    ? toFormikValidationSchema(updateStaffEducationSchema)
    : toFormikValidationSchema(createStaffEducationSchema);

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setStage("form");
  };

  const handleBackToSearch = () => {
    setSelectedStaff(null);
    setStage("search");
  };

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
    setStage(education ? "form" : "search");
    setSelectedStaff(null);
    setStaffSearch("");
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
      onSubmit(
        changedFields as
          | CreateStaffEducationFormData
          | UpdateStaffEducationFormData,
        education?.id,
      );
    } else {
      // For create, send all fields with selected staff service_no
      if (selectedStaff) {
        values.service_no = selectedStaff.service_no;
      }
      onSubmit(values);
    }
  };

  // Get display name for description
  const getStaffDisplayName = () => {
    if (isEditing && education?.staff) {
      return `${education.staff.surname} ${education.staff.first_name}`;
    }
    if (selectedStaff) {
      return `${selectedStaff.surname} ${selectedStaff.first_name}`;
    }
    return "";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={stage === "search" ? "Select Staff Member" : title}
      description={
        stage === "search"
          ? "Search and select a staff member to add their qualification"
          : isEditing
            ? `Update qualification for ${getStaffDisplayName()}`
            : `Adding qualification for ${getStaffDisplayName()}`
      }
      size="xl"
    >
      {stage === "search" && !isEditing ? (
        // Stage 1: Staff Search
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or service number..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
              autoFocus
            />
          </div>

          {/* Staff Results */}
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
        // Stage 2: Form
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ setFieldValue }) => (
            <Form className="space-y-6">
              {/* Back button for create mode */}
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

              {/* Selected Staff Info */}
              {((isEditing && education?.staff) ||
                (!isEditing && selectedStaff)) && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const staff = isEditing
                        ? education?.staff
                        : selectedStaff;
                      if (!staff) return null;

                      return (
                        <>
                          {staff.photo ? (
                            <img
                              src={getFileUrl(staff.photo)}
                              alt={`${staff.surname} ${staff.first_name}`}
                              className="w-12 h-12 rounded-full object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback =
                                  e.currentTarget.nextElementSibling;
                                if (fallback)
                                  (fallback as HTMLElement).style.display =
                                    "flex";
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
                    {genericData?.degree_types
                      ?.filter((dt) => dt.status)
                      .map((degreeType) => (
                        <option key={degreeType.id} value={degreeType.title}>
                          {degreeType.title}
                        </option>
                      ))}
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
                            existingFileUrl
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
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isEditing ? "Update" : "Add"} Qualification
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
};
