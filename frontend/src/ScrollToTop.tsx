import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// React Router keeps scroll position on navigation, so jump back to the top
// whenever path changes. Going back is the exception, the page puts the user
// where they were
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
}
