import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResetPassword, useStaffResetPassword } from "@/hooks/useAuth";
import AuthLayout from "@/layouts/AuthLayout";
import {
    resetPasswordSchema,
    staffResetPasswordSchema,
    type ResetPasswordFormData,
    type StaffResetPasswordFormData,
} from "@/lib/api/auth/schemas";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { toFormikValidationSchema } from "zod-formik-adapter";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract token and email/service_no from URL params
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const serviceNo = searchParams.get("service_no") || "";

  // Determine if this is a staff reset based on presence of service_no
  const isStaff = !!serviceNo;

  const { mutate: resetPassword, isPending: isUserPending } =
    useResetPassword();
  const { mutate: staffResetPassword, isPending: isStaffPending } =
    useStaffResetPassword();

  const userInitialValues: ResetPasswordFormData = {
    token,
    email,
    password: "",
    password_confirmation: "",
  };

  const staffInitialValues: StaffResetPasswordFormData = {
    token,
    service_no: serviceNo,
    password: "",
    password_confirmation: "",
  };

  const handleUserSubmit = (
    values: ResetPasswordFormData,
    { setSubmitting }: FormikHelpers<ResetPasswordFormData>,
  ) => {
    resetPassword(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Password reset successfully!");
        setTimeout(() => {
          navigate("/admin-login");
        }, 3000);
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to reset password. Please try again.",
        );
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  const handleStaffSubmit = (
    values: StaffResetPasswordFormData,
    { setSubmitting }: FormikHelpers<StaffResetPasswordFormData>,
  ) => {
    staffResetPassword(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Password reset successfully!");
        setTimeout(() => {
          navigate("/staff-login");
        }, 3000);
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to reset password. Please try again.",
        );
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md p-6 mx-auto shadow-2xl sm:p-8 backdrop-blur-md bg-white/95 border-white/20">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="flex items-center justify-center w-16 h-16 p-2 mx-auto mb-3 bg-white border-2 shadow-lg sm:w-20 sm:h-20 sm:mb-4 rounded-xl border-gold-500">
            <img
              src="/logo.png"
              alt="Nigerian Correctional Service Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="mb-2 text-xl font-semibold sm:text-2xl text-slate-900">
            Reset Password
          </h1>
          <p className="text-xs font-medium tracking-wide uppercase sm:text-sm text-slate-500">
            Corrections Registry Information Management System
          </p>
        </div>

        {/* Instructions */}
        <div className="p-3 mb-4 text-sm bg-blue-50 border border-blue-200 rounded-lg sm:p-4 sm:mb-6 text-blue-800">
          <p className="text-center mb-2">Enter your new password. Requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>At least 8 characters</li>
            <li>At least one uppercase letter (A-Z)</li>
            <li>At least one lowercase letter (a-z)</li>
            <li>At least one number (0-9)</li>
          </ul>
        </div>

        {/* Reset Password Form with Formik */}
        {isStaff ? (
          <Formik
            initialValues={staffInitialValues}
            validationSchema={toFormikValidationSchema(
              staffResetPasswordSchema,
            )}
            onSubmit={handleStaffSubmit}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({ errors, touched, isSubmitting, getFieldProps }) => (
              <Form className="space-y-4 sm:space-y-5">
                <Input
                  label="Service Number"
                  type="text"
                  placeholder="00001"
                  error={touched.service_no ? errors.service_no : undefined}
                  disabled={true} // Pre-filled and disabled
                  autoComplete="username"
                  autoFocus
                  {...getFieldProps("service_no")}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={touched.password ? errors.password : undefined}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="new-password"
                  {...getFieldProps("password")}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={
                    touched.password_confirmation
                      ? errors.password_confirmation
                      : undefined
                  }
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="new-password"
                  {...getFieldProps("password_confirmation")}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isUserPending || isStaffPending || isSubmitting}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                >
                  {isUserPending || isStaffPending || isSubmitting
                    ? "Resetting..."
                    : "Reset Password"}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={userInitialValues}
            validationSchema={toFormikValidationSchema(resetPasswordSchema)}
            onSubmit={handleUserSubmit}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({ errors, touched, isSubmitting, getFieldProps }) => (
              <Form className="space-y-4 sm:space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                  error={touched.email ? errors.email : undefined}
                  disabled={true} // Pre-filled and disabled
                  autoComplete="email"
                  autoFocus
                  {...getFieldProps("email")}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={touched.password ? errors.password : undefined}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="new-password"
                  {...getFieldProps("password")}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={
                    touched.password_confirmation
                      ? errors.password_confirmation
                      : undefined
                  }
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="new-password"
                  {...getFieldProps("password_confirmation")}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isUserPending || isStaffPending || isSubmitting}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                >
                  {isUserPending || isStaffPending || isSubmitting
                    ? "Resetting..."
                    : "Reset Password"}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {/* Back to Login Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate(isStaff ? "/staff-login" : "/admin-login")}
            className="text-xs font-medium transition-colors sm:text-sm text-ncos-green-900 hover:text-gold-600"
          >
            Back to Login
          </button>
        </div>
      </Card>
    </AuthLayout>
  );
}
