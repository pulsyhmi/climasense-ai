import {
  ClimateConditions,
  ForecastDay,
  TownshipZone,
  TownshipIntervention,
  IoTSensor,
  GreenActivity,
  GreenReward,
  ChatMessage,
} from '../types/index.ts';

export const INITIAL_CONDITIONS: ClimateConditions = {
  temperatureC: 32.4,
  apparentTemperatureC: 39.8,
  humidityPct: 78,
  rainfallMm: 16.5,
  rainProbabilityPct: 65,
  uvIndex: 7.2,
  aqi: 42,
  pm25: 10.4,
  windSpeedKmh: 12.5,
  windDirection: 'WSW (245°)',
  waterStressPct: 28, // Simulated: 28% demand stress (healthy reservoir buffer)
  timestamp: 'Today, 2:45 PM MYT',
  conditionDescription: 'Humid Tropical Sunshine with Afternoon Convective Shower Risk',
};

export const FIVE_DAY_FORECAST: ForecastDay[] = [
  {
    date: 'Today',
    dayName: 'Monday',
    condition: 'Thunderstorms likely',
    maxTempC: 33.2,
    minTempC: 25.1,
    rainChancePct: 65,
    rainfallMm: 18.5,
    aqi: 42,
    heatRisk: 'Elevated',
  },
  {
    date: 'Tomorrow',
    dayName: 'Tuesday',
    condition: 'Afternoon Heavy Showers',
    maxTempC: 32.0,
    minTempC: 24.8,
    rainChancePct: 75,
    rainfallMm: 24.0,
    aqi: 38,
    heatRisk: 'Moderate',
  },
  {
    date: 'Oct 22',
    dayName: 'Wednesday',
    condition: 'Partly Cloudy & Sunny',
    maxTempC: 34.1,
    minTempC: 25.4,
    rainChancePct: 35,
    rainfallMm: 6.0,
    aqi: 48,
    heatRisk: 'Elevated',
  },
  {
    date: 'Oct 23',
    dayName: 'Thursday',
    condition: 'Sunny Intervals with Hazy Skies',
    maxTempC: 34.8,
    minTempC: 25.8,
    rainChancePct: 25,
    rainfallMm: 2.5,
    aqi: 62,
    heatRisk: 'Elevated',
  },
  {
    date: 'Oct 24',
    dayName: 'Friday',
    condition: 'Convective Storms',
    maxTempC: 31.8,
    minTempC: 24.5,
    rainChancePct: 80,
    rainfallMm: 31.0,
    aqi: 35,
    heatRisk: 'Moderate',
  },
];

export const DEMO_TOWNSHIP_ZONES: TownshipZone[] = [
  {
    id: 'zone-cp',
    name: 'Elmina Central Park (300-Acre Core)',
    category: 'park',
    surfaceTempC: 30.2,
    treeCanopyPct: 62,
    permeableSurfacePct: 88,
    floodRiskLevel: 'Low',
    heatIslandOffsetC: -2.8,
    activeSensorsCount: 3,
    vulnerabilityScore: 18,
    recommendedIntervention: 'Maintain native forest fringe and inspect bio-retention weir silt traps.',
    description: 'Central urban forest sanctuary acting as Elmina’s primary thermal buffer and stormwater collection sponge.',
  },
  {
    id: 'zone-west',
    name: 'Elmina West Residential Precinct',
    category: 'residential',
    surfaceTempC: 34.6,
    treeCanopyPct: 28,
    permeableSurfacePct: 42,
    floodRiskLevel: 'Moderate',
    heatIslandOffsetC: +1.4,
    activeSensorsCount: 2,
    vulnerabilityScore: 46,
    recommendedIntervention: 'Promote residential roof cool-coatings and perimeter bioswale landscaping.',
    description: 'Medium-density landed residential phase with paved driveways and young street trees.',
  },
  {
    id: 'zone-lake',
    name: 'Elmina Valley Lakeside Promenade',
    category: 'lakeside',
    surfaceTempC: 29.8,
    treeCanopyPct: 48,
    permeableSurfacePct: 75,
    floodRiskLevel: 'Low',
    heatIslandOffsetC: -2.2,
    activeSensorsCount: 2,
    vulnerabilityScore: 24,
    recommendedIntervention: 'Optimize automated sluice gate release thresholds ahead of monsoonal peaks.',
    description: 'Cascading retention lakes and wetlands designed to absorb 100-year flood stormwater volume.',
  },
  {
    id: 'zone-denai',
    name: 'Denai Alam Active Spine Connector',
    category: 'connector',
    surfaceTempC: 33.1,
    treeCanopyPct: 38,
    permeableSurfacePct: 55,
    floodRiskLevel: 'Low',
    heatIslandOffsetC: -0.6,
    activeSensorsCount: 1,
    vulnerabilityScore: 32,
    recommendedIntervention: 'Add solar-powered misting pergolas along the 2.5km continuous pedestrian cycle path.',
    description: 'Active mobility corridor connecting residential clusters to central schools and transit nodes.',
  },
  {
    id: 'zone-east',
    name: 'Elmina East Business & Commercial Hub',
    category: 'commercial',
    surfaceTempC: 37.4,
    treeCanopyPct: 16,
    permeableSurfacePct: 22,
    floodRiskLevel: 'Moderate',
    heatIslandOffsetC: +3.2,
    activeSensorsCount: 2,
    vulnerabilityScore: 68,
    recommendedIntervention: 'Prioritize shaded canopy car parks, permeable interlocking pavers, and green roofs.',
    description: 'Higher asphalt and concrete fraction generating localized urban heat island effect during noon hours.',
  },
];

export const DEMO_INTERVENTIONS: TownshipIntervention[] = [
  {
    id: 'int-1',
    title: 'Bioretention Bioswale Expansion (Sector W-4)',
    category: 'drainage',
    zoneId: 'zone-west',
    zoneName: 'Elmina West Residential Precinct',
    resilienceImpactScore: 14,
    estimatedCostTier: 'Medium',
    status: 'in_progress',
    description: 'Excavation of vegetated swales along roadside verges to filter heavy surface runoff before entering retention lakes.',
    expectedRunoffReductionPct: 26,
    expectedCoolingDeltaC: 0.4,
  },
  {
    id: 'int-2',
    title: 'Native Merbau & Tecoma High-Canopy Planting',
    category: 'shade',
    zoneId: 'zone-east',
    zoneName: 'Elmina East Commercial Hub',
    resilienceImpactScore: 18,
    estimatedCostTier: 'Medium',
    status: 'proposed',
    description: 'Planting 350 mature native tropical shade trees to reduce surface asphalt radiant temperature.',
    expectedCoolingDeltaC: 1.8,
  },
  {
    id: 'int-3',
    title: 'Active Solar-Powered Misting Pavilions',
    category: 'community',
    zoneId: 'zone-denai',
    zoneName: 'Denai Alam Active Spine Connector',
    resilienceImpactScore: 9,
    estimatedCostTier: 'Low',
    status: 'implemented',
    description: 'Installation of micro-fine evaporative cooling misting shelters triggered when ambient temperature exceeds 33°C.',
    expectedCoolingDeltaC: 2.5,
  },
  {
    id: 'int-4',
    title: 'Residential Rainwater Harvesting Incentive Tier 2',
    category: 'water',
    zoneId: 'zone-west',
    zoneName: 'Elmina West Residential Precinct',
    resilienceImpactScore: 12,
    estimatedCostTier: 'Low',
    status: 'in_progress',
    description: 'Township rebate pairing household 200L slimline storage barrels for landscape and car wash reuse.',
    expectedRunoffReductionPct: 15,
  },
  {
    id: 'int-5',
    title: 'Permeable Grass-Crete Parking Retrofit',
    category: 'green_infrastructure',
    zoneId: 'zone-east',
    zoneName: 'Elmina East Commercial Hub',
    resilienceImpactScore: 16,
    estimatedCostTier: 'High',
    status: 'proposed',
    description: 'Replacing 8,000 m² of standard asphalt with honeycomb porous pavers allowing instant rainfall infiltration.',
    expectedRunoffReductionPct: 35,
    expectedCoolingDeltaC: 1.2,
  },
  {
    id: 'int-6',
    title: 'Automated Soil-Tensiometer Drip Irrigation Network',
    category: 'water',
    zoneId: 'zone-cp',
    zoneName: 'Elmina Central Park',
    resilienceImpactScore: 11,
    estimatedCostTier: 'Medium',
    status: 'implemented',
    description: 'IoT-linked subsurface irrigation valves that halt watering during rainfall and irrigate strictly at dusk.',
  },
];

export const DEMO_IOT_SENSORS: IoTSensor[] = [
  {
    id: 'sensor-1',
    code: 'ES-01-CPK',
    name: 'Central Park Core Node',
    zone: 'Elmina Central Park',
    coordinates: { lat: 3.1834, lng: 101.5262 },
    status: 'active',
    batteryPct: 94,
    signalStrengthDbm: -68,
    lastUpdated: '1 minute ago',
    telemetry: {
      temperatureC: 30.6,
      humidityPct: 82,
      rainfallRateMmH: 0.0,
      aqi: 38,
      pm25: 8.5,
      soilMoisturePct: 76,
    },
    history: [
      { time: '09:00', temperatureC: 27.2, humidityPct: 89, aqi: 34 },
      { time: '11:00', temperatureC: 29.8, humidityPct: 84, aqi: 36 },
      { time: '13:00', temperatureC: 31.4, humidityPct: 78, aqi: 40 },
      { time: '14:00', temperatureC: 30.8, humidityPct: 81, aqi: 39 },
      { time: '15:00', temperatureC: 30.6, humidityPct: 82, aqi: 38 },
    ],
  },
  {
    id: 'sensor-2',
    code: 'ES-02-RDG',
    name: 'Elmina Ridge Micro-Station',
    zone: 'Elmina West Residential Precinct',
    coordinates: { lat: 3.1895, lng: 101.5188 },
    status: 'active',
    batteryPct: 88,
    signalStrengthDbm: -72,
    lastUpdated: '3 minutes ago',
    telemetry: {
      temperatureC: 33.8,
      humidityPct: 74,
      rainfallRateMmH: 0.2,
      aqi: 44,
      pm25: 11.2,
      soilMoisturePct: 58,
    },
    history: [
      { time: '09:00', temperatureC: 28.5, humidityPct: 85, aqi: 40 },
      { time: '11:00', temperatureC: 31.6, humidityPct: 79, aqi: 42 },
      { time: '13:00', temperatureC: 34.2, humidityPct: 72, aqi: 46 },
      { time: '14:00', temperatureC: 34.0, humidityPct: 73, aqi: 45 },
      { time: '15:00', temperatureC: 33.8, humidityPct: 74, aqi: 44 },
    ],
  },
  {
    id: 'sensor-3',
    code: 'ES-03-HYD',
    name: 'Valley Wetland Hydro-Gauge',
    zone: 'Elmina Valley Lakeside',
    coordinates: { lat: 3.1782, lng: 101.5298 },
    status: 'active',
    batteryPct: 98,
    signalStrengthDbm: -64,
    lastUpdated: 'Just now',
    telemetry: {
      temperatureC: 30.1,
      humidityPct: 86,
      rainfallRateMmH: 2.4,
      aqi: 36,
      pm25: 7.8,
      soilMoisturePct: 92,
    },
    history: [
      { time: '09:00', temperatureC: 26.8, humidityPct: 92, aqi: 32 },
      { time: '11:00', temperatureC: 29.0, humidityPct: 88, aqi: 35 },
      { time: '13:00', temperatureC: 30.9, humidityPct: 82, aqi: 38 },
      { time: '14:00', temperatureC: 30.4, humidityPct: 85, aqi: 37 },
      { time: '15:00', temperatureC: 30.1, humidityPct: 86, aqi: 36 },
    ],
  },
  {
    id: 'sensor-4',
    code: 'ES-04-AQI',
    name: 'Commercial Square Environmental Node',
    zone: 'Elmina East Commercial Hub',
    coordinates: { lat: 3.1920, lng: 101.5345 },
    status: 'active',
    batteryPct: 79,
    signalStrengthDbm: -76,
    lastUpdated: '2 minutes ago',
    telemetry: {
      temperatureC: 35.2,
      humidityPct: 71,
      rainfallRateMmH: 0.0,
      aqi: 56,
      pm25: 15.6,
      soilMoisturePct: 44,
    },
    history: [
      { time: '09:00', temperatureC: 29.2, humidityPct: 81, aqi: 48 },
      { time: '11:00', temperatureC: 33.1, humidityPct: 75, aqi: 52 },
      { time: '13:00', temperatureC: 36.1, humidityPct: 68, aqi: 58 },
      { time: '14:00', temperatureC: 35.8, humidityPct: 70, aqi: 57 },
      { time: '15:00', temperatureC: 35.2, humidityPct: 71, aqi: 56 },
    ],
  },
  {
    id: 'sensor-5',
    code: 'ES-05-AGR',
    name: 'Community Agri-Forestry Node',
    zone: 'Denai Alam Active Spine',
    coordinates: { lat: 3.1810, lng: 101.5215 },
    status: 'calibrating',
    batteryPct: 91,
    signalStrengthDbm: -70,
    lastUpdated: '6 minutes ago',
    telemetry: {
      temperatureC: 31.8,
      humidityPct: 80,
      rainfallRateMmH: 0.0,
      aqi: 40,
      pm25: 9.1,
      soilMoisturePct: 82,
    },
    history: [
      { time: '09:00', temperatureC: 27.5, humidityPct: 87, aqi: 36 },
      { time: '11:00', temperatureC: 30.2, humidityPct: 83, aqi: 39 },
      { time: '13:00', temperatureC: 32.5, humidityPct: 77, aqi: 42 },
      { time: '14:00', temperatureC: 32.0, humidityPct: 79, aqi: 41 },
      { time: '15:00', temperatureC: 31.8, humidityPct: 80, aqi: 40 },
    ],
  },
];

export const INITIAL_GREEN_ACTIVITIES: GreenActivity[] = [
  {
    id: 'act-1',
    category: 'cycling',
    title: 'Commute via Elmina Active Cycling Track',
    pointsEarned: 25,
    loggedAt: 'Today, 8:15 AM',
    quantityDesc: '7.4 km logged',
    notes: 'Used shaded park spine from Elmina West to Central Park hub.',
    simulatedImpactDesc: 'Saved approx. 1.2 kg CO2 compared to single-occupant petrol vehicle.',
  },
  {
    id: 'act-2',
    category: 'tree_planting',
    title: 'Community Tree Planting: Hope Native Seedling',
    pointsEarned: 100,
    loggedAt: 'Yesterday, 10:30 AM',
    quantityDesc: '1 Hopea odorata (Merawan Siput Jantan) sapling',
    notes: 'Planted along wetland edge with Elmina community volunteers.',
    simulatedImpactDesc: 'Long-term estimated carbon sequestration of ~22 kg CO2/year at full maturity.',
  },
  {
    id: 'act-3',
    category: 'recycling',
    title: 'Clean Stream Recycling Drop-off',
    pointsEarned: 20,
    loggedAt: 'Oct 17, 4:20 PM',
    quantityDesc: '4.8 kg segregated plastics and cardboards',
    notes: 'Dropped off at Community Eco-Bin Center.',
    simulatedImpactDesc: 'Diverted post-consumer material from regional municipal landfill.',
  },
  {
    id: 'act-4',
    category: 'energy_conservation',
    title: 'Peak Grid Shaving & Cross-Ventilation',
    pointsEarned: 30,
    loggedAt: 'Oct 16, 7:00 PM',
    quantityDesc: 'Reduced AC consumption during 2:00 PM - 5:00 PM peak',
    notes: 'Opened louvered windows and utilized ceiling fan airflow.',
    simulatedImpactDesc: 'Conserved estimated 3.8 kWh grid electricity during high-demand hours.',
  },
];

export const GREEN_REWARDS_CATALOG: GreenReward[] = [
  {
    id: 'rew-1',
    title: 'RM15 Elmina Community Nursery Plant Voucher',
    description: 'Redeem for native shrubs, potted herbs, or bio-fertilizer compost at Elmina Central Park Nursery.',
    pointsCost: 150,
    category: 'eco_plant',
    partnerName: 'Elmina Community Nursery',
    available: true,
  },
  {
    id: 'rew-2',
    title: 'Complimentary Oat Milk Eco-Upgrade at Lakeside Cafe',
    description: 'Free plant-based milk upgrade on any artisan coffee or matcha beverage.',
    pointsCost: 60,
    category: 'voucher',
    partnerName: 'Promenade Artisan Roasters',
    available: true,
  },
  {
    id: 'rew-3',
    title: 'Township Rainwater Harvesting Barrel DIY Kit (20% Off)',
    description: 'Voucher for specialized diverter valve and mesh filter attachment for residential downspouts.',
    pointsCost: 250,
    category: 'sustainable_merch',
    partnerName: 'Elmina Hardware & Eco-Solutions',
    available: true,
  },
  {
    id: 'rew-4',
    title: 'Free Entry: Urban Permaculture & Compost Workshop',
    description: 'Hands-on weekend masterclass at Elmina Community Farm on home vermicomposting and soil resilience.',
    pointsCost: 180,
    category: 'workshop',
    partnerName: 'Selangor Agro-Ecology Collective',
    available: true,
  },
  {
    id: 'rew-5',
    title: 'Stainless Steel Insulated Thermal Eco-Bottle (750ml)',
    description: 'Double-walled reusable water bottle engraved with ClimaSense Eco-Steward badge.',
    pointsCost: 220,
    category: 'sustainable_merch',
    partnerName: 'ClimaSense Community Store',
    available: true,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Hello! I am your **ClimaSense AI Assistant** for the **City of Elmina**.

I provide real-time hyper-local climate insights, heat resilience guidance, stormwater preparedness advice, and sustainable living tips tailored to Elmina's micro-zones.

*(Connected live to Google Gemini 3.5 Flash Lite via secure server-side API with real-time Open-Meteo observations and CAMS atmospheric models.)*

How can I help you prepare or take action today?`,
    timestamp: '2:45 PM',
    suggestedActions: [
      "How should I prepare for today's weather?",
      'Is it safe for outdoor cycling in Elmina Central Park today?',
      'What can I do to reduce heat in my home today?',
      "Explain Elmina's flood mitigation and bioretention system.",
      'How do I earn and redeem Green Rewards points?',
    ],
  },
];

export const AI_KNOWLEDGE_BASE: Record<string, { answer: string; suggestedActions?: string[] }> = {
  weather_prep: {
    answer: `**Today's Climate Advisory for City of Elmina:**
• **Current Temperature:** 32.4°C (Apparent Heat Index feels like **39.8°C** due to 78% tropical humidity).
• **Heat Risk Level:** **Elevated**. The hottest window is 12:00 PM – 3:30 PM.
• **Rainfall Forecast:** Convective thunderstorm probability surges to **65%** between 3:30 PM and 6:00 PM, with estimated 16–24 mm accumulation.
• **Air Quality:** Good (API 42).

**Resident Recommendations:**
1. Complete strenuous outdoor tasks before 11:30 AM or after 6:00 PM.
2. Carry hydration if walking along exposed connector sidewalks.
3. Ensure household gutter downspouts and yard drain grates are clear of dry leaves before the afternoon thunderstorm.`,
    suggestedActions: [
      'Is it safe for outdoor cycling in Elmina Central Park today?',
      'What can I do to reduce heat in my home today?',
    ],
  },
  cycling: {
    answer: `**Cycling & Outdoor Recreation Advice for Elmina:**
• **Optimal Window:** Best before 10:30 AM or after 6:15 PM when surface temperatures drop below 29°C.
• **Midday Precaution:** The apparent heat index is currently **39.8°C**. Cycling along unshaded asphalt corridors now carries risk of thermal dehydration.
• **Recommended Route:** If cycling now, stick strictly to the **Elmina Central Park canopy trails** or the **Valley Lakeside Promenade**, where mature rainforest trees provide up to **2.8°C cooling offset**.
• **Afternoon Thunderstorm:** Heavy convective rain is projected around 3:30 PM–5:30 PM. Plan your return loop to reach covered pavilions well before 3:30 PM.`,
    suggestedActions: [
      'Log my cycling activity for Green Rewards',
      'Tell me about shade corridors in Elmina',
    ],
  },
  home_cooling: {
    answer: `**Practical Steps to Keep Your Elmina Home Cool Today:**
1. **Passive Cross-Ventilation:** Close west-facing blinds or blackout curtains between 1:00 PM and 5:00 PM to block intense afternoon solar irradiance.
2. **Ceiling Fan Pre-Cooling:** Running ceiling fans on counter-clockwise mode creates a wind-chill effect making 27°C feel like 24°C, cutting air conditioner electricity draw by ~30%.
3. **Air Conditioner Efficiency:** Set temperature to **24°C–25°C** rather than 18°C. Every 1°C increase saves approx. 6–8% in cooling energy.
4. **Natural Shading:** Consider planting potted creeping fig or bamboo palms along exterior balconies to absorb wall surface heat.
5. **Log Energy Savings:** Log your off-peak cooling habit under the **Green Rewards** tab to earn **30 eco-points**!`,
    suggestedActions: [
      'How does the Climate Scenario Simulator calculate cooling demand?',
      'Log an energy conservation activity',
    ],
  },
  flood_system: {
    answer: `**City of Elmina Stormwater & Flood Resilience Architecture:**
Elmina was engineered with an innovative water-sensitive urban design (WSUD) that acts as a natural sponge:
1. **300-Acre Central Park Wetland:** Functions as primary attenuation storage capable of holding peak 100-year rainfall flood volumes.
2. **Cascading Bio-retention Basins:** Naturally slows stormwater runoff velocity, filtering sediments through aquatic plants before entering the Sungai Buloh river catchment.
3. **Permeable Swales & Underdrains:** Vegetated road swales eliminate stagnant roadside gutters and prevent flash-ponding on vehicular lanes.
4. **Simulated Capacity Status:** Currently, the retention buffer is at **72% available holding capacity**, well-prepared for today's forecast showers.`,
    suggestedActions: [
      'View Township Management Dashboard',
      'Test rainfall increase in the Scenario Simulator',
    ],
  },
  green_rewards: {
    answer: `**How Green Rewards Works in ClimaSense AI:**
Earn eco-points by logging everyday sustainable township habits:
• **Tree Planting:** 100 points
• **Energy Conservation (Off-peak cooling):** 30 points
• **Cycling Commute / Recreation:** 25 points
• **Clean Recycling Drop-off:** 20 points
• **Water Conservation:** 20 points
• **Walking / Active Mobility:** 15 points

**Redemption:**
You can exchange points for nursery plant vouchers, eco-cafe discounts, and sustainable merchandise in the Green Rewards module!`,
    suggestedActions: [
      'Open Green Rewards module',
      "How should I prepare for today's weather?",
    ],
  },
};
