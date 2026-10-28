/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudLightning,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
  animated?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  className = 'w-6 h-6',
  size = 24,
  animated = false,
}) => {
  const animClass = animated ? 'weather-icon-animated' : '';
  const combinedClass = `${animClass} ${className}`.trim();

  switch (name) {
    case 'Sun':
      return <Sun size={size} className={`${combinedClass} text-amber-500`} />;
    case 'SunMedium':
      return <SunMedium size={size} className={`${combinedClass} text-amber-500`} />;
    case 'Moon':
      return <Moon size={size} className={`${combinedClass} text-teal-300 dark:text-teal-200`} />;
    case 'MoonStar':
      return <MoonStar size={size} className={`${combinedClass} text-teal-300 dark:text-teal-200`} />;
    case 'CloudSun':
      return <CloudSun size={size} className={`${combinedClass} text-teal-600 dark:text-teal-400`} />;
    case 'CloudMoon':
      return <CloudMoon size={size} className={`${combinedClass} text-teal-500 dark:text-teal-300`} />;
    case 'Cloud':
      return <Cloud size={size} className={`${combinedClass} text-slate-500 dark:text-slate-400`} />;
    case 'CloudFog':
      return <CloudFog size={size} className={`${combinedClass} text-slate-400 dark:text-slate-500`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={`${combinedClass} text-cyan-600 dark:text-cyan-400`} />;
    case 'CloudSunRain':
      return <CloudRain size={size} className={`${combinedClass} text-cyan-600 dark:text-cyan-400`} />;
    case 'CloudMoonRain':
      return <CloudRain size={size} className={`${combinedClass} text-cyan-500 dark:text-cyan-400`} />;
    case 'CloudRain':
      return <CloudRain size={size} className={`${combinedClass} text-sky-600 dark:text-sky-400`} />;
    case 'CloudRainWind':
      return <CloudRainWind size={size} className={`${combinedClass} text-sky-700 dark:text-sky-400`} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={`${combinedClass} text-amber-500 dark:text-amber-400`} />;
    default:
      return <Sun size={size} className={`${combinedClass} text-amber-500`} />;
  }
};
