'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiEdit3, FiCheck, FiX } from 'react-icons/fi';

export default function Sidebar({ onSelectTopic, selectedTopic }) {
  const [topics, setTopics] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/topics/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      } else {
        console.error('Failed to fetch topics');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createTopic = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/topics/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        const newTopic = await res.json();
        setTopics((prev) => [newTopic, ...prev]);
        setNewTitle('');
        onSelectTopic(newTopic);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTopic = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this topic?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:8000/api/topics/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });

      if (res.ok) {
        setTopics((prev) => prev.filter((t) => t.id !== id));
        if (selectedTopic?.id === id) {
          onSelectTopic(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete topic', err);
    }
  };

  const startEditing = (topic) => {
    setEditingId(topic.id);
    setEditedTitle(topic.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedTitle('');
  };

  const saveEdit = async (id) => {
    if (!editedTitle.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/topics/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (res.ok) {
        setTopics((prev) =>
          prev.map((t) => (t.id === id ? { ...t, title: editedTitle } : t))
        );
        cancelEditing();
      }
    } catch (err) {
      console.error('Failed to update topic', err);
    }
  };

  return (
    <aside className="w-64 bg-gray-50 p-4 border-r h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Topics</h2>

      <div className="mb-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New topic title"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createTopic}
          disabled={!newTitle.trim() || loading}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <FiPlus className="text-base" />
          {loading ? 'Creating...' : 'New Topic'}
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className={`group relative p-2 rounded-md transition flex items-center justify-between ${
              selectedTopic?.id === topic.id
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div
              className="flex-1 cursor-pointer truncate"
              onClick={() => onSelectTopic(topic)}
            >
              {editingId === topic.id ? (
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full border px-2 py-1 text-sm rounded"
                />
              ) : (
                topic.title
              )}
            </div>

            <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingId === topic.id ? (
                <>
                  <button
                    onClick={() => saveEdit(topic.id)}
                    className="text-green-600 hover:text-green-700"
                    title="Save"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-500 hover:text-gray-700"
                    title="Cancel"
                  >
                    <FiX />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(topic)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Rename"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
