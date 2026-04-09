import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, FormikProps } from "formik";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  AlertCircle,
  User,
  Briefcase,
  MapPin,
  CheckCircle,
  Upload,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStaff, CreateStaffDTO, sexOptions } from "@/lib/api/staff";
import { getFileUrl, useGenericData } from "@/lib/api";
import { ROUTES } from "@/routes/constants";
import {
  getDirectorateName,
  getPrisonName,
  getRankName,
  getStaffStatusName,
  getStateName,
  getTrainingInstituteName,
  getWorkDistributionName,
} from "@/lib/helpers/genericDataHelpers";

// Form values type for Create (Staff table only - no details or education)
interface CreateStaffFormValues {
  // Personal
  surname: string;
  first_name: string;
  other_names: string;
  sex?: string;
  dob: string;
  email: string;
  phone_number: string;
  photo?: File | string;

  // Official
  service_no: string;
  department: string;
  duty: string;
  work_distribution_id?: number;
  training_institute_id?: number;
  directorate_id?: number;
  staff_status_id?: number;
  present_rank: string;
  initial_rank: string;
  level?: number;
  step: string;
  ippis: string;
  file_no: string;

  // Posting
  state_of_origin: string;
  lga: string;
  assigned_state: string;
  prison: string;
  initial_command: string;
  present_command: string;
  command_post_date: string;
  date_of_first_appointment: string;
  present_appointment_date: string;

  // Status
  status: number;
  is_verified: boolean;
  description: string;
}

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: StepConfig[] = [
  {
    id: 1,
    title: "Personal Info",
    description: "Basic personal details",
    icon: User,
  },
  {
    id: 2,
    title: "Official Info",
    description: "Service and rank details",
    icon: Briefcase,
  },
  {
    id: 3,
    title: "Posting & Origin",
    description: "Location and posting",
    icon: MapPin,
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Confirm and submit",
    icon: CheckCircle,
  },
];

// Validation schemas for each step
const step1Schema = z.object({
  surname: z.string().min(1, "Surname is required"),
  first_name: z.string().min(1, "First name is required"),
  other_names: z.string().optional(),
  sex: z
    .enum(["Male", "Female"], { message: "Please select gender" })
    .optional(),
  dob: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone_number: z.string().optional(),
});

const step2Schema = z.object({
  service_no: z.string().min(1, "Service number is required"),
  department: z.string().min(1, "Department is required"),
  duty: z.string().optional(),
  work_distribution_id: z.number().int().optional(),
  training_institute_id: z.number().int().optional(),
  directorate_id: z.number().int().optional(),
  staff_status_id: z.number().int().optional(),
  present_rank: z.string().min(1, "Present rank is required"),
  initial_rank: z.string().optional(),
  level: z.number().int().min(1).max(17).optional(),
  step: z.string().optional(),
  ippis: z.string().optional(),
  file_no: z.string().optional(),
});

const step3Schema = z.object({
  state_of_origin: z.string().optional(),
  lga: z.string().optional(),
  assigned_state: z.string().optional(),
  prison: z.string().optional(),
  initial_command: z.string().optional(),
  present_command: z.string().optional(),
  command_post_date: z.string().optional(),
  date_of_first_appointment: z.string().optional(),
  present_appointment_date: z.string().optional(),
});

const step4Schema = z.object({
  status: z.number().int().min(0).max(1),
  is_verified: z.boolean().optional(),
  description: z.string().optional(),
});

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema];

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

const PhotoUpload: React.FC<{
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    if (typeof value === "string" && value) {
      setPreviewUrl(getFileUrl(value));
      return;
    }
    setPreviewUrl(null);
  }, [value]);

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

// Step indicator component - Vertical on desktop, horizontal on mobile
const StepIndicator: React.FC<{
  currentStep: number;
  completedSteps: Set<number>;
}> = ({ currentStep, completedSteps }) => {
  return (
    <>
      {/* Desktop - Vertical */}
      <div className="hidden lg:flex flex-col gap-2">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.has(index);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step circle and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-16 mt-2 transition-colors duration-300 ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
              {/* Step text */}
              <div className="pt-1">
                <p
                  className={`font-semibold text-sm ${
                    isActive
                      ? "text-emerald-700"
                      : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile - Horizontal */}
      <div className="flex lg:hidden items-center justify-between mb-6 px-2">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.has(index);
          const Icon = step.icon;
          const showLine = index < steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <p
                  className={`text-xs mt-1 font-medium text-center ${
                    isActive
                      ? "text-emerald-700"
                      : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {showLine && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-5 transition-colors duration-300 ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

// Step 1: Personal Info
const PersonalInfoStep: React.FC<{
  formik: FormikProps<CreateStaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Surname"
          name="surname"
          value={values.surname}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.surname ? errors.surname : undefined}
          placeholder="Enter surname"
          required
        />
        <Input
          label="First Name"
          name="first_name"
          value={values.first_name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.first_name ? errors.first_name : undefined}
          placeholder="Enter first name"
          required
        />
      </div>
      <Input
        label="Other Names"
        name="other_names"
        value={values.other_names}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.other_names ? errors.other_names : undefined}
        placeholder="Enter other names (optional)"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          value={values.dob}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.dob ? errors.dob : undefined}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : undefined}
          placeholder="email@example.com"
        />
        <Input
          label="Phone Number"
          name="phone_number"
          value={values.phone_number}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.phone_number ? errors.phone_number : undefined}
          placeholder="08012345678"
        />
      </div>
      <PhotoUpload
        value={values.photo}
        onChange={(file) => setFieldValue("photo", file)}
        error={touched.photo ? (errors.photo as string) : undefined}
      />
    </div>
  );
};

// Step 2: Official Info
const OfficialInfoStep: React.FC<{
  formik: FormikProps<CreateStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Service Number"
          name="service_no"
          value={values.service_no}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.service_no ? errors.service_no : undefined}
          placeholder="e.g., 00001"
          required
        />
        <Input
          label="IPPIS Number"
          name="ippis"
          value={values.ippis}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.ippis ? errors.ippis : undefined}
          placeholder="e.g., 123456789"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Department"
          name="department"
          value={values.department}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.department ? errors.department : undefined}
          placeholder="e.g., Administration"
          required
        />
        <Input
          label="Duty / Role"
          name="duty"
          value={values.duty}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.duty ? errors.duty : undefined}
          placeholder="e.g., Registry Officer"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Present Rank"
          name="present_rank"
          value={values.present_rank}
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
          value={values.initial_rank}
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <Input
          label="Step"
          name="step"
          value={values.step}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.step ? errors.step : undefined}
          placeholder="e.g., 1"
        />
        <Input
          label="File Number"
          name="file_no"
          value={values.file_no}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.file_no ? errors.file_no : undefined}
          placeholder="File No."
        />
      </div>
    </div>
  );
};

// Step 3: Posting & Origin
const PostingOriginStep: React.FC<{
  formik: FormikProps<CreateStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  // Filter LGAs based on selected state_of_origin
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
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h4 className="font-medium text-slate-900">Origin</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="State of Origin"
          name="state_of_origin"
          value={values.state_of_origin}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.state_of_origin ? errors.state_of_origin : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select State</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.state}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="LGA"
          name="lga"
          value={values.lga}
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

      <div className="pb-2 border-b border-slate-200 pt-4">
        <h4 className="font-medium text-slate-900">Current Posting</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Assigned State"
          name="assigned_state"
          value={values.assigned_state}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.assigned_state ? errors.assigned_state : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select State</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="Custodial Center"
          name="prison"
          value={values.prison}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.prison ? errors.prison : undefined}
          disabled={isLoadingGeneric || !values.assigned_state}
        >
          <option value="">
            {values.assigned_state ? "Select Center" : "Select State First"}
          </option>
          {filteredPrisons.map((prison) => (
            <option key={prison.id} value={prison.id}>
              {prison.prison_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Initial Command"
          name="initial_command"
          value={values.initial_command}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.initial_command ? errors.initial_command : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select Command</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
        <Select
          label="Present Command"
          name="present_command"
          value={values.present_command}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.present_command ? errors.present_command : undefined}
          disabled={isLoadingGeneric}
        >
          <option value="">Select Command</option>
          {genericData?.states?.map((state) => (
            <option key={state.id} value={state.id}>
              {state.state}
            </option>
          ))}
        </Select>
      </div>

      <div className="pb-2 border-b border-slate-200 pt-4">
        <h4 className="font-medium text-slate-900">Important Dates</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="First Appointment Date"
          name="date_of_first_appointment"
          type="date"
          value={values.date_of_first_appointment}
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
          value={values.present_appointment_date}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.present_appointment_date
              ? errors.present_appointment_date
              : undefined
          }
        />
        <Input
          label="Command Post Date"
          name="command_post_date"
          type="date"
          value={values.command_post_date}
          onChange={handleChange}
          onBlur={handleBlur}
          error={
            touched.command_post_date ? errors.command_post_date : undefined
          }
        />
      </div>
    </div>
  );
};

// Step 4: Review & Submit
const ReviewStep: React.FC<{
  formik: FormikProps<CreateStaffFormValues>;
  genericData: ReturnType<typeof useGenericData>["data"];
}> = ({ formik, genericData }) => {
  const { values, setFieldValue } = formik;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
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
                {values.service_no || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Department
              </p>
              <p className="text-slate-900 font-medium">
                {values.department || "Not provided"}
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
                ) || "Not provided"}
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
                ) || "Not provided"}
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
                ) || "Not provided"}
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
                ) || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Present Rank
              </p>
              <p className="text-slate-900 font-medium">
                {getRankName(values.present_rank, genericData?.rankings) ||
                  "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Assigned State
              </p>
              <p className="text-slate-900 font-medium">
                {getStateName(values.assigned_state, genericData?.states) ||
                  "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Custodial Center
              </p>
              <p className="text-slate-900 font-medium">
                {getPrisonName(values.prison, genericData?.prisons) ||
                  "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Controls */}
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
            checked={values.is_verified}
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

      {/* Info Banner */}
      <div className="p-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50">
        <p className="text-sm font-medium text-emerald-900">
          Ready to submit? Review all information above before creating the
          staff record.
        </p>
        <p className="text-xs text-emerald-700 mt-1">
          A new staff creation request will be submitted for approval.
        </p>
      </div>
    </div>
  );
};

// Main CreateStaffFormPage Component
const CreateStaffFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();
  const createStaff = useCreateStaff();

  const initialValues: CreateStaffFormValues = {
    surname: "",
    first_name: "",
    other_names: "",
    sex: undefined,
    dob: "",
    email: "",
    phone_number: "",
    photo: undefined,
    service_no: "",
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
    ippis: "",
    file_no: "",
    state_of_origin: "",
    lga: "",
    assigned_state: "",
    prison: "",
    initial_command: "",
    present_command: "",
    command_post_date: "",
    date_of_first_appointment: "",
    present_appointment_date: "",
    status: 1,
    is_verified: false,
    description: "",
  };

  // Validate current step
  const validateStep = (values: CreateStaffFormValues): string[] => {
    const schema = stepSchemas[currentStep];
    try {
      schema.parse(values);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map((e) => e.message);
      }
      return ["Validation failed"];
    }
  };

  // Handle next step - explicitly prevent any form submission
  const handleNext = (
    e: React.MouseEvent<HTMLButtonElement>,
    values: CreateStaffFormValues,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const errors = validateStep(values);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  // Handle previous step
  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle form submission
  const handleSubmit = async (values: CreateStaffFormValues) => {
    try {
      const submitData: CreateStaffDTO = {
        ...values,
        photo: values.photo instanceof File ? values.photo : undefined,
      };
      await createStaff.mutateAsync(submitData);
      toast.success("Staff creation request submitted successfully!");
      navigate(ROUTES.STAFF_DIRECTORY);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(ROUTES.STAFF_DIRECTORY)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Staff Directory
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            New Staff Registration
          </h1>
          <p className="text-slate-600 mt-1">
            Complete all steps to create a new staff record
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Step Indicator - Left side on desktop */}
          <div className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-8">
              <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validateOnBlur={true}
              validateOnChange={false}
            >
              {(formik) => (
                <Form>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Step Header */}
                    <div className="px-6 py-4 bg-linear-to-r from-emerald-600 to-teal-600">
                      <div className="flex items-center gap-3">
                        {React.createElement(steps[currentStep].icon, {
                          className: "w-6 h-6 text-white/90",
                        })}
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {steps[currentStep].title}
                          </h2>
                          <p className="text-sm text-white/80">
                            {steps[currentStep].description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-6">
                      {currentStep === 0 && (
                        <PersonalInfoStep formik={formik} />
                      )}
                      {currentStep === 1 && (
                        <OfficialInfoStep
                          formik={formik}
                          genericData={genericData}
                          isLoadingGeneric={isLoadingGeneric}
                        />
                      )}
                      {currentStep === 2 && (
                        <PostingOriginStep
                          formik={formik}
                          genericData={genericData}
                          isLoadingGeneric={isLoadingGeneric}
                        />
                      )}
                      {currentStep === 3 && (
                        <ReviewStep formik={formik} genericData={genericData} />
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(e) => handlePrev(e)}
                        disabled={currentStep === 0}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>

                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={(e) => handleNext(e, formik.values)}
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                          disabled={createStaff.isPending}
                          isLoading={createStaff.isPending}
                        >
                          <Save className="w-4 h-4" />
                          Create Staff
                        </Button>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaffFormPage;
