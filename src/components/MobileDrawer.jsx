import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Receipt, 
  Sparkles, 
  BellRing, 
  Settings, 
  Package, 
  Megaphone, 
  PieChart, 
  Globe, 
  Building2, 
  Lock, 
  Plus, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import AutoShieldLogo from './AutoShieldLogo';
import { useAuth } from '../context/AuthContext';

export default function MobileDrawer({ isOpen, onClose }) {
  const { currentCompany, currentRole, isAdmin, setIsRoleModalOpen, setIsRegisterModalOpen } = useAuth();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const menuSections = [
    {
      title: 'Studio Operations',
      items: [
        { name: 'Studio Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Job Cards & Bays', to: '/jobs', icon: Wrench },
        { name: 'Customers & Vehicles', to: '/customers', icon: Users },
        { name: 'Billing & Invoices', to: '/billing', icon: Receipt },
        { name: 'Car Accessories', to: '/accessories', icon: Package },
        { name: 'Service Packages', to: '/services', icon: Sparkles },
        { name: 'Warranty & Follow-ups', to: '/reminders', icon: BellRing },
      ]
    },
    {
      title: 'Management & Financials',
      adminOnly: true,
      items: [
        { name: 'AD Campaigns & Ads', to: '/ads', icon: Megaphone },
        { name: 'Accounts Profit & Loss', to: '/accounts', icon: PieChart },
        { name: 'Studio Settings & Logo', to: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden no-print">
      {/* Dimmed Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-in Content Panel */}
      <div className="relative w-4/5 max-w-sm h-full bg-carbon-900 border-r border-carbon-800 shadow-2xl flex flex-col justify-between overflow-y-auto pt-safe pb-safe select-none">
        <div>
          {/* Top Header */}
          <div className="p-4 border-b border-carbon-800 flex items-center justify-between bg-carbon-950/60">
            <Link to="/landing" onClick={handleLinkClick} className="flex items-center gap-2">
              <AutoShieldLogo size={32} />
            </Link>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors touch-press"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Company & Role Switcher Card */}
          <div className="p-3.5 border-b border-carbon-800/80 bg-carbon-950/40">
            <div className="flex items-center gap-3">
              {currentCompany?.logo_url ? (
                <div className="w-10 h-10 rounded-xl bg-carbon-900 border border-amber-500/30 p-1 shrink-0 flex items-center justify-center shadow-sm">
                  <img src={currentCompany.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-carbon-900 border border-carbon-700 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
              )}

              <div className="truncate flex-1 min-w-0">
                <h2 className="text-xs font-black text-white truncate">
                  {currentCompany?.name || 'Apex Auto Detailing Studio'}
                </h2>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentCompany?.bays_count || 4} Detailing Bays • {currentCompany?.state_name || 'India'}
                </span>
              </div>
            </div>

            {/* Role Switcher Pill */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => { onClose(); setIsRoleModalOpen(true); }}
                type="button"
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-black border flex items-center justify-between touch-press ${
                  isAdmin
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                }`}
              >
                <span>{isAdmin ? '👑 Admin (Full Access)' : '🖥️ Front Office Reception'}</span>
                <span className="text-[9px] underline text-slate-400">Switch</span>
              </button>

              <button
                onClick={() => { onClose(); setIsRegisterModalOpen(true); }}
                type="button"
                className="px-2 py-1.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-amber-300 border border-carbon-700 text-[10px] font-bold touch-press"
                title="Create New Company Profile"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-carbon-800/60">
            <Link
              to="/jobs"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-black text-[11px] shadow-ceramic touch-press"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Job Card</span>
            </Link>

            <Link
              to="/billing/new"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-white font-bold text-[11px] border border-carbon-700 touch-press"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>GST Invoice</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-4">
            {menuSections.map((section, sIdx) => {
              if (section.adminOnly && !isAdmin) return null;
              return (
                <div key={sIdx} className="space-y-1">
                  <div className="px-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {section.title}
                    </span>
                    {section.adminOnly && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Admin Only
                      </span>
                    )}
                  </div>

                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={handleLinkClick}
                        className={({ isActive }) => `
                          flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all touch-press
                          ${isActive
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-carbon-800/80 border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-carbon-800 bg-carbon-950/60 space-y-3">
          <Link
            to="/landing"
            onClick={handleLinkClick}
            className="flex items-center justify-between p-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-300 text-xs font-semibold border border-carbon-700/80 touch-press"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Public Studio Website</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Live ↗</span>
          </Link>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>AutoShield Mobile v2.4</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
