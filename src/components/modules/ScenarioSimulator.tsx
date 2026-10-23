import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Thermometer,
  CloudRain,
  TreePine,
  RotateCcw,
  ShieldAlert,
  Zap,
  Waves,
  Sparkles,
  Info,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { ScenarioInputs } from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import {
  calculateScenarioOutcomes,
  SCENARIO_BASELINE,
  SCENARIO_PRESETS,
} from '../../utils/scenarioCalculations.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';

interface ScenarioSimulatorProps {
  township: TownshipProfile;
  onOpenMethodology: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  township,
  onOpenMethodology,
}) => {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    tempIncreaseC: 0.0,
    rainfallIntensityPct: 0,
    greenCoveragePct: township.baselineCanopyCoveragePct,
  });

  const outcomes = calculateScenarioOutcomes(inputs);

  const handleReset = () => {
    setInputs({
      tempIncreaseC: 0.0,
      rainfallIntensityPct: 0,
      greenCoveragePct: township.baselineCanopyCoveragePct,
    });
  };

  const applyPreset = (presetInputs: ScenarioInputs) => {
    setInputs(presetInputs);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider border border-emerald-200/60">
              Interactive Stress-Testing
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-medium">
              Simulated Scenarios • Not Engineering Predictions
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Climate Scenario & Resilience Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
            Stress-test {township.name} against climate warming, monsoon precipitation surges, and examine how urban canopy & permeable sponge infrastructure mitigate risks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4">
        <span className="text-xs font-bold text-slate-600 block mb-2.5">
          Select Climate Projection Preset:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SCENARIO_PRESETS.map((preset, idx) => {
            const isActive =
              inputs.tempIncreaseC === preset.inputs.tempIncreaseC &&
              inputs.rainfallIntensityPct === preset.inputs.rainfallIntensityPct &&
              inputs.greenCoveragePct === preset.inputs.greenCoveragePct;

            return (
              <button
                key={idx}
                onClick={() => applyPreset(preset.inputs)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C8102E] text-white border-red-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate">
                    {preset.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {preset.badge}
                  </span>
                </div>
                <p
                  className={`text-[11px] line-clamp-2 leading-tight ${
                    isActive ? 'text-emerald-100' : 'text-slate-500'
                  }`}
                >
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slider 1: Temperature Rise */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Temperature Increase
                </h3>
                <span className="text-xs text-slate-500">
                  Global warming delta
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-orange-700 font-mono">
              +{inputs.tempIncreaseC.toFixed(1)}°C
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="temp-slider" className="sr-only">
              Adjust Temperature Increase
            </label>
            <input
              id="temp-slider"
              type="range"
              min="0"
              max="4.0"
              step="0.5"
              value={inputs.tempIncreaseC}
              onChange={(e) =>
                setInputs({ ...inputs, tempIncreaseC: parseFloat(e.target.value) })
              }
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>+0.0°C (Current)</span>
              <span>+2.0°C</span>
              <span>+4.0°C (Severe)</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            Shifts baseline tropical peak day from {SCENARIO_BASELINE.ambientTempC}°C to{' '}
            <strong>{(SCENARIO_BASELINE.ambientTempC + inputs.tempIncreaseC).toFixed(1)}°C</strong>.
          </p>
        </div>

        {/* Slider 2: Rainfall Surge */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monsoon Rainfall Intensity
                </h3>
                <span className="text-xs text-slate-500">
                  Convective cloudburst surge
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-blue-700 font-mono">
              +{inputs.rainfallIntensityPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rain-slider" className="sr-only">
              Adjust Rainfall Intensity
            </label>
            <input
              id="rain-slider"
              type="range"
              min="0"
              max="60"
              step="5"
              value={inputs.rainfallIntensityPct}
              onChange={(e) =>
                setInputs({ ...inputs, rainfallIntensityPct: parseInt(e.target.value, 10) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>+0% Normal</span>
              <span>+30% Heavy</span>
              <span>+60% Extreme</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            Tests peak discharge runoff rate against Elmina bioretention lake overflow thresholds.
          </p>
        </div>

        {/* Slider 3: Green Canopy & Permeable Cover */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Green Canopy & Sponge Area
                </h3>
                <span className="text-xs text-slate-500">
                  Park forest & bioswale fraction
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-800 font-mono">
              {inputs.greenCoveragePct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="green-slider" className="sr-only">
              Adjust Green Canopy Coverage
            </label>
            <input
              id="green-slider"
              type="range"
              min="15"
              max="65"
              step="5"
              value={inputs.greenCoveragePct}
              onChange={(e) =>
                setInputs({ ...inputs, greenCoveragePct: parseInt(e.target.value, 10) })
              }
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>15% (Deforested)</span>
              <span>35% (Baseline)</span>
              <span>65% (Optimal)</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            Provides estimated{' '}
            <strong className="text-emerald-800">
              {outcomes.heatMitigationC > 0 ? `-${outcomes.heatMitigationC}°C` : '+0.0°C'}
            </strong>{' '}
            canopy evapotranspiration cooling offset.
          </p>
        </div>
      </div>

      {/* Dynamic Comparison Output Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">
            Simulated Impact vs. 2026 Normal Baseline
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Dynamic Mathematical Projection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Peak Heat Index */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Peak Apparent Heat Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {outcomes.peakHeatIndexC}°C
              </span>
              <span className="text-xs font-semibold text-slate-400">
                vs {SCENARIO_BASELINE.baselinePeakHeatIndexC}°C base
              </span>
            </div>
            <div className="text-xs pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">
                Mitigation:{' '}
                <strong className="text-emerald-700">
                  {outcomes.heatMitigationC > 0 ? `-${outcomes.heatMitigationC}°C` : 'None'}
                </strong>
              </span>
              <RiskBadge
                level={
                  outcomes.peakHeatIndexC > 44
                    ? 'High'
                    : outcomes.peakHeatIndexC > 38
                    ? 'Elevated'
                    : 'Moderate'
                }
                size="sm"
              />
            </div>
          </div>

          {/* Runoff / Flood Vulnerability */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Runoff Flood Vulnerability
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {outcomes.floodVulnerabilityScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / 100 (base: {SCENARIO_BASELINE.baselineFloodVulnerabilityScore})
              </span>
            </div>
            <div className="text-xs pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">
                Stormwater absorbed:{' '}
                <strong className="text-blue-700">
                  {outcomes.stormwaterRetainedPct}%
                </strong>
              </span>
              <RiskBadge
                level={
                  outcomes.floodVulnerabilityScore > 70
                    ? 'High'
                    : outcomes.floodVulnerabilityScore > 45
                    ? 'Elevated'
                    : 'Low'
                }
                size="sm"
              />
            </div>
          </div>

          {/* Household Energy Cost Delta */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              AC Cooling Energy Delta
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black ${
                  outcomes.residentialCoolingDeltaKwh > 0
                    ? 'text-rose-700'
                    : 'text-emerald-700'
                }`}
              >
                {outcomes.residentialCoolingDeltaKwh > 0 ? '+' : ''}
                {outcomes.residentialCoolingDeltaKwh}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                kWh/home/mo
              </span>
            </div>
            <div className="text-xs pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">
                Bill Impact:{' '}
                <strong>
                  {outcomes.residentialCoolingDeltaKwh > 0
                    ? `+RM${Math.round(outcomes.residentialCoolingDeltaKwh * 0.52)}/mo`
                    : 'Neutral / Savings'}
                </strong>
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* Heat Emergency Days */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Heat Emergency Days (&gt;38°C)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {outcomes.heatEmergencyDaysPerYear}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                days/year (base: {SCENARIO_BASELINE.baselineHeatEmergencyDays})
              </span>
            </div>
            <div className="text-xs pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">
                Township Resilience:{' '}
                <strong className="text-emerald-700">
                  {outcomes.compositeResilienceScore}/100
                </strong>
              </span>
              <RiskBadge
                level={
                  outcomes.compositeResilienceScore > 75
                    ? 'Low'
                    : outcomes.compositeResilienceScore > 50
                    ? 'Moderate'
                    : 'Elevated'
                }
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Comparative Impact Breakdown Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Comparative Vulnerability Indicators: Baseline vs. Simulated
        </h3>

        <div className="space-y-4 pt-2">
          {/* Bar 1: Peak Heat Index */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Apparent Heat Index</span>
              <span>
                Simulated: <strong className="text-slate-900">{outcomes.peakHeatIndexC}°C</strong> (Baseline: {SCENARIO_BASELINE.baselinePeakHeatIndexC}°C)
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (SCENARIO_BASELINE.baselinePeakHeatIndexC / 50) * 100)}%` }}
                title="Baseline Heat"
              />
              <div
                className={`h-full transition-all duration-300 ${
                  outcomes.peakHeatIndexC >= SCENARIO_BASELINE.baselinePeakHeatIndexC
                    ? 'bg-rose-500'
                    : 'bg-teal-400'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.abs(outcomes.peakHeatIndexC - SCENARIO_BASELINE.baselinePeakHeatIndexC) * 3
                  )}%`,
                }}
                title="Simulated Delta"
              />
            </div>
          </div>

          {/* Bar 2: Runoff Flood Risk */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Runoff & Flash-Ponding Vulnerability</span>
              <span>
                Simulated: <strong className="text-slate-900">{outcomes.floodVulnerabilityScore}/100</strong> (Baseline: {SCENARIO_BASELINE.baselineFloodVulnerabilityScore}/100)
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${SCENARIO_BASELINE.baselineFloodVulnerabilityScore}%` }}
                title="Baseline Runoff"
              />
              <div
                className={`h-full transition-all duration-300 ${
                  outcomes.floodVulnerabilityScore >= SCENARIO_BASELINE.baselineFloodVulnerabilityScore
                    ? 'bg-amber-500'
                    : 'bg-emerald-400'
                }`}
                style={{
                  width: `${Math.abs(outcomes.floodVulnerabilityScore - SCENARIO_BASELINE.baselineFloodVulnerabilityScore)}%`,
                }}
                title="Simulated Runoff Shift"
              />
            </div>
          </div>

          {/* Bar 3: Adaptive Sponge Capacity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Stormwater Retained by Bio-Sponge Lakes</span>
              <span>
                Capacity: <strong className="text-emerald-800">{outcomes.stormwaterRetainedPct}%</strong>
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${outcomes.stormwaterRetainedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer Note */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 mt-4">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Transparency Notice:</strong> Simulator outcomes are parameterized illustrative representations developed for hackathon demonstration. They model relative microclimate responses rather than certified hydraulic or meteorological engineering simulations.
          </div>
        </div>
      </div>
    </div>
  );
};
