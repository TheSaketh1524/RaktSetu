import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { database, ref, onValue, off } from '../firebase/config';
import { Droplets, LogOut, Bell, Clock, ToggleLeft, ToggleRight, Heart, Calendar, TrendingUp, MapPin, Phone, CheckCircle, XCircle, Navigation, AlertTriangle, Activity, Shield, Volume2, User, RefreshCw, Building2 } from 'lucide-react';
import ReadinessGauge from '../components/ReadinessGauge';

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

const DonorDashboard = () => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [donor, setDonor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [acceptedHospital, setAcceptedHospital] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [showLiveBanner, setShowLiveBanner] = useState(false);
  const audioRef = useRef(null);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDonorData = async () => {
    try {
      const [donorRes, alertsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/donors/me`, config).catch(() => null),
        axios.get(`${import.meta.env.VITE_API_URL}/alerts/me`, config).catch(() => null),
      ]);
      if (donorRes?.data?.data) setDonor(donorRes.data.data);
      if (alertsRes?.data?.data) setAlerts(alertsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonorData(); }, [location.key]);

  // ── Firebase Real-Time Listener for new alerts ──
  useEffect(() => {
    if (!donor?.id) return;

    const alertsRef = ref(database, `alerts/${donor.id}`);
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseAlerts = Object.values(data);
        setLiveAlerts(firebaseAlerts);
        if (firebaseAlerts.length > 0) {
          setShowLiveBanner(true);
          toast('🔴 New blood request alert!', { icon: '🩸', duration: 5000 });
          fetchDonorData();
        }
      } else {
        setLiveAlerts([]);
      }
    });

    const notifRef = ref(database, `donor_notifications/${donor.id}`);
    onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifs = Object.values(data);
        const latest = notifs[notifs.length - 1];
        if (latest && latest.type === 'FULFILLED') {
          toast.success(`✅ ${latest.hospitalName} confirmed your donation!`, { duration: 6000 });
          fetchDonorData();
        }
      }
    });

    return () => {
      off(alertsRef);
      off(notifRef);
    };
  }, [donor?.id]);

  const toggleAvailability = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/donors/me/availability`,
        { isAvailable: !donor.isAvailable }, config);
      setDonor({ ...donor, isAvailable: !donor.isAvailable });
      toast.success(donor.isAvailable ? 'Now unavailable' : 'Now available!');
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleRespondToAlert = async (alertId, response) => {
    setRespondingTo(alertId);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/alerts/respond`,
        { alertId, response }, config);
      if (response === 'ACCEPTED' && res.data.data.hospitalDetails) {
        setAcceptedHospital(res.data.data.hospitalDetails);
      }
      fetchDonorData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!donor) return <div className="p-10 text-center">Donor profile not found.</div>;

  const pendingAlerts = alerts.filter(a => !a.hasResponded && a.bloodRequest?.status === 'OPEN');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-secondary text-lg">RaktSetu</span>
          </div>
          <div className="flex items-center gap-3">
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
        {/* LIVE ALERT BANNER */}
        {showLiveBanner && (
          <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-red-500/20 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Volume2 className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="font-black text-sm uppercase tracking-tighter">Emergency Alert</div>
                <div className="text-xs text-red-100">A hospital near you needs your blood type immediately!</div>
              </div>
            </div>
            <button onClick={() => setShowLiveBanner(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-secondary">Welcome, {donor.name} 👋</h1>
            <p className="text-gray-500 mt-1">Your life-saving contributions make a real difference.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-4 py-2 text-center border-r border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reliability</div>
              <div className="text-xl font-black text-blue-600">{Math.round(donor.reliabilityScore || 0)}</div>
            </div>
            <div className="px-4 py-2 text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Readiness</div>
              <div className="text-xl font-black text-primary">{donor.readinessScore}/100</div>
            </div>
          </div>
        </div>

        {/* ACTIVE MISSION SECTION */}
        {alerts.filter(a => a.responseType === 'ACCEPTED' && (a.bloodRequest?.status === 'OPEN' || a.bloodRequest?.status === 'MATCHED')).map(active => (
          <div key={active.id} className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 animate-pulse-subtle border-4 border-emerald-400/30">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Active Life-Saving Mission</h2>
                  <p className="text-emerald-100 text-sm">Proceed to hospital as soon as possible.</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                MATCHED
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-emerald-200" />
                  <div>
                    <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Hospital</div>
                    <div className="font-bold text-lg">{active.hospital?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-200" />
                  <div>
                    <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Address</div>
                    <div className="text-sm">{active.hospital?.address}, {active.hospital?.district}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-emerald-200" />
                  <div>
                    <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Requested Blood</div>
                    <div className="font-bold text-lg">{formatBloodType(active.bloodRequest?.bloodType)} — {active.bloodRequest?.units} Units</div>
                  </div>
                </div>
                {active.hospital?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-200" />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Contact</div>
                      <div className="text-sm font-bold">{active.hospital.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${active.hospital?.latitude},${active.hospital?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition shadow-lg"
            >
              <Navigation className="w-5 h-5" /> START NAVIGATION TO HOSPITAL
            </a>
          </div>
        ))}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Eligibility & Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-3xl p-6 border-2 transition-all hover:shadow-lg ${
                donor.isEligible ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  donor.isEligible ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'
                }`}>
                  {donor.isEligible ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-secondary text-lg">
                  {donor.isEligible ? 'Ready to Donate' : 'Eligibility Hold'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {donor.isEligible
                    ? 'Your current health and timing are optimal for donation.'
                    : `You'll be eligible to donate again in ${donor.daysUntilEligible} days.`}
                </p>
                {donor.lastDonationDate && (
                  <div className="mt-4 pt-4 border-t border-black/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Last: {new Date(donor.lastDonationDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-secondary text-lg">Health Snapshot</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="font-black text-primary text-base">{formatBloodType(donor.bloodType)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Saves</span>
                    <span className="font-bold text-secondary">{donor.totalDonations || 0} Lives</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Alerts */}
            {pendingAlerts.length > 0 ? (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-secondary flex items-center gap-2 px-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Emergency Requests Near You
                </h2>
                {pendingAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white rounded-3xl shadow-xl shadow-red-500/5 border border-red-100 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                       <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                         {alert.distanceKm} km away
                       </span>
                    </div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
                        <span className="text-xs font-bold leading-none">TYPE</span>
                        <span className="text-xl font-black">{formatBloodType(alert.bloodRequest?.bloodType)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase ${
                            alert.bloodRequest?.urgency === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                          }`}>
                            {alert.bloodRequest?.urgency}
                          </span>
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(alert.sentAt)}
                          </span>
                        </div>
                        <h4 className="font-black text-secondary text-lg">{alert.hospital?.name}</h4>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {alert.hospital?.address}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600 italic">
                      "Looking for {alert.bloodRequest?.units} unit(s) of {formatBloodType(alert.bloodRequest?.bloodType)} for {alert.bloodRequest?.patientName || 'an emergency patient'}."
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleRespondToAlert(alert.id, 'ACCEPTED')} 
                        disabled={respondingTo === alert.id || !donor.isEligible}
                        className="py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 disabled:opacity-50 transition transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        {respondingTo === alert.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> I Can Help</>}
                      </button>
                      <button 
                        onClick={() => handleRespondToAlert(alert.id, 'DECLINED')} 
                        disabled={respondingTo === alert.id}
                        className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                      >
                        Unable
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                <div className="text-5xl mb-4 grayscale opacity-30">🛡️</div>
                <h3 className="text-xl font-bold text-gray-400">No active alerts</h3>
                <p className="text-sm text-gray-400 mt-2">You will be notified immediately when someone nearby needs help.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Availability Control */}
            <div className={`rounded-3xl p-6 shadow-sm border transition-all ${donor.isAvailable ? 'bg-white border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</div>
                  <div className={`text-lg font-black ${donor.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {donor.isAvailable ? 'VISIBLE' : 'HIDDEN'}
                  </div>
                </div>
                <button onClick={toggleAvailability} className="transition transform active:scale-95">
                  {donor.isAvailable ? <ToggleRight className="w-14 h-14 text-emerald-500" /> : <ToggleLeft className="w-14 h-14 text-gray-300" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {donor.isAvailable 
                  ? "Hospitals within 30km can see your readiness and send alerts." 
                  : "You won't receive any emergency alerts while hidden."}
              </p>
            </div>

            {/* Readiness Score */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-50 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${donor.readinessScore}%` }} />
              </div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Readiness Level</div>
              <div className="relative inline-block mb-4">
                <Shield className="w-20 h-20 text-blue-50 opacity-10 absolute -top-4 -left-4 scale-150 rotate-12 group-hover:rotate-45 transition-transform" />
                <div className="text-5xl font-black text-secondary relative z-10">{donor.readinessScore}</div>
              </div>
              <p className="text-xs text-gray-500 px-4 leading-relaxed">
                Higher scores increase your priority in the matching engine.
              </p>
            </div>

            {/* Donation History List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-secondary text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> Donation Log
              </h3>
              <div className="space-y-3">
                {donor.donations?.length > 0 ? (
                  donor.donations.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-secondary truncate">{d.locationName}</div>
                        <div className="text-[10px] text-gray-400">{new Date(d.donatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-bold text-gray-300 uppercase italic">No history recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
