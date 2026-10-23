/**
 * Reusable Climate Data Service
 * Integrates:
 * 1. Open-Meteo Weather Forecast API
 * 2. Open-Meteo Air Quality API
 * Location: City of Elmina (Lat: 3.18301, Lng: 101.52559, Timezone: Asia/Kuala_Lumpur)
 */

export interface LiveForecastDay {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionText: string;
  maxTempC: number | null;
  minTempC: number | null;
  precipitationMm: number | null;
  precipitationProbabilityPct: number | null;
  uvIndexMax: number | null;
}

export interface LiveClimateData {
  // Current Weather
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  humidityPct: number | null;
  precipitationMm: number | null;
  precipitationProbPct: number | null;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  windDirectionCardinal: string;
  weatherCode: number | null;
  conditionText: string;
  observationTimeIso: string;
  observationTimeFormatted: string;

  // Modelled Air Quality Estimates
  pm25: number | null;
  pm10: number | null;
  uvIndex: number | null;
  usAqi: number | null;
  europeanAqi: number | null;
  airQualityTimeIso: string;
  airQualityTimeFormatted: string;
  airQualityDisclaimer: string;

  // 5-Day Forecast Array
  forecast: LiveForecastDay[];

  // Source Metadata
  dataSources: {
    weatherApi: string;
    airQualityModel: string;
    latitude: number;
    longitude: number;
    timezone: string;
    elevationMeters?: number;
  };
  fetchedAtIso: string;
}

/**
 * WMO Weather Interpretation Code standard table
 */
export function getWmoWeatherDescription(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'Unknown Atmospheric Condition';

  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Depositing Rime Fog';
    case 51:
      return 'Light Drizzle';
    case 53:
      return 'Moderate Drizzle';
    case 55:
      return 'Dense Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow Fall';
    case 80:
      return 'Slight Rain Showers';
    case 81:
      return 'Moderate Rain Showers';
    case 82:
      return 'Violent Rain Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
      return 'Thunderstorm with Slight Hail';
    case 99:
      return 'Thunderstorm with Heavy Hail';
    default:
      return `Weather Code ${code}`;
  }
}

/**
 * Converts wind degrees (0-360) to compass cardinal
 */
export function getWindDirectionCardinal(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || isNaN(degrees)) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return `${directions[index]} (${Math.round(degrees)}°)`;
}

/**
 * Formats an ISO string into local Malaysian Time (MYT, GMT+8)
 */
export function formatMytTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' MYT';
  } catch {
    return isoString;
  }
}

export interface FetchClimateOptions {
  latitude: number;
  longitude: number;
  timezone?: string;
}

/**
 * Fetches real weather and air quality from Open-Meteo
 * Throws explicit errors on failure - does not silently fall back.
 */
export async function fetchLiveClimateData(
  options: FetchClimateOptions
): Promise<LiveClimateData> {
  const { latitude, longitude, timezone = 'Asia/Kuala_Lumpur' } = options;

  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', latitude.toString());
  weatherUrl.searchParams.set('longitude', longitude.toString());
  weatherUrl.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m'
  );
  weatherUrl.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max'
  );
  weatherUrl.searchParams.set('timezone', timezone);
  weatherUrl.searchParams.set('forecast_days', '5');

  const airQualityUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airQualityUrl.searchParams.set('latitude', latitude.toString());
  airQualityUrl.searchParams.set('longitude', longitude.toString());
  airQualityUrl.searchParams.set('current', 'pm10,pm2_5,uv_index,us_aqi,european_aqi');
  airQualityUrl.searchParams.set('timezone', timezone);

  // Parallel fetch with error capture
  const [weatherRes, airQualityRes] = await Promise.all([
    fetch(weatherUrl.toString()).catch((err) => {
      throw new Error(`Open-Meteo Weather API network unreachable: ${err.message}`);
    }),
    fetch(airQualityUrl.toString()).catch((err) => {
      throw new Error(`Open-Meteo Air Quality API network unreachable: ${err.message}`);
    }),
  ]);

  if (!weatherRes.ok) {
    const errorText = await weatherRes.text().catch(() => '');
    throw new Error(
      `Open-Meteo Weather API responded with HTTP ${weatherRes.status}: ${errorText || weatherRes.statusText}`
    );
  }

  if (!airQualityRes.ok) {
    const errorText = await airQualityRes.text().catch(() => '');
    throw new Error(
      `Open-Meteo Air Quality API responded with HTTP ${airQualityRes.status}: ${errorText || airQualityRes.statusText}`
    );
  }

  const weatherData = await weatherRes.json();
  const airQualityData = await airQualityRes.json();

  const currentW = weatherData.current || {};
  const dailyW = weatherData.daily || {};
  const currentAQ = airQualityData.current || {};

  // Parse 5-day forecast
  const forecast: LiveForecastDay[] = [];
  const times: string[] = dailyW.time || [];

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i];
    const dateObj = new Date(dateStr);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-MY', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });

    forecast.push({
      date: formattedDate,
      dayName: dayName,
      weatherCode: dailyW.weather_code?.[i] ?? 0,
      conditionText: getWmoWeatherDescription(dailyW.weather_code?.[i]),
      maxTempC: dailyW.temperature_2m_max?.[i] ?? null,
      minTempC: dailyW.temperature_2m_min?.[i] ?? null,
      precipitationMm: dailyW.precipitation_sum?.[i] ?? null,
      precipitationProbabilityPct: dailyW.precipitation_probability_max?.[i] ?? null,
      uvIndexMax: dailyW.uv_index_max?.[i] ?? null,
    });
  }

  const observationTimeIso = currentW.time || new Date().toISOString();
  const airQualityTimeIso = currentAQ.time || new Date().toISOString();

  // Pick current precipitation probability from day 0 if available
  const currentPrecipProb = dailyW.precipitation_probability_max?.[0] ?? null;

  return {
    temperatureC: currentW.temperature_2m ?? null,
    apparentTemperatureC: currentW.apparent_temperature ?? null,
    humidityPct: currentW.relative_humidity_2m ?? null,
    precipitationMm: currentW.precipitation ?? null,
    precipitationProbPct: currentPrecipProb,
    windSpeedKmh: currentW.wind_speed_10m ?? null,
    windDirectionDeg: currentW.wind_direction_10m ?? null,
    windDirectionCardinal: getWindDirectionCardinal(currentW.wind_direction_10m),
    weatherCode: currentW.weather_code ?? null,
    conditionText: getWmoWeatherDescription(currentW.weather_code),
    observationTimeIso,
    observationTimeFormatted: formatMytTime(observationTimeIso),

    pm25: currentAQ.pm2_5 ?? null,
    pm10: currentAQ.pm10 ?? null,
    uvIndex: currentAQ.uv_index ?? dailyW.uv_index_max?.[0] ?? null,
    usAqi: currentAQ.us_aqi ?? null,
    europeanAqi: currentAQ.european_aqi ?? null,
    airQualityTimeIso,
    airQualityTimeFormatted: formatMytTime(airQualityTimeIso),
    airQualityDisclaimer:
      'Modelled atmospheric forecast estimate (European CAMS via Open-Meteo), not a certified in-situ local sensor measurement.',

    forecast,

    dataSources: {
      weatherApi: 'Open-Meteo Global Weather Forecast API (ECMWF & GFS numerical models)',
      airQualityModel: 'Open-Meteo Air Quality API (Copernicus Atmosphere Monitoring Service - CAMS)',
      latitude: weatherData.latitude ?? latitude,
      longitude: weatherData.longitude ?? longitude,
      timezone: weatherData.timezone ?? timezone,
      elevationMeters: weatherData.elevation,
    },
    fetchedAtIso: new Date().toISOString(),
  };
}
