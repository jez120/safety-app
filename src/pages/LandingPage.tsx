import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  // --- Simulate admin role for now ---
  // In a real app, this would come from authentication context
  const [isAdmin, setIsAdmin] = useState(true); // Set to true to see admin button, false otherwise
  // --- End Simulation ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Safety Suggestion Portal
        </h1>
        <p className="text-gray-600 mb-8">
          Help us improve workplace safety. Submit your suggestions or concerns.
        </p>

        <div className="space-y-4">
          <Link
            to="/submit"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Submit New Safety Suggestion
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* --- Temporary toggle for simulation --- */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="mt-8 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Toggle Admin View (Simulation)
        </button>
        {/* --- End Temporary Toggle --- */}
      </div>
    </div>
  );
}

export default LandingPage;
