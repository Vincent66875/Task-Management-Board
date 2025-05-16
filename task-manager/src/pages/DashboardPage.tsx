// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllBoards, deleteAllBoards, createBoard, deleteBoardById } from '../firebase/firestore-utils';
import { signOutUser } from '../firebase-auth';

type Board = {
  id: string;
  title: string;
  description: string;
};

const DashboardPage = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDarkMode, setDarkMode] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }else {
        document.documentElement.classList.remove('dark');
      }
  }, [isDarkMode]);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const data = await fetchAllBoards();
        setBoards(data);
      } catch (error) {
        console.error('Error loading boards:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBoards();
  }, []);

  const handleAddBoard = async () => {
    if (!title.trim() || !description.trim()) return;
    const newBoard = await createBoard(title, description);
    setBoards(prev => [...prev, newBoard]);
    setTitle('');
    setDescription('');
  };

  const handleDeleteAll = async () => {
    await deleteAllBoards();
    const updated = await fetchAllBoards();
    setBoards(updated);
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoardById(id);
    const updated = boards.filter((board) => board.id !== id);
    setBoards(updated);
  }

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className='min-h-screen bg-blue-50 dark:bg-gray-900'>
      <div className="p-8 text-black dark:text-white">Loading...</div>
    </div>
  );

  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-8 relative">
      {/* Top-right Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded bg-gray-300 dark:bg-gray-600 text-black dark:text-white hover:opacity-80"
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleSignOut}
          className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Board Creation Form */}
      <div className="mb-6 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl shadow">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mr-2 p-2 bg-white dark:bg-gray-700 text-black dark:text-white border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mr-2 p-2 bg-white dark:bg-gray-700 text-black dark:text-white border rounded"
        />
        <button
          onClick={handleAddBoard}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Board
        </button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <div
            key={board.id}
            className="relative bg-white dark:bg-gray-700 text-black dark:text-white  p-6 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <button
              onClick={() => handleDeleteBoard(board.id)}
              className='absolute top-2 right-2 text-red-500 text-lg font-bold'
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold">{board.title}</h3>
            <p className="text-gray-500">{board.description}</p>
            <Link
              to={`/board/${board.id}`}
              className="text-blue-500 hover:text-blue-700 mt-4 inline-block"
            >
              View Board
            </Link>
          </div>
        ))}
      </div>

      {/* Fixed Delete Button */}
      <button
        onClick={handleDeleteAll}
        className="fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete All Boards
      </button>
    </div>
  );
};

export default DashboardPage;
