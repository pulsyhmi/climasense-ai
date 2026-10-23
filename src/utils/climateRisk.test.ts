import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateApparentTemperature,
  calculateHeatRisk,
  calculateRainfallRisk,
  calculateAirQualityRisk,
  calculateOverallResilienceScore,
} from './climateRisk.ts';

test('calculateApparentTemperature computes higher heat index in high humidity', () => {
  const apparent = calculateApparentTemperature(32, 80);
  assert.ok(apparent > 32, `Apparent temp ${apparent} should exceed dry ambient 32°C`);
  assert.ok(apparent >= 38, `Apparent temp ${apparent} should be in high heat index range`);
});

test('calculateHeatRisk classifies properly into RiskLevels', () => {
  const lowRisk = calculateHeatRisk(28, 30);
  assert.equal(lowRisk.level, 'Low');

  const moderateRisk = calculateHeatRisk(31, 35);
  assert.equal(moderateRisk.level, 'Moderate');

  const elevatedRisk = calculateHeatRisk(33, 40);
  assert.equal(elevatedRisk.level, 'Elevated');

  const highRisk = calculateHeatRisk(36, 46);
  assert.equal(highRisk.level, 'High');
});

test('calculateRainfallRisk flags torrential downpours with high probability', () => {
  const dryWeather = calculateRainfallRisk(2, 10);
  assert.equal(dryWeather.level, 'Low');

  const monsoonAlert = calculateRainfallRisk(75, 90);
  assert.equal(monsoonAlert.level, 'High');
  assert.ok(monsoonAlert.score >= 80);
});

test('calculateAirQualityRisk aligns with Malaysian API brackets', () => {
  const goodAir = calculateAirQualityRisk(38, 9);
  assert.equal(goodAir.level, 'Low');

  const moderateAir = calculateAirQualityRisk(75, 23);
  assert.equal(moderateAir.level, 'Moderate');

  const unhealthyAir = calculateAirQualityRisk(145, 65);
  assert.equal(unhealthyAir.level, 'Elevated');

  const hazardousAir = calculateAirQualityRisk(220, 110);
  assert.equal(hazardousAir.level, 'High');
});

test('calculateOverallResilienceScore provides bounded index 0-100', () => {
  const favorableScore = calculateOverallResilienceScore(20, 20, 20, 20, 45);
  assert.ok(favorableScore >= 70, `Score ${favorableScore} should be strong`);

  const stressedScore = calculateOverallResilienceScore(85, 90, 80, 80, 20);
  assert.ok(stressedScore < 45, `Score ${stressedScore} should indicate low resilience under multi-stress`);
});
