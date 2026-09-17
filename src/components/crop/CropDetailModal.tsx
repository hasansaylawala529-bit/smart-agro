import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CropRecommendationResult,
} from "@/services/cropRecommendationService";
import {
  Thermometer,
  CloudRain,
  Calendar,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

interface CropDetailModalProps {
  cropResult: CropRecommendationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  cropResult,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const lang = language as Language;

  if (!cropResult) return null;

  const { crop, overallScore, category, componentScores, explanations, warnings } = cropResult;

  const cropName = lang === "hi" ? crop.nameHi : lang === "mr" ? crop.nameMr : crop.name;
  const cropDesc = lang === "hi" ? crop.descriptionHi : lang === "mr" ? crop.descriptionMr : crop.description;
  const categoryLabel = lang === "hi" ? cropResult.categoryHi : lang === "mr" ? cropResult.categoryMr : category;

  const categoryColor =
    overallScore >= 80
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
      : overallScore >= 60
      ? "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400"
      : overallScore >= 40
      ? "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400"
      : "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-4 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 bg-primary/10 rounded-2xl border border-primary/20">
                {crop.emoji}
              </span>
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  {cropName}
                  <span className="text-xs text-muted-foreground font-normal italic">
                    ({crop.scientificName})
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {cropDesc}
                </DialogDescription>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex flex-col items-end">
                <span className="text-3xl font-black font-inter text-primary">
                  {overallScore}%
                </span>
                <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 mt-1 border ${categoryColor}`}>
                  {categoryLabel}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Why this crop? Explainability section (Spec section 16 & 20) */}
        <div className="space-y-4 pt-2">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              {lang === "hi" ? "यह फसल क्यों अनुशंसित है?" : lang === "mr" ? "या पिकाची शिफारस का?" : "Why This Crop?"}
            </h4>
            <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
              {explanations.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm">
                  {exp.isPositive ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className={exp.isPositive ? "text-foreground" : "text-amber-800 dark:text-amber-300 font-medium"}>
                    {exp.text[lang]}
                  </span>
                </div>
              ))}
              {warnings.map((warn, idx) => (
                <div key={`warn-${idx}`} className="flex items-start gap-2.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-rose-700 dark:text-rose-300">{warn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Component score bars (Spec section 14 & 37) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
              <Info className="h-4 w-4 text-primary" />
              {lang === "hi" ? "स्कोर विश्लेषण (घटक वार)" : lang === "mr" ? "स्कोअर विश्लेषण (घटक निहाय)" : "Suitability Score Breakdown"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: lang === "hi" ? "जलवायु" : lang === "mr" ? "हवामान" : "Climate", score: componentScores.climate, weight: "25%" },
                { label: lang === "hi" ? "वर्षा" : lang === "mr" ? "पाऊस" : "Rainfall", score: componentScores.rainfall, weight: "20%" },
                { label: lang === "hi" ? "तापमान" : lang === "mr" ? "तापमान" : "Temperature", score: componentScores.temperature, weight: "15%" },
                { label: lang === "hi" ? "मिट्टी" : lang === "mr" ? "माती" : "Soil", score: componentScores.soil, weight: "15%" },
                { label: lang === "hi" ? "मौसम" : lang === "mr" ? "हंगाम" : "Season", score: componentScores.season, weight: "10%" },
                { label: lang === "hi" ? "पानी" : lang === "mr" ? "पाणी" : "Water", score: componentScores.water, weight: "10%" },
              ].map((comp) => (
                <div key={comp.label} className="p-3 bg-muted/40 rounded-lg border border-border/40">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium text-foreground">{comp.label} <span className="text-[10px] text-muted-foreground">({comp.weight})</span></span>
                    <span className="font-inter font-bold text-primary">{comp.score}%</span>
                  </div>
                  <Progress value={comp.score} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Agronomic Requirements Grid */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
              <Droplets className="h-4 w-4 text-primary" />
              {lang === "hi" ? "कृषि संबंधी आवश्यकताएं" : lang === "mr" ? "कृषीविषयक आवश्यकता" : "Agronomic Requirements"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {lang === "hi" ? "बढ़ने का मौसम" : lang === "mr" ? "हंगाम" : "Season"}
                </p>
                <p className="font-semibold text-sm mt-1">{crop.seasons.join(", ")}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-destructive" />
                  {lang === "hi" ? "तापमान" : lang === "mr" ? "तापमान" : "Temperature"}
                </p>
                <p className="font-semibold text-sm mt-1">{crop.temperature.optimalMin}–{crop.temperature.optimalMax}°C</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-info" />
                  {lang === "hi" ? "वर्षा" : lang === "mr" ? "पाऊस" : "Rainfall"}
                </p>
                <p className="font-semibold text-sm mt-1">{crop.rainfall.optimalMin}–{crop.rainfall.optimalMax} mm</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-info" />
                  {lang === "hi" ? "पानी की आवश्यकता" : lang === "mr" ? "पाण्याची गरज" : "Water Req."}
                </p>
                <p className="font-semibold text-sm mt-1 capitalize">{crop.waterRequirement}</p>
              </div>
            </div>
          </div>

          {/* Cultivation Timeline */}
          {crop.timeline && crop.timeline.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                <Clock className="h-4 w-4 text-primary" />
                {lang === "hi" ? "फसल विकास समयरेखा" : lang === "mr" ? "पीक वाढ वेळापत्रक" : "Basic Cultivation Timeline"}
              </h4>
              <div className="space-y-2.5">
                {crop.timeline.map((stage, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 rounded-lg border-l-4 border-primary text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {lang === "hi" ? stage.stageHi : lang === "mr" ? stage.stageMr : stage.stage}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {stage.duration}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{stage.tips}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Farmer Considerations */}
          {crop.importantConsiderations && crop.importantConsiderations.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200">
              <h5 className="font-bold flex items-center gap-1.5 text-sm mb-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                {lang === "hi" ? "किसान भाइयों के लिए महत्वपूर्ण सलाह" : lang === "mr" ? "शेतकऱ्यांसाठी महत्त्वाच्या बाबी" : "Important Farmer Guidance"}
              </h5>
              <ul className="space-y-1.5 list-disc list-inside">
                {crop.importantConsiderations.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
