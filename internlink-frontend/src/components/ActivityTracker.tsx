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
          duration: elapsedSeconds
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
          duration: elapsedSeconds
        }).catch(() => {});
      }
    };
  }, []);

  return null; // Invisible component
}
