import { Routes, Route } from 'react-router-dom';

// Import Page Components
import LandingPage from './pages/LandingPage';
import SubmissionForm from './pages/SubmissionForm';
import UserSubmissions from './pages/UserSubmissions';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage'; // Import Registration Page
import SuggestionDetailPage from './pages/SuggestionDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; // Import Navbar

// Keep this commented out or remove it
// import './App.css';

function App() {
  return (
    <div>
      <Navbar /> {/* Add Navbar here */}

      <div className="pt-16"> {/* Add padding top to prevent content overlap */}
        <Routes>
          {/* Landing Page (Root Path) */}
          <Route path="/" element={<LandingPage />} />

          {/* Submission Form Page */}
          {/* --- Protected Routes --- */}

          {/* Submission Form Page (Requires login) */}
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmissionForm />
              </ProtectedRoute>
            }
          />

          {/* User's View Page (Requires login, any role) */}
          <Route
            path="/my-submissions"
            element={
              <ProtectedRoute>
                <UserSubmissions />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Page (Requires login and 'admin' role) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Suggestion Detail Page (Requires login) */}
          <Route
            path="/suggestion/:id"
            element={
              <ProtectedRoute>
                <SuggestionDetailPage />
              </ProtectedRoute>
            }
          />

          {/* --- Public Routes --- */}

          {/* Login Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Registration Page */}
          <Route path="/register" element={<RegistrationPage />} />

          {/* Catch-all for Not Found Pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div> {/* Close padding div */}
      {/* Footer could go here, outside <Routes> */}
    </div>
  );
}

export default App;
