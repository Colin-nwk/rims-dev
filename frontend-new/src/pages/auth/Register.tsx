import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirmServiceNumber, useSetPassword } from "@/hooks/useAuth";
import AuthLayout from "@/layouts/AuthLayout";
import {
  confirmServiceNumberSchema,
  setPasswordSchema,
  type ConfirmServiceNumberFormData,
  type SetPasswordFormData,
} from "@/lib/api/auth/schemas";
import { Form, Formik, type FormikHelpers } from "formik";
import { AlertCircle, ArrowLeft, CheckCircle, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toFormikValidationSchema } from "zod-formik-adapter";

type Step = "confirm" | "password";

interface ConfirmedStaff {
  service_no: string;
  first_name: string;
  surname: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [confirmedStaff, setConfirmedStaff] = useState<ConfirmedStaff | null>(
    null,
  );
  const [showConfirmError, setShowConfirmError] = useState(false);

  const { mutate: confirmServiceNumber, isPending: isConfirming } =
    useConfirmServiceNumber();
  const { mutate: setPassword, isPending: isSettingPassword } =
    useSetPassword();

  const confirmInitialValues: ConfirmServiceNumberFormData = {
    service_no: "",
    file_no: "",
    ippis: "",
  };

  const passwordInitialValues: SetPasswordFormData = {
    service_no: confirmedStaff?.service_no || "",
    password: "",
    password_confirmation: "",
  };

  const handleConfirm = (
    values: ConfirmServiceNumberFormData,
    { setSubmitting }: FormikHelpers<ConfirmServiceNumberFormData>,
  ) => {
    setShowConfirmError(false); // Clear previous error
    confirmServiceNumber(values, {
      onSuccess: (response) => {
        toast.success("Service number confirmed! Please set your password.");
        setConfirmedStaff({
          service_no: response.data?.service_no || values.service_no,
          first_name: response.data?.first_name || "",
          surname: response.data?.surname || "",
        });
        setShowConfirmError(false);
        setStep("password");
      },
      onError: () => {
        setShowConfirmError(true);
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
    if (!confirmedStaff) return;

    setPassword(
      { ...values, service_no: confirmedStaff.service_no },
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
            initialValues={confirmInitialValues}
            validationSchema={toFormikValidationSchema(
              confirmServiceNumberSchema,
            )}
            onSubmit={handleConfirm}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({ errors, touched, isSubmitting, getFieldProps }) => (
              <Form className="space-y-4 sm:space-y-5">
                {/* Error Alert */}
                {showConfirmError && (
                  <div className="p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                        Service number, IPPIS and file number do not match. You
                        can use the{" "}
                        <Link
                          to="/complaint"
                          className="font-bold underline transition-colors text-red-600 hover:text-red-800"
                        >
                          Make a Request
                        </Link>{" "}
                        link to talk to an admin for help.
                      </p>
                    </div>
                  </div>
                )}

                <Input
                  label="Service Number"
                  type="text"
                  placeholder="Enter your service number"
                  error={touched.service_no ? errors.service_no : undefined}
                  disabled={isConfirming || isSubmitting}
                  autoFocus
                  {...getFieldProps("service_no")}
                />

                <Input
                  label="File Number"
                  type="text"
                  placeholder="Enter your file number"
                  error={touched.file_no ? errors.file_no : undefined}
                  disabled={isConfirming || isSubmitting}
                  {...getFieldProps("file_no")}
                />

                <Input
                  label="IPPIS Number"
                  type="text"
                  placeholder="Enter your IPPIS number"
                  error={touched.ippis ? errors.ippis : undefined}
                  disabled={isConfirming || isSubmitting}
                  {...getFieldProps("ippis")}
                />

                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isConfirming || isSubmitting}
                  disabled={isConfirming || isSubmitting}
                >
                  {isConfirming || isSubmitting
                    ? "Verifying..."
                    : "Confirm Details"}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {/* Step 2: Set Password */}
        {step === "password" && confirmedStaff && (
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
                {/* Confirmed Staff Display */}
                <div className="p-4 rounded-lg bg-ncos-green-50 border border-ncos-green-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ncos-green-100">
                      <User className="w-5 h-5 text-ncos-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {confirmedStaff.first_name} {confirmedStaff.surname}
                      </p>
                      <p className="text-xs text-slate-500">
                        Service No: {confirmedStaff.service_no}
                      </p>
                    </div>
                  </div>
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
                  onClick={() => {
                    setStep("confirm");
                    setShowConfirmError(false);
                  }}
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
            Already have a valid account?{" "}
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
