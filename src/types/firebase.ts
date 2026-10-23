export type UserRole = 'resident' | 'township_manager';

export interface ResidentPreferences {
  alertHeat: boolean;
  alertRain: boolean;
  alertAqi: boolean;
  preferredZone?: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  isAnonymous: boolean;
  townshipId: string;
  preferences: ResidentPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface PersistedGreenActivity {
  id: string;
  userId: string;
  userName: string;
  category: 'tree_planting' | 'cycling' | 'walking' | 'recycling' | 'energy_conservation' | 'water_conservation' | 'composting' | 'food_waste';
  title: string;
  metricDescription: string;
  pointsAwarded: number;
  townshipId: string;
  notes?: string;
  timestamp?: string;
  createdAt: string;
}

export interface PersistedRewardBalance {
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: string;
  updatedAt: string;
}

export interface PersistedTownshipConfig {
  townshipId: string;
  name: string;
  heatModerateC: number;
  heatElevatedC: number;
  rainModerateMm: number;
  rainElevatedMm: number;
  aqiModerate: number;
  aqiElevated: number;
  greenTargetPct: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface PersistedManagerNote {
  id: string;
  townshipId: string;
  title: string;
  zoneId: string;
  category: 'heat_advisory' | 'drainage_maintenance' | 'tree_planting' | 'infrastructure';
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}
