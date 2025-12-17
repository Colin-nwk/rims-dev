import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, ChevronUp, Check, AlertTriangle, Info, XCircle, Search, X, Loader2, Plus, Minus, Calendar as CalendarIcon, Clock, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// --- Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hooks ---
function useClickOutside(ref: React.RefObject<any>, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-solid' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-navy-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 shadow-md shadow-navy-900/10',
    secondary: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500 shadow-xs dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 dark:bg-transparent dark:border-navy-600 dark:text-slate-200 dark:hover:bg-navy-800',
    'outline-solid': 'border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300 dark:bg-transparent dark:border-navy-500 dark:text-slate-200 dark:hover:bg-navy-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-xs'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

// --- Card ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, noPadding = false, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-navy-800 shadow-xs hover:shadow-md transition-shadow duration-300",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className, label, error, id, icon, ...props }) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={generatedId}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Number Input ---
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, error, value, onChange, min, max, step = 1, className, ...props }) => {
  const generatedId = props.id || Math.random().toString(36).substr(2, 9);

  const handleDecrement = () => {
    if (min !== undefined && value - step < min) return;
    onChange(value - step);
  };

  const handleIncrement = () => {
    if (max !== undefined && value + step > max) return;
    onChange(value + step);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 border-slate-300 dark:border-navy-600 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700 focus:outline-hidden focus:ring-1 focus:ring-navy-900 transition-colors"
          disabled={min !== undefined && value <= min}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={generatedId}
          type="number"
          className={cn(
            "flex h-10 w-full border-y border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-center text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-300 dark:focus:border-navy-600 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          {...props}
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-r-md border border-l-0 border-slate-300 dark:border-navy-600 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700 focus:outline-hidden focus:ring-1 focus:ring-navy-900 transition-colors"
          disabled={max !== undefined && value >= max}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Currency Input ---
interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  value: string | number;
  onChange: (value: string) => void;
  currencySymbol?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, error, value, onChange, currencySymbol = "$", className, ...props }) => {
  const generatedId = props.id || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-slate-500 dark:text-slate-400 font-medium">{currencySymbol}</span>
        </div>
        <input
          id={generatedId}
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-slate-400 text-xs">USD</span>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Date Picker (Native) ---
export const DatePicker: React.FC<InputProps> = ({ className, icon, ...props }) => {
  return (
    <Input
      type="date"
      className={cn("dark:[&::-webkit-calendar-picker-indicator]:invert", className)}
      icon={icon || <CalendarIcon className="w-4 h-4" />}
      {...props}
    />
  )
}

// --- Time Picker (Native) ---
export const TimePicker: React.FC<InputProps> = ({ className, icon, ...props }) => {
  return (
    <Input
      type="time"
      className={cn("dark:[&::-webkit-calendar-picker-indicator]:invert", className)}
      icon={icon || <Clock className="w-4 h-4" />}
      {...props}
    />
  )
}

// --- Slider ---
interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min = 0, max = 100, className, ...props }) => {
  return (
    <div className="w-full space-y-3">
      {label && (
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
          <span className="text-sm text-slate-500 dark:text-slate-400">{value}%</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={cn(
          "w-full h-2 bg-slate-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-navy-900 dark:accent-gold-500",
          className
        )}
        {...props}
      />
    </div>
  )
}

// --- Select (Native) ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ className, label, error, id, children, ...props }) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={generatedId}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500 dark:text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Rich Text Editor (Custom) ---
interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange, className, error, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only update innerHTML if it differs significantly or if the editor is empty and value is present
    // This check prevents cursor jumping issues during typing if we were to update on every render
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, active }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); exec(command, arg); }}
      className={cn(
        "p-1.5 rounded-sm hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-colors",
        active && "bg-slate-200 dark:bg-navy-700 text-navy-900 dark:text-white"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className={cn(
        "border border-slate-300 dark:border-navy-600 rounded-md overflow-hidden bg-white dark:bg-navy-950 focus-within:ring-2 focus-within:ring-navy-900 dark:focus-within:ring-gold-500 transition-all",
        error && "border-red-500 focus-within:ring-red-500"
      )}>
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900">
          <ToolbarButton icon={Bold} command="bold" />
          <ToolbarButton icon={Italic} command="italic" />
          <ToolbarButton icon={Underline} command="underline" />
          <div className="w-px h-4 bg-slate-300 dark:bg-navy-600 mx-1" />
          <ToolbarButton icon={List} command="insertUnorderedList" />
          <ToolbarButton icon={ListOrdered} command="insertOrderedList" />
          <div className="w-px h-4 bg-slate-300 dark:bg-navy-600 mx-1" />
          <ToolbarButton icon={AlignLeft} command="justifyLeft" />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" />
          <ToolbarButton icon={AlignRight} command="justifyRight" />
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[200px] p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden prose prose-sm dark:prose-invert max-w-none"
          data-placeholder={placeholder}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Tabs Components ---
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}
const TabsContext = createContext<TabsContextType>({ activeTab: '', setActiveTab: () => { } });

export interface TabsProps {
  defaultValue: string;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children?: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-navy-800 p-1 text-slate-500 dark:text-slate-400", className)}>
    {children}
  </div>
);

export interface TabsTriggerProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
        activeTab === value
          ? "bg-white text-navy-900 shadow-xs dark:bg-navy-950 dark:text-gold-500"
          : "hover:text-navy-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-navy-700/50",
        className
      )}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return (
    <div className={cn("mt-4 ring-offset-white focus-visible:outline-hidden animate-in fade-in zoom-in-95 duration-200", className)}>
      {children}
    </div>
  );
};

// --- Stepper (Wizard) ---
export interface Step {
  id: number | string;
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full items-center justify-between relative">
        {/* Connection Line Background */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 dark:bg-navy-700 -z-10 transform -translate-y-1/2" />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-col items-center relative group">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                isCompleted
                  ? "border-navy-900 bg-navy-900 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-navy-900"
                  : isActive
                    ? "border-navy-900 bg-white text-navy-900 dark:border-gold-500 dark:bg-navy-900 dark:text-gold-500 shadow-md shadow-navy-900/20"
                    : "border-slate-300 bg-white text-slate-400 dark:border-navy-600 dark:bg-navy-900 dark:text-slate-600"
              )}>
                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <div className={cn(
                "absolute top-10 flex flex-col w-32 transition-colors duration-200",
                isFirst ? "items-start left-0 text-left" :
                  isLast ? "items-end right-0 text-right" :
                    "items-center left-1/2 -translate-x-1/2 text-center"
              )}>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-navy-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                )}>
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {step.subtitle}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Advanced Select Types ---
interface Option { value: string; label: string; }

// --- Searchable Select ---
interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = "Select...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-navy-900 transition-colors"
        >
          <span className={!selectedLabel ? "text-slate-400" : ""}>{selectedLabel || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center border-b border-slate-200 dark:border-navy-700 px-3 py-2">
              <Search className="mr-2 h-4 w-4 opacity-50" />
              <input
                className="flex h-full w-full rounded-md bg-transparent text-sm outline-hidden placeholder:text-slate-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">No options found.</div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors",
                      value === opt.value && "bg-slate-100 dark:bg-navy-800 font-medium"
                    )}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Multi Select ---
interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder = "Select items...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== val));
  };

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer transition-colors"
        >
          <div className="flex flex-wrap gap-1.5">
            {value.length === 0 && <span className="text-slate-400">{placeholder}</span>}
            {value.map(val => {
              const label = options.find(o => o.value === val)?.label;
              return (
                <span key={val} className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-navy-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700">
                  {label}
                  <X className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500" onClick={(e) => removeValue(e, val)} />
                </span>
              );
            })}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </div>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-xl p-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="relative flex cursor-pointer select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300 dark:border-navy-600", value.includes(opt.value) ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 border-transparent" : "opacity-50")}>
                  {value.includes(opt.value) && <Check className="h-3 w-3" />}
                </div>
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Paginated Select ---
interface PaginatedSelectProps {
  loadOptions: (page: number) => Promise<{ options: Option[], hasMore: boolean }>;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export const PaginatedSelect: React.FC<PaginatedSelectProps> = ({ loadOptions, value, onChange, placeholder = "Select...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const loadMore = async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);
    const nextPage = reset ? 1 : page;
    try {
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await loadOptions(nextPage);
      setOptions(prev => reset ? res.options : [...prev, ...res.options]);
      setHasMore(res.hasMore);
      setPage(nextPage + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && options.length === 0) {
      loadMore(true);
    }
  }, [isOpen]);

  const selectedLabel = options.find(opt => opt.value === value)?.label || (value ? `Selected ID: ${value}` : '');

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer transition-colors"
        >
          <span className={!selectedLabel ? "text-slate-400" : ""}>{selectedLabel || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-xl p-1 max-h-60 overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden hover:bg-slate-100 dark:hover:bg-navy-800 shrink-0 transition-colors",
                  value === opt.value && "bg-slate-100 dark:bg-navy-800"
                )}
              >
                <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                {opt.label}
              </div>
            ))}
            {hasMore && (
              <div className="p-2 text-center border-t border-slate-100 dark:border-navy-800 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); loadMore(); }}
                  disabled={isLoading}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-gold-500 dark:hover:text-gold-400 hover:underline disabled:opacity-50 flex items-center justify-center w-full"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {isLoading ? 'Loading...' : 'Load more items'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className, label, error, id, ...props }) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={generatedId}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'outline-solid';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-navy-700 dark:text-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    error: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    outline: 'bg-transparent border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
    'outline-solid': 'bg-transparent border-2 border-slate-300 text-slate-700 dark:border-slate-500 dark:text-slate-300'
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </span>
  );
};

// --- Switch ---
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, label, className }) => (
  <label className={cn("flex items-center cursor-pointer gap-3 disabled:opacity-50 select-none group", className)}>
    <div className="relative inline-block w-11 h-6 transition-colors duration-200 ease-in-out rounded-full border border-transparent bg-slate-200 dark:bg-navy-700 group-hover:bg-slate-300 dark:group-hover:bg-navy-600 has-checked:bg-navy-900 dark:has-checked:bg-gold-500">
      <input
        type="checkbox"
        className="absolute opacity-0 w-0 h-0 peer"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={cn(
        "absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-xs transition-transform duration-200",
        checked ? "translate-x-5 dark:bg-navy-900" : "translate-x-0"
      )}></span>
    </div>
    {label && <span className={cn("text-sm font-medium", disabled ? "text-slate-400" : "text-slate-700 dark:text-slate-300")}>{label}</span>}
  </label>
);

// --- Checkbox ---
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, id, ...props }, ref) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={generatedId}
        className={cn(
          "w-4 h-4 rounded-sm border-slate-300 dark:border-navy-600 text-navy-900 focus:ring-navy-900 dark:focus:ring-gold-500 focus:ring-offset-0 bg-white dark:bg-navy-900 cursor-pointer disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
});

// --- Alert ---
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children, className }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  };

  const icons = {
    info: Info,
    success: Check,
    warning: AlertTriangle,
    error: XCircle
  };

  const Icon = icons[variant];

  return (
    <div className={cn("p-4 rounded-lg border flex gap-3 text-sm", styles[variant], className)}>
      <Icon className="w-5 h-5 shrink-0" />
      <div>
        {title && <h5 className="font-bold mb-1">{title}</h5>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

// --- Accordion ---
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export const Accordion: React.FC<{ items: AccordionItem[], className?: string }> = ({ items, className }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, idx) => (
        <div key={idx} className="border border-slate-200 dark:border-navy-700 rounded-lg overflow-hidden bg-white dark:bg-navy-900">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            {item.title}
            {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800 mt-2">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Dropdown Menu (Simple) ---
interface DropdownProps {
  trigger: React.ReactNode;
  items: { label: string; onClick?: () => void; danger?: boolean }[];
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={cn(
          "absolute mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-navy-800 ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-200 origin-top-right",
          align === 'right' ? "right-0" : "left-0"
        )}>
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full text-left px-4 py-2 text-sm transition-colors",
                  item.danger
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={cn("bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-navy-700 flex flex-col max-h-[90vh]", className)}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-800">
          <h3 className="font-medium text-xl text-navy-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors p-1 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
          </button>
        </div>
        <div className="p-6 dark:text-slate-200 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-navy-700 bg-slate-50/30 dark:bg-navy-900/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};