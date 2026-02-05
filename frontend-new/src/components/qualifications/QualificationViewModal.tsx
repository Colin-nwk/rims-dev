import React from "react";
import {
  GraduationCap,
  FileText,
  Calendar,
  Eye,
  User,
  IdCard,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type StaffEducation,
  getEducationTypeColor,
  formatDateRange,
  getCertificateViewUrl,
} from "@/lib/api/staff-education";
import { getFileUrl } from "@/lib/api";

interface QualificationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  education: StaffEducation | null;
  onEdit?: (education: StaffEducation) => void;
  onDelete?: (education: StaffEducation) => void;
}

export const QualificationViewModal: React.FC<QualificationViewModalProps> = ({
  isOpen,
  onClose,
  education,
}) => {
  if (!education) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Qualification Details"
      description="View complete qualification information"
      size="xl"
    >
      <div className="space-y-6">
        {/* Staff Information Section */}
        {education.staff && (
          <div className="p-4 sm:p-6 bg-linear-to-br from-ncos-green-50 to-slate-50 rounded-xl border border-ncos-green-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <User className="w-4 h-4" />
              Staff Information
            </h3>
            <div className="flex items-start gap-3 sm:gap-4">
              {education.staff.photo ? (
                <img
                  src={getFileUrl(education.staff.photo)}
                  alt={`${education.staff.surname} ${education.staff.first_name}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-white shadow-md shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback)
                      (fallback as HTMLElement).style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-ncos-green-600 text-white flex items-center justify-center font-bold text-base sm:text-lg border-3 border-white shadow-md shrink-0 ${education.staff.photo ? "hidden" : ""}`}
              >
                {education.staff.surname[0]}
                {education.staff.first_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1 wrap-break-word">
                  {education.staff.surname} {education.staff.first_name}{" "}
                  {education.staff.other_names || ""}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <IdCard className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="break-all">
                      {education.staff.service_no}
                    </span>
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-ncos-green-600 text-white text-xs font-medium">
                    {education.staff.present_rank}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Details Section */}
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <GraduationCap className="w-4 h-4" />
            Education Details
          </h3>

          <div className="space-y-4">
            {/* Institution */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Institution
              </label>
              <p className="mt-1 text-base font-medium text-slate-900">
                {education.institution}
              </p>
            </div>

            {/* Course */}
            {education.course && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Course/Degree
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {education.course}
                </p>
              </div>
            )}

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Type
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getEducationTypeColor()}`}
                >
                  {education.type}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5" />
                  Start Date
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {new Date(education.start_date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5" />
                  End Date
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {education.end_date
                    ? new Date(education.end_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Present"}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Duration
                </label>
                <p className="text-base font-bold text-ncos-green-600">
                  {formatDateRange(education.start_date, education.end_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        {education.url && (
          <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <FileText className="w-4 h-4" />
              Certificate/Document
            </h3>
            <a
              href={getCertificateViewUrl(education.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-ncos-green-500 transition-colors group w-full"
            >
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-ncos-green-600 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  View Certificate
                </p>
                <p className="text-xs text-slate-500">Opens in new tab</p>
              </div>
              <Eye className="w-4 h-4 text-slate-400 group-hover:text-ncos-green-600 shrink-0" />
            </a>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <span>
            Added on{" "}
            {new Date(education.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {education.updated_at !== education.created_at && (
            <span>
              Updated on{" "}
              {new Date(education.updated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
