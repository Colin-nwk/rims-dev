import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

/**
 * Enhanced Input component with label, error states, and icon support
 * Improved from legacy implementation with better accessibility and form integration
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      id,
      icon,
      type = "text",
      showPasswordToggle = false,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = React.useState(false);

    // Determine if we should show the password toggle
    const isPasswordField = type === "password" || showPasswordToggle;
    const inputType = isPasswordField && showPassword ? "text" : type;

    // Calculate padding based on icons present
    const hasPasswordToggle = isPasswordField;
    const hasError = !!error;

    // Determine right padding class
    let rightPaddingClass = "";
    if (hasPasswordToggle && hasError) {
      rightPaddingClass = "pr-20"; // Space for both icons
    } else if (hasPasswordToggle || hasError) {
      rightPaddingClass = "pr-10"; // Space for one icon
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              error ? "text-red-600" : "text-slate-700",
            )}
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              icon && "pl-10",
              error
                ? "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-slate-300 focus:ring-ncos-green-500",
              rightPaddingClass,
              className,
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
          {hasPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute inset-y-0 flex items-center text-slate-400 hover:text-slate-600 transition-colors",
                hasError ? "right-10" : "right-3",
              )}
              disabled={props.disabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
        {error && typeof error === "string" && (
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
  },
);

Input.displayName = "Input";
