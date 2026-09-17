import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  MapPin,
  RefreshCw,
  Eye,
  Gauge,
  Sun,
} from "lucide-react";
import { WeatherData, formatWeatherDate } from "@/hooks/useWeather";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationAddress: string;
  onRefresh: () => void;
  onChangeLocation?: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  loading,
  error,
  locationAddress,
  onRefresh,
  onChangeLocation,
}) => {
  const { language, t } = useLanguage();
  const lang = language as Language;

  if (loading) {
    return (
      <Card className="bg-card/95 border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="bg-card/95 border-destructive/30">
        <CardContent className="py-8 text-center space-y-3">
          <Cloud className="h-12 w-12 text-muted-foreground/60 mx-auto" />
          <div>
            <h4 className="font-semibold text-base">
              {lang === "hi" ? "मौसम डेटा लोड करने में असमर्थ" : lang === "mr" ? "हवामान माहिती लोड करता आली नाही" : "Unable to retrieve live weather"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {error || "Check internet connection or select your district manually."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {t("dash.retry")}
            </Button>
            {onChangeLocation && (
              <Button size="sm" onClick={onChangeLocation}>
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {lang === "hi" ? "जिला बदलें" : lang === "mr" ? "जिल्हा बदला" : "Change District"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, daily } = weather;
  const rainChance = daily[0]?.precipitationProbability ?? 0;

  return (
    <Card className="bg-gradient-to-br from-card/98 via-card/95 to-primary/5 border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>{t("dash.weather")}</span>
              </CardTitle>
              <button
                onClick={onChangeLocation}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                title="Click to change farm location"
              >
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="font-medium text-foreground underline decoration-dotted underline-offset-2">
                  {locationAddress || `${weather.location.district}, Maharashtra`}
                </span>
              </button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
            title="Refresh weather"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main temperature and condition block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <span className="text-5xl shrink-0 select-none p-1">
              {current.icon}
            </span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black font-inter tracking-tight text-foreground">
                  {current.temperature}°C
                </span>
                <span className="text-xs text-muted-foreground">
                  ({lang === "hi" ? "महसूस" : lang === "mr" ? "भासणारे" : "Feels like"} {current.feelsLike}°C)
                </span>
              </div>
              <p className="text-sm font-semibold text-primary capitalize mt-0.5">
                {current.weatherDescription}
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-muted/80">
            {formatWeatherDate(new Date().toISOString(), lang)}
          </Badge>
        </div>

        {/* Essential farmer metrics in high-readability cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span>{t("dash.humidity")}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-inter text-foreground">
              {current.humidity}%
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CloudRain className="h-3.5 w-3.5 text-info" />
              <span>{t("dash.rain")}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-inter text-foreground">
              {rainChance}%
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Wind className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t("dash.wind")}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-inter text-foreground">
              {current.windSpeed} <span className="text-xs font-normal text-muted-foreground">{t("common.kmph")}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
