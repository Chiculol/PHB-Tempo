/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherCondition, UvCategory } from '../types/weather';

/**
 * Mapeamento dos códigos WMO da Open-Meteo para descrições em português
 * com termos regionais reconhecidos em Parnaíba (garoa, chuva fraca, chuva forte, pancadas).
 */
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherCondition {
  switch (code) {
    case 0:
      return {
        code,
        description: isDay ? 'Céu limpo ensolarado' : 'Céu estrelado e limpo',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        code,
        description: isDay ? 'Predominantemente ensolarado' : 'Predominantemente limpo',
        iconName: isDay ? 'SunMedium' : 'MoonStar',
      };
    case 2:
      return {
        code,
        description: 'Parcialmente nublado',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3:
      return {
        code,
        description: 'Nublado / Encoberto',
        iconName: 'Cloud',
      };
    case 45:
    case 48:
      return {
        code,
        description: 'Nevoeiro matinal',
        iconName: 'CloudFog',
      };
    case 51:
      return {
        code,
        description: 'Garoa leve',
        iconName: 'CloudDrizzle',
      };
    case 53:
      return {
        code,
        description: 'Garoa',
        iconName: 'CloudDrizzle',
      };
    case 55:
    case 56:
    case 57:
      return {
        code,
        description: 'Garoa contínua',
        iconName: 'CloudDrizzle',
      };
    case 61:
      return {
        code,
        description: 'Chuva fraca',
        iconName: isDay ? 'CloudSunRain' : 'CloudMoonRain',
      };
    case 63:
      return {
        code,
        description: 'Chuva moderada',
        iconName: 'CloudRain',
      };
    case 65:
      return {
        code,
        description: 'Chuva forte',
        iconName: 'CloudRainWind',
      };
    case 80:
      return {
        code,
        description: 'Pancadas de chuva rápida',
        iconName: isDay ? 'CloudSunRain' : 'CloudMoonRain',
      };
    case 81:
      return {
        code,
        description: 'Pancadas de chuva',
        iconName: 'CloudRain',
      };
    case 82:
      return {
        code,
        description: 'Pancadas fortes de chuva',
        iconName: 'CloudRainWind',
      };
    case 95:
      return {
        code,
        description: 'Pancadas com trovoadas',
        iconName: 'CloudLightning',
      };
    case 96:
    case 99:
      return {
        code,
        description: 'Chuva forte com trovoadas',
        iconName: 'CloudLightning',
      };
    default:
      return {
        code,
        description: isDay ? 'Tempo firme' : 'Noite amena',
        iconName: isDay ? 'Sun' : 'Moon',
      };
  }
}

/**
 * Retorna termo amigável curto de chuva para avisos discretos
 */
export function getShortRainTerm(code: number): string {
  if ([51, 53, 55, 56, 57].includes(code)) return 'garoa';
  if ([80, 81, 82, 95].includes(code)) return 'pancada';
  if (code === 65 || code === 96 || code === 99) return 'chuva forte';
  if (code === 61) return 'chuva fraca';
  return 'chuva';
}

/**
 * Converte graus de direção do vento em pontos cardeais em português
 */
export function getWindDirectionText(degrees: number): string {
  const directions = [
    { label: 'Norte (N)', min: 348.75, max: 360 },
    { label: 'Norte (N)', min: 0, max: 11.25 },
    { label: 'Norte-Nordeste (NNE)', min: 11.25, max: 33.75 },
    { label: 'Nordeste (NE)', min: 33.75, max: 56.25 },
    { label: 'Leste-Nordeste (ENE)', min: 56.25, max: 78.75 },
    { label: 'Leste (L)', min: 78.75, max: 101.25 },
    { label: 'Leste-Sudeste (ESE)', min: 101.25, max: 123.75 },
    { label: 'Sudeste (SE)', min: 123.75, max: 146.25 },
    { label: 'Sul-Sudeste (SSE)', min: 146.25, max: 168.75 },
    { label: 'Sul (S)', min: 168.75, max: 191.25 },
    { label: 'Sul-Sudoeste (SSO)', min: 191.25, max: 213.75 },
    { label: 'Sudoeste (SO)', min: 213.75, max: 236.25 },
    { label: 'Oeste-Sudoeste (OSO)', min: 236.25, max: 258.75 },
    { label: 'Oeste (O)', min: 258.75, max: 281.25 },
    { label: 'Oeste-Noroeste (ONO)', min: 281.25, max: 303.75 },
    { label: 'Noroeste (NO)', min: 303.75, max: 326.25 },
    { label: 'Norte-Noroeste (NNO)', min: 326.25, max: 348.75 },
  ];

  const normalized = ((degrees % 360) + 360) % 360;
  for (const dir of directions) {
    if (normalized >= dir.min && normalized <= dir.max) {
      return dir.label;
    }
  }
  return 'Leste (L)';
}

/**
 * Classifica o Índice UV e fornece recomendação de cuidado
 */
export function getUvCategoryAndRecommendation(uvIndex: number): {
  category: UvCategory;
  recommendation: string;
  colorClass: string;
} {
  const rounded = Math.round(uvIndex);
  if (rounded <= 2) {
    return {
      category: 'Baixo',
      recommendation: 'Baixo risco. Seguro para atividades ao ar livre sem proteção intensa.',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (rounded <= 5) {
    return {
      category: 'Moderado',
      recommendation: 'Risco moderado. Recomendado usar óculos de sol e protetor solar em caso de exposição prolongada.',
      colorClass: 'text-amber-600 dark:text-amber-400',
    };
  }
  if (rounded <= 7) {
    return {
      category: 'Alto',
      recommendation: 'Risco alto. Use protetor solar FPS 30+, óculos de sol, boné e procure sombra entre 10h e 16h.',
      colorClass: 'text-orange-600 dark:text-orange-400',
    };
  }
  if (rounded <= 10) {
    return {
      category: 'Muito Alto',
      recommendation: 'Risco muito alto. Evite sol direto nos horários de pico, use roupas leves com proteção e hidrate-se.',
      colorClass: 'text-rose-600 dark:text-rose-400',
    };
  }
  return {
    category: 'Extremo',
    recommendation: 'Risco extremo. Radiação ultravioleta crítica. Proteja a pele totalmente e evite exposição solar ao meio-dia.',
    colorClass: 'text-purple-600 dark:text-purple-400',
  };
}

/**
 * Formata um timestamp ISO para horário local no padrão brasileiro (ex: 14:30)
 */
export function formatHour(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Formata apenas a hora simples (ex: "15h" ou "09h")
 */
export function formatSimpleHour(isoString: string): string {
  try {
    const date = new Date(isoString);
    const hour = date.getHours().toString().padStart(2, '0');
    return `${hour}h`;
  } catch {
    return '--h';
  }
}

/**
 * Formata data para dia da semana amigável (ex: Hoje, Amanhã, Terça, etc.)
 */
export function formatDayOfWeek(dateString: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day, 12, 0, 0);

      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      // Capitalize first letter and clean suffix like "-feira"
      const clean = dayName.replace('-feira', '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  } catch {
    // fallback
  }

  return 'Dia ' + (index + 1);
}

/**
 * Formata o total acumulado de chuva para exibição limpa:
 * - 0 mm -> "0 mm"
 * - Menor que 1 mm (> 0 e < 1.0) -> "< 1 mm"
 * - 1 mm ou mais -> "1.5 mm", "3 mm", etc.
 */
export function formatPrecipitationDisplay(mm?: number | null): string {
  if (mm === undefined || mm === null || typeof mm !== 'number' || isNaN(mm) || mm <= 0) {
    return '0 mm';
  }
  if (mm < 1.0) {
    return '< 1 mm';
  }
  return `${mm % 1 === 0 ? mm : mm.toFixed(1)} mm`;
}
