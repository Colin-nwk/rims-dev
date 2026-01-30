import React from "react";
import {
  Mail,
  Calendar,
  Clock,
  Shield,
  BadgeCheck,
  AlertCircle,
  Edit,
  UserCog,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type AdminUser,
  getUserStatusColor,
  getUserInitials,
} from "@/lib/api/users";

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onEdit?: (user: AdminUser) => void;
  onManageRoles?: (user: AdminUser) => void;
}

export const UserViewModal: React.FC<UserViewModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onManageRoles,
}) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
      <div className="space-y-6">
        {/* User Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-ncos-green-400 to-ncos-green-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shadow-ncos-green-500/30">
              {getUserInitials(user.name)}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                user.status === "active"
                  ? "bg-emerald-500"
                  : user.status === "inactive"
                    ? "bg-slate-400"
                    : "bg-red-500"
              }`}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {user.name}
            </h3>
            <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getUserStatusColor(
                  user.status,
                )}`}
              >
                {user.status}
              </span>
              {user.email_verified_at && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email Verification Status */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            user.email_verified_at
              ? "bg-emerald-50 border border-emerald-100"
              : "bg-amber-50 border border-amber-100"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              user.email_verified_at ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            {user.email_verified_at ? (
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                user.email_verified_at ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {user.email_verified_at ? "Email Verified" : "Email Not Verified"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.email_verified_at
                ? `Verified on ${formatDate(user.email_verified_at)}`
                : "User hasn't verified their email yet"}
            </p>
          </div>
        </div>

        {/* Roles Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-500" />
            Assigned Roles
          </h4>
          {user.roles && user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100 hover:bg-violet-100 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {role.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-400">No roles assigned yet</p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Created
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {formatDate(user.created_at)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Updated
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {formatDate(user.updated_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => onManageRoles?.(user)}
            className="w-full sm:w-auto"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Manage Roles
          </Button>
          <Button onClick={() => onEdit?.(user)} className="w-full sm:w-auto">
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>
    </Modal>
  );
};
