import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  simulated?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-700 bg-emerald-50 border-emerald-100',
  badge,
  trendText,
  trendType = 'neutral',
  simulated = false,
  className = '',
}) => {
  const trendColorClass = {
    positive: 'text-emerald-700 bg-emerald-50/80',
    negative: 'text-rose-700 bg-rose-50/80',
    warning: 'text-amber-700 bg-amber-50/80',
    neutral: 'text-slate-600 bg-slate-100',
  }[trendType];

  return (
    <div
      className={`relative bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300 ${className}`}
    >
      {simulated && (
        <span className="absolute top-2.5 right-2.5 text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          Simulated
        </span>
      )}

      <div className="flex items-start justify-between gap-3 mb-3 pr-14">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-lg border ${iconColor}`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {!simulated && badge && <div>{badge}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-500">{unit}</span>
        )}
      </div>

      {(trendText || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trendText && (
            <span
              className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded ${trendColorClass}`}
            >
              {trendText}
            </span>
          )}
          {simulated && badge && <div className="ml-auto">{badge}</div>}
        </div>
      )}
    </div>
  );
};
