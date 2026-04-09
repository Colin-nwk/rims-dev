import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Edit,
  Shield,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabNav } from "@/components/staff/StaffFormTabs";
import { getFileUrl, useGenericData } from "@/lib/api";
import { useStaff, type Staff, type StaffEducation } from "@/lib/api/staff";
import {
  getDirectorateName,
  getPrisonName,
  getRankName,
  getStaffStatusName,
  getStateName,
  getTrainingInstituteName,
  getWorkDistributionName,
} from "@/lib/helpers/genericDataHelpers";
import { ROUTES } from "@/routes/constants";

export default function StaffViewPage() {
  const { serviceNo } = useParams<{ serviceNo: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  const { data: staffData, isLoading: isLoadingStaff } = useStaff(
    serviceNo || "",
    !!serviceNo,
  );
  const { data: genericData } = useGenericData();

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

  const staff = staffData.data;
  const fullName = getStaffFullName(staff);
  const statusLabel = staff.status === 1 ? "Active" : "Inactive";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(ROUTES.STAFF_DIRECTORY)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Staff Directory
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold text-slate-900">
                View Staff Record
              </h1>
              <p className="text-slate-600">Read-only staff profile details.</p>
              <p className="text-slate-600">
                {fullName} ({staff.service_no})
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    staff.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {staff.status === 1 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {statusLabel}
                </span>
                {Boolean(staff.is_verified) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <Button
                type="button"
                onClick={() =>
                  navigate(
                    ROUTES.STAFF_EDIT.replace(":serviceNo", staff.service_no),
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Staff</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          {activeTab === "basic" && (
            <BasicInfoTabView staff={staff} genericData={genericData} />
          )}
          {activeTab === "posting" && (
            <PostingOriginTabView staff={staff} genericData={genericData} />
          )}
          {activeTab === "identity" && <IdentityDocsTabView staff={staff} />}
          {activeTab === "physical" && <PhysicalMedicalTabView staff={staff} />}
          {activeTab === "addresses" && <AddressesTabView staff={staff} />}
          {activeTab === "family" && <FamilyNOKTabView staff={staff} />}
          {activeTab === "banking" && <BankingTabView staff={staff} />}
          {activeTab === "education" && (
            <EducationTabView education={staff.education} />
          )}
          {activeTab === "review" && (
            <ReviewTabView staff={staff} genericData={genericData} />
          )}
        </div>
      </div>
    </div>
  );
}

function BasicInfoTabView({ staff, genericData }: StaffViewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="pb-2 mb-4 font-medium border-b text-slate-900 border-slate-200">
          Personal Information
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Surname" value={staff.surname} />
            <InfoField label="First Name" value={staff.first_name} />
            <InfoField label="Other Names" value={staff.other_names} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Gender" value={staff.sex} />
            <InfoField label="Date of Birth" value={formatDate(staff.dob)} />
            <InfoField label="Phone Number" value={staff.phone_number} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Email" value={staff.email} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="pb-2 mb-4 font-medium border-b text-slate-900 border-slate-200">
          Official Information
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Service Number" value={staff.service_no} />
            <InfoField label="IPPIS Number" value={staff.ippis} />
            <InfoField label="File Number" value={staff.file_no} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoField label="Department" value={staff.department} />
            <InfoField label="Duty / Role" value={staff.duty} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoField
              label="Work Distribution"
              value={getWorkDistributionName(
                staff.work_distribution_id,
                genericData?.work_distributions,
              )}
            />
            <InfoField
              label="Training Institute"
              value={getTrainingInstituteName(
                staff.training_institute_id,
                genericData?.training_institutes,
              )}
            />
            <InfoField
              label="Directorate"
              value={getDirectorateName(
                staff.directorate_id,
                genericData?.directorates,
              )}
            />
            <InfoField
              label="Staff Status"
              value={getStaffStatusName(
                staff.staff_status_id,
                genericData?.statuses,
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoField label="Present Rank" value={staff.present_rank_name} />
            <InfoField label="Initial Rank" value={staff.initial_rank_name} />
            <InfoField
              label="Grade Level"
              value={
                staff.level === undefined || staff.level === null
                  ? undefined
                  : `Level ${staff.level}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostingOriginTabView({ staff, genericData }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="pb-2 font-medium border-b text-slate-900 border-slate-200">
        Origin
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField label="State of Origin" value={staff.state_of_origin} />
        <InfoField label="LGA" value={staff.lga} />
      </div>

      <h4 className="pt-2 pb-2 font-medium border-b text-slate-900 border-slate-200">
        Current Posting
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Assigned State"
          value={getStateName(staff.assigned_state, genericData?.states)}
        />
        <InfoField
          label="Custodial Center"
          value={getPrisonName(staff.prison, genericData?.prisons)}
        />
        <InfoField label="Station" value={staff.station} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Initial Command"
          value={getStateName(staff.initial_command, genericData?.states)}
        />
        <InfoField
          label="Present Command"
          value={getStateName(staff.present_command, genericData?.states)}
        />
      </div>
      <InfoField
        label="Command Post Date"
        value={formatDate(staff.command_post_date)}
      />
    </div>
  );
}

function IdentityDocsTabView({ staff }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <StaffPhoto staff={staff} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoField label="NIN" value={staff.details?.nin} />
        <InfoField label="BVN" value={staff.details?.bvn} />
        <InfoField label="IPPIS (Details)" value={staff.details?.ippis} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField label="PFA Name" value={staff.details?.pfa_name} />
        <InfoField label="Pension PIN" value={staff.details?.pension_pin} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Date of First Appointment"
          value={formatDate(staff.date_of_first_appointment)}
        />
        <InfoField
          label="Present Appointment Date"
          value={formatDate(staff.present_appointment_date)}
        />
      </div>
    </div>
  );
}

function PhysicalMedicalTabView({ staff }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Place of Birth"
          value={staff.details?.place_of_birth}
        />
        <InfoField label="Height" value={staff.details?.height} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoField label="Blood Group" value={staff.details?.blood_group} />
        <InfoField label="Genotype" value={staff.details?.genotype} />
        <InfoField label="Complexion" value={staff.details?.complexion} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField label="Hair Colour" value={staff.details?.hair_colour} />
        <InfoField
          label="Has Physical Deformity"
          value={Boolean(staff.details?.is_deformed)}
        />
      </div>
      <InfoTextArea
        label="Deformity Description"
        value={staff.details?.deformity}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Has Previous Convictions"
          value={Boolean(staff.details?.is_convicted)}
        />
      </div>
      <InfoTextArea
        label="Previous Convictions"
        value={staff.details?.previous_convictions}
      />
    </div>
  );
}

function AddressesTabView({ staff }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <InfoTextArea
        label="Contact Address"
        value={staff.details?.contact_address}
      />
      <InfoTextArea
        label="Permanent Home Address"
        value={staff.details?.permanent_home_address}
      />
    </div>
  );
}

function FamilyNOKTabView({ staff }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="pb-2 font-medium border-b text-slate-900 border-slate-200">
        Family Information
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Marital Status"
          value={staff.details?.marital_status}
        />
        <InfoField
          label="Number of Children"
          value={staff.details?.number_of_children}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField label="Spouse Name" value={staff.details?.spouse_name} />
        <InfoField label="Spouse Phone" value={staff.details?.spouse_phone} />
      </div>

      <h4 className="pt-2 pb-2 font-medium border-b text-slate-900 border-slate-200">
        Next of Kin
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Next of Kin Name"
          value={staff.details?.next_of_kin_name}
        />
        <InfoField
          label="Next of Kin Phone"
          value={staff.details?.next_of_kin_phone}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Relationship"
          value={staff.details?.next_of_kin_relationship}
        />
        <InfoField
          label="Next of Kin Address"
          value={staff.details?.next_of_kin_address}
        />
      </div>
    </div>
  );
}

function BankingTabView({ staff }: StaffViewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField label="Bank Name" value={staff.details?.bank_name} />
        <InfoField
          label="Account Number"
          value={staff.details?.account_number}
        />
      </div>
      <InfoField label="Account Name" value={staff.details?.account_name} />
    </div>
  );
}

function EducationTabView({ education }: EducationTabViewProps) {
  if (!education?.length) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg border-slate-300">
        <p className="mb-2 text-sm font-medium text-slate-600">
          No education records added
        </p>
        <p className="text-xs text-slate-500">
          Education history has not been provided for this staff member.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <div
          key={`${edu.institution}-${edu.start_date}-${index}`}
          className="p-4 border rounded-lg border-slate-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {edu.institution || "Institution"}
              </p>
              <p className="text-xs text-slate-500">{edu.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoField label="Course" value={edu.course} />
            <InfoField
              label="Duration"
              value={formatDateRange(edu.start_date, edu.end_date)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewTabView({ staff, genericData }: StaffViewTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <h3 className="text-lg font-bold text-emerald-900 mb-4">
          Staff Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SummaryItem label="Full Name" value={getStaffFullName(staff)} />
            <SummaryItem label="Service Number" value={staff.service_no} />
            <SummaryItem label="Department" value={staff.department} />
          </div>
          <div className="space-y-3">
            <SummaryItem
              label="Present Rank"
              value={getRankName(staff.present_rank, genericData?.rankings)}
            />
            <SummaryItem
              label="Assigned State"
              value={getStateName(staff.assigned_state, genericData?.states)}
            />
            <SummaryItem
              label="Custodial Center"
              value={getPrisonName(staff.prison, genericData?.prisons)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoField
          label="Status"
          value={staff.status === 1 ? "Active" : "Inactive"}
        />
        <InfoField label="Verified Staff" value={Boolean(staff.is_verified)} />
      </div>

      {staff.roles && staff.roles.length > 0 && (
        <div>
          <h4 className="pb-2 mb-3 font-medium border-b text-slate-900 border-slate-200">
            Assigned Roles
          </h4>
          <div className="flex flex-wrap gap-2">
            {staff.roles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
              >
                <Shield className="w-3 h-3" />
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StaffPhoto({ staff }: StaffPhotoProps) {
  const photoUrl = staff.photo ? getFileUrl(staff.photo, staff.updated_at) : "";
  const initials = getInitials(staff.first_name, staff.surname);
  const fullName = getStaffFullName(staff);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Staff Photo</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-24 h-24 overflow-hidden border-2 rounded-lg border-slate-200 bg-slate-50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`${
              photoUrl ? "hidden" : "flex"
            } items-center justify-center w-full h-full text-2xl font-bold text-white bg-linear-to-br from-emerald-500 to-emerald-700`}
          >
            {initials}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          <p>Photo is view-only</p>
          <p>Use edit to update</p>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{formatValue(value)}</p>
    </div>
  );
}

function InfoTextArea({ label, value }: InfoTextAreaProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
        {formatValue(value)}
      </p>
    </div>
  );
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div>
      <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-slate-900 font-medium">{formatValue(value)}</p>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string {
  const startLabel = formatDate(startDate);
  const endLabel = formatDate(endDate);

  if (startLabel === "N/A" && endLabel === "N/A") return "N/A";
  if (startLabel === "N/A") return endLabel;
  if (endLabel === "N/A") return startLabel;
  return `${startLabel} - ${endLabel}`;
}

function formatValue(value?: string | number | boolean | null): string {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function getStaffFullName(staff: Staff): string {
  return [staff.surname, staff.first_name, staff.other_names]
    .filter(Boolean)
    .join(" ");
}

function getInitials(firstName?: string, surname?: string): string {
  return `${firstName?.[0] || ""}${surname?.[0] || ""}`.toUpperCase() || "--";
}

interface StaffViewTabProps {
  staff: Staff;
  genericData?: ReturnType<typeof useGenericData>["data"];
}

interface EducationTabViewProps {
  education?: StaffEducation[];
}

interface StaffPhotoProps {
  staff: Staff;
}

interface InfoFieldProps {
  label: string;
  value?: string | number | boolean | null;
}

interface InfoTextAreaProps {
  label: string;
  value?: string | number | boolean | null;
}

interface SummaryItemProps {
  label: string;
  value?: string | number | boolean | null;
}
