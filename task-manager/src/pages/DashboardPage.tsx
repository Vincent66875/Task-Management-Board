// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchBoardByAccessCode,
  fetchBoardById,
  fetchTasks,
  deleteAllBoards,
  deleteBoardById,
  deleteTask,
  updateTask,
  addTask,
  createBoard,
  getUserId,
  fetchUserBoards,
  updateBoard,
  generateUniqueAccessCode,
  getUserName,
  joinBoard,
} from '../firebase/firestore-utils';
import { signOutUser } from '../firebase-auth';
import { access } from 'fs';
import BoardCard from '../components/BoardCard';

export type Board = {
  id: string;
  title: string;
  accessCode: string;
  description: string;
  createdAt: Date;
  ownerRef: any;
  sharedWith: any[];
};

const DashboardPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isDarkMode, setDarkMode] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAccessCode, setNewAccessCode] = useState('');
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
  const loadUserAndBoards = async () => {
    const uid = await getUserId();
    if (!uid) {
      setLoading(false);
      return;
    }

    setUserId(uid);

    try {
      const name = await getUserName(uid);
      setUserName(name);
      const data = await fetchUserBoards(uid);
      setBoards(data);
    } catch (error) {
      console.error('Error loading boards or user info:', error);
    } finally {
      setLoading(false);
    }
  };

  loadUserAndBoards();
}, []);

  const handleAddBoard = async () => {
    title.trim();
    description.trim();
    console.log("Sufficient elements");
    if (!userId) {
      console.log("Error: user is not logged in");
      return;
    }
    try {
      const newBoard = await createBoard({ userId, title, description});
      setBoards(prev => [...prev, newBoard]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllBoards();
    if (!userId) {
      console.log("Error: user is not logged in");
      return;
    }
    const updated = await fetchUserBoards(userId);
    setBoards(updated);
  };

  const handleDeleteBoard = async (id: string) => {
    if(!userId) return;
    await deleteBoardById(id, userId);
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
  //Edit Board
  const handleUpdateBoard = async (board: Board) => {
    if (!userId) return;
    title.trim();
    description.trim();
    accessCode.trim();
    await updateBoard(board.id, {
      title: board.title,
      description: board.description,
      accessCode: board.accessCode,
    });
    setBoards(prev =>
      prev.map(t => (t.id === board.id ? {...t, ...board}:t))
    );
  };
  const handleEditSubmit = async () => {
    if (!editingBoard) return;
    await handleUpdateBoard({
      ...editingBoard,
      title: newTitle,
      description: newDescription,
    });
    setShowEditModal(false);
    setEditingBoard(null);
    setNewTitle('');
    setNewDescription(''); 
  };

  const handleEditClick = (board: Board) => {
    setEditingBoard(board); // set the task to be edited
    setNewTitle(board.title); // populate form fields
    setNewDescription(board.description);
    setShowEditModal(true); // show the modal
  };
  //Share
  const handleShareSubmit = () => {
  setShowAccessCodeModal(false);
  setEditingBoard(null);
};

  const handleShareClick = async (board: Board) => {
    setEditingBoard(board); // set the task to be edited
    setShowAccessCodeModal(true); // show the modal
    if (!board.accessCode) {
      const uniqueCode = await generateUniqueAccessCode();
      await handleUpdateBoard({ ...board, accessCode: uniqueCode });
      setNewAccessCode(uniqueCode); // display in modal
    } else {
      setNewAccessCode(board.accessCode); // show existing code
    }
  };

  const handleJoinBoard = async () => {
    if(!accessCodeInput.trim()) return;
    if(!userId) return;

    const board = await joinBoard(accessCodeInput.trim(), userId);
    if(board) {
      setBoards(prev => [...prev, board]);
      setAccessCodeInput('');
      setShowAccessCodeInput(false);
    } else {
      alert('Error joining: check input');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-b-green-500 animate-spin-reverse"></div>
      </div>
      <p className="text-xl font-semibold animate-pulse">Loading your workspace...</p>
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

      <h2 className="text-2xl font-bold mb-6">
        {userName}'s Dashboard
      </h2>
      
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
          <BoardCard
            key={board.id}
            board={board}
            onDelete={handleDeleteBoard}
            onEdit={handleEditClick}
            onShare={handleShareClick} // placeholder
          />
        ))}
      </div>

      {/* Fixed Delete Button */}
      <button
        onClick={() => setShowAccessCodeInput(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Join Board by Access Code
      </button>
      {showEditModal && editingBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-3 text-gray-500 dark:text-gray-200 text-xl hover:text-gray-800"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Edit Task</h2>

            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <textarea
              placeholder="Task Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full h-40 mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleEditSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
      {showAccessCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowAccessCodeModal(false)}
              className="absolute top-2 right-3 text-gray-500 dark:text-gray-200 text-xl hover:text-gray-800"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Access Code</h2>

            <input
              value={newAccessCode}
              readOnly
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white font-mono text-center text-xl"
            />
            <button
              onClick={() => navigator.clipboard.writeText(newAccessCode)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      {showAccessCodeInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowAccessCodeInput(false)}
              className="absolute top-2 right-3 text-gray-500 dark:text-gray-200 text-xl hover:text-gray-800"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Enter Access Code</h2>

            <input
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Enter access code"
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />

            <button
              onClick={handleJoinBoard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Join Board
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
