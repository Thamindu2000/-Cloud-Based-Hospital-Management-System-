import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    age: '',
    bloodGroup: '',
    medicalHistory: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    const result = zxcvbn(password);
    const score = result.score;
    if (score <= 1) {
      return { label: 'Weak', color: 'text-red-500' };
    } else if (score === 2) {
      return { label: 'Medium', color: 'text-orange-500' };
    } else {
      return { label: 'Strong', color: 'text-green-500' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/register/patient', {
        username: formData.username,
        password: formData.password,
        name: formData.fullName,
        age: parseInt(formData.age, 10),
        bloodGroup: formData.bloodGroup,
        medicalHistory: formData.medicalHistory,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Registration failed. Username may already be in use.';
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMsg = err.response.data.errors
            .map((e) => e.defaultMessage)
            .filter(Boolean)
            .join(', ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <>
      {loading && <LoadingScreen fullPage message="Creating account..." />}
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-slate-900">
                Patient Registration
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                Create an account to book appointments and view scans
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {strength && (
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className={`font-semibold ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Age</label>
                    <input
                      name="age"
                      type="number"
                      required
                      min="1"
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Blood Group</label>
                    <select
                      name="bloodGroup"
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-hospital-500"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Unknown</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Medical History</label>
                <textarea
                  name="medicalHistory"
                  rows="3"
                  className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                  placeholder="List any past surgeries, chronic illnesses, or drug allergies..."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-hospital-600 hover:text-hospital-700 underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Register;
