import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgriculturalInsights } from "@/services/weatherService";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import {
  Lightbulb,
  Droplets,
  AlertTriangle,
  Info,
  ShieldAlert,
  Sprout,
} from "lucide-react";

interface AgriculturalInsightsCardProps {
  insights: AgriculturalInsights | undefined;
  loading?: boolean;
}

export const AgriculturalInsightsCard: React.FC<AgriculturalInsightsCardProps> = ({
  insights,
  loading = false,
}) => {
  const { language } = useLanguage();
  const lang = language as Language;

  if (loading || !insights) {
    return (
      <Card className="bg-card/95 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500 animate-pulse" />
            <span>{lang === "hi" ? "कृषि मौसम सलाह" : lang === "mr" ? "हवामान आधारित शेती सल्ला" : "Agricultural Weather Insights"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted/30 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const { advisories, summary, irrigationAction } = insights;

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-amber-600" />
            </div>
            <span>
              {lang === "hi"
                ? "कृषि मौसम सलाह"
                : lang === "mr"
                ? "हवामान आधारित शेती सल्ला"
                : "Agricultural Weather Insights"}
            </span>
          </CardTitle>

          {irrigationAction === "delay" && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300 text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              {lang === "hi" ? "सिंचाई टालें" : lang === "mr" ? "सिंचन पुढे ढकला" : "Delay Irrigation"}
            </Badge>
          )}

          {irrigationAction === "plan" && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300 text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              {lang === "hi" ? "सिंचाई नियोजित करें" : lang === "mr" ? "सिंचनाचे नियोजन करा" : "Plan Irrigation"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {/* Main Summary highlight banner */}
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
          <Sprout className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">
            {summary[lang]}
          </p>
        </div>

        {/* Actionable Advisories List */}
        <div className="space-y-2">
          {advisories.map((advisory) => {
            const title = lang === "hi" ? advisory.titleHi : lang === "mr" ? advisory.titleMr : advisory.title;
            const message = lang === "hi" ? advisory.messageHi : lang === "mr" ? advisory.messageMr : advisory.message;

            const borderClass =
              advisory.type === "danger"
                ? "border-destructive bg-destructive/5"
                : advisory.type === "warning"
                ? "border-amber-500 bg-amber-500/5"
                : advisory.type === "success"
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-blue-500 bg-blue-500/5";

            return (
              <div
                key={advisory.id}
                className={`p-3 rounded-xl border-l-4 transition-colors ${borderClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0 mt-0.5">{advisory.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground/80 italic text-right pt-1">
          * {lang === "hi" ? "ये परामर्श कृषि मौसम विज्ञान पर आधारित हैं।" : lang === "mr" ? "हे सल्ले कृषी-हवामानावर आधारित आहेत." : "These are advisory signals based on weather patterns."}
        </p>
      </CardContent>
    </Card>
  );
};
