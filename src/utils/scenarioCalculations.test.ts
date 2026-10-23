import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScenarioOutcomes,
  SCENARIO_BASELINE,
} from './scenarioCalculations.ts';

test('scenario outcomes match baseline when inputs are zero-delta', () => {
  const outcomes = calculateScenarioOutcomes({
    tempIncreaseC: 0.0,
    rainfallIntensityPct: 0,
    greenCoveragePct: SCENARIO_BASELINE.baselineGreenCoverPct,
  });

  assert.equal(outcomes.heatMitigationC, 0);
  assert.equal(outcomes.residentialCoolingDeltaKwh, 0);
  assert.equal(outcomes.heatEmergencyDaysPerYear, SCENARIO_BASELINE.baselineHeatEmergencyDays);
  assert.ok(outcomes.compositeResilienceScore >= 60);
});

test('higher green coverage mitigates heat index and reduces flood vulnerability', () => {
  const baseline = calculateScenarioOutcomes({
    tempIncreaseC: 2.0,
    rainfallIntensityPct: 20,
    greenCoveragePct: 35,
  });

  const highGreen = calculateScenarioOutcomes({
    tempIncreaseC: 2.0,
    rainfallIntensityPct: 20,
    greenCoveragePct: 55, // +20% more canopy
  });

  assert.ok(
    highGreen.peakHeatIndexC < baseline.peakHeatIndexC,
    `High green canopy should reduce peak heat index (${highGreen.peakHeatIndexC} < ${baseline.peakHeatIndexC})`
  );

  assert.ok(
    highGreen.floodVulnerabilityScore < baseline.floodVulnerabilityScore,
    `Permeable green cover should lower flood vulnerability (${highGreen.floodVulnerabilityScore} < ${baseline.floodVulnerabilityScore})`
  );

  assert.ok(
    highGreen.compositeResilienceScore > baseline.compositeResilienceScore,
    `Resilience score should improve with green infrastructure`
  );
});

test('extreme warming and monsoon surge spikes cooling demand and flood score', () => {
  const stressed = calculateScenarioOutcomes({
    tempIncreaseC: 3.5,
    rainfallIntensityPct: 50,
    greenCoveragePct: 20,
  });

  assert.ok(stressed.residentialCoolingDeltaKwh > 50, 'Cooling energy demand should sharply increase');
  assert.ok(stressed.floodVulnerabilityScore > 60, 'Flood vulnerability should be high');
  assert.ok(stressed.compositeResilienceScore < baselineResilience(stressed.compositeResilienceScore));
});

function baselineResilience(_score: number) {
  return 85;
}
