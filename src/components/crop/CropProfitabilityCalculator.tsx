import React, { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Scale,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  HelpCircle,
  Split,
} from "lucide-react";
import {
  cropEconomicsDataset,
  getCropEconomics,
  calculateCropFinancials,
  calculatePriceSensitivity,
  InputCostBreakdown,
  CropEconomicProfile,
} from "@/data/cropEconomics";

interface CropProfitabilityCalculatorProps {
  initialCropId?: string;
  defaultFarmSize?: number;
}

export const CropProfitabilityCalculator: React.FC<CropProfitabilityCalculatorProps> = ({
  initialCropId = "soybean",
  defaultFarmSize = 2.5,
}) => {
  const { language, t } = useLanguage();
  const lang = language as Language;

  // Farm Size state
  const [farmAcres, setFarmAcres] = useState<number>(defaultFarmSize);

  // Selected Primary Crop
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId);
  const primaryCrop = useMemo(() => getCropEconomics(selectedCropId), [selectedCropId]);

  // Season filter for dropdown
  const [seasonFilter, setSeasonFilter] = useState<string>("all");

  // Custom adjustable yield and selling price (initialized from selected crop)
  const [customYield, setCustomYield] = useState<number>(primaryCrop.benchmarkYield);
  const [customPrice, setCustomPrice] = useState<number>(primaryCrop.benchmarkPrice);

  // Custom adjustable costs per acre
  const [customCosts, setCustomCosts] = useState<InputCostBreakdown>({ ...primaryCrop.defaultCosts });

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareCropId, setCompareCropId] = useState<string>(selectedCropId === "cotton" ? "soybean" : "cotton");

  // Reset custom parameters when primary crop changes
  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    const newCrop = getCropEconomics(cropId);
    setCustomYield(newCrop.benchmarkYield);
    setCustomPrice(newCrop.benchmarkPrice);
    setCustomCosts({ ...newCrop.defaultCosts });
  };

  // Reset to ICAR benchmark defaults
  const handleResetDefaults = () => {
    setCustomYield(primaryCrop.benchmarkYield);
    setCustomPrice(primaryCrop.benchmarkPrice);
    setCustomCosts({ ...primaryCrop.defaultCosts });
  };

  // Primary Financials computation
  const financials = useMemo(() => {
    return calculateCropFinancials({
      cropId: selectedCropId,
      farmAcres,
      customYield,
      customPrice,
      customCosts,
    });
  }, [selectedCropId, farmAcres, customYield, customPrice, customCosts]);

  // Comparison Crop Financials
  const compareFinancials = useMemo(() => {
    if (!isCompareMode) return null;
    return calculateCropFinancials({
      cropId: compareCropId,
      farmAcres,
    });
  }, [isCompareMode, compareCropId, farmAcres]);

  // Sensitivity Analysis
  const sensitivity = useMemo(() => {
    return calculatePriceSensitivity(financials);
  }, [financials]);

  // Helper for crop localized name
  const getCropName = (crop: CropEconomicProfile) => {
    if (lang === "hi") return crop.nameHi;
    if (lang === "mr") return crop.nameMr;
    return crop.name;
  };

  // Format currency in Indian numbering format
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter crops by season
  const filteredCrops = useMemo(() => {
    if (seasonFilter === "all") return cropEconomicsDataset;
    return cropEconomicsDataset.filter((c) => c.season.toLowerCase() === seasonFilter.toLowerCase());
  }, [seasonFilter]);

  // Total cost percentage shares for the breakdown bar
  const costShares = useMemo(() => {
    const total = financials.totalCostPerAcre || 1;
    return {
      seeds: Math.round((customCosts.seeds / total) * 100),
      fertilizer: Math.round((customCosts.fertilizer / total) * 100),
      protection: Math.round((customCosts.protection / total) * 100),
      irrigation: Math.round((customCosts.irrigation / total) * 100),
      labor: Math.round((customCosts.laborAndMachinery / total) * 100),
    };
  }, [customCosts, financials.totalCostPerAcre]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <Card className="border-border/60 bg-card/95 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold font-poppins flex items-center gap-2 text-foreground">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("crop.roi_calculator_title")}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("crop.roi_calculator_desc")}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Button
                variant={isCompareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Split className="h-3.5 w-3.5" />
                <span>
                  {isCompareMode
                    ? lang === "hi"
                      ? "तुलना बंद करें"
                      : lang === "mr"
                      ? "तुलना बंद करा"
                      : "Single Crop View"
                    : lang === "hi"
                    ? "दो फसलों की तुलना"
                    : lang === "mr"
                    ? "दोन पिकांची तुलना"
                    : "Compare 2 Crops"}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDefaults}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Reset to ICAR/MPKV benchmarks"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {lang === "hi" ? "डिफ़ॉल्ट रीसेट" : lang === "mr" ? "डीफॉल्ट रीसेट" : "Reset Defaults"}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Farm Setup: Acres & Crop Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            {/* Farm Acreage Slider & Field */}
            <div className="md:col-span-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === "hi" ? "खेत का आकार (एकड़)" : lang === "mr" ? "शेताचा आकार (एकर)" : "Farm Size (Acres)"}
                </Label>
                <span className="text-sm font-bold text-primary font-mono">{farmAcres} Acres</span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  min={0.5}
                  max={25}
                  step={0.5}
                  value={[farmAcres]}
                  onValueChange={(val) => setFarmAcres(val[0])}
                  className="flex-1 py-1"
                />
                <Input
                  type="number"
                  min={0.2}
                  max={500}
                  step={0.5}
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-20 h-9 text-xs font-semibold text-center"
                />
              </div>
              <div className="flex gap-1.5 pt-1">
                {[1, 2.5, 5, 10].map((quickAcre) => (
                  <button
                    key={quickAcre}
                    type="button"
                    onClick={() => setFarmAcres(quickAcre)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      farmAcres === quickAcre
                        ? "bg-primary text-primary-foreground font-semibold border-primary"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                    }`}
                  >
                    {quickAcre} ac
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Crop Selection */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === "hi" ? "फसल चुनें" : lang === "mr" ? "पीक निवडा" : "Select Crop"}
                </Label>
                <div className="flex gap-1">
                  {["all", "kharif", "rabi"].map((season) => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => setSeasonFilter(season)}
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                        seasonFilter === season
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              <Select value={selectedCropId} onValueChange={handleCropChange}>
                <SelectTrigger className="h-10 text-sm font-medium">
                  <SelectValue placeholder="Select Crop" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {filteredCrops.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="text-base">{c.emoji}</span>
                        <span className="font-medium">{getCropName(c)}</span>
                        <span className="text-xs text-muted-foreground">({c.season})</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono ml-auto">
                          ₹{c.benchmarkPrice}/{c.unit}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Crop Quick Specs Badge */}
            <div className="md:col-span-3 flex flex-col justify-end">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ICAR Benchmark:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {primaryCrop.benchmarkYield} {primaryCrop.unit}/acre
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base {primaryCrop.priceType}:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{primaryCrop.benchmarkPrice}/{primaryCrop.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* If compare mode is active: 2nd Crop Selector */}
          {isCompareMode && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <Scale className="h-4 w-4" />
                  <span>
                    {lang === "hi"
                      ? "तुलना के लिए दूसरी फसल चुनें:"
                      : lang === "mr"
                      ? "तुलनेसाठी दुसरे पीक निवडा:"
                      : "Select Secondary Crop for Comparison:"}
                  </span>
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {farmAcres} Acres Benchmark
                </Badge>
              </div>
              <Select value={compareCropId} onValueChange={setCompareCropId}>
                <SelectTrigger className="h-9 text-sm bg-background">
                  <SelectValue placeholder="Select Comparison Crop" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {cropEconomicsDataset
                    .filter((c) => c.id !== selectedCropId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span>{c.emoji}</span>
                          <span>{getCropName(c)}</span>
                          <span className="text-xs text-muted-foreground">({c.season})</span>
                          <span className="text-xs text-emerald-600 font-mono ml-auto">
                            ₹{c.benchmarkPrice}/{c.unit}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CORE FINANCIAL KPI CARDS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Revenue */}
        <Card className="border-border/60 bg-card/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("crop.gross_revenue")}
              </span>
              <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-poppins text-foreground">
              {formatINR(financials.grossRevenue)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
              <span>{lang === "hi" ? "कुल उपज:" : lang === "mr" ? "एकूण उत्पादन:" : "Total Yield:"}</span>
              <span className="font-mono font-bold text-foreground">
                {financials.totalYield} {primaryCrop.unit}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Cultivation Cost */}
        <Card className="border-border/60 bg-card/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("crop.total_cost")}
              </span>
              <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <PieChart className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-poppins text-foreground">
              {formatINR(financials.totalOperatingCost)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
              <span>{lang === "hi" ? "लागत प्रति एकड़:" : lang === "mr" ? "खर्च प्रति एकर:" : "Cost / Acre:"}</span>
              <span className="font-mono font-bold text-foreground">
                {formatINR(financials.totalCostPerAcre)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Net Profit (or Loss) */}
        <Card
          className={`border shadow-sm relative overflow-hidden transition-colors ${
            financials.isProfitable
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              financials.isProfitable ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {financials.isProfitable ? t("crop.net_profit") : t("crop.net_loss")}
              </span>
              <span
                className={`p-1.5 rounded-md ${
                  financials.isProfitable
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {financials.isProfitable ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </span>
            </div>
            <div
              className={`text-2xl font-bold font-poppins ${
                financials.isProfitable
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-destructive"
              }`}
            >
              {formatINR(financials.netProfit)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
              <span>{t("crop.profit_per_acre")}:</span>
              <span
                className={`font-mono font-bold ${
                  financials.isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {formatINR(financials.profitPerAcre)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: ROI % & Benefit-Cost Ratio */}
        <Card className="border-border/60 bg-card/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("crop.roi_percent")}
              </span>
              <span className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-poppins text-primary">
              {financials.roiPercentage > 0 ? `+${financials.roiPercentage}%` : `${financials.roiPercentage}%`}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
              <span>{t("crop.benefit_cost_ratio")}:</span>
              <Badge variant="outline" className="font-mono font-bold text-xs py-0 h-5">
                {financials.benefitCostRatio}:1 BCR
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side-by-side Comparison View when activated */}
      {isCompareMode && compareFinancials && (
        <Card className="border-primary/40 bg-gradient-to-b from-primary/5 via-card/95 to-card shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span>
                {lang === "hi"
                  ? `तुलनात्मक विश्लेषण: ${getCropName(primaryCrop)} बनाम ${getCropName(compareFinancials.crop)}`
                  : lang === "mr"
                  ? `तुलनात्मक विश्लेषण: ${getCropName(primaryCrop)} विरुद्ध ${getCropName(compareFinancials.crop)}`
                  : `Side-by-Side Comparison: ${getCropName(primaryCrop)} vs ${getCropName(compareFinancials.crop)}`}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {lang === "hi"
                ? `${farmAcres} एकड़ खेत के आधार पर दोनों फसलों के निवेश, शुद्ध लाभ और ROI की सीधी तुलना`
                : lang === "mr"
                ? `${farmAcres} एकर शेताच्या आधारावर दोन्ही पिकांचे खर्च, निव्वळ नफा आणि ROI ची तुलना`
                : `Direct capital requirement, profit margin, and return-on-investment comparison for ${farmAcres} acres.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Crop Card */}
              <div className="p-4 rounded-xl border-2 border-primary bg-card/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{primaryCrop.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{getCropName(primaryCrop)}</h4>
                      <p className="text-[11px] text-muted-foreground">{primaryCrop.season} • Primary Choice</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs">Selected</Badge>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Required:</span>
                    <span className="font-semibold font-mono">{formatINR(financials.totalOperatingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Net Profit:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatINR(financials.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit / Acre:</span>
                    <span className="font-bold font-mono">{formatINR(financials.profitPerAcre)}/ac</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI Return:</span>
                    <span className="font-bold text-primary font-mono">+{financials.roiPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Benefit-Cost Ratio:</span>
                    <span className="font-mono">{financials.benefitCostRatio}:1</span>
                  </div>
                </div>
              </div>

              {/* Comparison Crop Card */}
              <div className="p-4 rounded-xl border border-border/80 bg-card/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{compareFinancials.crop.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {getCropName(compareFinancials.crop)}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {compareFinancials.crop.season} • Alternative
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Alternative</Badge>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Required:</span>
                    <span className="font-semibold font-mono">
                      {formatINR(compareFinancials.totalOperatingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Net Profit:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatINR(compareFinancials.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit / Acre:</span>
                    <span className="font-bold font-mono">{formatINR(compareFinancials.profitPerAcre)}/ac</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI Return:</span>
                    <span className="font-bold text-primary font-mono">
                      +{compareFinancials.roiPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Benefit-Cost Ratio:</span>
                    <span className="font-mono">{compareFinancials.benefitCostRatio}:1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Advisory banner */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  {lang === "hi" ? "तुलना निष्कर्ष: " : lang === "mr" ? "तुलना निष्कर्ष: " : "Economic Insight: "}
                </span>
                <span className="text-emerald-800 dark:text-emerald-300">
                  {financials.roiPercentage >= compareFinancials.roiPercentage
                    ? lang === "hi"
                      ? `${getCropName(primaryCrop)} प्रति रुपये निवेश पर ${(
                          financials.roiPercentage - compareFinancials.roiPercentage
                        ).toFixed(1)}% अधिक रिटर्न प्रदान करता है।`
                      : lang === "mr"
                      ? `${getCropName(primaryCrop)} प्रति रुपया गुंतवणुकीवर ${(
                          financials.roiPercentage - compareFinancials.roiPercentage
                        ).toFixed(1)}% जास्त नफा मिळवून देतो.`
                      : `${getCropName(primaryCrop)} yields ${(
                          financials.roiPercentage - compareFinancials.roiPercentage
                        ).toFixed(1)}% higher return per rupee invested than ${getCropName(
                          compareFinancials.crop
                        )}.`
                    : lang === "hi"
                    ? `${getCropName(compareFinancials.crop)} में ${(
                        compareFinancials.roiPercentage - financials.roiPercentage
                      ).toFixed(1)}% अधिक ROI है, हालांकि प्रारंभिक पूंजी की आवश्यकता भिन्न हो सकती है।`
                    : lang === "mr"
                    ? `${getCropName(compareFinancials.crop)} मध्ये ${(
                        compareFinancials.roiPercentage - financials.roiPercentage
                      ).toFixed(1)}% जास्त ROI आहे, भांडवलाची तुलना करून निर्णय घ्या.`
                    : `${getCropName(compareFinancials.crop)} generates ${(
                        compareFinancials.roiPercentage - financials.roiPercentage
                      ).toFixed(1)}% higher ROI on deployed capital.`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DETAILED COST BREAKDOWN & ADJUSTMENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cost Category Sliders */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    <span>
                      {lang === "hi"
                        ? "लागत विवरण व संपादन (प्रति एकड़)"
                        : lang === "mr"
                        ? "खर्च तपशील व संपादन (प्रति एकर)"
                        : "Operational Cost Breakdown (Per Acre)"}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {lang === "hi"
                      ? "अपने वास्तविक खर्चों के अनुसार इनपुट लागतों को समायोजित करें"
                      : lang === "mr"
                      ? "आपल्या प्रत्यक्ष शेती खर्चानुसार मूल्ये बदलू शकता"
                      : "Adjust input parameters to reflect your exact local market expenses"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  {formatINR(financials.totalCostPerAcre)} / ac
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Cost Item 1: Seeds */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>🌱</span> {t("crop.seeds_cost")}
                  </span>
                  <span className="font-mono font-bold text-foreground">₹{customCosts.seeds}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={30000}
                    step={100}
                    value={[customCosts.seeds]}
                    onValueChange={(val) =>
                      setCustomCosts((prev) => ({ ...prev, seeds: val[0] }))
                    }
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    value={customCosts.seeds}
                    onChange={(e) =>
                      setCustomCosts((prev) => ({
                        ...prev,
                        seeds: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-24 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Cost Item 2: Fertilizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>🧪</span> {t("crop.fertilizer_cost")} (DAP, Urea, MOP)
                  </span>
                  <span className="font-mono font-bold text-foreground">₹{customCosts.fertilizer}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={25000}
                    step={100}
                    value={[customCosts.fertilizer]}
                    onValueChange={(val) =>
                      setCustomCosts((prev) => ({ ...prev, fertilizer: val[0] }))
                    }
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    value={customCosts.fertilizer}
                    onChange={(e) =>
                      setCustomCosts((prev) => ({
                        ...prev,
                        fertilizer: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-24 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Cost Item 3: Plant Protection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>🛡️</span> {t("crop.protection_cost")}
                  </span>
                  <span className="font-mono font-bold text-foreground">₹{customCosts.protection}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={18000}
                    step={100}
                    value={[customCosts.protection]}
                    onValueChange={(val) =>
                      setCustomCosts((prev) => ({ ...prev, protection: val[0] }))
                    }
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    value={customCosts.protection}
                    onChange={(e) =>
                      setCustomCosts((prev) => ({
                        ...prev,
                        protection: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-24 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Cost Item 4: Irrigation & Fuel */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>💧</span> {t("crop.irrigation_cost")}
                  </span>
                  <span className="font-mono font-bold text-foreground">₹{customCosts.irrigation}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={20000}
                    step={100}
                    value={[customCosts.irrigation]}
                    onValueChange={(val) =>
                      setCustomCosts((prev) => ({ ...prev, irrigation: val[0] }))
                    }
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    value={customCosts.irrigation}
                    onChange={(e) =>
                      setCustomCosts((prev) => ({
                        ...prev,
                        irrigation: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-24 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Cost Item 5: Labor & Machinery */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>🚜</span> {t("crop.labor_cost")}
                  </span>
                  <span className="font-mono font-bold text-foreground">₹{customCosts.laborAndMachinery}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={35000}
                    step={200}
                    value={[customCosts.laborAndMachinery]}
                    onValueChange={(val) =>
                      setCustomCosts((prev) => ({ ...prev, laborAndMachinery: val[0] }))
                    }
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    value={customCosts.laborAndMachinery}
                    onChange={(e) =>
                      setCustomCosts((prev) => ({
                        ...prev,
                        laborAndMachinery: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-24 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Visual Cost Proportion Distribution Bar */}
              <div className="pt-3 border-t border-border/40 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Expenditure Share (%)</span>
                  <span>100% of Farm Costs</span>
                </div>
                <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-muted">
                  <div
                    style={{ width: `${costShares.seeds}%` }}
                    className="bg-emerald-500 hover:opacity-90 transition-all"
                    title={`Seeds: ${costShares.seeds}%`}
                  />
                  <div
                    style={{ width: `${costShares.fertilizer}%` }}
                    className="bg-blue-500 hover:opacity-90 transition-all"
                    title={`Fertilizer: ${costShares.fertilizer}%`}
                  />
                  <div
                    style={{ width: `${costShares.protection}%` }}
                    className="bg-amber-500 hover:opacity-90 transition-all"
                    title={`Protection: ${costShares.protection}%`}
                  />
                  <div
                    style={{ width: `${costShares.irrigation}%` }}
                    className="bg-cyan-500 hover:opacity-90 transition-all"
                    title={`Irrigation: ${costShares.irrigation}%`}
                  />
                  <div
                    style={{ width: `${costShares.labor}%` }}
                    className="bg-purple-500 hover:opacity-90 transition-all"
                    title={`Labor: ${costShares.labor}%`}
                  />
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Seeds ({costShares.seeds}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Fertilizer ({costShares.fertilizer}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Protection ({costShares.protection}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    Water ({costShares.irrigation}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Labor/Machines ({costShares.labor}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Yield, Selling Price & Breakeven Analytics */}
        <div className="lg:col-span-5 space-y-4">
          {/* Revenue Inputs: Yield & Selling Price */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>
                  {lang === "hi" ? "उपज व विक्रय मूल्य" : lang === "mr" ? "उत्पादन व विक्री दर" : "Yield & Selling Price"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Expected Yield */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    {lang === "hi" ? "अपेक्षित उपज (प्रति एकड़)" : lang === "mr" ? "अपेक्षित उत्पादन (प्रति एकर)" : "Expected Yield (Per Acre)"}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {customYield} {primaryCrop.unit}/ac
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={Math.max(1, primaryCrop.minYield - 3)}
                    max={primaryCrop.maxYield + 10}
                    step={0.5}
                    value={[customYield]}
                    onValueChange={(val) => setCustomYield(val[0])}
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    step="0.5"
                    value={customYield}
                    onChange={(e) => setCustomYield(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-20 h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    {lang === "hi"
                      ? `विक्रय मूल्य (₹/${primaryCrop.unit})`
                      : lang === "mr"
                      ? `विक्री भाव (₹/${primaryCrop.unit})`
                      : `Market Price (₹/${primaryCrop.unit})`}
                  </span>
                  <Badge variant="outline" className="text-[11px] font-mono text-emerald-600">
                    Base {primaryCrop.priceType}: ₹{primaryCrop.benchmarkPrice}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={Math.round(primaryCrop.benchmarkPrice * 0.4)}
                    max={Math.round(primaryCrop.benchmarkPrice * 1.8)}
                    step={50}
                    value={[customPrice]}
                    onValueChange={(val) => setCustomPrice(val[0])}
                    className="flex-1 py-1"
                  />
                  <Input
                    type="number"
                    step="10"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 h-8 text-xs font-mono text-right font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakeven Safety & Risk Analysis */}
          <Card className="border-border/60 bg-muted/20 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>
                  {lang === "hi"
                    ? "लागत वसूली (ब्रेक-ईवन) सुरक्षा विश्लेषण"
                    : lang === "mr"
                    ? "खर्च भरपाई (ब्रेक-इव्हन) सुरक्षा विश्लेषण"
                    : "Breakeven & Safety Thresholds"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">{t("crop.breakeven_price")}:</span>
                <div className="text-right">
                  <span className="font-bold font-mono text-foreground">
                    ₹{financials.breakevenPricePerUnit} / {primaryCrop.unit}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {customPrice > financials.breakevenPricePerUnit ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        +₹{customPrice - financials.breakevenPricePerUnit} safety cushion
                      </span>
                    ) : (
                      <span className="text-destructive font-semibold">Selling below cost</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">{t("crop.breakeven_yield")}:</span>
                <div className="text-right">
                  <span className="font-bold font-mono text-foreground">
                    {financials.breakevenYieldPerAcre} {primaryCrop.unit} / ac
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Min yield to avoid loss
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Commodity Volatility:</span>
                <Badge
                  variant={
                    primaryCrop.marketVolatilityRisk === "High"
                      ? "destructive"
                      : primaryCrop.marketVolatilityRisk === "Moderate"
                      ? "outline"
                      : "secondary"
                  }
                  className="text-[10px] font-semibold"
                >
                  {primaryCrop.marketVolatilityRisk} Volatility
                </Badge>
              </div>

              {/* Companion Intercrop note if available */}
              {primaryCrop.intercropOptions && primaryCrop.intercropOptions.length > 0 && (
                <div className="mt-2 p-2.5 rounded-md bg-primary/5 border border-primary/20 space-y-1">
                  <p className="font-semibold text-primary text-[11px] flex items-center gap-1">
                    <span>💡</span> Intercropping Synergy:
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {primaryCrop.intercropOptions[0].synergyNotes[lang] ||
                      primaryCrop.intercropOptions[0].synergyNotes.en}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PRICE SENSITIVITY TABLE ("WHAT-IF" SIMULATOR) */}
      <Card className="border-border/60 bg-card/95 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>{t("crop.price_sensitivity")} ("What-If" Analysis)</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "बाजार भाव में उतार-चढ़ाव होने पर शुद्ध लाभ और ROI पर प्रभाव"
                : lang === "mr"
                ? "बाजार भावात चढ-उतार झाल्यास निव्वळ नफा आणि ROI वर होणारा परिणाम"
                : "Simulation of farm profits across market volatility price fluctuations"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Market Scenario</th>
                <th className="py-3 px-4">Price / {primaryCrop.unit}</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Total Expenses</th>
                <th className="py-3 px-4">Net Profit</th>
                <th className="py-3 px-4">Expected ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {sensitivity.map((step) => {
                const isCurrent = step.scenario === "baseline";
                return (
                  <tr
                    key={step.scenario}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-primary/10 font-semibold"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-medium flex items-center gap-1.5">
                      {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <span>{step.label}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      ₹{step.pricePerUnit}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {formatINR(step.grossRevenue)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatINR(financials.totalOperatingCost)}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        step.isProfitable
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                    >
                      {formatINR(step.netProfit)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={step.isProfitable ? "secondary" : "destructive"}
                        className="text-[10px] py-0 h-5"
                      >
                        {step.roiPercentage > 0 ? `+${step.roiPercentage}%` : `${step.roiPercentage}%`}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
