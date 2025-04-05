import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
        Go to Landing Page
      </Link>
    </div>
  );
}

export default NotFoundPage;
