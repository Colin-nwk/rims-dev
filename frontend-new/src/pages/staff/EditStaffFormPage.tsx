import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, FormikProps } from "formik";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  Save,
  AlertCircle,
  GraduationCap,
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useUpdateStaff,
  useStaff,
  CreateStaffDTO,
  sexOptions,
  relationshipOptions,
  educationTypes,
  StaffEducation,
} from "@/lib/api/staff";
import { getFileUrl, useGenericData } from "@/lib/api";
import { ROUTES } from "@/routes/constants";
import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import {
  getDirectorateName,
  getPrisonName,
  getRankName,
  getStaffStatusName,
  getStateId,
  getStateName,
  getTrainingInstituteName,
  getWorkDistributionName,
} from "@/lib/helpers/genericDataHelpers";
import { ChangePasswordModal } from "@/components/staff/ChangePasswordModal";
import { TabNav } from "@/components/staff/StaffFormTabs";

// Combined form values type for Edit (All tables)
type EditStaffFormValues = Omit<CreateStaffDTO, "photo"> & {
  photo?: File | string;
  details: {
    nin?: string;
    bvn?: string;
    place_of_birth?: string;
    contact_address?: string;
    permanent_home_address?: string;
    height?: string;
    blood_group?: string;
    genotype?: string;
    complexion?: string;
    hair_colour?: string;
    is_deformed?: boolean;
    deformity?: string;
    is_convicted?: boolean;
    previous_convictions?: string;
    pfa_name?: string;
    pension_pin?: string;
    ippis?: string;
    next_of_kin_name?: string;
    next_of_kin_phone?: string;
    next_of_kin_relationship?: string;
    next_of_kin_address?: string;
    marital_status?: string;
    spouse_name?: string;
    spouse_phone?: string;
    number_of_children?: number;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
  education?: Partial<StaffEducation>[];
};

// Helper to convert various boolean representations to actual boolean
const formatBooleanForInput = (
  value: boolean | string | number | null | undefined,
): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes";
  }
  return false;
};

// Helper to format date strings to YYYY-MM-DD for HTML date inputs
const formatDateForInput = (dateValue: string | null | undefined): string => {
  if (!dateValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    const parts = dateValue.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to extract rank ID from a value that could be number, string, or object
const extractRankId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: number | string }).id);
  }
  return String(value);
};

// Helper to check if two values are equal (handles different data types)
const areValuesEqual = (val1: unknown, val2: unknown): boolean => {
  // Handle null/undefined equality
  if (val1 === val2) return true;
  if (val1 == null && val2 == null) return true;
  if (val1 == null || val2 == null) return false;

  // Handle empty strings vs null/undefined
  if (val1 === "" && val2 == null) return true;
  if (val1 == null && val2 === "") return true;

  // Handle File objects (always consider changed if File is present)
  if (val1 instanceof File || val2 instanceof File) return false;

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((item, index) => areValuesEqual(item, val2[index]));
  }

  // Handle objects (but not File, which we checked above)
  if (typeof val1 === "object" && typeof val2 === "object") {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      if (
        !areValuesEqual(
          (val1 as Record<string, unknown>)[key],
          (val2 as Record<string, unknown>)[key],
        )
      ) {
        return false;
      }
    }
    return true;
  }

  // Handle primitive values (including number/string comparison)
  return String(val1) === String(val2);
};

// Helper to extract only changed fields from form values
const getChangedFields = (
  currentValues: EditStaffFormValues,
  initialValues: EditStaffFormValues,
): Partial<EditStaffFormValues> => {
  const changedFields: Partial<EditStaffFormValues> = {};

  // Check top-level fields
  (Object.keys(currentValues) as Array<keyof EditStaffFormValues>).forEach(
    (key) => {
      // Skip service_no - it's used in the endpoint URL, not the payload
      if (key === "service_no") return;

      const currentValue = currentValues[key];
      const initialValue = initialValues[key];

      // Handle details object separately
      if (key === "details" && typeof currentValue === "object") {
        const changedDetails: Partial<EditStaffFormValues["details"]> = {};
        let hasChangedDetails = false;

        if (currentValue && typeof currentValue === "object") {
          Object.keys(currentValue).forEach((detailKey) => {
            const currentDetail =
              currentValue[detailKey as keyof typeof currentValue];
            const initialDetail =
              initialValue && typeof initialValue === "object"
                ? initialValue[detailKey as keyof typeof initialValue]
                : undefined;

            if (!areValuesEqual(currentDetail, initialDetail)) {
              (changedDetails as Record<string, unknown>)[detailKey] =
                currentDetail;
              hasChangedDetails = true;
            }
          });
        }

        if (hasChangedDetails) {
          changedFields.details = changedDetails;
        }
        return;
      }

      // Handle education array separately
      if (key === "education" && Array.isArray(currentValue)) {
        if (!areValuesEqual(currentValue, initialValue)) {
          changedFields.education = currentValue;
        }
        return;
      }

      // Handle photo (File object or string path)
      if (key === "photo") {
        // Only include if it's a new File upload
        if (currentValue instanceof File) {
          changedFields.photo = currentValue;
        }
        return;
      }

      // For all other fields, check if value changed
      if (!areValuesEqual(currentValue, initialValue)) {
        (changedFields as Record<string, unknown>)[key] = currentValue;
      }
    },
  );

  return changedFields;
};

// Select component
const Select: React.FC<
  {
    label?: string;
    error?: string;
    children: React.ReactNode;
  } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, error, children, className, id, required, ...props }) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium ${error ? "text-red-600" : "text-slate-700"}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            error
              ? "border-red-500 focus:ring-red-500 bg-red-50"
              : "border-slate-300 focus:ring-emerald-500"
          } ${className || ""}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p
          className="flex items-center gap-1 text-xs font-medium text-red-600"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea component
const Textarea: React.FC<
  {
    label?: string;
    error?: string;
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ label, error, className, id, ...props }) => {
  const generatedId = React.useId();
  const textareaId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className={`block text-sm font-medium ${error ? "text-red-600" : "text-slate-700"}`}
        >
          {label}
          {error && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`flex min-h-20 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
          error
            ? "border-red-500 focus:ring-red-500 bg-red-50"
            : "border-slate-300 focus:ring-emerald-500"
        } ${className || ""}`}
        {...props}
      />
      {error && (
        <p
          className="flex items-center gap-1 text-xs font-medium text-red-600"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const PhotoUpload: React.FC<{
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const previewUrl = React.useMemo(() => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    if (typeof value === "string" && value) {
      return getFileUrl(value);
    }
    return null;
  }, [value]);

  useEffect(() => {
    if (value instanceof File && previewUrl) {
      const previousBlobUrl = blobUrlRef.current;
      blobUrlRef.current = previewUrl;

      if (previousBlobUrl && previousBlobUrl !== previewUrl) {
        URL.revokeObjectURL(previousBlobUrl);
      }
    } else {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [value, previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Staff Photo
      </label>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="object-cover w-24 h-24 border-2 rounded-lg border-slate-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center w-24 h-24 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
          >
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="mt-1 text-xs text-slate-400">Upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-xs text-slate-500">
          <p>JPG, PNG or GIF</p>
          <p>Max 2MB</p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Tab 1: Basic Info
const BasicInfoTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="pb-2 mb-4 font-medium border-b text-slate-900 border-slate-200">
          Personal Information
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Surname"
              name="surname"
              value={values.surname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.surname ? errors.surname : undefined}
              placeholder="Surname"
              required
            />
            <Input
              label="First Name"
              name="first_name"
              value={values.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.first_name ? errors.first_name : undefined}
              placeholder="First Name"
              required
            />
            <Input
              label="Other Names"
              name="other_names"
              value={values.other_names || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.other_names ? errors.other_names : undefined}
              placeholder="Other Names"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Gender"
              name="sex"
              value={values.sex || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.sex ? (errors.sex as string) : undefined}
            >
              <option value="">Select Gender</option>
              {sexOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={values.dob || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.dob ? errors.dob : undefined}
            />
            <Input
              label="Phone Number"
              name="phone_number"
              value={values.phone_number || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone_number ? errors.phone_number : undefined}
              placeholder="08012345678"
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Official Information */}
      <div>
        <h4 className="pb-2 mb-4 font-medium border-b text-slate-900 border-slate-200">
          Official Information
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Service Number"
              name="service_no"
              value={values.service_no}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.service_no ? errors.service_no : undefined}
              placeholder="e.g., 00001"
              disabled
              required
            />
            <Input
              label="IPPIS Number"
              name="ippis"
              value={values.ippis || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.ippis ? errors.ippis : undefined}
              placeholder="e.g., 123456789"
            />
            <Input
              label="File Number"
              name="file_no"
              value={values.file_no || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.file_no ? errors.file_no : undefined}
              placeholder="File No."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Department"
              name="department"
              value={values.department || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.department ? errors.department : undefined}
              placeholder="e.g., Administration"
              required
            />
            <Input
              label="Duty / Role"
              name="duty"
              value={values.duty || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.duty ? errors.duty : undefined}
              placeholder="e.g., Registry Officer"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Work Distribution"
              name="work_distribution_id"
              value={values.work_distribution_id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue(
                  "work_distribution_id",
                  val === "" ? undefined : Number(val),
                );
              }}
              onBlur={handleBlur}
              disabled={isLoadingGeneric}
            >
              <option value="">Not specified</option>
              {genericData?.work_distributions?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              label="Training Institute"
              name="training_institute_id"
              value={values.training_institute_id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue(
                  "training_institute_id",
                  val === "" ? undefined : Number(val),
                );
              }}
              onBlur={handleBlur}
              disabled={isLoadingGeneric}
            >
              <option value="">Not specified</option>
              {genericData?.training_institutes?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              label="Directorate"
              name="directorate_id"
              value={values.directorate_id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue(
                  "directorate_id",
                  val === "" ? undefined : Number(val),
                );
              }}
              onBlur={handleBlur}
              disabled={isLoadingGeneric}
            >
              <option value="">Not specified</option>
              {genericData?.directorates?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              label="Staff Status"
              name="staff_status_id"
              value={values.staff_status_id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue(
                  "staff_status_id",
                  val === "" ? undefined : Number(val),
                );
              }}
              onBlur={handleBlur}
              disabled={isLoadingGeneric}
            >
              <option value="">Not specified</option>
              {genericData?.statuses?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Present Rank"
              name="present_rank"
              value={values.present_rank || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.present_rank ? errors.present_rank : undefined}
              disabled={isLoadingGeneric}
              required
            >
              <option value="">Select Present Rank</option>
              {genericData?.rankings?.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.title}
                </option>
              ))}
            </Select>
            <Select
              label="Initial Rank"
              name="initial_rank"
              value={values.initial_rank || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.initial_rank ? errors.initial_rank : undefined}
              disabled={isLoadingGeneric}
            >
              <option value="">Select Initial Rank</option>
              {genericData?.rankings?.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.title}
                </option>
              ))}
            </Select>
            <Select
              label="Grade Level"
              name="level"
              value={values.level ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue("level", val === "" ? undefined : Number(val));
              }}
              onBlur={handleBlur}
              error={touched.level ? (errors.level as string) : undefined}
              disabled={isLoadingGeneric}
            >
              <option value="">Select Level</option>
              {genericData?.levels?.map((level) => (
                <option key={level.id} value={level.level_number}>
                  {level.level}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab 2: Posting & Origin
const PostingOriginTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  const filteredLGAs = React.useMemo(() => {
    const lgas = genericData?.lgas;
    const states = genericData?.states;
    if (!lgas || !states) return [];
    if (!values.state_of_origin) return lgas;
    const selectedState = states.find(
      (state) => state.state === values.state_of_origin,
    );
    if (!selectedState) return lgas;
    return lgas.filter((lga) => lga.state_id === selectedState.id);
  }, [genericData, values.state_of_origin]);

  // Filter prisons based on selected assigned_state (now an ID)
  const filteredPrisons = React.useMemo(() => {
    const prisons = genericData?.prisons;
    if (!prisons) return [];
    if (!values.assigned_state) return prisons;
    // assigned_state is now an ID, so compare directly
    const stateId = Number(values.assigned_state);
    return prisons.filter((prison) => prison.state_id === stateId);
  }, [genericData, values.assigned_state]);

  return (
    <div className="space-y-4">
      <h4 className="pb-2 font-medium border-b text-slate-900 border-slate-200">
        Origin
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="State of Origin"
          name="state_of_origin"
          value={values.state_of_origin || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.state_of_origin ? errors.state_of_origin : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select State of Origin</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.state}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="LGA"
          name="lga"
          value={values.lga || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.lga ? errors.lga : undefined}
          disabled={isLoadingGeneric || !values.state_of_origin}
        >
          <option value="">
            {values.state_of_origin ? "Select LGA" : "Select State First"}
          </option>
          {filteredLGAs.map((lga) => (
            <option key={lga.id} value={lga.lga}>
              {lga.lga}
            </option>
          ))}
        </Select>
      </div>

      <h4 className="pt-2 pb-2 font-medium border-b text-slate-900 border-slate-200">
        Current Posting
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Assigned State"
          name="assigned_state"
          value={values.assigned_state || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.assigned_state ? errors.assigned_state : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select Assigned State</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="Custodial Center"
          name="prison"
          value={values.prison || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.prison ? errors.prison : undefined}
          disabled={isLoadingGeneric || !values.assigned_state}
        >
          <option value="">
            {values.assigned_state
              ? "Select Custodial Center"
              : "Select State First"}
          </option>
          {filteredPrisons.map((prison) => (
            <option key={prison.id} value={prison.id}>
              {prison.prison_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Initial Command"
          name="initial_command"
          value={values.initial_command || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.initial_command ? errors.initial_command : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select Initial Command</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="Present Command"
          name="present_command"
          value={values.present_command || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.present_command ? errors.present_command : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select Present Command</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
      </div>
      <Input
        label="Command Post Date"
        name="command_post_date"
        type="date"
        value={values.command_post_date || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.command_post_date ? errors.command_post_date : undefined}
      />
    </div>
  );
};

// Tab 3: Identity & Docs
const IdentityDocsTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-4">
      <PhotoUpload
        value={values.photo}
        onChange={(file) => setFieldValue("photo", file)}
        error={touched.photo ? (errors.photo as string) : undefined}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="NIN"
          name="details.nin"
          value={values.details?.nin || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.details?.nin ? errors.details?.nin : undefined}
          placeholder="National Identification Number"
        />
        <Input
          label="BVN"
          name="details.bvn"
          value={values.details?.bvn || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.details?.bvn ? errors.details?.bvn : undefined}
          placeholder="Bank Verification Number"
        />
        <Input
          label="IPPIS (Details)"
          name="details.ippis"
          value={values.details?.ippis || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.details?.ippis ? errors.details?.ippis : undefined}
          placeholder="IPPIS Number"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="PFA Name"
          name="details.pfa_name"
          value={values.details?.pfa_name || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.pfa_name ? errors.details?.pfa_name : undefined
          }
          placeholder="Pension Fund Administrator"
        />
        <Input
          label="Pension PIN"
          name="details.pension_pin"
          value={values.details?.pension_pin || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.pension_pin
              ? errors.details?.pension_pin
              : undefined
          }
          placeholder="Pension PIN"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date of First Appointment"
          name="date_of_first_appointment"
          type="date"
          value={values.date_of_first_appointment || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.date_of_first_appointment
              ? errors.date_of_first_appointment
              : undefined
          }
        />
        <Input
          label="Present Appointment Date"
          name="present_appointment_date"
          type="date"
          value={values.present_appointment_date || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.present_appointment_date
              ? errors.present_appointment_date
              : undefined
          }
        />
      </div>
    </div>
  );
};

// Tab 4: Physical & Medical
const PhysicalMedicalTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Place of Birth"
          name="details.place_of_birth"
          value={values.details?.place_of_birth || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.place_of_birth
              ? errors.details?.place_of_birth
              : undefined
          }
          placeholder="Place of Birth"
        />
        <Input
          label="Height"
          name="details.height"
          value={values.details?.height || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.details?.height ? errors.details?.height : undefined}
          placeholder="e.g., 1.75m"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="Blood Group"
          name="details.blood_group"
          value={values.details?.blood_group || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.blood_group
              ? errors.details?.blood_group
              : undefined
          }
          disabled={isLoadingGeneric}
        >
          <option value="">Select Blood Group</option>
          {genericData?.blood_groups?.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select
          label="Genotype"
          name="details.genotype"
          value={values.details?.genotype || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.genotype ? errors.details?.genotype : undefined
          }
          disabled={isLoadingGeneric}
        >
          <option value="">Select Genotype</option>
          {genericData?.blood_genotypes?.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select
          label="Complexion"
          name="details.complexion"
          value={values.details?.complexion || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.complexion ? errors.details?.complexion : undefined
          }
          disabled={isLoadingGeneric}
        >
          <option value="">Select Complexion</option>
          {genericData?.complexions?.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </Select>
      </div>
      <Select
        label="Hair Colour"
        name="details.hair_colour"
        value={values.details?.hair_colour || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          touched.details?.hair_colour ? errors.details?.hair_colour : undefined
        }
        disabled={isLoadingGeneric}
      >
        <option value="">Select Hair Colour</option>
        {genericData?.hair_colours?.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </Select>
      <div className="flex items-center gap-4 p-4 border rounded-lg border-slate-200 bg-slate-50">
        <input
          type="checkbox"
          id="is_deformed"
          name="details.is_deformed"
          checked={values.details?.is_deformed || false}
          onChange={(e) =>
            setFieldValue("details.is_deformed", e.target.checked)
          }
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label
          htmlFor="is_deformed"
          className="text-sm font-medium text-slate-700"
        >
          Has Physical Deformity
        </label>
      </div>
      {values.details?.is_deformed && (
        <Textarea
          label="Deformity Description"
          name="details.deformity"
          value={values.details?.deformity || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.deformity ? errors.details?.deformity : undefined
          }
          placeholder="Describe the deformity"
        />
      )}
      <div className="flex items-center gap-4 p-4 border rounded-lg border-slate-200 bg-slate-50">
        <input
          type="checkbox"
          id="is_convicted"
          name="details.is_convicted"
          checked={values.details?.is_convicted || false}
          onChange={(e) =>
            setFieldValue("details.is_convicted", e.target.checked)
          }
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label
          htmlFor="is_convicted"
          className="text-sm font-medium text-slate-700"
        >
          Has Previous Convictions
        </label>
      </div>
      {values.details?.is_convicted && (
        <Textarea
          label="Previous Convictions"
          name="details.previous_convictions"
          value={values.details?.previous_convictions || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.previous_convictions
              ? errors.details?.previous_convictions
              : undefined
          }
          placeholder="Describe previous convictions"
        />
      )}
    </div>
  );
};

// Tab 5: Addresses
const AddressesTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <div className="space-y-4">
      <Textarea
        label="Contact Address"
        name="details.contact_address"
        value={values.details?.contact_address || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          touched.details?.contact_address
            ? errors.details?.contact_address
            : undefined
        }
        placeholder="Current contact address"
      />
      <Textarea
        label="Permanent Home Address"
        name="details.permanent_home_address"
        value={values.details?.permanent_home_address || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          touched.details?.permanent_home_address
            ? errors.details?.permanent_home_address
            : undefined
        }
        placeholder="Permanent home address"
      />
    </div>
  );
};

// Tab 6: Family & NOK
const FamilyNOKTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-4">
      <h4 className="pb-2 font-medium border-b text-slate-900 border-slate-200">
        Family Information
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Marital Status"
          name="details.marital_status"
          value={values.details?.marital_status || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.marital_status
              ? errors.details?.marital_status
              : undefined
          }
          disabled={isLoadingGeneric}
        >
          <option value="">Select Marital Status</option>
          {genericData?.marital_statuses?.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </Select>
        <Input
          label="Number of Children"
          name="details.number_of_children"
          type="number"
          min="0"
          value={values.details?.number_of_children || ""}
          onChange={(e) => {
            const val = e.target.value;
            setFieldValue(
              "details.number_of_children",
              val === "" ? undefined : Number(val),
            );
          }}
          onBlur={handleBlur}
          error={
            touched.details?.number_of_children
              ? errors.details?.number_of_children
              : undefined
          }
          placeholder="0"
        />
      </div>
      {(values.details?.marital_status === "Married" ||
        values.details?.marital_status === "Divorced" ||
        values.details?.marital_status === "Widowed") && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Spouse Name"
            name="details.spouse_name"
            value={values.details?.spouse_name || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.details?.spouse_name
                ? errors.details?.spouse_name
                : undefined
            }
            placeholder="Spouse full name"
          />
          <Input
            label="Spouse Phone"
            name="details.spouse_phone"
            value={values.details?.spouse_phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.details?.spouse_phone
                ? errors.details?.spouse_phone
                : undefined
            }
            placeholder="Spouse phone number"
          />
        </div>
      )}

      <h4 className="pt-2 pb-2 font-medium border-b text-slate-900 border-slate-200">
        Next of Kin
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Next of Kin Name"
          name="details.next_of_kin_name"
          value={values.details?.next_of_kin_name || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.next_of_kin_name
              ? errors.details?.next_of_kin_name
              : undefined
          }
          placeholder="Full name"
        />
        <Input
          label="Next of Kin Phone"
          name="details.next_of_kin_phone"
          value={values.details?.next_of_kin_phone || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.next_of_kin_phone
              ? errors.details?.next_of_kin_phone
              : undefined
          }
          placeholder="Phone number"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Relationship"
          name="details.next_of_kin_relationship"
          value={values.details?.next_of_kin_relationship || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.next_of_kin_relationship
              ? errors.details?.next_of_kin_relationship
              : undefined
          }
        >
          <option value="">Select Relationship</option>
          {relationshipOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Input
          label="Next of Kin Address"
          name="details.next_of_kin_address"
          value={values.details?.next_of_kin_address || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.next_of_kin_address
              ? errors.details?.next_of_kin_address
              : undefined
          }
          placeholder="Address"
        />
      </div>
    </div>
  );
};

// Tab 7: Banking
const BankingTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Bank Name"
          name="details.bank_name"
          value={values.details?.bank_name || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.bank_name ? errors.details?.bank_name : undefined
          }
          placeholder="e.g., First Bank"
        />
        <Input
          label="Account Number"
          name="details.account_number"
          value={values.details?.account_number || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.details?.account_number
              ? errors.details?.account_number
              : undefined
          }
          placeholder="10-digit account number"
        />
      </div>
      <Input
        label="Account Name"
        name="details.account_name"
        value={values.details?.account_name || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          touched.details?.account_name
            ? errors.details?.account_name
            : undefined
        }
        placeholder="Account holder name"
      />
    </div>
  );
};

// Tab 8: Education
const EducationTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, setFieldValue } = formik;

  const getEducationError = (
    index: number,
    field: string,
  ): string | undefined => {
    if (!Array.isArray(errors.education)) return undefined;
    const educationErrors = errors.education as Array<
      Record<string, string> | undefined
    >;
    return educationErrors[index]?.[field];
  };

  const isEducationTouched = (index: number, field: string): boolean => {
    if (!Array.isArray(touched.education)) return false;
    const educationTouched = touched.education as Array<
      Record<string, boolean> | undefined
    >;
    return Boolean(educationTouched[index]?.[field]);
  };

  const addEducation = () => {
    const newEducation: Partial<StaffEducation> = {
      institution: "",
      type: "Tertiary",
      start_date: "",
    };
    setFieldValue("education", [...(values.education || []), newEducation]);
  };

  const removeEducation = (index: number) => {
    const updated = values.education?.filter((_, i) => i !== index) || [];
    setFieldValue("education", updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h4 className="font-medium text-slate-900">Educational History</h4>
        <div className="flex justify-end w-full sm:w-max">
          <Button
            type="button"
            size="sm"
            onClick={addEducation}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Education
          </Button>
        </div>
      </div>

      {values.education && values.education.length > 0 ? (
        <div className="space-y-4">
          {values.education.map((edu, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg border-slate-200 bg-slate-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Institution"
                  name={`education.${index}.institution`}
                  value={edu.institution || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    isEducationTouched(index, "institution")
                      ? getEducationError(index, "institution")
                      : undefined
                  }
                  placeholder="Institution name"
                  required
                />
                <Input
                  label="Course/Degree"
                  name={`education.${index}.course`}
                  value={edu.course || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    isEducationTouched(index, "course")
                      ? getEducationError(index, "course")
                      : undefined
                  }
                  placeholder="Course of study"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-3">
                <Select
                  label="Type"
                  name={`education.${index}.type`}
                  value={edu.type || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    isEducationTouched(index, "type")
                      ? getEducationError(index, "type")
                      : undefined
                  }
                  required
                >
                  <option value="">Select Type</option>
                  {educationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Start Date"
                  name={`education.${index}.start_date`}
                  type="date"
                  value={edu.start_date || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    isEducationTouched(index, "start_date")
                      ? getEducationError(index, "start_date")
                      : undefined
                  }
                  required
                />
                <Input
                  label="End Date"
                  name={`education.${index}.end_date`}
                  type="date"
                  value={edu.end_date || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    isEducationTouched(index, "end_date")
                      ? getEducationError(index, "end_date")
                      : undefined
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-lg border-slate-300">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="mb-2 text-sm font-medium text-slate-600">
            No education records added
          </p>
          <p className="mb-4 text-xs text-slate-500">
            Click &quot;Add Education&quot; to add educational qualifications
          </p>
        </div>
      )}
    </div>
  );
};

// Tab 9: Review
const ReviewTab: React.FC<{
  formik: FormikProps<EditStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
}> = ({ formik, genericData }) => {
  const { values, setFieldValue } = formik;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <h3 className="text-lg font-bold text-emerald-900 mb-4">
          Staff Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Full Name
              </p>
              <p className="text-slate-900 font-medium">
                {values.surname} {values.first_name} {values.other_names}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Service Number
              </p>
              <p className="text-slate-900 font-medium">
                {values.service_no || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Department
              </p>
              <p className="text-slate-900 font-medium">
                {values.department || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Work Distribution
              </p>
              <p className="text-slate-900 font-medium">
                {getWorkDistributionName(
                  values.work_distribution_id,
                  genericData?.work_distributions,
                ) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Training Institute
              </p>
              <p className="text-slate-900 font-medium">
                {getTrainingInstituteName(
                  values.training_institute_id,
                  genericData?.training_institutes,
                ) || "N/A"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Directorate
              </p>
              <p className="text-slate-900 font-medium">
                {getDirectorateName(
                  values.directorate_id,
                  genericData?.directorates,
                ) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Staff Status
              </p>
              <p className="text-slate-900 font-medium">
                {getStaffStatusName(
                  values.staff_status_id,
                  genericData?.statuses,
                ) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Present Rank
              </p>
              <p className="text-slate-900 font-medium">
                {getRankName(values.present_rank, genericData?.rankings) ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Assigned State
              </p>
              <p className="text-slate-900 font-medium">
                {getStateName(values.assigned_state, genericData?.states) ||
                  "Not Provided"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Custodial Center
              </p>
              <p className="text-slate-900 font-medium">
                {getPrisonName(values.prison, genericData?.prisons) ||
                  "Not Provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={(e) => setFieldValue("status", Number(e.target.value))}
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </Select>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white">
          <input
            type="checkbox"
            id="is_verified"
            checked={values.is_verified === true}
            onChange={(e) => setFieldValue("is_verified", e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label
            htmlFor="is_verified"
            className="text-sm font-medium text-slate-700"
          >
            Mark as Verified Staff
          </label>
        </div>
      </div>

      <div className="p-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50">
        <p className="text-sm font-medium text-emerald-900">
          Changes will be submitted as a change request for approval.
        </p>
        <p className="text-xs text-emerald-700 mt-1">
          Review all information before saving your changes.
        </p>
      </div>
    </div>
  );
};

// Main EditStaffFormPage Component
const EditStaffFormPage: React.FC = () => {
  const { serviceNo: urlServiceNo } = useParams<{ serviceNo: string }>();
  const { user } = useAuth();
  // Use URL param if available, otherwise use current user's service_no (for profile edit)
  const serviceNo =
    urlServiceNo || (user && isStaffUser(user) ? user.service_no : undefined);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Determine if user is changing their own password
  const isOwnPassword =
    user && isStaffUser(user) && user.service_no === serviceNo;

  const { data: staffData, isLoading: isLoadingStaff } = useStaff(
    serviceNo || "",
    !!serviceNo,
  );
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();
  const updateStaff = useUpdateStaff();

  const initialValues: EditStaffFormValues = staffData?.data
    ? {
        service_no: staffData.data.service_no,
        surname: staffData.data.surname,
        first_name: staffData.data.first_name,
        other_names: staffData.data.other_names || "",
        email: staffData.data.email || "",
        phone_number: staffData.data.phone_number || "",
        sex: staffData.data.sex,
        status: staffData.data.status,
        department: staffData.data.department || "",
        duty: staffData.data.duty || "",
        work_distribution_id: staffData.data.work_distribution_id,
        training_institute_id: staffData.data.training_institute_id,
        directorate_id: staffData.data.directorate_id,
        staff_status_id: staffData.data.staff_status_id,
        present_rank: extractRankId(staffData.data.present_rank),
        initial_rank: extractRankId(staffData.data.initial_rank),
        level: staffData.data.level,
        step: staffData.data.step || "",
        assigned_state:
          getStateId(staffData.data.assigned_state, genericData?.states) ||
          staffData.data.assigned_state ||
          "",
        prison: staffData.data.prison || "",
        dob: formatDateForInput(staffData.data.dob),
        date_of_first_appointment: formatDateForInput(
          staffData.data.date_of_first_appointment,
        ),
        present_appointment_date: formatDateForInput(
          staffData.data.present_appointment_date,
        ),
        command_post_date: formatDateForInput(staffData.data.command_post_date),
        state_of_origin: staffData.data.state_of_origin || "",
        lga: staffData.data.lga || "",
        initial_command:
          getStateName(staffData.data.initial_command, genericData?.states) ||
          "",
        present_command:
          getStateName(staffData.data.present_command, genericData?.states) ||
          "",
        file_no: staffData.data.file_no || "",
        ippis: staffData.data.ippis || "",
        description: staffData.data.description || "",
        is_verified: formatBooleanForInput(staffData.data.is_verified),
        photo: staffData.data.photo || undefined,
        details: staffData.data.details
          ? {
              ...staffData.data.details,
              is_deformed: formatBooleanForInput(
                staffData.data.details.is_deformed,
              ),
              is_convicted: formatBooleanForInput(
                staffData.data.details.is_convicted,
              ),
            }
          : {},
        education: (staffData.data.education || []).map((edu) => ({
          ...edu,
          start_date: formatDateForInput(edu.start_date),
          end_date: formatDateForInput(edu.end_date),
        })),
      }
    : {
        service_no: "",
        surname: "",
        first_name: "",
        other_names: "",
        email: "",
        phone_number: "",
        sex: undefined,
        status: 1,
        department: "",
        duty: "",
        work_distribution_id: undefined,
        training_institute_id: undefined,
        directorate_id: undefined,
        staff_status_id: undefined,
        present_rank: "",
        initial_rank: "",
        level: undefined,
        step: "",
        assigned_state: "",
        prison: "",
        dob: "",
        date_of_first_appointment: "",
        present_appointment_date: "",
        command_post_date: "",
        state_of_origin: "",
        lga: "",
        initial_command: "",
        present_command: "",
        file_no: "",
        ippis: "",
        description: "",
        is_verified: false,
        photo: undefined,
        details: {},
        education: [],
      };

  // Handle save
  const handleSave = async (
    values: EditStaffFormValues,
    formikHelpers?: { resetForm: () => void },
  ) => {
    if (!serviceNo) return;

    setIsSaving(true);
    try {
      // Extract only changed fields
      const changedFields = getChangedFields(values, initialValues);

      const submitData: CreateStaffDTO = {
        ...changedFields,
        photo:
          changedFields.photo instanceof File ? changedFields.photo : undefined,
      } as CreateStaffDTO;

      await updateStaff.mutateAsync({
        serviceNo,
        data: submitData,
      });

      // Wait for React Query to refetch and Formik to reinitialize with fresh data
      // This prevents form state accumulation across multiple saves
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Reset form to clear dirty state and use fresh initialValues from refetched data
      if (formikHelpers) {
        formikHelpers.resetForm();
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>Changes have been submitted for approval!</span>
        </div>,
        {
          icon: false,
        },
      );
    } catch (error: unknown) {
      const is404 =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404;

      if (is404) {
        toast.error(
          "This staff record is currently pending approval. Please wait for the approval process to complete.",
        );
      } else {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-b-4 rounded-full animate-spin border-emerald-600"></div>
          <p className="text-slate-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  if (!staffData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Staff Not Found
          </h2>
          <p className="text-slate-600 mb-4">
            The staff record you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => navigate(ROUTES.STAFF_DIRECTORY)}>
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => {
              if (user && isStaffUser(user)) {
                navigate(ROUTES.PROFILE);
              } else {
                navigate(ROUTES.STAFF_DIRECTORY);
              }
            }}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            {user && isStaffUser(user)
              ? "Back to Profile"
              : "Back to Staff Directory"}
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Staff Record
              </h1>
              <p className="text-slate-900 font-medium">
                Please note that all updates are subject to verification from
                RIMS department.
              </p>
              <p className="text-slate-600">
                {staffData.data.surname} {staffData.data.first_name} (
                {staffData.data.service_no})
              </p>
            </div>
            <div className="shrink-0">
              <Button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                <Key className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Change Password</span>
                <span className="sm:hidden">Password</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Formik
        key={staffData?.data?.updated_at || serviceNo}
        initialValues={initialValues}
        onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize
      >
        {(formik) => (
          <Form>
            {/* Tab Navigation */}
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto py-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                {activeTab === "basic" && (
                  <BasicInfoTab
                    formik={formik}
                    genericData={genericData}
                    isLoadingGeneric={isLoadingGeneric}
                  />
                )}
                {activeTab === "posting" && (
                  <PostingOriginTab
                    formik={formik}
                    genericData={genericData}
                    isLoadingGeneric={isLoadingGeneric}
                  />
                )}
                {activeTab === "identity" && (
                  <IdentityDocsTab formik={formik} />
                )}
                {activeTab === "physical" && (
                  <PhysicalMedicalTab
                    formik={formik}
                    genericData={genericData}
                    isLoadingGeneric={isLoadingGeneric}
                  />
                )}
                {activeTab === "addresses" && <AddressesTab formik={formik} />}
                {activeTab === "family" && (
                  <FamilyNOKTab
                    formik={formik}
                    genericData={genericData}
                    isLoadingGeneric={isLoadingGeneric}
                  />
                )}
                {activeTab === "banking" && <BankingTab formik={formik} />}
                {activeTab === "education" && <EducationTab formik={formik} />}
                {activeTab === "review" && (
                  <ReviewTab formik={formik} genericData={genericData} />
                )}

                {/* Save Button - Fixed at bottom of card */}
                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    disabled={
                      isSaving || updateStaff.isPending || !formik.dirty
                    }
                    isLoading={isSaving || updateStaff.isPending}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        serviceNo={serviceNo || ""}
        staffName={
          staffData?.data
            ? `${staffData.data.surname} ${staffData.data.first_name}`
            : undefined
        }
        isOwnPassword={!!isOwnPassword}
      />
    </div>
  );
};

export default EditStaffFormPage;
