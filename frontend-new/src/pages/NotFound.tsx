import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-ncos-green-950">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-48 h-48 rounded-full -top-12 -right-12 sm:-top-24 sm:-right-24 sm:w-96 sm:h-96 bg-gold-500 blur-3xl animate-pulse" />
        <div className="absolute rounded-full top-1/2 -left-12 sm:-left-24 w-36 h-36 sm:w-72 sm:h-72 bg-ncos-green-600 blur-3xl animate-pulse" />
        <div className="absolute w-40 h-40 rounded-full bottom-10 right-1/3 sm:w-64 sm:h-64 bg-gold-400 blur-3xl animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Transparent Blurred Container */}
        <div className="relative z-10 w-full max-w-2xl p-6 mx-auto text-center sm:p-10 lg:p-12">
          {/* Blurred Background Effect */}
          <div className="absolute inset-0 border shadow-2xl backdrop-blur-2xl bg-white/5 rounded-2xl sm:rounded-3xl border-white/10"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center justify-center p-2 mx-auto mb-6 bg-white border-2 shadow-lg w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 sm:mb-8 rounded-xl border-gold-500">
              <img
                src="/logo.png"
                alt="Nigerian Correctional Service Logo"
                className="object-contain w-full h-full"
              />
            </div>

            {/* 404 Number */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-transparent bg-clip-text bg-linear-to-r from-white via-gold-400 to-white mb-3 sm:mb-4 drop-shadow-2xl">
                404
              </h1>
              <div className="h-1 sm:h-1.5 w-24 sm:w-32 mx-auto bg-linear-to-r from-transparent via-gold-400 to-transparent rounded-full shadow-lg shadow-gold-500/50"></div>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
              <h2 className="px-4 text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-lg">
                Page Not Found
              </h2>
              <p className="max-w-lg px-4 mx-auto text-sm leading-relaxed sm:text-base lg:text-lg text-slate-200 drop-shadow-md">
                Oops! The page you're looking for doesn't exist. It might have
                been moved or deleted.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 mb-6 sm:flex-row sm:gap-4 sm:mb-8">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full gap-2 text-sm text-white transition-all shadow-lg sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:shadow-xl sm:text-base"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full gap-2 text-sm font-semibold transition-all shadow-lg sm:w-auto bg-white hover:bg-white/90 text-ncos-green-950 hover:text-ncos-green-900 shadow-white/20 hover:shadow-white/30 sm:text-base"
                size="lg"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-6 border-t sm:pt-8 border-white/10">
              <p className="px-4 text-xs sm:text-sm lg:text-base text-slate-300 drop-shadow">
                Need help?{" "}
                <button
                  onClick={() => (window.location.href = "/complaint")}
                  className="font-semibold underline transition-colors text-gold-400 hover:text-gold-300 decoration-gold-400/50 hover:decoration-gold-300 underline-offset-2 sm:underline-offset-4"
                >
                  Contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attribution - Fixed at bottom */}
      <footer className="relative z-10 py-4 text-center sm:py-6">
        <p className="text-[11px] sm:text-xs lg:text-sm text-white/70 drop-shadow px-4">
          © {new Date().getFullYear()} Nigerian Correctional Service
        </p>
      </footer>
    </div>
  );
}
