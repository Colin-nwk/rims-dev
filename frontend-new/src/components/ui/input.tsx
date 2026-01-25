import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Enhanced Input component with label, error states, and icon support
 * Improved from legacy implementation with better accessibility and form integration
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, icon, type = "text", ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              error ? "text-red-600" : "text-slate-700"
            )}
          >
            {label}
            {error && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              icon && "pl-10",
              error
                ? "border-red-500 focus:ring-red-500 bg-red-50 pr-10"
                : "border-slate-300 focus:ring-ncos-green-500",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
        {error && typeof error === 'string' && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1 text-xs font-medium text-red-600"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
