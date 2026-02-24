import React, { useMemo, useState } from "react";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STAFF_POSTING_STATUS_OPTIONS,
  STAFF_POSTING_TYPE_OPTIONS,
  type CreateStaffPostingDTO,
  type StaffPosting,
  type StaffPostingStatus,
  type UpdateStaffPostingDTO,
} from "@/lib/api/staff-postings";
import { type Staff, useStaffList } from "@/lib/api/staff";
import { getFileUrl } from "@/lib/api";
import { getChangedFields } from "@/lib/utils";

interface StaffPostingFormValues extends Record<string, unknown> {
  service_no: string;
  type: string;
  station_name: string;
  station_location: string;
  start_date: string;
  end_date: string;
  status: StaffPostingStatus;
  reason: string;
  remarks: string;
}

interface StaffPostingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStaffPostingDTO | UpdateStaffPostingDTO,
    postingId?: number,
  ) => void;
  posting?: StaffPosting | null;
  isLoading?: boolean;
}

function formatDateForInput(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0].split(" ")[0];
}

function buildInitialValues(
  posting?: StaffPosting | null,
  staff?: Staff | null,
): StaffPostingFormValues {
  return {
    service_no: posting?.service_no || staff?.service_no || "",
    type: posting?.type || "",
    station_name: posting?.station_name || "",
    station_location: posting?.station_location || "",
    start_date: formatDateForInput(posting?.start_date),
    end_date: formatDateForInput(posting?.end_date),
    status: posting?.status || "active",
    reason: posting?.reason || "",
    remarks: posting?.remarks || "",
  };
}

function normalizeValues(
  values: StaffPostingFormValues,
): StaffPostingFormValues {
  return {
    ...values,
    service_no: values.service_no.trim(),
    type: values.type.trim(),
    station_name: values.station_name.trim(),
    station_location: values.station_location.trim(),
    reason: values.reason.trim(),
    remarks: values.remarks.trim(),
  };
}

function getValidationErrors(values: StaffPostingFormValues) {
  const errors: Partial<Record<keyof StaffPostingFormValues, string>> = {};
  if (!values.service_no.trim()) {
    errors.service_no = "Service number is required";
  }
  if (!values.type.trim()) {
    errors.type = "Posting type is required";
  }
  if (!values.station_name.trim()) {
    errors.station_name = "Station name is required";
  }
  if (!values.start_date) {
    errors.start_date = "Start date is required";
  }
  if (!values.status) {
    errors.status = "Status is required";
  }
  if (values.end_date && values.start_date) {
    const start = new Date(values.start_date).getTime();
    const end = new Date(values.end_date).getTime();
    if (end < start) {
      errors.end_date = "End date cannot be before start date";
    }
  }
  return errors;
}

export function StaffPostingFormModal({
  isOpen,
  onClose,
  onSubmit,
  posting,
  isLoading = false,
}: StaffPostingFormModalProps) {
  const isEditing = Boolean(posting);
  const [stage, setStage] = useState<"search" | "form">(
    isEditing ? "form" : "search",
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [formValues, setFormValues] = useState<StaffPostingFormValues>(() =>
    buildInitialValues(posting, null),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof StaffPostingFormValues, string>>
  >({});
  const [resetKey, setResetKey] = useState<string | null>(null);

  const currentResetKey = useMemo(() => {
    if (!isOpen) return null;
    return `${posting?.id ?? "new"}-${isEditing ? "edit" : "create"}`;
  }, [isOpen, posting?.id, isEditing]);

  if (currentResetKey && currentResetKey !== resetKey) {
    setResetKey(currentResetKey);
    setStage(isEditing ? "form" : "search");
    setSelectedStaff(null);
    setStaffSearch("");
    setFormValues(buildInitialValues(posting, null));
    setErrors({});
  }

  const { data: staffData, isLoading: isSearchingStaff } = useStaffList(
    { page: 1, per_page: 10, search: staffSearch },
    {},
    { enabled: !isEditing && stage === "search" && staffSearch.length >= 2 },
  );
  const staffResults = staffData?.data ?? [];

  function handleFieldChange<T extends keyof StaffPostingFormValues>(
    key: T,
    value: StaffPostingFormValues[T],
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleStaffSelect(staff: Staff) {
    setSelectedStaff(staff);
    setStage("form");
    setFormValues(buildInitialValues(null, staff));
    setErrors({});
  }

  function handleBackToSearch() {
    setSelectedStaff(null);
    setStage("search");
  }

  function buildCreatePayload(
    values: StaffPostingFormValues,
  ): CreateStaffPostingDTO {
    return {
      service_no: values.service_no.trim(),
      type: values.type.trim(),
      station_name: values.station_name.trim(),
      station_location: values.station_location.trim() || undefined,
      start_date: values.start_date,
      end_date: values.end_date || undefined,
      status: values.status,
      reason: values.reason.trim() || undefined,
      remarks: values.remarks.trim() || undefined,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = getValidationErrors(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!isEditing) {
      if (!selectedStaff?.service_no) {
        toast.error("Select a staff member first");
        setStage("search");
        return;
      }
      onSubmit(buildCreatePayload(formValues));
      return;
    }

    const normalizedValues = normalizeValues(formValues);
    const normalizedInitial = normalizeValues(
      buildInitialValues(posting, null),
    );
    const changedFields = getChangedFields(
      normalizedValues,
      normalizedInitial,
      ["service_no"],
    );
    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes to submit");
      return;
    }
    onSubmit(changedFields as UpdateStaffPostingDTO, posting?.id);
  }

  const staffSelection = selectedStaff || posting?.staff;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        stage === "search" && !isEditing
          ? "Select Staff Member"
          : isEditing
            ? "Edit Staff Posting"
            : "Add Staff Posting"
      }
      description={
        stage === "search" && !isEditing
          ? "Search and select a staff member to create a posting"
          : isEditing
            ? "Update staff posting details"
            : "Create a new staff posting"
      }
      size="lg"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
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
            ) : staffResults.length > 0 ? (
              <div className="space-y-2">
                {staffResults.map((staff) => (
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
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            const fallback =
                              event.currentTarget.nextElementSibling;
                            if (fallback) {
                              (fallback as HTMLElement).style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold border-2 border-ncos-green-200 ${staff.photo ? "hidden" : ""}`}
                      >
                        {staff.surname?.[0]}
                        {staff.first_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {staff.surname} {staff.first_name}{" "}
                          {staff.other_names || ""}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{staff.service_no}</span>
                          <span>•</span>
                          <span>{staff.present_rank_name || "No rank"}</span>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && selectedStaff ? (
            <button
              type="button"
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-ncos-green-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Change staff member
            </button>
          ) : null}

          {staffSelection ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                {staffSelection.photo ? (
                  <>
                    <img
                      src={getFileUrl(staffSelection.photo)}
                      alt={`${staffSelection.surname} ${staffSelection.first_name}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback =
                          event.currentTarget.nextElementSibling;
                        if (fallback) {
                          (fallback as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 hidden items-center justify-center font-semibold border-2 border-ncos-green-200">
                      {staffSelection.surname?.[0]}
                      {staffSelection.first_name?.[0]}
                    </div>
                  </>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-ncos-green-100 text-ncos-green-700 flex items-center justify-center font-semibold border-2 border-ncos-green-200">
                    {staffSelection.surname?.[0]}
                    {staffSelection.first_name?.[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {staffSelection.surname} {staffSelection.first_name}{" "}
                    {staffSelection.other_names || ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {staffSelection.service_no} •{" "}
                    {staffSelection.present_rank_name || "No rank"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <Input
            label="Service Number"
            value={formValues.service_no}
            onChange={(event) =>
              handleFieldChange("service_no", event.target.value)
            }
            disabled
            error={errors.service_no}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Posting Type
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={formValues.type}
              onChange={(event) =>
                handleFieldChange("type", event.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm ${
                errors.type ? "border-red-500" : "border-slate-300"
              }`}
              required
            >
              {STAFF_POSTING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Station Name"
            value={formValues.station_name}
            onChange={(event) =>
              handleFieldChange("station_name", event.target.value)
            }
            error={errors.station_name}
            required
          />

          <Input
            label="Station Location"
            value={formValues.station_location}
            onChange={(event) =>
              handleFieldChange("station_location", event.target.value)
            }
            placeholder="Optional"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formValues.start_date}
              onChange={(event) =>
                handleFieldChange("start_date", event.target.value)
              }
              error={errors.start_date}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formValues.end_date}
              onChange={(event) =>
                handleFieldChange("end_date", event.target.value)
              }
              error={errors.end_date}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <select
              value={formValues.status}
              onChange={(event) =>
                handleFieldChange(
                  "status",
                  event.target.value as StaffPostingStatus,
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm ${
                errors.status ? "border-red-500" : "border-slate-300"
              }`}
            >
              {STAFF_POSTING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.status}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason
            </label>
            <textarea
              value={formValues.reason}
              onChange={(event) =>
                handleFieldChange("reason", event.target.value)
              }
              className="w-full min-h-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Remarks
            </label>
            <textarea
              value={formValues.remarks}
              onChange={(event) =>
                handleFieldChange("remarks", event.target.value)
              }
              className="w-full min-h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              placeholder="Optional"
            />
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isEditing ? "Submit Update" : "Submit Posting"}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
