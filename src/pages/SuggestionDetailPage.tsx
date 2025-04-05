import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define structure for comments
interface Comment {
  comment_id: number;
  comment_text: string;
  created_at: string;
  author_username: string;
}

// Define the structure of the detailed suggestion data
interface SuggestionDetail extends Suggestion {
  submitted_by_email: string;
  comments?: Comment[]; // Comments are optional initially
}

// Reuse Suggestion type from AdminDashboard or define here if needed
interface Suggestion {
  suggestion_id: number;
  created_at: string;
  submitted_by_username: string;
  department: string | null;
  status: string;
  description: string;
  title: string;
  user_id: number;
  updated_at: string;
}

// Allowed statuses for dropdown
const allowedStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'implemented'];

function SuggestionDetailPage() {
  const { id } = useParams<{ id: string }>(); // Get suggestion ID from URL params
  const { user, token } = useAuth(); // Get user role and token
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  // State for comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);


  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsLoading(true);
      setError(null);
      if (!token || !id) {
        setError("Missing token or suggestion ID.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5001/api/suggestions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuggestion(response.data);
        setSelectedStatus(response.data.status); // Initialize dropdown with current status
      } catch (err) {
        console.error("Error fetching suggestion details:", err);
        let message = "Failed to fetch suggestion details.";
        if (axios.isAxiosError(err) && err.response) {
          message = err.response.data.message || message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();

    // Fetch comments when suggestion is loaded
    const fetchComments = async () => {
      if (!token || !id) return; // Need token and ID
      setIsFetchingComments(true);
      setCommentError(null);
      try {
        const response = await axios.get(`http://localhost:5001/api/suggestions/${id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(response.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setCommentError("Failed to load comments.");
      } finally {
        setIsFetchingComments(false);
      }
    };

    if (id && token) { // Fetch comments only after ensuring id and token are available
      fetchComments();
    }

  }, [id, token]); // Rerun if id or token changes

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !selectedStatus || !suggestion || selectedStatus === suggestion.status) {
      return; // No change or missing info
    }
    setIsUpdatingStatus(true);
    setUpdateError(null);

    try {
      const response = await axios.put(
        `http://localhost:5001/api/suggestions/${id}/status`,
        { status: selectedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with the updated suggestion from response
      setSuggestion(response.data.suggestion);
      alert('Status updated successfully!'); // Simple feedback
    } catch (err) {
      console.error("Error updating status:", err);
      let message = "Failed to update status.";
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.message || message;
      }
      setUpdateError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-GB'); // Include time
    } catch (e) { return dateString; }
  };

  // Add handler for submitting comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !newCommentText.trim()) return;

    setIsPostingComment(true);
    setCommentError(null); // Clear previous errors

    try {
      const response = await axios.post(
        `http://localhost:5001/api/suggestions/${id}/comments`,
        { comment_text: newCommentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new comment to the start of the list optimistically
      // Or refetch comments list for consistency
      setComments(prevComments => [response.data, ...prevComments]); // Add new comment to top
      setNewCommentText(''); // Clear textarea

    } catch (err) {
      console.error("Error posting comment:", err);
      let message = "Failed to post comment.";
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.message || message;
      }
      setCommentError(message); // Show error near comment section
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading suggestion details...</div>;
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;
  if (!suggestion) return <div className="text-center p-6">Suggestion not found.</div>;

  const isAdminUser = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 text-sm">
          &larr; Back to List
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{suggestion.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Suggestion #{suggestion.suggestion_id} &bull; Submitted by {suggestion.submitted_by_username} ({suggestion.submitted_by_email}) on {formatDate(suggestion.created_at)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className={`font-semibold text-lg ${suggestion.status === 'submitted' ? 'text-blue-600' :
              suggestion.status === 'under_review' ? 'text-yellow-600' :
                suggestion.status === 'approved' ? 'text-teal-600' :
                  suggestion.status === 'implemented' ? 'text-green-600' :
                    suggestion.status === 'rejected' ? 'text-red-600' : 'text-gray-700'
              }`}>{suggestion.status}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
            <p className="font-semibold text-lg text-gray-800">{suggestion.department || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="font-semibold text-lg text-gray-800">{formatDate(suggestion.updated_at)}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{suggestion.description}</p>
        </div>

        {/* Admin Section: Update Status */}
        {isAdminUser && (
          <div className="border-t border-gray-200 pt-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Admin Actions</h3>
            <form onSubmit={handleStatusUpdate} className="flex items-center space-x-4">
              <label htmlFor="statusUpdate" className="block text-sm font-medium text-gray-700">
                Update Status:
              </label>
              <select
                id="statusUpdate"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="admin-filter-select flex-grow" // Reuse style or create new
                style={{ maxWidth: '200px' }} // Limit width
              >
                {allowedStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                type="submit"
                disabled={isUpdatingStatus || selectedStatus === suggestion.status}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? 'Updating...' : 'Update'}
              </button>
            </form>
            {updateError && <p className="text-red-600 text-sm mt-2">{updateError}</p>}
          </div>
        )}

        {/* Placeholder for Comments Section */}
        {/* <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
              <p className="text-gray-500">(Comments functionality coming soon)</p>
            </div> */}

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
          {isFetchingComments ? (
            <p className="text-gray-500">Loading comments...</p>
          ) : commentError ? (
            <p className="text-red-500">{commentError}</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.comment_id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-gray-800 mb-1">{comment.comment_text}</p>
                  <p className="text-xs text-gray-500">
                    By {comment.author_username} on {formatDate(comment.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mt-6">
            <label htmlFor="newComment" className="block text-sm font-medium text-gray-700 mb-1">
              Add a comment:
            </label>
            <textarea
              id="newComment"
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Type your comment here..."
              required
            />
            <button
              type="submit"
              disabled={isPostingComment || !newCommentText.trim()}
              className="mt-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPostingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default SuggestionDetailPage;
