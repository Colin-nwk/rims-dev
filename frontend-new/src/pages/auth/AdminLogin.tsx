import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminLogin } from "@/hooks/useAuth";
import AuthLayout from "@/layouts/AuthLayout";
import {
  adminLoginSchema,
  type AdminLoginFormData,
} from "@/lib/api/auth/schemas";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toFormikValidationSchema } from "zod-formik-adapter";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useAdminLogin();

  const initialValues: AdminLoginFormData = {
    email: "",
    password: "",
  };

  const handleSubmit = (
    values: AdminLoginFormData,
    { setSubmitting }: FormikHelpers<AdminLoginFormData>,
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
            Administrator Login
          </h1>
          <p className="text-xs font-medium tracking-wide uppercase sm:text-sm text-slate-500">
            Corrections Registry Information Management System
          </p>
        </div>

        {/* Login Form with Formik */}
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(adminLoginSchema)}
          onSubmit={handleSubmit}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ errors, touched, isSubmitting, getFieldProps }) => (
            <Form className="space-y-4 sm:space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                error={touched.email ? errors.email : undefined}
                disabled={isPending || isSubmitting}
                autoComplete="email"
                {...getFieldProps("email")}
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
            </Form>
          )}
        </Formik>
      </Card>
    </AuthLayout>
  );
}
