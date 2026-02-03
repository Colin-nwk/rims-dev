import { useState, useCallback, useEffect, type ReactNode } from "react";
import { SidebarContext } from "./context";

interface SidebarProviderProps {
  children: ReactNode;
}

// Tailwind lg breakpoint
const LG_BREAKPOINT = 1024;

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when resizing to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= LG_BREAKPOINT && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    // Also check on mount in case user refreshes on desktop with stale state
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen]);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(
    () => setIsExpanded((prev) => !prev),
    [],
  );
  const toggleCollapse = useCallback(
    () => setIsCollapsed((prev) => !prev),
    [],
  );
  const toggleMobileSidebar = useCallback(
    () => setIsMobileOpen((prev) => !prev),
    [],
  );

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        isCollapsed,
        isExpanded,
        isHovered,
        isMobileOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        toggleCollapse,
        toggleMobileSidebar,
        setIsHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
