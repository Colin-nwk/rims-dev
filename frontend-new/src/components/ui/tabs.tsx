import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value?: string;
  onValueChange: (value: string) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Tabs`);
  }
  return context;
}

function toSafeId(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9-_]/g, "-");
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, children, value, defaultValue, onValueChange, ...props },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const idBase = React.useId();

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          idBase,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600",
        className,
      )}
      {...props}
    />
  ),
);

TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, disabled, onClick, ...props }, ref) => {
  const {
    value: activeValue,
    onValueChange,
    idBase,
  } = useTabsContext("TabsTrigger");
  const safeValue = toSafeId(value);
  const isActive = activeValue === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${idBase}-trigger-${safeValue}`}
      aria-controls={`${idBase}-content-${safeValue}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ncos-green-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm",
        className,
      )}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onValueChange(value);
      }}
      {...props}
    />
  );
});

TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, ...props }, ref) => {
    const { value: activeValue, idBase } = useTabsContext("TabsContent");
    const safeValue = toSafeId(value);
    const isActive = activeValue === value;

    if (!forceMount && !isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${idBase}-content-${safeValue}`}
        aria-labelledby={`${idBase}-trigger-${safeValue}`}
        data-state={isActive ? "active" : "inactive"}
        hidden={!isActive}
        className={cn(
          "w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ncos-green-500",
          className,
        )}
        {...props}
      />
    );
  },
);

TabsContent.displayName = "TabsContent";
