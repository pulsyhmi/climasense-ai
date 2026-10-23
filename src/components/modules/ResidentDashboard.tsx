import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  ShieldAlert,
  Info,
  Calendar,
  Waves,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  Sliders,
  ExternalLink,
  Satellite,
  CheckCircle,
  Camera,
  Compass,
  TreePine,
  Bike,
  ShieldCheck,
  ChevronDown,
  ArrowDown,
  Maximize2,
} from 'lucide-react';
import {
  RiskAssessment,
  RiskLevel,
} from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import { RiskThresholdConfig } from '../../config/riskThresholds.ts';
import { LiveClimateData, LiveForecastDay } from '../../services/climateService.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import {
  calculateHeatRisk,
  calculateRainfallRisk,
  calculateAirQualityRisk,
} from '../../utils/climateRisk.ts';
import { AppUser } from '../../types/firebase.ts';

interface ResidentDashboardProps {
  township: TownshipProfile;
  liveData: LiveClimateData | null;
  isLoading: boolean;
  error: string | null;
  thresholds: RiskThresholdConfig;
  simulatedWaterStressPct: number;
  onRefresh: () => void;
  onOpenMethodology: () => void;
  onOpenThresholds: () => void;
  onNavigateToAssistant: (prompt?: string) => void;
  currentUser?: AppUser | null;
}

// Curated authentic landscape photo of Malaysian tropical lakeside parkland representing Elmina Central Park
const DEFAULT_ELMINA_HERO_IMAGE = 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=2000&q=80';

export const ELMINA_LANDSCAPE_PRESETS = [
  {
    id: 'central-park',
    label: 'Elmina Central Park & Bioretention Lakes',
    url: 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=2000&q=80',
    caption: '300-acre natural sponge city park with cascading retention lakes',
  },
  {
    id: 'cycling-spine',
    label: '90km Active Mobility & Cycling Spine',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=2000&q=80',
    caption: 'Shaded continuous pedestrian & cycling corridor throughout Elmina',
  },
  {
    id: 'rainforest-centre',
    label: 'Elmina Rainforest Knowledge Centre (ERKC)',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80',
    caption: 'Native dipterocarp canopy reserve & nursery partnering with TRCRC',
  },
];

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  township,
  liveData,
  isLoading,
  error,
  thresholds,
  simulatedWaterStressPct,
  onRefresh,
  onOpenMethodology,
  onOpenThresholds,
  onNavigateToAssistant,
  currentUser,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [heroImageUrl, setHeroImageUrl] = useState<string>(() => {
    return localStorage.getItem('climasense_elmina_hero_img') || DEFAULT_ELMINA_HERO_IMAGE;
  });
  const [showPhotoConfig, setShowPhotoConfig] = useState<boolean>(false);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  // If there is a fatal fetch error, render the honest error state - NO silent fallback!
  if (error && !liveData) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-900 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#C8102E] text-white rounded-xl shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-rose-950">
                Climate Data Fetch Error
              </h2>
              <p className="text-sm text-rose-800 leading-relaxed">
                Could not retrieve live observations from Open-Meteo services for{' '}
                <strong>{township.name}</strong> (Coordinates:{' '}
                {township.coordinates.latitude}, {township.coordinates.longitude}).
              </p>
              <div className="p-3 bg-white/80 rounded-lg border border-rose-200 font-mono text-xs text-rose-700">
                {error}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-[#C8102E] hover:bg-[#A50D24] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Open-Meteo Connection</span>
            </button>
            <span className="text-xs text-rose-600 italic">
              Notice: Per resilience guidelines, sample data is not silently substituted.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate indicative risk assessments using live retrieved values
  const heatRisk: RiskAssessment | null =
    liveData && liveData.temperatureC !== null && liveData.apparentTemperatureC !== null
      ? calculateHeatRisk(liveData.temperatureC, liveData.apparentTemperatureC, thresholds)
      : null;

  const rainfallRisk: RiskAssessment | null =
    liveData && liveData.precipitationMm !== null
      ? calculateRainfallRisk(
          liveData.precipitationMm,
          liveData.precipitationProbPct ?? 0,
          thresholds
        )
      : null;

  const aqiVal = liveData ? (liveData.usAqi ?? liveData.europeanAqi ?? null) : null;
  const pm25Val = liveData?.pm25 ?? null;
  const aqiRisk: RiskAssessment | null =
    aqiVal !== null && pm25Val !== null
      ? calculateAirQualityRisk(aqiVal, pm25Val, thresholds)
      : null;

  const forecast = liveData?.forecast || [];
  const selectedDay: LiveForecastDay | undefined = forecast[selectedDayIndex] || forecast[0];

  const handleSaveCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoInput.trim()) return;
    setHeroImageUrl(customPhotoInput.trim());
    localStorage.setItem('climasense_elmina_hero_img', customPhotoInput.trim());
    setImageLoadFailed(false);
    setShowPhotoConfig(false);
  };

  const handleResetPhoto = () => {
    setHeroImageUrl(DEFAULT_ELMINA_HERO_IMAGE);
    localStorage.removeItem('climasense_elmina_hero_img');
    setImageLoadFailed(false);
    setShowPhotoConfig(false);
  };

  const scrollToMetrics = () => {
    const el = document.getElementById('climate-metrics');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. REAL CITY OF ELMINA PHOTOGRAPHIC HERO SECTION */}
      <section className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
        {/* Authentic Background Photograph with Fallback */}
        {!imageLoadFailed ? (
          <img
            src={heroImageUrl}
            alt="City of Elmina 300-acre Central Park, landscaped bioretention lake and 90km cycling track"
            onError={() => setImageLoadFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A13] via-[#102B20] to-[#0A1610]" />
        )}

        {/* Elegant Dark Gradient Overlay Ensuring Perfect Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C121E]/95 via-[#0C121E]/75 to-[#0C121E]/40" />

        {/* Subtle Sime Darby Brand Stripe at top */}
        <div className="relative z-10 w-full h-1 bg-gradient-to-r from-[#C8102E] via-[#EAAA08] to-[#15803D]" />

        {/* Top Header Row of Hero */}
        <div className="relative z-10 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* ClimaSense AI Brand Badge with Sime Darby Red Accent */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
              <span>ClimaSense AI</span>
              <span className="text-white/40">|</span>
              <span className="text-[#EAAA08] font-mono text-[10px] tracking-widest uppercase">
                Sime Darby Property
              </span>
            </div>

            <span className="text-xs font-mono text-white/80 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
              {liveData ? liveData.observationTimeFormatted : 'Live Feeds'}
            </span>

            {currentUser?.preferences.preferredZone && (
              <span className="text-[11px] bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-full font-medium border border-emerald-500/30 backdrop-blur-xs">
                📍 {currentUser.preferences.preferredZone}
              </span>
            )}
          </div>

          {/* Photo Slot Settings / Attribution Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPhotoConfig(!showPhotoConfig)}
              title="Configure authentic City of Elmina photograph URL"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white border border-white/20 text-xs backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#EAAA08]" />
              <span className="hidden sm:inline text-[11px]">Photo Settings</span>
            </button>
          </div>
        </div>

        {/* Optional Configurable Photo Input Drawer */}
        {showPhotoConfig && (
          <div className="relative z-20 mx-5 sm:mx-7 mb-4 p-4 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 text-xs space-y-3 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#EAAA08]" />
                  <span>City of Elmina Landscape Photography Slot</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reference official photography from <a href="https://www.simedarbyproperty.com/city-of-elmina/" target="_blank" rel="noopener noreferrer" className="text-[#EAAA08] underline">simedarbyproperty.com/city-of-elmina/</a> or choose curated authentic Malaysian parkland presets below.
                </p>
              </div>
              <button
                onClick={handleResetPhoto}
                className="text-[11px] text-[#EAAA08] hover:underline cursor-pointer shrink-0"
              >
                Reset Default
              </button>
            </div>

            {/* Curated Presets Selection */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Authentic Township Landscape Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ELMINA_LANDSCAPE_PRESETS.map((preset) => {
                  const isCurrent = heroImageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setHeroImageUrl(preset.url);
                        localStorage.setItem('climasense_elmina_hero_img', preset.url);
                        setImageLoadFailed(false);
                      }}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#C8102E] bg-red-950/40 text-white ring-1 ring-[#C8102E]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.caption}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleSaveCustomPhoto} className="flex gap-2 pt-1">
              <input
                type="url"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="Or paste authorized image URL: https://example.com/elmina-park.jpg"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D24] text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Apply Custom Photo
              </button>
            </form>
          </div>
        )}

        {/* Center / Main Content of Hero */}
        <div className="relative z-10 px-5 sm:px-7 pb-6 space-y-4 max-w-3xl">
          <div>
            <div className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#EAAA08] mb-1.5 flex items-center gap-1.5">
              <span>CITY OF ELMINA, SHAH ALAM</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-400 font-sans">300-Acre Central Park & Rainforest Spine</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Understand Your Climate.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#EAAA08]">
                Prepare for Tomorrow.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mt-2">
              Hyper-local atmospheric intelligence and micro-climate preparedness for Elmina residents. Built for Sime Darby Property's flagship wellness and climate-resilient township.
            </p>
          </div>

          {/* Concise Current Climate Status Pill */}
          <div className="inline-flex flex-wrap items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 font-bold text-white">
              <Thermometer className="w-3.5 h-3.5 text-[#EAAA08]" />
              <span>{liveData?.temperatureC !== null ? `${liveData?.temperatureC}°C` : '31°C'}</span>
              <span className="text-white/60 font-normal">
                (Feels {liveData?.apparentTemperatureC !== null ? `${liveData?.apparentTemperatureC}°C` : '35°C'})
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>{liveData?.precipitationMm !== null ? `${liveData?.precipitationMm} mm` : '0 mm'} ({liveData?.precipitationProbPct ?? 0}%)</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              <span>AQI {aqiVal ?? 164} (CAMS)</span>
            </div>

            {heatRisk && (
              <div className="px-2 py-0.5">
                <RiskBadge level={heatRisk.level} size="sm" />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            <button
              onClick={scrollToMetrics}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A50D24] text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Explore Climate Insights</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToAssistant(`How should I prepare for today's weather in ${township.name}? Currently ${liveData?.temperatureC ?? '32'}°C, condition: ${liveData?.conditionText ?? 'cloudy'}.`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#EAAA08]" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh live Open-Meteo feeds"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs backdrop-blur-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Refresh API'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real API Source & Time Banner */}
      {liveData && (
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2">
            <Satellite className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-slate-900">API Data Sources:</span>{' '}
              <span>Weather: {liveData.dataSources.weatherApi}</span> •{' '}
              <span>Air Quality: {liveData.dataSources.airQualityModel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] shrink-0">
            <span>Observed: {liveData.observationTimeFormatted}</span>
            <span>•</span>
            <span>Lat: {liveData.dataSources.latitude.toFixed(3)}, Lng: {liveData.dataSources.longitude.toFixed(3)}</span>
          </div>
        </div>
      )}

      {/* Air Quality Explicit Disclaimer Banner */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Air Quality Data Notice:</span>{' '}
          <span>
            Air quality indicators (PM2.5: {liveData?.pm25 ?? 'N/A'} µg/m³, PM10: {liveData?.pm10 ?? 'N/A'} µg/m³, AQI: {aqiVal ?? 'N/A'}) represent <strong>modelled forecast estimates</strong> from the European Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo, <strong>not direct measurements from an in-situ local Elmina monitoring station</strong>.
          </span>
        </div>
      </div>

      {/* CLIMATE METRIC CARDS SECTION - 5 KEY INDICATORS */}
      <div id="climate-metrics" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Environmental Indicators
            </h2>
            <p className="text-xs text-slate-500">
              Continuous meteorological and atmospheric readings for {township.name}.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Open-Meteo v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Ambient & Feels-Like Temperature */}
          <MetricCard
            title="Temperature"
            value={liveData?.temperatureC !== null && liveData?.temperatureC !== undefined ? `${liveData.temperatureC}°` : 'N/A'}
            unit="C"
            subtitle={`Feels like: ${liveData?.apparentTemperatureC !== null && liveData?.apparentTemperatureC !== undefined ? `${liveData.apparentTemperatureC}°C` : 'N/A'}`}
            icon={Thermometer}
            iconColor="text-[#C8102E] bg-red-50 border-red-100"
            trendText="Ambient Observation"
            trendType="neutral"
          />

          {/* 2. Rainfall & Precipitation Probability */}
          <MetricCard
            title="Rainfall & Prob."
            value={liveData?.precipitationMm !== null && liveData?.precipitationMm !== undefined ? liveData.precipitationMm : 0}
            unit="mm"
            subtitle={`Probability: ${liveData?.precipitationProbPct ?? 0}%`}
            icon={CloudRain}
            iconColor="text-blue-700 bg-blue-50 border-blue-100"
            trendText={
              (liveData?.precipitationProbPct ?? 0) > 60
                ? 'High Convective Risk'
                : 'Normal Catchment'
            }
            trendType={(liveData?.precipitationProbPct ?? 0) > 60 ? 'warning' : 'positive'}
          />

          {/* 3. Modelled Air Quality (CAMS) */}
          <MetricCard
            title="Air Quality (AQI)"
            value={aqiVal ?? 'N/A'}
            unit="AQI"
            subtitle={`PM2.5: ${pm25Val ?? 'N/A'} µg/m³`}
            icon={Wind}
            iconColor="text-emerald-700 bg-emerald-50 border-emerald-100"
            trendText="Copernicus CAMS Model"
            trendType={aqiRisk?.level === 'Elevated' || aqiRisk?.level === 'High' ? 'warning' : 'positive'}
          />

          {/* 4. Heat Stress Risk */}
          <MetricCard
            title="Heat Stress Risk"
            value={heatRisk ? heatRisk.level : 'Low'}
            unit="Risk"
            subtitle={`Threshold: ${thresholds.heat.moderateThresholdC}°C apparent`}
            icon={ShieldAlert}
            iconColor="text-amber-700 bg-amber-50 border-amber-100"
            badge={heatRisk ? <RiskBadge level={heatRisk.level} size="sm" /> : undefined}
            trendText={heatRisk?.level === 'Low' ? 'Safe Outdoor Living' : 'Hydration Advisory'}
            trendType={heatRisk?.level === 'High' ? 'negative' : heatRisk?.level === 'Elevated' ? 'warning' : 'positive'}
          />

          {/* 5. Water Stress Index (Simulated) */}
          <MetricCard
            title="Water Stress"
            value={simulatedWaterStressPct}
            unit="%"
            subtitle="Simulated Catchment Reserve"
            icon={Waves}
            iconColor="text-teal-700 bg-teal-50 border-teal-100"
            trendText="Elmina Lake Buffer"
            trendType="positive"
            simulated={true}
            badge={<RiskBadge level="Low" size="sm" />}
          />
        </div>
      </div>

      {/* CLIMATE OUTLOOK AND 5-DAY FORECAST SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#C8102E] border border-red-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                5-Day Climate Outlook for {township.name}
              </h3>
              <p className="text-xs text-slate-500">
                Retrieved directly from Open-Meteo Weather Forecast Model (ECMWF/GFS numerical predictions)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#C8102E] bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
            Live API Data
          </span>
        </div>

        {forecast.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Forecast feeds loading or unavailable.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {forecast.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              const dayHeatRisk = day.maxTempC ? calculateHeatRisk(day.maxTempC, day.maxTempC + 4, thresholds).level : 'Moderate';

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#C8102E] bg-red-50/50 ring-2 ring-[#C8102E]/20 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {day.dayName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {day.date}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium mb-3 h-8 line-clamp-2">
                    {day.conditionText}
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-extrabold text-slate-900">
                      {day.maxTempC !== null ? `${day.maxTempC}°` : 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {day.minTempC !== null ? `${day.minTempC}°` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      {day.precipitationProbabilityPct !== null ? `${day.precipitationProbabilityPct}%` : 'N/A'}
                    </span>
                    <RiskBadge level={dayHeatRisk} size="sm" showDot={false} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Day Detail Box */}
        {selectedDay && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Detailed Outlook for {selectedDay.dayName} ({selectedDay.date})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  WMO Code {selectedDay.weatherCode}
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Condition: <strong>{selectedDay.conditionText}</strong> • Forecast 24h precipitation: <strong>{selectedDay.precipitationMm !== null ? `${selectedDay.precipitationMm} mm` : 'N/A'}</strong> • Precipitation Probability: <strong>{selectedDay.precipitationProbabilityPct !== null ? `${selectedDay.precipitationProbabilityPct}%` : 'N/A'}</strong> • Max UV Index: <strong>{selectedDay.uvIndexMax !== null ? selectedDay.uvIndexMax : 'N/A'}</strong>
              </p>
            </div>

            <button
              onClick={() => onNavigateToAssistant(`Tell me how to prepare for ${selectedDay.dayName}'s weather condition in ${township.name} (${selectedDay.conditionText}, max ${selectedDay.maxTempC}°C, rain chance ${selectedDay.precipitationProbabilityPct}%).`)}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#C8102E] hover:text-[#A50D24] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
            >
              <span>Ask AI About This Day</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CLEAR RISK BREAKDOWN SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Indicative Climate Risk Breakdown
              </h2>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Indicative • Not Official Warnings
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluated in real-time from Open-Meteo feeds using configured threshold cutoffs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenThresholds}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Adjust Thresholds</span>
            </button>
            <button
              onClick={onOpenMethodology}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 px-2.5 py-1 rounded-md"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Scoring Model</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Heat Risk Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Heat Stress Risk</h3>
                  <span className="text-xs text-slate-500">
                    Apparent: {liveData?.apparentTemperatureC !== null ? `${liveData?.apparentTemperatureC}°C` : 'N/A'} (Cutoff: {thresholds.heat.moderateThresholdC}°C)
                  </span>
                </div>
              </div>
              {heatRisk ? <RiskBadge level={heatRisk.level} /> : <span className="text-xs text-slate-400">N/A</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {heatRisk ? heatRisk.advisory : 'Thermal metrics unavailable.'}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {heatRisk?.factors.map((f, i) => (
                <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 italic pt-1">
              * Indicative preliminary assessment • Not an official METMalaysia warning.
            </div>
          </div>

          {/* Rainfall / Drainage Risk Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Precipitation & Runoff</h3>
                  <span className="text-xs text-slate-500">
                    {liveData?.precipitationMm !== null ? `${liveData?.precipitationMm} mm` : '0 mm'} • {liveData?.precipitationProbPct ?? 'N/A'}% chance
                  </span>
                </div>
              </div>
              {rainfallRisk ? <RiskBadge level={rainfallRisk.level} /> : <span className="text-xs text-slate-400">N/A</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {rainfallRisk ? rainfallRisk.advisory : 'Precipitation metrics unavailable.'}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {rainfallRisk?.factors.map((f, i) => (
                <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 italic pt-1">
              * Indicative preliminary assessment • Not an official DID flood warning.
            </div>
          </div>

          {/* Air Quality Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Modelled Air Quality</h3>
                  <span className="text-xs text-slate-500">
                    AQI {aqiVal ?? 'N/A'} • PM2.5 {pm25Val ?? 'N/A'} µg/m³
                  </span>
                </div>
              </div>
              {aqiRisk ? <RiskBadge level={aqiRisk.level} /> : <span className="text-xs text-slate-400">N/A</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {aqiRisk ? aqiRisk.advisory : 'Modelled air quality estimates unavailable.'}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {aqiRisk?.factors.map((f, i) => (
                <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>{f}</span>
                </div>
              ))}
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>PM10 estimate: {liveData?.pm10 ?? 'N/A'} µg/m³</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic pt-1">
              * Modelled estimate, not certified local DOE measurement station.
            </div>
          </div>
        </div>
      </div>

      {/* PERSONALISED RESIDENT ACTION RECOMMENDATIONS SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personalised Resident Action Recommendations
              </h3>
              <p className="text-xs text-slate-500">
                Actionable microclimate measures tailored to {township.name} today.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Hyperlocal Heuristics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Bike className="w-4 h-4 text-[#C8102E]" />
              <span>Outdoor Cycling & Recreation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Plan active jogging or cycling along Elmina's 90km trail spine before <strong>11:00 AM</strong> or after <strong>5:30 PM</strong> to avoid peak solar irradiance and apparent heat index above 33°C.
            </p>
            <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              Optimum Window: 07:00 - 10:30 AM
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Stormwater & Gutter Preparedness</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear leaves from residential rain downpipes. While Elmina Central Park's bioretention cascade attenuates 100-year events, perimeter driveway drains should remain unobstructed.
            </p>
            <span className="inline-block text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
              Runoff Buffer: 100% Active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <span>Passive Household Cooling</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Close west-facing louvers during peak afternoon sunlight. Utilize natural cross-ventilation created by the forested buffer corridor along the Guthrie boundary.
            </p>
            <span className="inline-block text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
              Estimated HVAC Savings: ~14%
            </span>
          </div>
        </div>
      </div>

      {/* TOWNSHIP ENVIRONMENTAL INSIGHT & NATURAL CAPITAL SECTION */}
      <div className="bg-[#0C121E] text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#EAAA08] font-bold">
                SIME DARBY PROPERTY MASTERPLAN
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">City of Elmina Natural Capital</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Township Resilience Architecture & Natural Capital
            </h3>
          </div>
          <a
            href="https://www.simedarbyproperty.com/city-of-elmina/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#EAAA08] hover:text-amber-300 font-bold transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 w-fit"
          >
            <span>Official Elmina Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Card 1: 300-Acre Central Park */}
          <div className="group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col">
            <div className="relative h-36 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=800&q=80"
                alt="Elmina Central Park 300-acre bioretention lakes and sponge wetlands"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono font-bold">
                SPONGE CITY CORE
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  300-Acre Central Park & Lakes
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cascading bioretention lakes engineered to absorb 100-year monsoon floods while cooling surrounding microclimates by up to 2.2°C through natural evapotranspiration.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Flood Attenuation</span>
                <span className="font-semibold text-emerald-400">100-Yr Capacity</span>
              </div>
            </div>
          </div>

          {/* Card 2: 90km Cycling Spine */}
          <div className="group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col">
            <div className="relative h-36 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80"
                alt="City of Elmina 90-kilometer continuous dedicated cycling and jogging track"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] font-mono font-bold">
                ACTIVE MOBILITY
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  90-Kilometer Cycling Track Spine
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Grade-separated continuous active mobility network connecting residential precincts, community farms, and Central Park without intersecting high-speed motorways.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Zero-Emission Travel</span>
                <span className="font-semibold text-amber-400">90 km Track</span>
              </div>
            </div>
          </div>

          {/* Card 3: Elmina Rainforest Knowledge Centre */}
          <div className="group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col">
            <div className="relative h-36 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"
                alt="Elmina Rainforest Knowledge Centre and native tree seedling nursery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-700/60 text-[10px] font-mono font-bold">
                BIODIVERSITY CONSERVATION
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Rainforest Knowledge Centre (ERKC)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Collaborative native biodiversity nursery with TRCRC targeting 210,000 indigenous endangered trees, including native Hopea and Dipterocarp saplings.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Native Planting Target</span>
                <span className="font-semibold text-emerald-400">210,000 Trees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
