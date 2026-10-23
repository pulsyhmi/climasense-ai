export interface ScenarioInputs {
  tempIncreaseC: number;      // 0.0 to 4.0 °C
  rainfallIntensityPct: number; // 0 to 60 %
  greenCoveragePct: number;    // 15 to 65 %
}

export interface ScenarioOutcomes {
  peakHeatIndexC: number;
  floodVulnerabilityScore: number; // 0 - 100
  residentialCoolingDeltaKwh: number; // Monthly extra kWh per household
  heatEmergencyDaysPerYear: number;
  compositeResilienceScore: number; // 0 - 100
  heatMitigationC: number;
  stormwaterRetainedPct: number;
}

export const SCENARIO_BASELINE = {
  ambientTempC: 32.5,
  humidityPct: 76,
  baselineGreenCoverPct: 35, // Elmina masterplan baseline
  baselineRainfallIntensity: 100, // 100% index
  baselinePeakHeatIndexC: 39.2,
  baselineFloodVulnerabilityScore: 38,
  baselineCoolingEnergyMonthlyKwh: 340,
  baselineHeatEmergencyDays: 22,
};

/**
 * Calculates scenario outcomes based on user adjustments
 * All equations are illustrative and documented for hackathon prototype transparency
 */
export function calculateScenarioOutcomes(
  inputs: ScenarioInputs,
  baseline = SCENARIO_BASELINE
): ScenarioOutcomes {
  const { tempIncreaseC, rainfallIntensityPct, greenCoveragePct } = inputs;

  // 1. Urban Green Cooling Offset: Each 10% increase in tree canopy over baseline provides ~0.9°C cooling
  const greenCoverDelta = greenCoveragePct - baseline.baselineGreenCoverPct;
  const coolingMitigationC = Math.max(-0.5, greenCoverDelta * 0.09); // in °C

  // Effective simulated ambient
  const simulatedAmbientC = baseline.ambientTempC + tempIncreaseC - coolingMitigationC;

  // Approximate heat index under humid tropical conditions
  // Simple humidity coupled rise
  const peakHeatIndexC = Number(
    Math.max(
      30,
      baseline.baselinePeakHeatIndexC +
        tempIncreaseC * 1.35 -
        coolingMitigationC * 1.5
    ).toFixed(1)
  );

  // 2. Stormwater Runoff & Flood Vulnerability (0 to 100)
  // Higher rainfall increases runoff pressure (+0.75 per %),
  // permeable green coverage acts as a sponge buffer (-0.85 per %)
  const rainStressIncrease = rainfallIntensityPct * 0.78;
  const greenRetentionBonus = greenCoverDelta * 0.88;

  const rawFloodVulnerability =
    baseline.baselineFloodVulnerabilityScore +
    rainStressIncrease -
    greenRetentionBonus;

  const floodVulnerabilityScore = Math.max(
    5,
    Math.min(98, Math.round(rawFloodVulnerability))
  );

  // Percentage of total stormwater retained by soil, bioswales, and retention lakes
  const stormwaterRetainedPct = Math.max(
    30,
    Math.min(95, Math.round(62 + greenCoverDelta * 0.7 - rainfallIntensityPct * 0.25))
  );

  // 3. Residential Cooling Energy Demand (kWh/month per average household)
  // Each 1.0°C effective increase adds ~26 kWh/month to AC compressor load
  const netThermalShift = tempIncreaseC - coolingMitigationC;
  const residentialCoolingDeltaKwh = Math.round(
    Math.max(-50, netThermalShift * 28.5)
  );

  // 4. Heat Emergency Days (>38°C apparent heat index)
  // Scaled non-linearly with temperature surge, dampened by canopy shading
  const heatDayFactor = Math.max(0, tempIncreaseC * 12 - greenCoverDelta * 0.6);
  const heatEmergencyDaysPerYear = Math.max(
    4,
    Math.min(180, Math.round(baseline.baselineHeatEmergencyDays + heatDayFactor))
  );

  // 5. Composite Resilience Score (0 to 100)
  // Evaluates overall township adaptive capacity under this scenario
  const vulnerabilityFactor =
    floodVulnerabilityScore * 0.45 +
    (peakHeatIndexC / 50) * 100 * 0.35 +
    (heatEmergencyDaysPerYear / 180) * 100 * 0.2;

  const greenAdaptationCredit = (greenCoveragePct / 65) * 30;
  const compositeResilienceScore = Math.max(
    12,
    Math.min(96, Math.round(100 - vulnerabilityFactor * 0.85 + greenAdaptationCredit))
  );

  return {
    peakHeatIndexC,
    floodVulnerabilityScore,
    residentialCoolingDeltaKwh,
    heatEmergencyDaysPerYear,
    compositeResilienceScore,
    heatMitigationC: Number(coolingMitigationC.toFixed(2)),
    stormwaterRetainedPct,
  };
}

export const SCENARIO_PRESETS: Array<{
  name: string;
  badge: string;
  inputs: ScenarioInputs;
  description: string;
}> = [
  {
    name: 'Current Baseline',
    badge: '2026 Normal',
    inputs: {
      tempIncreaseC: 0.0,
      rainfallIntensityPct: 0,
      greenCoveragePct: 35,
    },
    description: 'City of Elmina standard operating conditions under current 35% park and green coverage.',
  },
  {
    name: 'Mid-Century Warming',
    badge: '+1.5°C IPCC',
    inputs: {
      tempIncreaseC: 1.5,
      rainfallIntensityPct: 15,
      greenCoveragePct: 35,
    },
    description: 'Moderate global warming projection with standard urban infrastructure.',
  },
  {
    name: 'Monsoon Flash-Flood Surge',
    badge: '+40% Rainfall',
    inputs: {
      tempIncreaseC: 1.0,
      rainfallIntensityPct: 40,
      greenCoveragePct: 30,
    },
    description: 'High convective monsoon event stress-testing township drainage swales and retention lakes.',
  },
  {
    name: 'Sponge Township Target',
    badge: '55% Elmina Green',
    inputs: {
      tempIncreaseC: 1.5,
      rainfallIntensityPct: 25,
      greenCoveragePct: 55,
    },
    description: 'Maximizes bio-sponge swales, 300-acre Central Park tree planting, and permeable pavements.',
  },
];
