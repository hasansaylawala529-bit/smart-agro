import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyForecast } from "@/services/weatherService";
import { formatWeatherDate } from "@/hooks/useWeather";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Calendar, Droplets } from "lucide-react";

interface Forecast7DayProps {
  daily: DailyForecast[];
  loading?: boolean;
}

export const Forecast7Day: React.FC<Forecast7DayProps> = ({ daily, loading = false }) => {
  const { language, t } = useLanguage();
  const lang = language as Language;

  if (loading || !daily || daily.length === 0) {
    return (
      <Card className="bg-card/95 border-border/50">
        <CardContent className="p-4">
          <div className="h-28 bg-muted/20 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 sm:px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{t("dash.forecast_7day")}</span>
        </CardTitle>
        <span className="text-[11px] text-muted-foreground font-medium">
          {lang === "hi" ? "दैनिक अधिकतम / न्यूनतम तापमान" : lang === "mr" ? "दैनिक कमाल / किमान तापमान" : "Daily Max / Min Temperature"}
        </span>
      </CardHeader>

      <CardContent className="p-3 sm:p-5 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {daily.map((day, idx) => {
            const isToday = idx === 0;
            const formattedDay = isToday
              ? t("dash.today")
              : formatWeatherDate(day.date, lang).split(",")[0];

            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-xl text-center transition-all duration-200 border ${
                  isToday
                    ? "bg-primary/10 border-primary/30 shadow-xs"
                    : "bg-muted/20 border-border/40 hover:bg-muted/40"
                }`}
              >
                <p className="text-[11px] font-semibold text-muted-foreground truncate">
                  {formattedDay}
                </p>

                <div className="text-2xl my-1.5 select-none">{day.icon}</div>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm font-bold font-inter text-foreground">
                    {day.maxTemp}°
                  </span>
                  <span className="text-[11px] text-muted-foreground font-inter">
                    {day.minTemp}°
                  </span>
                </div>

                {/* Rain probability */}
                <div className="mt-1 flex items-center justify-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  <Droplets className="h-3 w-3" />
                  <span>{day.precipitationProbability}%</span>
                </div>

                {day.precipitationSum > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {day.precipitationSum.toFixed(1)}mm
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
