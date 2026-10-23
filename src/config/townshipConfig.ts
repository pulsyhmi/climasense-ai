/**
 * Central Configuration for ClimaSense AI
 * Demonstration Location: City of Elmina, Shah Alam, Selangor, Malaysia
 */

export interface TownshipProfile {
  id: string;
  name: string;
  shortName: string;
  district: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  elevationMeters: number;
  totalMasterplanAcres: number;
  parkSpineKm: number;
  baselineCanopyCoveragePct: number;
  description: string;
}

export const CURRENT_TOWNSHIP: TownshipProfile = {
  id: 'city-of-elmina',
  name: 'City of Elmina',
  shortName: 'Elmina',
  district: 'Shah Alam',
  state: 'Selangor',
  country: 'Malaysia',
  coordinates: {
    latitude: 3.18301,
    longitude: 101.52559,
  },
  timezone: 'Asia/Kuala_Lumpur',
  elevationMeters: 48,
  totalMasterplanAcres: 5000,
  parkSpineKm: 300,
  baselineCanopyCoveragePct: 35,
  description:
    'A 5,000-acre wellness-themed township featuring a 300-acre Central Park, extensive urban bioretention basins, and integrated active mobility corridors.',
};

export const AVAILABLE_TOWNSHIPS: TownshipProfile[] = [
  CURRENT_TOWNSHIP,
  {
    id: 'bandar-bukit-raja',
    name: 'Bandar Bukit Raja',
    shortName: 'Bukit Raja',
    district: 'Klang',
    state: 'Selangor',
    country: 'Malaysia',
    coordinates: {
      latitude: 3.0841,
      longitude: 101.4422,
    },
    timezone: 'Asia/Kuala_Lumpur',
    elevationMeters: 14,
    totalMasterplanAcres: 4333,
    parkSpineKm: 125,
    baselineCanopyCoveragePct: 24,
    description:
      'Industrial and residential township with specialized water retention basins and coastal storm preparedness features.',
  },
  {
    id: 'serenia-city',
    name: 'Serenia City',
    shortName: 'Serenia',
    district: 'Sepang',
    state: 'Selangor',
    country: 'Malaysia',
    coordinates: {
      latitude: 2.8465,
      longitude: 101.6961,
    },
    timezone: 'Asia/Kuala_Lumpur',
    elevationMeters: 32,
    totalMasterplanAcres: 2370,
    parkSpineKm: 104,
    baselineCanopyCoveragePct: 30,
    description:
      'The garden city of KLIA South with kinetic solar park facilities and interconnected rainwater drainage bio-swales.',
  },
];

export const DEMO_NOTICE = {
  disclaimer:
    'PROTOTYPE DEMONSTRATION: ClimaSense AI is an independent hackathon prototype developed for the Sime Darby Hackathon. It is not an official municipal emergency broadcast or certified Sime Darby Property service.',
  dataNotice:
    'Environmental indicators, IoT sensor telemetry, and scenario forecasts are simulated illustrative models designed for concept demonstration.',
};
