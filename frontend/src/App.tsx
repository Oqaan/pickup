import { BrowserRouter, Routes, Route } from "react-router-dom";
import SeriesPage from "./pages/SeriesPage";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import LegalPage from "./pages/LegalPage";
import ScrollToTop from "./ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
