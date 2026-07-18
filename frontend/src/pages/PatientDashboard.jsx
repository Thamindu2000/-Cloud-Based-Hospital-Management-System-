import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatAppointmentDate } from '../utils/dateFormatter';
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const patientId = localStorage.getItem('profileId');
  const username = localStorage.getItem('username');

  // Local Data State
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scans, setScans] = useState([]);

  // Form Booking State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');

  // Upload scan State
  const [scanFile, setScanFile] = useState(null);
  const [scanDesc, setScanDesc] = useState('');

  // Editing profile state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editBlood, setEditBlood] = useState('O+');
  const [editHistory, setEditHistory] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const fetchDashboardData = async () => {
    try {
      const [resProfile, resAppts, resDocs, resScans] = await Promise.all([
        api.get(`/api/patients/${patientId}`),
        api.get(`/api/appointments/patient/${patientId}`),
        api.get('/api/doctors'),
        api.get(`/api/medical-images/patient/${patientId}`)
      ]);

      setProfile(resProfile.data);
      setAppointments(resAppts.data);
      setDoctors(resDocs.data);
      setScans(resScans.data);

      // Prepopulate edit forms
      setEditName(resProfile.data.name);
      setEditAge(resProfile.data.age);
      setEditBlood(resProfile.data.bloodGroup);
      setEditHistory(resProfile.data.medicalHistory);

      if (resDocs.data.length > 0) {
        setSelectedDoctorId(resDocs.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to sync patient portal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [patientId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    try {
      const response = await api.put(`/api/patients/${patientId}`, {
        name: editName,
        age: parseInt(editAge, 10),
        bloodGroup: editBlood,
        medicalHistory: editHistory
      });
      setProfile(response.data);
      setSuccessMsg('Medical record profile updated successfully!');
    } catch (err) {
      setError('Failed to update details.');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    if (!appointmentDate) {
      setError('Please select an appointment time.');
      return;
    }

    try {
      const formattedDate = appointmentDate.includes(':') && appointmentDate.split(':').length === 2
        ? `${appointmentDate}:00`
        : appointmentDate;

      const response = await api.post('/api/appointments/book', {
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(selectedDoctorId, 10),
        appointmentDate: formattedDate
      });

      setAppointments([...appointments, response.data]);
      setSuccessMsg('Appointment booked successfully!');
      setAppointmentDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    if (!scanFile) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('file', scanFile);
    formData.append('description', scanDesc);

    try {
      const response = await api.post('/api/medical-images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setScans([response.data, ...scans]);
      setSuccessMsg('Medical scan uploaded and simulated on S3 successfully!');
      setScanDesc('');
      setScanFile(null);
      // Reset file input element
      document.getElementById('scanFileInput').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Syncing Patient Records..." />;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome, {profile?.name}</h1>
            <p className="text-sm text-slate-500">Patient Dashboard & Booking Portal</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Profile Card & Book Form */}
          <div className="space-y-6">
            {/* Medical Records / Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Personal Health Card</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</label>
                    <input
                      type="number"
                      required
                      className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      value={editAge}
                      onChange={e => setEditAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Blood Group</label>
                    <select
                      className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                      value={editBlood || ''}
                      onChange={e => setEditBlood(e.target.value)}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical History</label>
                  <textarea
                    rows="3"
                    className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                    value={editHistory}
                    onChange={e => setEditHistory(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg font-semibold text-sm shadow transition-colors"
                >
                  Save Profile
                </button>
              </form>
            </div>

            {/* Book Appointment Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Book Appointment</h2>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Specialist</label>
                  <select
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                    {doctors.length === 0 && (
                      <option disabled>No doctors available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointment Date & Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={doctors.length === 0}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm shadow disabled:opacity-50 transition-colors"
                >
                  Book Appointment
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Appointments & Medical Scans */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheduled Appointments */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">My Booked Appointments</h2>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-b-lg">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 sticky top-0 z-10 bg-white">Doctor</th>
                      <th className="pb-3 sticky top-0 z-10 bg-white">Specialization</th>
                      <th className="pb-3 sticky top-0 z-10 bg-white">Date / Time</th>
                      <th className="pb-3 sticky top-0 z-10 bg-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td className="py-3.5 font-medium text-slate-700">{a.doctor?.name}</td>
                        <td className="py-3.5 text-slate-500">{a.doctor?.specialization}</td>
                        <td className="py-3.5 text-slate-500">
                          {formatAppointmentDate(a.appointmentDate)}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
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

            {/* Medical Scans Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">AWS S3 Medical Scan Storage</h2>

              {/* File Upload Form */}
              <form onSubmit={handleFileUpload} className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Scan Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest X-Ray, Brain MRI scan"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                    value={scanDesc}
                    onChange={e => setScanDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select File</label>
                  <input
                    id="scanFileInput"
                    type="file"
                    required
                    accept="image/*,.pdf"
                    className="w-full text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-hospital-50 file:text-hospital-700 hover:file:bg-hospital-100"
                    onChange={e => setScanFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="submit"
                  className="py-1.5 px-4 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg font-semibold text-sm shadow transition-colors"
                >
                  Upload File
                </button>
              </form>

              {/* List of uploaded files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scans.map(s => (
                  <div key={s.id} className="p-4 border border-slate-100 rounded-xl bg-white flex justify-between items-center hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700 text-sm">{s.description}</p>
                      <p className="text-xs text-slate-400">
                        Uploaded: {new Date(s.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewFile(s.fileUrl)}
                      className="text-xs font-bold text-hospital-600 hover:text-hospital-800 border border-hospital-200 rounded-lg px-3 py-1.5 bg-hospital-50 hover:bg-hospital-100 transition-colors cursor-pointer"
                    >
                      View File
                    </button>
                  </div>
                ))}
                {scans.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-slate-400">
                    No medical scan records uploaded to S3 mock.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default PatientDashboard;
