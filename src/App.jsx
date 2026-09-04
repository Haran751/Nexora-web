import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";

// Route-level code splitting for non-critical paths
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const JobDiscoveryPage = lazy(() => import("./pages/JobDiscoveryPage.jsx"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const SavedJobsPage = lazy(() => import("./pages/SavedJobsPage.jsx"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage.jsx"));
const CVGeneratorPage = lazy(() => import("./pages/CVGeneratorPage.jsx"));
const EmployerDashboardPage = lazy(() => import("./pages/EmployerDashboardPage.jsx"));

function PageFallback() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      color: "var(--bg-card-alt)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(61, 16, 40, 0.15)",
          borderTopColor: "var(--accent-orange)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>Loading Nexora...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </AuthProvider>
    </HashRouter>
  );
}