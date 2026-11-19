import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { getFileUrl } from "@/lib/api";

interface FilePreviewLinkProps {
  value: string;
  label?: string;
  className?: string;
  missingLabel?: string;
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function resolveFileUrl(value: string): string {
  return isAbsoluteUrl(value) ? value : getFileUrl(value);
}

function isSameOrigin(value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const targetOrigin = new URL(value, window.location.origin).origin;
    return targetOrigin === window.location.origin;
  } catch {
    return false;
  }
}

export function FilePreviewLink({
  value,
  label = "View File",
  className = "",
  missingLabel = "File not available",
}: FilePreviewLinkProps) {
  const fileUrl = useMemo(() => resolveFileUrl(value), [value]);
  const shouldCheckAvailability = useMemo(
    () => isSameOrigin(fileUrl),
    [fileUrl],
  );
  const { data: isAvailable } = useQuery({
    queryKey: ["file-preview", fileUrl],
    queryFn: async () => {
      try {
        const response = await fetch(fileUrl, { method: "HEAD" });
        if (response.status === 404 || response.status === 410) {
          return false;
        }
        return true;
      } catch {
        return true;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: shouldCheckAvailability,
  });

  if (isAvailable === false) {
    return <span className="text-xs text-slate-500">{missingLabel}</span>;
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center h-7 px-2 text-xs font-medium border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-all ${className}`}
    >
      <ExternalLink className="w-3 h-3 mr-1" />
      {label}
    </a>
  );
}
