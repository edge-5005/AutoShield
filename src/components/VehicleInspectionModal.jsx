import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Fuel, Gauge, Save } from 'lucide-react';

const INSPECTION_AREAS = [
  'Front Bumper & Grille',
  'Hood / Bonnet',
  'Windshield & Glass',
  'Roof & Sunroof',
  'Left Fender & Front Door',
  'Left Rear Door & Quarter Panel',
  'Rear Bumper & Trunk/Boot',
  'Right Quarter Panel & Rear Door',
  'Right Front Door & Fender',
  'Alloy Wheels & Tyres',
  'Headlights & Tail Lights',
  'Interior Upholstery & Dashboard'
];

export default function VehicleInspectionModal({ isOpen, onClose, initialData = {}, onSave }) {
  if (!isOpen) return null;

  const [notes, setNotes] = useState(() => {
    let parsed = {};
    if (typeof initialData === 'string') {
      try { parsed = JSON.parse(initialData); } catch (e) { parsed = {}; }
    } else if (typeof initialData === 'object' && initialData) {
      parsed = initialData;
    }
    return {
      selectedIssues: parsed.selectedIssues || {},
      customNotes: parsed.customNotes || '',
      valuablesRemoved: parsed.valuablesRemoved ?? true,
      paintCondition: parsed.paintCondition || 'Swirl Marks & Light Scratches',
      fuelLevel: parsed.fuelLevel || '50%',
      odometer: parsed.odometer || '',
    };
  });

  const toggleIssue = (area, type) => {
    setNotes(prev => {
      const current = prev.selectedIssues[area] || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];

      const newIssues = { ...prev.selectedIssues };
      if (updated.length > 0) {
        newIssues[area] = updated;
      } else {
        delete newIssues[area];
      }

      return { ...prev, selectedIssues: newIssues };
    });
  };

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pre-Delivery Vehicle Inspection (PDI)</h2>
              <p className="text-xs text-slate-400">Document pre-existing dents, scratches & client handover condition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <Fuel className="w-4 h-4 text-blue-400" /> Fuel Level at Handover
              </label>
              <select
                value={notes.fuelLevel}
                onChange={(e) => setNotes({ ...notes, fuelLevel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Reserve / Low">Reserve / Low</option>
                <option value="25%">25% (Quarter)</option>
                <option value="50%">50% (Half Tank)</option>
                <option value="75%">75% (Three Quarters)</option>
                <option value="100%">100% (Full Tank)</option>
              </select>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <Gauge className="w-4 h-4 text-emerald-400" /> Current Odometer (km)
              </label>
              <input
                type="text"
                value={notes.odometer}
                onChange={(e) => setNotes({ ...notes, odometer: e.target.value })}
                placeholder="e.g. 18,450 km"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Paint Condition
              </label>
              <select
                value={notes.paintCondition}
                onChange={(e) => setNotes({ ...notes, paintCondition: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="New Car / Showroom Finish">New Car / Showroom Finish</option>
                <option value="Swirl Marks & Light Scratches">Swirl Marks & Light Scratches</option>
                <option value="Heavy Oxidation / Neglected Paint">Heavy Oxidation / Neglected Paint</option>
                <option value="Repainted Panels Present">Repainted Panels Present</option>
                <option value="Matte / Satin Finish (No Polishing)">Matte / Satin Finish (No Polishing)</option>
              </select>
            </div>
          </div>

          {/* Checklist of areas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Panel-by-Panel Damage Markers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INSPECTION_AREAS.map((area) => {
                const issues = notes.selectedIssues[area] || [];
                return (
                  <div
                    key={area}
                    className={`p-3 rounded-xl border transition-colors ${
                      issues.length > 0
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-200 text-xs">{area}</span>
                      {issues.length > 0 && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          {issues.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Scratch', 'Dent', 'Stone Chip', 'Repainted'].map((tag) => {
                        const active = issues.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleIssue(area, tag)}
                            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                              active
                                ? 'bg-amber-500 text-slate-950 font-semibold border-amber-400'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                            }`}
                          >
                            + {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valuables & Detailed Remarks */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="valuables"
                checked={notes.valuablesRemoved}
                onChange={(e) => setNotes({ ...notes, valuablesRemoved: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <label htmlFor="valuables" className="text-xs text-slate-300 font-medium cursor-pointer">
                Valuables, Cash & Fastag/RFID verified and removed by customer prior to handover.
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Additional Inspection Remarks / Customer Handover Notes
              </label>
              <textarea
                rows={3}
                value={notes.customNotes}
                onChange={(e) => setNotes({ ...notes, customNotes: e.target.value })}
                placeholder="e.g. Customer highlighted minor scratch on front right bumper. Advised PPF wrap will mask slight swirl marks."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Inspection Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
