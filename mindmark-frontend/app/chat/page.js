'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Helper to validate JWT token
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp && decoded.exp > now;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token || !isTokenValid(token)) {
      router.push('/login');
    }
  }, [router]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSidebarOpen(false); // auto-close sidebar on mobile
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-2 left-2 z-10 md:hidden bg-white border p-2 rounded shadow"
      >
        ☰ Topics
      </button>

      {/* Sidebar: visible on desktop, toggle on mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-20 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:block`}
      >
        <Sidebar
          onSelectTopic={handleTopicSelect}
          selectedTopic={selectedTopic}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow topic={selectedTopic} />
      </div>
    </div>
  );
}
