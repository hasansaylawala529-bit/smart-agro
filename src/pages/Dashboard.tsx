import React, { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wheat,
  Store,
  MapPin,
  RefreshCw,
  ArrowRight,
  Droplets,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import { useWeather } from "@/hooks/useWeather";
import { useMandiPrices, formatPrice } from "@/hooks/useMandiPrices";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { useSoil } from "@/contexts/SoilContext";
import { useCropRecommendation } from "@/hooks/useCropRecommendation";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { Forecast7Day } from "@/components/weather/Forecast7Day";
import { AgriculturalInsightsCard } from "@/components/weather/AgriculturalInsightsCard";
import { LocationSelectorModal } from "@/components/location/LocationSelectorModal";
import { CropDetailModal } from "@/components/crop/CropDetailModal";
import { CropRecommendationResult } from "@/services/cropRecommendationService";
import farmerField from "@/assets/farmer-field.jpg";

const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const lang = language as Language;

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropRecommendationResult | null>(null);

  // Contexts
  const { location, districtInfo } = useFarmLocation();
  const { soil, waterAvailability, isSimulated } = useSoil();

  // Weather query using farm coordinates
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    district: location.district,
  });

  // Dynamic deterministic crop recommendation engine consuming location, weather, and soil!
  const {
    rankedCrops,
    season,
  } = useCropRecommendation();

  const topThreeCrops = rankedCrops.slice(0, 3);

  // Mandi prices for detected district
  const { data: mandiData, loading: mandiLoading } = useMandiPrices({
    state: "Maharashtra",
    district: location.district,
    limit: 50,
  });

  const topMandiPrices = useMemo(() => {
    if (!mandiData.length) return [];
    const commodityMap = new Map<string, { commodity: string; modalPrice: number; market: string }>();

    mandiData.forEach((item) => {
      const price = parseFloat(item.modal_price);
      if (!isNaN(price) && !commodityMap.has(item.commodity)) {
        commodityMap.set(item.commodity, {
          commodity: item.commodity,
          modalPrice: price,
          market: item.market,
        });
      }
    });

    return Array.from(commodityMap.values()).slice(0, 3);
  }, [mandiData]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden h-44 group shadow-sm">
        <img
          src={farmerField}
          alt="Farm landscape"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/75 to-transparent" />
        <div className="relative z-10 flex items-center justify-between h-full px-6 sm:px-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs transition-colors cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-300" />
                <span className="font-semibold">{location.formattedAddress || `${location.district}, Maharashtra`}</span>
                <span className="text-[10px] underline ml-1">
                  ({lang === "hi" ? "बदलें" : lang === "mr" ? "बदला" : "Change"})
                </span>
              </button>

              <Badge variant="outline" className="border-white/30 text-white text-[11px] bg-white/10 hidden sm:inline-flex">
                {season} {lang === "hi" ? "मौसम" : lang === "mr" ? "हंगाम" : "Season"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-white mt-2">
              {t("dash.welcome")}, Kisan! 🌾
            </h1>
            <p className="text-emerald-100/80 mt-1 text-xs sm:text-sm max-w-lg line-clamp-2">
              {lang === "hi"
                ? "मौसम, मिट्टी और मौसम पूर्वानुमान के आधार पर वास्तविक कृषि सिफारिशें।"
                : lang === "mr"
                ? "हवामान, माती आणि पूर्वानुमानावर आधारित प्रत्यक्ष कृषी शिफारसी."
                : "Real-time decision support driven by live localized weather and soil metrics."}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 bg-white/90 text-emerald-950 hover:bg-white font-semibold text-xs shadow-md"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {lang === "hi" ? "खेत का स्थान" : lang === "mr" ? "शेताचे स्थान" : "Farm Location"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Weather & Agricultural Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weather Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <WeatherCard
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            locationAddress={location.formattedAddress || `${location.district}, Maharashtra`}
            onRefresh={refetchWeather}
            onChangeLocation={() => setIsLocationModalOpen(true)}
          />

          {/* 7-Day Forecast */}
          <Forecast7Day daily={weather?.daily || []} loading={weatherLoading} />
        </div>

        {/* Agricultural Weather Intelligence & Farm Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Weather Insights Card */}
          <AgriculturalInsightsCard
            insights={weather?.insights}
            loading={weatherLoading}
          />

          {/* Farm Information Summary (Spec section 24) */}
          <Card className="bg-card/95 border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  <span>{lang === "hi" ? "खेत और मिट्टी की स्थिति" : lang === "mr" ? "शेत व मातीची माहिती" : "Farm & Soil Profile"}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/soil")}
                  className="h-7 text-xs text-primary px-2 hover:bg-primary/10"
                >
                  {lang === "hi" ? "संपादित करें" : lang === "mr" ? "बदल करा" : "Edit / Soil"} &rarr;
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
              {isSimulated && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                  <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{lang === "hi" ? "डेमो / सिम्युलेटेड सेंसर डेटा (वास्तविक IoT नहीं)" : lang === "mr" ? "डेमो / सिम्युलेटेड सेन्सर डेटा (प्रत्यक्ष IoT नाही)" : "Demo / Simulated Sensor Data"}</span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">pH</p>
                  <p className="text-base font-bold font-inter mt-0.5 text-foreground">{soil.ph}</p>
                </div>
                <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">N</p>
                  <p className="text-base font-bold font-inter mt-0.5 text-foreground">{soil.n}</p>
                </div>
                <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">P</p>
                  <p className="text-base font-bold font-inter mt-0.5 text-foreground">{soil.p}</p>
                </div>
                <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">K</p>
                  <p className="text-base font-bold font-inter mt-0.5 text-foreground">{soil.k}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span>{lang === "hi" ? "पानी की उपलब्धता:" : lang === "mr" ? "पाण्याची उपलब्धता:" : "Water Availability:"}</span>
                <span className="font-semibold text-foreground capitalize">
                  {waterAvailability} {lang === "hi" ? "(मध्यम)" : lang === "mr" ? "(मध्यम)" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Core Feature 2: Integrated Crop Recommendation Section (Spec section 21 & 24) */}
      <Card className="bg-card/95 border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wheat className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold">
                  {lang === "hi"
                    ? "मौसम और स्थान पर आधारित फसल सिफारिशें"
                    : lang === "mr"
                    ? "हवामान व स्थानावर आधारित पीक शिफारसी"
                    : "Weather & Location Based Crop Recommendations"}
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "hi"
                  ? `आपके स्थान (${location.district}), मौसम (${season}), वर्तमान तापमान (${weather?.current.temperature ?? "--"}°C) और मिट्टी के आधार पर गणना की गई:`
                  : lang === "mr"
                  ? `आपल्या स्थानानुसार (${location.district}), हंगाम (${season}), सध्याचे तापमान (${weather?.current.temperature ?? "--"}°C) व मातीच्या गुणधर्मानुसार:`
                  : `Calculated from live weather in ${location.district}, ${season} season, and soil profile:`}
              </p>
            </div>

            <Button
              onClick={() => navigate("/crop")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 self-start sm:self-auto"
            >
              <span>{lang === "hi" ? "सभी फसलें देखें" : lang === "mr" ? "सर्व पिके पहा" : "View All Recommendations"}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThreeCrops.map((cropResult, idx) => {
              const { crop, overallScore, category, explanations } = cropResult;
              const cropName = lang === "hi" ? crop.nameHi : lang === "mr" ? crop.nameMr : crop.name;
              const categoryLabel = lang === "hi" ? cropResult.categoryHi : lang === "mr" ? cropResult.categoryMr : category;

              const categoryBadge =
                overallScore >= 80
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                  : overallScore >= 60
                  ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/20";

              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCropDetail(cropResult)}
                  className="group cursor-pointer p-4 rounded-xl border border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{medals[idx]}</span>
                        <span className="text-3xl p-1.5 rounded-xl bg-primary/10 border border-primary/15">
                          {crop.emoji}
                        </span>
                        <div>
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {cropName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            {crop.growingPeriodDays}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black font-inter text-primary">
                          {overallScore}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${categoryBadge}`}>
                        {categoryLabel}
                      </Badge>
                    </div>

                    {/* Top Why bullet */}
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      ✓ {explanations[0]?.text[lang] || crop.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>{lang === "hi" ? "विस्तृत रिपोर्ट देखें" : lang === "mr" ? "सविस्तर माहिती पहा" : "Inspect Why & Timeline"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Integrations: Mandi Snapshot & Market Trends */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Mandi Prices (7 cols) */}
        <Card
          className="md:col-span-7 cursor-pointer group hover:shadow-md transition-all bg-card/95 border-border/50"
          onClick={() => navigate("/market")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Store className="h-4 w-4 text-accent-foreground" />
                </div>
                <span>{t("dash.market")}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <span>{t("dash.mandi")}:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {location.district} APMC
              </span>
              {mandiLoading && <Loader2 className="h-3 w-3 animate-spin ml-1 text-primary" />}
            </p>

            {mandiLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : topMandiPrices.length > 0 ? (
              <div className="space-y-2">
                {topMandiPrices.map((item) => (
                  <div
                    key={item.commodity}
                    className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-sm">{item.commodity}</span>
                      <p className="text-[11px] text-muted-foreground">{item.market}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-inter font-bold text-base">
                        {formatPrice(item.modalPrice.toString())}
                        <span className="text-[10px] text-muted-foreground font-normal">/qtl</span>
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {t("dash.live")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{t("dash.no_mandi_data")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advisory Safety & Best Practices (5 cols) */}
        <Card className="md:col-span-5 bg-card/95 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <span>{lang === "hi" ? "कृषि सुरक्षा और दिशानिर्देश" : lang === "mr" ? "कृषी सुरक्षा व मार्गदर्शन" : "Agronomic Safety & Standards"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-1">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <p className="font-semibold text-foreground text-xs mb-1">
                📌 {lang === "hi" ? "पारदर्शी सिफारिश प्रणाली" : lang === "mr" ? "पारदर्शक शिफारस प्रणाली" : "Transparent Scoring"}
              </p>
              <p className="leading-relaxed">
                {lang === "hi"
                  ? "सभी फसल सिफारिशें मौसम (25%), वर्षा (20%), तापमान (15%), मिट्टी (15%) और सीजन (10%) के सत्यापित गणितीय सूत्र पर आधारित हैं।"
                  : lang === "mr"
                  ? "सर्व पीक शिफारसी हवामान (२५%), पाऊस (२०%), तापमान (१५%), माती (१५%) आणि हंगाम (१०%) च्या पारदर्शक सूत्रावर आधारित आहेत."
                  : "All crop scores are deterministically computed based on regional agro-climatic requirements and Open-Meteo live weather data."}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <p className="font-semibold text-foreground text-xs mb-1">
                💧 {lang === "hi" ? "सिंचाई प्रबंधन" : lang === "mr" ? "पाणी व्यवस्थापन" : "Water Management"}
              </p>
              <p className="leading-relaxed">
                {weather?.insights.rainExpectedTomorrow
                  ? (lang === "hi" ? "कल बारिश अपेक्षित है। भूमिगत जल और बिजली की बचत के लिए सिंचाई टालें।" : lang === "mr" ? "उद्या पाऊस अपेक्षित आहे. सिंचन पुढे ढकला." : "Rain is expected tomorrow. Postpone scheduled irrigation.")
                  : (lang === "hi" ? "मौसम शुष्क है। फसल की अवस्था अनुसार नियमित सिंचाई करें।" : lang === "mr" ? "हवामान कोरडे आहे. पिकाच्या गरजेनुसार पाणी द्या." : "Stable weather. Maintain normal crop-specific irrigation schedule.")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <CropDetailModal
        cropResult={selectedCropDetail}
        isOpen={Boolean(selectedCropDetail)}
        onClose={() => setSelectedCropDetail(null)}
      />
    </div>
  );
};

export default Dashboard;
