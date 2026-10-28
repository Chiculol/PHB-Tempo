/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  isRetrying,
}) => {
  return (
    <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 backdrop-blur-md p-8 sm:p-10 text-center max-w-lg mx-auto shadow-sm my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} />
      </div>

      <h2 className="text-lg font-bold text-rose-950 dark:text-rose-100 mb-2">
        Não foi possível obter a previsão no momento
      </h2>

      <p className="text-sm text-rose-800/80 dark:text-rose-300/80 mb-6 leading-relaxed">
        {message ||
          'Verifique sua conexão com a internet ou aguarde alguns instantes para tentar novamente.'}
      </p>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium text-sm transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60"
      >
        <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
        <span>{isRetrying ? 'Tentando reconectar...' : 'Tentar novamente'}</span>
      </button>
    </div>
  );
};
