import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Route-level code splitting to optimize initial bundle size & load times
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const JobDiscoveryPage = lazy(() => import("./pages/JobDiscoveryPage.jsx"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const CVGeneratorPage = lazy(() => import("./pages/CVGeneratorPage.jsx"));
const SavedJobsPage = lazy(() => import("./pages/SavedJobsPage.jsx"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage.jsx"));
const EmployerDashboardPage = lazy(() => import("./pages/EmployerDashboardPage.jsx"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "rgba(255, 255, 255, 0.85)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(232, 136, 60, 0.2)",
          borderTopColor: "#E8883C",
          borderRadius: "50%",
          animation: "nexora-spin 0.75s linear infinite",
        }}
      />
      <span style={{ fontSize: "0.88rem", opacity: 0.8 }}>Memuat halaman...</span>
      <style>{`@keyframes nexora-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedEmployerRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "employer") {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
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
            <Route
              path="/employer"
              element={
                <ProtectedEmployerRoute>
                  <EmployerDashboardPage />
                </ProtectedEmployerRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HashRouter>
  );
}