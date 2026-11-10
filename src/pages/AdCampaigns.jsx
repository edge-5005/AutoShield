import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, TrendingUp, DollarSign, Users, MousePointer, 
  Eye, CheckCircle2, PauseCircle, PlayCircle, Trash2, Edit3, 
  ExternalLink, Sparkles, BarChart3, ArrowUpRight, Zap, Target
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const PLATFORMS = [
  'Instagram & Facebook',
  'Google Search Ads',
  'YouTube Video Ads',
  'WhatsApp Direct Ads'
];

export default function AdCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [formData, setFormData] = useState({
    campaign_name: '',
    platform: 'Instagram & Facebook',
    status: 'active',
    target_audience: 'Car Owners & New Car Buyers in 15km radius',
    featured_service: 'Ceramic Coating 9H (3-Year Warranty)',
    daily_budget: 500,
    total_spend: 0,
    impressions: 0,
    clicks: 0,
    leads_generated: 0,
    conversions: 0,
    revenue_generated: 0,
    ad_copy: '',
    cta_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, aData] = await Promise.all([
        api.getAdCampaigns(),
        api.getAdAnalytics()
      ]);
      setCampaigns(cData);
      setAnalytics(aData);
    } catch (err) {
      console.error('Error loading ads data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      campaign_name: '',
      platform: 'Instagram & Facebook',
      status: 'active',
      target_audience: 'Luxury SUV & Sedan owners in 15km radius',
      featured_service: 'Full Body Paint Protection Film (TPU Self-Healing)',
      daily_budget: 600,
      total_spend: 1200,
      impressions: 5400,
      clicks: 280,
      leads_generated: 14,
      conversions: 3,
      revenue_generated: 185000,
      ad_copy: '🛡️ Don\'t let stone chips ruin your brand new paint! Self-Healing TPU PPF with 5-Year Warranty. Book this week for a free ceramic glass shield.',
      cta_url: 'https://wa.me/919876543210'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCampaign(c);
    setFormData({
      campaign_name: c.campaign_name,
      platform: c.platform,
      status: c.status,
      target_audience: c.target_audience || '',
      featured_service: c.featured_service || '',
      daily_budget: c.daily_budget || 500,
      total_spend: c.total_spend || 0,
      impressions: c.impressions || 0,
      clicks: c.clicks || 0,
      leads_generated: c.leads_generated || 0,
      conversions: c.conversions || 0,
      revenue_generated: c.revenue_generated || 0,
      ad_copy: c.ad_copy || '',
      cta_url: c.cta_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await api.updateAdCampaign(editingCampaign.id, formData);
      } else {
        await api.createAdCampaign(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ad campaign?')) return;
    try {
      await api.deleteAdCampaign(id);
      loadData();
    } catch (err) {
      alert('Error deleting campaign');
    }
  };

  const handleToggleStatus = async (c) => {
    const nextStatus = c.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateAdCampaign(c.id, { ...c, status: nextStatus });
      loadData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const summary = analytics?.summary || {
    total_spend: 0,
    total_revenue: 0,
    blended_roas: 0,
    total_leads: 0,
    avg_cpl: 0
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-amber-500" />
            <span>Social Media Ads & Marketing ROI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Instagram, Google & WhatsApp ad campaigns, track lead conversion and analyze Detailing Return on Ad Spend (ROAS)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-extrabold text-xs shadow-ceramic transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Ad Campaign</span>
        </button>
      </div>

      {/* Top ROI KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Ad Spend
          </span>
          <p className="text-xl font-black text-white font-mono">
            {formatCurrency(summary.total_spend)}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Across {campaigns.length} campaigns
          </span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Revenue Generated
          </span>
          <p className="text-xl font-black text-emerald-400 font-mono">
            {formatCurrency(summary.total_revenue)}
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-2 block flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> Direct Detailing Conversions
          </span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-300"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Blended ROAS (Return)
          </span>
          <p className="text-xl font-black text-amber-300 font-mono">
            {summary.blended_roas}x
          </p>
          <span className="text-[11px] text-amber-300/80 mt-2 block font-semibold">
            ₹{summary.blended_roas} return per ₹1 spent
          </span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Inquiries / Leads
          </span>
          <p className="text-xl font-black text-cyan-400 font-mono">
            {summary.total_leads} <span className="text-xs text-slate-400 font-normal">({summary.total_conversions} booked)</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            Avg. CPL: {formatCurrency(summary.avg_cpl)}
          </span>
        </div>
      </div>

      {/* Platform Performance Overview */}
      {analytics?.by_platform && (
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Performance by Channel & Platform</span>
            </h2>
            <span className="text-[11px] text-slate-400">Live conversion tracking</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(analytics.by_platform).map(([platform, data]) => {
              const platformRoas = data.spend > 0 ? (data.revenue / data.spend).toFixed(1) : 0;
              return (
                <div key={platform} className="bg-carbon-950 p-4 rounded-xl border border-carbon-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{platform}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {platformRoas}x ROAS
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-carbon-800/80">
                    <span className="text-slate-400">Spend: <strong className="text-white font-mono">{formatCurrency(data.spend)}</strong></span>
                    <span className="text-slate-400">Revenue: <strong className="text-emerald-400 font-mono">{formatCurrency(data.revenue)}</strong></span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Leads: <strong className="text-cyan-400">{data.leads}</strong></span>
                    <span>Booked Jobs: <strong className="text-amber-400">{data.conversions}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Campaigns List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span>Campaign Directory & Analytics</span>
          </h2>
          <span className="text-xs text-slate-400">{campaigns.length} total campaigns</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading ad campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center bg-carbon-900 border border-carbon-800 rounded-2xl">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">No ad campaigns launched yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first Instagram or Google detailing campaign</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-carbon-950 font-bold text-xs shadow-ceramic"
            >
              Launch First Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon hover:border-carbon-700 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      title={c.status === 'active' ? 'Click to Pause' : 'Click to Resume'}
                      className="mt-0.5"
                    >
                      {c.status === 'active' ? (
                        <PlayCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <PauseCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{c.campaign_name}</h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          c.status === 'active'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                          {c.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        🎯 Audience: <strong className="text-slate-300">{c.target_audience}</strong> • Service: <strong className="text-amber-300">{c.featured_service}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
                      title="Edit Campaign & Metrics"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ad Copy Quote */}
                {c.ad_copy && (
                  <div className="p-3 rounded-xl bg-carbon-950/80 border border-carbon-800/70 text-xs text-slate-300 italic">
                    "{c.ad_copy}"
                  </div>
                )}

                {/* Performance Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3 border-t border-carbon-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Total Spent</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(c.total_spend)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Revenue Driven</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(c.revenue_generated)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">ROAS Return</span>
                    <span className="font-bold text-amber-300 font-mono">{c.roas}x</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Clicks (CTR)</span>
                    <span className="font-bold text-slate-300 font-mono">{c.clicks} ({c.ctr}%)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Leads (CPL)</span>
                    <span className="font-bold text-cyan-400 font-mono">{c.leads_generated} ({formatCurrency(c.cpl)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Conversions</span>
                    <span className="font-bold text-amber-400 font-mono">{c.conversions} ({c.conversion_rate}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <span>{editingCampaign ? 'Edit Ad Campaign & Metrics' : 'Launch New Social Media Campaign'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Campaign Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 9H Ceramic Monsoon Festival Offer"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Platform *</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Daily Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.daily_budget}
                    onChange={(e) => setFormData({ ...formData, daily_budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Audience Location & Segment</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Car Owners, New Car Delivery within 15km"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Featured Detailing Package</label>
                <input
                  type="text"
                  placeholder="e.g. Full Body TPU Self-Healing PPF"
                  value={formData.featured_service}
                  onChange={(e) => setFormData({ ...formData, featured_service: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ad Creative Copy / Hook</label>
                <textarea
                  rows={2}
                  placeholder="Write ad headline, offer details or WhatsApp CTA hook..."
                  value={formData.ad_copy}
                  onChange={(e) => setFormData({ ...formData, ad_copy: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Performance Metrics Inputs */}
              <div className="p-3.5 bg-carbon-950 rounded-xl border border-carbon-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Campaign Metrics (Live Analytics Sync)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Total Spend (₹)</label>
                    <input
                      type="number"
                      value={formData.total_spend}
                      onChange={(e) => setFormData({ ...formData, total_spend: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Impressions</label>
                    <input
                      type="number"
                      value={formData.impressions}
                      onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Clicks</label>
                    <input
                      type="number"
                      value={formData.clicks}
                      onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Leads</label>
                    <input
                      type="number"
                      value={formData.leads_generated}
                      onChange={(e) => setFormData({ ...formData, leads_generated: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Booked Jobs</label>
                    <input
                      type="number"
                      value={formData.conversions}
                      onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-slate-400 text-[11px] block mb-0.5">Revenue Generated (₹)</label>
                    <input
                      type="number"
                      value={formData.revenue_generated}
                      onChange={(e) => setFormData({ ...formData, revenue_generated: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-bold shadow-ceramic"
                >
                  {editingCampaign ? 'Save Changes' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
