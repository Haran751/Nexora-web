import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import JobDiscoveryPage from "./pages/JobDiscoveryPage.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SavedJobsPage from "./pages/SavedJobsPage.jsx";
import ApplicationsPage from "./pages/ApplicationsPage.jsx";
import CVGeneratorPage from "./pages/CVGeneratorPage.jsx";
import EmployerDashboardPage from "./pages/EmployerDashboardPage.jsx";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/jobs" element={<JobDiscoveryPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cv" element={<CVGeneratorPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/employer" element={<EmployerDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}