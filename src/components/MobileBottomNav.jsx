import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  Receipt, 
  Menu 
} from 'lucide-react';

export default function MobileBottomNav({ onOpenDrawer }) {
  const tabs = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Bays & Jobs', to: '/jobs', icon: Wrench },
    { name: 'Accessories', to: '/accessories', icon: Package },
    { name: 'Billing', to: '/billing', icon: Receipt },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-carbon-950/95 backdrop-blur-xl border-t border-carbon-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] no-print pb-safe select-none"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 rounded-xl transition-all relative touch-press
                ${isActive 
                  ? 'text-amber-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    p-1 rounded-xl transition-all relative
                    ${isActive ? 'bg-amber-500/15 text-amber-400 scale-110 shadow-ceramic' : 'text-slate-400'}
                  `}>
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-amber-400' : 'font-medium'}`}>
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={onOpenDrawer}
          type="button"
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-amber-400 transition-all touch-press"
          aria-label="Open Full Studio Menu"
        >
          <div className="p-1 rounded-xl text-slate-400 hover:text-amber-400">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
