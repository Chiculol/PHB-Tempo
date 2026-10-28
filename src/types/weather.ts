/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UvCategory = 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto' | 'Extremo';

export interface WeatherCondition {
  code: number;
  description: string;
  iconName: string; // Lucide icon identifier
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  windGusts: number;
  isRaining: boolean;
  precipitation: number;
  isDay: boolean;
  weatherCode: number;
  condition: WeatherCondition;
}

export interface HourlyForecastItem {
  time: string; // ISO string
  hourLabel: string; // e.g. "14:00" or "Agora"
  temperature: number;
  precipitationProbability: number;
  precipitationAmount: number; // mm
  weatherCode: number;
  condition: WeatherCondition;
  isDay: boolean;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Hoje", "Amanhã", "Segunda", etc.
  formattedDate: string; // "28/10"
  maxTemp: number;
  minTemp: number;
  precipitationProbabilityMax: number;
  precipitationSum: number; // Total acumulado do dia em mm
  peakPrecipitationHour: string; // Horário em que ocorre a probabilidade máxima (ex: "15h")
  hoursWithHighRainProbability?: number; // Quantidade de horas no dia com probabilidade >= 50%
  rainNotice?: string; // Indicador discreto (ex: "Possível chuva às 15h")
  weatherCode: number;
  condition: WeatherCondition;
  uvIndexMax: number;
  sunrise: string; // ISO
  sunset: string; // ISO
}

export interface SunAndUvData {
  currentUvIndex: number;
  maxUvIndexToday: number;
  uvCategory: UvCategory;
  uvRecommendation: string;
  sunriseFormatted: string; // e.g. "05:32"
  sunsetFormatted: string; // e.g. "17:48"
  daylightDurationHours: number;
  daylightDurationMinutes: number;
  isDaytime: boolean;
}

export type AlertSeverity = 'info' | 'warning' | 'caution';
export type AlertType = 'rain' | 'uv' | 'wind' | 'heat';

export interface WeatherAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  metricValue?: string;
}

export interface WeatherData {
  city: string;
  state: string;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  sunAndUv: SunAndUvData;
  alerts: WeatherAlert[];
  lastUpdated: string; // ISO string
  isCached?: boolean;
  cacheTimestamp?: string;
}
