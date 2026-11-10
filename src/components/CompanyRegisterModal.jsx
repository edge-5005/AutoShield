import React, { useState } from 'react';
import { Building2, X, Shield, Lock, Phone, Mail, MapPin, Hash, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CompanyRegisterModal() {
  const { isRegisterModalOpen, setIsRegisterModalOpen, registerNewCompany } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    tagline: 'Premium Ceramic Coating, Paint Correction & TPU PPF Lab',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    state_name: 'Karnataka',
    state_code: '29',
    bays_count: 4,
    admin_pin: '1234',
    front_office_pin: '0000'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter your Detailing Studio / Company Name');
      return;
    }

    try {
      setLoading(true);
      const res = await registerNewCompany(formData);
      setSuccessMsg(res.message || 'Studio registered successfully!');
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setSuccessMsg(null);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      alert(err.message || 'Error registering company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-carbon-900 border border-carbon-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-left space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsRegisterModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-carbon-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Commercial Studio Setup
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Create Your Company Profile
            </h2>
            <p className="text-xs text-slate-400">
              Set up your detailing business identity, bays, and staff security PINs
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Company Name & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Studio / Company Name <span className="text-amber-400">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Royal Auto Detailing & PPF Hub"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Tagline / Mission</label>
              <input
                type="text"
                placeholder="e.g. Precision Paint Protection & Ceramic Studio"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-slate-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Studio Email
              </label>
              <input
                type="email"
                placeholder="info@yourstudio.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Address & State */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Workshop Physical Address
              </label>
              <input
                type="text"
                placeholder="Plot 12, Automobile Nagar, Ring Road, City - 560001"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">GSTIN (Tax Invoices)</label>
                <input
                  type="text"
                  placeholder="e.g. 29AABCA1234D1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Detailing Bays Capacity</label>
                <select
                  value={formData.bays_count}
                  onChange={(e) => setFormData({ ...formData, bays_count: Number(e.target.value) })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={2}>2 Detailing Bays</option>
                  <option value={4}>4 Detailing & PPF Bays</option>
                  <option value={6}>6 Detailing & Curing Bays</option>
                  <option value={8}>8+ Multi-Workshop Bays</option>
                </select>
              </div>
            </div>
          </div>

          {/* Two Role Security PINs */}
          <div className="p-4 bg-carbon-950/80 rounded-2xl border border-carbon-800 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Two-Role Access Credentials (PINs)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every company gets an <strong>Admin Login</strong> (full access to profit/loss and settings) and a <strong>Front Office Login</strong> (bays, job cards, customer lookups, and invoicing).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-amber-300 font-bold block mb-1">
                  👑 Admin Owner PIN (Default: 1234)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.admin_pin}
                  onChange={(e) => setFormData({ ...formData, admin_pin: e.target.value })}
                  className="w-full bg-carbon-900 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Full access to P&L & Studio Settings</span>
              </div>

              <div>
                <label className="text-cyan-300 font-bold block mb-1">
                  🖥️ Front Office PIN (Default: 0000)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.front_office_pin}
                  onChange={(e) => setFormData({ ...formData, front_office_pin: e.target.value })}
                  className="w-full bg-carbon-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Job cards, bays, customer lookups</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-carbon-800 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black shadow-ceramic transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-carbon-950" />
              <span>{loading ? 'Creating Profile...' : 'Save Profile & Launch Dashboard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
