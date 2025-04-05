import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

// Placeholder data for dropdowns - replace with actual data later
const departments = ['Engineering', 'Operations', 'Marketing', 'HR', 'Facilities', 'IT']; // Added IT
const hazardTypes = [
  'Equipment Malfunction',
  'Unsafe Condition',
  'Process Issue',
  'Ergonomics',
  'Behavioral',
  'Environmental',
  'Other',
];

function SubmissionForm() {
  const { user, token } = useAuth(); // Get user and token
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [hazardType, setHazardType] = useState(''); // Keep this for now, though backend doesn't use it yet
  const [location, setLocation] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add 'submitted' type to allow showing choices
  const [submitStatus, setSubmitStatus] = useState<{ type: 'submitted' | 'error'; message: string } | null>(null);
  const navigate = useNavigate(); // Not used currently, but good practice

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    } else {
      setAttachment(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    if (!user || !token) {
      setSubmitStatus({ type: 'error', message: 'You must be logged in to submit a suggestion.' });
      setIsSubmitting(false);
      return;
    }

    // Basic frontend validation (can be more robust)
    // Note: Hazard type is not sent to backend currently, but kept for form validation
    if (!title || !description || !department || !hazardType) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('user_id', user.userId.toString()); // Send user ID from context
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', department);
    // Append file if selected
    if (attachment) {
      formData.append('attachment', attachment); // Key must match backend: upload.single('attachment')
    }
    // Add location or hazardType if needed by backend later
    // formData.append('location', location);

    try {
      const response = await axios.post(
        'http://localhost:5001/api/suggestions',
        formData, // Send FormData
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
            Authorization: `Bearer ${token}`, // Include auth token
          },
        }
      );

      if (response.status === 201) {
        // Don't clear form immediately, show success options instead
        setSubmitStatus({ type: 'submitted', message: 'Suggestion submitted successfully!' });
        // Keep form data in state until user chooses "Submit Another"
        // setTitle('');
        // setDescription('');
        setDepartment('');
        setHazardType('');
        setLocation('');
        setAttachment(null);
        // const fileInput = document.getElementById('attachment') as HTMLInputElement;
        // if (fileInput) fileInput.value = '';
      } else {
        // Handle non-201 success responses if necessary
        setSubmitStatus({ type: 'error', message: `Unexpected response status: ${response.status}` });
      }
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to submit suggestion. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        // Use error message from backend if available
        errorMessage = error.response.data.message || errorMessage;
      }
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to clear form and reset status for submitting another
  const handleSubmitAnother = () => {
    setTitle('');
    setDescription('');
    setDepartment('');
    setHazardType('');
    setLocation('');
    setAttachment(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setSubmitStatus(null); // Hide success message and show form again
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Submit a Safety Suggestion
        </h2>

        {/* Error Message Area */}
        {submitStatus && submitStatus.type === 'error' && (
          <div className="p-4 rounded-md bg-red-100 text-red-800 border border-red-300">
            {submitStatus.message}
          </div>
        )}

        {/* Success Message & Options Area */}
        {submitStatus && submitStatus.type === 'submitted' && (
          <div className="p-4 rounded-md bg-green-100 text-green-800 border border-green-300 space-y-3">
            <p className="font-medium">{submitStatus.message}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button" // Important: prevent form submission
                onClick={handleSubmitAnother}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Submit Another Suggestion
              </button>
              <Link
                to="/my-submissions"
                className="text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                View My Submissions
              </Link>
              <Link
                to="/"
                className="text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Go Home
              </Link>
            </div>
          </div>
        )}

        {/* Hide form if submission was successful, show otherwise */}
        {(!submitStatus || submitStatus.type !== 'submitted') && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="A brief title for your suggestion"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Please provide details about the safety concern or suggestion..."
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department"
                name="department"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="" disabled>Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Hazard Type */}
            <div>
              <label htmlFor="hazardType" className="block text-sm font-medium text-gray-700 mb-1">
                Hazard Type *
              </label>
              <select
                id="hazardType"
                name="hazardType"
                required
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="" disabled>Select Hazard Type</option>
                {hazardTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location (Optional) */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Specific Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Machine #5, Office Wing B, Warehouse Section C"
              />
            </div>

            {/* Attachment (Optional) */}
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                Attach File (Optional - Max 5MB: jpg, png, pdf)
              </label>
              {/* File input needs special handling for state */}
              <input
                type="file"
                id="attachment"
                name="attachment"
                accept=".jpg, .jpeg, .png, .pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Upload photos or documents relevant to the suggestion.</p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>
        )} {/* End of conditional form rendering */}
      </div>
    </div>
  );
}

// Add function to handle "Submit Another"
const handleSubmitAnother = () => {
  // Clear form fields (assuming state setters are accessible - need to lift state or pass setters if this was a separate component)
  // This needs to be inside the component scope to access setters
  // We'll add it inside the component function
};

export default SubmissionForm;
