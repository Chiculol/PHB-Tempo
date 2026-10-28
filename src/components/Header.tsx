/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, RotateCw, MapPin } from 'lucide-react';
import { ThemePreference } from '../services/storageService';

interface HeaderProps {
  theme: ThemePreference;
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: string;
  isCached?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onRefresh,
  isRefreshing,
  lastUpdated,
  isCached,
}) => {
  const formattedTime = React.useMemo(() => {
    if (!lastUpdated) return '';
    try {
      const d = new Date(lastUpdated);
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [lastUpdated]);

  return (
    <header className="w-full border-b border-teal-900/10 dark:border-sky-300/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Marca e Localização */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-600/15 dark:bg-teal-400/15 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-base sm:text-lg shadow-xs border border-teal-600/25 dark:border-teal-400/20 shrink-0">
            PHB
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none truncate">
              PHB Tempo
            </h1>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
              <MapPin size={11} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">Parnaíba · Piauí</span>
            </div>
          </div>
        </div>

        {/* Status de Atualização e Controles */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {formattedTime && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {isCached ? 'Dados em cache' : 'Última atualização'}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                Hoje às {formattedTime}
              </span>
            </div>
          )}

          {/* Botão de Atualizar */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Atualizar dados agora"
            aria-label="Atualizar dados meteorológicos"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer active:scale-90 disabled:opacity-60"
          >
            <RotateCw
              size={17}
              className={`transition-transform duration-300 ${
                isRefreshing ? 'animate-spin text-teal-600 dark:text-teal-400' : ''
              }`}
            />
          </button>

          {/* Botão de Alternar Modo Claro/Escuro */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer active:scale-90"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400 animate-pulse" />
            ) : (
              <Moon size={17} className="text-slate-800" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
