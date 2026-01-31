import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Shield,
  Plus,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCog,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/api/apiClient";
import {
  Staff,
  useRoles,
  useAssignRole,
  useRemoveRole,
  type Role,
} from "@/lib/api/staff";

interface ConfirmAction {
  type: "attach" | "detach";
  role: Role;
}

interface RoleManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess?: () => void;
  onStaffUpdate?: (staff: Staff) => void;
}

export const RoleManageModal: React.FC<RoleManageModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSuccess,
  onStaffUpdate,
}) => {
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);
  const [localRoles, setLocalRoles] = useState(staff?.roles || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [isAssigning, setIsAssigning] = useState(false);

  // Sync local roles when staff prop changes
  React.useEffect(() => {
    setLocalRoles(staff?.roles || []);
  }, [staff?.service_no, staff?.roles]);

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  if (!staff) return null;

  const fullName =
    `${staff.surname} ${staff.first_name} ${staff.other_names || ""}`.trim();
  const currentRoles = localRoles;
  const availableRoles = rolesData?.data || [];
  const photoUrl = getFileUrl(staff.photo);

  // Filter out roles that are already assigned
  const unassignedRoles = availableRoles.filter(
    (role) => !currentRoles.some((r) => r.id === role.id)
  );

  // Filter by search query
  const filteredUnassignedRoles = unassignedRoles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignClick = (role: Role) => {
    setConfirmAction({ type: "attach", role });
  };

  const handleRemoveClick = (role: Role) => {
    setConfirmAction({ type: "detach", role });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "attach") {
      setIsAssigning(true);
      try {
        await assignRole.mutateAsync({
          serviceNo: staff.service_no,
          data: { role_id: confirmAction.role.id },
        });

        const newRoles = [...localRoles, confirmAction.role];
        setLocalRoles(newRoles);
        onStaffUpdate?.({ ...staff, roles: newRoles });

        toast.success(`Role "${confirmAction.role.name}" assigned successfully!`);
        onSuccess?.();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to assign role";
        toast.error(message);
      } finally {
        setIsAssigning(false);
      }
    } else {
      setRemovingRoleId(confirmAction.role.id);
      try {
        await removeRole.mutateAsync({
          serviceNo: staff.service_no,
          roleId: confirmAction.role.id,
        });

        const newRoles = localRoles.filter((r) => r.id !== confirmAction.role.id);
        setLocalRoles(newRoles);
        onStaffUpdate?.({ ...staff, roles: newRoles });

        toast.success(`Role "${confirmAction.role.name}" removed successfully!`);
        onSuccess?.();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to remove role";
        toast.error(message);
      } finally {
        setRemovingRoleId(null);
      }
    }
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setConfirmAction(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Staff Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="w-14 h-14 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-ncos-green-400 to-ncos-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-ncos-green-500/30">
              {staff.first_name?.[0]}
              {staff.surname?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {fullName}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              Service No: {staff.service_no}
              {staff.ippis && ` • IPPIS: ${staff.ippis}`}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full">
            <UserCog className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">
              Manage Roles
            </span>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmAction && (
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-amber-800">
                  {confirmAction.type === "attach"
                    ? "Confirm Role Assignment"
                    : "Confirm Role Removal"}
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  {confirmAction.type === "attach" ? (
                    <>
                      Are you sure you want to assign the role{" "}
                      <span className="font-semibold">
                        "{confirmAction.role.name}"
                      </span>{" "}
                      to this staff member?
                    </>
                  ) : (
                    <>
                      Are you sure you want to remove the role{" "}
                      <span className="font-semibold">
                        "{confirmAction.role.name}"
                      </span>{" "}
                      from this staff member?
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={
                      confirmAction.type === "attach" ? "primary" : "danger"
                    }
                    onClick={handleConfirm}
                    disabled={isAssigning || removingRoleId !== null}
                    isLoading={isAssigning || removingRoleId !== null}
                  >
                    {confirmAction.type === "attach" ? "Yes, Assign" : "Yes, Remove"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelConfirm}
                    disabled={isAssigning || removingRoleId !== null}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <button
                onClick={handleCancelConfirm}
                className="p-1 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        )}

        {/* Current Roles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              Current Roles
            </h4>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {currentRoles.length} assigned
            </span>
          </div>

          {currentRoles.length > 0 ? (
            <div className="grid gap-2">
              {currentRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-violet-50 rounded-xl border border-violet-100 group hover:bg-violet-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-violet-200/50 rounded-lg">
                      <Shield className="w-4 h-4 text-violet-600" />
                    </div>
                    <span
                      className="font-medium text-violet-800 truncate"
                      title={role.name}
                    >
                      {role.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveClick(role)}
                    disabled={removingRoleId === role.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 font-medium text-xs transition-all disabled:opacity-50"
                    title="Remove role from staff"
                  >
                    {removingRoleId === role.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-400">No roles assigned yet</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs font-medium text-slate-400 uppercase tracking-wide">
              Available to assign
            </span>
          </div>
        </div>

        {/* Available Roles */}
        <div>
          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 transition-all duration-200 outline-none"
            />
          </div>

          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : filteredUnassignedRoles.length > 0 ? (
            <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredUnassignedRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleAssignClick(role)}
                  disabled={isAssigning}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-ncos-green-300 hover:bg-ncos-green-50 transition-all duration-200 group disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-slate-200/50 rounded-lg group-hover:bg-ncos-green-200/50 transition-colors">
                      <Shield className="w-4 h-4 text-slate-500 group-hover:text-ncos-green-600 transition-colors" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-ncos-green-700 truncate transition-colors">
                      {role.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-ncos-green-100 text-ncos-green-700 text-xs font-medium group-hover:bg-ncos-green-200 transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Assign</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">
                {searchQuery ? "No roles match your search" : "All roles assigned"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "This staff member has all available roles"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
