import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FlaskConical,
  Droplets,
  Leaf,
  AlertCircle,
  CheckCircle,
  Info,
  Edit3,
  Activity,
  Check,
  RotateCcw,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import { useSoil } from "@/contexts/SoilContext";
import { toast } from "@/hooks/use-toast";

const SoilAnalysis: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const { soil, mode, setMode, updateSoil, isSimulated, resetToDefaults } = useSoil();

  const [calibrated, setCalibrated] = useState(true);

  // Manual editing state
  const [manualN, setManualN] = useState(soil.n.toString());
  const [manualP, setManualP] = useState(soil.p.toString());
  const [manualK, setManualK] = useState(soil.k.toString());
  const [manualPH, setManualPH] = useState(soil.ph.toString());

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Math.max(0, Math.min(100, parseFloat(manualN) || 50));
    const p = Math.max(0, Math.min(100, parseFloat(manualP) || 50));
    const k = Math.max(0, Math.min(100, parseFloat(manualK) || 50));
    const ph = Math.max(3.0, Math.min(11.0, parseFloat(manualPH) || 6.5));

    updateSoil({ n, p, k, ph });
    toast({
      title: lang === "hi" ? "मिट्टी डेटा सेव हुआ" : lang === "mr" ? "माती डेटा सेव्ह झाला" : "Soil Parameters Saved",
      description: `N: ${n}%, P: ${p}%, K: ${k}%, pH: ${ph}`,
    });
  };

  const CircularGauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
    return (
      <div className="flex flex-col items-center">
        <svg width="120" height="120" className="drop-shadow-sm">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="transition-all duration-700"
          />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold font-inter fill-foreground"
          >
            {Math.round(value)}%
          </text>
        </svg>
        <p className="text-sm font-semibold mt-1">{label}</p>
      </div>
    );
  };

  // Dynamic conditions based on actual current values
  const getDynamicConditions = () => {
    const items = [];

    // Nitrogen
    if (soil.n < 45) {
      items.push({
        text: lang === "hi" ? "नाइट्रोजन कम है — दलहनी फसलें (सोयाबीन, तूर) अनुशंसित" : lang === "mr" ? "नायट्रोजन कमी आहे — कडधान्य पिके (सोयाबीन, तूर) फायदेशीर" : "Nitrogen is low — leguminous crops (soybean, tur) recommended to restore soil fertility.",
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        status: "warning" as const,
      });
    } else {
      items.push({
        text: lang === "hi" ? "नाइट्रोजन का स्तर संतुलित है" : lang === "mr" ? "नायट्रोजनची पातळी समाधानकारक आहे" : "Nitrogen levels are healthy and sufficient.",
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        status: "good" as const,
      });
    }

    // Phosphorus
    if (soil.p >= 40) {
      items.push({
        text: lang === "hi" ? "फॉस्फोरस का स्तर पर्याप्त है (जड़ विकास के लिए अच्छा)" : lang === "mr" ? "फॉस्फरसची पातळी योग्य आहे (मुळांच्या वाढीसाठी उत्तम)" : "Phosphorus levels are adequate for root and flower development.",
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        status: "good" as const,
      });
    } else {
      items.push({
        text: lang === "hi" ? "फॉस्फोरस कम है — डीएपी (DAP) या एसएसपी (SSP) की आवश्यकता" : lang === "mr" ? "फॉस्फरस कमी आहे — DAP किंवा SSP खताची गरज" : "Phosphorus is deficient — basal application of DAP/SSP recommended.",
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        status: "warning" as const,
      });
    }

    // Potassium
    if (soil.k >= 45) {
      items.push({
        text: lang === "hi" ? "पोटैशियम स्तर अच्छा है (रोग प्रतिरोधक क्षमता बढ़ाता है)" : lang === "mr" ? "पोटॅशियम पातळी उत्तम आहे (रोगप्रतिकारक शक्ती वाढवते)" : "Potassium level is balanced, providing disease resistance.",
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        status: "good" as const,
      });
    } else {
      items.push({
        text: lang === "hi" ? "पोटैशियम मध्यम है — पोटाश (MOP) खाद से सुधार होगा" : lang === "mr" ? "पोटॅशियम मध्यम आहे — म्युरेट ऑफ पोटॅश (MOP) खताने सुधारणा होईल" : "Potassium is moderate — application of MOP fertilizer advised.",
        icon: <AlertCircle className="h-5 w-5 text-accent" />,
        status: "medium" as const,
      });
    }

    // pH condition
    if (soil.ph < 5.5) {
      items.push({
        text: lang === "hi" ? `pH अत्यधिक अम्लीय है (${soil.ph}) — कृषि चूना (Lime) का प्रयोग अनिवार्य है` : lang === "mr" ? `pH अति-आम्लधर्मी आहे (${soil.ph}) — जमिनीत कृषी चुना वापरणे अत्यंत गरजेचे` : `pH is strongly acidic (${soil.ph}) — agricultural liming is essential.`,
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        status: "warning" as const,
      });
    } else if (soil.ph > 8.0) {
      items.push({
        text: lang === "hi" ? `pH क्षारीय है (${soil.ph}) — जिप्सम और गोबर की खाद (FYM) का प्रयोग करें` : lang === "mr" ? `pH क्षारयुक्त आहे (${soil.ph}) — जिप्सम व शेणखताचा मुबलक वापर करा` : `pH is alkaline (${soil.ph}) — gypsum and well-rotted FYM application recommended.`,
        icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
        status: "warning" as const,
      });
    } else {
      items.push({
        text: lang === "hi" ? `pH स्तर आदर्श है (${soil.ph}) — अधिकांश फसलों के लिए पोषक` : lang === "mr" ? `pH पातळी आदर्श आहे (${soil.ph}) — बहुतांश पिकांसाठी अनुकूल` : `Soil pH is in ideal neutral-to-slightly-acidic range (${soil.ph}).`,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        status: "good" as const,
      });
    }

    return items;
  };

  const conditions = getDynamicConditions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-primary" />
            <span>{t("soil.title")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {lang === "hi"
              ? "मिट्टी की उर्वरता, NPK घटक और pH संतुलन का व्यापक विश्लेषण"
              : lang === "mr"
              ? "मातीची सुपीकता, NPK घटक आणि सामू (pH) चे सर्वसमावेशक विश्लेषण"
              : "Comprehensive soil chemistry, nutrient balancing, and agricultural advisories."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Mode Switcher Buttons */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-card text-xs">
            <button
              onClick={() => setMode("manual")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                !isSimulated ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "मैन्युअल मोड" : lang === "mr" ? "मॅन्युअल मोड" : "Manual Mode"}</span>
            </button>
            <button
              onClick={() => setMode("simulated")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                isSimulated ? "bg-amber-600 text-white font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "डेमो सेंसर मोड" : lang === "mr" ? "डेमो सेन्सर मोड" : "Demo Sensor"}</span>
            </button>
          </div>

          <Button
            onClick={() => toast({ title: t("soil.export"), description: "Soil Health Card PDF generated" })}
            className="bg-primary hover:bg-primary/90 h-9 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("soil.export")}
          </Button>
        </div>
      </div>

      {/* Prominent Simulated Sensor Data Banner (Spec section 18 & 35) */}
      {isSimulated ? (
        <div className="p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200">
            <Info className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/20 text-amber-800 border-amber-500/40 text-[11px] font-bold">
                  Demo / Simulated Sensor Data
                </Badge>
                <span className="font-semibold">{lang === "hi" ? "सिम्युलेशन सक्रिय" : lang === "mr" ? "सिम्युलेशन सुरू" : "Simulation Active"}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {lang === "hi"
                  ? "यह डेटा केवल सॉफ्टवेयर परीक्षण व डेमो के लिए है। यह वास्तविक IoT हार्डवेयर माप नहीं है।"
                  : lang === "mr"
                  ? "हा डेटा फक्त सॉफ्टवेअर चाचणी व प्रात्यक्षिकासाठी आहे. हे प्रत्यक्ष IoT मोजमाप नाही."
                  : "These telemetry values are simulated for demo purposes and are not physical IoT hardware measurements."}
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={() => setMode("manual")} className="text-xs shrink-0">
            {lang === "hi" ? "मैन्युअल दर्ज करें" : lang === "mr" ? "स्वतः नोंदवा" : "Switch to Manual"}
          </Button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">
              {lang === "hi" ? "मैन्युअल मोड सक्रिय — किसान द्वारा सत्यापित डेटा" : lang === "mr" ? "मॅन्युअल मोड सुरू — शेतकऱ्याने नोंदवलेला डेटा" : "Manual Mode Active — Farmer-entered soil test data"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {lang === "hi" ? "मिट्टी परीक्षण कार्ड के अनुसार मान दर्ज करें" : lang === "mr" ? "माती परीक्षण अहवालानुसार मूल्ये भरा" : "Values synced with Crop Recommendations"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor / Live Telemetry Display */}
        <Card className="lg:col-span-7 bg-card/95 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <span>
                  {isSimulated
                    ? (lang === "hi" ? "सेंसर टेलीमेट्री (डेमो)" : lang === "mr" ? "सेन्सर टेलिमेट्री (डेमो)" : "Sensor Telemetry (Demo)")
                    : (lang === "hi" ? "सक्रिय मिट्टी पैरामीटर" : lang === "mr" ? "सक्रिय माती गुणधर्म" : "Active Soil Parameters")}
                </span>
              </CardTitle>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("soil.calibration")}</span>
                <Switch checked={calibrated} onCheckedChange={setCalibrated} />
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${calibrated ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {calibrated ? t("soil.calibrated") : t("soil.not_calibrated")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around flex-wrap gap-4 py-2">
              <CircularGauge value={soil.n} label={t("dash.nitrogen")} color="#f59e0b" />
              <CircularGauge value={soil.p} label={t("dash.phosphorus")} color="#10b981" />
              <CircularGauge value={soil.k} label={t("dash.potassium")} color="#3b82f6" />
            </div>

            {/* pH Slider / Gauge */}
            <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border/40">
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span>{t("dash.ph")}</span>
                <span className="text-base font-bold text-primary font-inter">pH {soil.ph}</span>
              </div>
              <div className="h-4 bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500 rounded-full relative">
                <div
                  className="absolute h-6 w-2 bg-foreground rounded-full top-1/2 -translate-y-1/2 shadow-md transition-all duration-300"
                  style={{ left: `${Math.max(0, Math.min(100, ((soil.ph - 3) / 11) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>3 (Acidic / अम्लीय)</span>
                <span className="font-semibold text-foreground">7.0 (Neutral / उदासीन)</span>
                <span>14 (Alkaline / क्षारीय)</span>
              </div>
            </div>

            {isSimulated && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Auto-updating every 4s (Demo) • {new Date().toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Condition Summary */}
        <Card className="lg:col-span-5 bg-card/95 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span>{t("soil.condition")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conditions.map((c, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors ${
                  c.status === "warning"
                    ? "bg-amber-500/5 border-amber-500"
                    : c.status === "good"
                    ? "bg-emerald-500/5 border-emerald-500"
                    : "bg-blue-500/5 border-blue-500"
                }`}
              >
                {c.icon}
                <p className="text-xs sm:text-sm leading-relaxed">{c.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Manual Soil Input Form (Mode 1) */}
        <Card className="lg:col-span-12 bg-card/95 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <span>{lang === "hi" ? "मिट्टी डेटा दर्ज करें / अपडेट करें (मैन्युअल इनपुट)" : lang === "mr" ? "मातीची माहिती नोंदवा (मॅन्युअल इनपुट)" : "Farmer Soil Entry / Test Card Input"}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetToDefaults} className="text-xs text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {lang === "hi" ? "रीसेट" : lang === "mr" ? "रीसेट" : "Reset Defaults"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveManual} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nitrogen (N) %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={manualN}
                    onChange={(e) => setManualN(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phosphorus (P) %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={manualP}
                    onChange={(e) => setManualP(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Potassium (K) %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={manualK}
                    onChange={(e) => setManualK(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Soil pH (3 - 11)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="3"
                    max="11"
                    value={manualPH}
                    onChange={(e) => setManualPH(e.target.value)}
                    className="h-10 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-xs font-semibold h-9 px-5">
                  <Check className="h-4 w-4 mr-1.5" />
                  {lang === "hi" ? "मापदंड सहेजें और फसल शिफारिशें अपडेट करें" : lang === "mr" ? "माती डेटा जतन करा व शिफारसी अद्ययावत करा" : "Save Parameters & Sync Recommendations"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* What This Means Detailed Advisory */}
        <Card className="lg:col-span-12 bg-card/95 border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("soil.what_means")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {lang === "hi"
                ? `आपकी मिट्टी में वर्तमान में N: ${soil.n}%, P: ${soil.p}%, K: ${soil.k}%, और pH: ${soil.ph} दर्ज है। यदि नाइट्रोजन की कमी है, तो दलहनी फसलें (सोयाबीन, तूर, चना) प्राकृतिक रूप से भूमि को उपजाऊ बनाती हैं। फॉस्फोरस जड़ों और फूलों के विकास में महत्वपूर्ण भूमिका निभाता है। यदि pH 6.0 से कम है, तो चूना (Agricultural Lime) का प्रयोग करें, और यदि pH 8.0 से अधिक है, तो जिप्सम और गोबर की खाद से मृदा स्वास्थ्य सुधारें।`
                : lang === "mr"
                ? `आपल्या मातीत सध्या N: ${soil.n}%, P: ${soil.p}%, K: ${soil.k}%, आणि pH: ${soil.ph} नोंदवले आहे. नायट्रोजनचे प्रमाण कमी असल्यास कडधान्य पिके (सोयाबीन, तूर, हरभरा) घेतल्याने जमिनीची सुपीकता नैसर्गिकरित्या वाढते. मुळांच्या पोषणासाठी फॉस्फरस आवश्यक आहे. मातीचा सामू (pH) ६.० पेक्षा कमी असल्यास कृषी चुना वापरावा, आणि ८.० पेक्षा जास्त असल्यास जिप्सम व शेणखताचा वापर करून माती सुधारणा करावी.`
                : `Your soil currently records N: ${soil.n}%, P: ${soil.p}%, K: ${soil.k}%, with pH at ${soil.ph}. Balanced nitrogen supports vegetative vigor; legume rotation naturally fixes atmospheric nitrogen. Phosphorus promotes extensive root architecture and pod setting. If pH is acidic (<6.0), applying agricultural lime helps nutrient uptake. If alkaline (>8.0), gypsum and well-composted organic matter restore optimal soil health.`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoilAnalysis;
