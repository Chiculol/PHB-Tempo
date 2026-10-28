/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAP_CONFIG } from '../config/mapConfig';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Converte um valor de temperatura (°C) em uma cor correspondente na escala de degradê
 * (Azul -> Verde-água -> Amarelo -> Laranja -> Vermelho).
 */
export function getTemperatureColor(temp: number): string {
  const stops = MAP_CONFIG.temperatureScale.colorStops;

  if (temp <= stops[0].temp) {
    return stops[0].color;
  }
  if (temp >= stops[stops.length - 1].temp) {
    return stops[stops.length - 1].color;
  }

  // Encontrar o intervalo entre os pontos de parada
  for (let i = 0; i < stops.length - 1; i++) {
    const lower = stops[i];
    const upper = stops[i + 1];

    if (temp >= lower.temp && temp <= upper.temp) {
      const factor = (temp - lower.temp) / (upper.temp - lower.temp);
      const lowerRgb = hexToRgb(lower.color);
      const upperRgb = hexToRgb(upper.color);

      const r = lowerRgb.r + factor * (upperRgb.r - lowerRgb.r);
      const g = lowerRgb.g + factor * (upperRgb.g - lowerRgb.g);
      const b = lowerRgb.b + factor * (upperRgb.b - lowerRgb.b);

      return rgbToHex({ r, g, b });
    }
  }

  return stops[2].color; // fallback amarelo
}

/**
 * Retorna a cor em formato RGBA com opacidade configurada
 */
export function getTemperatureColorRgba(temp: number, opacity: number): string {
  const hex = getTemperatureColor(temp);
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Retorna a categoria descritiva da sensação da temperatura
 */
export function getTemperatureThermalLabel(temp: number): string {
  if (temp < 24) return 'Ameno';
  if (temp < 28) return 'Agradável';
  if (temp < 32) return 'Morno';
  if (temp < 36) return 'Quente';
  return 'Muito quente';
}
