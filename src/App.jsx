import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Statically import LandingPage so root route renders immediately without lazy-load waterfall
import LandingPage from "./pages/LandingPage.jsx";

// Secondary routes remain lazily loaded on-demand
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
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage.jsx"));

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

// Melindungi halaman milik job-seeker/user: harus login dulu.
function RequireAuth({ allowEmployer = false, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Halaman job-seeker (profil, lamaran, dll.) tidak utk employer.
  if (!allowEmployer && role === "employer") {
    return <Navigate to="/employer" replace />;
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/jobs" element={<JobDiscoveryPage />} />
            <Route
              path="/jobs/:id"
              element={
                <RequireAuth>
                  <JobDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/home"
              element={
                <RequireAuth allowEmployer>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/cv"
              element={
                <RequireAuth>
                  <CVGeneratorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/saved"
              element={
                <RequireAuth>
                  <SavedJobsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/applications"
              element={
                <RequireAuth>
                  <ApplicationsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/employer"
              element={
                <ProtectedEmployerRoute>
                  <EmployerDashboardPage />
                </ProtectedEmployerRoute>
              }
            />
            <Route
              path="/employer/company"
              element={
                <ProtectedEmployerRoute>
                  <CompanyProfilePage />
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