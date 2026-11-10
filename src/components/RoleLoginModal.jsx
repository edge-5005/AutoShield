import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, X, CheckCircle, KeyRound, Building2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function RoleLoginModal() {
  const { 
    isRoleModalOpen, 
    setIsRoleModalOpen, 
    currentCompany, 
    currentRole, 
    switchRole,
    companies,
    switchCompany,
    setIsRegisterModalOpen
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState(currentRole || 'admin');
  const [pin, setPin] = useState(selectedRole === 'admin' ? '1234' : '0000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isRoleModalOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPin(role === 'admin' ? '1234' : '0000');
    setErrorMsg(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.loginCompany({
        company_id: currentCompany?.id || 1,
        role: selectedRole,
        pin: pin
      });

      if (res && res.success) {
        switchRole(selectedRole);
        setSuccessMsg(`Switched to ${res.roleTitle}`);
        setTimeout(() => {
          setIsRoleModalOpen(false);
          setSuccessMsg(null);
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please check your PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-carbon-900 border border-carbon-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setIsRoleModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-carbon-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Access Control & Permissions
            </span>
            <h2 className="text-lg font-black text-white">
              Studio Login & Switch Role
            </h2>
          </div>
        </div>

        {/* Company Selector */}
        <div className="bg-carbon-950 p-3.5 rounded-2xl border border-carbon-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Current Studio Company:
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRoleModalOpen(false);
                setIsRegisterModalOpen(true);
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> New Company
            </button>
          </div>

          <select
            value={currentCompany?.id || 1}
            onChange={(e) => {
              const comp = companies.find(c => c.id === Number(e.target.value));
              if (comp) switchCompany(comp);
            }}
            className="w-full bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.bays_count || 4} Bays) • {c.state_name || 'India'}
              </option>
            ))}
          </select>
        </div>

        {/* Role Selector Cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Select Login Account Type:
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Admin Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedRole === 'admin'
                  ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10 text-white'
                  : 'bg-carbon-950 border-carbon-850 text-slate-400 hover:border-carbon-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">👑</span>
                {selectedRole === 'admin' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </div>
              <h3 className="text-xs font-bold text-white">Studio Admin</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Full access to P&L, Ads, Rates & Settings
              </p>
            </button>

            {/* Front Office Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('front_office')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedRole === 'front_office'
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10 text-white'
                  : 'bg-carbon-950 border-carbon-850 text-slate-400 hover:border-carbon-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">🖥️</span>
                {selectedRole === 'front_office' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
              </div>
              <h3 className="text-xs font-bold text-white">Front Office</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Job cards, bays, billing & car lookups
              </p>
            </button>
          </div>
        </div>

        {/* PIN Entry */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Enter 4-Digit Security PIN:
              </label>
              <span className="text-[10px] text-slate-500">
                Default: {selectedRole === 'admin' ? '1234' : '0000'}
              </span>
            </div>

            <input
              required
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
              {successMsg}
            </div>
          )}

          {/* Quick PIN Presets */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setPin('1234'); }}
              className="px-2.5 py-1 rounded-lg bg-carbon-800 text-[10px] font-bold text-amber-300 hover:bg-carbon-750"
            >
              Demo: Admin PIN (1234)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('front_office'); setPin('0000'); }}
              className="px-2.5 py-1 rounded-lg bg-carbon-800 text-[10px] font-bold text-cyan-300 hover:bg-carbon-750"
            >
              Demo: Front Office PIN (0000)
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-black text-xs shadow-lg transition-all transform active:scale-95 disabled:opacity-50 ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
            }`}
          >
            {loading ? 'Authenticating...' : `Enter as ${selectedRole === 'admin' ? 'Studio Admin' : 'Front Office Reception'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
