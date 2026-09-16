import {
  AlertCircle,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Gauge,
  LoaderCircle,
  type LucideIcon,
  MapPin,
  RefreshCcw,
  Search,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import type { WeatherIconKey } from '../types/weather';

export const weatherIcons: Record<WeatherIconKey, LucideIcon> = {
  alert: AlertCircle,
  cloud: Cloud,
  cloudFog: CloudFog,
  cloudLightning: CloudLightning,
  cloudRain: CloudRain,
  cloudSnow: CloudSnow,
  cloudSun: CloudSun,
  droplets: Droplets,
  gauge: Gauge,
  loader: LoaderCircle,
  mapPin: MapPin,
  refresh: RefreshCcw,
  search: Search,
  sun: Sun,
  thermometer: Thermometer,
  wind: Wind,
};

export function getWeatherIcon(icon: WeatherIconKey): LucideIcon {
  return weatherIcons[icon];
}
