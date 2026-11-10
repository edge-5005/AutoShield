import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Wrench, Search, PhoneCall, Globe, Building2, Shield, UserCheck, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { 
    currentCompany, 
    currentRole, 
    isAdmin, 
    setIsRoleModalOpen, 
    setIsRegisterModalOpen 
  } = useAuth();

  return (
    <header className="h-16 bg-carbon-900 border-b border-carbon-800 px-6 flex items-center justify-between no-print z-10 shadow-md">
      {/* Company Name & Role Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-950/80 hover:bg-carbon-950 border border-carbon-700/80 text-left transition-all group"
          title="Click to switch company or login as Admin / Front Office"
        >
          {currentCompany?.logo_url ? (
            <img src={currentCompany.logo_url} alt="Logo" className="w-5 h-5 rounded object-contain shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          )}
          <div className="truncate max-w-[160px] sm:max-w-[240px]">
            <h1 className="text-xs font-bold text-white tracking-wide truncate">
              {currentCompany?.name || 'Apex Auto Detailing Studio'}
            </h1>
            <span className="text-[10px] text-slate-400 block truncate">
              {currentCompany?.bays_count || 4} Bays • {currentCompany?.state_name || 'India'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0 ml-1" />
        </button>

        {/* Current Role Badge (Clickable to switch) */}
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all ${
            isAdmin
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
          }`}
          title="Click to switch between Admin Owner and Front Office Reception"
        >
          <span className="text-xs">{isAdmin ? '👑' : '🖥️'}</span>
          <span>{isAdmin ? 'Admin (Owner)' : 'Front Office'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
        </button>

        {/* New Company Registration Button */}
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-slate-300 hover:text-amber-300 text-[10px] font-bold border border-carbon-700 transition-colors"
          title="Register new customer detailing studio"
        >
          <Plus className="w-3 h-3 text-amber-400" />
          <span>New Studio Profile</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/landing"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Public Landing</span>
        </Link>

        <Link
          to="/jobs?create=true"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 text-xs font-extrabold shadow-ceramic transition-all transform active:scale-95"
        >
          <Wrench className="w-3.5 h-3.5 text-carbon-950" />
          <span className="hidden sm:inline">New Job Card</span>
          <span className="sm:hidden">Job</span>
        </Link>

        <Link
          to="/billing/new"
          className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 text-xs font-bold transition-all shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Create GST Invoice</span>
          <span className="sm:hidden">Invoice</span>
        </Link>
      </div>
    </header>
  );
}
