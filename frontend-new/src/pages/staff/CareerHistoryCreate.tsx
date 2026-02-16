import { useId, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateCareerRecord,
  type CareerFieldChanged,
} from "@/lib/api/staff-career-history";
import { useStaff } from "@/lib/api/staff/staffService";
import { useGenericData } from "@/lib/api/statistics";
import { ROUTES } from "@/routes/constants";

const SelectField: React.FC<
  {
    label: string;
  } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, id, className, required, children, ...props }) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        id={selectId}
        required={required}
        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 border-slate-300 focus:ring-ncos-green-500 ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

const TextareaField: React.FC<
  {
    label: string;
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ label, id, className, ...props }) => {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`flex min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 border-slate-300 focus:ring-ncos-green-500 ${
          className || ""
        }`}
        {...props}
      />
    </div>
  );
};

export default function CareerHistoryCreate() {
  const { serviceNo } = useParams<{ serviceNo: string }>();
  const navigate = useNavigate();
  const staffServiceNo = serviceNo || "";
  const createCareerRecord = useCreateCareerRecord();

  // Fetch staff data and generic data for dropdowns
  const { data: staffData, isLoading: isLoadingStaff } =
    useStaff(staffServiceNo);
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();

  const [fieldChanged, setFieldChanged] = useState<CareerFieldChanged | "">("");
  const [newValue, setNewValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [reason, setReason] = useState("");

  // Get the current staff's present rank and command
  const staff = staffData?.data;

  // Get staff full name for display
  const staffFullName = staff
    ? `${staff.surname} ${staff.first_name}${staff.other_names ? ` ${staff.other_names}` : ""}`
    : "";

  // Helper to extract ID from a value that could be number, string, or object
  const extractId = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "object" && value !== null && "id" in value) {
      return String((value as { id: number | string }).id);
    }
    return String(value);
  };

  // Get the current old value ID (used for filtering dropdowns)
  const currentOldValueId = useMemo(() => {
    if (!staff || !fieldChanged) return "";

    if (fieldChanged === "present_rank") {
      return extractId(staff.present_rank);
    } else if (fieldChanged === "present_command") {
      return extractId(staff.present_command);
    }
    return "";
  }, [fieldChanged, staff]);

  // Get the current old value as a name/title (used for display and payload)
  const currentOldValueName = useMemo(() => {
    if (!currentOldValueId || !fieldChanged) return "";

    if (fieldChanged === "present_rank" && genericData?.rankings) {
      const rank = genericData.rankings.find(
        (r) => String(r.id) === currentOldValueId,
      );
      return rank?.title || "";
    }

    if (fieldChanged === "present_command" && genericData?.states) {
      const state = genericData.states.find(
        (s) => String(s.id) === currentOldValueId,
      );
      return state?.state || "";
    }

    return "";
  }, [currentOldValueId, fieldChanged, genericData]);

  // Check if data is loading
  const isLoading = isLoadingStaff || isLoadingGeneric;

  // Handle field type change - reset new value
  const handleFieldChange = (value: string) => {
    setFieldChanged(value as CareerFieldChanged | "");
    setNewValue(""); // Reset new value when field type changes
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fieldChanged || !newValue.trim()) {
      toast.error("Type of change and new value are required.");
      return;
    }

    createCareerRecord.mutate(
      {
        serviceNo: staffServiceNo,
        data: {
          field_changed: fieldChanged,
          new_value: newValue.trim(),
          old_value: currentOldValueName || undefined,
          effective_date: effectiveDate ? effectiveDate : undefined,
          reason: reason.trim() ? reason.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Career record added successfully");
          navigate(
            ROUTES.CAREER_HISTORY_VIEW.replace(":serviceNo", staffServiceNo),
          );
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to add career record");
        },
      },
    );
  };

  if (!staffServiceNo) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Career Record</CardTitle>
              <CardDescription>
                Staff service number was not provided.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(ROUTES.STAFF_DIRECTORY)}>
                Back to Staff Directory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        <button
          onClick={() =>
            navigate(
              ROUTES.CAREER_HISTORY_VIEW.replace(":serviceNo", staffServiceNo),
            )
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ncos-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Career History
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Add Career Record</CardTitle>
            <CardDescription>
              {staffFullName ? `${staffFullName} (${staffServiceNo})` : `Staff: ${staffServiceNo}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <SelectField
                label="Type of Change"
                required
                value={fieldChanged}
                onChange={(event) => handleFieldChange(event.target.value)}
                disabled={isLoading}
              >
                <option value="">Select type</option>
                <option value="present_rank">Rank Change</option>
                <option value="present_command">Command Change</option>
              </SelectField>

              {/* Current Value - shows current value based on field type (read-only) */}
              {fieldChanged === "present_rank" && (
                <div className="w-full space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Current Rank
                  </label>
                  <div className="flex h-10 w-full items-center rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700 border-slate-300">
                    {currentOldValueName || "No current rank"}
                  </div>
                </div>
              )}

              {fieldChanged === "present_command" && (
                <div className="w-full space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Current Command (State)
                  </label>
                  <div className="flex h-10 w-full items-center rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700 border-slate-300">
                    {currentOldValueName || "No current command"}
                  </div>
                </div>
              )}

              {!fieldChanged && (
                <div className="text-sm text-slate-500 italic py-2">
                  Select type of change first to see current value
                </div>
              )}

              {/* New Value - dropdown based on field type */}
              {fieldChanged === "present_rank" && (
                <SelectField
                  label="New Rank"
                  required
                  value={newValue}
                  onChange={(event) => setNewValue(event.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select new rank</option>
                  {genericData?.rankings
                    ?.filter((rank) => String(rank.id) !== currentOldValueId)
                    .map((rank) => (
                      <option key={rank.id} value={rank.title}>
                        {rank.title}
                      </option>
                    ))}
                </SelectField>
              )}

              {fieldChanged === "present_command" && (
                <SelectField
                  label="New Command (State)"
                  required
                  value={newValue}
                  onChange={(event) => setNewValue(event.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select new command</option>
                  {genericData?.states
                    ?.filter((state) => String(state.id) !== currentOldValueId)
                    .map((state) => (
                      <option key={state.id} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                </SelectField>
              )}

              {!fieldChanged && (
                <div className="text-sm text-slate-500 italic py-2">
                  Select type of change first to see new value options
                </div>
              )}

              <Input
                label="Effective Date"
                type="date"
                value={effectiveDate}
                onChange={(event) => setEffectiveDate(event.target.value)}
              />

              <TextareaField
                label="Reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Optional reason for the change"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      ROUTES.CAREER_HISTORY_VIEW.replace(
                        ":serviceNo",
                        staffServiceNo,
                      ),
                    )
                  }
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={createCareerRecord.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
