/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WEATHER_CONFIG } from './weatherConfig';

export interface TemperatureColorStop {
  temp: number;
  color: string;
  label: string;
}

export const MAP_CONFIG = {
  center: {
    lat: WEATHER_CONFIG.city.latitude,
    lng: WEATHER_CONFIG.city.longitude,
  },
  defaultZoom: 13,
  minZoom: 10,
  maxZoom: 18,
  tileLayer: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  },
  // Faixa de temperatura para a escala de cores (22 °C a 38 °C)
  temperatureScale: {
    minTemp: 22,
    maxTemp: 38,
    // Escala de degradê: azul, verde-água, amarelo, laranja, vermelho
    colorStops: [
      { temp: 22, color: '#3b82f6', label: '22 °C (Ameno)' },      // Azul
      { temp: 26, color: '#06b6d4', label: '26 °C (Agradável)' },  // Verde-água / Ciano
      { temp: 30, color: '#eab308', label: '30 °C (Morno)' },      // Amarelo
      { temp: 34, color: '#f97316', label: '34 °C (Quente)' },     // Laranja
      { temp: 38, color: '#ef4444', label: '38 °C (Muito quente)' },// Vermelho
    ] as TemperatureColorStop[],
  },
  // Opacidades da camada térmica translúcida
  overlayOpacity: {
    light: 0.30,
    dark: 0.38,
  },
};
