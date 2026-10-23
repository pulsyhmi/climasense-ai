import React from 'react';
import { X, BookOpen, Calculator, ShieldAlert, Sparkles } from 'lucide-react';
import { getScoringMethodologyDoc } from '../../utils/climateRisk.ts';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const doc = getScoringMethodologyDoc();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 id="methodology-title" className="text-lg font-bold text-slate-900">
                {doc.title}
              </h2>
              <p className="text-xs text-slate-500">
                Transparent math documentation • {doc.version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close methodology modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-600">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4">
            <h4 className="font-semibold text-emerald-900 flex items-center gap-1.5 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Purpose & Scientific Foundation
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              In this Sime Darby Hackathon prototype, risk metrics translate raw
              environmental readings into actionable human-comfort and township-level
              infrastructure preparedness scores. All mathematical formulas are deterministic
              and decoupled from UI views.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Formula Breakdown
            </h3>
            {doc.framework.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.metric}
                  </h4>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded">
                    Module Logic
                  </span>
                </div>
                <div className="p-2 bg-slate-900 text-emerald-300 font-mono text-xs rounded-lg overflow-x-auto">
                  {item.formula}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.purpose}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> ClimaSense AI demonstrates illustrative
              risk calculations for hackathon prototype testing. It does not replace official
              advisories from the Malaysian Meteorological Department (METMalaysia) or the Department
              of Environment (DOE).
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
