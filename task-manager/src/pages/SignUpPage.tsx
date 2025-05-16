import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../firebase-auth';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUpWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Sign-up failed. Try a different email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-xl"
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
