// src/pages/CompleteProfilePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firestore-utils';
import { doc, setDoc } from 'firebase/firestore';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uid = localStorage.getItem('pendingGoogleUid');
    const email = localStorage.getItem('pendingGoogleEmail');

    if (!uid || !email || !name.trim()) {
      setError('Invalid input. Please try again.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', uid), {
        name: name.trim(),
        email,
        darkMode: false,
      });

      localStorage.removeItem('pendingGoogleUid');
      localStorage.removeItem('pendingGoogleEmail');
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile creation error:', err);
      setError('Could not complete profile. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
