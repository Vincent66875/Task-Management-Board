import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../firebase-auth';
import { db, auth } from '../firebase/firestore-utils';
import { doc, setDoc } from 'firebase/firestore';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage or default
  useEffect(() => {
    const darkModePref = localStorage.getItem('darkMode');
    if (darkModePref === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      return next;
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signUpWithEmail(email, password);
      const uid = userCredential.uid;
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        darkMode: isDarkMode,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Sign-up failed. Try a different email.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded bg-gray-300 dark:bg-gray-600 text-black dark:text-white absolute top-4 right-4"
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className={`p-8 rounded-xl shadow-md w-full max-w-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className={`w-full p-3 border rounded-xl ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className={`w-full p-3 border rounded-xl ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full p-3 border rounded-xl ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Already have an account?{' '}
            <a href="/" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
