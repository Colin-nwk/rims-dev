import { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AuthLayout from "@/layouts/AuthLayout";
import {
  publicComplaintSchema,
  RELATED_TO_OPTIONS,
  useSubmitPublicComplaint,
  type PublicComplaintFormData,
} from "@/lib/api/complaints";
import { AlertTriangle, CheckCircle, Send } from "lucide-react";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "align",
];

export default function Complaint() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: submitComplaint, isPending: isSubmitting } =
    useSubmitPublicComplaint();

  const initialValues: PublicComplaintFormData = {
    first_name: "",
    other_names: "",
    last_name: "",
    phone_number: "",
    ippis: "",
    service_no: "",
    email: "",
    related_to: "Others",
    subject: "",
    message: "",
  };

  const handleSubmit = (
    values: PublicComplaintFormData,
    { setSubmitting, resetForm }: FormikHelpers<PublicComplaintFormData>,
  ) => {
    setSubmitError(null);
    submitComplaint(values, {
      onSuccess: () => {
        toast.success("Your complaint has been submitted successfully!");
        setIsSubmitted(true);
        resetForm();
      },
      onError: (error) => {
        const errorMessage =
          error.message ||
          "Failed to submit complaint. Please verify your details.";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        setSubmitting(false);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-2xl p-6 mx-auto shadow-2xl sm:p-8 backdrop-blur-md bg-white/95 border-white/20">
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Complaint Submitted!
            </h2>
            <p className="text-slate-600 mb-6">
              Your complaint has been received and is being reviewed by an
              administrator. You will be contacted via the details you provided.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="border-ncos-green-900 text-ncos-green-900 hover:bg-ncos-green-50"
              >
                Submit Another Complaint
              </Button>
              <Link to="/staff-login">
                <Button className="w-full sm:w-auto bg-ncos-green-900 hover:bg-ncos-green-800 text-white">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-4xl p-4 mx-auto shadow-2xl sm:p-6 lg:p-8 backdrop-blur-md bg-white/95 border-white/20">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-xl font-semibold sm:text-2xl text-slate-900">
            Contact an Admin
          </h1>
          <p className="text-sm text-slate-500">
            Send a message to RIMS Department
          </p>
        </div>

        {/* Note Banner */}
        <div className="p-3 mb-6 border rounded-lg bg-amber-50 border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-800">
              <span className="font-semibold">NOTE:</span> If you want to update
              your primary data such as Name, date of birth, service number,
              etc. Please contact the CGP's office or send an email to{" "}
              <a
                href="mailto:cgp@corrections.gov.ng"
                className="font-semibold underline"
              >
                cgp@corrections.gov.ng
              </a>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="p-3 mb-6 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(publicComplaintSchema)}
          onSubmit={handleSubmit}
          validateOnBlur={true}
          validateOnChange={false}
        >
          {({
            errors,
            touched,
            isSubmitting: formSubmitting,
            getFieldProps,
            setFieldValue,
            values,
          }) => (
            <Form className="space-y-4 sm:space-y-5">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="First Name"
                  error={touched.first_name ? errors.first_name : undefined}
                  disabled={isSubmitting || formSubmitting}
                  required={true}
                  {...getFieldProps("first_name")}
                />
                <Input
                  label="Othernames"
                  type="text"
                  placeholder="Othernames"
                  error={touched.other_names ? errors.other_names : undefined}
                  disabled={isSubmitting || formSubmitting}
                  {...getFieldProps("other_names")}
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Last Name"
                  error={touched.last_name ? errors.last_name : undefined}
                  disabled={isSubmitting || formSubmitting}
                  required={true}
                  {...getFieldProps("last_name")}
                />
              </div>

              {/* Row 2: Contact & Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Phone Number"
                  error={touched.phone_number ? errors.phone_number : undefined}
                  disabled={isSubmitting || formSubmitting}
                  {...getFieldProps("phone_number")}
                />
                <Input
                  label="IPPIS"
                  type="text"
                  placeholder="IPPIS"
                  error={touched.ippis ? errors.ippis : undefined}
                  disabled={isSubmitting || formSubmitting}
                  required={true}
                  {...getFieldProps("ippis")}
                />
                <Input
                  label="Service Number"
                  type="text"
                  placeholder="Service Number"
                  error={touched.service_no ? errors.service_no : undefined}
                  disabled={isSubmitting || formSubmitting}
                  required={true}
                  {...getFieldProps("service_no")}
                />
              </div>

              {/* Row 3: Email & Related To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Email Address"
                  error={touched.email ? errors.email : undefined}
                  disabled={isSubmitting || formSubmitting}
                  required={true}
                  {...getFieldProps("email")}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Related To
                  </label>
                  <select
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors ${
                      touched.related_to && errors.related_to
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    disabled={isSubmitting || formSubmitting}
                    {...getFieldProps("related_to")}
                  >
                    {RELATED_TO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {touched.related_to && errors.related_to && (
                    <p className="text-xs text-red-500">{errors.related_to}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Subject */}
              <Input
                label="Subject"
                type="text"
                placeholder="Subject"
                error={touched.subject ? errors.subject : undefined}
                disabled={isSubmitting || formSubmitting}
                required={true}
                {...getFieldProps("subject")}
              />

              {/* Row 5: Message (Rich Text Editor) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <div
                  className={`bg-white rounded-lg border ${
                    touched.message && errors.message
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                >
                  <ReactQuill
                    theme="snow"
                    value={values.message}
                    onChange={(content) => setFieldValue("message", content)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter your message here..."
                    readOnly={isSubmitting || formSubmitting}
                    className="[&_.ql-container]:min-h-[150px] [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-container]:border-0"
                  />
                </div>
                {touched.message && errors.message && (
                  <p className="text-xs text-red-500">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full text-sm text-white shadow-lg sm:text-base shadow-ncos-green-900/20 bg-ncos-green-900 hover:bg-ncos-green-800"
                  isLoading={isSubmitting || formSubmitting}
                  disabled={isSubmitting || formSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting || formSubmitting
                    ? "Submitting..."
                    : "Submit Complaint"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need to login instead?{" "}
            <Link
              to="/staff-login"
              className="font-semibold text-ncos-green-900 hover:text-ncos-green-700 transition-colors"
            >
              Staff Login
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
