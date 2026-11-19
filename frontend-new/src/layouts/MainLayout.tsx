import { useSidebar } from "@/hooks/useSidebar";
import { NavItem } from "@/types";
import { ReactNode } from "react";
import Backdrop from "./Backdrop";
import AppSidebar from "../components/ui/AppSidebar";
import AppHeader from "../components/ui/AppHeader";
import "./main-layout.css";

export default function MainLayout({
  children,
  navItems,
  othersItems,
  logoText = "NCoS RIMS",
  logoHref = "/dashboard",
}: {
  children: ReactNode;
  navItems: NavItem[];
  othersItems: NavItem[];
  logoText?: string;
  logoHref?: string;
}) {
  const { isExpanded, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded
      ? "lg:ml-[256px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen overflow-hidden xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar
        navItems={navItems}
        othersItems={othersItems}
        logoText={logoText}
        logoHref={logoHref}
      />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out pt-16 lg:pt-0 ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-6 h-full overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
