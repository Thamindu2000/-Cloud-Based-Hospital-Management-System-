import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
  });
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/admin/profile');
      setFormData({
        username: response.data.username || '',
        fullName: response.data.fullName || '',
      });
      if (response.data.profilePictureUrl) {
        setPreviewUrl(response.data.profilePictureUrl);
      }
      setFetching(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data.');
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('fullName', formData.fullName);
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      const response = await api.put('/api/admin/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update stored username in localStorage
      localStorage.setItem('username', response.data.username);

      setSuccess('Profile updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingScreen fullPage message="Loading Admin Profile..." />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Admin Profile Management</h2>
              <p className="mt-1 text-sm text-slate-500">Update your account credentials and personal details</p>
            </div>
            <Link to="/admin" className="text-hospital-600 hover:text-hospital-700 text-sm font-semibold flex items-center space-x-1">
              <span>&larr; Back to Dashboard</span>
            </Link>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-200 block text-center">
                  <span>Upload New Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-hospital-500"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminProfile;
