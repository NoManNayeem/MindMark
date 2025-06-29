'use client';

import { useEffect, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Update auth state on initial render and route changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 500); // ✅ Periodically sync for now (can switch to context later)

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50 border-b">
      <Link href="/" className="text-2xl font-bold text-blue-700 hover:text-blue-800">
        MindMark
      </Link>

      <div className="space-x-4 flex items-center">
        {isAuthenticated ? (
          <>
            <Link
              href="/chat"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Chat
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              title="Logout"
            >
              <FiLogOut className="text-lg" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
