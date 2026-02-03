import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { useUserProfile } from "@/hooks/useAuth";
import {
  isStaffUser,
  isAdminUser,
  type StaffUser,
  type AdminUser,
} from "@/lib/api/auth/types";
import { getFileUrl } from "@/lib/api/apiClient";
import { ROUTES } from "@/routes/constants";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Clock,
  BadgeCheck,
  Building2,
  Hash,
  GraduationCap,
  Users,
  Flag,
  Timer,
  Sparkles,
  Edit,
} from "lucide-react";

// Info item component for consistent styling
const InfoItem = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="p-2 rounded-lg bg-slate-100 shrink-0">
      <Icon className="w-4 h-4 text-slate-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5 wrap-break-word">
        {value || "-"}
      </p>
    </div>
  </div>
);

// Card component for sections
const ProfileCard = ({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
  >
    <div className="px-5 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-slate-500" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// Staff profile component
const StaffProfile = ({ user }: { user: StaffUser }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate retirement progress (handle null retirement info)
  const retirementInfo = user.retirement_time_remaining;
  const totalYears = 35; // Assuming 35 years of service
  const yearsServed = retirementInfo ? totalYears - retirementInfo.years : 0;
  const progressPercent = retirementInfo
    ? Math.min(100, Math.max(0, (yearsServed / totalYears) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">
            {user.level ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Current Level</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">
            {user.step ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Current Step</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">
            {retirementInfo?.years ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Years to Retire</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-lg font-bold text-slate-900 truncate">
            {user.present_rank ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Current Rank</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <ProfileCard title="Personal Information" icon={User}>
          <div className="space-y-4">
            <InfoItem
              icon={User}
              label="Full Name"
              value={
                `${user.first_name || ""} ${user.other_names || ""} ${user.surname || ""}`.trim() ||
                "-"
              }
            />
            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(user.dob)}
            />
            <InfoItem icon={Users} label="Sex" value={user.sex} />
            <InfoItem
              icon={Phone}
              label="Phone Number"
              value={user.phone_number}
            />
            <InfoItem icon={Mail} label="Email" value={user.email} />
          </div>
        </ProfileCard>

        {/* Origin Information */}
        <ProfileCard title="Origin" icon={Flag}>
          <div className="space-y-4">
            <InfoItem
              icon={MapPin}
              label="State of Origin"
              value={user.state_of_origin}
            />
            <InfoItem
              icon={Building2}
              label="Local Government"
              value={user.lga}
            />
          </div>
        </ProfileCard>

        {/* Service Information */}
        <ProfileCard title="Service Information" icon={Briefcase}>
          <div className="space-y-4">
            <InfoItem
              icon={Hash}
              label="Service Number"
              value={user.service_no}
            />
            <InfoItem icon={Hash} label="File Number" value={user.file_no} />
            <InfoItem
              icon={GraduationCap}
              label="Department"
              value={user.department}
            />
            <InfoItem icon={Briefcase} label="Duty" value={user.duty} />
          </div>
        </ProfileCard>

        {/* Rank Information */}
        <ProfileCard title="Rank & Grade" icon={Shield}>
          <div className="space-y-4">
            <InfoItem
              icon={Shield}
              label="Initial Rank"
              value={user.initial_rank}
            />
            <InfoItem
              icon={Shield}
              label="Present Rank"
              value={user.present_rank}
            />
            <InfoItem icon={GraduationCap} label="Level" value={user.level} />
            <InfoItem icon={GraduationCap} label="Step" value={user.step} />
          </div>
        </ProfileCard>

        {/* Assignment Information */}
        <ProfileCard title="Current Assignment" icon={MapPin}>
          <div className="space-y-4">
            <InfoItem
              icon={MapPin}
              label="Assigned State"
              value={user.assigned_state}
            />
            <InfoItem icon={Building2} label="Prison" value={user.prison} />
            <InfoItem
              icon={Building2}
              label="Present Command"
              value={user.present_command}
            />
            <InfoItem
              icon={Building2}
              label="Initial Command"
              value={user.initial_command}
            />
          </div>
        </ProfileCard>

        {/* Appointment Dates */}
        <ProfileCard title="Appointment History" icon={Calendar}>
          <div className="space-y-4">
            <InfoItem
              icon={Calendar}
              label="First Appointment"
              value={formatDate(user.date_of_first_appointment)}
            />
            <InfoItem
              icon={Calendar}
              label="Present Appointment"
              value={formatDate(user.present_appointment_date)}
            />
            <InfoItem
              icon={Calendar}
              label="Command Post Date"
              value={formatDate(user.command_post_date)}
            />
          </div>
        </ProfileCard>
      </div>

      {/* Retirement Card - Full Width (only show if retirement info available) */}
      {retirementInfo ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">
                Retirement Countdown
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Progress Section */}
              <div>
                <p className="text-slate-500 text-sm mb-3">Service Progress</p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-slate-600 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {progressPercent.toFixed(0)}% of service completed
                </p>
              </div>

              {/* Countdown Section */}
              <div>
                <p className="text-slate-500 text-sm mb-3">Time Remaining</p>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-3xl font-bold text-slate-900">
                    {retirementInfo.years}
                  </span>
                  <span className="text-slate-500 text-sm">years</span>
                  <span className="text-2xl font-bold text-slate-700 mx-1">
                    {retirementInfo.months}
                  </span>
                  <span className="text-slate-500 text-sm">months</span>
                  <span className="text-xl font-bold text-slate-500 mx-1">
                    {retirementInfo.days}
                  </span>
                  <span className="text-slate-500 text-sm">days</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {retirementInfo.human_readable}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Expected Retirement Date
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {user.retirement_date_formatted ?? "-"}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.is_retired
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {user.is_retired ? "Retired" : "Active Service"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">
              Retirement Information
            </h3>
          </div>
          <p className="text-slate-500 text-sm">
            Retirement information is not available. Please complete your
            profile to see retirement details.
          </p>
        </div>
      )}
    </div>
  );
};

// Admin profile component
const AdminProfile = ({ user }: { user: AdminUser }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-900">Administrator</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Account Type</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck
              className={`w-5 h-5 ${
                user.email_verified_at ? "text-emerald-600" : "text-amber-600"
              }`}
            />
            <span className="font-semibold text-slate-900">
              {user.email_verified_at ? "Verified" : "Unverified"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Email Status</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <ProfileCard title="Account Information" icon={User}>
          <div className="space-y-4">
            <InfoItem icon={User} label="Full Name" value={user.name} />
            <InfoItem icon={Mail} label="Email Address" value={user.email} />
            <InfoItem
              icon={BadgeCheck}
              label="Email Verified"
              value={user.email_verified_at ? "Yes" : "No"}
            />
          </div>
        </ProfileCard>

        {/* Account Metadata */}
        <ProfileCard title="Account Details" icon={Clock}>
          <div className="space-y-4">
            <InfoItem
              icon={Calendar}
              label="Account Created"
              value={formatDate(user.created_at)}
            />
            <InfoItem
              icon={Clock}
              label="Last Updated"
              value={formatDate(user.updated_at)}
            />
            {user.email_verified_at && (
              <InfoItem
                icon={BadgeCheck}
                label="Verified On"
                value={formatDate(user.email_verified_at)}
              />
            )}
          </div>
        </ProfileCard>
      </div>
    </div>
  );
};

// Loading skeleton
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

const Profile = () => {
  const { user, isLoading } = useAuth();
  const { displayName, initials } = useUserProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const isStaff = isStaffUser(user);
  const photoUrl = isStaff && user.photo ? getFileUrl(user.photo) : null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile Header */}
      <div className="relative mb-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Edit Profile Button - Staff Only */}
          {isStaff && (
            <div className="absolute z-10 top-4 right-4 sm:top-6 sm:right-6">
              <Link to={ROUTES.PROFILE_EDIT}>
                <Button
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-slate-800 shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="bg-white w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* User info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {displayName}
              </h1>
              <p className="text-white/80 mb-3">
                {isStaff ? user.email || user.service_no : user.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/90 backdrop-blur-sm">
                  {isStaff ? (
                    <>
                      <Briefcase className="w-3.5 h-3.5" />
                      Staff
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      Administrator
                    </>
                  )}
                </span>
                {isStaff && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/90 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {user.present_rank}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {isStaff ? (
        <StaffProfile user={user} />
      ) : isAdminUser(user) ? (
        <AdminProfile user={user} />
      ) : null}
    </div>
  );
};

export default Profile;
