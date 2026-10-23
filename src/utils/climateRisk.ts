export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0 to 100
  title: string;
  advisory: string;
  factors: string[];
  isIndicative: boolean;
}

export interface RiskThresholdConfigParam {
  heat?: {
    moderateThresholdC?: number;
    elevatedThresholdC?: number;
    highThresholdC?: number;
  };
  rainfall?: {
    moderatePrecipMm?: number;
    elevatedPrecipMm?: number;
    highPrecipMm?: number;
    elevatedProbPct?: number;
  };
  airQuality?: {
    moderateAqi?: number;
    elevatedAqi?: number;
    highAqi?: number;
    pm25ElevatedUgM3?: number;
  };
}

/**
 * Calculates apparent temperature (heat index) in Celsius
 * Adapted Rothfusz regression equation for tropical high-humidity climates
 */
export function calculateApparentTemperature(tempC: number, humidityPct: number): number {
  if (tempC < 25) {
    return Number(tempC.toFixed(1));
  }

  // Convert to Fahrenheit for standard Rothfusz coefficients
  const T = (tempC * 9) / 5 + 32;
  const RH = Math.max(0, Math.min(100, humidityPct));

  // Simple formula check first
  let HI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);

  if (HI >= 80) {
    HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      0.00683783 * T * T -
      0.05481717 * RH * RH +
      0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH -
      0.00000199 * T * T * RH * RH;

    // Tropical high humidity adjustment for RH > 85% and T between 80-87°F
    if (RH > 85 && T >= 80 && T <= 87) {
      HI += ((RH - 85) / 10) * ((87 - T) / 5);
    }
  }

  // Convert back to Celsius
  const hiCelsius = ((HI - 32) * 5) / 9;
  return Number(Math.max(tempC, hiCelsius).toFixed(1));
}

/**
 * Evaluates thermal strain and heat health risk level using configurable thresholds
 */
export function calculateHeatRisk(
  tempC: number,
  apparentTempC: number,
  thresholds?: RiskThresholdConfigParam
): RiskAssessment {
  const effectiveTemp = Math.max(tempC, apparentTempC);
  const modThresh = thresholds?.heat?.moderateThresholdC ?? 32;
  const elevThresh = thresholds?.heat?.elevatedThresholdC ?? 38;
  const highThresh = thresholds?.heat?.highThresholdC ?? 44;

  if (effectiveTemp < modThresh) {
    return {
      level: 'Low',
      score: 22,
      title: 'Comfortable Tropical Baseline',
      advisory: 'Minimal thermal strain. Ideal for outdoor recreation along Elmina Central Park trails.',
      factors: [
        `Ambient temperature: ${tempC}°C`,
        `Apparent heat index: ${apparentTempC}°C`,
        `Below moderate threshold (${modThresh}°C)`,
      ],
      isIndicative: true,
    };
  }

  if (effectiveTemp < elevThresh) {
    return {
      level: 'Moderate',
      score: 48,
      title: 'Moderate Heat Advisory (Indicative)',
      advisory: 'Heightened thermal load during peak solar hours (11:00 AM - 3:30 PM). Stay hydrated.',
      factors: [
        `Apparent temperature: ${apparentTempC}°C exceeds ${modThresh}°C threshold`,
        'High relative humidity slows natural sweat evaporation',
        'Shaded corridors recommended for prolonged pedestrian travel',
      ],
      isIndicative: true,
    };
  }

  if (effectiveTemp < highThresh) {
    return {
      level: 'Elevated',
      score: 74,
      title: 'Elevated Heat Caution (Indicative)',
      advisory: 'Prolonged exposure may trigger heat fatigue and cramps. Limit strenuous outdoor work.',
      factors: [
        `Heat index: ${apparentTempC}°C exceeds elevated threshold (${elevThresh}°C)`,
        'Elevated surface temperatures on paved walkways',
        'Recommend utilizing covered park shelters and indoor cooling hubs',
      ],
      isIndicative: true,
    };
  }

  return {
    level: 'High',
    score: 92,
    title: 'Severe Heat Risk Warning (Indicative)',
    advisory: 'Dangerous heat stress conditions. High vulnerability to heat exhaustion and stroke.',
    factors: [
      `Extreme apparent temperature: ${apparentTempC}°C exceeds severe threshold (${highThresh}°C)`,
      'High thermal retention across urban hardscapes',
      'Cease midday athletic and heavy construction activities',
    ],
    isIndicative: true,
  };
}

/**
 * Evaluates rainfall and stormwater runoff risk for tropical convective downpours using configurable thresholds
 */
export function calculateRainfallRisk(
  rainfallMm: number,
  rainProbabilityPct: number,
  thresholds?: RiskThresholdConfigParam
): RiskAssessment {
  const modPrecip = thresholds?.rainfall?.moderatePrecipMm ?? 10;
  const elevPrecip = thresholds?.rainfall?.elevatedPrecipMm ?? 30;
  const highPrecip = thresholds?.rainfall?.highPrecipMm ?? 60;
  const elevProb = thresholds?.rainfall?.elevatedProbPct ?? 70;

  if (rainfallMm < modPrecip && rainProbabilityPct < 40) {
    return {
      level: 'Low',
      score: 18,
      title: 'Low Precipitation Risk',
      advisory: 'Scattered clouds or light drizzle. Bioretention swales operating at idle capacity.',
      factors: [
        `Rainfall: ${rainfallMm} mm (under ${modPrecip} mm threshold)`,
        `Precipitation probability: ${rainProbabilityPct}%`,
        'Drainage channels clear with optimal freeboard buffer',
      ],
      isIndicative: true,
    };
  }

  if (rainfallMm < elevPrecip || rainProbabilityPct < elevProb) {
    return {
      level: 'Moderate',
      score: 45,
      title: 'Moderate Monsoon Downpour Potential (Indicative)',
      advisory: 'Intermittent heavy convective showers expected. Drive cautiously along Elmina boulevard.',
      factors: [
        `Forecast rainfall: ${rainfallMm} mm`,
        `Precipitation chance: ${rainProbabilityPct}%`,
        'Elmina retention lakes absorbing initial catchment runoff',
      ],
      isIndicative: true,
    };
  }

  if (rainfallMm < highPrecip || rainProbabilityPct < 85) {
    return {
      level: 'Elevated',
      score: 72,
      title: 'Elevated Stormwater Surge Alert (Indicative)',
      advisory: 'Intense tropical squall likely. Localized road depression ponding possible.',
      factors: [
        `High rainfall volume: ${rainfallMm} mm exceeds ${elevPrecip} mm threshold`,
        `Rainfall chance: ${rainProbabilityPct}%`,
        'Sub-catchment bioswales approaching 75% retention threshold',
      ],
      isIndicative: true,
    };
  }

  return {
    level: 'High',
    score: 90,
    title: 'High Flash-Ponding & Runoff Alert (Indicative)',
    advisory: 'Torrential monsoon downpour. Avoid low-lying retention margins and culverts.',
    factors: [
      `Torrential precipitation: ${rainfallMm} mm exceeds high threshold (${highPrecip} mm)`,
      `Very high probability: ${rainProbabilityPct}%`,
      'Primary detention spillways actively buffering peak discharge volume',
    ],
    isIndicative: true,
  };
}

/**
 * Evaluates air quality index according to Malaysian API / US AQI using configurable thresholds
 */
export function calculateAirQualityRisk(
  aqi: number,
  pm25: number,
  thresholds?: RiskThresholdConfigParam
): RiskAssessment {
  const modAqi = thresholds?.airQuality?.moderateAqi ?? 50;
  const elevAqi = thresholds?.airQuality?.elevatedAqi ?? 100;
  const highAqi = thresholds?.airQuality?.highAqi ?? 200;

  if (aqi <= modAqi) {
    return {
      level: 'Low',
      score: 15,
      title: `Good Air Quality (API ≤ ${modAqi})`,
      advisory: 'Clean atmospheric conditions. Excellent for all outdoor jogging, cycling, and park activities.',
      factors: [
        `Air Pollutant Index: ${aqi}`,
        `Modelled PM2.5 concentration: ${pm25} µg/m³`,
        'Clean air buffer assisted by Elmina Forest Reserve edge',
      ],
      isIndicative: true,
    };
  }

  if (aqi <= elevAqi) {
    return {
      level: 'Moderate',
      score: 42,
      title: `Moderate Air Quality (API ${modAqi + 1}-${elevAqi})`,
      advisory: 'Acceptable air quality. Extremely sensitive individuals may consider moderating heavy exertion.',
      factors: [
        `Air Pollutant Index: ${aqi}`,
        `Modelled PM2.5: ${pm25} µg/m³`,
        'Modelled regional particulate distribution',
      ],
      isIndicative: true,
    };
  }

  if (aqi <= highAqi) {
    return {
      level: 'Elevated',
      score: 75,
      title: `Unhealthy Air Quality (API ${elevAqi + 1}-${highAqi})`,
      advisory: 'Unhealthy for sensitive groups. Reduce prolonged outdoor cardiovascular exertion.',
      factors: [
        `Elevated API: ${aqi}`,
        `Elevated PM2.5: ${pm25} µg/m³`,
        'Modelled transboundary or localized particulate haze detected',
      ],
      isIndicative: true,
    };
  }

  return {
    level: 'High',
    score: 95,
    title: `Very Unhealthy / Hazardous (API > ${highAqi})`,
    advisory: 'Hazardous air quality. Wear N95 filtration outdoors and activate indoor HEPA filtration.',
    factors: [
      `Hazardous API: ${aqi}`,
      `Severe PM2.5: ${pm25} µg/m³`,
      'Urgent recommendation for community vulnerable groups to remain indoors',
    ],
    isIndicative: true,
  };
}

/**
 * Computes overall composite township resilience score (0-100, where 100 = optimal resilience)
 * Higher score means township is well-buffered against active environmental risks.
 */
export function calculateOverallResilienceScore(
  heatScore: number,
  rainScore: number,
  aqiScore: number,
  waterStressPct: number,
  greenCoverPct: number = 35
): number {
  // Environmental vulnerability weighted average (0 = no stress, 100 = extreme stress)
  const envVulnerability =
    heatScore * 0.30 +
    rainScore * 0.30 +
    aqiScore * 0.20 +
    waterStressPct * 0.20;

  // Green buffer bonus (+0.4 points per % green cover)
  const greenMitigationBonus = Math.min(25, (greenCoverPct - 20) * 0.5);

  // Resilience score is inverse of vulnerability plus township green adaptation bonus
  const baseResilience = 100 - envVulnerability;
  const finalScore = Math.max(10, Math.min(98, baseResilience + greenMitigationBonus));

  return Math.round(finalScore);
}

/**
 * Returns documented scoring methodology for UI transparency
 */
export function getScoringMethodologyDoc() {
  return {
    title: 'Illustrative Climate Risk & Resilience Scoring Methodology',
    version: '1.0 (Hackathon Prototype)',
    framework: [
      {
        metric: 'Apparent Heat Index (HI)',
        formula: 'Rothfusz tropical multivariate polynomial using Ambient Temp (°C) and Relative Humidity (%)',
        purpose: 'Quantifies physiological heat dissipation strain under equatorial Malaysian humidity.',
      },
      {
        metric: 'Rainfall Runoff Index',
        formula: 'Risk = f(Rainfall mm/24h, Convective probability %, Township soil permeability)',
        purpose: 'Estimates peak stormwater runoff pressure against bioretention basin holding capacity.',
      },
      {
        metric: 'Air Quality Classification',
        formula: 'Aligned with Malaysian Department of Environment (DOE) Air Pollutant Index (API 0-50 Good, 51-100 Moderate, 101-200 Unhealthy)',
        purpose: 'Provides public health alerts for outdoor park and wellness corridor usage.',
      },
      {
        metric: 'Composite Resilience Score (0-100)',
        formula: '100 - [0.30×HeatRisk + 0.30×RainRisk + 0.20×AQIRisk + 0.20×WaterStress] + GreenCanopyBuffer',
        purpose: 'Holistic indicator showing how well township infrastructure absorbs active environmental stressors.',
      },
    ],
  };
}
