import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

const navItems: { label: string; path: string; external?: boolean }[] = [
  { label: "Login", path: "/staff-login" },
  { label: "Confirm Service Number/IPPIS", path: "/register" },
  { label: "Make a Request", path: "/complaint" },
  // {
  //   label: "Telegram Help",
  //   path: "https://t.me/your_telegram_support",
  //   external: true,
  // },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    // For login, match both /staff-login and /admin-login
    if (path === "/staff-login") {
      return (
        location.pathname === "/staff-login" ||
        location.pathname === "/admin-login"
      );
    }
    return location.pathname === path;
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-ncos-green-950">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-48 h-48 rounded-full -top-12 -right-12 sm:-top-24 sm:-right-24 sm:w-96 sm:h-96 bg-gold-500 blur-3xl" />
        <div className="absolute rounded-full top-1/2 -left-12 sm:-left-24 w-36 h-36 sm:w-72 sm:h-72 bg-ncos-green-600 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-4 py-4 sm:px-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/staff-login" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Nigerian Correctional Service"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="text-white font-bold text-lg sm:text-xl tracking-wide">
              NCoS RIMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden sm:flex flex-wrap items-center gap-4 sm:gap-8 text-sm">
            {navItems.map((item) =>
              item?.external ? (
                <li key={item.label}>
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`transition-colors ${
                      isActive(item.path)
                        ? "text-white font-bold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 bg-ncos-green-900/90 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <ul className="flex flex-col">
              {navItems.map((item, index) => (
                <li
                  key={item.label}
                  className={index !== navItems.length - 1 ? "border-b border-white/10" : ""}
                >
                  {item?.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleNavClick}
                      className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`block px-4 py-3 transition-colors ${
                        isActive(item.path)
                          ? "text-white font-bold bg-white/10"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

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
