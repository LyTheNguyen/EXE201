import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { UpgradePage } from "./pages/UpgradePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { FullscreenMapPage } from "./pages/FullscreenMapPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/fullscreen-map" element={<FullscreenMapPage />} />
    </Routes>
  );
}
