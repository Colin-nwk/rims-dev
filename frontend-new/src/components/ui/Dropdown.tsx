import { useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

/**
 * Dropdown container component
 * Handles open/close state and click outside detection
 */
export function Dropdown({
  isOpen,
  onClose,
  children,
  align = "right",
  className,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute mt-2 bg-white rounded-xl shadow-xl shadow-gray-900/10 border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Dropdown header section
 */
export function DropdownHeader({ children, className }: DropdownHeaderProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-slate-100 bg-slate-50/50",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Dropdown content area
 */
export function DropdownContent({ children, className }: DropdownContentProps) {
  return <div className={cn("p-2 space-y-1", className)}>{children}</div>;
}

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  className?: string;
}

/**
 * Individual dropdown menu item
 */
export function DropdownItem({
  icon,
  children,
  onClick,
  variant = "default",
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
        variant === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownDividerProps {
  className?: string;
}

/**
 * Dropdown divider line
 */
export function DropdownDivider({ className }: DropdownDividerProps) {
  return <div className={cn("h-px bg-slate-100 my-1 mx-2", className)} />;
}
