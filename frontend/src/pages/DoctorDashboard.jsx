import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatAppointmentDate } from '../utils/dateFormatter';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Scans Viewer States
  const [selectedPatientScans, setSelectedPatientScans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const viewPatientRecords = async (patientId) => {
    try {
      const res = await api.get(`/api/medical-images/patient/${patientId}`);
      setSelectedPatientScans(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching scans:", err);
    }
  };

  const handleViewFile = async (fileUrl) => {
    if (!fileUrl) return;
    const match = fileUrl.match(/\/api\/files\/.+/);
    const relativePath = match ? match[0] : fileUrl;

    toast.info("Loading medical file securely...");
    try {
      const response = await api.get(relativePath, {
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'] || 'application/pdf';
      const fileBlob = new Blob([response.data], { type: contentType });
      const objectUrl = window.URL.createObjectURL(fileBlob);
      window.open(objectUrl, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 5000);
      toast.success("File opened successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to open file. Please try again.");
    }
  };

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
    return <LoadingScreen message="Syncing Scheduled Appointments..." />;
  }

  return (
    <PageTransition>
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
            
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-b-lg">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 sticky top-0 z-10 bg-white">Patient</th>
                    <th className="pb-3 sticky top-0 z-10 bg-white">Age</th>
                    <th className="pb-3 sticky top-0 z-10 bg-white">Date / Time</th>
                    <th className="pb-3 sticky top-0 z-10 bg-white">Status</th>
                    <th className="pb-3 text-right sticky top-0 z-10 bg-white">Actions</th>
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
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className="py-2.5 px-1 hover:bg-slate-50 text-sm font-medium text-slate-600 flex justify-between items-center"
                  >
                    <span onClick={() => setSelectedPatient(patient)} className="cursor-pointer hover:underline">{patient.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400">{patient.age} yrs</span>
                      <button 
                        onClick={() => viewPatientRecords(patient.id)}
                        className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded hover:bg-sky-200 transition-colors"
                      >
                        View Records
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Patient Medical Records Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Patient Medical Records</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {selectedPatientScans.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 text-sm">{s.description}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Uploaded: {new Date(s.uploadedAt).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleViewFile(s.fileUrl)}
                    className="text-xs font-bold text-hospital-600 hover:text-hospital-800 border border-hospital-200 rounded-lg px-3 py-1.5 bg-white hover:bg-hospital-50 transition-colors shadow-sm cursor-pointer"
                  >
                    View File
                  </button>
                </div>
              ))}
              {selectedPatientScans.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No medical scan records found for this patient.
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-950 text-white font-semibold py-2.5 rounded-xl shadow-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </PageTransition>
);
};

export default DoctorDashboard;
