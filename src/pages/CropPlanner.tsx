import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wheat,
  MapPin,
  Calendar,
  Droplets,
  FlaskConical,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { useSoil, WaterAvailability, SoilInputMode } from "@/contexts/SoilContext";
import { useCropRecommendation } from "@/hooks/useCropRecommendation";
import { maharashtraDistricts } from "@/data/districts";
import { SeasonType, CropRecommendationResult } from "@/services/cropRecommendationService";
import { CropCard } from "@/components/crop/CropCard";
import { CropDetailModal } from "@/components/crop/CropDetailModal";
import { LocationSelectorModal } from "@/components/location/LocationSelectorModal";
import { intercroppingPairs, fertilizerPlan } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const CropPlanner: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;

  const { location } = useFarmLocation();
  const { soil, mode, setMode, updateSoil, waterAvailability, setWaterAvailability, isSimulated } = useSoil();

  // Form state
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>("Kharif");
  const [farmSize, setFarmSize] = useState<string>("2.5");
  const [irrigationType, setIrrigationType] = useState<string>("Drip Irrigation");

  // Local soil inputs for the form
  const [inputN, setInputN] = useState(soil.n.toString());
  const [inputP, setInputP] = useState(soil.p.toString());
  const [inputK, setInputK] = useState(soil.k.toString());
  const [inputPH, setInputPH] = useState(soil.ph.toString());

  // Location modal & crop detail modal
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendationResult | null>(null);

  // Recommendations hook
  const {
    rankedCrops,
    season: autoSeason,
    weather,
  } = useCropRecommendation({
    customDistrict: location.district,
    customSeason: selectedSeason,
    customSoil: {
      n: parseFloat(inputN) || 50,
      p: parseFloat(inputP) || 50,
      k: parseFloat(inputK) || 50,
      ph: parseFloat(inputPH) || 6.5,
    },
  });

  const handleApplyInputs = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedN = Math.max(0, Math.min(100, parseFloat(inputN) || 50));
    const parsedP = Math.max(0, Math.min(100, parseFloat(inputP) || 50));
    const parsedK = Math.max(0, Math.min(100, parseFloat(inputK) || 50));
    const parsedPH = Math.max(3.0, Math.min(11.0, parseFloat(inputPH) || 6.5));

    updateSoil({
      n: parsedN,
      p: parsedP,
      k: parsedK,
      ph: parsedPH,
    });

    toast({
      title: lang === "hi" ? "सिफारिशें अपडेट हुईं" : lang === "mr" ? "शिफारसी अद्ययावत झाल्या" : "Recommendations Updated",
      description: `${location.district} • ${selectedSeason} • pH ${parsedPH}`,
    });
  };

  const handleSwitchToSimulated = () => {
    setMode("simulated");
    setInputN(soil.n.toString());
    setInputP(soil.p.toString());
    setInputK(soil.k.toString());
    setInputPH(soil.ph.toString());
    toast({
      title: lang === "hi" ? "डेमो सेंसर मोड सक्रिय" : lang === "mr" ? "डेमो सेन्सर मोड सुरू" : "Demo Sensor Telemetry Active",
      description: lang === "hi" ? "सिम्युलेटेड सेंसर मान लोड किए गए" : lang === "mr" ? "सिम्युलेटेड मूल्य लोड केले" : "Loaded demo sensor telemetry values",
    });
  };

  const handleSwitchToManual = () => {
    setMode("manual");
  };

  const getName = (item: { name: string; nameHi: string; nameMr: string }) =>
    lang === "hi" ? item.nameHi : lang === "mr" ? item.nameMr : item.name;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold flex items-center gap-2">
            <Wheat className="h-7 w-7 text-primary" />
            <span>{lang === "hi" ? "फसल सिफारिश व योजना" : lang === "mr" ? "पीक शिफारस व नियोजन" : "Crop Recommendation & Planner"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {lang === "hi"
              ? "मौसम, मिट्टी और वर्षा पर आधारित पारदर्शी और विश्वसनीय फसल चयन प्रणाली"
              : lang === "mr"
              ? "हवामान, माती आणि पावसाच्या विश्लेषणावर आधारित पारदर्शक पीक निवड प्रणाली"
              : "Deterministic, explainable crop suitability engine based on live weather and soil parameters."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLocationModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 h-9"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-xs">{location.formattedAddress || `${location.district}, Maharashtra`}</span>
        </Button>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="bg-muted/60 h-12 p-1">
          <TabsTrigger value="recommendations" className="text-sm h-10 px-5 font-semibold">
            🌱 {lang === "hi" ? "फसल सिफारिश" : lang === "mr" ? "पीक शिफारस" : "Crop Recommendations"}
          </TabsTrigger>
          <TabsTrigger value="intercropping" className="text-sm h-10 px-5 font-medium">
            🌿 {t("crop.intercropping")}
          </TabsTrigger>
          <TabsTrigger value="fertilizer" className="text-sm h-10 px-5 font-medium">
            🧪 {t("crop.fertilizer")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Core Problem Statement - Crop Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* Farmer Input Form (Spec section 17, 18, 19) */}
          <Card className="bg-card/95 border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{lang === "hi" ? "किसान इनपुट फॉर्म" : lang === "mr" ? "शेतकरी माहिती फॉर्म" : "Farmer Input & Farm Conditions"}</span>
                </CardTitle>

                {/* Mode Selector (Spec section 18) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {lang === "hi" ? "मिट्टी डेटा मोड:" : lang === "mr" ? "माती डेटा मोड:" : "Soil Input Mode:"}
                  </span>
                  <div className="inline-flex rounded-lg border border-border p-0.5 bg-background text-xs">
                    <button
                      type="button"
                      onClick={handleSwitchToManual}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        !isSimulated ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lang === "hi" ? "मैन्युअल" : lang === "mr" ? "मॅन्युअल" : "Manual"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSwitchToSimulated}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        isSimulated ? "bg-amber-600 text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lang === "hi" ? "डेमो सेंसर" : lang === "mr" ? "डेमो सेन्सर" : "Demo Sensor"}
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Prominent Simulated Sensor Data Banner (Spec section 18) */}
              {isSimulated && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-500/20 px-2 py-0.5 rounded mr-2">
                      Demo / Simulated Sensor Data
                    </span>
                    <span>
                      {lang === "hi"
                        ? "यह परीक्षण के लिए सिम्युलेटेड सेंसर मान हैं। वास्तविक IoT परीक्षण उपलब्ध नहीं होने पर मैन्युअल मोड का उपयोग करें।"
                        : lang === "mr"
                        ? "हे चाचणीसाठी सिम्युलेटेड सेन्सर मूल्ये आहेत. प्रत्यक्ष IoT सेन्सर नसल्यास मॅन्युअल मोड वापरा."
                        : "These are simulated telemetry readings for demonstration purposes. Never mistaken for physical IoT hardware."}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleApplyInputs} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field 1: Location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {lang === "hi" ? "स्थान / जिला" : lang === "mr" ? "स्थान / जिल्हा" : "Location"}
                    </Label>
                    <div
                      onClick={() => setIsLocationModalOpen(true)}
                      className="flex items-center justify-between h-10 px-3 border border-input rounded-md bg-muted/20 hover:bg-muted/40 cursor-pointer text-sm"
                    >
                      <span className="truncate font-medium">{location.district}, Maharashtra</span>
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                    </div>
                  </div>

                  {/* Field 2: Season */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {lang === "hi" ? "कृषि मौसम (सीजन)" : lang === "mr" ? "हंगाम" : "Agricultural Season"}
                    </Label>
                    <Select
                      value={selectedSeason}
                      onValueChange={(val: SeasonType) => setSelectedSeason(val)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">
                          Kharif (खरीफ / खरीप • Jun–Oct)
                        </SelectItem>
                        <SelectItem value="Rabi">
                          Rabi (रबी / रब्बी • Nov–Mar)
                        </SelectItem>
                        <SelectItem value="Zaid">
                          Zaid (जायद / उन्हाळी • Apr–May)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field 3: Water Availability */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {lang === "hi" ? "पानी की उपलब्धता" : lang === "mr" ? "पाण्याची उपलब्धता" : "Water Availability"}
                    </Label>
                    <Select
                      value={waterAvailability}
                      onValueChange={(val: WaterAvailability) => setWaterAvailability(val)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Water Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {lang === "hi" ? "कम (Low / केवल वर्षा)" : lang === "mr" ? "कमी (Low / कोरडवाहू)" : "Low (Rainfed / Minimal)"}
                        </SelectItem>
                        <SelectItem value="medium">
                          {lang === "hi" ? "मध्यम (Medium / सीमित सिंचाई)" : lang === "mr" ? "मध्यम (Medium / विहीर सिंचन)" : "Medium (Well / Semi-irrigated)"}
                        </SelectItem>
                        <SelectItem value="high">
                          {lang === "hi" ? "प्रचुर (High / नहर या बोरवेल)" : lang === "mr" ? "भरपूर (High / बागायत / कालवा)" : "High (Assured / Canal / Tubewell)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field 4: Farm Size */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {lang === "hi" ? "खेत का आकार (एकड़)" : lang === "mr" ? "शेताचा आकार (एकर)" : "Farm Size (Acres)"}
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Soil NPK and pH Inputs (Spec section 17 & 18) */}
                <div className="pt-2 border-t border-border/40">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    {lang === "hi" ? "मिट्टी के पैरामीटर (NPK & pH)" : lang === "mr" ? "मातीचे गुणधर्म (NPK व pH)" : "Soil Chemistry Parameters"}
                  </Label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">Nitrogen (N)</span>
                        <span className="text-muted-foreground">{inputN}%</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={inputN}
                        onChange={(e) => setInputN(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">Phosphorus (P)</span>
                        <span className="text-muted-foreground">{inputP}%</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={inputP}
                        onChange={(e) => setInputP(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">Potassium (K)</span>
                        <span className="text-muted-foreground">{inputK}%</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={inputK}
                        onChange={(e) => setInputK(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">Soil pH</span>
                        <span className="text-muted-foreground">{inputPH}</span>
                      </div>
                      <Input
                        type="number"
                        step="0.1"
                        min="3"
                        max="11"
                        value={inputPH}
                        onChange={(e) => setInputPH(e.target.value)}
                        className="h-9 text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* Warning on extreme pH (Edge cases section 41) */}
                  {parseFloat(inputPH) < 5.0 && (
                    <div className="mt-2 text-xs text-destructive flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{lang === "hi" ? "चेतावनी: मिट्टी अत्यधिक अम्लीय (pH < 5) है। चूना डालने की सलाह है।" : lang === "mr" ? "इशारा: माती अति-आम्लधर्मी आहे (pH < 5). चुना वापरणे आवश्यक." : "Notice: Strongly acidic soil (pH < 5.0). Agricultural lime recommended before sowing."}</span>
                    </div>
                  )}
                  {parseFloat(inputPH) > 8.0 && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{lang === "hi" ? "सूचना: मिट्टी क्षारीय (pH > 8) है। जिप्सम या जैविक खाद का उपयोग करें।" : lang === "mr" ? "सूचना: माती क्षारयुक्त आहे (pH > 8). जिप्सम किंवा सेंद्रिय खतांचा वापर करा." : "Notice: High alkaline soil (pH > 8.0). Gypsum or FYM recommended."}</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-sm font-semibold h-10 px-6">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {lang === "hi" ? "फसल सिफारिशें प्राप्त करें" : lang === "mr" ? "पीक शिफारसी मिळवा" : "Get Recommendations"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recommendations Results List (Spec section 19) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-poppins text-foreground">
                  {lang === "hi" ? "सुझाई गई फसलें (उपयुक्तता अनुसार)" : lang === "mr" ? "शिफारस केलेली पिके (योग्यतेनुसार)" : "Ranked Crop Recommendations"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "hi"
                    ? `कुल ${rankedCrops.length} फसलों का विश्लेषण किया गया • विवरण देखने के लिए किसी भी फसल पर क्लिक करें`
                    : lang === "mr"
                    ? `एकूण ${rankedCrops.length} पिकांचे विश्लेषण केले • सविस्तर माहितीसाठी पिकावर क्लिक करा`
                    : `${rankedCrops.length} crops evaluated for ${location.district} (${selectedSeason} season) • Click any card for full details.`}
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                {selectedSeason}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rankedCrops.map((cropResult, idx) => (
                <CropCard
                  key={cropResult.crop.id}
                  rank={idx + 1}
                  cropResult={cropResult}
                  onSelect={(c) => setSelectedCrop(c)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Intercropping Strategy (Preserved existing feature) */}
        <TabsContent value="intercropping">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {intercroppingPairs.map((pair, i) => (
              <Card key={i} className="bg-card/95 hover:shadow-lg transition-shadow border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-3xl mb-1">{pair.main.emoji}</p>
                      <p className="font-medium text-sm">{getName(pair.main)}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.main")}</p>
                    </div>
                    <ArrowLeftRight className="h-6 w-6 text-primary" />
                    <div className="text-center p-4 bg-accent/10 rounded-xl border border-accent/20">
                      <p className="text-3xl mb-1">{pair.companion.emoji}</p>
                      <p className="font-medium text-sm">{getName(pair.companion)}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.companion")}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg mb-4 border border-emerald-500/20">
                    <p className="text-xs text-muted-foreground uppercase font-medium">{t("crop.benefit")}</p>
                    <p className="text-sm mt-1 text-foreground font-medium">{pair.benefit[lang]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">{t("crop.timeline")}</p>
                    <div className="flex gap-1">
                      {monthNames.map((m, idx) => (
                        <div
                          key={m}
                          className={`flex-1 h-6 rounded text-[10px] flex items-center justify-center font-medium ${
                            pair.months.includes(idx + 1)
                              ? "bg-primary text-primary-foreground font-bold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {m.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Fertilizer Plan (Preserved existing feature) */}
        <TabsContent value="fertilizer">
          <Card className="bg-card/95 border-border/60">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {fertilizerPlan.map((stage, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/20 rounded-xl border-l-4 border-primary"
                  >
                    <span className="text-3xl">{stage.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-base">{stage.stage[lang]}</p>
                      <p className="text-xs text-muted-foreground">{stage.timing}</p>
                    </div>
                    <div className="text-left sm:text-center px-2 sm:px-4">
                      <p className="font-inter font-bold text-primary">{stage.fertilizer}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.fertilizer_type")}</p>
                    </div>
                    <div className="text-left sm:text-center px-2 sm:px-4">
                      <p className="font-inter font-bold">{stage.dosage}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.dosage")}</p>
                    </div>
                    {i < fertilizerPlan.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <CropDetailModal
        cropResult={selectedCrop}
        isOpen={Boolean(selectedCrop)}
        onClose={() => setSelectedCrop(null)}
      />

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};

export default CropPlanner;
