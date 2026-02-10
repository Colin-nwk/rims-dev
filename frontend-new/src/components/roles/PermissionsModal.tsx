import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { type Role, type Permission, groupPermissions } from "@/lib/api/roles";
import { Shield, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  permissions: Permission[];
  onSave: (permissionIds: number[]) => void;
  isLoading?: boolean;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  permissions,
  onSave,
  isLoading = false,
}) => {
  // Initialize from role's permissions - parent uses key prop to reset on role change
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    () => (role ? new Set(role.permissions.map((p) => p.id)) : new Set()),
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Group and filter permissions
  const groupedPermissions = useMemo(() => {
    let filtered = permissions;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.group?.toLowerCase().includes(term),
      );
    }
    return groupPermissions(filtered);
  }, [permissions, searchTerm]);

  const togglePermission = (permId: number) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleGroup = (groupPerms: Permission[]) => {
    const groupIds = groupPerms.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupIds.forEach((id) => next.delete(id));
      } else {
        groupIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedPermissions));
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  // Check if any changes were made
  const hasChanges = useMemo(() => {
    if (!role) return false;
    const originalIds = new Set(role.permissions.map((p) => p.id));
    if (originalIds.size !== selectedPermissions.size) return true;
    for (const id of selectedPermissions) {
      if (!originalIds.has(id)) return true;
    }
    return false;
  }, [role, selectedPermissions]);

  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Permissions: ${role.name}`}
      description="Select the permissions this role should have"
      size="2xl"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Permission Groups */}
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6">
          {groupedPermissions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No permissions found matching your search
            </div>
          ) : (
            groupedPermissions.map(({ group, permissions: groupPerms }) => {
              const groupIds = groupPerms.map((p) => p.id);
              const allSelected = groupIds.every((id) =>
                selectedPermissions.has(id),
              );

              return (
                <div key={group} className="space-y-3 w-[98%]">
                  {/* Group Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <Shield className="w-3.5 h-3.5 text-ncos-green-500" />
                      {group.replace("_", " ")}
                    </h4>
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupPerms)}
                      className="text-xs font-medium text-ncos-green-600 hover:text-ncos-green-700"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Permission Items */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {groupPerms.map((perm) => {
                      const isSelected = selectedPermissions.has(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                            isSelected
                              ? "bg-ncos-green-50 border-ncos-green-200"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-ncos-green-600 border-ncos-green-600"
                                  : "border-slate-300 group-hover:border-slate-400"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium leading-tight ${
                                  isSelected
                                    ? "text-ncos-green-900"
                                    : "text-slate-700"
                                }`}
                              >
                                {perm.name}
                              </p>
                              {perm.description && (
                                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600 w-full">
            <CheckCircle2 className="w-4 h-4 text-ncos-green-500" />
            <span className="font-medium">
              {selectedPermissions.size} permission
              {selectedPermissions.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              isLoading={isLoading}
            >
              Update Permissions
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
