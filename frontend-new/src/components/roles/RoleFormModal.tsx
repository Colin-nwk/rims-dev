import React from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  type Role,
  type CreateRoleFormData,
  createRoleSchema,
  generateSlug,
} from "@/lib/api/roles";
import { useGenericData } from "@/lib/api/statistics";
import { Info, Globe, Loader2 } from "lucide-react";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (data: CreateRoleFormData) => void;
  isLoading?: boolean;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  role,
  onSubmit,
  isLoading = false,
}) => {
  const isEditMode = !!role;
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();

  const initialValues: CreateRoleFormData = {
    name: role?.name || "",
    slug: role?.slug || "",
    prison_id: role?.prison_id || null,
    state_id: role?.state_id || null,
    zone_id: role?.zone_id || null,
    scopeless: role?.scopeless || false,
    permissions: role?.permissions?.map((p) => p.id) || [],
  };

  const handleSubmit = (
    values: CreateRoleFormData,
    { resetForm }: FormikHelpers<CreateRoleFormData>,
  ) => {
    onSubmit(values);
    if (!isEditMode) {
      resetForm();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Edit Role: ${role.name}` : "Create New Role"}
      description={
        isEditMode
          ? "Update the role details below"
          : "Define a new role for your system"
      }
      size="lg"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(createRoleSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
          <Form className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block mb-1.5 text-sm font-medium text-slate-700"
              >
                Role Name <span className="text-red-500">*</span>
              </label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="e.g. Finance Admin"
                error={touched.name && errors.name ? errors.name : undefined}
                disabled={isLoading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const name = e.target.value;
                  setFieldValue("name", name);
                  // Auto-generate slug when creating new role
                  if (!isEditMode) {
                    setFieldValue("slug", generateSlug(name));
                  }
                }}
              />
            </div>

            {/* Slug Field */}
            <div>
              <label
                htmlFor="slug"
                className="block mb-1.5 text-sm font-medium text-slate-700"
              >
                Slug <span className="text-red-500">*</span>
              </label>
              <Field
                as={Input}
                id="slug"
                name="slug"
                placeholder="e.g. finance-admin"
                error={touched.slug && errors.slug ? errors.slug : undefined}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                Unique identifier using lowercase letters, numbers, and hyphens
              </p>
            </div>

            {/* Scopeless Toggle */}
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-slate-50 border-slate-200">
              <div className="flex items-center h-5 mt-0.5">
                <Field
                  type="checkbox"
                  id="scopeless"
                  name="scopeless"
                  className="w-4 h-4 border rounded text-ncos-green-600 border-slate-300 focus:ring-ncos-green-500"
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="scopeless"
                  className="flex items-center gap-2 text-sm font-medium text-slate-900 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-purple-500" />
                  Full Access (Scopeless)
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  When enabled, this role has access to all data regardless of
                  zone, state, or custodial center assignments
                </p>
              </div>
            </div>

            {/* Scope Fields (hidden when scopeless) */}
            {!values.scopeless && (
              <div className="space-y-4 p-4 border rounded-lg border-slate-200">
                <h4 className="text-sm font-medium text-slate-700">
                  Scope Restrictions (Optional)
                </h4>
                <p className="text-xs text-slate-500">
                  Leave empty for unrestricted access within assigned
                  permissions
                </p>

                {isLoadingGeneric ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-500">
                      Loading options...
                    </span>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Zone */}
                    <div>
                      <label
                        htmlFor="zone_id"
                        className="block mb-1.5 text-xs font-medium text-slate-600"
                      >
                        Zone
                      </label>
                      <select
                        id="zone_id"
                        value={values.zone_id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue(
                            "zone_id",
                            val ? parseInt(val, 10) : null,
                          );
                          // Clear state and prison when zone changes
                          setFieldValue("state_id", null);
                          setFieldValue("prison_id", null);
                        }}
                        disabled={isLoading}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Zone</option>
                        {genericData?.zones
                          ?.filter((z) => z.status)
                          .map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.zone}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label
                        htmlFor="state_id"
                        className="block mb-1.5 text-xs font-medium text-slate-600"
                      >
                        State
                        {!values.zone_id && (
                          <span className="ml-1 text-[10px] text-slate-400 font-normal">
                            (select zone first)
                          </span>
                        )}
                      </label>
                      <select
                        id="state_id"
                        value={values.state_id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue(
                            "state_id",
                            val ? parseInt(val, 10) : null,
                          );
                          // Clear prison when state changes
                          setFieldValue("prison_id", null);
                        }}
                        disabled={isLoading || !values.zone_id}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {values.zone_id
                            ? "Select State"
                            : "Select zone first"}
                        </option>
                        {genericData?.states
                          ?.filter(
                            (s) => s.status && s.zone_id === values.zone_id,
                          )
                          .map((state) => (
                            <option key={state.id} value={state.id}>
                              {state.state}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Custodial Center */}
                    <div>
                      <label
                        htmlFor="prison_id"
                        className="block mb-1.5 text-xs font-medium text-slate-600"
                      >
                        Custodial Center
                        {!values.state_id && (
                          <span className="ml-1 text-[10px] text-slate-400 font-normal">
                            (select state first)
                          </span>
                        )}
                      </label>
                      <select
                        id="prison_id"
                        value={values.prison_id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue(
                            "prison_id",
                            val ? parseInt(val, 10) : null,
                          );
                        }}
                        disabled={isLoading || !values.state_id}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {values.state_id
                            ? "Select Center"
                            : "Select state first"}
                        </option>
                        {genericData?.prisons
                          ?.filter(
                            (p) => p.status && p.state_id === values.state_id,
                          )
                          .map((prison) => (
                            <option key={prison.id} value={prison.id}>
                              {prison.prison_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Message */}
            {!isEditMode && (
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-ncos-green-50 border-ncos-green-200">
                <Info className="w-5 h-5 text-ncos-green-600 shrink-0" />
                <p className="text-xs text-ncos-green-800">
                  After creating the role, you can assign granular permissions
                  using the Manage Permissions action in the table.
                </p>
              </div>
            )}

            {/* Actions */}
            <ModalFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || (!dirty && isEditMode)}
                isLoading={isLoading}
              >
                {isEditMode ? "Save Changes" : "Create Role"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
