import React from "react";
import {
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Edit,
  IdCard,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/api/apiClient";
import { Staff } from "@/lib/api/staff";

interface StaffViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEdit?: (staff: Staff) => void;
  onViewIDCard?: (staff: Staff) => void;
}

// Info item component
const InfoItem: React.FC<{
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
}> = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 shrink-0">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-medium truncate text-slate-900">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

// Section component
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="space-y-4">
      <h3 className="pb-2 text-sm font-semibold tracking-wide uppercase border-b text-slate-700 border-slate-200">
        {title}
      </h3>
      {children}
    </div>
  );
};

export const StaffViewModal: React.FC<StaffViewModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEdit,
  onViewIDCard,
}) => {
  if (!staff) return null;

  const fullName =
    `${staff.surname} ${staff.first_name} ${staff.other_names || ""}`.trim();
  const photoUrl = getFileUrl(staff.photo);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Details" size="2xl">
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {/* Header with photo and basic info */}
        <div className="flex items-start gap-6 p-4 rounded-xl bg-slate-50">
          {/* Photo */}
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="object-cover w-24 h-24 border-4 border-white shadow-lg rounded-xl"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-white border-4 border-white shadow-lg rounded-xl bg-linear-to-br from-ncos-green-500 to-ncos-green-700">
                {staff.first_name?.[0]}
                {staff.surname?.[0]}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-600">
              {staff.present_rank || "No Rank"}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500">
              Service No: {staff.service_no}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  staff.status === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {staff.status === 1 ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {staff.status === 1 ? "Active" : "Inactive"}
              </span>
              {staff.is_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Official Information */}
        <Section title="Official Information">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem
              label="Department"
              value={staff.department}
              icon={Briefcase}
            />
            <InfoItem label="Duty" value={staff.duty} icon={FileText} />
            <InfoItem
              label="File Number"
              value={staff.file_no}
              icon={FileText}
            />
            <InfoItem
              label="IPPIS Number"
              value={staff.ippis}
              icon={FileText}
            />
            <InfoItem label="Present Rank" value={staff.present_rank} />
            <InfoItem label="Initial Rank" value={staff.initial_rank} />
            <InfoItem
              label="Grade Level"
              value={staff.level ? `Level ${staff.level}` : undefined}
            />
            <InfoItem label="Step" value={staff.step} />
          </div>
        </Section>

        {/* Personal Details */}
        <Section title="Personal Details">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem label="Gender" value={staff.sex} icon={User} />
            <InfoItem
              label="Date of Birth"
              value={
                staff.dob ? new Date(staff.dob).toLocaleDateString() : undefined
              }
              icon={Calendar}
            />
            <InfoItem label="Email" value={staff.email} icon={Mail} />
            <InfoItem label="Phone" value={staff.phone_number} icon={Phone} />
          </div>
        </Section>

        {/* Posting & Origin */}
        <Section title="Posting & Origin">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem
              label="State of Origin"
              value={staff.state_of_origin}
              icon={MapPin}
            />
            <InfoItem label="LGA" value={staff.lga} />
            <InfoItem label="Assigned State" value={staff.assigned_state} />
            <InfoItem label="Custodial Center" value={staff.prison} />
            <InfoItem label="Initial Command" value={staff.initial_command} />
            <InfoItem label="Present Command" value={staff.present_command} />
            <InfoItem
              label="Command Post Date"
              value={
                staff.command_post_date
                  ? new Date(staff.command_post_date).toLocaleDateString()
                  : undefined
              }
            />
          </div>
        </Section>

        {/* Appointment Dates */}
        <Section title="Appointment Information">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem
              label="Date of First Appointment"
              value={
                staff.date_of_first_appointment
                  ? new Date(
                      staff.date_of_first_appointment,
                    ).toLocaleDateString()
                  : undefined
              }
              icon={Calendar}
            />
            <InfoItem
              label="Present Appointment Date"
              value={
                staff.present_appointment_date
                  ? new Date(
                      staff.present_appointment_date,
                    ).toLocaleDateString()
                  : undefined
              }
            />
            {staff.retirement_date_formatted && (
              <InfoItem
                label="Retirement Date"
                value={staff.retirement_date_formatted}
              />
            )}
          </div>
        </Section>

        {/* Roles */}
        {staff.roles && staff.roles.length > 0 && (
          <Section title="Assigned Roles">
            <div className="flex flex-wrap gap-2">
              {staff.roles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  <Shield className="w-3 h-3" />
                  {role.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Timestamps */}
        {(staff.created_at || staff.updated_at) && (
          <div className="pt-4 text-xs border-t text-slate-400 border-slate-200">
            {staff.created_at && (
              <p>Created: {new Date(staff.created_at).toLocaleString()}</p>
            )}
            {staff.updated_at && (
              <p>Last Updated: {new Date(staff.updated_at).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {onViewIDCard && (
          <Button variant="outline" onClick={() => onViewIDCard(staff)}>
            <IdCard className="w-4 h-4 mr-2" />
            View ID Card
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={() => onEdit(staff)}
            className="bg-ncos-green-900 hover:bg-ncos-green-800"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Staff
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
