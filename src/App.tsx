import { Routes, Route } from 'react-router-dom';

// Import Page Components
import LandingPage from './pages/LandingPage';
import SubmissionForm from './pages/SubmissionForm';
import UserSubmissions from './pages/UserSubmissions';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import SuggestionDetailPage from './pages/SuggestionDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Keep this commented out or remove it
// import './App.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure full height */}
      <Navbar /> {/* Navbar remains fixed at top */}

      {/* Main content area: takes remaining height and centers content */}
      <main className="flex flex-grow flex-col items-center justify-center"> {/* Use flex-grow */}
        <Routes>
          {/* Landing Page (Root Path) */}
          <Route path="/" element={<LandingPage />} />

          {/* Submission Form Page */}
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmissionForm />
              </ProtectedRoute>
            }
          />

          {/* User's View Page */}
          <Route
            path="/my-submissions"
            element={
              <ProtectedRoute>
                <UserSubmissions />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Page */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Suggestion Detail Page */}
          <Route
            path="/suggestion/:id"
            element={
              <ProtectedRoute>
                <SuggestionDetailPage />
              </ProtectedRoute>
            }
          />

          {/* --- Public Routes --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Catch-all for Not Found Pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main> {/* Close main content area */}

      {/* Footer could go here */}
    </div>
  );
}

export default App;
