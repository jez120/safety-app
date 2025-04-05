import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link

// Define structure for user's submissions (can reuse from elsewhere if available)
interface UserSuggestion {
  suggestion_id: number;
  created_at: string;
  title: string;
  description: string; // Keep description for preview
  status: string;
  department: string | null;
  file_attachment_path: string | null;
  updated_at: string;
}

// Use backend statuses
const statuses = ['All', 'submitted', 'under_review', 'approved', 'rejected', 'implemented'];

function UserSubmissions() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<UserSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchMySuggestions = async () => {
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/api/suggestions/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(response.data);
      } catch (err) {
        console.error("Error fetching user suggestions:", err);
        let message = "Failed to fetch your suggestions.";
        if (axios.isAxiosError(err) && err.response) {
          message = err.response.data.message || message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySuggestions();
  }, [token]);

  // Apply filtering
  const filteredSubmissions = submissions.filter(sub =>
    filterStatus === 'All' || sub.status === filterStatus
  );

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch (e) { return dateString; }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          My Safety Submissions
        </h2>

        {/* Filter Controls */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            name="statusFilter"
            className="appearance-none block w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-red-600">{error}</td></tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.suggestion_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(submission.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{submission.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {/* Use status mapping for colors */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'approved' ? 'bg-teal-100 text-teal-800' :
                            submission.status === 'implemented' ? 'bg-green-100 text-green-800' :
                              submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800' // Default/Unknown
                        }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/suggestion/${submission.suggestion_id}`} className="text-blue-600 hover:text-blue-800">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No submissions found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserSubmissions;
