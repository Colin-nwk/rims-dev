import React, { useState } from "react";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  Staff,
  useRoles,
  useAssignRole,
  useRemoveRole,
  assignRoleSchema,
  AssignRoleFormData,
} from "@/lib/api/staff";

interface RoleManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess?: () => void;
}

export const RoleManageModal: React.FC<RoleManageModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSuccess,
}) => {
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  if (!staff) return null;

  const fullName =
    `${staff.surname} ${staff.first_name} ${staff.other_names || ""}`.trim();
  const currentRoles = staff.roles || [];
  const availableRoles = rolesData?.data || [];

  // Filter out roles that are already assigned
  const unassignedRoles = availableRoles.filter(
    (role) => !currentRoles.some((r) => r.id === role.id),
  );

  const handleAssignRole = async (
    values: AssignRoleFormData,
    { setSubmitting, resetForm }: FormikHelpers<AssignRoleFormData>,
  ) => {
    try {
      await assignRole.mutateAsync({
        serviceNo: staff.service_no,
        data: values,
      });
      toast.success("Role assigned successfully!");
      resetForm();
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to assign role";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleId: number, roleName: string) => {
    setRemovingRoleId(roleId);
    try {
      await removeRole.mutateAsync({
        serviceNo: staff.service_no,
        roleId,
      });
      toast.success(`Role "${roleName}" removed successfully!`);
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to remove role";
      toast.error(message);
    } finally {
      setRemovingRoleId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Staff Roles"
      description={`Assign or remove roles for ${fullName}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Staff Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
          {staff.photo ? (
            <img
              src={staff.photo}
              alt={fullName}
              className="object-cover w-12 h-12 rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 text-sm font-bold text-white rounded-lg bg-linear-to-br from-ncos-green-500 to-ncos-green-700">
              {staff.first_name?.[0]}
              {staff.surname?.[0]}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">{fullName}</p>
            <p className="text-xs text-slate-500">
              Service No: {staff.service_no}
            </p>
          </div>
        </div>

        {/* Current Roles */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Current Roles
          </h4>
          {currentRoles.length === 0 ? (
            <p className="text-sm text-slate-500">No roles assigned</p>
          ) : (
            <div className="space-y-2">
              {currentRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-900">
                      {role.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRole(role.id, role.name)}
                    disabled={removingRoleId === role.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removingRoleId === role.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Role Form */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Add New Role
          </h4>

          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : unassignedRoles.length === 0 ? (
            <p className="text-sm text-slate-500">
              All available roles have been assigned
            </p>
          ) : (
            <Formik
              initialValues={{ role_id: 0 }}
              validationSchema={toFormikValidationSchema(assignRoleSchema)}
              onSubmit={handleAssignRole}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form className="flex items-start gap-3">
                  <div className="flex-1">
                    <select
                      value={values.role_id}
                      onChange={(e) =>
                        setFieldValue("role_id", Number(e.target.value))
                      }
                      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent transition-all duration-200 ${
                        touched.role_id && errors.role_id
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                    >
                      <option value={0}>Select a role...</option>
                      {unassignedRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {touched.role_id && errors.role_id && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.role_id}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="bg-ncos-green-900 hover:bg-ncos-green-800"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || values.role_id === 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
