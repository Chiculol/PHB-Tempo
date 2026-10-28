/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CloudRain,
  SunMedium,
  Wind,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface AlertsCardProps {
  alerts: WeatherAlert[];
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-teal-800/15 dark:border-teal-400/20 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-3.5 sm:p-5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 dark:bg-teal-400/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Tempo estável em Parnaíba
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
            Sem alertas críticos no momento. Condições adequadas para passeios e atividades ao ar livre.
          </p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'rain':
        return <CloudRain size={18} className="sm:w-5 sm:h-5 text-sky-700 dark:text-sky-300" />;
      case 'uv':
        return <SunMedium size={18} className="sm:w-5 sm:h-5 text-amber-700 dark:text-amber-400" />;
      case 'wind':
        return <Wind size={18} className="sm:w-5 sm:h-5 text-cyan-700 dark:text-cyan-300" />;
      case 'heat':
        return <Flame size={18} className="sm:w-5 sm:h-5 text-rose-700 dark:text-rose-400" />;
      default:
        return <Info size={18} className="sm:w-5 sm:h-5 text-teal-700 dark:text-teal-400" />;
    }
  };

  const getAlertStyles = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'heat':
        return 'bg-rose-50/90 dark:bg-rose-950/35 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100';
      case 'uv':
        return 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100';
      case 'rain':
        return 'bg-sky-50/90 dark:bg-sky-950/35 border-sky-200 dark:border-sky-900/60 text-sky-950 dark:text-sky-100';
      case 'wind':
        return 'bg-cyan-50/90 dark:bg-cyan-950/35 border-cyan-200 dark:border-cyan-900/60 text-cyan-950 dark:text-cyan-100';
      default:
        return 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100';
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <span>Avisos e Recomendações do Dia</span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold tabular-nums">
            {alerts.length}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-3.5 sm:p-4 backdrop-blur-sm transition-all flex items-start gap-3 ${getAlertStyles(
              alert.type
            )}`}
          >
            <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 dark:bg-slate-900/70 shadow-xs shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold truncate leading-snug">
                  {alert.title}
                </h3>
                {alert.metricValue && (
                  <span className="text-[10px] sm:text-[11px] font-semibold opacity-90 whitespace-nowrap shrink-0">
                    {alert.metricValue}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs mt-1 leading-relaxed opacity-95">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
