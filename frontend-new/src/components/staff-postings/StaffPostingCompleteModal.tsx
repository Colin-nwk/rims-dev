import React, { useMemo, useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CompleteStaffPostingDTO,
  StaffPosting,
} from "@/lib/api/staff-postings";

interface StaffPostingCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompleteStaffPostingDTO) => void;
  posting?: StaffPosting | null;
  isLoading?: boolean;
}

function formatDateForInput(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0].split(" ")[0];
}

export function StaffPostingCompleteModal({
  isOpen,
  onClose,
  onSubmit,
  posting,
  isLoading = false,
}: StaffPostingCompleteModalProps) {
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [resetKey, setResetKey] = useState<string | null>(null);

  const currentResetKey = useMemo(() => {
    if (!isOpen) return null;
    return `${posting?.id ?? "new"}-complete`;
  }, [isOpen, posting?.id]);

  if (currentResetKey && currentResetKey !== resetKey) {
    setResetKey(currentResetKey);
    setEndDate(formatDateForInput(posting?.end_date));
    setRemarks("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      end_date: endDate || undefined,
      remarks: remarks.trim() || undefined,
    });
  }

  if (!posting) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Posting"
      description="Mark this posting as completed and set the end date."
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-900">
          {posting.station_name}
        </p>
        <p className="text-xs text-slate-500">
          Service No: {posting.service_no}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            className="w-full min-h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
            placeholder="Optional"
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Mark Completed
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
