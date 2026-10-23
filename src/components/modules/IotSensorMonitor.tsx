import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Battery,
  Clock,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { IoTSensor } from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import { RiskBadge } from '../common/RiskBadge.tsx';

interface IotSensorMonitorProps {
  township: TownshipProfile;
  sensors: IoTSensor[];
  onRefreshSensors: () => void;
}

export const IotSensorMonitor: React.FC<IotSensorMonitorProps> = ({
  township,
  sensors,
  onRefreshSensors,
}) => {
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshSensors();
      setIsRefreshing(false);
    }, 450);
  };

  const filteredSensors = filterStatus === 'all'
    ? sensors
    : sensors.filter((s) => s.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* HIGHLY VISIBLE PROMINENT SIMULATED DATA BANNER */}
      <div className="bg-amber-500 text-slate-950 px-5 py-3.5 rounded-xl border-2 border-amber-600 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-950 text-amber-400 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
                SIMULATED DATA
              </span>
              <h2 className="text-sm font-extrabold text-slate-950">
                Demonstration Mesh Prototype
              </h2>
            </div>
            <p className="text-xs text-slate-900 font-medium mt-0.5">
              Notice: No physical hardware sensors are currently installed in {township.name}. All node telemetries, battery levels, and environmental readings below are synthetic demonstration values.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateRefresh}
          disabled={isRefreshing}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Nodes</span>
        </button>
      </div>

      {/* Fleet Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-700" />
            IoT Environmental Sensor Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulated low-power LoRaWAN sensor nodes monitoring temperature, relative humidity, micro-rainfall rate, soil moisture, and particulate matter across Elmina.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {['all', 'active', 'calibrating'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => {
          const isSelected = selectedSensor?.id === sensor.id;
          const statusBadge = {
            active: {
              label: 'Active Online',
              color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              dot: 'bg-emerald-500',
            },
            calibrating: {
              label: 'Calibrating',
              color: 'bg-amber-50 text-amber-800 border-amber-200',
              dot: 'bg-amber-500',
            },
            standby: {
              label: 'Standby',
              color: 'bg-slate-100 text-slate-700 border-slate-200',
              dot: 'bg-slate-400',
            },
          }[sensor.status];

          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all hover:border-slate-300 flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {sensor.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                    SIMULATED
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {sensor.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{sensor.zone}</p>
              </div>

              {/* Live Telemetry Readings 4-box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    Temperature
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {sensor.telemetry.temperatureC}°C
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    Humidity
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {sensor.telemetry.humidityPct}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    Rain Rate
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {sensor.telemetry.rainfallRateMmH} mm/h
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    Air Quality
                  </span>
                  <span className="text-sm font-bold text-emerald-800">
                    API {sensor.telemetry.aqi}
                  </span>
                </div>
              </div>

              {/* Footer: Battery, Signal, Timestamp & Inspect trigger */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="Simulated Battery">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sensor.batteryPct}%</span>
                  </span>
                  <span className="flex items-center gap-1" title="Signal Strength">
                    <Wifi className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sensor.signalStrengthDbm} dBm</span>
                  </span>
                </div>

                <button
                  onClick={() => setSelectedSensor(sensor)}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Detail / History Modal */}
      {selectedSensor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedSensor.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedSensor.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zone: {selectedSensor.zone} • Lat {selectedSensor.coordinates.lat}, Lng {selectedSensor.coordinates.lng}
                </p>
              </div>

              <button
                onClick={() => setSelectedSensor(null)}
                aria-label="Close dialog"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Simulated Telemetry Record:</strong> Readings reflect simulated diurnal tropical microclimate variations.
            </div>

            {/* Current Readings Snapshot */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Temp
                </span>
                <span className="text-base font-bold text-slate-900">
                  {selectedSensor.telemetry.temperatureC}°C
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Humidity
                </span>
                <span className="text-base font-bold text-slate-900">
                  {selectedSensor.telemetry.humidityPct}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Soil Moisture
                </span>
                <span className="text-base font-bold text-teal-800">
                  {selectedSensor.telemetry.soilMoisturePct}%
                </span>
              </div>
            </div>

            {/* Recent History Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Simulated Hourly Log History:
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-100 p-2 font-bold text-slate-600">
                  <span>Time (MYT)</span>
                  <span>Temp (°C)</span>
                  <span>Humidity</span>
                  <span>API (AQI)</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {selectedSensor.history.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-2 text-slate-700">
                      <span className="font-mono">{row.time}</span>
                      <span>{row.temperatureC}°C</span>
                      <span>{row.humidityPct}%</span>
                      <span className="font-semibold text-emerald-800">{row.aqi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSensor(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
