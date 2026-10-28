/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Card Principal (Tempo Agora) */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-28" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-44" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-56" />
          </div>
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full sm:w-48" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Avisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-20 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl" />
        <div className="h-20 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl" />
      </div>

      {/* Skeleton Previsão Horária */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/60 dark:bg-slate-900/60 p-5 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-48" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 w-20 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Skeleton Previsão Semanal */}
      <div className="rounded-3xl border border-teal-800/10 dark:border-sky-300/10 bg-white/60 dark:bg-slate-900/60 p-5 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
