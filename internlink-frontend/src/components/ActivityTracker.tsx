import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { user } from "../services/api";

export default function ActivityTracker() {
  const location = useLocation();
  const currentPath = useRef(location.pathname);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // If path changed
    if (currentPath.current !== location.pathname) {
      const elapsedSeconds = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Send tracking event for the previous path (only if we spent some time or want to log bounces)
      if (elapsedSeconds >= 1) { // Optional: ignore sub-second bounces
        user.logActivity({
          event_type: "page_visit",
          path: currentPath.current,
          duration: elapsedSeconds,
          metadata: {
            theme: localStorage.getItem("theme") || "system",
            screen_width: window.innerWidth,
            os: navigator.platform
          }
        }).catch(err => console.debug("Failed to log activity:", err));
      }

      // Reset for new path
      currentPath.current = location.pathname;
      startTime.current = Date.now();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Cleanup on unmount (e.g., app closed/navigated away outside SPA)
    return () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime.current) / 1000);
      if (elapsedSeconds >= 1) {
        user.logActivity({
          event_type: "page_visit",
          path: currentPath.current,
          duration: elapsedSeconds,
          metadata: { theme: localStorage.getItem("theme") || "system", screen_width: window.innerWidth }
        }).catch(() => {});
      }
    };
  }, []);

  // Global Click Tracker
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest interactive element to the click target
      const target = (e.target as Element).closest('button, a, [role="button"], .card-action, .btn, .icon-btn');
      if (target) {
        let text = (target as HTMLElement).innerText || target.getAttribute("aria-label") || target.getAttribute("title") || "";
        text = text.trim().substring(0, 50); // limit length to avoid massive payloads
        // Extract basic class names for context 
        const cls = (typeof target.className === "string") ? target.className : "";
        
        user.logActivity({
          event_type: "click",
          path: window.location.pathname,
          metadata: {
            text,
            class: cls.split(" ")[0], // just take the primary class for brevity
            tag: target.tagName.toLowerCase(),
            theme: localStorage.getItem("theme") || "system"
          }
        }).catch(() => {});
      }
    };

    document.addEventListener("click", handleClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null; // Invisible component
}
