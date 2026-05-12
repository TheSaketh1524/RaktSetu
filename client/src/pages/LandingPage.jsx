import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Zap, MapPin, MessageSquare, Shield, Clock, ArrowRight, Activity, Users, Droplets } from 'lucide-react';

const LandingPage = () => {
  const [donorCount, setDonorCount] = useState(0);
  const [livesCount, setLivesCount] = useState(0);

  useEffect(() => {
    // Animated counter
    const targetDonors = 2847;
    const targetLives = 1203;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDonorCount(Math.round((step / steps) * targetDonors));
      setLivesCount(Math.round((step / steps) * targetLives));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-secondary tracking-tight">RaktSetu</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-secondary transition">Features</a>
            <a href="#how-it-works" className="hover:text-secondary transition">How it Works</a>
            <a href="#stats" className="hover:text-secondary transition">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-secondary hover:text-primary transition">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20 hover:shadow-red-500/40">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6">
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-primary text-sm font-bold rounded-full mb-6 border border-red-100">
                <Activity className="w-4 h-4" />
                AI-Powered Emergency Blood Network
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-secondary leading-tight mb-6">
                Get blood to the right person in{' '}
                <span className="text-primary relative">
                  60 seconds
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M1 5.5C47 2 153 2 199 5.5" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/></svg>
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                RaktSetu bridges the gap between hospitals in urgent need and nearby eligible blood donors using intelligent matching, urgency-tiered alerts, and SMS fallback for rural areas.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="group flex items-center gap-2 px-7 py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5">
                  Register as Donor
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-7 py-4 bg-secondary text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-0.5">
                  I'm a Hospital
                </Link>
              </div>
            </div>

            {/* Right side — Stats Cards */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-blue-50 rounded-3xl" />
              <div className="relative p-10 space-y-6">
                {/* Floating stat cards */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl animate-fade-in" style={{animationDelay:'0.2s'}}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                      <Heart className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-secondary">{donorCount.toLocaleString()}+</div>
                      <div className="text-sm text-gray-500 font-medium">Registered Donors</div>
                    </div>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-6 shadow-xl animate-fade-in ml-12" style={{animationDelay:'0.4s'}}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-success" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-secondary">{livesCount.toLocaleString()}+</div>
                      <div className="text-sm text-gray-500 font-medium">Lives Saved</div>
                    </div>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-6 shadow-xl animate-fade-in" style={{animationDelay:'0.6s'}}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-warning" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-secondary">&lt; 60s</div>
                      <div className="text-sm text-gray-500 font-medium">Average Match Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-secondary mb-4">How RaktSetu Works</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Three simple steps to connect emergency blood needs with nearby donors in real-time.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 stagger-children">
          {[
            { step: '01', icon: <Zap className="w-7 h-7" />, title: 'Hospital Logs Request', desc: 'Select blood type, units needed, and urgency level. Our AI instantly processes it.' },
            { step: '02', icon: <MapPin className="w-7 h-7" />, title: 'AI Matches Donors', desc: 'Our matching engine finds the best nearby compatible donors ranked by readiness score.' },
            { step: '03', icon: <MessageSquare className="w-7 h-7" />, title: 'Instant Alert Sent', desc: 'Donors receive push notifications or SMS and can accept with a single tap or text reply.' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-0 animate-slide-up">
              <div className="text-6xl font-black text-gray-100 mb-4">{item.step}</div>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-5">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-secondary mb-4">Why RaktSetu?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built to address 7 critical gaps in India's blood management infrastructure.</p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {[
            { icon: <Activity className="w-6 h-6" />, title: 'AI Readiness Score', desc: 'Predicts which donors are actually available right now using a 0-100 scoring system.', color: 'bg-red-50 text-primary' },
            { icon: <Zap className="w-6 h-6" />, title: '3-Tier Urgency Engine', desc: 'Critical, Urgent, and Scheduled requests each trigger different alert behaviors.', color: 'bg-amber-50 text-warning' },
            { icon: <Shield className="w-6 h-6" />, title: 'Reliability Tracking', desc: 'Donors who accept and show up gain reliability points. No-shows lose them.', color: 'bg-emerald-50 text-success' },
            { icon: <MessageSquare className="w-6 h-6" />, title: 'SMS Fallback', desc: 'Rural clinics can request blood via plain SMS. No app or internet required.', color: 'bg-blue-50 text-blue-600' },
            { icon: <MapPin className="w-6 h-6" />, title: 'Live Donor Map', desc: 'See donor locations in real-time with alert radius rings and status colors.', color: 'bg-purple-50 text-purple-600' },
            { icon: <Clock className="w-6 h-6" />, title: 'Data Freshness', desc: 'Every inventory reading shows when it was last updated. No more stale data.', color: 'bg-rose-50 text-rose-600' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 opacity-0 animate-fade-in">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section id="stats" className="py-16 bg-secondary px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '5', label: 'Partner Hospitals' },
            { value: '3', label: 'Blood Banks' },
            { value: '50+', label: 'Active Donors' },
            { value: '8', label: 'Blood Types Covered' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-secondary mb-4">Ready to Save Lives?</h2>
          <p className="text-gray-500 text-lg mb-8">Join the network. Every donor counts. Every second matters.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="group flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 hover:shadow-red-500/40">
              Join as Donor
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="px-8 py-4 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all">
              Register Hospital
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="font-bold text-secondary">RaktSetu</span>
            <span className="text-gray-400 text-sm">— Bridging the Gap. Saving Lives.</span>
          </div>
          <div className="text-sm text-gray-400">
            Built with ❤️ for India's emergency healthcare infrastructure
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
