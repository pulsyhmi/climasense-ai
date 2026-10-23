import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGeminiSystemInstruction,
  buildGeminiUserPrompt,
  parseGeminiResponse,
} from './geminiPrompt.ts';
import type { ClimateContextPayload } from './geminiPrompt.ts';

test('buildGeminiSystemInstruction enforces distinguishing data from recommendations and avoiding disaster claims', () => {
  const instruction = buildGeminiSystemInstruction();
  assert.ok(instruction.includes('DISTINGUISH DATA FROM RECOMMENDATIONS'));
  assert.ok(instruction.includes('NO CERTAINTY ABOUT FUTURE DISASTERS'));
  assert.ok(instruction.includes('IDENTIFY MISSING INFORMATION'));
  assert.ok(instruction.includes('NEVER INVENT MEASUREMENTS'));
});

test('buildGeminiUserPrompt formats context and identifies missing values', () => {
  const sampleContext: ClimateContextPayload = {
    township: {
      name: 'City of Elmina',
      district: 'Shah Alam',
      state: 'Selangor',
      coordinates: { latitude: 3.18301, longitude: 101.52559 },
      elevationMeters: 48,
      masterplanAcres: 5000,
    },
    observations: {
      temperatureC: 29.4,
      apparentTemperatureC: 34.3,
      humidityPct: 73,
      precipitationMm: 0.2,
      precipitationProbPct: 75,
      windSpeedKmh: 8.4,
      windDirection: 'SSW (199°)',
      conditionText: 'Moderate Drizzle',
      observationTime: 'Mon, 19 Oct, 11:30 pm MYT',
    },
    modelledAirQuality: {
      pm25: 59.6,
      pm10: 61.2,
      aqi: 184,
      sourceNotice: 'Modelled CAMS forecast',
      forecastTime: 'Mon, 19 Oct, 11:00 pm MYT',
    },
    indicativeRisks: {
      heatRiskLevel: 'Moderate',
      heatRiskScore: 48,
      rainfallRiskLevel: 'Moderate',
      rainfallRiskScore: 45,
      airQualityRiskLevel: 'Elevated',
      airQualityRiskScore: 75,
      overallResilienceScore: 68,
    },
  };

  const prompt = buildGeminiUserPrompt('Can I cycle outside right now?', sampleContext);
  assert.ok(prompt.includes('City of Elmina'));
  assert.ok(prompt.includes('29.4°C'));
  assert.ok(prompt.includes('Moderate Drizzle'));
  assert.ok(prompt.includes('Can I cycle outside right now?'));
});

test('parseGeminiResponse extracts suggestions and returns clean message', () => {
  const raw = `Here is your climate advisory.

Stay hydrated and carry an umbrella.

[SUGGESTIONS]: ["What about tomorrow's rain?", "Where are the shaded corridors?"]`;

  const { cleanText, suggestedActions } = parseGeminiResponse(raw);
  assert.equal(cleanText, 'Here is your climate advisory.\n\nStay hydrated and carry an umbrella.');
  assert.equal(suggestedActions.length, 2);
  assert.equal(suggestedActions[0], "What about tomorrow's rain?");
  assert.equal(suggestedActions[1], 'Where are the shaded corridors?');
});
