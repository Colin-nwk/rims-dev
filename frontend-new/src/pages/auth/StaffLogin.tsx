import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useStaffLogin } from "@/hooks/useAuth";
import {
  staffLoginSchema,
  type StaffLoginFormData,
} from "@/lib/api/auth/schemas";
import AuthLayout from "@/layouts/AuthLayout";

export default function StaffLogin() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useStaffLogin();

  const initialValues: StaffLoginFormData = {
    service_no: "",
    password: "",
  };

  const handleSubmit = (
    values: StaffLoginFormData,
    { setSubmitting }: FormikHelpers<StaffLoginFormData>,
  ) => {
    login(values, {
      onSuccess: () => {
        toast.success("Login successful! Welcome back.");
        window.location.href = "/dashboard";
      },
      onError: (error) => {
        toast.error(
          error.message || "Login failed. Please check your credentials.",
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
            Staff Login
          </h1>
          <p className="text-xs font-medium tracking-wide uppercase sm:text-sm text-slate-500">
            Corrections Registry Information Management System
          </p>
        </div>

        {/* First-time Login Info */}
        <div className="p-3 mb-4 border rounded-lg sm:p-4 sm:mb-6 bg-blue-50 border-blue-200">
          <p className="text-center text-xs leading-relaxed sm:text-sm text-blue-800">
            <span className="font-semibold">NOTE:</span> If you are logging in
            for the first time, please click{" "}
            <Link
              to="/confirm-service-number"
              className="font-bold underline transition-colors text-blue-600 hover:text-blue-800"
            >
              Confirm Service Number
            </Link>
            .
          </p>
        </div>

        {/* Login Form with Formik */}
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(staffLoginSchema)}
          onSubmit={handleSubmit}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ errors, touched, isSubmitting, getFieldProps }) => (
            <Form className="space-y-4 sm:space-y-5">
              <Input
                label="Service Number"
                type="text"
                placeholder="00001"
                error={touched.service_no ? errors.service_no : undefined}
                disabled={isPending || isSubmitting}
                autoComplete="username"
                autoFocus
                {...getFieldProps("service_no")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={touched.password ? errors.password : undefined}
                disabled={isPending || isSubmitting}
                autoComplete="current-password"
                {...getFieldProps("password")}
              />

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/forgot-password");
                  }}
                  className="text-xs font-medium transition-colors sm:text-sm text-ncos-green-900 hover:text-gold-600 disabled:opacity-50 active:text-gold-700"
                  disabled={isPending || isSubmitting}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                isLoading={isPending || isSubmitting}
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              {/* Public Complaint Link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-600 sm:text-sm">
                  Need to submit a complaint?
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/complaint")}
                  className="text-xs font-semibold transition-colors sm:text-sm text-ncos-green-900 hover:text-gold-600 hover:underline"
                  disabled={isPending || isSubmitting}
                >
                  Go to Public Complaint Portal
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </AuthLayout>
  );
}
