/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  Compass,
} from 'lucide-react';
import { CurrentWeather } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  current: CurrentWeather;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ current }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md shadow-sm transition-all p-4 sm:p-8">
      {/* Luz ambiente de fundo sutil baseada em dia ou noite */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-20 ${
          current.isDay
            ? 'bg-gradient-to-br from-amber-300 via-teal-300 to-transparent'
            : 'bg-gradient-to-br from-sky-600 via-indigo-500 to-transparent'
        }`}
      />

      <div className="relative z-10">
        {/* Cabeçalho do Cartão: Cidade e Indicador de Chuva */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-teal-400">
              Tempo Agora
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {current.isDay ? 'Período diurno' : 'Período noturno'}
            </span>
          </div>

          {/* Indicador se está chovendo */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border ${
              current.isRaining
                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800/60'
            }`}
          >
            <CloudRain size={13} className={current.isRaining ? 'animate-bounce text-sky-700 dark:text-sky-300' : 'text-teal-600 dark:text-teal-400'} />
            <span>{current.isRaining ? 'Chovendo agora' : 'Sem chuva no momento'}</span>
          </div>
        </div>

        {/* Bloco Central: Temperatura + Condição do Tempo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 my-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {current.temperature}°
              </span>
              <span className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                C
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 mt-2">
              <WeatherIcon
                name={current.condition.iconName}
                size={30}
                animated={true}
                className="shrink-0"
              />
              <p className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {current.condition.description}
              </p>
            </div>
          </div>

          {/* Destaque da Sensação Térmica em cartão suave estilo areia */}
          <div className="w-full sm:w-auto bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/15 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 sm:min-w-[200px]">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Thermometer size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/90 font-semibold">
                Sensação Térmica
              </p>
              <p className="text-xl sm:text-2xl font-bold text-amber-950 dark:text-amber-200 tabular-nums">
                {current.apparentTemperature}°C
              </p>
            </div>
          </div>
        </div>

        {/* Grade de Métricas Secundárias: Umidade, Vento, Direção e Rajadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100 dark:border-slate-800/80">
          {/* Umidade */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 dark:bg-teal-400/10 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Droplets size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Umidade Relativa</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {current.humidity}%
              </p>
            </div>
          </div>

          {/* Velocidade e Rajadas de Vento */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 dark:bg-sky-400/10 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Wind size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Velocidade do Vento</span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {current.windSpeed} km/h
                </p>
                {current.windGusts > current.windSpeed && (
                  <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">
                    (rajadas até {current.windGusts} km/h)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direção do Vento */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 sm:col-span-2 lg:col-span-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Compass size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Direção do Vento</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {current.windDirectionText}
                </p>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  ({current.windDirection}°)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
