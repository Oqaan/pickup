import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// react router keeps scroll position on navigation, so jump back to the top whenever path changes
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
