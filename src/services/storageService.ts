/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WEATHER_CONFIG } from '../config/weatherConfig';
import { WeatherData } from '../types/weather';

export type ThemePreference = 'light' | 'dark';

/**
 * Obtém o tema armazenado ou a preferência do sistema operacional
 */
export function getInitialTheme(): ThemePreference {
  try {
    const saved = localStorage.getItem(WEATHER_CONFIG.storage.themeKey);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Primeira visita: verificar preferência do sistema
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Caso o localStorage esteja indisponível
  }
  return 'light';
}

/**
 * Salva a preferência de tema no localStorage
 */
export function saveThemePreference(theme: ThemePreference): void {
  try {
    localStorage.setItem(WEATHER_CONFIG.storage.themeKey, theme);
  } catch {
    // Ignore storage errors in restrictive environments
  }
}

/**
 * Obtém os últimos dados do tempo salvos no cache local.
 * Descarta qualquer aviso legado que tenha sido salvo anteriormente.
 */
export function getCachedWeatherData(): WeatherData | null {
  try {
    const raw = localStorage.getItem(WEATHER_CONFIG.storage.weatherCacheKey);
    if (!raw) return null;
    const data = JSON.parse(raw) as WeatherData;
    if (data && data.current && Array.isArray(data.hourly) && Array.isArray(data.daily)) {
      const sanitizedDaily = data.daily.map((item) => ({
        ...item,
        precipitationSum: typeof item.precipitationSum === 'number' ? item.precipitationSum : 0,
        peakPrecipitationHour: item.peakPrecipitationHour || '12h',
        precipitationProbabilityMax: typeof item.precipitationProbabilityMax === 'number' ? item.precipitationProbabilityMax : 0,
      }));

      // Requisito 3: Avisos NÃO são lidos do cache. Devem ser calculados na hora de exibir.
      return {
        ...data,
        alerts: [],
        daily: sanitizedDaily,
        isCached: true,
      };
    }
  } catch {
    // Erro ao desserializar
  }
  return null;
}

/**
 * Salva os dados do tempo no cache local sem os avisos.
 * Requisito 3: Avisos são calculados na hora de exibir e não guardados no cache.
 */
export function cacheWeatherData(data: WeatherData): void {
  try {
    const { alerts: _ignoredAlerts, ...rest } = data;
    const toSave: WeatherData = {
      ...rest,
      alerts: [], // Nunca guarda avisos no cache
      isCached: false,
      cacheTimestamp: new Date().toISOString(),
    };
    localStorage.setItem(WEATHER_CONFIG.storage.weatherCacheKey, JSON.stringify(toSave));
  } catch {
    // Ignore storage quota or disabled storage
  }
}

/**
 * Elimina avisos legados que possam ter sido gravados no localStorage em versões anteriores
 */
export function purgeLegacyCachedAlerts(): void {
  try {
    const raw = localStorage.getItem(WEATHER_CONFIG.storage.weatherCacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.alerts) && parsed.alerts.length > 0) {
        parsed.alerts = [];
        localStorage.setItem(WEATHER_CONFIG.storage.weatherCacheKey, JSON.stringify(parsed));
      }
    }
  } catch {
    // Ignore storage errors
  }
}
