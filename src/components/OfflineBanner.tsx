/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing,
}) => {
  const formattedDateTime = React.useMemo(() => {
    try {
      const d = new Date(lastUpdated);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'anteriormente';
    }
  }, [lastUpdated]);

  return (
    <div className="w-full bg-amber-100/90 dark:bg-amber-950/70 border-b border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <WifiOff size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Modo offline:</strong> exibindo dados salvos em <strong>{formattedDateTime}</strong> (podem estar desatualizados).
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-200/90 hover:bg-amber-300 text-amber-950 dark:bg-amber-900/50 dark:hover:bg-amber-900/80 dark:text-amber-100 font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Tentar reconectar</span>
        </button>
      </div>
    </div>
  );
};
