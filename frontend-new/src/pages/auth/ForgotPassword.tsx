import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useForgotPassword, useStaffForgotPassword } from "@/hooks/useAuth";
import {
  forgotPasswordSchema,
  staffForgotPasswordSchema,
  type ForgotPasswordFormData,
  type StaffForgotPasswordFormData,
} from "@/lib/api/auth/schemas";
import AuthLayout from "@/layouts/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "user"; // Default to user type
  const [isStaff, setIsStaff] = useState(userType === "staff");

  const { mutate: forgotPassword, isPending: isUserPending } = useForgotPassword();
  const { mutate: staffForgotPassword, isPending: isStaffPending } = useStaffForgotPassword();

  const userInitialValues: ForgotPasswordFormData = {
    email: "",
  };

  const staffInitialValues: StaffForgotPasswordFormData = {
    service_no: "",
    email: "",
  };

  const handleUserSubmit = (
    values: ForgotPasswordFormData,
    { setSubmitting }: FormikHelpers<ForgotPasswordFormData>,
  ) => {
    forgotPassword(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Password reset link sent successfully!");
        setTimeout(() => {
          navigate(isStaff ? "/staff-login" : "/admin-login");
        }, 3000);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send password reset link. Please try again.");
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  const handleStaffSubmit = (
    values: StaffForgotPasswordFormData,
    { setSubmitting }: FormikHelpers<StaffForgotPasswordFormData>,
  ) => {
    staffForgotPassword(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Password reset link sent successfully!");
        setTimeout(() => {
          navigate(isStaff ? "/staff-login" : "/admin-login");
        }, 3000);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send password reset link. Please try again.");
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  const toggleUserType = () => {
    setIsStaff(!isStaff);
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
            Forgot Password
          </h1>
          <p className="text-xs font-medium tracking-wide uppercase sm:text-sm text-slate-500">
            Registry Management System
          </p>
        </div>

        {/* Toggle between user types */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setIsStaff(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !isStaff
                  ? "bg-white text-ncos-green-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin User
            </button>
            <button
              type="button"
              onClick={() => setIsStaff(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isStaff
                  ? "bg-white text-ncos-green-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Staff Member
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 mb-4 text-sm text-center bg-blue-50 border border-blue-200 rounded-lg sm:p-4 sm:mb-6 text-blue-800">
          {isStaff
            ? "Enter your service number and email address to receive a password reset link."
            : "Enter your email address to receive a password reset link."}
        </div>

        {/* Forgot Password Form with Formik */}
        {isStaff ? (
          <Formik
            initialValues={staffInitialValues}
            validationSchema={toFormikValidationSchema(staffForgotPasswordSchema)}
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
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="username"
                  autoFocus
                  {...getFieldProps("service_no")}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="email@example.com"
                  error={touched.email ? errors.email : undefined}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="email"
                  {...getFieldProps("email")}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isUserPending || isStaffPending || isSubmitting}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                >
                  {isUserPending || isStaffPending || isSubmitting
                    ? "Sending..."
                    : "Send Reset Link"}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={userInitialValues}
            validationSchema={toFormikValidationSchema(forgotPasswordSchema)}
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
                  disabled={isUserPending || isStaffPending || isSubmitting}
                  autoComplete="email"
                  autoFocus
                  {...getFieldProps("email")}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isUserPending || isStaffPending || isSubmitting}
                  disabled={isUserPending || isStaffPending || isSubmitting}
                >
                  {isUserPending || isStaffPending || isSubmitting
                    ? "Sending..."
                    : "Send Reset Link"}
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