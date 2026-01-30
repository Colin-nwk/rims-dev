import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRegister, useSetPassword } from "@/hooks/useAuth";
import {
  registerSchema,
  setPasswordSchema,
  type RegisterFormData,
  type SetPasswordFormData,
} from "@/lib/api/auth/schemas";
import { CheckCircle, ArrowLeft } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";

type Step = "confirm" | "password";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [serviceNo, setServiceNo] = useState("");

  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: setPassword, isPending: isSettingPassword } =
    useSetPassword();

  const registerInitialValues: RegisterFormData = {
    service_no: "",
    file_no: "",
    ippis: "",
  };

  const passwordInitialValues: SetPasswordFormData = {
    service_no: serviceNo,
    password: "",
    password_confirmation: "",
  };

  const handleRegister = (
    values: RegisterFormData,
    { setSubmitting }: FormikHelpers<RegisterFormData>,
  ) => {
    register(values, {
      onSuccess: (response) => {
        toast.success("Service number confirmed! Please set your password.");
        setServiceNo(response.data?.service_no || values.service_no);
        setStep("password");
      },
      onError: (error) => {
        toast.error(
          error.message || "Registration failed. Please check your details.",
        );
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  const handleSetPassword = (
    values: SetPasswordFormData,
    { setSubmitting }: FormikHelpers<SetPasswordFormData>,
  ) => {
    setPassword(
      { ...values, service_no: serviceNo },
      {
        onSuccess: () => {
          toast.success(
            "Password set successfully! Please login with your credentials.",
          );
          navigate("/staff-login");
        },
        onError: (error) => {
          toast.error(
            error.message || "Failed to set password. Please try again.",
          );
          setSubmitting(false);
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );
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
            {step === "confirm"
              ? "Confirm Service Number"
              : "Set Your Password"}
          </h1>
          <p className="text-xs font-medium tracking-wide uppercase sm:text-sm text-slate-500">
            {step === "confirm"
              ? "Step 1 of 2: Verify your details"
              : "Step 2 of 2: Create your password"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
              step === "confirm"
                ? "bg-ncos-green-900 text-white"
                : "bg-ncos-green-100 text-ncos-green-900"
            }`}
          >
            {step === "password" ? <CheckCircle className="w-5 h-5" /> : "1"}
          </div>
          <div
            className={`w-12 h-1 rounded-full transition-colors ${
              step === "password" ? "bg-ncos-green-900" : "bg-slate-200"
            }`}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
              step === "password"
                ? "bg-ncos-green-900 text-white"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            2
          </div>
        </div>

        {/* Step 1: Confirm Service Number */}
        {step === "confirm" && (
          <Formik
            initialValues={registerInitialValues}
            validationSchema={toFormikValidationSchema(registerSchema)}
            onSubmit={handleRegister}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({ errors, touched, isSubmitting, getFieldProps }) => (
              <Form className="space-y-4 sm:space-y-5">
                <Input
                  label="Service Number"
                  type="text"
                  placeholder="Enter your service number"
                  error={touched.service_no ? errors.service_no : undefined}
                  disabled={isRegistering || isSubmitting}
                  autoFocus
                  {...getFieldProps("service_no")}
                />

                <Input
                  label="File Number"
                  type="text"
                  placeholder="Enter your file number"
                  error={touched.file_no ? errors.file_no : undefined}
                  disabled={isRegistering || isSubmitting}
                  {...getFieldProps("file_no")}
                />

                <Input
                  label="IPPIS Number"
                  type="text"
                  placeholder="Enter your IPPIS number"
                  error={touched.ippis ? errors.ippis : undefined}
                  disabled={isRegistering || isSubmitting}
                  {...getFieldProps("ippis")}
                />

                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isRegistering || isSubmitting}
                  disabled={isRegistering || isSubmitting}
                >
                  {isRegistering || isSubmitting
                    ? "Verifying..."
                    : "Confirm Details"}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {/* Step 2: Set Password */}
        {step === "password" && (
          <Formik
            initialValues={passwordInitialValues}
            validationSchema={toFormikValidationSchema(setPasswordSchema)}
            onSubmit={handleSetPassword}
            validateOnBlur={true}
            validateOnChange={false}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, getFieldProps }) => (
              <Form className="space-y-4 sm:space-y-5">
                {/* Service Number Display */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Service Number</p>
                  <p className="font-semibold text-slate-900">{serviceNo}</p>
                </div>

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  error={touched.password ? errors.password : undefined}
                  disabled={isSettingPassword || isSubmitting}
                  autoFocus
                  {...getFieldProps("password")}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  error={
                    touched.password_confirmation
                      ? errors.password_confirmation
                      : undefined
                  }
                  disabled={isSettingPassword || isSubmitting}
                  {...getFieldProps("password_confirmation")}
                />

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    <li>At least 8 characters long</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isSettingPassword || isSubmitting}
                  disabled={isSettingPassword || isSubmitting}
                >
                  {isSettingPassword || isSubmitting
                    ? "Setting Password..."
                    : "Set Password & Continue"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="flex items-center justify-center w-full gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  disabled={isSettingPassword || isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go back to Step 1
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/staff-login"
              className="font-semibold text-ncos-green-900 hover:text-ncos-green-700 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
