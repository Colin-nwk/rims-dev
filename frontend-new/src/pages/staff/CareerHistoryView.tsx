import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useStaffCareerHistory,
  type StaffCareerHistory,
} from "@/lib/api/staff-career-history";
import { useStaff } from "@/lib/api/staff/staffService";
import { ROUTES } from "@/routes/constants";

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFieldMeta(field: StaffCareerHistory["field_changed"]) {
  if (field === "present_command") {
    return { label: "Command", badge: "bg-amber-100 text-amber-800" };
  }
  return { label: "Rank", badge: "bg-green-100 text-green-800" };
}

export default function CareerHistoryView() {
  const navigate = useNavigate();
  const { serviceNo } = useParams<{ serviceNo: string }>();
  const staffServiceNo = serviceNo || "";

  const {
    data: careerHistory,
    isLoading,
    error,
  } = useStaffCareerHistory(staffServiceNo, !!staffServiceNo);

  // Fetch staff data to get the name
  const { data: staffData } = useStaff(staffServiceNo);
  const staff = staffData?.data;
  const staffFullName = staff
    ? `${staff.surname} ${staff.first_name}${staff.other_names ? ` ${staff.other_names}` : ""}`
    : "";

  if (!staffServiceNo) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Career History</CardTitle>
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
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-4">
        <button
          onClick={() => navigate(ROUTES.STAFF_DIRECTORY)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ncos-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff Directory
        </button>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Career History</CardTitle>
              <CardDescription>
                {staffFullName ? `${staffFullName} (${staffServiceNo})` : `Staff: ${staffServiceNo}`}
              </CardDescription>
            </div>
            <Button
              onClick={() =>
                navigate(
                  ROUTES.CAREER_HISTORY_CREATE.replace(
                    ":serviceNo",
                    staffServiceNo,
                  ),
                )
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </CardHeader>
        </Card>

        <Card noPadding>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <div className="w-6 h-6 mr-3 border-2 rounded-full border-slate-300 border-t-ncos-green-600 animate-spin" />
              Loading career history...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              Failed to load career history.
            </div>
          ) : careerHistory && careerHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                      Previous
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                      New
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {careerHistory.map((record) => {
                    const fieldMeta = getFieldMeta(record.field_changed);
                    const displayDate =
                      record.effective_date || record.created_at;
                    return (
                      <tr
                        key={record.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fieldMeta.badge}`}
                          >
                            {fieldMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {record.old_value || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {record.new_value}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(displayDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.reason || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No career history yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a record to start tracking rank and command changes.
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  navigate(
                    ROUTES.CAREER_HISTORY_CREATE.replace(
                      ":serviceNo",
                      staffServiceNo,
                    ),
                  )
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
