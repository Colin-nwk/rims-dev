import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import Qualifications from "./Qualifications";
import StaffQualifications from "./StaffQualifications";

/**
 * Qualifications Router Component
 * Renders the appropriate qualification based on user type
 * - Admin users see the Qualifications
 * - Staff users see the StaffQualifications
 */
export default function QualificationsRouter() {
  const { user } = useAuth();

  // If user is staff, show staff qualifications
  if (user && isStaffUser(user)) {
    return <StaffQualifications />;
  }

  // Otherwise show qualifications
  return <Qualifications />;
}
