// import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
// import { Menu, X } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

// const navItems: { label: string; path: string; external?: boolean }[] = [
//   { label: "Login", path: "/staff-login" },
//   { label: "Confirm Service Number/IPPIS", path: "/confirm-service-number" },
//   { label: "Make a Request", path: "/complaint" },
//   // {
//   //   label: "Telegram Help",
//   //   path: "https://t.me/your_telegram_support",
//   //   external: true,
//   // },
// ];

export default function AuthLayout({ children }: AuthLayoutProps) {
  // const location = useLocation();
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // const isActive = (path: string) => {
  //   // For login, match both /staff-login and /admin-login
  //   if (path === "/staff-login") {
  //     return (
  //       location.pathname === "/staff-login" ||
  //       location.pathname === "/admin-login"
  //     );
  //   }
  //   return location.pathname === path;
  // };

  // const handleNavClick = () => {
  //   setMobileMenuOpen(false);
  // };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-ncos-green-950">


      {/* Main Content Area */}
      <div className="relative z-10 flex items-center justify-center flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </div>

      {/* Footer Attribution */}
      <div className="relative z-10 px-4 py-3 text-center sm:py-4">
        <p className="text-[10px] sm:text-xs text-white/60">
          © {new Date().getFullYear()} Nigerian Correctional Service
        </p>
      </div>
    </div>
  );
}
