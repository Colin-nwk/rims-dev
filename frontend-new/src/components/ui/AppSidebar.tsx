import { useAuth } from "@/hooks/useAuthContext";
import type { User } from "@/lib/api/auth/types";
import { isStaffUser, getDisplayName } from "@/lib/api/auth/types";
import { NavItem } from "@/types";
import { ChevronDown, LogOut, MoreHorizontal, UserCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSidebar } from "@/hooks/useSidebar";

// Helper to get user identifier (service_no for staff, email for admin)
const getUserIdentifier = (user: User): string => {
  if (isStaffUser(user)) {
    return user.service_no || "N/A";
  }
  return user.email || "N/A";
};

// Helper to get user identifier label
const getUserIdentifierLabel = (user: User): string => {
  if (isStaffUser(user)) {
    return "Service No";
  }
  return "Email";
};

// Helper to get user account type/agency
const getUserAccountType = (user: User): string => {
  if (isStaffUser(user)) {
    return user.department || "N/A";
  }
  return "Administrator";
};

const AppSidebar: React.FC<{
  navItems: NavItem[];
  othersItems: NavItem[];
  logoText?: string;
  logoHref?: string;
}> = ({
  navItems,
  othersItems,
  logoText = "NCoS RIMS",
  logoHref = "/dashboard",
}) => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();

  // Close mobile sidebar when navigating to a different page
  useEffect(() => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others",
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        // Skip mobile-only items on desktop
        if (nav.mobileOnly && !isMobileOpen) return null;

        return (
          <li key={nav.name} className={nav.mobileOnly ? "lg:hidden" : ""}>
            {nav.isButton ? (
              <button
                onClick={nav.onClick}
                className={`menu-item group ${
                  nav.className || "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span className="menu-item-icon-inactive">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </button>
            ) : nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180"
                        : ""
                    }`}
                    style={
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? { color: "var(--color-primary)" }
                        : undefined
                    }
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <>
                      <span className={`menu-item-text`}>{nav.name}</span>
                      {nav.badge !== undefined && nav.badge !== 0 && (
                        <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {typeof nav.badge === "number" && nav.badge > 99
                            ? "99+"
                            : nav.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Compute initial open submenu based on current pathname
  const initialOpenSubmenu = useMemo(() => {
    let result: { type: "main" | "others"; index: number } | null = null;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path === pathname) {
              result = {
                type: menuType as "main" | "others",
                index,
              };
            }
          });
        }
      });
    });

    return result;
  }, [pathname, navItems, othersItems]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(initialOpenSubmenu);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Update openSubmenu when pathname changes (using effect to avoid cascading renders)
  useEffect(() => {
    setOpenSubmenu(initialOpenSubmenu);
  }, [initialOpenSubmenu]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 py-2 bg-ncos-green-900 text-white h-screen transition-all duration-300 ease-in-out z-50 border-ncos-green-800
        ${isExpanded || isMobileOpen ? "w-64" : isHovered ? "w-64" : "w-22.5"}
        ${
          isMobileOpen
            ? "right-0 translate-x-0 lg:left-0 lg:right-auto"
            : "right-0 translate-x-full lg:left-0 lg:right-auto lg:translate-x-0"
        }
        lg:translate-x-0 lg:border-r`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 hidden lg:flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link
          to={logoHref}
          className="flex items-center gap-2 font-semibold text-gold-400"
        >
          <img
            src="/logo.png"
            alt="Logo"
            width={isExpanded ? 50 : 30}
            height={isExpanded ? 40 : 20}
          />
          {isExpanded || isHovered || isMobileOpen ? logoText : null}
        </Link>
      </div>

      {/* Mobile User Details */}
      {user && (
        <div className="block py-6 pb-4 mb-4 border-b border-ncos-green-700 lg:hidden">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full text-gold-400"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-gold-400) 10%, transparent)",
              }}
            >
              <UserCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {getDisplayName(user)}
              </p>
              <p className="text-xs text-ncos-green-200">
                {getUserIdentifierLabel(user)}: {getUserIdentifier(user)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full text-gold-400"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-gold-400) 10%, transparent)",
              }}
            >
              {getUserAccountType(user)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear lg:no-scrollbar">
        <nav className="flex-1">
          <div className="flex flex-col gap-4 pb-16">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-ncos-green-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-ncos-green-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

            {/* Mobile Sign Out Button - Inside scrollable area */}
            <div className="pt-2 mt-2 border-t border-ncos-green-700 lg:hidden">
              <button
                onClick={() => logout()}
                className="flex items-center w-full gap-3 px-4 py-3 font-semibold text-red-400 transition-colors rounded-lg hover:bg-red-900/40"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
