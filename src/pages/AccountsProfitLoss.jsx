import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Plus, 
  Calendar, CreditCard, Filter, ArrowUpRight, ArrowDownRight, 
  Building, Users, Zap, ShieldCheck, RefreshCw, Sliders, CheckCircle2,
  Receipt, Wallet
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const EXPENSE_CATEGORIES = [
  'Rent & Studio Lease',
  'Staff Salaries & Detailer Wages',
  'Ceramic & PPF Chemicals / Raw Materials',
  'Electricity & Power Utilities',
  'Ad Campaigns & Social Media Marketing',
  'Equipment & Polisher Maintenance',
  'Shop Supplies & Tools',
  'Miscellaneous'
];

export default function AccountsProfitLoss() {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'manual' | 'expenses'
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Simulation State
  const [simInputs, setSimInputs] = useState({
    manual_revenue: 350000,
    material_cost_pct: 18,
    rent_expense: 65000,
    salaries_expense: 85000,
    marketing_ad_expense: 25000,
    utility_expense: 14000,
    other_expenses: 8000,
    tax_gst_rate: 18
  });
  const [simResult, setSimResult] = useState(null);

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Rent & Studio Lease',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_mode: 'Bank Transfer',
    vendor_name: '',
    receipt_ref: '',
    notes: ''
  });

  useEffect(() => {
    loadAccountsData();
  }, []);

  const loadAccountsData = async () => {
    try {
      setLoading(true);
      const [sumData, expData] = await Promise.all([
        api.getAccountSummary(),
        api.getExpenses()
      ]);
      setSummary(sumData);
      setExpenses(expData);
      runManualSimulation(simInputs);
    } catch (err) {
      console.error('Error loading financial summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const runManualSimulation = async (inputs) => {
    try {
      const res = await api.simulatePnL(inputs);
      setSimResult(res.simulation);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleSimInputChange = (field, val) => {
    const updated = { ...simInputs, [field]: parseFloat(val) || 0 };
    setSimInputs(updated);
    runManualSimulation(updated);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.createExpense(expenseForm);
      setIsExpenseModalOpen(false);
      setExpenseForm({
        title: '',
        category: 'Rent & Studio Lease',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Bank Transfer',
        vendor_name: '',
        receipt_ref: '',
        notes: ''
      });
      loadAccountsData();
    } catch (err) {
      alert(err.message || 'Error recording expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      await api.deleteExpense(id);
      loadAccountsData();
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  const rev = summary?.revenue || { total_invoiced: 0, total_collected: 0, pending_receivables: 0 };
  const cogs = summary?.cogs || { estimated_material_cost: 0, gross_profit: 0, gross_margin_pct: 0 };
  const exp = summary?.expenses || { total_operating_expenses: 0, breakdown_by_category: {} };
  const net = summary?.net_financials || { net_profit: 0, net_profit_margin_pct: 0, is_profitable: true };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-amber-500" />
            <span>Studio Accounts & Profit / Loss Statement</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automatic P&L analysis from invoices, material COGS & operational studio expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-carbon-900 border border-carbon-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'auto'
                  ? 'bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Automatic Live P&L
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual P&L Simulator
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense Tracker ({expenses.length})
            </button>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-amber-400 border border-carbon-700 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* AUTOMATIC LIVE P&L VIEW */}
      {activeTab === 'auto' && (
        <div className="space-y-6">
          {/* Executive P&L Scoreboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Gross Invoiced Revenue
              </span>
              <p className="text-xl font-black text-white font-mono">
                {formatCurrency(rev.total_invoiced)}
              </p>
              <span className="text-[11px] text-emerald-400 mt-2 block font-semibold">
                Collected: {formatCurrency(rev.total_collected)}
              </span>
            </div>

            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Material COGS
              </span>
              <p className="text-xl font-black text-amber-300 font-mono">
                {formatCurrency(cogs.estimated_material_cost)}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Chemicals, PPF rolls (~18% of revenue)
              </span>
            </div>

            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-600"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Studio Operating Expenses
              </span>
              <p className="text-xl font-black text-rose-400 font-mono">
                {formatCurrency(exp.total_operating_expenses)}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Rent, Salaries, Power & Marketing
              </span>
            </div>

            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${net.is_profitable ? 'from-emerald-400 to-teal-300' : 'from-rose-500 to-red-600'}`}></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Net Operating Profit
              </span>
              <p className={`text-xl font-black font-mono ${net.is_profitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(net.net_profit)}
              </p>
              <span className={`text-[11px] mt-2 block font-bold ${net.is_profitable ? 'text-emerald-300' : 'text-rose-300'}`}>
                {net.net_profit_margin_pct}% Net Profit Margin
              </span>
            </div>
          </div>

          {/* Revenue Stream Breakdown vs Expenses Cost Centers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Stream Breakdown */}
            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Revenue by Service Stream</span>
              </h2>

              <div className="space-y-3">
                {Object.entries(rev.breakdown_by_service || {}).map(([service, amount]) => {
                  const pct = rev.total_invoiced > 0 ? ((amount / rev.total_invoiced) * 100).toFixed(1) : 0;
                  return (
                    <div key={service} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{service}</span>
                        <span className="text-white font-mono font-bold">{formatCurrency(amount)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-carbon-950 rounded-full h-2 overflow-hidden border border-carbon-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expenses Cost Centers */}
            <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Studio Expenses by Cost Center</span>
              </h2>

              <div className="space-y-3">
                {Object.entries(exp.breakdown_by_category || {}).map(([cat, amount]) => {
                  const pct = exp.total_operating_expenses > 0 ? ((amount / exp.total_operating_expenses) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[220px]">{cat}</span>
                        <span className="text-rose-400 font-mono font-bold">{formatCurrency(amount)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-carbon-950 rounded-full h-2 overflow-hidden border border-carbon-800">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-600 h-2 rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL P&L SIMULATOR VIEW */}
      {activeTab === 'manual' && (
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon space-y-6">
          <div className="flex items-start justify-between border-b border-carbon-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>Interactive Studio Financial Planner & What-If Simulator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simulate studio revenue targets, calculate monthly break-even points, and test how expanding bays or staff impacts your bottom-line net profit.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
              Dynamic Model
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-2 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Target Monthly Invoiced Revenue (₹): <span className="font-mono text-amber-400 font-bold">{formatCurrency(simInputs.manual_revenue)}</span>
                </label>
                <input
                  type="range"
                  min="100000"
                  max="1500000"
                  step="25000"
                  value={simInputs.manual_revenue}
                  onChange={(e) => handleSimInputChange('manual_revenue', e.target.value)}
                  className="w-full accent-amber-500 bg-carbon-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-carbon-800">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Studio Rent & Bay Lease (₹)</label>
                  <input
                    type="number"
                    value={simInputs.rent_expense}
                    onChange={(e) => handleSimInputChange('rent_expense', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Staff & Detailer Payroll (₹)</label>
                  <input
                    type="number"
                    value={simInputs.salaries_expense}
                    onChange={(e) => handleSimInputChange('salaries_expense', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Digital Marketing & Ads Spend (₹)</label>
                  <input
                    type="number"
                    value={simInputs.marketing_ad_expense}
                    onChange={(e) => handleSimInputChange('marketing_ad_expense', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">3-Phase Power & Compressor Utilities (₹)</label>
                  <input
                    type="number"
                    value={simInputs.utility_expense}
                    onChange={(e) => handleSimInputChange('utility_expense', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Raw Material & PPF Cost (% of Revenue)</label>
                  <input
                    type="number"
                    value={simInputs.material_cost_pct}
                    onChange={(e) => handleSimInputChange('material_cost_pct', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Other Overheads / Tool Depreciation (₹)</label>
                  <input
                    type="number"
                    value={simInputs.other_expenses}
                    onChange={(e) => handleSimInputChange('other_expenses', e.target.value)}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            {simResult && (
              <div className="bg-carbon-950 border border-carbon-800 rounded-2xl p-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block border-b border-carbon-800 pb-2">
                  Simulation Outcome
                </span>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Profit (Post-Materials):</span>
                    <strong className="text-white font-mono">{formatCurrency(simResult.gross_profit)}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Fixed Overheads:</span>
                    <strong className="text-rose-400 font-mono">-{formatCurrency(simResult.total_overheads)}</strong>
                  </div>

                  <div className="pt-2 border-t border-carbon-800 flex justify-between items-center">
                    <span className="font-bold text-white">Projected Net Profit:</span>
                    <span className={`text-base font-black font-mono ${simResult.is_profitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(simResult.net_profit)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Projected Margin:</span>
                    <span className="font-bold text-amber-300 font-mono">{simResult.net_margin_pct}%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800 space-y-1 mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Break-Even Target</span>
                    <p className="text-sm font-extrabold text-white font-mono">
                      {formatCurrency(simResult.breakeven_revenue)}
                    </p>
                    <p className="text-[10px] text-slate-400">Minimum invoicing needed to cover all overheads & material costs.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPENSE TRACKER VIEW */}
      {activeTab === 'expenses' && (
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-6 shadow-carbon space-y-4">
          <div className="flex items-center justify-between border-b border-carbon-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                <span>Recorded Studio Expenses</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Detailed ledger of rent, salaries, chemicals, tools & utilities</p>
            </div>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-bold text-xs shadow-ceramic"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Expense</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No expenses logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-carbon-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Expense Title</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Mode / Vendor</th>
                    <th className="pb-3 font-semibold text-right">Amount (₹)</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800/80">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-carbon-800/40 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-white block">{e.title}</span>
                        {e.notes && <span className="text-[11px] text-slate-500">{e.notes}</span>}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-carbon-950 border border-carbon-800 text-amber-300 text-[10px] font-medium">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-400">{e.date}</td>
                      <td className="py-3 text-slate-300">
                        <span>{e.payment_mode}</span>
                        {e.vendor_name && <span className="text-slate-500 text-[11px] block">{e.vendor_name}</span>}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-400 text-sm">
                        -{formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                          title="Delete entry"
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                <span>Record Studio Operating Expense</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Expense Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. November Detailing Bay Lease"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cost Center Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 65000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expense Date *</label>
                  <input
                    required
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Mode</label>
                  <select
                    value={expenseForm.payment_mode}
                    onChange={(e) => setExpenseForm({ ...expenseForm, payment_mode: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI (GooglePay / PhonePe)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash / Petty Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  placeholder="e.g. BESCOM / 3M Chemicals Distributor"
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes / Receipt Voucher No.</label>
                <input
                  type="text"
                  placeholder="e.g. Bill #4412 paid via HDFC studio account"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-bold shadow-ceramic"
                >
                  Save Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
