import { BrowserRouter, Routes, Route } from "react-router-dom";
import SeriesPage from "./pages/SeriesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/anime/:slug" element={<SeriesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
