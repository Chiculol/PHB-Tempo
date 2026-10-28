/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MAP_CONFIG } from '../config/mapConfig';
import {
  getTemperatureColor,
  getTemperatureColorRgba,
  getTemperatureThermalLabel,
} from '../utils/temperatureColor';
import { ThemePreference } from '../services/storageService';
import { CurrentWeather } from '../types/weather';
import { MapPin, LocateFixed, Thermometer, Layers, Info } from 'lucide-react';

interface WeatherMapProps {
  current: CurrentWeather;
  theme: ThemePreference;
  isActiveTab: boolean;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  current,
  theme,
  isActiveTab,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const thermalCircleRef = useRef<L.Circle | null>(null);

  const [overlayIntensity, setOverlayIntensity] = useState<number>(() =>
    theme === 'dark' ? MAP_CONFIG.overlayOpacity.dark : MAP_CONFIG.overlayOpacity.light
  );

  const currentColorHex = getTemperatureColor(current.temperature);
  const thermalLabel = getTemperatureThermalLabel(current.temperature);
  const stops = MAP_CONFIG.temperatureScale.colorStops;

  // Atualizar intensidade da camada ao mudar tema
  useEffect(() => {
    setOverlayIntensity(
      theme === 'dark' ? MAP_CONFIG.overlayOpacity.dark : MAP_CONFIG.overlayOpacity.light
    );
  }, [theme]);

  // Inicializar o mapa do Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const { center, defaultZoom, minZoom, maxZoom, tileLayer } = MAP_CONFIG;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: defaultZoom,
      minZoom,
      maxZoom,
      zoomControl: false, // Adicionamos controle estilizado ou padrão
    });

    // Adicionar controle de zoom no canto superior direito
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    // Camada de ladrilhos do OpenStreetMap com atribuição oficial obrigatória
    L.tileLayer(tileLayer.url, {
      attribution: tileLayer.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Marcador estilizado para o centro de Parnaíba
    const customIcon = L.divIcon({
      className: 'phb-custom-pin',
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: ${currentColorHex};
          color: white;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          <span>Parnaíba</span>
          <span>·</span>
          <span>${current.temperature}°C</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const marker = L.marker([center.lat, center.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 4px; line-height: 1.4;">
        <strong style="font-size: 14px; color: #0f172a;">Parnaíba - PI</strong><br/>
        <span style="font-size: 12px; color: #475569;">Temperatura atual: <strong>${current.temperature}°C</strong> (${thermalLabel})</span><br/>
        <span style="font-size: 12px; color: #475569;">Sensação térmica: <strong>${current.apparentTemperature}°C</strong></span><br/>
        <span style="font-size: 12px; color: #475569;">Condição: ${current.condition.description}</span>
      </div>
    `);

    // Camada térmica circular centrada na região de Parnaíba e Delta
    const circle = L.circle([center.lat, center.lng], {
      color: currentColorHex,
      fillColor: currentColorHex,
      fillOpacity: overlayIntensity,
      weight: 1.5,
      radius: 8500, // 8.5 km cobrindo toda a mancha urbana e arredores
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;
    thermalCircleRef.current = circle;

    // Forçar invalidateSize para evitar mapa cinza
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Recalcular tamanho do mapa quando a aba se torna ativa (evita tela cinza / corte)
  useEffect(() => {
    if (isActiveTab && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);

      const secondTimer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);

      return () => {
        clearTimeout(timer);
        clearTimeout(secondTimer);
      };
    }
  }, [isActiveTab]);

  // Atualizar cor da camada translúcida e do marcador quando a temperatura mudar
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (thermalCircleRef.current) {
      thermalCircleRef.current.setStyle({
        color: currentColorHex,
        fillColor: currentColorHex,
        fillOpacity: overlayIntensity,
      });
    }

    if (markerRef.current) {
      const updatedIcon = L.divIcon({
        className: 'phb-custom-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: ${currentColorHex};
            color: white;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            border: 2px solid white;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <span>Parnaíba</span>
            <span>·</span>
            <span>${current.temperature}°C</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      markerRef.current.setIcon(updatedIcon);
      markerRef.current.setPopupContent(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; line-height: 1.4;">
          <strong style="font-size: 14px; color: #0f172a;">Parnaíba - PI</strong><br/>
          <span style="font-size: 12px; color: #475569;">Temperatura atual: <strong>${current.temperature}°C</strong> (${thermalLabel})</span><br/>
          <span style="font-size: 12px; color: #475569;">Sensação térmica: <strong>${current.apparentTemperature}°C</strong></span><br/>
          <span style="font-size: 12px; color: #475569;">Condição: ${current.condition.description}</span>
        </div>
      `);
    }
  }, [current.temperature, current.apparentTemperature, current.condition.description, currentColorHex, overlayIntensity, thermalLabel]);

  // Resetar centro para Parnaíba
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [MAP_CONFIG.center.lat, MAP_CONFIG.center.lng],
        MAP_CONFIG.defaultZoom,
        { animate: true }
      );
    }
  };

  // Posição percentual do indicador na barra de legenda (22 a 38 °C)
  const minTemp = MAP_CONFIG.temperatureScale.minTemp;
  const maxTemp = MAP_CONFIG.temperatureScale.maxTemp;
  const tempSpan = maxTemp - minTemp;
  const pointerPercent = Math.max(
    0,
    Math.min(100, ((current.temperature - minTemp) / tempSpan) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Container Principal do Mapa */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4 sm:p-6 shadow-xs overflow-hidden">
        {/* Topo do cartão com controles e status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-teal-700 dark:text-teal-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Mapa Térmico de Parnaíba
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Camada translúcida representando a temperatura atual ({current.temperature}°C · {thermalLabel})
            </p>
          </div>

          {/* Botões de ação do mapa */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRecenter}
              title="Centralizar mapa em Parnaíba"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <LocateFixed size={14} />
              <span>Centralizar</span>
            </button>
          </div>
        </div>

        {/* Viewport do Mapa Leaflet */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[380px] sm:h-[480px] w-full">
          {/* Container do Leaflet */}
          <div
            ref={mapContainerRef}
            className={`w-full h-full z-0 ${theme === 'dark' ? 'dark-map-tiles' : ''}`}
          />

          {/* Camada global translúcida sobre o mapa que responde dinamicamente à temperatura */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-500 z-10"
            style={{
              backgroundColor: getTemperatureColorRgba(current.temperature, overlayIntensity),
              mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
            }}
          />

          {/* Badge flutuante no mapa com temperatura e condição */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-md flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <div
                className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: currentColorHex }}
              />
              <span>{current.temperature}°C</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {current.condition.description}
              </span>
            </div>
          </div>
        </div>

        {/* Legenda com a escala de cores e indicação da temperatura atual */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Escala de Temperatura:</span>
            </span>
            <span className="tabular-nums font-bold text-slate-900 dark:text-slate-100">
              Atual: {current.temperature}°C ({thermalLabel})
            </span>
          </div>

          {/* Barra de degradê com ponteiro indicador da temperatura atual */}
          <div className="relative pt-3 pb-1">
            {/* Ponteiro indicador */}
            <div
              className="absolute top-0 -ml-2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${pointerPercent}%` }}
            >
              <span className="text-[10px] font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-1 rounded shadow-xs border border-slate-300 dark:border-slate-600 tabular-nums">
                {current.temperature}°
              </span>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-800 dark:border-t-slate-200" />
            </div>

            {/* Barra gradiente (Azul -> Verde-água -> Amarelo -> Laranja -> Vermelho) */}
            <div className="h-3 rounded-full bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] via-[#eab308] via-[#f97316] to-[#ef4444] shadow-inner" />

            {/* Rótulos dos extremos e marcos da escala */}
            <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1.5 tabular-nums">
              <span>{stops[0].temp}°C (Azul)</span>
              <span>{stops[1].temp}°C (Verde-água)</span>
              <span>{stops[2].temp}°C (Amarelo)</span>
              <span>{stops[3].temp}°C (Laranja)</span>
              <span>{stops[4].temp}°C (Vermelho)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
            * A cor da camada sobre o mapa adapta-se automaticamente à temperatura registrada em Parnaíba. Arraste e utilize os botões (+ / -) para aproximar ou afastar.
          </p>
        </div>
      </div>
    </div>
  );
};
