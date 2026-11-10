import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Wrench, Search, PhoneCall, Globe } from 'lucide-react';

export default function Navbar({ studioName = 'Apex Auto Detailing Studio' }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-carbon-900 border-b border-carbon-800 px-6 flex items-center justify-between no-print z-10 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <span>{studioName}</span>
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Bays Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/landing"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Landing Page</span>
        </Link>

        <Link
          to="/jobs?create=true"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 text-xs font-extrabold shadow-ceramic transition-all transform active:scale-95"
        >
          <Wrench className="w-3.5 h-3.5 text-carbon-950" />
          <span>New Job Card</span>
        </Link>

        <Link
          to="/billing/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 text-xs font-bold transition-all shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Create GST Invoice</span>
        </Link>
      </div>
    </header>
  );
}
