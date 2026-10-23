import React, { useState } from 'react';
import {
  Menu,
  MapPin,
  Clock,
  Calculator,
  Bell,
  User,
  ShieldCheck,
  Database,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AVAILABLE_TOWNSHIPS, TownshipProfile } from '../../config/townshipConfig.ts';
import { AppUser } from '../../types/firebase.ts';

interface HeaderProps {
  currentTownship: TownshipProfile;
  onSelectTownship: (township: TownshipProfile) => void;
  onOpenMethodology: () => void;
  onToggleMobileMenu: () => void;
  resilienceScore: number;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  isFirebaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTownship,
  onSelectTownship,
  onOpenMethodology,
  onToggleMobileMenu,
  resilienceScore,
  currentUser,
  onOpenAuth,
  isFirebaseConnected,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample active township climate notifications
  const notifications = [
    {
      id: 'notif-1',
      title: 'Afternoon Convective Surge Notice',
      desc: '98% chance of thunderstorm along Guthrie Corridor. Bioretention cells active.',
      time: '15m ago',
      type: 'warning',
    },
    {
      id: 'notif-2',
      title: 'Central Park Tree Planting Milestone',
      desc: '300 native Hope saplings staged. Double green reward points this weekend.',
      time: '2h ago',
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile hamburger, Brand Wordmark & Location context */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ClimaSense AI Brand Wordmark Anchor */}
          <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#A50D24] p-0.5 shadow-2xs flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs leading-none">C</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-sm tracking-tight text-slate-900">
                ClimaSense<span className="text-[#C8102E]"> AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-[#C8102E] border border-red-200/70 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <label htmlFor="township-select" className="sr-only">
                  Select Township
                </label>
                <select
                  id="township-select"
                  value={currentTownship.id}
                  onChange={(e) => {
                    const found = AVAILABLE_TOWNSHIPS.find(
                      (t) => t.id === e.target.value
                    );
                    if (found) onSelectTownship(found);
                  }}
                  className="bg-transparent text-sm sm:text-base font-bold text-slate-900 border-none focus:ring-2 focus:ring-[#C8102E] rounded px-1 py-0.5 cursor-pointer -ml-1 hover:text-[#C8102E] transition-colors"
                >
                  {AVAILABLE_TOWNSHIPS.map((township) => (
                    <option key={township.id} value={township.id}>
                      {township.name} ({township.district})
                    </option>
                  ))}
                </select>

                <span className="hidden xl:inline-flex text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {currentTownship.coordinates.latitude.toFixed(4)}°N,{' '}
                  {currentTownship.coordinates.longitude.toFixed(4)}°E
                </span>
              </div>

              <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
                <span>{currentTownship.state}, {currentTownship.country}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date().toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="text-slate-300">•</span>
                  <span>{currentTownship.timezone}</span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Resilience pill, DB Status, Notification Bell, User Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Composite score badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block leading-tight">
                Resilience Index
              </span>
              <span className="text-xs font-extrabold text-emerald-950">
                {resilienceScore}/100 • Strong
              </span>
            </div>
          </div>

          {/* Firebase Connection Pill */}
          <div
            title={isFirebaseConnected ? 'Cloud Firestore Connected' : 'Connecting to Firestore...'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              isFirebaseConnected
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span className="hidden xl:inline">{isFirebaseConnected ? 'Firestore Connected' : 'Connecting DB'}</span>
          </div>

          {/* Notification Indicator with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Township alerts and notifications"
              className="relative p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C8102E] rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Township Climate Advisories</span>
                    <span className="px-1.5 py-0.2 bg-red-100 text-[#C8102E] text-[10px] font-bold rounded-full">
                      2 Active
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                      <div className="flex items-start gap-2">
                        {n.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Auth / Profile Button with Sime Darby Inspired Styling */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              currentUser
                ? currentUser.role === 'township_manager'
                  ? 'bg-red-50 border-red-200 text-[#C8102E] hover:bg-red-100/70'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {currentUser ? (
              <>
                {currentUser.role === 'township_manager' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C8102E]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span className="font-bold max-w-[110px] sm:max-w-[130px] truncate">
                  {currentUser.displayName || (currentUser.role === 'township_manager' ? 'Township Manager' : 'Elmina Resident')}
                </span>
                <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                  currentUser.role === 'township_manager'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-emerald-700 text-white'
                }`}>
                  {currentUser.role === 'township_manager' ? 'Manager' : 'Resident'}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Profile</span>
              </>
            )}
          </button>

          {/* Methodology Info Button */}
          <button
            onClick={onOpenMethodology}
            title="View mathematical scoring methodology"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-[#C8102E]" />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>
      </div>
    </header>
  );
};
