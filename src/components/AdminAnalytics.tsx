import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// Define structure for analytics data from API
interface StatusCount { status: string; count: string; } // Count might be string from DB
interface DepartmentCount { department: string; count: string; }
interface TrendData { date: string; count: string; }

interface AnalyticsData {
  statusCounts: StatusCount[];
  departmentCounts: DepartmentCount[];
  submissionsTrend: TrendData[];
}

// Helper function for chart colors (customize as needed)
const chartColors = [
  'rgba(54, 162, 235, 0.7)', // Blue
  'rgba(255, 206, 86, 0.7)', // Yellow
  'rgba(75, 192, 192, 0.7)', // Green
  'rgba(153, 102, 255, 0.7)', // Purple
  'rgba(255, 159, 64, 0.7)', // Orange
  'rgba(255, 99, 132, 0.7)',  // Red
  'rgba(201, 203, 207, 0.7)'  // Grey
];
const chartBorderColors = chartColors.map(color => color.replace('0.7', '1'));


function AdminAnalytics() {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/api/suggestions/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyticsData(response.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        let message = "Failed to load analytics data.";
        if (axios.isAxiosError(err) && err.response) {
          message = err.response.data.message || message;
          if (err.response.status === 401 || err.response.status === 403) {
            message += " Please check login/permissions.";
          }
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  // --- Prepare Chart Data ---

  const statusChartData = {
    labels: analyticsData?.statusCounts.map(item => item.status) || [],
    datasets: [{
      label: 'Suggestions by Status',
      data: analyticsData?.statusCounts.map(item => parseInt(item.count, 10)) || [],
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
    }],
  };

  const departmentChartData = {
    labels: analyticsData?.departmentCounts.map(item => item.department) || [],
    datasets: [{
      label: 'Suggestions by Department',
      data: analyticsData?.departmentCounts.map(item => parseInt(item.count, 10)) || [],
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
    }],
  };

  // Format date for trend chart labels (e.g., YYYY-MM-DD)
  const formatTrendDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) { return dateString; }
  };

  const trendChartData = {
    labels: analyticsData?.submissionsTrend.map(item => formatTrendDate(item.date)) || [],
    datasets: [{
      label: 'Submissions Trend (Last 30 Days)',
      data: analyticsData?.submissionsTrend.map(item => parseInt(item.count, 10)) || [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow charts to resize height
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false, // Disable default title, use custom h4
      },
    },
    scales: { // Add scales for Bar/Line charts
      y: {
        beginAtZero: true
      }
    }
  };

  // Specific options for Pie chart legend
  const pieChartOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { position: 'right' as const } },
    scales: {} // Remove scales for Pie chart
  };


  if (isLoading) return <div className="text-center p-4">Loading analytics...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;
  if (!analyticsData) return <div className="text-center p-4">No analytics data available.</div>;

  // Check if there's data for each chart type
  const hasStatusData = analyticsData.statusCounts && analyticsData.statusCounts.length > 0;
  const hasDeptData = analyticsData.departmentCounts && analyticsData.departmentCounts.length > 0;
  const hasTrendData = analyticsData.submissionsTrend && analyticsData.submissionsTrend.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Analytics Overview</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status Chart (Pie) */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-64 md:h-80">
          <h4 className="text-sm font-medium text-gray-600 mb-2 text-center">Suggestions by Status</h4>
          {hasStatusData ? (
            <Pie data={statusChartData} options={pieChartOptions} />
          ) : <p className="text-center text-gray-500 mt-8">No status data</p>}
        </div>

        {/* Department Chart (Bar) */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-64 md:h-80">
          <h4 className="text-sm font-medium text-gray-600 mb-2 text-center">Suggestions by Department</h4>
          {hasDeptData ? (
            <Bar data={departmentChartData} options={chartOptions} />
          ) : <p className="text-center text-gray-500 mt-8">No department data</p>}
        </div>

        {/* Trend Chart (Line) */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-64 md:h-80 lg:col-span-3"> {/* Span full width on large screens */}
          <h4 className="text-sm font-medium text-gray-600 mb-2 text-center">Submission Trend (Last 30 Days)</h4>
          {hasTrendData ? (
            <Line data={trendChartData} options={chartOptions} />
          ) : <p className="text-center text-gray-500 mt-8">No trend data</p>}
        </div>

      </div>
    </div>
  );
}

export default AdminAnalytics;
