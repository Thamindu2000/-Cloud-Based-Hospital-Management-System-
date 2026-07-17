import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { accessToken, role, profileId } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', role);
      
      if (profileId) {
        localStorage.setItem('profileId', profileId.toString());
      }

      // Dispatch event to trigger navbar update immediately
      window.dispatchEvent(new Event('profileUpdate'));

      // Redirect depending on authentication roles
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_DOCTOR') {
        navigate('/doctor');
      } else if (role === 'ROLE_PATIENT') {
        navigate('/patient');
      } else {
        setError('Invalid role assignment.');
        localStorage.clear();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential,
      });

      const { accessToken, role, profileId } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', role);
      
      if (profileId) {
        localStorage.setItem('profileId', profileId.toString());
      }

      // Dispatch event to trigger navbar update immediately
      window.dispatchEvent(new Event('profileUpdate'));

      // Redirect depending on authentication roles
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_DOCTOR') {
        navigate('/doctor');
      } else if (role === 'ROLE_PATIENT') {
        navigate('/patient');
      } else {
        setError('Invalid role assignment.');
        localStorage.clear();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Google Authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <>
      {loading && <LoadingScreen fullPage message="Authenticating credentials..." />}
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <div className="flex justify-center">
            <div className="bg-hospital-100 p-3 rounded-full">
              <svg className="w-12 h-12 text-hospital-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            CareFlow Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Hospital Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 transition-all text-sm"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hospital-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-600">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-hospital-600 hover:text-hospital-700 underline">
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  </PageTransition>
</>
);
};

export default Login;
