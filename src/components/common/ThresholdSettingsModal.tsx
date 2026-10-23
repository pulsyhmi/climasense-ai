import React from 'react';
import { X, Sliders, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  RiskThresholdConfig,
  DEFAULT_RISK_THRESHOLDS,
  INDICATIVE_RISK_DISCLAIMER,
} from '../../config/riskThresholds.ts';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: RiskThresholdConfig;
  onUpdateThresholds: (updated: RiskThresholdConfig) => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onUpdateThresholds,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateThresholds(DEFAULT_RISK_THRESHOLDS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="threshold-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="threshold-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                Configurable Risk Thresholds
              </h2>
              <p className="text-xs text-slate-500">
                Customise indicative trigger values for local sensitivity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close thresholds modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Indicative Disclaimer Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Indicative Notice:</strong> {INDICATIVE_RISK_DISCLAIMER}
            </div>
          </div>

          {/* Section 1: Heat Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Thermal & Heat Stress Cutoffs (°C Apparent)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Moderate (°C)
                </label>
                <input
                  type="number"
                  min="26"
                  max="36"
                  step="1"
                  value={thresholds.heat.moderateThresholdC}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      heat: {
                        ...thresholds.heat,
                        moderateThresholdC: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Elevated (°C)
                </label>
                <input
                  type="number"
                  min="34"
                  max="42"
                  step="1"
                  value={thresholds.heat.elevatedThresholdC}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      heat: {
                        ...thresholds.heat,
                        elevatedThresholdC: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Severe (°C)
                </label>
                <input
                  type="number"
                  min="40"
                  max="48"
                  step="1"
                  value={thresholds.heat.highThresholdC}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      heat: {
                        ...thresholds.heat,
                        highThresholdC: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rainfall Thresholds */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Precipitation & Runoff Cutoffs (mm / 24h)
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Moderate (mm)
                </label>
                <input
                  type="number"
                  min="5"
                  max="25"
                  step="5"
                  value={thresholds.rainfall.moderatePrecipMm}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      rainfall: {
                        ...thresholds.rainfall,
                        moderatePrecipMm: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Elevated (mm)
                </label>
                <input
                  type="number"
                  min="20"
                  max="50"
                  step="5"
                  value={thresholds.rainfall.elevatedPrecipMm}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      rainfall: {
                        ...thresholds.rainfall,
                        elevatedPrecipMm: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  High Alert (mm)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  step="10"
                  value={thresholds.rainfall.highPrecipMm}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      rainfall: {
                        ...thresholds.rainfall,
                        highPrecipMm: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Air Quality Thresholds */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Air Quality Cutoffs (Modelled Index)
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Moderate API
                </label>
                <input
                  type="number"
                  min="30"
                  max="80"
                  step="5"
                  value={thresholds.airQuality.moderateAqi}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      airQuality: {
                        ...thresholds.airQuality,
                        moderateAqi: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Unhealthy API
                </label>
                <input
                  type="number"
                  min="80"
                  max="150"
                  step="5"
                  value={thresholds.airQuality.elevatedAqi}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      airQuality: {
                        ...thresholds.airQuality,
                        elevatedAqi: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  PM2.5 Caution (µg)
                </label>
                <input
                  type="number"
                  min="15"
                  max="60"
                  step="5"
                  value={thresholds.airQuality.pm25ElevatedUgM3}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      airQuality: {
                        ...thresholds.airQuality,
                        pm25ElevatedUgM3: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full font-bold text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
