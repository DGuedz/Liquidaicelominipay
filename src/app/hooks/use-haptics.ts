import { useCallback } from "react";

export function useHaptics() {
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
    // Only run in browser environment
    if (typeof window === "undefined" || !window.navigator || !window.navigator.vibrate) {
      return;
    }

    try {
      switch (type) {
        case "light":
          window.navigator.vibrate(10);
          break;
        case "medium":
          window.navigator.vibrate(20);
          break;
        case "heavy":
          window.navigator.vibrate(30);
          break;
        case "success":
          window.navigator.vibrate([15, 60, 20]);
          break;
        case "error":
          window.navigator.vibrate([30, 40, 30, 40, 40]);
          break;
      }
    } catch (e) {
      console.debug("Haptic feedback not supported or blocked");
    }
  }, []);

  return { triggerHaptic };
}
