/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherAlert, WeatherData } from '../types/weather';
import { formatPrecipitationDisplay } from '../utils/weatherCodes';

/**
 * Limites configuráveis para geração de avisos meteorológicos amigáveis.
 * Todos os valores podem ser ajustados facilmente aqui.
 */
export const ALERT_RULES = {
  // Regras estritas para "Alta chance de chuva" (TODAS as 3 condições devem ser verdadeiras):
  rainHighProbabilityThreshold: 70, // Probabilidade máxima de 70% ou mais
  rainHighMinHoursCount: 3,         // Pelo menos 3 horas com probabilidade de 50% ou mais
  rainHighHourThreshold: 50,        // Limite por hora para contagem
  rainHighTotalSumThreshold: 2.0,   // Total diário previsto de 2 mm ou mais

  // Limiares para aviso leve de possibilidade de garoa rápida (se não atingir os 3 critérios acima):
  rainLightMinProbability: 50,      // Probabilidade máxima a partir de 50%
  rainLightMinSumThreshold: 0.5,    // Acumulado mínimo de 0.5 mm

  // Limiar de UV: a partir de "Alto" (Índice UV >= 6)
  uvHighThreshold: 6,

  // Limiar de vento: velocidade do vento ou rajadas a partir de 30 km/h
  windSpeedThreshold: 30,

  // Limiar de calor: sensação térmica a partir de 35 °C
  apparentTemperatureThreshold: 35,
};

export interface AlertEvaluationInput {
  apparentTemperature: number;
  temperature: number;
  windSpeed: number;
  windGusts: number;
  isRaining: boolean;
  precipitationProbabilityTodayMax: number;
  precipitationSumToday: number;
  peakPrecipitationHourToday: string;
  hoursWithHighRainProbabilityToday: number;
  uvIndexMaxToday: number;
  currentUvIndex: number;
  isDay: boolean;
}

/**
 * Avalia as condições meteorológicas e retorna avisos amigáveis em português,
 * evitando alarmes falsos de chuva e apresentando números transparentes.
 */
export function evaluateWeatherAlerts(input: AlertEvaluationInput): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  const maxProb = input.precipitationProbabilityTodayMax;
  const totalMm = input.precipitationSumToday;
  const hoursCount = input.hoursWithHighRainProbabilityToday;
  const peakHour = input.peakPrecipitationHourToday || 'horário da tarde';

  // 1. AVALIAÇÃO DE CHUVA
  if (input.isRaining) {
    alerts.push({
      id: 'rain-active',
      type: 'rain',
      title: 'Chuva no momento em Parnaíba',
      message: 'Está chovendo agora na cidade. Se for sair de moto, bicicleta ou a pé, leve capa ou guarda-chuva.',
      severity: 'warning',
      metricValue: 'Chuva ativa',
    });
  } else {
    // Critério 1: TODAS as três condições são verdadeiras para "Alta chance de chuva"
    // (Probabilidade >= 70% E pelo menos 3 horas com chance >= 50% E total previsto >= 2.0 mm)
    const isHighRain =
      maxProb >= ALERT_RULES.rainHighProbabilityThreshold &&
      hoursCount >= ALERT_RULES.rainHighMinHoursCount &&
      totalMm >= ALERT_RULES.rainHighTotalSumThreshold;

    // Critério 2: Apenas se não for alta chance, avalia possibilidade de garoa rápida
    // Somente quando a probabilidade máxima for >= 50% E o total previsto for >= 0.5 mm
    const isLightRain =
      maxProb >= ALERT_RULES.rainLightMinProbability &&
      totalMm >= ALERT_RULES.rainLightMinSumThreshold;

    if (isHighRain) {
      alerts.push({
        id: 'rain-high',
        type: 'rain',
        title: 'Alta chance de chuva hoje',
        message: `Previsão consistente com probabilidade máxima de ${maxProb}% (pico por volta das ${peakHour}), ${hoursCount} horas com chance acima de 50% e acumulado estimado de ${formatPrecipitationDisplay(totalMm)}. Recomendado levar guarda-chuva.`,
        severity: 'warning',
        metricValue: `Máx ${maxProb}% · ${formatPrecipitationDisplay(totalMm)}`,
      });
    } else if (isLightRain) {
      alerts.push({
        id: 'rain-light',
        type: 'rain',
        title: 'Possibilidade de garoa rápida',
        message: `Possibilidade de garoa rápida em algum momento do dia (pico de ${maxProb}% às ${peakHour}, total previsto de ${formatPrecipitationDisplay(totalMm)}).`,
        severity: 'info',
        metricValue: `Pico ${maxProb}% às ${peakHour} · ${formatPrecipitationDisplay(totalMm)}`,
      });
    }
    // Se nenhuma for verdadeira, NÃO mostra aviso de chuva!
  }

  // 2. ALERTA DE RADIAÇÃO ULTRAVIOLETA (UV >= 6)
  if (input.isDay && input.uvIndexMaxToday >= ALERT_RULES.uvHighThreshold) {
    const isVeryHighOrExtreme = input.uvIndexMaxToday >= 8;
    alerts.push({
      id: 'uv-warning',
      type: 'uv',
      title: isVeryHighOrExtreme ? 'Índice UV Muito Alto / Extremo' : 'Índice UV Alto hoje',
      message: isVeryHighOrExtreme
        ? `Radiação solar intensa no litoral (UV ${input.uvIndexMaxToday.toFixed(0)}). Use protetor solar FPS 50+, boné e óculos escuros, principalmente entre 10h e 16h.`
        : `Índice UV atingirá ${input.uvIndexMaxToday.toFixed(0)} hoje. Não se esqueça do protetor solar ao circular pela cidade.`,
      severity: isVeryHighOrExtreme ? 'warning' : 'caution',
      metricValue: `UV máx ${input.uvIndexMaxToday.toFixed(0)}`,
    });
  }

  // 3. ALERTA DE VENTO NO LITORAL (Vento >= 30 km/h ou rajadas >= 30 km/h)
  const maxWind = Math.max(input.windSpeed, input.windGusts);
  if (maxWind >= ALERT_RULES.windSpeedThreshold) {
    alerts.push({
      id: 'wind-warning',
      type: 'wind',
      title: 'Ventos fortes no litoral parnaibano',
      message: `Ventos atingindo ${maxWind.toFixed(0)} km/h. Comum no litoral do Piauí e Delta, exigindo atenção redobrada ao pilotar moto, andar de bicicleta ou praticar esportes na orla.`,
      severity: maxWind >= 45 ? 'warning' : 'info',
      metricValue: `${maxWind.toFixed(0)} km/h`,
    });
  }

  // 4. ALERTA DE CALOR INTENSO (Sensação Térmica >= 35 °C)
  if (input.apparentTemperature >= ALERT_RULES.apparentTemperatureThreshold) {
    alerts.push({
      id: 'heat-warning',
      type: 'heat',
      title: 'Calor intenso em Parnaíba',
      message: `Sensação térmica marcando ${input.apparentTemperature.toFixed(0)} °C. Beba bastante água, mantenha-se hidratado e procure ambientes com sombra ou boa ventilação.`,
      severity: input.apparentTemperature >= 38 ? 'warning' : 'caution',
      metricValue: `Sensação ${input.apparentTemperature.toFixed(0)} °C`,
    });
  }

  return alerts;
}

/**
 * Calcula os avisos meteorológicos na hora de exibir a partir dos dados atuais
 * e das regras vigentes, garantindo que use exatamente as métricas do dia de hoje (dia 0).
 */
export function computeAlertsFromWeatherData(data: WeatherData): WeatherAlert[] {
  if (!data || !data.current || !data.daily || data.daily.length === 0) {
    return [];
  }

  const todayDaily = data.daily[0];
  const maxProb = todayDaily?.precipitationProbabilityMax ?? 0;
  const totalMm = todayDaily?.precipitationSum ?? 0;
  const peakHour = todayDaily?.peakPrecipitationHour || 'horário da tarde';

  // Obter a quantidade de horas no dia de hoje com probabilidade >= 50%
  let hoursCount = todayDaily?.hoursWithHighRainProbability;
  if (hoursCount === undefined && Array.isArray(data.hourly)) {
    const todayDatePrefix = todayDaily.date;
    const hoursToday = data.hourly.filter((h) => h.time.startsWith(todayDatePrefix));
    hoursCount = hoursToday.filter(
      (h) => h.precipitationProbability >= ALERT_RULES.rainHighHourThreshold
    ).length;
  }

  return evaluateWeatherAlerts({
    apparentTemperature: data.current.apparentTemperature,
    temperature: data.current.temperature,
    windSpeed: data.current.windSpeed,
    windGusts: data.current.windGusts,
    isRaining: data.current.isRaining,
    precipitationProbabilityTodayMax: maxProb,
    precipitationSumToday: totalMm,
    peakPrecipitationHourToday: peakHour,
    hoursWithHighRainProbabilityToday: hoursCount ?? 0,
    uvIndexMaxToday: data.sunAndUv?.maxUvIndexToday ?? 0,
    currentUvIndex: data.sunAndUv?.currentUvIndex ?? 0,
    isDay: data.current.isDay,
  });
}
