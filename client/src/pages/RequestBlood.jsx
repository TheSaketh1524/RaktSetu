import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Droplets, AlertTriangle, Clock, Calendar, Check } from 'lucide-react';
import UrgencySelector from '../components/UrgencySelector';

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const formatBloodType = (bt) => bt.replace('_POS', '+').replace('_NEG', '-');

const RequestBlood = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    bloodType: '', units: 1, urgency: '', patientName: '', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/blood-requests`, {
        bloodType: form.bloodType,
        units: parseInt(form.units),
        urgency: form.urgency,
        patientName: form.patientName || undefined,
        notes: form.notes || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setResult(res.data.data);
      toast.success(`Request created! ${res.data.data.matchedDonors?.length || 0} donors matched.`);
      setStep(5); // Success step
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!form.bloodType;
    if (step === 2) return form.units > 0;
    if (step === 3) return !!form.urgency;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/hospital', { state: { refresh: true, timestamp: Date.now() } })} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-secondary transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="font-black text-secondary">Request Blood</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="flex items-center gap-1 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Step 1: Blood Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-secondary mb-2">Select Blood Type</h2>
            <p className="text-gray-500 mb-8">Choose the required blood group for this request.</p>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_TYPES.map((bt) => (
                <button key={bt} onClick={() => setForm({ ...form, bloodType: bt })}
                  className={`py-6 rounded-2xl text-xl font-black transition-all ${
                    form.bloodType === bt
                      ? 'bg-primary text-white shadow-xl shadow-red-500/20 scale-105'
                      : 'bg-white text-secondary border border-gray-200 hover:border-primary hover:shadow-lg'
                  }`}>
                  {formatBloodType(bt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Units */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-secondary mb-2">How many units?</h2>
            <p className="text-gray-500 mb-8">Specify the number of blood units required.</p>
            <div className="flex items-center justify-center gap-8 py-10">
              <button onClick={() => setForm({ ...form, units: Math.max(1, form.units - 1) })}
                className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl text-3xl font-bold text-secondary hover:border-primary hover:text-primary transition">
                −
              </button>
              <div className="text-center">
                <div className="text-8xl font-black text-primary">{form.units}</div>
                <div className="text-gray-500 font-medium mt-2">unit{form.units > 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setForm({ ...form, units: Math.min(10, form.units + 1) })}
                className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl text-3xl font-bold text-secondary hover:border-primary hover:text-primary transition">
                +
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Urgency */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-secondary mb-2">Urgency Level</h2>
            <p className="text-gray-500 mb-8">This determines the alert radius and notification channels.</p>
            <UrgencySelector selected={form.urgency} onSelect={(id) => setForm({ ...form, urgency: id })} />
          </div>
        )}

        {/* Step 4: Patient Info */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-secondary mb-2">Patient Details (Optional)</h2>
            <p className="text-gray-500 mb-8">Add patient information for reference.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Patient Name</label>
                <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none"
                  placeholder="Post-surgery, trauma ward..." />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-secondary mb-3">Request Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-primary">{formatBloodType(form.bloodType)}</div>
                    <div className="text-xs text-gray-500">Blood Type</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-secondary">{form.units}</div>
                    <div className="text-xs text-gray-500">Units</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${
                      form.urgency === 'CRITICAL' ? 'text-red-600' : form.urgency === 'URGENT' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{form.urgency}</div>
                    <div className="text-xs text-gray-500">Urgency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && result && (
          <div className="animate-scale-in text-center py-10">
            <div className="text-7xl mb-6">✅</div>
            <h2 className="text-3xl font-black text-secondary mb-3">Request Created!</h2>
            <p className="text-gray-500 text-lg mb-8">
              {result.matchedDonors?.length || 0} compatible donors have been matched and alerted.
            </p>

            {result.matchedDonors?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-bold text-secondary mb-3">Matched Donors</h3>
                <div className="space-y-2">
                  {result.matchedDonors.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium text-sm text-secondary">{d.name || 'Anonymous Donor'}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{Math.round(d.readinessScore)}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate('/hospital/dashboard', {
              state: { refresh: true, timestamp: Date.now() }
            })} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20">
              Back to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-10">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-secondary transition disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-red-700 transition shadow-lg shadow-red-500/20 disabled:opacity-30 disabled:shadow-none">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-red-700 transition shadow-lg shadow-red-500/20 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Request'} {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestBlood;
