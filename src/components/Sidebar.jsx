import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Receipt, 
  Sparkles, 
  BellRing, 
  Settings,
  CarFront,
  ShieldCheck,
  Package,
  Megaphone,
  PieChart,
  Globe,
  Lock,
  UserCheck
} from 'lucide-react';
import AutoShieldLogo from './AutoShieldLogo';
import { useAuth } from '../context/AuthContext';

const allNavigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Job Cards & Bays', to: '/jobs', icon: Wrench, adminOnly: false },
  { name: 'Customers & Cars', to: '/customers', icon: Users, adminOnly: false },
  { name: 'Billing & Invoices', to: '/billing', icon: Receipt, adminOnly: false },
  { name: 'Car Accessories', to: '/accessories', icon: Package, adminOnly: false },
  { name: 'Service Packages', to: '/services', icon: Sparkles, adminOnly: false },
  { name: 'Warranty & Follow-ups', to: '/reminders', icon: BellRing, adminOnly: false },
  { name: 'AD Campaigns', to: '/ads', icon: Megaphone, adminOnly: true },
  { name: 'Accounts & P&L', to: '/accounts', icon: PieChart, adminOnly: true },
  { name: 'Studio Settings', to: '/settings', icon: Settings, adminOnly: true },
];

export default function Sidebar() {
  const { currentRole, isAdmin, currentCompany, setIsRoleModalOpen } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 bg-carbon-900 border-r border-carbon-800 flex-col shrink-0 no-print shadow-2xl">
      {/* Brand Logo & Name */}
      <div className="h-16 flex items-center px-4 border-b border-carbon-800 bg-carbon-950/40">
        <NavLink to="/landing" className="hover:opacity-90 transition-opacity">
          <AutoShieldLogo size={36} />
        </NavLink>
      </div>

      {/* Role Pill Banner */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
            isAdmin
              ? 'bg-amber-500/10 border-amber-500/25 hover:border-amber-400/50'
              : 'bg-cyan-500/10 border-cyan-500/25 hover:border-cyan-400/50'
          }`}
          title="Click to switch role or company"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{isAdmin ? '👑' : '🖥️'}</span>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block ${isAdmin ? 'text-amber-300' : 'text-cyan-300'}`}>
                {isAdmin ? 'Admin (Full Access)' : 'Front Office Login'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[130px] block">
                {currentCompany?.name || 'Studio'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 hover:text-white font-mono">Switch ↗</span>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Studio Operations</span>
          {!isAdmin && (
            <span className="text-[9px] text-cyan-400 font-semibold bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
              Bays & Reception
            </span>
          )}
        </div>

        {allNavigation.map((item) => {
          const Icon = item.icon;
          const isRestricted = !isAdmin && item.adminOnly;

          if (isRestricted) {
            return (
              <button
                key={item.name}
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-400 hover:bg-carbon-950/40 transition-all text-left group"
                title="Admin PIN Required"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  <span>{item.name}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-bold shadow-lg shadow-amber-500/25 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-carbon-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Studio Status footer */}
      <div className="p-4 border-t border-carbon-800 bg-carbon-950/30 space-y-3">
        <NavLink
          to="/landing"
          target="_blank"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold bg-carbon-800/80 hover:bg-carbon-800 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm group"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Public Website / Landing</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Live</span>
        </NavLink>

        <div className="bg-carbon-950/80 rounded-xl p-3 border border-carbon-800/90 shadow-gloss">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {currentCompany?.bays_count || 4} Detailing Bays
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAdmin ? 'Owner Admin Mode Active' : 'Front Office Reception Mode'}
          </p>
        </div>
      </div>
    </aside>
  );
}
