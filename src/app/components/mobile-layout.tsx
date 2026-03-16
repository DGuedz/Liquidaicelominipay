import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { BottomNavigation } from "./bottom-navigation";

export function MobileLayout() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Hide bottom nav on specific pages if needed
  // Note: Onboarding and Pitch have their own layouts/navigation
  const hideNav = ["/onboarding", "/chat", "/scan", "/minipay", "/"].includes(location.pathname);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-[var(--background)] md:bg-neutral-900/50 flex justify-center items-center md:py-10">
      <div 
        className="w-full max-w-[430px] bg-[var(--background)] min-h-dvh md:min-h-[844px] md:h-[844px] md:rounded-[40px] md:shadow-2xl md:border md:border-[var(--border-light)] relative flex flex-col overflow-hidden transition-all duration-300"
        style={{ transform: "translate3d(0,0,0)" }} // Force containing block for fixed children
      >
        
        {/* Main Content Area - Scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative scroll-smooth"
        >
          <Outlet />
        </div>

        {/* Bottom Navigation - Fixed at bottom of flex container */}
        {!hideNav && (
          <div className="w-full shrink-0 z-50">
             <BottomNavigation />
          </div>
        )}
      </div>
    </div>
  );
}
