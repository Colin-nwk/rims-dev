import React from "react";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Loader2, HelpCircle } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  createComplaintSchema,
  type CreateComplaintFormData,
} from "@/lib/api/complaints";

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateComplaintFormData) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORY_OPTIONS = COMPLAINT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat === "IT" ? "IT Support" : cat,
}));

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", description: "Non-urgent issues" },
  { value: "medium", label: "Medium", description: "Standard priority" },
  { value: "high", label: "High", description: "Important issues" },
  { value: "critical", label: "Critical", description: "Urgent attention needed" },
] as const;

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const initialValues: CreateComplaintFormData = {
    subject: "",
    category: "Other",
    priority: "medium",
  };

  const handleSubmit = async (
    values: CreateComplaintFormData,
    { setSubmitting, resetForm }: FormikHelpers<CreateComplaintFormData>,
  ) => {
    try {
      await onSubmit(values);
      resetForm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Support Ticket"
      description="Submit a new help desk request"
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(createComplaintSchema)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-5">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <Field
                as={Input}
                id="subject"
                name="subject"
                placeholder="Brief summary of your issue"
                disabled={isSubmitting}
                className={
                  touched.subject && errors.subject ? "border-red-500" : ""
                }
              />
              {touched.subject && errors.subject && (
                <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Category
                </label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent transition-all"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Field>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Priority
                </label>
                <Field
                  as="select"
                  id="priority"
                  name="priority"
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent transition-all"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Field>
              </div>
            </div>

            {/* Priority Description */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {PRIORITY_OPTIONS.find((p) => p.value === values.priority)?.label}:
                </span>{" "}
                {PRIORITY_OPTIONS.find((p) => p.value === values.priority)?.description}
              </p>
            </div>

            {/* Footer */}
            <ModalFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
