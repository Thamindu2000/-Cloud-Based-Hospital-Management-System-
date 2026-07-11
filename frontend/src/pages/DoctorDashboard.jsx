import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const doctorId = localStorage.getItem('profileId');

  const fetchData = async () => {
    try {
      const [resAppts, resPatients] = await Promise.all([
        api.get(`/api/appointments/doctor/${doctorId}`),
        api.get('/api/patients')
      ]);
      setAppointments(resAppts.data);
      setPatients(resPatients.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await api.put(`/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      // Update local state
      setAppointments(appointments.map(a => a.id === appointmentId ? response.data : a));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
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
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Doctor Dashboard</h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scheduled Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Age</th>
                    <th className="pb-3">Date / Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-medium text-slate-700">
                        <button
                          onClick={() => setSelectedPatient(a.patient)}
                          className="hover:underline text-hospital-600 text-left"
                        >
                          {a.patient?.name}
                        </button>
                      </td>
                      <td className="py-3.5 text-slate-500">{a.patient?.age}</td>
                      <td className="py-3.5 text-slate-500">
                        {new Date(a.appointmentDate).toLocaleString()}
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
                      <td className="py-3.5 text-right space-x-2">
                        {a.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'APPROVED')}
                              className="text-xs bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'CANCELLED')}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {a.status !== 'PENDING' && (
                          <span className="text-xs text-slate-400 font-medium">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">No scheduled appointments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Patients Database & History Lookups */}
        <div className="space-y-6">
          
          {/* Patient Details Cards */}
          {selectedPatient ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-hospital-100 relative">
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Profile</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-slate-800 font-medium text-base">{selectedPatient.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Age</span>
                    <span className="text-slate-800 font-medium">{selectedPatient.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold inline-block mt-0.5">
                      {selectedPatient.bloodGroup}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Medical History</span>
                  <p className="mt-1 bg-slate-50 p-3 rounded-lg text-slate-600 border border-slate-100 italic">
                    {selectedPatient.medicalHistory || 'No history provided.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Patient Registry</h2>
              <p className="text-sm text-slate-400 mb-4">
                Select a patient name from upcoming appointments to view their historical health records.
              </p>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {patients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="py-2.5 px-1 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-600 flex justify-between items-center"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-400">{p.age} yrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
