import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  KeyRound,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type AdminUser,
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  USER_STATUS_OPTIONS,
} from "@/lib/api/users";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => void;
  user?: AdminUser | null;
  isLoading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showPasswordSection, setShowPasswordSection] = React.useState(false);

  const isEditing = !!user;
  const title = isEditing ? "Edit User" : "Create New User";
  const description = isEditing
    ? "Update user information. Changes may require approval."
    : "Add a new admin user to the system.";

  const initialValues: CreateUserFormData | UpdateUserFormData = isEditing
    ? {
        name: user.name,
        email: user.email,
        status: user.status,
        password: "",
        password_confirmation: "",
      }
    : {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      };

  const validationSchema = isEditing
    ? toFormikValidationSchema(updateUserSchema)
    : toFormikValidationSchema(createUserSchema);

  const handleSubmit = (values: CreateUserFormData | UpdateUserFormData) => {
    // Remove empty password fields when editing
    if (isEditing) {
      const data = { ...values };
      if (!data.password || data.password.length === 0) {
        const { ...rest } = data;
        onSubmit(rest as UpdateUserFormData);
      } else {
        onSubmit(data);
      }
    } else {
      onSubmit(values);
    }
  };

  // Reset password section when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowPasswordSection(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ errors, touched, setFieldValue, dirty }) => (
          <Form className="space-y-5">
            {/* Name field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <Field
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${
                    errors.name && touched.name
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 bg-slate-50 focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 focus:bg-white"
                  }`}
                />
              </div>
              <ErrorMessage
                name="name"
                component="p"
                className="text-xs text-red-500 mt-1"
              />
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <Field
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${
                    errors.email && touched.email
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 bg-slate-50 focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 focus:bg-white"
                  }`}
                />
              </div>
              <ErrorMessage
                name="email"
                component="p"
                className="text-xs text-red-500 mt-1"
              />
            </div>

            {/* Status field - only for editing */}
            {isEditing && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <Field
                  as="select"
                  name="status"
                  className="w-full px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 focus:bg-white transition-all duration-200 outline-none appearance-none cursor-pointer"
                >
                  {USER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
              </div>
            )}

            {/* Password section toggle for editing */}
            {isEditing && !showPasswordSection && (
              <button
                type="button"
                onClick={() => setShowPasswordSection(true)}
                className="flex items-center gap-2 text-sm font-medium text-ncos-green-700 hover:text-ncos-green-800 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </button>
            )}

            {/* Password fields - always show for creation, toggle for editing */}
            {(!isEditing || showPasswordSection) && (
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      Change Password
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setFieldValue("password", "");
                        setFieldValue("password_confirmation", "");
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      {isEditing ? "New Password" : "Password"}{" "}
                      {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${
                          errors.password && touched.password
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-slate-200 bg-slate-50 focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 focus:bg-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Confirm{" "}
                      {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <Field
                        name="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${
                          errors.password_confirmation && touched.password_confirmation
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-slate-200 bg-slate-50 focus:border-ncos-green-500 focus:ring-2 focus:ring-ncos-green-500/20 focus:bg-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password_confirmation"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Password requirements hint */}
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Min 8 characters with uppercase, lowercase, and number
                  </span>
                </p>
              </div>
            )}

            {/* Notice */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                {isEditing
                  ? "Changes will be submitted for approval before taking effect."
                  : "New user creation requires approval from a supervisor."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (isEditing && !dirty)}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
