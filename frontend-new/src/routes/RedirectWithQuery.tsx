import { Navigate } from "react-router-dom";

interface RedirectWithQueryProps {
  to: string;
}

/**
 * Redirect component that preserves query parameters
 * Used for redirecting common URL mistakes while keeping query strings intact
 */
export const RedirectWithQuery = ({ to }: RedirectWithQueryProps) => {
  const search = window.location.search;
  return <Navigate to={`${to}${search}`} replace />;
};
