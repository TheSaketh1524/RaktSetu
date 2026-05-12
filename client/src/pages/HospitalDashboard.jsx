import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { database, ref, onValue, off } from '../firebase/config';
import { Droplets, Plus, LogOut, Activity, Package, CheckCircle, RefreshCw, User, Phone, Users } from 'lucide-react';
import FreshnessIndicator from '../components/FreshnessIndicator';

const formatBloodType = (bt) => bt?.replace('_POS', '+').replace('_NEG', '-') || bt;

function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' mins ago';
  return 'just now';
}

function getAcceptedDonors(request) {
  if (!request?.alerts) return [];
  return request.alerts
    .filter(a => a.response?.response === 'ACCEPTED')
    .map(a => ({
      ...a.donor,
      respondedAt: a.response?.respondedAt,
      alertId: a.id
    }));
}

function RequestCard({ request, onFulfill, onCancel, fulfillingId }) {
  const accepted = getAcceptedDonors(request);
  const pending = request.alerts?.filter(a => !a.response) || [];
  const canAct = ['OPEN', 'MATCHED'].includes(request.status);

  const urgencyConfig = {
    CRITICAL: {
      bg: 'bg-red-500', text: 'text-white',
      border: 'border-red-300', label: '🔴 CRITICAL',
      pulse: true
    },
    URGENT: {
      bg: 'bg-amber-400', text: 'text-gray-900',
      border: 'border-amber-300', label: '🟡 URGENT',
      pulse: false
    },
    SCHEDULED: {
      bg: 'bg-green-500', text: 'text-white',
      border: 'border-green-300', label: '🟢 SCHEDULED',
      pulse: false
    }
  };

  const statusConfig = {
    OPEN:      { bg: 'bg-blue-100',  text: 'text-blue-700',  label: '● Open' },
    MATCHED:   { bg: 'bg-teal-100',  text: 'text-teal-700',  label: '✓ Matched' },
    FULFILLED: { bg: 'bg-gray-100',  text: 'text-gray-600',  label: '✓ Fulfilled' },
    CANCELLED: { bg: 'bg-red-100',   text: 'text-red-600',   label: '✗ Cancelled' },
    EXPIRED:   { bg: 'bg-gray-100',  text: 'text-gray-400',  label: 'Expired' }
  };

  const urg = urgencyConfig[request.urgency] || urgencyConfig.URGENT;
  const stat = statusConfig[request.status] || statusConfig.OPEN;

  return (
    <div className={`border-2 rounded-xl p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-shadow ${urg.border}`}>
      {/* TOP ROW: Urgency + Blood Type + Time + Status */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${urg.bg} ${urg.text} ${urg.pulse ? 'animate-pulse' : ''}`}>
            {urg.label}
          </span>
          <span className="px-2.5 py-1 bg-navy text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#0B1F3A' }}>
            {formatBloodType(request.bloodType)}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo(request.createdAt)}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}>
          {stat.label}
        </span>
      </div>

      {/* MIDDLE ROW: Request details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-400 text-xs">Units needed</span>
          <p className="font-semibold text-gray-800">{request.units} unit(s)</p>
        </div>
        {request.patientName && (
          <div>
            <span className="text-gray-400 text-xs">Patient</span>
            <p className="font-semibold text-gray-800">{request.patientName}</p>
          </div>
        )}
        {request.notes && (
          <div className="col-span-2">
            <span className="text-gray-400 text-xs">Notes</span>
            <p className="text-gray-600 text-xs">{request.notes}</p>
          </div>
        )}
      </div>

      {/* DONOR SECTION */}
      <div className="pt-3 border-t border-gray-100">
        {request.alerts
          ?.filter(a => a.response?.response === 'ACCEPTED')
          .map(a => (
            <div key={a.id} className="flex items-center
                                        justify-between bg-teal-50
                                        rounded-lg px-3 py-2 mt-2">
              <span className="text-sm font-medium">
                ✅ {a.donor?.name} —
                Readiness: {a.donor?.readinessScore}/100
              </span>
              {request.status !== 'FULFILLED' && (
                <button
                  onClick={() => onFulfill(
                    request.id, a.donor.id, a.donor.name
                  )}
                  className="bg-teal-500 text-white text-xs
                             px-3 py-1 rounded-lg font-bold"
                >
                  ✓ Mark Fulfilled
                </button>
              )}
            </div>
          ))
        }

        {request.alerts?.filter(a => a.response?.response === 'ACCEPTED')
          .length === 0 && (
          <p className="text-xs text-gray-400 mt-2 italic">
            ⏳ Awaiting response —
            {request.alerts?.length || 0} donors alerted
          </p>
        )}
      </div>

      {/* CANCEL BUTTON */}
      {canAct && (
        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-end">
          <button
            onClick={() => onCancel(request.id)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            ✗ Cancel Request
          </button>
        </div>
      )}
    </div>
  );
}

const HospitalDashboard = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [stats, setStats] = useState({ totalRequestsThisMonth: 0, fulfilledCount: 0, openCount: 0, matchedCount: 0, avgResponseTimeMins: 0 });
  const [realtimeMatches, setRealtimeMatches] = useState({});
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ bloodType: 'O_POS', units: 5 });
  const [requestFilter, setRequestFilter] = useState('ALL');
  const [fulfillingId, setFulfillingId] = useState(null);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = useAuthStore.getState().token;
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/hospitals/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data?.success) {
        const { activeRequests, inventory, profile, stats } = res.data.data;
        setRequests(activeRequests || []);
        setInventory(inventory || []);
        setHospitalProfile(profile);
        setStats(stats || { totalRequestsThisMonth: 0, fulfilledCount: 0, openCount: 0, matchedCount: 0, avgResponseTimeMins: 0 });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location.key]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, location.key]);

  // ── Firebase: Listen for real-time matched donor notifications ──
  useEffect(() => {
    if (!hospitalProfile?.id) return;

    const matchedRef = ref(database, `matched/${hospitalProfile.id}`);
    const unsubscribe = onValue(matchedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRealtimeMatches(data);
        const matchCount = Object.keys(data).length;
        if (matchCount > 0) {
          fetchData();
        }
      }
    });

    const requestsRef = ref(database, `requests/${hospitalProfile.id}`);
    const unsubRequests = onValue(requestsRef, () => {
      fetchData(); // Refresh when request status changes
    });

    return () => {
      off(matchedRef);
      off(requestsRef);
    };
  }, [hospitalProfile?.id]);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const handleMarkFulfilled = async (requestId, donorId, donorName) => {
    if (!window.confirm(`Mark fulfilled by ${donorName}?`)) return;
    const token = useAuthStore.getState().token;
    await axios.put(
      `${import.meta.env.VITE_API_URL}/blood-requests/${requestId}`,
      { status: 'FULFILLED', fulfilledByDonorId: donorId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(`✅ Fulfilled by ${donorName}`);
    fetchData();
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/blood-requests/${requestId}`, { status: 'CANCELLED' }, config);
      toast.success('Request cancelled successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  const updateInventoryItem = async (bloodType, newUnits) => {
    if (newUnits < 0) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/inventory/${hospitalProfile.id}`,
        { bloodType, units: newUnits }, config);
      toast.success('Inventory updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to update inventory');
    }
  };

  const openRequests = requests.filter(r => r.status === 'OPEN');
  const matchedRequests = requests.filter(r => r.status === 'MATCHED');
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED');

  const filteredRequests = requests.filter(r => requestFilter === 'ALL' || r.status === requestFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-secondary text-lg">RaktSetu</span>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Hospital</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </div>
            <Link to="/hospital/request"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-red-700 transition shadow-lg shadow-red-500/20">
              <Plus className="w-4 h-4" /> Request Blood
            </Link>
            <Link to="/profile" className="p-2.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded-xl transition" title="Profile Settings">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-secondary">
              {hospitalProfile ? hospitalProfile.name : 'Hospital Dashboard'}
            </h1>
            <p className="text-gray-500 mt-1">Monitor blood requests, inventory, and donor responses in real-time.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition px-4 py-2 rounded-xl hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Refresh Now
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat icon={<Activity className="w-5 h-5" />} label="Open Requests" value={stats.openCount || openRequests.length} color="text-blue-600 bg-blue-50" />
          <QuickStat icon={<User className="w-5 h-5" />} label="Donor Matched" value={stats.matchedCount || matchedRequests.length} color="text-purple-600 bg-purple-50" />
          <QuickStat icon={<CheckCircle className="w-5 h-5" />} label="Monthly Fulfilled" value={stats.fulfilledCount || fulfilledRequests.length} color="text-success bg-emerald-50" />
          <QuickStat icon={<Package className="w-5 h-5" />} label="Inventory Items" value={inventory.length} color="text-amber-600 bg-amber-50" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* All Blood Requests */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-secondary mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> All Blood Requests
            </h2>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {['ALL', 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED'].map(f => (
                <button key={f} onClick={() => setRequestFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    requestFilter === f ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {f === 'ALL' ? `All (${requests.length})` :
                   f === 'OPEN' ? `Open (${openRequests.length})` :
                   f === 'MATCHED' ? `Matched (${matchedRequests.length})` :
                   f === 'FULFILLED' ? `Fulfilled (${fulfilledRequests.length})` :
                   `Cancelled`}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-400 font-medium">No requests yet</p>
                <Link to="/hospital/request" className="text-primary font-bold text-sm hover:underline mt-2 inline-block">Create your first request →</Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onFulfill={handleMarkFulfilled}
                    onCancel={handleCancelRequest}
                    fulfillingId={fulfillingId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Inventory Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Blood Inventory</span>
              <button onClick={() => setShowAddStock(!showAddStock)} 
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition">
                {showAddStock ? 'Cancel' : '+ Add Stock'}
              </button>
            </h2>

            {showAddStock && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-scale-in">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Type</label>
                    <select value={newStock.bloodType} onChange={(e) => setNewStock({...newStock, bloodType: e.target.value})}
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm">
                      {['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'].map(bt => (
                        <option key={bt} value={bt}>{formatBloodType(bt)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Units</label>
                    <input type="number" value={newStock.units} onChange={(e) => setNewStock({...newStock, units: parseInt(e.target.value)})}
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm" />
                  </div>
                </div>
                <button onClick={() => { updateInventoryItem(newStock.bloodType, newStock.units); setShowAddStock(false); }}
                  className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition">
                  Confirm Addition
                </button>
              </div>
            )}

            {inventory.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🩸</div>
                <p className="text-gray-400 font-medium">Inventory is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        item.units < 5 ? 'bg-red-100 text-red-700' : item.units < 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {formatBloodType(item.bloodType)}
                      </div>
                      <div>
                        <div className="font-bold text-secondary">{item.units} units</div>
                        <FreshnessIndicator date={item.lastUpdated} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <button onClick={() => updateInventoryItem(item.bloodType, item.units - 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200 transition">-</button>
                        <span className="px-3 py-1 font-bold text-sm text-secondary">{item.units}</span>
                        <button onClick={() => updateInventoryItem(item.bloodType, item.units + 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold border-l border-gray-200 transition">+</button>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        item.units < 5 ? 'bg-red-500 animate-pulse' : item.units < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      {icon}
    </div>
    <div className="text-3xl font-black text-secondary">{value}</div>
    <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
  </div>
);

export default HospitalDashboard;
