import React, { useState, useRef } from "react";
import {
  Formik,
  Form,
  type FormikHelpers,
  type FormikProps,
  type FormikErrors,
} from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  MapPin,
  FileText,
  Check,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateStaff,
  useUpdateStaff,
  Staff,
  CreateStaffFormData,
  createStaffSchema,
  sexOptions,
} from "@/lib/api/staff";
import { getFileUrl, useGenericData } from "@/lib/api";
import { getStateId, getStateName } from "@/lib/helpers/genericDataHelpers";

// Form values type that allows photo to be File or string (for edit mode)
type StaffFormValues = Omit<CreateStaffFormData, "photo"> & {
  photo?: File | string;
};

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: Staff | null;
  onSuccess?: () => void;
}

interface StepConfig {
  id: number;
  title: string;
  icon: React.ElementType;
  fields: string[]; // Fields that belong to this step
}

const steps: StepConfig[] = [
  {
    id: 1,
    title: "Official Info",
    icon: Briefcase,
    fields: [
      "service_no",
      "ippis",
      "file_no",
      "department",
      "duty",
      "present_rank",
      "initial_rank",
      "level",
      "step",
    ],
  },
  {
    id: 2,
    title: "Personal Details",
    icon: User,
    fields: [
      "surname",
      "first_name",
      "other_names",
      "sex",
      "dob",
      "email",
      "phone_number",
    ],
  },
  {
    id: 3,
    title: "Posting & Origin",
    icon: MapPin,
    fields: [
      "state_of_origin",
      "lga",
      "assigned_state",
      "prison",
      "initial_command",
      "present_command",
      "command_post_date",
    ],
  },
  {
    id: 4,
    title: "Photos & Status",
    icon: FileText,
    fields: [
      "photo",
      "date_of_first_appointment",
      "present_appointment_date",
      "status",
      "is_verified",
    ],
  },
];

// Helper to get which step a field belongs to
const getStepForField = (fieldName: string): number => {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].fields.includes(fieldName)) {
      return i;
    }
  }
  return 0;
};

// Helper to get errors for a specific step
const getErrorsForStep = (
  errors: FormikErrors<StaffFormValues>,
  stepIndex: number,
): string[] => {
  const stepFields = steps[stepIndex].fields;
  return stepFields.filter((field) => errors[field as keyof StaffFormValues]);
};

// Helper to check if a step has errors
const stepHasErrors = (
  errors: FormikErrors<StaffFormValues>,
  stepIndex: number,
): boolean => {
  return getErrorsForStep(errors, stepIndex).length > 0;
};

// Stepper component with error indicators
const Stepper: React.FC<{
  currentStep: number;
  steps: StepConfig[];
  errors: FormikErrors<StaffFormValues>;
  onStepClick?: (step: number) => void;
}> = ({ currentStep, steps, errors, onStepClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const hasErrors = stepHasErrors(errors, index);

        return (
          <React.Fragment key={step.id}>
            <div
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onStepClick?.(index)}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 group-hover:scale-105 ${
                  hasErrors
                    ? "bg-red-50 border-red-500 text-red-500"
                    : isCompleted
                      ? "bg-ncos-green-600 border-ncos-green-600 text-white"
                      : isActive
                        ? "bg-ncos-green-50 border-ncos-green-600 text-ncos-green-600"
                        : "bg-slate-50 border-slate-300 text-slate-400"
                }`}
              >
                {hasErrors ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                {/* Error badge */}
                {hasErrors && (
                  <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                    !
                  </span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  hasErrors
                    ? "text-red-500"
                    : isActive || isCompleted
                      ? "text-ncos-green-600"
                      : "text-slate-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > index ? "bg-ncos-green-600" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Select component with enhanced error display
const Select: React.FC<
  {
    label?: string;
    error?: string;
    children: React.ReactNode;
  } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, error, children, className, id, ...props }) => {
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
          {error && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            error
              ? "border-red-500 focus:ring-red-500 bg-red-50"
              : "border-slate-300 focus:ring-ncos-green-500"
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

// Photo upload component
const PhotoUpload: React.FC<{
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string" && value) {
      setPreview(getFileUrl(value));
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Photo</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-20 h-20 border-2 rounded-lg border-slate-200"
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
            className="flex flex-col items-center justify-center w-20 h-20 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-ncos-green-500 hover:bg-ncos-green-50"
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

// Step 1: Official Info
const OfficialInfoStep: React.FC<{
  formik: FormikProps<StaffFormValues>;
  isEdit: boolean;
  genericData: ReturnType<typeof useGenericData>["data"];
  isLoadingGeneric: boolean;
}> = ({ formik, isEdit, genericData, isLoadingGeneric }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-4 duration-300 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Service Number"
          name="service_no"
          value={values.service_no}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.service_no ? errors.service_no : undefined}
          placeholder="e.g., 00001"
          disabled={isEdit}
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Department"
          name="department"
          value={values.department || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.department ? errors.department : undefined}
          placeholder="e.g., Administration"
        />
        <Input
          label="Duty / Role Description"
          name="duty"
          value={values.duty || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.duty ? errors.duty : undefined}
          placeholder="e.g., Registry Officer"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Present Rank"
          name="present_rank"
          value={values.present_rank || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.present_rank ? errors.present_rank : undefined}
          disabled={isLoadingGeneric}
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
      <Input
        label="Step"
        name="step"
        value={values.step || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.step ? errors.step : undefined}
        placeholder="e.g., 01"
      />
    </div>
  );
};

// Step 2: Personal Details
const PersonalDetailsStep: React.FC<{
  formik: FormikProps<StaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <div className="space-y-4 duration-300 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Surname"
          name="surname"
          value={values.surname}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.surname ? errors.surname : undefined}
          placeholder="Surname"
        />
        <Input
          label="First Name"
          name="first_name"
          value={values.first_name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.first_name ? errors.first_name : undefined}
          placeholder="First Name"
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
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
};

// Step 3: Posting & Origin
const PostingOriginStep: React.FC<{
  formik: FormikProps<StaffFormValues>;
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

  // Filter prisons based on selected assigned_state
  const filteredPrisons = React.useMemo(() => {
    const prisons = genericData?.prisons;
    const states = genericData?.states;

    if (!prisons || !states) return [];
    if (!values.assigned_state) return prisons;

    const selectedState = states.find(
      (state) => state.state === values.assigned_state,
    );
    if (!selectedState) return prisons;

    return prisons.filter((prison) => prison.state_id === selectedState.id);
  }, [genericData, values.assigned_state]);

  return (
    <div className="space-y-4 duration-300 animate-in fade-in slide-in-from-right-4">
      <h4 className="pb-2 font-medium border-b text-slate-900 border-slate-100">
        Origin
      </h4>
      <div className="grid grid-cols-2 gap-4">
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

      <h4 className="pt-2 pb-2 font-medium border-b text-slate-900 border-slate-100">
        Current Posting
      </h4>
      <div className="grid grid-cols-2 gap-4">
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
            <option key={state.id} value={state.state}>
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
            <option key={prison.id} value={prison.prison_name}>
              {prison.prison_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
            <option key={state.id} value={state.state}>
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
            <option key={state.id} value={state.state}>
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

// Step 4: Documents & Status
const DocumentsStep: React.FC<{
  formik: FormikProps<StaffFormValues>;
}> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="space-y-4 duration-300 animate-in fade-in slide-in-from-right-4">
      <PhotoUpload
        value={values.photo}
        onChange={(file) => setFieldValue("photo", file)}
        error={touched.photo ? (errors.photo as string) : undefined}
      />

      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={values.status}
          onChange={(e) => setFieldValue("status", Number(e.target.value))}
          onBlur={handleBlur}
          error={touched.status ? (errors.status as string) : undefined}
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </Select>
        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="is_verified"
            name="is_verified"
            checked={values.is_verified === true}
            onChange={(e) => setFieldValue("is_verified", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-ncos-green-600 focus:ring-ncos-green-500"
          />
          <label
            htmlFor="is_verified"
            className="ml-2 text-sm font-medium text-slate-700"
          >
            Verified Staff
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 mt-4 rounded-lg bg-ncos-green-50">
        <p className="mb-1 text-sm font-bold text-ncos-green-900">Summary:</p>
        <p className="text-sm text-ncos-green-800">
          {values.first_name} {values.surname} ({values.service_no})
        </p>
        <p className="text-sm text-ncos-green-800">
          {values.present_rank || "No rank"} -{" "}
          {values.department || "No department"}
        </p>
      </div>
    </div>
  );
};

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isEdit = !!staff;

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();

  const initialValues: StaffFormValues = staff
    ? {
        service_no: staff.service_no,
        surname: staff.surname,
        first_name: staff.first_name,
        other_names: staff.other_names || "",
        email: staff.email || "",
        phone_number: staff.phone_number || "",
        sex: staff.sex as "Male" | "Female" | undefined,
        status: staff.status,
        department: staff.department || "",
        duty: staff.duty || "",
        present_rank: staff.present_rank || "",
        initial_rank: staff.initial_rank || "",
        level: staff.level,
        step: staff.step || "",
        assigned_state:
          getStateId(staff.assigned_state, genericData?.states) ||
          staff.assigned_state ||
          "",
        prison: staff.prison || "",
        dob: staff.dob || "",
        date_of_first_appointment: staff.date_of_first_appointment || "",
        present_appointment_date: staff.present_appointment_date || "",
        command_post_date: staff.command_post_date || "",
        state_of_origin: staff.state_of_origin || "",
        lga: staff.lga || "",
        initial_command:
          getStateName(staff.initial_command, genericData?.states) || "",
        present_command:
          getStateName(staff.present_command, genericData?.states) || "",
        file_no: staff.file_no || "",
        ippis: staff.ippis || "",
        description: staff.description || "",
        is_verified: staff.is_verified || false,
        photo: staff.photo || undefined,
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
      };

  const handleSubmit = async (
    values: StaffFormValues,
    { setSubmitting }: FormikHelpers<StaffFormValues>,
  ) => {
    try {
      // Transform education array to ensure url is string only (not File)
      // File uploads for education documents would be handled separately
      const transformedEducation = values.education?.map((edu) => ({
        ...edu,
        url: edu.url instanceof File ? undefined : edu.url,
      }));

      // Transform photo - only include if it's a new File upload
      // String URLs (existing photos) are preserved for update, excluded for create
      const photoValue =
        values.photo instanceof File ? values.photo : undefined;

      // Build the submission data with properly typed fields
      const submitData = {
        ...values,
        education: transformedEducation,
        photo: photoValue,
        // Ensure is_verified is always a boolean
        is_verified: values.is_verified === true,
      };

      if (isEdit) {
        await updateStaff.mutateAsync({
          serviceNo: staff.service_no,
          data: submitData,
        });
        toast.success("Staff update request submitted successfully!");
      } else {
        await createStaff.mutateAsync(submitData);
        toast.success("Staff creation request submitted successfully!");
      }
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  // Reset form when modal closes or on successful submission
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const isPending = createStaff.isPending || updateStaff.isPending;

  // Handle form submission with validation
  const handleFormSubmit = async (formik: FormikProps<StaffFormValues>) => {
    // Validate all fields
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      // Mark all fields as touched to show errors
      const touchedFields: Record<string, boolean> = {};
      Object.keys(errors).forEach((key) => {
        touchedFields[key] = true;
      });
      formik.setTouched(touchedFields);

      // Find the first step with errors and navigate to it
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstErrorStep = getStepForField(errorFields[0]);
        setCurrentStep(firstErrorStep);

        // Count errors per step for the toast message
        const errorsByStep = steps.map(
          (_, idx) => getErrorsForStep(errors, idx).length,
        );
        const stepsWithErrors = errorsByStep
          .map((count, idx) => (count > 0 ? steps[idx].title : null))
          .filter(Boolean);

        toast.error(
          <div>
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 ml-4 text-sm list-disc">
              {stepsWithErrors.map((stepName) => (
                <li key={stepName}>{stepName} has missing/invalid fields</li>
              ))}
            </ul>
          </div>,
          { autoClose: 5000 },
        );
      }
      return;
    }

    // If no errors, submit the form
    formik.handleSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit Staff Profile" : "New Staff Registration"}
      description={
        isEdit
          ? "Update staff information. Changes will be submitted for approval."
          : "Register a new staff member. The request will be submitted for approval."
      }
      size="2xl"
      closeOnBackdrop={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(createStaffSchema)}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize
        key={isOpen ? "open" : "closed"}
      >
        {(formik) => (
          <Form>
            <Stepper
              currentStep={currentStep}
              steps={steps}
              errors={formik.errors}
              onStepClick={(step) => setCurrentStep(step)}
            />

            {/* Error summary banner */}
            {Object.keys(formik.errors).length > 0 &&
              formik.submitCount > 0 && (
                <div className="flex items-start gap-3 p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="w-5 h-5 mt-0.5 text-red-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Please correct the errors before submitting
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      Click on the highlighted steps above to navigate to fields
                      with errors
                    </p>
                  </div>
                </div>
              )}

            <div className="min-h-75">
              {currentStep === 0 && (
                <OfficialInfoStep
                  formik={formik}
                  isEdit={isEdit}
                  genericData={genericData}
                  isLoadingGeneric={isLoadingGeneric}
                />
              )}
              {currentStep === 1 && <PersonalDetailsStep formik={formik} />}
              {currentStep === 2 && (
                <PostingOriginStep
                  formik={formik}
                  genericData={genericData}
                  isLoadingGeneric={isLoadingGeneric}
                />
              )}
              {currentStep === 3 && <DocumentsStep formik={formik} />}
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0 || isPending}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => handleFormSubmit(formik)}
                  className="bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isPending}
                  disabled={isPending}
                >
                  {isEdit ? "Save Changes" : "Create Staff"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-ncos-green-900 hover:bg-ncos-green-800"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
