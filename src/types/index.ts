export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';

export interface ClimateConditions {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  rainProbabilityPct: number;
  uvIndex: number;
  aqi: number;
  pm25: number;
  windSpeedKmh: number;
  windDirection: string;
  waterStressPct: number; // Simulated indicator (local catchment & demand stress)
  timestamp: string;
  conditionDescription: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0 to 100
  title: string;
  advisory: string;
  factors: string[];
}

export interface ForecastDay {
  date: string;
  dayName: string;
  condition: string;
  maxTempC: number;
  minTempC: number;
  rainChancePct: number;
  rainfallMm: number;
  aqi: number;
  heatRisk: RiskLevel;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  category?: 'advisory' | 'mitigation' | 'general' | 'rewards';
  suggestedActions?: string[];
}

export interface TownshipZone {
  id: string;
  name: string;
  category: 'park' | 'residential' | 'commercial' | 'connector' | 'lakeside';
  surfaceTempC: number;
  treeCanopyPct: number;
  permeableSurfacePct: number;
  floodRiskLevel: RiskLevel;
  heatIslandOffsetC: number;
  activeSensorsCount: number;
  vulnerabilityScore: number; // 0 (resilient) to 100 (vulnerable)
  recommendedIntervention: string;
  description: string;
}

export interface TownshipIntervention {
  id: string;
  title: string;
  category: 'shade' | 'drainage' | 'green_infrastructure' | 'community' | 'water';
  zoneId: string;
  zoneName: string;
  resilienceImpactScore: number; // +1 to +20 points
  estimatedCostTier: 'Low' | 'Medium' | 'High';
  status: 'proposed' | 'in_progress' | 'implemented';
  description: string;
  expectedCoolingDeltaC?: number;
  expectedRunoffReductionPct?: number;
}

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

export interface IoTSensor {
  id: string;
  code: string;
  name: string;
  zone: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'calibrating' | 'standby';
  batteryPct: number;
  signalStrengthDbm: number;
  lastUpdated: string;
  telemetry: {
    temperatureC: number;
    humidityPct: number;
    rainfallRateMmH: number;
    aqi: number;
    pm25: number;
    soilMoisturePct: number;
  };
  history: Array<{
    time: string;
    temperatureC: number;
    humidityPct: number;
    aqi: number;
  }>;
}

export type GreenActivityCategory =
  | 'tree_planting'
  | 'cycling'
  | 'walking'
  | 'recycling'
  | 'energy_conservation'
  | 'water_conservation'
  | 'composting';

export interface GreenActivity {
  id: string;
  category: GreenActivityCategory;
  title: string;
  pointsEarned: number;
  loggedAt: string;
  quantityDesc: string;
  notes?: string;
  simulatedImpactDesc: string;
}

export interface GreenReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'voucher' | 'sustainable_merch' | 'workshop' | 'eco_plant';
  partnerName: string;
  available: boolean;
}

export type ActiveModule =
  | 'resident_dashboard'
  | 'ai_assistant'
  | 'township_management'
  | 'scenario_simulator'
  | 'iot_sensors'
  | 'green_rewards';
