import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Droplets, ArrowRight, ArrowLeft, User, Building2, Warehouse, MapPin } from 'lucide-react';

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

const formatBloodType = (bt) => bt.replace('_POS', '+').replace('_NEG', '-');

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '',
    bloodType: 'O_POS', latitude: 17.385, longitude: 78.4867,
    address: '', district: '', lastDonationDate: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        role,
        name: form.name,
        phone: form.phone,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address || 'Hyderabad',
        ...(role === 'DONOR' && { bloodType: form.bloodType, lastDonationDate: form.lastDonationDate || undefined }),
        ...(role === 'HOSPITAL' && { district: form.district || 'Hyderabad' }),
      };

      const regRes = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload);
      toast.success('Account created! Welcome to RaktSetu');

      // Use the token and user data from registration response
      login(regRes.data.data.user, regRes.data.data.token);

      if (role === 'HOSPITAL') navigate('/hospital');
      else if (role === 'DONOR') navigate('/donor');
      else if (role === 'BLOOD_BANK') navigate('/blood-bank');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg[0].message || 'Validation failed');
      } else {
        toast.error(msg || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'DONOR', icon: <User className="w-8 h-8" />, title: 'Blood Donor', desc: 'Register to donate blood and save lives near you.', color: 'border-primary bg-red-50 text-primary' },
    { id: 'HOSPITAL', icon: <Building2 className="w-8 h-8" />, title: 'Hospital', desc: 'Request emergency blood and manage your inventory.', color: 'border-blue-500 bg-blue-50 text-blue-600' },
    { id: 'BLOOD_BANK', icon: <Warehouse className="w-8 h-8" />, title: 'Blood Bank', desc: 'Manage blood stock and serve nearby hospitals.', color: 'border-emerald-500 bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 bg-white z-10">
        <div className="max-w-lg w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-secondary tracking-tight">RaktSetu</span>
          </Link>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-secondary mb-2">Join the Network</h2>
              <p className="text-gray-500 mb-8">Choose how you want to participate in saving lives.</p>
              <div className="space-y-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setStep(2); }}
                    className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      role === r.id ? r.color : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      role === r.id ? r.color : 'bg-gray-50 text-gray-400'
                    }`}>
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-secondary text-lg">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.desc}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-500 mt-8 text-sm">
                Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step 2: Details Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-secondary mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to role selection
              </button>
              <h2 className="text-3xl font-bold text-secondary mb-2">
                {role === 'DONOR' ? '🩸 Donor' : role === 'HOSPITAL' ? '🏥 Hospital' : '🗄️ Blood Bank'} Registration
              </h2>
              <p className="text-gray-500 mb-6">Fill in your details to complete registration.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      {role === 'DONOR' ? 'Full Name' : role === 'HOSPITAL' ? 'Hospital Name' : 'Blood Bank Name'}
                    </label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="Ravi Kumar" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="+919876543210" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="Min 6 characters" />
                </div>

                {role === 'DONOR' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Blood Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map((bt) => (
                        <button type="button" key={bt} onClick={() => setForm({ ...form, bloodType: bt })}
                          className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                            form.bloodType === bt
                              ? 'bg-primary text-white shadow-lg shadow-red-500/20'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}>
                          {formatBloodType(bt)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {role === 'DONOR' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Last Donation Date (Optional)</label>
                    <input name="lastDonationDate" type="date" value={form.lastDonationDate} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Address / Area</label>
                  <input name="address" value={form.address} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="Hyderabad" />
                </div>

                {role === 'HOSPITAL' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">District</label>
                    <input name="district" value={form.district} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" placeholder="Secunderabad" />
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Location</label>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => {
                      if (navigator.geolocation) {
                        toast.loading('Fetching live location...', { id: 'geo' });
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                            toast.success('Live location captured successfully!', { id: 'geo' });
                          },
                          () => toast.error('Failed to get location. Please allow location access.', { id: 'geo' })
                        );
                      }
                    }}
                    className="flex-1 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-red-50 transition flex justify-center items-center gap-2">
                      <MapPin className="w-4 h-4" /> Get Live Location
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Latitude</label>
                      <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Longitude</label>
                      <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono" />
                    </div>
                  </div>
                    {form.latitude !== 17.385 && (
                      <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                        ✅ Captured
                      </span>
                    )}
                  <p className="text-xs text-gray-400 mt-2">Required for matching donors near hospitals.</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-[50%] bg-secondary relative overflow-hidden flex-col items-center justify-center p-16">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="text-7xl mb-8 animate-float">🩸</div>
          <h3 className="text-3xl font-black mb-4">Every Drop Counts</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            India faces a shortage of 3+ million units of blood annually. Every 2 seconds, someone needs blood. RaktSetu is here to change that.
          </p>
          <div className="grid grid-cols-3 gap-6 glass-dark rounded-2xl p-6">
            <div>
              <div className="text-2xl font-black text-primary">5km</div>
              <div className="text-xs text-gray-500 mt-1">Critical Radius</div>
            </div>
            <div>
              <div className="text-2xl font-black text-warning">15km</div>
              <div className="text-xs text-gray-500 mt-1">Urgent Radius</div>
            </div>
            <div>
              <div className="text-2xl font-black text-success">30km</div>
              <div className="text-xs text-gray-500 mt-1">Scheduled Radius</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
