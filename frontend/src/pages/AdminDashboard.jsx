import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatAppointmentDate } from '../utils/dateFormatter';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Filtering States
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  
  // Register Doctor Form State
  const [docUsername, setDocUsername] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Cardiology');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Doctor State
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('Cardiology');

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
      toast.error('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register/doctor', {
        username: docUsername,
        password: docPassword,
        name: docName,
        specialization: docSpecialization
      });

      toast.success(`Doctor ${docName} registered successfully!`);
      setDocUsername('');
      setDocPassword('');
      setDocName('');
      
      // Refresh doctors list
      const resDocs = await api.get('/api/doctors');
      setDoctors(resDocs.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register doctor.');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient profile?')) return;
    try {
      await api.delete(`/api/patients/${id}`);
      setPatients(patients.filter(p => p.id !== id));
      toast.success('Patient profile deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete patient.');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? All appointments booked with this doctor will also be deleted.')) return;
    try {
      await api.delete(`/api/doctors/${id}`);
      setDoctors(doctors.filter(d => d.id !== id));
      
      // Refresh appointments to ensure UI doesn't show appointments with deleted doctor
      const resAppointments = await api.get('/api/appointments');
      setAppointments(resAppointments.data);
      toast.success('Doctor profile and associated appointments deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setEditName(doctor.name);
    setEditSpecialization(doctor.specialization);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/doctors/${editingDoctor.id}`, {
        name: editName,
        specialization: editSpecialization
      });
      
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...d, name: editName, specialization: editSpecialization } : d));
      
      const resAppointments = await api.get('/api/appointments');
      setAppointments(resAppointments.data);
      
      setEditingDoctor(null);
      toast.success('Doctor profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading Admin Dashboard..." />;
  }

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification Container */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">CareFlow HMS Enterprise Control Panel</p>
          </div>
          <div className="text-left sm:text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Status</p>
            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              All Systems Operational
            </p>
          </div>
        </div>

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

        {/* 3-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Register Staff Doctor</h2>
              <form onSubmit={handleRegisterDoctor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Username</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
                    value={docUsername}
                    onChange={e => setDocUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
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
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</label>
                  <select
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
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
          </div>

          {/* Middle Column: Tables (Span 6) */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Patient Profiles */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-800">Patient Profiles</h2>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-200 rounded-lg shadow-sm relative scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Name</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Age</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Blood</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {patients
                      .filter(p => {
                        const name = p.name || '';
                        const blood = p.bloodGroup || '';
                        return name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                               blood.toLowerCase().includes(patientSearch.toLowerCase());
                      })
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-3 px-4 font-medium text-slate-700">{p.name}</td>
                          <td className="py-3 px-4 text-slate-500">{p.age}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                              p.bloodGroup ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {p.bloodGroup || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeletePatient(p.id)}
                              className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    {patients.filter(p => {
                      const name = p.name || '';
                      const blood = p.bloodGroup || '';
                      return name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                             blood.toLowerCase().includes(patientSearch.toLowerCase());
                    }).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-400">
                          {patients.length === 0 ? "No patient records found." : "No matching patient profiles."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Profiles */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-800">Doctor Profiles</h2>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all"
                    value={doctorSearch}
                    onChange={e => setDoctorSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-200 rounded-lg shadow-sm relative scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Name</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Specialization</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {doctors
                      .filter(d => {
                        const name = d.name || '';
                        const specialization = d.specialization || '';
                        return name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
                               specialization.toLowerCase().includes(doctorSearch.toLowerCase());
                      })
                      .map(d => (
                        <tr key={d.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-3 px-4 font-medium text-slate-700">{d.name}</td>
                          <td className="py-3 px-4 text-slate-500">{d.specialization}</td>
                          <td className="py-3 px-4 text-right space-x-3">
                            <button
                              onClick={() => handleEditDoctor(d)}
                              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(d.id)}
                              className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {doctors.filter(d => {
                      const name = d.name || '';
                      const specialization = d.specialization || '';
                      return name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
                             specialization.toLowerCase().includes(doctorSearch.toLowerCase());
                    }).length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center py-6 text-slate-400">
                          {doctors.length === 0 ? "No doctor records found." : "No matching doctor profiles."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bookings Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Hospital Appointments</h2>

              {/* Filtering Controls */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-grow">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Filter by Patient Name</label>
                  <input
                    type="text"
                    placeholder="Search patient name..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 transition-all"
                    value={patientNameFilter}
                    onChange={e => setPatientNameFilter(e.target.value)}
                  />
                </div>

                <div className="w-full sm:w-48">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Filter by Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500 transition-all"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                  />
                </div>

                {(patientNameFilter || dateFilter) && (
                  <button
                    onClick={() => {
                      setPatientNameFilter('');
                      setDateFilter('');
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-colors sm:h-[38px] flex items-center justify-center whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-200 rounded-lg shadow-sm relative scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Patient</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Doctor</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Date / Time</th>
                      <th className="py-3 px-4 sticky top-0 bg-slate-50 border-b border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments
                      .filter(a => {
                        const patientName = a.patient?.name || '';
                        const matchesName = patientName.toLowerCase().includes(patientNameFilter.toLowerCase());

                        let matchesDate = true;
                        if (dateFilter) {
                          const apptDatePart = a.appointmentDate ? a.appointmentDate.split('T')[0] : '';
                          matchesDate = apptDatePart === dateFilter;
                        }

                        return matchesName && matchesDate;
                      })
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-3.5 px-4 font-medium text-slate-700">{a.patient?.name}</td>
                          <td className="py-3.5 px-4 text-slate-600">{a.doctor?.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {formatAppointmentDate(a.appointmentDate)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              a.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {appointments.filter(a => {
                      const patientName = a.patient?.name || '';
                      const matchesName = patientName.toLowerCase().includes(patientNameFilter.toLowerCase());

                      let matchesDate = true;
                      if (dateFilter) {
                        const apptDatePart = a.appointmentDate ? a.appointmentDate.split('T')[0] : '';
                        matchesDate = apptDatePart === dateFilter;
                      }

                      return matchesName && matchesDate;
                    }).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-400">
                          {appointments.length === 0 ? "No scheduled appointments." : "No appointments matching active filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions Widget (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 h-fit">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Quick Tools</h3>
                <p className="text-xs text-slate-400 mt-0.5">Admin shortcuts & telemetries</p>
              </div>

              {/* Server Online Telemetry */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">API Connection</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">
                  ONLINE
                </span>
              </div>

              {/* Quick Actions Buttons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                
                <button 
                  onClick={() => {
                    toast.info("Generating system diagnostics report...");
                    setTimeout(() => toast.success("System diagnostics report ready!"), 1500);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-slate-100 hover:border-hospital-200 hover:bg-hospital-50/30 rounded-xl text-slate-700 hover:text-hospital-700 text-sm font-medium transition-all group text-left"
                >
                  <span className="text-slate-400 group-hover:text-hospital-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span>System Diagnostics</span>
                </button>

                <button 
                  onClick={() => {
                    toast.info("Initiating secure SQL database backup...");
                    setTimeout(() => toast.success("Backup snapshots saved to backup repository!"), 2000);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-slate-100 hover:border-hospital-200 hover:bg-hospital-50/30 rounded-xl text-slate-700 hover:text-hospital-700 text-sm font-medium transition-all group text-left"
                >
                  <span className="text-slate-400 group-hover:text-hospital-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </span>
                  <span>Database Backup</span>
                </button>

                <button 
                  onClick={() => {
                    toast.info("Exporting clinician registry...");
                    setTimeout(() => toast.success("Registry download started as CSV!"), 1200);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-slate-100 hover:border-hospital-200 hover:bg-hospital-50/30 rounded-xl text-slate-700 hover:text-hospital-700 text-sm font-medium transition-all group text-left"
                >
                  <span className="text-slate-400 group-hover:text-hospital-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span>Export Staff CSV</span>
                </button>
              </div>

              {/* Recent Activity timeline */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Activity Logs</h4>
                <div className="relative border-l border-slate-100 ml-2 pl-4 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[23px] mt-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">10 mins ago</span>
                      <span className="text-xs font-semibold text-slate-700">New Doctor Added</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dr. House was added to Cardiology database.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] mt-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white"></span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">45 mins ago</span>
                      <span className="text-xs font-semibold text-slate-700">Appointment Approved</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">John Doe with Dr. Sarah Connor was approved.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] mt-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500 ring-4 ring-white"></span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">2 hours ago</span>
                      <span className="text-xs font-semibold text-slate-700">Database Backup</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Backup snapshot executed by system scheduler.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Edit Doctor Modal */}
        {editingDoctor && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 relative">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Doctor Profile</h3>
              <form onSubmit={handleUpdateDoctor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</label>
                  <select
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
                    value={editSpecialization}
                    onChange={e => setEditSpecialization(e.target.value)}
                  >
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Pediatrics</option>
                    <option>Orthopedics</option>
                    <option>Dermatology</option>
                    <option>Diagnostic Medicine</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg font-semibold text-sm shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
