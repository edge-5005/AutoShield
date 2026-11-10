import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Wrench, 
  Users, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles, 
  AlertCircle,
  CarFront,
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  Lock,
  Plus
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { currentCompany, currentRole, isAdmin, setIsRegisterModalOpen, setIsRoleModalOpen } = useAuth();

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegisterModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDashboard();
  }, [currentCompany]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { metrics, jobsByStatus, upcomingReminders, recentJobs, recentInvoices } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner with Company Identity & Role Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-carbon-900 border border-carbon-800 p-6 rounded-3xl shadow-carbon relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {currentCompany?.name || 'Apex Auto Studio'}
            </span>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                isAdmin
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
            >
              <span>{isAdmin ? '👑 Studio Owner / Admin' : '🖥️ Front Office Reception'}</span>
              <span className="text-[9px] text-slate-400 font-mono">(Switch)</span>
            </button>
            <span className="text-xs text-slate-500">• {currentCompany?.bays_count || 4} Detailing Bays</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Detailing Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {isAdmin 
              ? 'Complete studio command view: active ceramic/PPF bay queues, receivables, and profit analytics.'
              : 'Front office bay operations: customer vehicle check-in, job cards, 360° inspection, and invoice generation.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-slate-200 border border-carbon-700 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Register New Company</span>
            <span className="sm:hidden">Company</span>
          </button>

          <Link
            to="/jobs?create=true"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 text-xs font-black shadow-ceramic transition-all transform active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5 text-carbon-950" />
            <span>New Job Card</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active Detailing Jobs</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{metrics.activeJobs}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Cars in shop</span> right now
          </p>
        </div>

        {/* Total Billed Revenue */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Billed Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-slate-400 mt-1">
            Collected: <span className="text-slate-200 font-medium">{formatCurrency(metrics.totalCollected)}</span>
          </p>
        </div>

        {/* Pending Balance */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Receivables / Balance Due</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">{formatCurrency(metrics.totalPending)}</div>
          <p className="text-xs text-slate-400 mt-1">Pending customer settlement</p>
        </div>

        {/* Total Registered Cars */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Clients & Cars</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{metrics.totalVehicles}</div>
          <p className="text-xs text-slate-400 mt-1">
            Across <span className="text-slate-200 font-medium">{metrics.totalCustomers} customer profiles</span>
          </p>
        </div>
      </div>

      {/* Detailing Bay Workflow Pipeline */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Live Bay Pipeline & Job Statuses</h2>
            <p className="text-xs text-slate-400">Current work progress across studio detailing bays</p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All Job Cards <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              1. Received
            </span>
            <div className="text-2xl font-black text-white">{jobsByStatus.received}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Washing & PDI check</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/30 bg-blue-950/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
              2. Detailing
            </span>
            <div className="text-2xl font-black text-white">{jobsByStatus.in_progress}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Polishing, PPF & Coating</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-purple-500/30 bg-purple-950/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
              3. Quality Check
            </span>
            <div className="text-2xl font-black text-white">{jobsByStatus.quality_check}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">IR lamp curing & QC inspection</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              4. Ready
            </span>
            <div className="text-2xl font-black text-white">{jobsByStatus.ready}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting customer delivery</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              5. Delivered
            </span>
            <div className="text-2xl font-black text-white">{jobsByStatus.delivered}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Handed over to client</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Jobs & Warranty Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs in Studio (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CarFront className="w-5 h-5 text-blue-400" />
              <span>Vehicles Currently in Detailing Bays</span>
            </h2>
            <Link to="/jobs" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Manage Bays &rarr;
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No vehicles currently in detailing bays.
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentJobs.map((job) => {
                const badge = getStatusBadge(job.status);
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-500/20 text-amber-300 font-black font-mono text-xs tracking-wider uppercase">
                        {job.reg_number}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {job.make} {job.model}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{job.customer_name}</span>
                          <span>•</span>
                          <span className="text-slate-500">{job.assigned_tech ? `Tech: ${job.assigned_tech}` : 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Est: {formatCurrency(job.total_estimated)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Ceramic/PPF Follow-up Alerts (1 Col) */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Warranty Follow-ups Due</span>
            </h2>
            <Link to="/reminders" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View All &rarr;
            </Link>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No warranty inspections due this week.
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {upcomingReminders.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.reg_number}</span>
                    <span className="text-[11px] text-amber-400 font-medium">
                      Due: {formatDate(r.next_followup_date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1">{r.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>{r.customer_name}</span>
                    <Link
                      to="/reminders"
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Send WhatsApp
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
