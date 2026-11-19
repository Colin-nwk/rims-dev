import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import StaffPersonnelDocuments from "./StaffPersonnelDocuments";
import PersonnelDocuments from "./PersonnelDocuments";

/**
 * Personnel Documents Router Component
 * Renders the appropriate Personnel Documents page based on user type
 * - Admin users see the PersonnelDocuments
 * - Staff users see the StaffPersonnelDocuments
 */
export default function PersonnelDocumentsRouter() {
  const { user } = useAuth();

  // If user is staff, show staff personnel documents
  if (user && isStaffUser(user)) {
    return <StaffPersonnelDocuments />;
  }

  // Otherwise show personnel documents
  return <PersonnelDocuments />;
}
