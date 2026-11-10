import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Sparkles, Wrench, Receipt, Users, Megaphone, 
  Package, PieChart, ArrowRight, CheckCircle2, Star, Zap, 
  CarFront, Layers, Award, Droplets, Sun, ChevronRight, Play,
  TrendingUp, Clock, Check
} from 'lucide-react';
import AutoShieldLogo from '../components/AutoShieldLogo';
import { formatCurrency } from '../utils/formatters';

export default function LandingPage() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeDemoTab, setActiveDemoTab] = useState('ceramic'); // 'ceramic' | 'ppf' | 'interior'
  const [carsPerMonth, setCarsPerMonth] = useState(25);

  // Estimated ROI calculation
  const avgTicketSize = 18000;
  const monthlyRevenue = carsPerMonth * avgTicketSize;
  const timeSavedHours = Math.round(carsPerMonth * 1.5);
  const extraRevenueRecovered = Math.round(monthlyRevenue * 0.15); // recovered from warranty reminders & ad conversions

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 selection:bg-amber-500 selection:text-carbon-950 font-sans antialiased overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl opacity-60"></div>
        <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-cyan-500/5 blur-3xl rounded-full"></div>
        <div className="absolute top-[1600px] -right-48 w-[700px] h-[700px] bg-amber-500/5 blur-3xl rounded-full"></div>
      </div>

      {/* Floating Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-carbon-950/80 border-b border-carbon-800/80 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-95 transition-opacity">
            <AutoShieldLogo size={38} />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-amber-400 transition-colors">Core Features</a>
            <a href="#demo" className="hover:text-amber-400 transition-colors">50/50 Studio Demo</a>
            <a href="#modules" className="hover:text-amber-400 transition-colors">Software Modules</a>
            <a href="#roi" className="hover:text-amber-400 transition-colors">ROI Calculator</a>
            <a href="#warranty" className="hover:text-amber-400 transition-colors">Warranty Cards</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black text-xs shadow-ceramic transition-all transform active:scale-95"
            >
              <span>Enter Studio CRM</span>
              <ArrowRight className="w-3.5 h-3.5 text-carbon-950" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto text-center space-y-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="tracking-wider uppercase">Next-Gen Automotive Detailing Studio Operating System</span>
        </div>

        {/* Primary Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Precision Software for <br />
            <span className="gold-gradient-text">Elite Detailing Studios</span> & PPF Labs
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform built specifically for Indian car detailing studios. From 360° vehicle inspections and SAC 9987 GST invoices, to social media ad analytics and automated 5-year ceramic warranty follow-ups.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black text-sm shadow-ceramic hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Zap className="w-4 h-4 text-carbon-950 fill-carbon-950" />
            <span>Launch Studio Management App</span>
          </Link>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-carbon-900 hover:bg-carbon-850 text-slate-200 border border-carbon-700 text-sm font-bold shadow-carbon transition-all"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Experience Interactive 50/50 Demo</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-semibold border-t border-carbon-800/80 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Indian GST & SAC 9987 Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Pan-India RTO & 120+ Car Database</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Direct WhatsApp Warranty Cards</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Meta & Google Ad ROAS Tracking</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 50/50 PAINT CORRECTION & CERAMIC DEMO WIDGET */}
      <section id="demo" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-carbon-900 border border-carbon-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Interactive Detailing Visualizer
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              50/50 Paint Correction & Glass Coating
            </h2>
            <p className="text-xs text-slate-400">
              Drag the interactive slider below to witness the swirl removal and high-gloss ceramic mirror finish that AutoShield Pro studios deliver.
            </p>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex justify-center gap-2">
            {[
              { id: 'ceramic', label: '9H Ceramic Coating (3-Yr)' },
              { id: 'ppf', label: 'Self-Healing TPU PPF (5-Yr)' },
              { id: 'interior', label: 'VIP Interior Leather Spa' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDemoTab === tab.id
                    ? 'bg-amber-500 text-carbon-950 shadow-ceramic'
                    : 'bg-carbon-950 text-slate-400 hover:text-white border border-carbon-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 50/50 Slider Container */}
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-carbon-700 shadow-2xl select-none">
            {/* Left Side: BEFORE (Dull & Swirled) */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-neutral-900 to-stone-900 flex items-center justify-start p-8">
              <div className="space-y-2 max-w-xs text-left">
                <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider">
                  Before: Oxidation & Swirls
                </span>
                <h3 className="text-lg font-bold text-slate-300">Heavy Micro-Scratches & Holograms</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clearcoat damaged by hard water spots, sun oxidation, and washing swirls. Reflection is hazy and diffuse.
                </p>
              </div>
            </div>

            {/* Right Side: AFTER (Mirror Gloss Ceramic Reflection) */}
            <div 
              className="absolute inset-y-0 right-0 bg-gradient-to-r from-neutral-950 via-zinc-950 to-carbon-950 flex items-center justify-end p-8 border-l-2 border-amber-400 shadow-[-15px_0_35px_rgba(245,158,11,0.25)]"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Ceramic High-Gloss Shimmer Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none"></div>

              <div className="space-y-2 max-w-xs text-right relative z-10">
                <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  After: 9H Mirror Reflection
                </span>
                <h3 className="text-lg font-bold text-amber-300">Hydrophobic Glass Depth</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  3-Stage rotary compound cut + Japanese 9H ceramic matrix. 115° water contact angle and deep wet-look shine.
                </p>
              </div>
            </div>

            {/* Slider Handle Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-carbon-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/50 text-xs">
                ↔
              </div>
            </div>

            {/* Invisible Drag Range Input on top */}
            <input 
              type="range"
              min="10"
              max="90"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <span>👈 Drag slider left or right to inspect paint clarity 👉</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURE MODULES (6 PILLARS) */}
      <section id="modules" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Engineered For Detailing Shops
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything Required to Scale Your Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Eliminate messy paper job cards, lost ceramic coating warranty claims, and disconnected spreadsheets. AutoShield Pro is tailored to automotive professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Job Cards */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Digital Job Cards & Bay Inspection
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              360° vehicle scratch and dent checklists before touching the paint. Record fuel levels, odometer reading, valuable checks, and assign technicians to bays.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Pre-Delivery Inspection Ready</span>
            </div>
          </div>

          {/* Module 2: GST Invoices */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              GST Tax Invoices & SAC 9987
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click tax invoices and job estimates with automated CGST, SGST, IGST calculations, UPI QR codes, and instant WhatsApp PDF sharing for customers.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Full A4 Print & UPI Settlement</span>
            </div>
          </div>

          {/* Module 3: Vehicle Registry */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <CarFront className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
              RTO Registry & 120+ Car Catalog
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any Indian number plate to instantly resolve regional transport offices. Pre-loaded with 120+ popular Indian car models, size segments, and OEM colors.
            </p>
            <div className="pt-2 text-xs font-semibold text-cyan-400 flex items-center gap-1">
              <span>Automatic Pricing by Segment</span>
            </div>
          </div>

          {/* Module 4: AD Campaigns */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
              Social Media AD ROI & ROAS Tracker
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track Instagram, Google Search, and WhatsApp ads. Calculate blended ROAS, cost per lead (CPL), and link incoming inquiries directly into booked detailing jobs.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-400 flex items-center gap-1">
              <span>Real-Time Marketing Analytics</span>
            </div>
          </div>

          {/* Module 5: Car Accessories */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Aftermarket Accessories & Inventory
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sell high-margin 7D floor mats, 4K dashcams, graphene boosters, and microfiber towels. Built-in stock alerts and automated profit margin calculations per unit.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Stock Alerts & 1-Click Billing</span>
            </div>
          </div>

          {/* Module 6: Accounts P&L */}
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
              Automatic & Manual P&L Accounts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated studio gross margins, raw material chemical COGS, and overhead tracking. Includes an interactive what-if simulator to model monthly break-even targets.
            </p>
            <div className="pt-2 text-xs font-semibold text-teal-400 flex items-center gap-1">
              <span>Live Financial Balance Sheet</span>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC STUDIO ROI CALCULATOR */}
      <section id="roi" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-b from-carbon-900 to-carbon-950 border border-carbon-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Interactive ROI Calculator
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              See How Much Revenue AutoShield Pro Recovers
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Calculate the additional recurring revenue your detailing studio generates through automatic warranty top-ups, add-on accessories, and streamlined bays.
            </p>
          </div>

          <div className="space-y-4 max-w-xl mx-auto text-xs">
            <div className="flex justify-between items-center text-slate-300 font-bold">
              <span>Vehicles Detailed Per Month:</span>
              <span className="text-lg font-mono text-amber-400 font-black">{carsPerMonth} Cars</span>
            </div>
            <input 
              type="range"
              min="5"
              max="100"
              step="5"
              value={carsPerMonth}
              onChange={(e) => setCarsPerMonth(Number(e.target.value))}
              className="w-full accent-amber-500 bg-carbon-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-carbon-800">
            <div className="bg-carbon-950 p-5 rounded-2xl border border-carbon-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Estimated Monthly Invoicing</span>
              <p className="text-2xl font-black text-white font-mono">{formatCurrency(monthlyRevenue)}</p>
              <span className="text-[10px] text-slate-400 block">Across detailing & PPF bays</span>
            </div>

            <div className="bg-carbon-950 p-5 rounded-2xl border border-carbon-800 text-center space-y-1">
              <span className="text-[11px] text-emerald-400 uppercase font-bold">Additional Recovered Revenue</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">+{formatCurrency(extraRevenueRecovered)}</p>
              <span className="text-[10px] text-emerald-400/80 block">From warranty top-ups & ad leads</span>
            </div>

            <div className="bg-carbon-950 p-5 rounded-2xl border border-carbon-800 text-center space-y-1">
              <span className="text-[11px] text-cyan-400 uppercase font-bold">Manager Hours Saved</span>
              <p className="text-2xl font-black text-cyan-400 font-mono">{timeSavedHours} Hours / Mo</p>
              <span className="text-[10px] text-slate-400 block">Automated billing & job cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-3xl p-10 sm:p-16 text-carbon-950 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Upgrade Your Detailing Studio?
            </h2>
            <p className="text-sm sm:text-base font-semibold text-carbon-950/80">
              Run your bays with professional confidence. Start issuing job cards, GST tax invoices, and tracking profit & loss right now.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-9 py-4 rounded-2xl bg-carbon-950 hover:bg-carbon-900 text-white font-black text-sm shadow-2xl transition-all transform hover:scale-105"
            >
              Open Studio Dashboard Now →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-carbon-800/80 py-12 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <AutoShieldLogo size={32} />
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-amber-400 transition-colors font-semibold">Studio App</Link>
          <Link to="/jobs" className="hover:text-amber-400 transition-colors font-semibold">Job Cards</Link>
          <Link to="/billing" className="hover:text-amber-400 transition-colors font-semibold">Invoices</Link>
          <Link to="/accessories" className="hover:text-amber-400 transition-colors font-semibold">Accessories</Link>
          <Link to="/ads" className="hover:text-amber-400 transition-colors font-semibold">AD Campaigns</Link>
          <Link to="/accounts" className="hover:text-amber-400 transition-colors font-semibold">Accounts P&L</Link>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          © {new Date().getFullYear()} AutoShield Pro • Automotive Detailing & PPF Suite.
        </p>
      </footer>
    </div>
  );
}
