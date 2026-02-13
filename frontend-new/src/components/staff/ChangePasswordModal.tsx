import React, { useState } from "react";
import { toast } from "react-toastify";
import { Key, Lock } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword, useResetPassword } from "@/lib/api/staff";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceNo: string;
  staffName?: string;
  isOwnPassword: boolean;
}

interface FormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface FormErrors {
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  serviceNo,
  staffName,
  isOwnPassword,
}) => {
  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const changePassword = useChangePassword();
  const resetPassword = useResetPassword();

  const isLoading = changePassword.isPending || resetPassword.isPending;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (isOwnPassword && !formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.password) {
      newErrors.password = "New password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isOwnPassword) {
        await changePassword.mutateAsync({
          current_password: formData.current_password,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        });
        toast.success("Your password has been changed successfully");
      } else {
        await resetPassword.mutateAsync({
          serviceNo,
          data: {
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          },
        });
        toast.success(
          `Password for ${staffName || serviceNo} has been reset successfully`,
        );
      }
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    }
  };

  const handleClose = () => {
    setFormData({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title = isOwnPassword ? "Change Your Password" : "Reset Staff Password";
  const description = isOwnPassword
    ? "Enter your current password and choose a new password"
    : `Reset password for ${staffName || serviceNo}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            {isOwnPassword ? (
              <div>
                <p className="mb-2">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter (A-Z)</li>
                  <li>At least one lowercase letter (a-z)</li>
                  <li>At least one number (0-9)</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  You are resetting the password for this staff member. Password requirements:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter (A-Z)</li>
                  <li>At least one lowercase letter (a-z)</li>
                  <li>At least one number (0-9)</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Current Password (only for self-change) */}
        {isOwnPassword && (
          <Input
            label="Current Password"
            type="password"
            value={formData.current_password}
            onChange={(e) =>
              handleInputChange("current_password", e.target.value)
            }
            error={errors.current_password}
            icon={<Lock className="w-4 h-4" />}
            placeholder="Enter your current password"
            disabled={isLoading}
            required
          />
        )}

        {/* New Password */}
        <Input
          label="New Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={errors.password}
          icon={<Key className="w-4 h-4" />}
          placeholder="Enter new password (min. 8 characters)"
          disabled={isLoading}
          required
        />

        {/* Confirm Password */}
        <Input
          label="Confirm New Password"
          type="password"
          value={formData.password_confirmation}
          onChange={(e) =>
            handleInputChange("password_confirmation", e.target.value)
          }
          error={errors.password_confirmation}
          icon={<Key className="w-4 h-4" />}
          placeholder="Re-enter new password"
          disabled={isLoading}
          required
        />

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isOwnPassword ? "Change Password" : "Reset Password"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
