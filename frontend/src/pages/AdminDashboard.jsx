import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatAppointmentDate } from '../utils/dateFormatter';

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Register Doctor Form State
  const [docUsername, setDocUsername] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Cardiology');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [resPatients, resAppointments, resDoctors] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/appointments'),
        api.get('/api/doctors')
      ]);
      setPatients(resPatients.data);
      setAppointments(resAppointments.data);
      setDoctors(resDoctors.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      await api.post('/api/auth/register/doctor', {
        username: docUsername,
        password: docPassword,
        name: docName,
        specialization: docSpecialization
      });

      setFormSuccess(`Doctor ${docName} registered successfully!`);
      setDocUsername('');
      setDocPassword('');
      setDocName('');
      
      // Refresh doctors list
      const resDocs = await api.get('/api/doctors');
      setDoctors(resDocs.data);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register doctor.');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient profile?')) return;
    try {
      await api.delete(`/api/patients/${id}`);
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hospital-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Appointments</p>
            <h3 className="text-2xl font-bold text-slate-800">{appointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Staff Doctors</p>
            <h3 className="text-2xl font-bold text-slate-800">{doctors.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Doctor Creation Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Register Staff Doctor</h2>
          
          {formError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <p className="text-xs text-red-700">{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-md">
              <p className="text-xs text-green-700">{formSuccess}</p>
            </div>
          )}

          <form onSubmit={handleRegisterDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Username</label>
              <input
                type="text"
                required
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={docUsername}
                onChange={e => setDocUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
              <input
                type="password"
                required
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={docPassword}
                onChange={e => setDocPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Name"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={docName}
                onChange={e => setDocName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</label>
              <select
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={docSpecialization}
                onChange={e => setDocSpecialization(e.target.value)}
              >
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>Diagnostic Medicine</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg font-semibold text-sm shadow-md transition-colors"
            >
              Add Doctor
            </button>
          </form>
        </div>

        {/* Right column: Tables */}
        <div className="lg:col-span-2 space-y-8">
          {/* Patient Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Profiles</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Age</th>
                    <th className="pb-3">Blood</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-medium text-slate-700">{p.name}</td>
                      <td className="py-3.5 text-slate-500">{p.age}</td>
                      <td className="py-3.5">
                        <span className="bg-red-50 text-red-600 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeletePatient(p.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">No patient records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings Tracker */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Hospital Appointments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3">Date / Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td className="py-3.5 font-medium text-slate-700">{a.patient?.name}</td>
                      <td className="py-3.5 text-slate-600">{a.doctor?.name}</td>
                      <td className="py-3.5 text-slate-500">
                        {formatAppointmentDate(a.appointmentDate)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          a.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                          a.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">No scheduled appointments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
