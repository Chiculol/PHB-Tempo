/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SunMedium, Sunrise, Sunset, ShieldAlert, Clock } from 'lucide-react';
import { SunAndUvData } from '../types/weather';

interface SunAndUvCardProps {
  sunAndUv: SunAndUvData;
}

export const SunAndUvCard: React.FC<SunAndUvCardProps> = ({ sunAndUv }) => {
  // Posição percentual na régua de UV (0 a 12)
  const uvPercent = Math.min(100, Math.max(0, (sunAndUv.maxUvIndexToday / 12) * 100));

  const getUvBadgeStyle = (category: SunAndUvData['uvCategory']) => {
    switch (category) {
      case 'Baixo':
        return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      case 'Moderado':
        return 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30';
      case 'Alto':
        return 'bg-orange-500/15 text-orange-900 dark:text-orange-300 border-orange-500/30';
      case 'Muito Alto':
        return 'bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-500/30';
      case 'Extremo':
        return 'bg-purple-500/15 text-purple-900 dark:text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      {/* Bloco 1: Índice UV */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <SunMedium size={18} className="text-amber-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Índice UV Solar
              </h3>
            </div>

            <span
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${getUvBadgeStyle(
                sunAndUv.uvCategory
              )}`}
            >
              {sunAndUv.uvCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1.5 sm:my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {sunAndUv.maxUvIndexToday.toFixed(0)}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">
              máximo previsto hoje
            </span>
          </div>

          {/* Barra gradiente de UV */}
          <div className="mt-2.5 sm:mt-3 mb-1.5 sm:mb-2">
            <div className="h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-400 via-rose-500 to-purple-600 relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-white shadow-md border border-slate-400 rounded-full -ml-1 transition-all"
                style={{ left: `${uvPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] sm:text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
              <span>0 (Baixo)</span>
              <span>3 (Mod)</span>
              <span>6 (Alto)</span>
              <span>8 (M.Alto)</span>
              <span>11+ (Extremo)</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2">
          <ShieldAlert size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {sunAndUv.uvRecommendation}
          </p>
        </div>
      </div>

      {/* Bloco 2: Nascer e Pôr do Sol */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Sunrise size={18} className="text-amber-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Sol & Fotoperíodo
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">
              <Clock size={12} className="shrink-0" />
              <span>{sunAndUv.daylightDurationHours}h {sunAndUv.daylightDurationMinutes}min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 my-1 sm:my-2">
            {/* Nascer do Sol */}
            <div className="p-2.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sunrise size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] text-amber-950/80 dark:text-amber-300/70 font-semibold block truncate">
                  Nascer do Sol
                </span>
                <p className="text-sm sm:text-lg font-bold text-amber-950 dark:text-amber-100 tabular-nums">
                  {sunAndUv.sunriseFormatted}
                </p>
              </div>
            </div>

            {/* Pôr do Sol */}
            <div className="p-2.5 sm:p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Sunset size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] text-teal-950/80 dark:text-teal-300/70 font-semibold block truncate">
                  Pôr do Sol
                </span>
                <p className="text-sm sm:text-lg font-bold text-teal-950 dark:text-teal-100 tabular-nums">
                  {sunAndUv.sunsetFormatted}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed text-center">
            Parnaíba fica próxima ao equador: horários solares quase constantes o ano todo.
          </p>
        </div>
      </div>
    </div>
  );
};
