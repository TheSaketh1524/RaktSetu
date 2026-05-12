import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Droplets, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginEmail = email.toLowerCase().trim();
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email: loginEmail, password });
      login(res.data.data.user, res.data.data.token);
      toast.success('Logged in successfully!');
      
      const role = res.data.data.user.role;
      if (role === 'HOSPITAL') navigate('/hospital');
      else if (role === 'DONOR') navigate('/donor');
      else if (role === 'BLOOD_BANK') navigate('/bloodbank');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error('Login error details:', err.response?.data);
      const serverMessage = err.response?.data?.message;
      const errorMessage = Array.isArray(serverMessage) 
        ? serverMessage[0].message 
        : (serverMessage || 'Login failed. Check your credentials.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white animate-fade-in z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-secondary">RaktSetu</h1>
          </Link>

          <h2 className="text-4xl font-black text-secondary mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-10 text-lg">Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="contact@hospital.com"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>Sign In to Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Quick demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-secondary">Hospital</p>
                <p className="text-gray-500">contact@kimshospital.com</p>
              </div>
              <div>
                <p className="font-bold text-secondary">Donor</p>
                <p className="text-gray-500">donor1@example.com</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2">Password for all: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono">password123</code></p>
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Register here</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-secondary flex-col justify-end p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        
        {/* Central visual */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-float">🩸</div>
            <h3 className="text-4xl font-black text-white mb-3">Bridging the Gap</h3>
            <p className="text-xl text-gray-400">Saving Lives in Real-Time</p>
          </div>
        </div>

        {/* Bottom info card */}
        <div className="relative z-10">
          <div className="glass-dark p-8 rounded-2xl max-w-xl">
            <h4 className="text-xl font-bold text-white mb-3">Why RaktSetu?</h4>
            <p className="text-gray-400 leading-relaxed">
              India faces a shortage of 3+ million units of blood annually. RaktSetu uses AI-powered matching to connect hospitals with nearby eligible donors in under 60 seconds — including rural areas via plain SMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
