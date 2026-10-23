/**
 * Pure helper for formatting context and parsing Gemini assistant output
 */

export interface ClimateContextPayload {
  township: {
    name: string;
    district: string;
    state: string;
    coordinates: { latitude: number; longitude: number };
    elevationMeters: number;
    masterplanAcres: number;
  };
  observations: {
    temperatureC: number | null;
    apparentTemperatureC: number | null;
    humidityPct: number | null;
    precipitationMm: number | null;
    precipitationProbPct: number | null;
    windSpeedKmh: number | null;
    windDirection: string;
    conditionText: string;
    observationTime: string;
  };
  modelledAirQuality: {
    pm25: number | null;
    pm10: number | null;
    aqi: number | null;
    sourceNotice: string;
    forecastTime: string;
  };
  indicativeRisks: {
    heatRiskLevel: string;
    heatRiskScore: number;
    rainfallRiskLevel: string;
    rainfallRiskScore: number;
    airQualityRiskLevel: string;
    airQualityRiskScore: number;
    overallResilienceScore: number;
  };
  thresholds?: {
    heatModerate: number;
    heatElevated: number;
    rainfallModerate: number;
    rainfallElevated: number;
    aqiModerate: number;
    aqiElevated: number;
  };
}

export function buildGeminiSystemInstruction(): string {
  return `You are ClimaSense AI Assistant, an environmental resilience and climate adaptation advisor for sustainable townships in Malaysia (primarily City of Elmina, Shah Alam, Selangor).

CRITICAL OPERATIONAL RULES:
1. DISTINGUISH DATA FROM RECOMMENDATIONS: Always make it visibly clear what the current measured or forecast numbers are versus what action you recommend. Use structured markdown formatting.
2. IDENTIFY MISSING INFORMATION: Never guess missing values. If a field is null, "N/A", or unavailable (such as local UV irradiance, micro-soil moisture, or in-situ ground sensors), explicitly point out that this information is currently missing or unmeasured.
3. NEVER INVENT MEASUREMENTS: Do not invent sensor readings, flash flood heights, or microclimate numbers. Only cite values provided in the prompt context.
4. NO CERTAINTY ABOUT FUTURE DISASTERS: Do not state future disasters with absolute certainty. All risk ratings provided are INDICATIVE community preparedness alerts. Always advise checking official sources (METMalaysia, Department of Irrigation and Drainage / DID, and Department of Environment / DOE) for certified statutory warnings.
5. LOCAL TOWNSHIP CONTEXT: Integrate City of Elmina features where helpful (e.g. 300-acre Central Park bioretention lakes, native rainforest canopy corridors, permeable bioswales, Denai Alam active cycling spine).
6. FORMATTING: Practical, concise, and structured. Include:
   - **Observed Climate Snapshot** (with notes on any missing data)
   - **Indicative Risk Status**
   - **Practical Recommendations** (clear bullet points for residents, outdoor activities, or home cooling)
7. SUGGESTED QUESTIONS: At the very end of your response, output a single line with 2-3 relevant follow-up questions formatted strictly as:
[SUGGESTIONS]: ["Question 1?", "Question 2?", "Question 3?"]`;
}

export function buildGeminiUserPrompt(
  userQuery: string,
  context?: Partial<ClimateContextPayload> | null
): string {
  if (!context) {
    return `Resident Question: "${userQuery}"\nPlease provide a practical, concise response for residents of City of Elmina, Shah Alam.`;
  }

  // Check for missing items safely
  const missingItems: string[] = [];
  if (context.observations?.temperatureC === null || context.observations?.temperatureC === undefined) missingItems.push('Ambient Temperature');
  if (context.observations?.apparentTemperatureC === null || context.observations?.apparentTemperatureC === undefined) missingItems.push('Apparent Heat Index');
  if (context.observations?.humidityPct === null || context.observations?.humidityPct === undefined) missingItems.push('Relative Humidity');
  if (context.observations?.precipitationMm === null || context.observations?.precipitationMm === undefined) missingItems.push('Current Precipitation');
  if (context.modelledAirQuality?.pm25 === null || context.modelledAirQuality?.pm25 === undefined) missingItems.push('PM2.5 Estimate');
  if (context.modelledAirQuality?.aqi === null || context.modelledAirQuality?.aqi === undefined) missingItems.push('Air Pollutant Index');

  const township = context.township || {
    name: 'City of Elmina',
    district: 'Shah Alam',
    state: 'Selangor',
    coordinates: { latitude: 3.1979, longitude: 101.5218 },
    masterplanAcres: 5000,
    elevationMeters: 45,
  };

  const obs = context.observations || {
    temperatureC: null,
    apparentTemperatureC: null,
    humidityPct: null,
    precipitationMm: null,
    precipitationProbPct: null,
    windSpeedKmh: null,
    windDirection: '',
    conditionText: '',
    observationTime: '',
  };

  const aq = context.modelledAirQuality || {
    pm25: null,
    pm10: null,
    aqi: null,
    sourceNotice: 'CAMS Copernicus ECMWF Atmosphere Service via Open-Meteo',
    forecastTime: '',
  };

  const risks = context.indicativeRisks || {
    heatRiskLevel: 'Low',
    heatRiskScore: 20,
    rainfallRiskLevel: 'Low',
    rainfallRiskScore: 15,
    airQualityRiskLevel: 'Low',
    airQualityRiskScore: 25,
    overallResilienceScore: 85,
  };

  return `Current Township Context:
- Township: ${township.name} (${township.district}, ${township.state})
- Coordinates: ${township.coordinates?.latitude ?? 3.1979}°N, ${township.coordinates?.longitude ?? 101.5218}°E
- Masterplan Area: ${township.masterplanAcres ?? 5000} acres, Elevation: ${township.elevationMeters ?? 45}m MSL

Available Real Weather Observations (Open-Meteo):
- Condition: ${obs.conditionText || 'N/A'}
- Ambient Temperature: ${obs.temperatureC !== null && obs.temperatureC !== undefined ? `${obs.temperatureC}°C` : 'N/A'}
- Apparent Heat Index: ${obs.apparentTemperatureC !== null && obs.apparentTemperatureC !== undefined ? `${obs.apparentTemperatureC}°C` : 'N/A'}
- Humidity: ${obs.humidityPct !== null && obs.humidityPct !== undefined ? `${obs.humidityPct}%` : 'N/A'}
- Precipitation (current): ${obs.precipitationMm !== null && obs.precipitationMm !== undefined ? `${obs.precipitationMm} mm` : 'N/A'}
- Precipitation Probability: ${obs.precipitationProbPct !== null && obs.precipitationProbPct !== undefined ? `${obs.precipitationProbPct}%` : 'N/A'}
- Wind: ${obs.windSpeedKmh !== null && obs.windSpeedKmh !== undefined ? `${obs.windSpeedKmh} km/h` : 'N/A'} (${obs.windDirection || 'N/A'})
- Weather Observation Time: ${obs.observationTime || 'N/A'}

Available Modelled Air Quality (European CAMS via Open-Meteo):
- Modelled AQI: ${aq.aqi !== null && aq.aqi !== undefined ? aq.aqi : 'N/A'}
- PM2.5: ${aq.pm25 !== null && aq.pm25 !== undefined ? `${aq.pm25} µg/m³` : 'N/A'}
- PM10: ${aq.pm10 !== null && aq.pm10 !== undefined ? `${aq.pm10} µg/m³` : 'N/A'}
- Notice: ${aq.sourceNotice || 'CAMS Copernicus ECMWF Atmosphere Service via Open-Meteo'}
- Air Quality Forecast Timestamp: ${aq.forecastTime || 'N/A'}

Calculated Indicative Risk Indicators:
- Heat Risk: ${risks.heatRiskLevel} (Score: ${risks.heatRiskScore}/100)
- Precipitation/Runoff Risk: ${risks.rainfallRiskLevel} (Score: ${risks.rainfallRiskScore}/100)
- Air Quality Risk: ${risks.airQualityRiskLevel} (Score: ${risks.airQualityRiskScore}/100)
- Township Composite Resilience Index: ${risks.overallResilienceScore}/100

Configured Indicative Thresholds:
- Heat moderate cutoff: ${context.thresholds?.heatModerate ?? 32}°C, elevated: ${context.thresholds?.heatElevated ?? 38}°C
- Rain moderate cutoff: ${context.thresholds?.rainfallModerate ?? 10}mm, elevated: ${context.thresholds?.rainfallElevated ?? 30}mm
- AQI moderate cutoff: ${context.thresholds?.aqiModerate ?? 50}, elevated: ${context.thresholds?.aqiElevated ?? 100}

Known Missing Data Fields:
${missingItems.length > 0 ? missingItems.map((m) => `- ${m}`).join('\n') : 'None (Core weather and CAMS AQI fields available)'}

Resident Question: "${userQuery}"

Please provide a practical, concise response following all operational rules.`;
}

export function parseGeminiResponse(rawText: string): {
  cleanText: string;
  suggestedActions: string[];
} {
  const match = rawText.match(/\[SUGGESTIONS\]:\s*(\[.*?\])/s);
  let suggestedActions: string[] = [];
  let cleanText = rawText;

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        suggestedActions = parsed
          .filter((item): item is string => typeof item === 'string')
          .slice(0, 4);
      }
      cleanText = rawText.replace(/\[SUGGESTIONS\]:\s*\[.*?\]/s, '').trim();
    } catch {
      // If JSON parse fails, remove the delimiter cleanly
      cleanText = rawText.replace(/\[SUGGESTIONS\]:.*$/m, '').trim();
    }
  }

  // Fallback defaults if none were parsed
  if (suggestedActions.length === 0) {
    suggestedActions = [
      "How should I prepare for today's weather?",
      'Is it safe for outdoor cycling in Elmina Central Park today?',
      'What can I do to reduce heat in my home today?',
    ];
  }

  return { cleanText, suggestedActions };
}
