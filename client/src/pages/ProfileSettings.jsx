import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Phone, MapPin, Save, Shield, Map as MapIcon } from 'lucide-react';

const ProfileSettings = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    district: '',
    latitude: 0,
    longitude: 0,
    isAvailable: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const endpoint = user.role === 'DONOR' ? '/donors/me' : '/hospitals/dashboard';
      const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = user.role === 'DONOR' ? res.data.data : res.data.data.profile;
      
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        district: profile.district || '',
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0,
        isAvailable: profile.isAvailable ?? true
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = user.role === 'DONOR' ? '/donors/me' : '/hospitals/me';
      await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
      setTimeout(() => navigate(user.role === 'DONOR' ? '/donor' : '/hospital'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const getLiveLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Fetching live location...', { id: 'geo' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          toast.success('Location updated!', { id: 'geo' });
        },
        () => toast.error('Failed to get location', { id: 'geo' })
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={user.role === 'DONOR' ? '/donor' : '/hospital'} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-secondary transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-black text-secondary">Profile Settings</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
            <h1 className="text-2xl font-black text-secondary">Edit Information</h1>
            <p className="text-gray-500 text-sm mt-1">Keep your profile details up to date for better matching.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Full Name / Hospital Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="phone" value={form.phone} onChange={handleChange} required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Address / Area</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="address" value={form.address} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
            </div>

            {user.role === 'HOSPITAL' && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">District</label>
                <input name="district" value={form.district} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
            )}

            {user.role === 'DONOR' && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange}
                  className="w-5 h-5 accent-emerald-600 rounded" id="avail" />
                <label htmlFor="avail" className="text-sm font-bold text-emerald-800 cursor-pointer">Available for Emergencies</label>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-primary" /> Geolocation Data
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Latitude</label>
                  <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Longitude</label>
                  <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <button type="button" onClick={getLiveLocation}
                className="w-full py-3 bg-white border-2 border-dashed border-gray-200 text-gray-600 font-bold rounded-xl hover:border-primary hover:text-primary transition flex justify-center items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> Update from Live Location
              </button>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-4 bg-secondary text-white font-black rounded-2xl hover:bg-black transition shadow-xl shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? 'Saving Changes...' : <><Save className="w-5 h-5" /> Save Profile Info</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
