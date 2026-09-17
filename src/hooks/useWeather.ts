import { useQuery } from "@tanstack/react-query";
import {
  fetchOpenMeteoWeather,
  WeatherReport,
  getWeatherConditionInfo,
  CurrentWeather,
  DailyForecast,
  AgriculturalInsights,
} from "@/services/weatherService";

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  insights: AgriculturalInsights;
  location: {
    name: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
}

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  district?: string;
  skipGeolocation?: boolean;
}

export function useWeather(options?: UseWeatherOptions) {
  const lat = options?.latitude ?? 18.5204; // default Pune
  const lon = options?.longitude ?? 73.8567;
  const district = options?.district ?? "Pune";

  const query = useQuery({
    queryKey: ["weather", Number(lat.toFixed(3)), Number(lon.toFixed(3))],
    queryFn: async () => {
      const report = await fetchOpenMeteoWeather(lat, lon);
      const weatherData: WeatherData = {
        current: report.current,
        daily: report.daily,
        insights: report.insights,
        location: {
          name: district,
          district: district,
          state: "Maharashtra",
          latitude: lat,
          longitude: lon,
        },
        lastUpdated: new Date(report.lastUpdated),
      };
      return weatherData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
    retry: 2,
  });

  return {
    weather: query.data || null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error instanceof Error ? query.error.message : "Failed to load weather") : null,
    refetch: query.refetch,
    locationPermission: "granted" as const,
  };
}

// Helpers
export function getWeatherDescription(code: number, lang: "en" | "hi" | "mr" = "en"): string {
  const info = getWeatherConditionInfo(code);
  return info[lang] || info.en;
}

export function getWeatherIcon(code: number): string {
  return getWeatherConditionInfo(code).icon;
}

export function formatWeatherDate(dateString: string, lang: "en" | "hi" | "mr" = "en"): string {
  const date = new Date(dateString);
  const locale = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
  return date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
