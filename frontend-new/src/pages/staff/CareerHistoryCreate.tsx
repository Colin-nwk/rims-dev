import { useId, useState } from "react";
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

  const [fieldChanged, setFieldChanged] = useState<CareerFieldChanged | "">("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [reason, setReason] = useState("");

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
          old_value: oldValue.trim() ? oldValue.trim() : undefined,
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
            <CardDescription>Staff: {staffServiceNo}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <SelectField
                label="Type of Change"
                required
                value={fieldChanged}
                onChange={(event) =>
                  setFieldChanged(event.target.value as CareerFieldChanged)
                }
              >
                <option value="">Select type</option>
                <option value="present_rank">Rank Change</option>
                <option value="present_command">Command Change</option>
              </SelectField>

              <Input
                label="Previous Value"
                value={oldValue}
                onChange={(event) => setOldValue(event.target.value)}
                placeholder="e.g. Corporal"
              />

              <Input
                label="New Value"
                required
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                placeholder="e.g. Sergeant"
              />

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
