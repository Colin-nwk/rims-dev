import { useStaffIDCard } from "@/lib/api/staff/staffService";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Hash,
  MapPin,
  User,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

const InfoItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | undefined | null;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 p-4 transition-colors rounded-lg bg-slate-50 hover:bg-slate-100">
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-slate-200">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium tracking-wide uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-base font-semibold text-slate-800 wrap-break-word">
          {value}
        </p>
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
  </div>
);

export default function StaffProfile() {
  const { serviceNo } = useParams<{ serviceNo: string }>();
  const { data, isLoading, error } = useStaffIDCard(serviceNo || "");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-8 bg-linear-to-br from-slate-50 to-slate-100 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header skeleton */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4 rounded-xl bg-slate-200 animate-pulse" />
            <div className="w-48 h-6 rounded bg-slate-200 animate-pulse" />
          </div>

          {/* Profile hero skeleton */}
          <div className="p-6 mb-6 bg-white shadow-sm rounded-2xl sm:p-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4 rounded-full sm:w-40 sm:h-40 bg-slate-200 animate-pulse" />
              <div className="w-48 h-8 mb-2 rounded bg-slate-200 animate-pulse" />
              <div className="w-32 h-6 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>

          {/* Info sections skeleton */}
          <div className="p-6 bg-white shadow-sm rounded-2xl">
            <div className="w-40 h-6 mb-4 rounded bg-slate-200 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-slate-100 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-linear-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 p-2 bg-white border shadow-sm rounded-xl border-slate-200">
              <img
                src="/logo.png"
                alt="Nigerian Correctional Service"
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Error card */}
          <div className="p-8 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50">
              <UserCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800">
              Staff Not Found
            </h2>
            <p className="text-slate-600">
              Unable to retrieve staff information. Please verify the service
              number and try again.
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-slate-500">
            Nigerian Correctional Service
          </p>
        </div>
      </div>
    );
  }

  const staff = data.data;
  const photoUrl = staff.photo
    ? `${import.meta.env.VITE_API_URL?.replace("/api/v1", "")}/storage/${staff.photo}`
    : null;

  const fullName = [staff.first_name, staff.other_names, staff.surname]
    .filter(Boolean)
    .join(" ");

  const formattedDob = staff.dob
    ? new Date(staff.dob).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen px-4 py-8 bg-linear-to-br from-slate-50 to-slate-100 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 p-2 mb-4 bg-white border shadow-sm sm:w-20 sm:h-20 rounded-xl border-slate-200">
            <img
              src="/logo.png"
              alt="Nigerian Correctional Service"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Staff Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nigerian Correctional Service
          </p>
        </div>

        {/* Profile Hero Section */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-2xl border-slate-200 sm:p-8">
          <div className="flex flex-col items-center">
            {/* Photo */}
            <div className="relative mb-5">
              <div className="flex items-center justify-center w-32 h-32 overflow-hidden border-4 rounded-full sm:w-40 sm:h-40 bg-slate-100 border-slate-200 shadow-lg">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                ) : null}
                <div
                  className={
                    photoUrl
                      ? "hidden"
                      : "flex items-center justify-center w-full h-full"
                  }
                >
                  <User className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Name */}
            <h2 className="mb-2 text-2xl font-bold text-center sm:text-3xl text-slate-800">
              {fullName}
            </h2>

            {/* Rank Badge */}
            {staff.present_rank && (
              <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-slate-800 text-white">
                {staff.present_rank}
              </span>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {staff.status === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                  <XCircle className="w-4 h-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-2xl border-slate-200 sm:p-8">
          <SectionHeader title="Personal Information" icon={Users} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Service Number"
              value={staff.service_no}
              icon={Hash}
            />
            <InfoItem label="Gender" value={staff.sex} icon={User} />
            <InfoItem
              label="Date of Birth"
              value={formattedDob}
              icon={Calendar}
            />
            <InfoItem
              label="Assigned State"
              value={staff.assigned_state_name}
              icon={MapPin}
            />
          </div>
        </div>

        {/* Work Information Section */}
        {staff.present_rank && (
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-2xl border-slate-200 sm:p-8">
            <SectionHeader title="Work Information" icon={Briefcase} />
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Present Rank"
                value={staff.present_rank}
                icon={Briefcase}
              />
              {staff.assigned_state_name && (
                <InfoItem
                  label="Station"
                  value={staff.assigned_state_name}
                  icon={MapPin}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 text-center border-t border-slate-200">
          <p className="text-sm font-medium text-slate-600">
            Nigerian Correctional Service
          </p>
          <p className="mt-1 text-xs text-slate-400">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
