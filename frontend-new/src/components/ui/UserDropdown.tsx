import { useState, useRef, useEffect } from "react";
import { Dropdown } from "./Dropdown";
import { DropdownItem } from "./DropdownItem";
import { Settings, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import type { User } from "@/lib/api/auth/types";
import { isStaffUser, getDisplayName } from "@/lib/api/auth/types";
import { toast } from "react-toastify";

const getUserAccountType = (user: User): string => {
  if (isStaffUser(user)) {
    return user.department
      ? `${user.department} (${user.service_no})`
      : "No Department";
  }
  return `Administrator (${user.email})`;
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully");
      window.location.href = "/staff-login";
    } catch {
      toast.error("Failed to logout. Please try again.");
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 transition rounded-full hover:bg-gray-100"
      >
        <div className="flex items-center justify-center bg-gray-200 rounded-full w-9 h-9">
          <UserCircle2 className="w-6 h-6 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-800">
          {user ? getDisplayName(user) : "User"}
        </span>
      </button>

      {/* Dropdown - using noop onClose since we handle it ourselves */}
      <Dropdown
        isOpen={isOpen}
        onClose={() => {}}
        className="absolute right-0 mt-3 overflow-hidden bg-white border border-gray-100 shadow-lg w-72 rounded-xl"
      >
        {/* User card */}
        <div className="px-4 py-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900">
            {user ? getDisplayName(user) : "User"}
          </p>
          <p className="text-xs text-gray-600">
            {user ? getUserAccountType(user) : "Account"}
          </p>
        </div>

        {/* Actions */}
        <ul className="py-2">
          <li>
            <DropdownItem
              tag="a"
              href="/profile"
              onItemClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              Profile
            </DropdownItem>
          </li>
        </ul>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
