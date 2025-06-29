'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Adjust for navbar height */}
      <div className="hidden md:block w-64 border-r">
        <Sidebar
          onSelectTopic={setSelectedTopic}
          selectedTopic={selectedTopic}
        />
      </div>

      <div className="flex-1">
        <ChatWindow topic={selectedTopic} />
      </div>
    </div>
  );
}
