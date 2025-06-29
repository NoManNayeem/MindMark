'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatWindow({ topic }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (!topic) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/topics/${topic.id}/messages/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [topic]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || !topic) return;

    const userMessage = input;
    setInput('');
    setIsSending(true);
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      { user_message: userMessage, agent_response: null },
    ]);

    try {
      const res = await fetch(`http://localhost:8000/api/topics/${topic.id}/chat/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_message: userMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].agent_response = data.agent_response;
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].agent_response = '⚠️ Failed to get response';
          return updated;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setIsSending(false);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
        <p>Select or create a topic to start chatting.</p>
        <h3 className="text-lg font-medium text-gray-600">Where do we start today?</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div
        className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4 scroll-smooth"
        ref={chatRef}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            <div className="self-end">
              <div className="text-sm text-blue-600 font-semibold">You</div>
              <div className="bg-blue-50 p-3 rounded-md shadow-sm text-sm whitespace-pre-wrap">
                {msg.user_message}
              </div>
            </div>
            <div className="self-start">
              <div className="text-sm text-gray-700 font-semibold">Agent</div>
              <div className="bg-gray-100 p-3 rounded-md shadow-sm text-sm prose prose-sm max-w-none whitespace-pre-wrap">
                {msg.agent_response !== null ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.agent_response}
                  </ReactMarkdown>
                ) : (
                  <span className="animate-pulse text-gray-400">Typing...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t pt-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 border rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
