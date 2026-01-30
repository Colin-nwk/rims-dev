import UserDropdown from "@/components/ui/UserDropdown";
import { useSidebar } from "@/hooks/useSidebar";
import { Search, SquareChevronLeft, SquareChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

const AppHeader = () => {
  const { toggleSidebar, toggleMobileSidebar, isExpanded } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex w-full bg-white border-gray-200 lg:sticky lg:left-auto lg:right-auto lg:border-b-2">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <a href="/" className="lg:hidden">
            <img
              width={40}
              height={40}
              src="/logo.png"
              alt="Logo"
              className="object-contain"
            />
          </a>

          <span className="text-base font-semibold text-gray-900 lg:hidden sm:hidden">
            NCoS RIMS
          </span>

          <span className="hidden text-base font-semibold text-gray-900 sm:block lg:hidden">
            Nigerian Correctional Service RIMS
          </span>

          <button
            className="flex items-center justify-center w-10 h-10 text-ncos-green-700 transition-all border-2 border-ncos-green-700 rounded-lg z-99999 hover:bg-ncos-green-50"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            title={isExpanded ? "Minimize Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <SquareChevronLeft className="w-5 h-5" />
            ) : (
              <SquareChevronRight className="w-5 h-5" />
            )}
          </button>

          <div className="hidden">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                  <Search className="w-5 h-5 text-gray-500" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 xl:w-107.5"
                />

                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.75 py-[4.5px] text-xs -tracking-[0.2px] text-gray-500">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="items-center justify-end hidden w-full gap-4 px-5 py-4 lg:flex lg:px-0">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
