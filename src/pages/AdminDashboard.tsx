import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import AdminAnalytics from '../components/AdminAnalytics';

// Define the structure of a suggestion based on API response
interface Suggestion {
  suggestion_id: number;
  created_at: string; // Comes as ISO string
  submitted_by_username: string;
  department: string | null; // Can be null
  // hazardType: string; // Not currently in API response
  // location: string; // Not currently in API response
  status: string;
  description: string;
  title: string; // Added title based on controller
  user_id: number;
  updated_at: string;
  file_attachment_path?: string | null; // Make optional as it might not always be present
}


// Placeholder options for filters (can be dynamic later)
const departments = ['All', 'Engineering', 'Operations', 'Marketing', 'HR', 'Facilities', 'IT'];
// const hazardTypes = ['All', 'Equipment Malfunction', 'Unsafe Condition', 'Process Issue', 'Ergonomics', 'Behavioral', 'Environmental', 'Other']; // Keep commented out for now
const statuses = ['All', 'submitted', 'under_review', 'approved', 'rejected', 'implemented']; // Match DB statuses

function AdminDashboard() {
  const { token } = useAuth(); // Get token from context
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters and search
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  // const [filterHazardType, setFilterHazardType] = useState('All'); // Keep commented out
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/api/suggestions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        let message = "Failed to fetch suggestions.";
        if (axios.isAxiosError(err) && err.response) {
          message = err.response.data.message || message;
          if (err.response.status === 401 || err.response.status === 403) {
            message += " Please check your login status and permissions.";
            // Optionally trigger logout here if token is invalid/expired
          }
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [token]); // Re-fetch if token changes

  // Placeholder for filtered data - apply actual filtering later
  const filteredSubmissions = suggestions.filter(sub => {
    const statusMatch = filterStatus === 'All' || sub.status === filterStatus;
    const deptMatch = filterDepartment === 'All' || sub.department === filterDepartment;
    const termMatch = !searchTerm ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    // Basic date filtering (can be improved for timezones/precision)
    const startDateMatch = !filterStartDate || new Date(sub.created_at) >= new Date(filterStartDate);
    const endDateMatch = !filterEndDate || new Date(sub.created_at) <= new Date(filterEndDate + 'T23:59:59'); // Include full end day

    return statusMatch && deptMatch && termMatch && startDateMatch && endDateMatch;
  });

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return dateString; // Return original if formatting fails
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Analytics Section */}
        <AdminAnalytics />

        {/* Filter and Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4"> {/* Adjusted grid cols */}
            {/* Status Filter */}
            <div>
              <label htmlFor="adminStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="adminStatusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-filter-select">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Department Filter */}
            <div>
              <label htmlFor="adminDeptFilter" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select id="adminDeptFilter" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="admin-filter-select">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Date Range Filter */}
            <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:col-span-1"> {/* Span date range */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" id="startDate" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="admin-filter-input" />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" id="endDate" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="admin-filter-input" />
              </div>
            </div>
          </div>
          {/* Search Input */}
          <div className="mt-4"> {/* Added margin top */}
            <label htmlFor="adminSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Title/Description</label>
            <input
              type="search"
              id="adminSearch"
              placeholder="Search suggestions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-filter-input w-full md:w-1/2 lg:w-1/3"
            />
          </div>
        </div>

        {/* Submissions Table Section */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading suggestions...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No suggestions found matching your criteria.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="admin-th">Date</th>
                  <th className="admin-th">Submitter</th>
                  <th className="admin-th">Department</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Title</th>
                  <th className="admin-th">Description</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.suggestion_id} className="hover:bg-gray-50">
                    <td className="admin-td whitespace-nowrap">{formatDate(sub.created_at)}</td>
                    <td className="admin-td">{sub.submitted_by_username}</td>
                    <td className="admin-td">{sub.department || 'N/A'}</td>
                    <td className="admin-td">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        sub.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          sub.status === 'approved' ? 'bg-teal-100 text-teal-800' :
                            sub.status === 'implemented' ? 'bg-green-100 text-green-800' :
                              sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800' // Default/Unknown
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="admin-td max-w-xs truncate" title={sub.title}>{sub.title}</td>
                    <td className="admin-td max-w-sm truncate" title={sub.description}>{sub.description}</td>
                    <td className="admin-td whitespace-nowrap"> {/* Actions Column */}
                      <Link to={`/suggestion/${sub.suggestion_id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium" title="View Details">
                        View
                      </Link>
                      {/* Update and Comment buttons are removed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Styles removed - Add to index.css or similar if needed */}
    </div>
  );
}

export default AdminDashboard;
