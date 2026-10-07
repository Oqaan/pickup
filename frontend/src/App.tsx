import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import SeriesPage from "./pages/SeriesPage";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import LegalPage from "./pages/LegalPage";
import ScrollToTop from "./ScrollToTop";

// Passing the route turns off auto tracking, so a search rewriting ?q= on every keystroke isn't a page view
function PageViews() {
  const { pathname } = useLocation();
  const route = pathname.startsWith("/anime/") ? "/anime/[slug]" : pathname;
  return <Analytics route={route} path={pathname} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageViews />
      <Layout>
        <Routes>
          <Route path="/anime/:slug" element={<SeriesPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
