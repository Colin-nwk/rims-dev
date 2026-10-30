export interface SidebarContextType {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  isMobileOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  toggleMobileSidebar: () => void;
}
