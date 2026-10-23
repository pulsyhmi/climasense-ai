import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWmoWeatherDescription,
  getWindDirectionCardinal,
  formatMytTime,
} from './climateService.ts';

test('getWmoWeatherDescription maps WMO codes correctly', () => {
  assert.equal(getWmoWeatherDescription(0), 'Clear Sky');
  assert.equal(getWmoWeatherDescription(2), 'Partly Cloudy');
  assert.equal(getWmoWeatherDescription(63), 'Moderate Rain');
  assert.equal(getWmoWeatherDescription(95), 'Thunderstorm');
  assert.equal(getWmoWeatherDescription(null), 'Unknown Atmospheric Condition');
});

test('getWindDirectionCardinal converts degrees accurately', () => {
  assert.equal(getWindDirectionCardinal(0), 'N (0°)');
  assert.equal(getWindDirectionCardinal(90), 'E (90°)');
  assert.equal(getWindDirectionCardinal(180), 'S (180°)');
  assert.equal(getWindDirectionCardinal(245), 'WSW (245°)');
  assert.equal(getWindDirectionCardinal(null), 'N/A');
});

test('formatMytTime handles ISO string formatting', () => {
  const formatted = formatMytTime('2026-10-19T14:30:00Z');
  assert.ok(formatted.includes('MYT'), `Expected MYT in formatted string: ${formatted}`);
});
