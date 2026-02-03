export interface SidebarContextType {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (value: boolean) => void;
}
