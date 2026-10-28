/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const WEATHER_CONFIG = {
  city: {
    name: 'Parnaíba',
    state: 'PI',
    fullName: 'Parnaíba, Piauí',
    region: 'Litoral Piauiense / Delta do Parnaíba',
    latitude: -2.9038,
    longitude: -41.7766,
    timezone: 'America/Fortaleza',
  },
  api: {
    baseUrl: 'https://api.open-meteo.com/v1/forecast',
    windSpeedUnit: 'kmh' as const,
    temperatureUnit: 'celsius' as const,
    forecastDays: 8,
  },
  intervals: {
    // 15 minutes auto-refresh in milliseconds
    autoRefreshMs: 15 * 60 * 1000,
  },
  storage: {
    themeKey: 'phb_tempo_theme_preference',
    weatherCacheKey: 'phb_tempo_cached_weather_data',
  },
  rain: {
    // Volume mínimo diário para que a condição principal do dia seja descrita como chuva/garoa
    // Abaixo disso (< 0.5 mm), descreve-se pela nebulosidade (ex.: Parcialmente nublado)
    minPrecipitationForRainDescription: 0.5, // mm
  },
};
