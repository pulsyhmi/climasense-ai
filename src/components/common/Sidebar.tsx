import React, { useState } from 'react';
import {
  SunMedium,
  Bot,
  Building2,
  SlidersHorizontal,
  Radio,
  Award,
  Leaf,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { ActiveModule } from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentTownship: TownshipProfile;
  isCollapsedDesktop?: boolean;
  onToggleCollapseDesktop?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  currentTownship,
  isCollapsedDesktop = false,
  onToggleCollapseDesktop,
}) => {

  const navItems: Array<{
    id: ActiveModule;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'resident_dashboard',
      label: 'Resident Climate',
      description: 'Local conditions & 5-day forecast',
      icon: SunMedium,
    },
    {
      id: 'ai_assistant',
      label: 'AI Climate Assistant',
      description: 'Natural language guidance',
      icon: Bot,
      badge: 'AI',
    },
    {
      id: 'township_management',
      label: 'Township Management',
      description: 'Micro-zones & interventions',
      icon: Building2,
    },
    {
      id: 'scenario_simulator',
      label: 'Scenario Simulator',
      description: 'Predictive climate sliders',
      icon: SlidersHorizontal,
    },
    {
      id: 'iot_sensors',
      label: 'IoT Sensor Fleet',
      description: 'Simulated mesh telemetry',
      icon: Radio,
      badge: 'Simulated',
    },
    {
      id: 'green_rewards',
      label: 'Green Rewards',
      description: 'Resident action & eco-points',
      icon: Award,
    },
  ];

  const handleNavClick = (id: ActiveModule) => {
    onSelectModule(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0C121E] text-white flex flex-col border-r border-slate-800 transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsedDesktop ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sime Darby & Nature Inspired Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8102E] via-[#A50D24] to-[#7A091A] p-0.5 shadow-md shadow-red-950/40 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0C121E] rounded-[10px] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {!isCollapsedDesktop && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white truncate">
                    ClimaSense<span className="text-[#C8102E]"> AI</span>
                  </h1>
                </div>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  Sime Darby Property
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {onToggleCollapseDesktop && (
            <button
              onClick={onToggleCollapseDesktop}
              aria-label={isCollapsedDesktop ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isCollapsedDesktop ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Mobile close */}
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Prototype Tag */}
        {!isCollapsedDesktop && (
          <div className="px-5 py-2.5 bg-[#080D16] border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">
              Sime Darby Hackathon
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#C8102E]/20 text-red-300 border border-[#C8102E]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Prototype
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!isCollapsedDesktop && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Platform Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsedDesktop ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C8102E] text-white font-semibold shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsedDesktop ? 'justify-center px-0' : ''}`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsedDesktop && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive
                              ? 'bg-white/30 text-white'
                              : item.badge === 'Simulated'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] block truncate ${
                        isActive ? 'text-red-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Township Anchor Info */}
        {!isCollapsedDesktop && (
          <div className="p-4 border-t border-slate-800 bg-[#080D16]">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {currentTownship.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  48m MSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                300-acre Central Park • 90km cycling and walking tracks • 35% urban tree canopy
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              City of Elmina Climate Resilience Prototype
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
