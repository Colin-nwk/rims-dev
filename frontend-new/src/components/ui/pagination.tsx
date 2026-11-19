import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  isLoading?: boolean;
  ariaLabel?: string;
}

const LoadingSpinner = () => (
  <svg
    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-current animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Enhanced Pagination component with First/Last page navigation
 * Features: Accessible, keyboard-friendly, responsive design with smooth transitions
 * Consistent with Button component patterns using forwardRef and cn() utility
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      className,
      showPageInfo = true,
      showFirstLast = true,
      maxVisiblePages = 5,
      isLoading = false,
      ariaLabel = "Pagination navigation",
    },
    ref,
  ) => {
    const getPageNumbers = (): (number | string)[] => {
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | string)[] = [];
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2),
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
      }

      return pages;
    };

    const baseButtonStyles =
      "inline-flex items-center justify-center min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ncos-green-500 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]";

    const pageButtonStyles = {
      default:
        "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-ncos-green-400 hover:text-ncos-green-700",
      active:
        "bg-ncos-green-900 text-white border border-ncos-green-900 shadow-md shadow-ncos-green-900/20 hover:bg-ncos-green-800",
    };

    const navButtonStyles =
      "bg-white border border-slate-300 text-slate-700 hover:bg-ncos-green-50 hover:border-ncos-green-500 hover:text-ncos-green-700";

    const pageNumbers = getPageNumbers();

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white rounded-lg shadow-sm border border-slate-200",
          className,
        )}
        role="navigation"
        aria-label={ariaLabel}
      >
        {showPageInfo && (
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-xs sm:text-sm text-slate-700 whitespace-nowrap">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-1 flex-wrap justify-center order-1 sm:order-2">
          {/* First Page Button */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className={cn(baseButtonStyles, navButtonStyles)}
              aria-label="Go to first page"
              title="First page"
            >
              {isLoading && currentPage !== 1 ? (
                <LoadingSpinner />
              ) : (
                <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}

          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className={cn(baseButtonStyles, navButtonStyles)}
            aria-label="Go to previous page"
            title="Previous page"
          >
            {isLoading && currentPage > 1 ? (
              <LoadingSpinner />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Page Number Buttons */}
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="hidden xs:inline px-1 sm:px-2 text-slate-400 text-xs sm:text-sm"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={cn(
                  baseButtonStyles,
                  isActive ? pageButtonStyles.active : pageButtonStyles.default,
                )}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
                title={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className={cn(baseButtonStyles, navButtonStyles)}
            aria-label="Go to next page"
            title="Next page"
          >
            {isLoading && currentPage < totalPages ? (
              <LoadingSpinner />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Last Page Button */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={cn(baseButtonStyles, navButtonStyles)}
              aria-label="Go to last page"
              title="Last page"
            >
              {isLoading && currentPage !== totalPages ? (
                <LoadingSpinner />
              ) : (
                <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";
