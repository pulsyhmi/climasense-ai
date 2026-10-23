/**
 * Configurable Climate Risk Thresholds for ClimaSense AI
 * All risk classifications generated using these thresholds are INDICATIVE
 * and do not constitute official meteorological warnings or emergency declarations.
 */

export interface RiskThresholdConfig {
  heat: {
    moderateThresholdC: number;  // Default: 32°C apparent temperature
    elevatedThresholdC: number;  // Default: 38°C apparent temperature
    highThresholdC: number;      // Default: 44°C apparent temperature
  };
  rainfall: {
    moderatePrecipMm: number;    // Default: 10 mm 24h accumulation
    elevatedPrecipMm: number;    // Default: 30 mm 24h accumulation
    highPrecipMm: number;        // Default: 60 mm 24h accumulation
    elevatedProbPct: number;     // Default: 70% chance
  };
  airQuality: {
    // Standard Malaysian Air Pollutant Index (API) / US AQI breakpoints
    moderateAqi: number;         // Default: 50
    elevatedAqi: number;         // Default: 100
    highAqi: number;             // Default: 200
    pm25ElevatedUgM3: number;    // Default: 35.4 µg/m³
  };
}

export const DEFAULT_RISK_THRESHOLDS: RiskThresholdConfig = {
  heat: {
    moderateThresholdC: 32,
    elevatedThresholdC: 38,
    highThresholdC: 44,
  },
  rainfall: {
    moderatePrecipMm: 10,
    elevatedPrecipMm: 30,
    highPrecipMm: 60,
    elevatedProbPct: 70,
  },
  airQuality: {
    moderateAqi: 50,
    elevatedAqi: 100,
    highAqi: 200,
    pm25ElevatedUgM3: 35.4,
  },
};

export const INDICATIVE_RISK_DISCLAIMER =
  'Indicative Assessment Notice: Preliminary risk ratings are algorithmic estimations for community resilience awareness and do not constitute official warnings from METMalaysia, DID, or DOE.';
