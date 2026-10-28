/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { WEATHER_CONFIG } from './config/weatherConfig';
import { WeatherData } from './types/weather';
import { fetchParnaibaWeather } from './services/weatherService';
import {
  getInitialTheme,
  saveThemePreference,
  ThemePreference,
  purgeLegacyCachedAlerts,
} from './services/storageService';
import { computeAlertsFromWeatherData } from './config/alertRules';

import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { AlertsCard } from './components/AlertsCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { SunAndUvCard } from './components/SunAndUvCard';
import { WeatherMap } from './components/WeatherMap';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';
import { CloudSun, Map } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemePreference>(getInitialTheme);
  const [activeTab, setActiveTab] = useState<'weather' | 'map'>('weather');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar classe 'dark' nos elementos raiz (html e body)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  // Alternar tema entre claro e escuro
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Carregar dados da previsão do tempo (sem refazer ao alternar abas)
  const loadWeatherData = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      setError(null);
      const result = await fetchParnaibaWeather();
      setData(result);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Falha ao consultar a previsão do tempo de Parnaíba.';
      // Se não temos nenhum dado anterior em tela, definir erro fatal
      if (!data) {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [data]);

  // Requisito 3: Purgar avisos legados de versões anteriores no localStorage na inicialização
  useEffect(() => {
    purgeLegacyCachedAlerts();
  }, []);

  // Carga inicial
  useEffect(() => {
    loadWeatherData(false);
  }, [loadWeatherData]);

  // Atualização automática a cada 15 minutos
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadWeatherData(false);
    }, WEATHER_CONFIG.intervals.autoRefreshMs);

    return () => clearInterval(intervalId);
  }, [loadWeatherData]);

  // Requisito 3: Os avisos são calculados dinamicamente na hora de exibir
  // a partir dos dados e das regras atuais, garantindo que nunca usem strings obsoletas do cache.
  const activeAlerts = useMemo(() => {
    if (!data) return [];
    return computeAlertsFromWeatherData(data);
  }, [data]);

  // Atualização dinâmica da classe atmosférica no body conforme dia/noite e condição
  useEffect(() => {
    if (!data) return;

    const body = document.body;
    body.classList.remove(
      'weather-day-sunny',
      'weather-rainy',
      'weather-cloudy',
      'weather-night'
    );

    if (!data.current.isDay) {
      body.classList.add('weather-night');
    } else if (data.current.isRaining) {
      body.classList.add('weather-rainy');
    } else if (data.current.weatherCode >= 2 && data.current.weatherCode <= 48) {
      body.classList.add('weather-cloudy');
    } else {
      body.classList.add('weather-day-sunny');
    }
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200">
      <div>
        {/* Top Header Compartilhado */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onRefresh={() => loadWeatherData(true)}
          isRefreshing={isRefreshing}
          lastUpdated={data?.lastUpdated}
          isCached={data?.isCached}
        />

        {/* Banner de dados locais em modo offline */}
        {data?.isCached && (
          <OfflineBanner
            lastUpdated={data.cacheTimestamp || data.lastUpdated}
            onRefresh={() => loadWeatherData(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Conteúdo Principal */}
        <main className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {loading ? (
            <SkeletonLoader />
          ) : error && !data ? (
            <ErrorMessage
              message={error}
              onRetry={() => {
                setLoading(true);
                loadWeatherData(true);
              }}
              isRetrying={isRefreshing}
            />
          ) : data ? (
            <>
              {/* Barra de Navegação por Abas: "Tempo" e "Mapa" */}
              <div className="flex items-center justify-start">
                <nav
                  role="tablist"
                  aria-label="Visualização do PHB Tempo"
                  className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-700/70 inline-flex items-center gap-1 shadow-inner"
                >
                  <button
                    role="tab"
                    id="tab-weather"
                    aria-selected={activeTab === 'weather'}
                    aria-controls="panel-weather"
                    onClick={() => setActiveTab('weather')}
                    className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                      activeTab === 'weather'
                        ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm border border-teal-800/10 dark:border-sky-300/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <CloudSun
                      size={18}
                      className={
                        activeTab === 'weather'
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    />
                    <span>Tempo</span>
                  </button>

                  <button
                    role="tab"
                    id="tab-map"
                    aria-selected={activeTab === 'map'}
                    aria-controls="panel-map"
                    onClick={() => setActiveTab('map')}
                    className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                      activeTab === 'map'
                        ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm border border-teal-800/10 dark:border-sky-300/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Map
                      size={18}
                      className={
                        activeTab === 'map'
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    />
                    <span>Mapa</span>
                  </button>
                </nav>
              </div>

              {/* Aba 1: "Tempo" (continua exatamente igual, sem nenhuma alteração) */}
              {activeTab === 'weather' && (
                <div
                  role="tabpanel"
                  id="panel-weather"
                  aria-labelledby="tab-weather"
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Cartão de Destaque: Tempo Agora com Animação de Entrada 1 */}
                  <section aria-label="Tempo Atual" className="animate-card-1">
                    <CurrentWeatherCard current={data.current} />
                  </section>

                  {/* Cartão de Avisos Inteligentes e Amigáveis com Animação 2 */}
                  <section aria-label="Avisos e Recomendações" className="animate-card-2">
                    <AlertsCard alerts={activeAlerts} />
                  </section>

                  {/* Previsão Horária (24 Horas) com Animação 3 */}
                  <section aria-label="Previsão por Hora" className="animate-card-3">
                    <HourlyForecast hourly={data.hourly} />
                  </section>

                  {/* Previsão Diária (7 Dias) com Animação 4 */}
                  <section aria-label="Previsão para 7 Dias" className="animate-card-4">
                    <DailyForecast daily={data.daily} />
                  </section>

                  {/* Índices de Sol e Radiação UV com Animação 5 */}
                  <section aria-label="Sol e Índice UV" className="animate-card-5">
                    <SunAndUvCard sunAndUv={data.sunAndUv} />
                  </section>
                </div>
              )}

              {/* Aba 2: "Mapa" (nova aba com o mapa de Parnaíba e camada térmica) */}
              {activeTab === 'map' && (
                <div
                  role="tabpanel"
                  id="panel-map"
                  aria-labelledby="tab-map"
                  className="animate-card-1"
                >
                  <WeatherMap
                    current={data.current}
                    theme={theme}
                    isActiveTab={activeTab === 'map'}
                  />
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Rodapé minimalista com crédito dos dados */}
      <Footer />
    </div>
  );
}
