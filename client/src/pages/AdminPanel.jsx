import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Droplets, LogOut, Users, Activity, Building2, CheckCircle, AlertTriangle, Shield, RefreshCw, Warehouse, Trash2, MapPin } from 'lucide-react';

const formatBloodType = (bt) => bt?.replace('_POS', '+').replace('_NEG', '-') || bt;

const AdminPanel = () => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, hospitalsRes, bloodBanksRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/donors`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/hospitals`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/blood-banks`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/requests`, config)
      ]);
      setStats(statsRes.data.data);
      setDonors(donorsRes.data.data);
      setHospitals(hospitalsRes.data.data);
      setBloodBanks(bloodBanksRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      toast.error('Failed to sync system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, config);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const readinessColor = (score) => score >= 71 ? 'text-emerald-600 bg-emerald-50' : score >= 41 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-secondary text-lg uppercase tracking-tighter">RaktSetu <span className="text-primary">Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-xl transition">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Global Command Center</h1>
            <p className="text-gray-500 mt-1">Real-time oversight of the RaktSetu life-saving network.</p>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-full shadow-sm text-sm font-bold text-emerald-600 border border-emerald-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NETWORK ACTIVE
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5" />} label="Donors" value={stats.totalDonors} color="text-primary bg-red-50" />
            <StatCard icon={<Building2 className="w-5 h-5" />} label="Hospitals" value={stats.totalHospitals} color="text-blue-600 bg-blue-50" />
            <StatCard icon={<Activity className="w-5 h-5" />} label="Requests" value={stats.activeRequests} color="text-amber-600 bg-amber-50" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Saves" value={stats.fulfilledRequests} color="text-emerald-600 bg-emerald-50" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-fit">
          {[
            { id: 'overview', label: 'Requests' },
            { id: 'donors', label: 'Donors' },
            { id: 'hospitals', label: 'Hospitals' },
            { id: 'blood-banks', label: 'Blood Banks' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t.id ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <RefreshCw className="w-10 h-10 animate-spin" />
            <p className="font-bold uppercase tracking-widest text-xs">Syncing Global Data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {tab === 'overview' && (
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Hospital</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Blood</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Units</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Urgency</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Status</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="font-bold text-sm text-secondary">{req.hospital?.name}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.hospital?.district}</div>
                        </td>
                        <td className="p-4 font-black text-primary">{formatBloodType(req.bloodType)}</td>
                        <td className="p-4 font-bold text-secondary text-sm">{req.units}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            req.urgency === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' :
                            req.urgency === 'URGENT' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'
                          }`}>{req.urgency}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            req.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'MATCHED' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                          }`}>{req.status}</span>
                        </td>
                        <td className="p-4 text-xs text-gray-400 font-medium">{new Date(req.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'donors' && (
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Donor Name</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Blood</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Availability</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Readiness</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Reliability</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {donors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="font-bold text-sm text-secondary">{donor.name}</div>
                          <div className="text-[10px] text-gray-400">{donor.phone}</div>
                        </td>
                        <td className="p-4 font-black text-secondary">{formatBloodType(donor.bloodType)}</td>
                        <td className="p-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${donor.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                             {donor.isAvailable ? 'ONLINE' : 'OFFLINE'}
                           </span>
                        </td>
                        <td className="p-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${readinessColor(donor.readinessScore)}`}>
                             {Math.round(donor.readinessScore)}%
                           </span>
                        </td>
                        <td className="p-4 text-sm font-black text-blue-600">{Math.round(donor.reliabilityScore)}</td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteUser(donor.userId, donor.name)} className="p-2 text-gray-300 hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {(tab === 'hospitals' || tab === 'blood-banks') && (
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Entity Name</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Location</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Contact</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Joined</th>
                      <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(tab === 'hospitals' ? hospitals : bloodBanks).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-bold text-sm text-secondary">{item.name}</td>
                        <td className="p-4 text-xs text-gray-500 font-medium">{item.address}, {item.district || ''}</td>
                        <td className="p-4 text-xs text-gray-400 font-mono">{item.phone}</td>
                        <td className="p-4 text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button onClick={() => handleDeleteUser(item.userId, item.name)} className="p-2 text-gray-300 hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-4xl font-black text-secondary tracking-tighter">{value || 0}</div>
    <div className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default AdminPanel;
