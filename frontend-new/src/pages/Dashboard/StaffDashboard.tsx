import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Shield,
  Timer,
  User,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuthContext";
import {
  getDisplayName,
  getUserInitials,
  isStaffUser,
} from "@/lib/api/auth/types";
import { getFileUrl } from "@/lib/api/apiClient";
import { useChangeRequests } from "@/lib/api/change-requests";
import {
  type CreateComplaintFormData,
  useCreateComplaint,
} from "@/lib/api/complaints";

import { NewComplaintModal } from "@/components/complaints";
import { ApiError } from "@/lib/api";

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-slate-200 rounded-2xl h-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl" />
      ))}
    </div>
  </div>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Modal states
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Get staff-specific data
  const staffUser = user && isStaffUser(user) ? user : null;
  const serviceNo = staffUser?.service_no;

  // Fetch change requests for this staff member
  const { data: changeRequestsData, isLoading: isLoadingChangeRequests } =
    useChangeRequests(
      { per_page: 100 },
      { service_no: serviceNo || "" },
      { enabled: !!serviceNo },
    );

  // Mutations for quick actions
  const createComplaint = useCreateComplaint();

  // Calculate change request stats
  const changeRequests = changeRequestsData?.data || [];
  const pendingRequests = changeRequests.filter(
    (r) => r.status === "PENDING",
  ).length;
  const approvedRequests = changeRequests.filter(
    (r) => r.status === "APPROVED",
  ).length;
  const rejectedRequests = changeRequests.filter(
    (r) => r.status === "REJECTED",
  ).length;

  // Handle complaint submission
  const handleComplaintSubmit = async (data: CreateComplaintFormData) => {
    try {
      await createComplaint.mutateAsync(data);
      toast.success("Complaint submitted successfully!");
      setIsComplaintModalOpen(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Failed to submit complaint");
      throw error;
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DashboardSkeleton />
      </div>
    );
  }

  // No staff user
  if (!staffUser) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Staff Profile Required
          </h2>
          <p className="text-slate-500">
            Please log in with your staff account to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(staffUser);
  const initials = getUserInitials(staffUser);
  const photoUrl = staffUser.photo ? getFileUrl(staffUser.photo) : null;
  const retirementInfo = staffUser.retirement_time_remaining;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome Header Section */}
      <div className="bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {photoUrl ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-2xl ring-2 ring-white/10">
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-2xl ring-2 ring-white/10">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 p-1 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-full shadow-lg">
              <div className="w-3 h-3 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </div>

          {/* User info */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="mb-1">
              <span className="text-xs sm:text-sm font-medium text-emerald-200 uppercase tracking-wider">
                Welcome back
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 truncate">
              {displayName}
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base mb-4 truncate flex items-center justify-center sm:justify-start gap-2">
              <User className="w-4 h-4" />
              {staffUser.email || staffUser.service_no}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-lg">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {staffUser.present_rank || "Staff"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-lg">
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {staffUser.service_no}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Notifications & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Request Notifications Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                  My Change Requests
                </h2>
                <p className="text-sm text-slate-500">
                  Updates on your submitted requests
                </p>
              </div>
            </div>

            {isLoadingChangeRequests ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : changeRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No change requests yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Your profile updates and requests will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Pending */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-amber-500">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Pending
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                    {pendingRequests}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Awaiting approval
                  </p>
                </div>

                {/* Approved */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Approved
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {approvedRequests}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Successfully processed
                  </p>
                </div>

                {/* Rejected */}
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-red-500">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Rejected
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {rejectedRequests}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Review feedback</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* View Profile */}
              <button
                onClick={() => navigate("/profile")}
                className="group p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 text-left"
              >
                <div className="p-2 sm:p-3 rounded-xl bg-blue-100 text-blue-600 w-fit mb-2 sm:mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  View Profile
                </p>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  View your details
                </p>
              </button>

              {/* View Qualifications */}
              <button
                onClick={() => navigate("/qualifications")}
                className="group p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 text-left"
              >
                <div className="p-2 sm:p-3 rounded-xl bg-purple-100 text-purple-600 w-fit mb-2 sm:mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  View Qualifications
                </p>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Manage credentials
                </p>
              </button>

              {/* Make Complaint */}
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="group p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 text-left"
              >
                <div className="p-2 sm:p-3 rounded-xl bg-amber-100 text-amber-600 w-fit mb-2 sm:mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  New Complaint
                </p>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Submit a ticket
                </p>
              </button>

              {/* View Help Desk */}
              <button
                onClick={() => navigate("/help-desk")}
                className="group p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 text-left"
              >
                <div className="p-2 sm:p-3 rounded-xl bg-teal-100 text-teal-600 w-fit mb-2 sm:mb-3 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Help Desk
                </p>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  View your tickets
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-4">
          {/* Service Start Date Card */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 border border-blue-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-md shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Service Start Date
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
                  {formatDate(staffUser.date_of_first_appointment)}
                </p>
              </div>
            </div>
          </div>

          {/* Present Command Card */}
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 sm:p-5 border border-emerald-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-md shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Present Command
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
                  {staffUser.present_command || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Location Card */}
          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-5 border border-purple-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 shadow-md shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Assigned Location
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
                  {staffUser.assigned_state || "Not assigned"}
                </p>
                {staffUser.prison && (
                  <p className="text-sm text-slate-600 truncate">
                    {staffUser.prison}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Level & Step Card */}
          <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl p-4 sm:p-5 border border-amber-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 shadow-md shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Level & Step
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                  Level {staffUser.level ?? "-"}, Step {staffUser.step ?? "-"}
                </p>
                <p className="text-sm text-slate-600 truncate">
                  {staffUser.present_rank || "No rank assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Retirement Countdown Card */}
          {retirementInfo ? (
            <div className="bg-linear-to-br from-slate-100 to-slate-200 rounded-xl p-4 sm:p-5 border border-slate-300">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-linear-to-br from-slate-600 to-slate-700 shadow-md shrink-0">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Retirement Countdown
                  </p>
                  <div className="flex items-baseline gap-1 sm:gap-2 mt-1 flex-wrap">
                    <span className="text-xl sm:text-2xl font-bold text-slate-800">
                      {retirementInfo.years}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      years
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-slate-700">
                      {retirementInfo.months}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      months
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 truncate">
                    {retirementInfo.human_readable}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-slate-500">Expected Date</span>
                  <span className="font-medium text-slate-700">
                    {staffUser.retirement_date_formatted ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl p-4 sm:p-5 border border-slate-200">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-slate-300 shrink-0">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Retirement Info
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Not available. Complete your profile for retirement details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmit={handleComplaintSubmit}
        isLoading={createComplaint.isPending}
      />
    </div>
  );
};

export default StaffDashboard;
