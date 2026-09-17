import React, { useState, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, Search, AlertTriangle, Shield, Thermometer, Loader2,
  Camera, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle,
  RefreshCw, Leaf, FlaskConical, ExternalLink, Key, Eye, HelpCircle
} from "lucide-react";
import { Language } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  analyzeCropImageWithGemini, 
  DiseaseAnalysisResult, 
  isGeminiConfigured, 
  getGeminiModel,
  AVAILABLE_GEMINI_MODELS
} from "@/hooks/useGemini";

// High-quality SVG sample leaf representations for 1-click test presets
const SAMPLE_PRESETS = [
  {
    id: "soybean-blight",
    crop: "Soybean",
    cropHi: "सोयाबीन",
    cropMr: "सोयाबीन",
    name: "Cercospora Leaf Blight",
    nameHi: "पत्ती झुलसा (सर्कोस्पोरा)",
    nameMr: "पानावरील करपा",
    badge: "Fungal",
    color: "from-amber-600 to-red-700",
    // 1x1 green-amber pixel data URL as valid image fallback
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%232d5a27'/><path d='M200 40 C100 100 80 220 200 280 C320 220 300 100 200 40 Z' fill='%234a7c39'/><circle cx='170' cy='140' r='18' fill='%236e3519' opacity='0.9'/><circle cx='230' cy='180' r='14' fill='%235c2b12' opacity='0.85'/><circle cx='195' cy='190' r='10' fill='%2370391b' opacity='0.9'/><circle cx='215' cy='120' r='12' fill='%235a2911' opacity='0.8'/><text x='200' y='270' font-family='sans-serif' font-size='14' font-weight='bold' fill='white' text-anchor='middle'>Sample: Soybean Leaf Blight</text></svg>"
  },
  {
    id: "cotton-rust",
    crop: "Cotton",
    cropHi: "कपास",
    cropMr: "कापूस",
    name: "Alternaria Leaf Spot",
    nameHi: "अल्टरनेरिया पत्ती धब्बा",
    nameMr: "अल्टरनेरिया पानावरील ठिपके",
    badge: "Bacterial/Fungal",
    color: "from-orange-600 to-amber-700",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%231f4724'/><path d='M200 30 C120 80 70 180 130 260 C200 280 270 260 330 180 C330 80 280 30 200 30 Z' fill='%23528b40'/><circle cx='180' cy='130' r='20' fill='%238c3815' opacity='0.85'/><circle cx='150' cy='190' r='16' fill='%23803210' opacity='0.9'/><circle cx='240' cy='160' r='22' fill='%238f4019' opacity='0.85'/><text x='200' y='270' font-family='sans-serif' font-size='14' font-weight='bold' fill='white' text-anchor='middle'>Sample: Cotton Alternaria Spot</text></svg>"
  },
  {
    id: "healthy-leaf",
    crop: "Tomato/Wheat",
    cropHi: "टमाटर/गेहूं",
    cropMr: "टोमॅटो/गहू",
    name: "Healthy Plant Leaf",
    nameHi: "स्वस्थ पौधा पत्ती",
    nameMr: "निरोगी वनस्पती पान",
    badge: "Healthy",
    color: "from-emerald-500 to-green-600",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%231c3b1e'/><path d='M200 30 C110 90 90 210 200 270 C310 210 290 90 200 30 Z' fill='%2348a635'/><path d='M200 40 L200 260' stroke='%2380db6b' stroke-width='4'/><path d='M200 110 L150 90 M200 150 L140 130 M200 190 L160 170 M200 110 L250 90 M200 150 L260 130 M200 190 L240 170' stroke='%2380db6b' stroke-width='2.5'/><text x='200' y='285' font-family='sans-serif' font-size='14' font-weight='bold' fill='white' text-anchor='middle'>Sample: Healthy Leaf</text></svg>"
  }
];

const DiseaseDetection: React.FC = () => {
  const { language, t } = useLanguage();
  const { location } = useFarmLocation();
  const lang = language as Language;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysisResult | null>(null);
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<"organic" | "chemical">("organic");

  const apiKeyConfigured = isGeminiConfigured();
  const currentModelId = getGeminiModel();
  const currentModel = AVAILABLE_GEMINI_MODELS.find(m => m.id === currentModelId) || AVAILABLE_GEMINI_MODELS[0];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file format",
        description: "Please upload an image file (.jpg, .png, .webp)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const selectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedImage(preset.dataUrl);
    setImageMimeType("image/svg+xml");
    setFileName(`${preset.id}.svg`);
    setFileSize("Sample Test");
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setAnalyzingStep(
      lang === "hi" 
        ? "पत्ती की छवि प्रोसेस हो रही है..." 
        : lang === "mr" 
        ? "पानाची प्रतिमा तपासली जात आहे..." 
        : "Preprocessing leaf morphology..."
    );

    try {
      // Small step animation for UX
      setTimeout(() => {
        setAnalyzingStep(
          lang === "hi" 
            ? `${currentModel.name} पैथोलॉजी मॉडल का विश्लेषण...` 
            : lang === "mr" 
            ? `${currentModel.name} द्वारे रोगाची तपासणी...` 
            : `Evaluating with ${currentModel.name}...`
        );
      }, 700);

      const result = await analyzeCropImageWithGemini(
        selectedImage,
        imageMimeType,
        location.district || "Maharashtra"
      );

      setAnalysisResult(result);

      if (result.isAiGenerated) {
        toast({
          title: lang === "hi" ? "Gemini AI विश्लेषण पूर्ण!" : lang === "mr" ? "Gemini AI विश्लेषण पूर्ण!" : "AI Diagnosis Complete!",
          description: `${result.diseaseName[lang]} (${result.confidence}% confidence)`
        });
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Error",
        description: error?.message || "Failed to analyze leaf image. Please check API key.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
      setAnalyzingStep("");
    }
  };

  const riskColors = {
    low: "text-emerald-700 bg-emerald-100 border-emerald-300",
    medium: "text-amber-700 bg-amber-100 border-amber-300",
    high: "text-red-700 bg-red-100 border-red-300"
  };

  return (
    <div className="space-y-6">
      {/* Top Title & AI Model Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-7 w-7 text-emerald-600" />
            {t("disease.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "hi"
              ? "फसल की पत्ती की फोटो खींचें या अपलोड करें — AI बीमारी पहचानेगा और जैविक व रासायनिक उपचार सुझाएगा।"
              : lang === "mr"
              ? "पिकाच्या पानाचा फोटो अपलोड करा — AI रोग ओळखून सेंद्रिय आणि रासायनिक उपाय सुचवेल."
              : "Upload or capture a leaf photo — multimodal AI will diagnose crop pathologies and formulate remedies."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>{currentModel.name} Vision</span>
          </Badge>
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
              {lang === "hi" ? "मॉडल बदलें" : lang === "mr" ? "मॉडेल बदला" : "Change Model"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Image Uploader & Presets */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card className="bg-card/95 border shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50/50 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  {t("disease.upload")}
                </span>
                {selectedImage && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    {lang === "hi" ? "हटाएं" : lang === "mr" ? "काढा" : "Reset"}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              {/* Upload Dropzone / Image Preview */}
              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-black/5 flex items-center justify-center max-h-[280px]">
                    <img
                      src={selectedImage}
                      alt="Crop Leaf to analyze"
                      className="w-full h-full object-contain max-h-[280px]"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded backdrop-blur-sm">
                      {fileSize}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="truncate max-w-[200px] font-medium">{fileName}</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      {lang === "hi" ? "दूसरी फोटो चुनें" : lang === "mr" ? "दुसरा फोटो निवडा" : "Choose another"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                      : "border-border hover:border-emerald-500/70 hover:bg-emerald-50/20"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{t("disease.drag")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, WEBP (up to 10MB)
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-9"
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      {lang === "hi" ? "गैलरी से चुनें" : lang === "mr" ? "गॅलरीतून निवडा" : "Browse Files"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-xs h-9 bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1.5" />
                      {lang === "hi" ? "कैमरा खोलें" : lang === "mr" ? "कॅमेरा उघडा" : "Capture Photo"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              {selectedImage && (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-sm transition-all"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>{analyzingStep || t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      <span>{t("disease.analyze")}</span>
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 1-Click Test Presets */}
          <Card className="bg-card/95 border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {lang === "hi" ? "त्वरित परीक्षण नमूने (1-क्लिक)" : lang === "mr" ? "द्रुत चाचणी नमुने (1-क्लिक)" : "Instant Test Presets (1-Click Test)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground pb-1">
                {lang === "hi"
                  ? "यदि आपके पास पत्ती की फोटो नहीं है, तो तुरंत परीक्षण करने के लिए किसी एक पर क्लिक करें:"
                  : lang === "mr"
                  ? "आपल्याकडे फोटो नसल्यास, त्वरित चाचणीसाठी खालीलपैकी एक निवडा:"
                  : "No leaf photo on hand? Select a sample crop specimen to test the diagnostic engine:"}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="flex items-center justify-between p-2.5 rounded-lg border hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${preset.color} flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0`}>
                        🌿
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 group-hover:text-emerald-700">
                          {preset.crop} — {lang === "hi" ? preset.nameHi : lang === "mr" ? preset.nameMr : preset.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Specimen simulation preset</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      {preset.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Diagnostic Results */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {analysisResult ? (
            <>
              {/* Primary Pathology Card */}
              <Card className="bg-card/95 border-2 border-emerald-500/30 shadow-md">
                <CardHeader className="bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-transparent pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-poppins font-bold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      {t("disease.result")}
                    </CardTitle>
                    <Badge className={riskColors[analysisResult.risk] + " border font-bold uppercase tracking-wider text-xs"}>
                      {analysisResult.isHealthy ? "HEALTHY" : `${analysisResult.risk} RISK`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Top Stats Strip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/30 rounded-xl border">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">{t("disease.name")}</p>
                      <p className="font-poppins font-bold text-base mt-0.5 text-gray-900">
                        {analysisResult.diseaseName[lang] || analysisResult.diseaseName.en}
                      </p>
                      <p className="text-xs italic text-muted-foreground mt-0.5 font-serif">
                        {analysisResult.scientificName}
                      </p>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl border text-center flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">{t("disease.confidence")}</p>
                      <p className="font-inter font-bold text-3xl text-emerald-600 mt-0.5">
                        {analysisResult.confidence}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">AI Diagnostic Reliability</p>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl border flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">Affected Area</p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {analysisResult.affectedPart || "Foliage"}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Location: {location.district}
                      </span>
                    </div>
                  </div>

                  {/* Observed Symptoms */}
                  {analysisResult.symptoms && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        Observed Visual Symptoms
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {analysisResult.symptoms[lang] || analysisResult.symptoms.en}
                      </p>
                    </div>
                  )}

                  {/* Weather Influence */}
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <Thermometer className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                        {t("disease.weather_influence")}
                      </p>
                      <p className="text-sm text-blue-950 mt-1 leading-relaxed">
                        {analysisResult.weatherInfluence[lang] || analysisResult.weatherInfluence.en}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Protocols (Tabs for Organic vs Chemical) */}
              <Card className="bg-card/95 border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      {t("disease.treatment")}
                    </CardTitle>
                    <Tabs value={activeTreatmentTab} onValueChange={(v) => setActiveTreatmentTab(v as any)} className="w-auto">
                      <TabsList className="h-9">
                        <TabsTrigger value="organic" className="text-xs h-7 px-3">
                          🌿 {lang === "hi" ? "जैविक उपचार" : lang === "mr" ? "सेंद्रिय उपाय" : "Organic / Biological"}
                        </TabsTrigger>
                        <TabsTrigger value="chemical" className="text-xs h-7 px-3">
                          🧪 {lang === "hi" ? "रासायनिक उपाय" : lang === "mr" ? "रासायनिक उपाय" : "Chemical Fungicides"}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeTreatmentTab === "organic" ? (
                    <div className="space-y-2.5">
                      {analysisResult.organicRemedies?.map((remedy, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                          <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-emerald-950 leading-relaxed">
                            {remedy[lang] || remedy.en}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {analysisResult.treatment?.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-blue-950 leading-relaxed">
                            {step[lang] || step.en}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety Precautions Alert */}
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        {t("disease.safety")}
                      </p>
                      <p className="text-xs text-amber-950 mt-0.5 leading-relaxed">
                        {analysisResult.safety[lang] || analysisResult.safety.en}
                      </p>
                    </div>
                  </div>

                  {/* API Key Notice if running in demo mode */}
                  {!analysisResult.isAiGenerated && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-600 shrink-0" />
                        <span>To analyze live camera photos of any plant with Gemini Vision, add a free API key.</span>
                      </div>
                      <Link to="/settings" className="font-semibold text-purple-700 underline shrink-0 ml-2">
                        Configure Settings →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            /* Empty State */
            <Card className="bg-card/95 border border-dashed h-full min-h-[380px] flex items-center justify-center">
              <CardContent className="text-center py-16 px-6 max-w-md">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100/60 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner mb-4">
                  🔬
                </div>
                <h3 className="font-poppins font-bold text-lg text-gray-800">
                  {selectedImage
                    ? (lang === "hi" ? "विश्लेषण शुरू करने के लिए तैयार" : lang === "mr" ? "विश्लेषण सुरू करण्यासाठी तयार" : "Ready for AI Diagnostic Scan")
                    : (lang === "hi" ? "पत्ती का फोटो अपलोड करें" : lang === "mr" ? "पानाचा फोटो अपलोड करा" : "Upload Crop Leaf Photo")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {selectedImage
                    ? (lang === "hi" ? "नीचे 'Analyze' बटन दबाकर AI पैथोलॉजी परीक्षण शुरू करें।" : lang === "mr" ? "'Analyze' बटण दाबून AI रोग निदान सुरू करा." : "Click the 'Analyze' button on the left to initiate multimodal vision pathology.")
                    : (lang === "hi" ? "अपने खेत से फसल की पत्ती की तस्वीर अपलोड करें या त्वरित परीक्षण नमूना चुनें।" : lang === "mr" ? "शेतातील पाकाचा फोटो अपलोड करा किंवा डाव्या बाजूचा चाचणी नमुना निवडा." : "Take a clear leaf photograph or select an instant specimen preset on the left.")}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Powered by Google {currentModel.name} Vision</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
