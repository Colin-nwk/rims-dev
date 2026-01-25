import { useNavigate } from "react-router-dom";
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
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 overflow-hidden bg-navy-950 sm:px-6 lg:px-8">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-48 h-48 rounded-full -top-12 -right-12 sm:-top-24 sm:-right-24 sm:w-96 sm:h-96 bg-gold-500 blur-3xl" />
        <div className="absolute rounded-full top-1/2 -left-12 sm:-left-24 w-36 h-36 sm:w-72 sm:h-72 bg-navy-600 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md p-6 mx-auto shadow-2xl sm:p-8 backdrop-blur-md bg-white/95 border-white/20">
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
            Registry Management System
          </p>
        </div>

        {/* Login Form with Formik */}
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(staffLoginSchema)}
          onSubmit={handleSubmit}
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
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium transition-colors sm:text-sm text-navy-900 hover:text-gold-600 disabled:opacity-50 active:text-gold-700"
                  disabled={isPending || isSubmitting}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-sm text-white shadow-lg sm:text-base shadow-navy-900/20 bg-navy-900 hover:bg-navy-800"
                isLoading={isPending || isSubmitting}
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Footer Links */}
        <div className="mt-5 text-center sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-600">
            Administrator?{" "}
            <button
              type="button"
              onClick={() => navigate("/admin-login")}
              className="font-medium transition-colors text-navy-900 hover:text-gold-600 active:text-gold-700"
              disabled={isPending}
            >
              Admin Login
            </button>
          </p>
        </div>
      </Card>

      {/* Footer Attribution */}
      <div className="absolute left-0 right-0 px-4 text-center bottom-2 sm:bottom-4">
        <p className="text-[10px] sm:text-xs text-white/60">
          © {new Date().getFullYear()} Nigerian Correctional Service
        </p>
      </div>
    </div>
  );
}
