/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalendarDays, Droplets } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatPrecipitationDisplay } from '../utils/weatherCodes';

interface DailyForecastProps {
  daily: DailyForecastItem[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  // Encontrar a menor mínima e maior máxima global da semana para escalar as barras
  const minWeekTemp = Math.min(...daily.map((d) => d.minTemp));
  const maxWeekTemp = Math.max(...daily.map((d) => d.maxTemp));
  const tempSpan = Math.max(1, maxWeekTemp - minWeekTemp);

  return (
    <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-3.5 sm:p-6 shadow-xs overflow-hidden">
      {/* Cabeçalho do Cartão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Previsão para os Próximos 7 Dias
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 pl-6 sm:pl-0">
          Condição diurna (6h às 22h) e chuva máxima
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {daily.map((day) => {
          // Cálculo visual da barra proporcional de temperatura
          const leftPercent = Math.max(
            0,
            Math.min(100, ((day.minTemp - minWeekTemp) / tempSpan) * 100)
          );
          const rightPercent = Math.max(
            0,
            Math.min(100, ((maxWeekTemp - day.maxTemp) / tempSpan) * 100)
          );

          return (
            <div
              key={day.date}
              className="py-3 sm:py-3.5"
            >
              {/* VERSÃO TELAS ESTREITAS (< sm / até 480px): Organizada em 2 linhas */}
              <div className="flex flex-col gap-2 sm:hidden">
                {/* Linha 1: Dia e data à esquerda, Ícone e descrição no centro, Chuva (% e mm) à direita */}
                <div className="flex items-center justify-between gap-2">
                  {/* Dia da semana e data (esquerda) */}
                  <div className="w-[68px] shrink-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight whitespace-nowrap">
                      {day.dayOfWeek}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {day.formattedDate}
                    </p>
                  </div>

                  {/* Ícone e condição predominante (centro) - quebra em até duas linhas sem reticências */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 px-1">
                    <WeatherIcon
                      name={day.condition.iconName}
                      size={18}
                      className="shrink-0 text-teal-600 dark:text-teal-400"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug break-words whitespace-normal">
                        {day.condition.description}
                      </span>
                      {day.rainNotice && (
                        <span className="text-[10px] font-medium text-sky-700 dark:text-sky-300 leading-tight">
                          ↳ {day.rainNotice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Probabilidade e acumulado de chuva (direita) - empilhados e sem quebra solta */}
                  <div className="flex flex-col items-end shrink-0 text-right whitespace-nowrap pl-1">
                    <div className="flex items-center gap-1">
                      <Droplets
                        size={11}
                        className={
                          day.precipitationProbabilityMax >= 30
                            ? 'text-sky-600 dark:text-sky-400 shrink-0'
                            : 'text-slate-400 dark:text-slate-500 shrink-0'
                        }
                      />
                      <span
                        className={`text-xs tabular-nums whitespace-nowrap ${
                          day.precipitationProbabilityMax >= 50
                            ? 'font-bold text-sky-700 dark:text-sky-300'
                            : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.precipitationProbabilityMax}%
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {formatPrecipitationDisplay(day.precipitationSum ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Linha 2: Temperatura mínima, barra térmica e máxima ocupando a largura toda */}
                <div className="w-full flex items-center gap-2 pt-0.5">
                  <span className="w-7 text-right text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums shrink-0">
                    {day.minTemp}°
                  </span>

                  <div className="flex-1 min-w-[50px] h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        right: `${rightPercent}%`,
                      }}
                    />
                  </div>

                  <span className="w-7 text-left text-xs font-extrabold text-slate-950 dark:text-slate-100 tabular-nums shrink-0">
                    {day.maxTemp}°
                  </span>
                </div>
              </div>

              {/* VERSÃO TELAS MÉDIAS E GRANDES (sm: e superior) */}
              <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-3 text-sm">
                {/* Dia da semana e data */}
                <div className="w-28 shrink-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {day.dayOfWeek}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {day.formattedDate}
                  </p>
                </div>

                {/* Ícone e condição predominante (6h-22h) com aviso discreto de chuva */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <WeatherIcon
                    name={day.condition.iconName}
                    size={20}
                    className="shrink-0 text-teal-600 dark:text-teal-400"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words whitespace-normal">
                        {day.condition.description}
                      </span>
                      {day.rainNotice && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-sky-700 dark:text-sky-300 shrink-0">
                          · {day.rainNotice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informação de Chuva: Máxima do dia e total formatado */}
                <div className="flex items-center justify-end gap-1 text-xs shrink-0 text-right min-w-[130px]">
                  <Droplets
                    size={13}
                    className={
                      day.precipitationProbabilityMax >= 30
                        ? 'text-sky-600 dark:text-sky-400 shrink-0'
                        : 'text-slate-400 dark:text-slate-500 shrink-0'
                    }
                  />
                  <div className="flex items-baseline gap-1 text-right">
                    <span
                      className={`tabular-nums ${
                        day.precipitationProbabilityMax >= 50
                          ? 'font-bold text-sky-700 dark:text-sky-300'
                          : 'font-semibold text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>Máx </span>
                      {day.precipitationProbabilityMax}%
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                        ({day.peakPrecipitationHour})
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      · {formatPrecipitationDisplay(day.precipitationSum ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Barra Térmica Mín / Máx */}
                <div className="w-40 flex items-center gap-2 shrink-0 justify-end">
                  <span className="w-7 text-right text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                    {day.minTemp}°
                  </span>

                  <div className="flex-1 min-w-[20px] h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        right: `${rightPercent}%`,
                      }}
                    />
                  </div>

                  <span className="w-7 text-left text-xs font-extrabold text-slate-950 dark:text-slate-100 tabular-nums">
                    {day.maxTemp}°
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
