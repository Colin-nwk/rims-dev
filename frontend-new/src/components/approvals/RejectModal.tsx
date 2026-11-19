import React from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  type ChangeRequest,
  rejectRequestSchema,
  type RejectRequestFormData,
} from "@/lib/api/change-requests";
import { AlertTriangle, XCircle } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ChangeRequest | null;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirm,
  isLoading = false,
}) => {
  if (!request) return null;

  const initialValues: RejectRequestFormData = {
    reason: "",
  };

  const handleSubmit = (
    values: RejectRequestFormData,
    { resetForm }: FormikHelpers<RejectRequestFormData>,
  ) => {
    onConfirm(values.reason);
    resetForm();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Request"
      description="Please provide a reason for rejecting this request"
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(rejectRequestSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form className="space-y-6">
            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 border border-amber-200 rounded-lg bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">
                  This action cannot be undone
                </h4>
                <p className="mt-1 text-sm text-amber-700">
                  Once rejected, this change request will be marked as rejected
                  and the requester will be notified.
                </p>
              </div>
            </div>

            {/* Request Summary */}
            <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Request ID</span>
                  <p className="font-medium text-slate-900">#{request.id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Type</span>
                  <p className="font-medium text-slate-900">{request.type}</p>
                </div>
                {request.service_no && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Service No</span>
                    <p className="font-mono font-medium text-slate-900">
                      {request.service_no}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason Field */}
            <div>
              <label
                htmlFor="reason"
                className="block mb-1.5 text-sm font-medium text-slate-700"
              >
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                id="reason"
                name="reason"
                rows={4}
                placeholder="Please explain why this request is being rejected..."
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.reason && touched.reason
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-indigo-500"
                }`}
                disabled={isLoading}
              />
              {errors.reason && touched.reason && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.reason}
                </p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Minimum 10 characters required. This message will be visible to
                the requester.
              </p>
            </div>

            {/* Actions */}
            <ModalFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={!isValid || !dirty}
                isLoading={isLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
