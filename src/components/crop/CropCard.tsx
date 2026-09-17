import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CropRecommendationResult } from "@/services/cropRecommendationService";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";

interface CropCardProps {
  rank: number;
  cropResult: CropRecommendationResult;
  onSelect: (crop: CropRecommendationResult) => void;
}

export const CropCard: React.FC<CropCardProps> = ({ rank, cropResult, onSelect }) => {
  const { language } = useLanguage();
  const lang = language as Language;
  const { crop, overallScore, category, explanations, warnings } = cropResult;

  const cropName = lang === "hi" ? crop.nameHi : lang === "mr" ? crop.nameMr : crop.name;
  const categoryLabel = lang === "hi" ? cropResult.categoryHi : lang === "mr" ? cropResult.categoryMr : category;

  const medals = ["🥇", "🥈", "🥉"];
  const rankDisplay = rank <= 3 ? medals[rank - 1] : `#${rank}`;

  const categoryColor =
    overallScore >= 80
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400"
      : overallScore >= 60
      ? "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400"
      : overallScore >= 40
      ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400"
      : "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400";

  const topExplanation = explanations[0]?.text[lang] || warnings[0];

  return (
    <Card
      onClick={() => onSelect(cropResult)}
      className="cursor-pointer group hover:shadow-md hover:border-primary/40 transition-all duration-200 bg-card/95 border-border/60"
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl font-bold font-inter shrink-0">{rankDisplay}</span>
            <span className="text-3xl p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              {crop.emoji}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-poppins font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                  {cropName}
                </h4>
                <Badge variant="outline" className={`text-[11px] font-medium py-0 px-2 border ${categoryColor}`}>
                  {categoryLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {crop.seasons.join(", ")} • {crop.growingPeriodDays} • {crop.expectedYield}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-black font-inter text-primary">
                {overallScore}%
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">
                {lang === "hi" ? "उपयुक्तता" : lang === "mr" ? "योग्यता" : "Suitability"}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Quick explainability snippet */}
        {topExplanation && (
          <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground">
            {explanations[0]?.isPositive ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            )}
            <span className="truncate">{topExplanation}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
