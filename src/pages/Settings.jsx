import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building, CreditCard, ShieldCheck, CheckCircle, Upload, Image, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LOGO_PRESETS = [
  {
    name: 'Ceramic Gold Shield',
    icon: '👑',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,5 90,20 90,55 50,95 10,55 10,20' fill='%230a0b0d' stroke='%23f59e0b' stroke-width='5'/><path d='M50,22 L65,52 L35,52 Z' fill='%23fbbf24'/><circle cx='50' cy='68' r='6' fill='%23f59e0b'/></svg>"
  },
  {
    name: 'Titanium Matrix Lab',
    icon: '🛡️',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='44' fill='%230a0b0d' stroke='%2306b6d4' stroke-width='5'/><path d='M30,35 L70,35 L50,75 Z' fill='none' stroke='%2338bdf8' stroke-width='5'/><circle cx='50' cy='48' r='7' fill='%2306b6d4'/></svg>"
  },
  {
    name: 'Royal Diamond Gloss',
    icon: '💎',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,8 90,38 50,92 10,38' fill='%230a0b0d' stroke='%23a855f7' stroke-width='5'/><polyline points='10,38 90,38' stroke='%23c084fc' stroke-width='3'/><polyline points='50,8 35,38 50,92' stroke='%23c084fc' stroke-width='2'/><polyline points='50,8 65,38 50,92' stroke='%23c084fc' stroke-width='2'/></svg>"
  },
  {
    name: 'Stealth Apex Carbon',
    icon: '⚡',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='8' y='8' width='84' height='84' rx='22' fill='%230a0b0d' stroke='%23eab308' stroke-width='5'/><path d='M25,68 L50,24 L75,68 Z' fill='%23eab308'/><circle cx='50' cy='52' r='6' fill='%230a0b0d'/></svg>"
  }
];

export default function Settings() {
  const { currentCompany, updateCurrentCompany } = useAuth();
  const [formData, setFormData] = useState({
    studio_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    state_code: '29',
    state_name: 'Karnataka',
    logo_url: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch: '',
    upi_id: '',
    rc_api_key: '',
    terms_conditions: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      if (data) {
        setFormData(prev => ({ 
          ...prev, 
          ...data,
          logo_url: data.logo_url || currentCompany?.logo_url || '' 
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Please upload an image smaller than 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(formData);
      if (updateCurrentCompany) {
        updateCurrentCompany({
          name: formData.studio_name,
          tagline: formData.tagline,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          gstin: formData.gstin,
          state_name: formData.state_name,
          logo_url: formData.logo_url
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving settings');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-blue-500" />
            <span>Studio Profile & Billing Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure studio contact details, GSTIN, bank settlement accounts & invoice terms
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Saved Successfully</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Studio Branding & Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Studio Identity & Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Studio Name *</label>
              <input
                required
                type="text"
                value={formData.studio_name}
                onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Contact Phone *</label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Studio Physical Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Company Brand Logo Section */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-400" />
                <span>Company Studio Logo (Printed on Invoices & Certificates)</span>
              </label>
              {formData.logo_url && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo_url: '' })}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              {/* Logo Preview Square */}
              <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building className="w-7 h-7 text-slate-600" />
                )}
              </div>

              {/* Upload or URL Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, SVG up to 8MB</span>
                </div>

                <input
                  type="text"
                  placeholder="Or paste direct image URL (e.g. https://...)"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Insignia Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Quick Insignia Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {LOGO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo_url: p.url })}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GST & Tax Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>GST & Tax Compliance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">State Code</label>
              <input
                type="text"
                value={formData.state_code}
                onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">State Name</label>
              <input
                type="text"
                value={formData.state_name}
                onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bank & Settlement Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Bank & UPI Settlement (Prints on Invoices)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Account Number</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Live VAHAN Vehicle Data API (Free RapidAPI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Live Indian VAHAN / RTO Vehicle API (Optional Free API Key)</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                The Indian Ministry of Road Transport (VAHAN) protects vehicle databases from open unauthenticated scraping. Connect a free RapidAPI key to fetch live maker, model, owner, and registration data in real-time.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              Optional Free Tier
            </span>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">RapidAPI Key for VAHAN RC Lookup</label>
            <input
              type="password"
              placeholder="e.g. 9b936d... or paste your RapidAPI X-RapidAPI-Key"
              value={formData.rc_api_key || ''}
              onChange={(e) => setFormData({ ...formData, rc_api_key: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span>Supports RapidAPI <em>'RTO Vehicle Information India'</em> or <em>'Vehicle RC Information'</em> endpoints.</span>
              <a
                href="https://rapidapi.com/search/vehicle%20rc"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline font-semibold"
              >
                Get Free API Key on RapidAPI ↗
              </a>
            </div>
          </div>
        </div>

        {/* Invoice Terms & Conditions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white">Default Invoice Terms & Warranty Conditions</h2>
          <textarea
            rows={4}
            value={formData.terms_conditions}
            onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 text-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Studio Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
