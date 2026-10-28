/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WEATHER_CONFIG } from '../config/weatherConfig';
import { evaluateWeatherAlerts } from '../config/alertRules';
import {
  WeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  SunAndUvData,
} from '../types/weather';
import {
  getWeatherCondition,
  getShortRainTerm,
  getWindDirectionText,
  getUvCategoryAndRecommendation,
  formatHour,
  formatSimpleHour,
  formatDayOfWeek,
} from '../utils/weatherCodes';
import { cacheWeatherData, getCachedWeatherData } from './storageService';

interface OpenMeteoRawResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation?: number[];
    rain?: number[];
    weather_code: number[];
    uv_index?: number[];
    is_day?: number[];
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum?: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

/**
 * Consulta a API Open-Meteo e mapeia os dados para o formato da aplicação PHB Tempo
 */
export async function fetchParnaibaWeather(): Promise<WeatherData> {
  const { city, api } = WEATHER_CONFIG;

  const url = new URL(api.baseUrl);
  url.searchParams.set('latitude', city.latitude.toString());
  url.searchParams.set('longitude', city.longitude.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,precipitation_probability,precipitation,weather_code,uv_index,is_day'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset'
  );
  url.searchParams.set('timezone', city.timezone);
  url.searchParams.set('wind_speed_unit', api.windSpeedUnit);
  url.searchParams.set('forecast_days', api.forecastDays.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API Open-Meteo: status ${response.status}`);
    }

    const json: OpenMeteoRawResponse = await response.json();

    if (!json.current || !json.hourly || !json.daily) {
      throw new Error('Formato inesperado retornado pela API meteorológica');
    }

    // 1. Processar dados atuais
    const currentRaw = json.current;
    const isDay = currentRaw.is_day === 1;
    const isRaining =
      (currentRaw.rain ?? 0) > 0 ||
      (currentRaw.precipitation ?? 0) > 0 ||
      [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(currentRaw.weather_code);

    const current: CurrentWeather = {
      temperature: Math.round(currentRaw.temperature_2m),
      apparentTemperature: Math.round(currentRaw.apparent_temperature),
      humidity: Math.round(currentRaw.relative_humidity_2m),
      windSpeed: Math.round(currentRaw.wind_speed_10m),
      windDirection: currentRaw.wind_direction_10m,
      windDirectionText: getWindDirectionText(currentRaw.wind_direction_10m),
      windGusts: Math.round(currentRaw.wind_gusts_10m ?? currentRaw.wind_speed_10m),
      isRaining,
      precipitation: currentRaw.precipitation ?? 0,
      isDay,
      weatherCode: currentRaw.weather_code,
      condition: getWeatherCondition(currentRaw.weather_code, isDay),
    };

    // 2. Processar previsão das próximas 24 horas
    const hourlyTimes = json.hourly.time || [];
    let currentHourIndex = hourlyTimes.findIndex((t) => {
      const itemTime = new Date(t).getTime();
      const nowTime = new Date().getTime();
      return itemTime >= nowTime - 30 * 60 * 1000;
    });

    if (currentHourIndex === -1) currentHourIndex = 0;

    const hourly: HourlyForecastItem[] = [];
    const maxHourItems = 24;

    for (let i = 0; i < maxHourItems; i++) {
      const idx = currentHourIndex + i;
      if (idx >= hourlyTimes.length) break;

      const timeStr = hourlyTimes[idx];
      const hourLabel = i === 0 ? 'Agora' : formatHour(timeStr);
      const isItemDay = json.hourly.is_day ? json.hourly.is_day[idx] === 1 : true;
      const wCode = json.hourly.weather_code[idx];

      hourly.push({
        time: timeStr,
        hourLabel,
        temperature: Math.round(json.hourly.temperature_2m[idx]),
        precipitationProbability: Math.round(json.hourly.precipitation_probability[idx] ?? 0),
        precipitationAmount: json.hourly.precipitation ? Math.round((json.hourly.precipitation[idx] ?? 0) * 10) / 10 : 0,
        weatherCode: wCode,
        condition: getWeatherCondition(wCode, isItemDay),
        isDay: isItemDay,
        uvIndex: json.hourly.uv_index ? Math.max(0, json.hourly.uv_index[idx] ?? 0) : 0,
      });
    }

    // 3. Processar previsão dos próximos 7 dias
    // REQUISITO 5 & 6:
    // Em vez de usar o código severo do dia, analisar as horas entre 6h e 22h para achar
    // a condição predominante e extrair se há indicativo discreto de chuva e total em mm.
    const dailyTimes = json.daily.time || [];
    const daily: DailyForecastItem[] = [];
    const daysToShow = Math.min(7, dailyTimes.length);

    // Mapeamento auxiliar de horas por dia
    const hourlyByDay: Record<string, { time: string; code: number; prob: number; precip: number; hourNum: number }[]> = {};
    for (let h = 0; h < hourlyTimes.length; h++) {
      const t = hourlyTimes[h];
      const dayKey = t.substring(0, 10); // YYYY-MM-DD
      const dateObj = new Date(t);
      const hourNum = dateObj.getHours();

      if (!hourlyByDay[dayKey]) {
        hourlyByDay[dayKey] = [];
      }
      hourlyByDay[dayKey].push({
        time: t,
        code: json.hourly.weather_code[h],
        prob: json.hourly.precipitation_probability[h] ?? 0,
        precip: json.hourly.precipitation ? json.hourly.precipitation[h] ?? 0 : 0,
        hourNum,
      });
    }

    // Variáveis para avaliação de alertas de hoje (dia 0)
    let todayHoursWithHighProb = 0;
    let todayPeakProb = 0;
    let todayPeakHourStr = '14h';

    for (let i = 0; i < daysToShow; i++) {
      const dateStr = dailyTimes[i];
      const rawDailyCode = json.daily.weather_code[i];
      const dayHours = hourlyByDay[dateStr] || [];

      // Filtrar horas diurnas entre 6h e 22h
      const daytimeHours = dayHours.filter((h) => h.hourNum >= 6 && h.hourNum <= 22);

      // Calcular condição predominante entre 6h e 22h
      let predominantCode = rawDailyCode;
      if (daytimeHours.length > 0) {
        const codeCounts: Record<number, number> = {};
        daytimeHours.forEach((h) => {
          codeCounts[h.code] = (codeCounts[h.code] || 0) + 1;
        });

        // Encontrar o código com maior frequência entre 6h e 22h
        let maxCount = -1;
        Object.entries(codeCounts).forEach(([cStr, count]) => {
          const c = parseInt(cStr, 10);
          if (count > maxCount) {
            maxCount = count;
            predominantCode = c;
          }
        });
      }

      // Analisar pico de chuva e chuva em algum horário do dia
      let peakProb = 0;
      let peakHourStr = '15h';
      let peakRainCode = 61;
      let hasNoticeableRain = false;

      dayHours.forEach((h) => {
        if (h.prob > peakProb) {
          peakProb = h.prob;
          peakHourStr = formatSimpleHour(h.time);
          peakRainCode = h.code;
        }
        if (h.prob >= 30 || h.precip >= 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(h.code)) {
          hasNoticeableRain = true;
        }
      });

      // Total diário de precipitação em mm
      const precipSumRaw = json.daily.precipitation_sum ? json.daily.precipitation_sum[i] ?? 0 : 0;
      const precipitationSum = Math.round(precipSumRaw * 10) / 10;

      // REQUISITO 2: Se o acumulado diário for muito baixo (< 0.5 mm),
      // a descrição principal NÃO deve indicar chuva ou garoa. Descreve-se pela nebulosidade.
      const isRainCode = (code: number) =>
        [51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);

      if (
        precipitationSum < WEATHER_CONFIG.rain.minPrecipitationForRainDescription &&
        isRainCode(predominantCode)
      ) {
        // Procurar a condição de nebulosidade predominante nas horas diurnas
        const nonRainHours = daytimeHours.filter((h) => !isRainCode(h.code));
        if (nonRainHours.length > 0) {
          const nonRainCounts: Record<number, number> = {};
          nonRainHours.forEach((h) => {
            nonRainCounts[h.code] = (nonRainCounts[h.code] || 0) + 1;
          });
          let bestCount = -1;
          Object.entries(nonRainCounts).forEach(([cStr, count]) => {
            const c = parseInt(cStr, 10);
            if (count > bestCount) {
              bestCount = count;
              predominantCode = c;
            }
          });
        } else {
          // Se não houver horas sem chuva mas o acumulado é insignificante, descrever pela nebulosidade
          predominantCode = 2; // Parcialmente nublado
        }
      }

      // Indicador discreto de chuva se houver chance no dia (como informação secundária)
      let rainNotice: string | undefined = undefined;
      if (hasNoticeableRain && peakProb >= 25) {
        const term = getShortRainTerm(peakRainCode);
        rainNotice = `Possível ${term} às ${peakHourStr}`;
      }

      // Guardar métricas do primeiro dia (hoje) para alimentar as regras de avisos
      if (i === 0) {
        todayPeakProb = Math.max(peakProb, json.daily.precipitation_probability_max[0] ?? 0);
        todayPeakHourStr = peakHourStr;
        todayHoursWithHighProb = dayHours.filter((h) => h.prob >= 50).length;
      }

      // Formatar data abreviada: "28/10"
      const dateObj = new Date(dateStr + 'T12:00:00');
      const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      daily.push({
        date: dateStr,
        dayOfWeek: formatDayOfWeek(dateStr, i),
        formattedDate,
        maxTemp: Math.round(json.daily.temperature_2m_max[i]),
        minTemp: Math.round(json.daily.temperature_2m_min[i]),
        precipitationProbabilityMax: Math.round(json.daily.precipitation_probability_max[i] ?? peakProb),
        precipitationSum,
        peakPrecipitationHour: peakHourStr,
        hoursWithHighRainProbability: dayHours.filter((h) => h.prob >= 50).length,
        rainNotice,
        weatherCode: predominantCode,
        condition: getWeatherCondition(predominantCode, true),
        uvIndexMax: json.daily.uv_index_max ? Math.round(json.daily.uv_index_max[i] * 10) / 10 : 0,
        sunrise: json.daily.sunrise[i],
        sunset: json.daily.sunset[i],
      });
    }

    // 4. Processar Sol e UV
    const maxUvToday = daily[0]?.uvIndexMax ?? 8;
    const currentUv = hourly[0]?.uvIndex ?? (isDay ? Math.min(maxUvToday, 7) : 0);
    const uvInfo = getUvCategoryAndRecommendation(maxUvToday);

    const sunriseStr = json.daily.sunrise[0] ? formatHour(json.daily.sunrise[0]) : '05:30';
    const sunsetStr = json.daily.sunset[0] ? formatHour(json.daily.sunset[0]) : '17:45';

    // Duração do dia solar
    let durationHours = 12;
    let durationMinutes = 15;
    if (json.daily.sunrise[0] && json.daily.sunset[0]) {
      const sr = new Date(json.daily.sunrise[0]).getTime();
      const ss = new Date(json.daily.sunset[0]).getTime();
      const diffMs = ss - sr;
      if (diffMs > 0) {
        durationHours = Math.floor(diffMs / (1000 * 60 * 60));
        durationMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      }
    }

    const sunAndUv: SunAndUvData = {
      currentUvIndex: currentUv,
      maxUvIndexToday: maxUvToday,
      uvCategory: uvInfo.category,
      uvRecommendation: uvInfo.recommendation,
      sunriseFormatted: sunriseStr,
      sunsetFormatted: sunsetStr,
      daylightDurationHours: durationHours,
      daylightDurationMinutes: durationMinutes,
      isDaytime: isDay,
    };

    // 5. Avaliar avisos amigáveis com regras estritas de chuva (Item 7)
    const alerts = evaluateWeatherAlerts({
      apparentTemperature: current.apparentTemperature,
      temperature: current.temperature,
      windSpeed: current.windSpeed,
      windGusts: current.windGusts,
      isRaining: current.isRaining,
      precipitationProbabilityTodayMax: todayPeakProb,
      precipitationSumToday: daily[0]?.precipitationSum ?? 0,
      peakPrecipitationHourToday: todayPeakHourStr,
      hoursWithHighRainProbabilityToday: todayHoursWithHighProb,
      uvIndexMaxToday: maxUvToday,
      currentUvIndex: currentUv,
      isDay,
    });

    const transformedData: WeatherData = {
      city: city.name,
      state: city.state,
      current,
      hourly,
      daily,
      sunAndUv,
      alerts,
      lastUpdated: new Date().toISOString(),
      isCached: false,
    };

    // Armazenar no cache para suporte offline
    cacheWeatherData(transformedData);

    return transformedData;
  } catch (error) {
    // Tentar recuperar do cache local se a chamada à API falhar
    const cached = getCachedWeatherData();
    if (cached) {
      return cached;
    }
    throw error;
  }
}
