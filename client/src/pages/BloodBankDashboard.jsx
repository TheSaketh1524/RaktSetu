import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Droplets, LogOut, Package, RefreshCw, User, Plus, Activity, Warehouse, ShieldAlert } from 'lucide-react';
import FreshnessIndicator from '../components/FreshnessIndicator';

const formatBloodType = (bt) => bt?.replace('_POS', '+').replace('_NEG', '-') || bt;

const BloodBankDashboard = () => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [inventory, setInventory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalUnits: 0, lowStockCount: 0, typeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ bloodType: 'O_POS', units: 10 });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/blood-banks/dashboard`, config);
      if (res.data?.success) {
        const { inventory, profile, stats } = res.data.data;
        setInventory(inventory || []);
        setProfile(profile);
        setStats(stats);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location.key]);

  const updateInventoryItem = async (bloodType, newUnits) => {
    if (newUnits < 0) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/inventory/${profile.id}`,
        { bloodType, units: newUnits }, config);
      toast.success('Inventory updated');
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Warehouse className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-secondary text-lg">RaktSetu</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Blood Bank</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="p-2.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded-xl transition">
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
            <h1 className="text-3xl font-black text-secondary">{profile?.name || 'Blood Bank Dashboard'}</h1>
            <p className="text-gray-500 mt-1">Manage your blood stock levels and supply networks.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition px-4 py-2 rounded-xl hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
               <Droplets className="w-5 h-5" />
             </div>
             <div className="text-3xl font-black text-secondary">{stats.totalUnits}</div>
             <div className="text-sm text-gray-500 font-medium">Total Units in Stock</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
             <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
               <ShieldAlert className="w-5 h-5" />
             </div>
             <div className="text-3xl font-black text-secondary">{stats.lowStockCount}</div>
             <div className="text-sm text-gray-500 font-medium">Low Stock Alerts</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
               <Activity className="w-5 h-5" />
             </div>
             <div className="text-3xl font-black text-secondary">{stats.typeCount}/8</div>
             <div className="text-sm text-gray-500 font-medium">Blood Types Available</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Stock Management
            </h2>
            <button onClick={() => setShowAddStock(!showAddStock)} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition">
              <Plus className="w-4 h-4" /> {showAddStock ? 'Cancel' : 'Register New Batch'}
            </button>
          </div>

          {showAddStock && (
            <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 animate-scale-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Blood Type</label>
                  <select value={newStock.bloodType} onChange={(e) => setNewStock({...newStock, bloodType: e.target.value})}
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
                    {['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'].map(bt => (
                      <option key={bt} value={bt}>{formatBloodType(bt)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">Units (Initial)</label>
                  <input type="number" value={newStock.units} onChange={(e) => setNewStock({...newStock, units: parseInt(e.target.value)})}
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <button onClick={() => { updateInventoryItem(newStock.bloodType, newStock.units); setShowAddStock(false); }}
                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20">
                Confirm Batch Entry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.length > 0 ? inventory.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    item.units < 10 ? 'bg-red-100 text-red-700' : 'bg-white text-secondary shadow-sm'
                  }`}>
                    {formatBloodType(item.bloodType)}
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                    item.units < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.units < 10 ? 'LOW STOCK' : 'IN STOCK'}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-black text-secondary">{item.units} <span className="text-xs font-normal text-gray-400">units</span></div>
                  <FreshnessIndicator date={item.lastUpdated} />
                </div>
                <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <button onClick={() => updateInventoryItem(item.bloodType, item.units - 1)}
                    className="flex-1 py-2 hover:bg-gray-50 text-gray-400 hover:text-red-500 font-bold border-r border-gray-100 transition">-</button>
                  <button onClick={() => updateInventoryItem(item.bloodType, item.units + 1)}
                    className="flex-1 py-2 hover:bg-gray-50 text-gray-400 hover:text-emerald-500 font-bold transition">+</button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-6xl mb-4 opacity-20">📦</div>
                <p className="text-gray-400 font-bold">No inventory recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankDashboard;
