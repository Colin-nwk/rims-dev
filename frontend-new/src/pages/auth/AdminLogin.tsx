import { useNavigate } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAdminLogin } from "@/hooks/useAuth";
import {
  adminLoginSchema,
  type AdminLoginFormData,
} from "@/lib/api/auth/schemas";

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
        navigate("/dashboard");
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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-navy-950 px-4 py-6 sm:px-6 lg:px-8">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute rounded-full -top-12 -right-12 sm:-top-24 sm:-right-24 w-48 h-48 sm:w-96 sm:h-96 bg-gold-500 blur-3xl" />
        <div className="absolute rounded-full top-1/2 -left-12 sm:-left-24 w-36 h-36 sm:w-72 sm:h-72 bg-navy-600 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-8 shadow-2xl backdrop-blur-md bg-white/95 border-white/20">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 p-2 mx-auto mb-3 sm:mb-4 bg-white border-2 shadow-lg rounded-xl border-gold-500">
            <img
              src="/logo.png"
              alt="Nigerian Correctional Service Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="mb-2 text-xl sm:text-2xl font-semibold text-slate-900">
            Administrator Login
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-slate-500">
            Registry Management System
          </p>
        </div>

        {/* Login Form with Formik */}
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(adminLoginSchema)}
          onSubmit={handleSubmit}
          validateOnBlur={true}
          validateOnChange={false}
        >
          {({ errors, touched, isSubmitting, getFieldProps }) => (
            <Form className="space-y-4 sm:space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                error={touched.email && errors.email ? errors.email : ""}
                disabled={isPending || isSubmitting}
                autoComplete="email"
                {...getFieldProps("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={
                  touched.password && errors.password ? errors.password : ""
                }
                disabled={isPending || isSubmitting}
                autoComplete="current-password"
                {...getFieldProps("password")}
              />

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs sm:text-sm font-medium transition-colors text-navy-900 hover:text-gold-600 disabled:opacity-50 active:text-gold-700"
                  disabled={isPending || isSubmitting}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-sm sm:text-base text-white shadow-lg shadow-navy-900/20 bg-navy-900 hover:bg-navy-800"
                isLoading={isPending || isSubmitting}
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Footer Links */}
        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600">
            Staff member?{" "}
            <button
              type="button"
              onClick={() => navigate("/staff-login")}
              className="font-medium transition-colors text-navy-900 hover:text-gold-600 active:text-gold-700"
              disabled={isPending}
            >
              Staff Login
            </button>
          </p>
        </div>
      </Card>

      {/* Footer Attribution */}
      <div className="absolute left-0 right-0 text-center bottom-2 sm:bottom-4 px-4">
        <p className="text-[10px] sm:text-xs text-white/60">
          © {new Date().getFullYear()} Nigerian Correctional Service
        </p>
      </div>
    </div>
  );
}
