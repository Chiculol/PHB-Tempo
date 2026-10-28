/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Clock } from 'lucide-react';
import { HourlyForecastItem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4 sm:p-6 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Previsão para as Próximas 24 Horas
          </h2>
        </div>

        {/* Controles de rolagem para desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Rolar para direita"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carrossel de 24 horas com rolagem horizontal livre no toque */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
      >
        {hourly.map((item, index) => {
          const isCurrent = index === 0;
          return (
            <div
              key={item.time}
              className={`flex-shrink-0 flex flex-col items-center justify-between py-2.5 sm:py-3 px-2.5 sm:px-3.5 rounded-2xl border min-w-[70px] sm:min-w-[78px] text-center transition-all duration-200 active:scale-95 ${
                isCurrent
                  ? 'bg-teal-50 dark:bg-teal-400/15 border-teal-500/40 dark:border-teal-400/30 text-teal-950 dark:text-teal-100 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/70 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-[11px] sm:text-xs font-semibold opacity-90 whitespace-nowrap">
                {item.hourLabel}
              </span>

              <div className="my-2 sm:my-2.5">
                <WeatherIcon
                  name={item.condition.iconName}
                  size={20}
                  className="sm:w-[22px] sm:h-[22px]"
                />
              </div>

              <span className="text-xs sm:text-sm font-extrabold tabular-nums">
                {item.temperature}°
              </span>

              {/* Probabilidade de chuva */}
              <div className="flex items-center gap-0.5 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] tabular-nums">
                <Droplets
                  size={10}
                  className={
                    item.precipitationProbability >= 30
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }
                />
                <span
                  className={
                    item.precipitationProbability >= 50
                      ? 'font-bold text-sky-700 dark:text-sky-300'
                      : 'font-medium text-slate-600 dark:text-slate-400'
                  }
                >
                  {item.precipitationProbability}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
