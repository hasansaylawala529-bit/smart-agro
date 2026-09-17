import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { maharashtraDistricts } from "@/data/districts";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { MapPin, Navigation, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { location, setLocation, detectLocation, isDetecting, error, clearError } = useFarmLocation();
  const { language } = useLanguage();
  const lang = language as Language;

  const [selectedDistrict, setSelectedDistrict] = useState(location.district);
  const [selectedTaluka, setSelectedTaluka] = useState(location.taluka || "");
  const [villageInput, setVillageInput] = useState(location.village || "");

  const currentDistrictObj =
    maharashtraDistricts.find(
      (d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()
    ) || maharashtraDistricts[0];

  const handleDistrictChange = (val: string) => {
    setSelectedDistrict(val);
    const dObj = maharashtraDistricts.find((d) => d.district === val);
    if (dObj && dObj.talukas.length > 0) {
      setSelectedTaluka(dObj.talukas[0]);
    }
  };

  const handleApply = () => {
    setLocation({
      district: currentDistrictObj.district,
      taluka: selectedTaluka || currentDistrictObj.talukas[0] || "",
      village: villageInput.trim() || currentDistrictObj.district,
      formattedAddress: `${villageInput.trim() || selectedTaluka || currentDistrictObj.district}, ${currentDistrictObj.district}, Maharashtra, India`,
      latitude: currentDistrictObj.lat,
      longitude: currentDistrictObj.lon,
      isAutoDetected: false,
    });
    toast({
      title: lang === "hi" ? "स्थान अपडेट हुआ" : lang === "mr" ? "स्थान बदलले" : "Location Updated",
      description: `${currentDistrictObj.district}, Maharashtra`,
    });
    onClose();
  };

  const handleGPSDetect = async () => {
    clearError();
    await detectLocation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {lang === "hi" ? "खेत का स्थान चुनें" : lang === "mr" ? "शेताचे स्थान निवडा" : "Select Farm Location"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {lang === "hi"
                  ? "सटीक मौसम और फसल सिफारिशों के लिए अपना जिला चुनें"
                  : lang === "mr"
                  ? "अचूक हवामान आणि पीक शिफारसींसाठी आपला जिल्हा निवडा"
                  : "Accurate weather and crop suitability depend on your farm's location."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Option A: Browser GPS */}
          <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-primary" />
                  {lang === "hi" ? "विकल्प 1 — ऑटो GPS डिटेक्शन" : lang === "mr" ? "पर्याय १ — स्वयंचलित GPS" : "Option A — Auto GPS Detection"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "hi" ? "ब्राउज़र से वर्तमान सटीक स्थान प्राप्त करें" : lang === "mr" ? "ब्राउझरवरून शेताचे अचूक स्थान मिळवा" : "Use device GPS for local coordinates"}
                </p>
              </div>

              <Button
                size="sm"
                onClick={handleGPSDetect}
                disabled={isDetecting}
                className="shrink-0 bg-primary hover:bg-primary/90"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    {lang === "hi" ? "खोज रहे हैं..." : lang === "mr" ? "शोधत आहे..." : "Detecting..."}
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5 mr-1" />
                    {lang === "hi" ? "GPS चालू करें" : lang === "mr" ? "GPS सुरू करा" : "Detect GPS"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] uppercase font-bold text-muted-foreground absolute">
              {lang === "hi" ? "या मैन्युअल रूप से चुनें" : lang === "mr" ? "किंवा स्वतः निवडा" : "Or Select Manually"}
            </span>
          </div>

          {/* Option B: Manual District Selection (All 36 Maharashtra Districts) */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {lang === "hi" ? "महाराष्ट्र जिला (36 जिले)" : lang === "mr" ? "महाराष्ट्र जिल्हा (३६ जिल्हे)" : "Maharashtra District (All 36 Districts)"}
              </Label>
              <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {maharashtraDistricts.map((d) => (
                    <SelectItem key={d.district} value={d.district}>
                      {d.district} {lang === "hi" ? `(${d.districtHi})` : lang === "mr" ? `(${d.districtMr})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === "hi" ? "तालुका / तहसील" : lang === "mr" ? "तालुका" : "Taluka / Tehsil"}
                </Label>
                <Select value={selectedTaluka} onValueChange={setSelectedTaluka}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Taluka" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {currentDistrictObj.talukas.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === "hi" ? "गांव / इलाका" : lang === "mr" ? "गाव / वस्ती" : "Village / Area (Optional)"}
                </Label>
                <Input
                  value={villageInput}
                  onChange={(e) => setVillageInput(e.target.value)}
                  placeholder="e.g. Khed"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
              <p className="font-medium text-foreground">
                📍 {lang === "hi" ? "चयनित कृषि-जलवायु क्षेत्र:" : lang === "mr" ? "निवडलेला कृषी-हवामान विभाग:" : "Selected Agro-Zone:"}
              </p>
              <p className="text-primary font-medium mt-0.5">{currentDistrictObj.agroZone}</p>
              <p className="mt-0.5">{lang === "hi" ? "मिट्टी:" : lang === "mr" ? "मातीचा प्रकार:" : "Primary Soil:"} {currentDistrictObj.primarySoil}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {lang === "hi" ? "रद्द करें" : lang === "mr" ? "रद्द करा" : "Cancel"}
          </Button>
          <Button size="sm" onClick={handleApply} className="bg-primary hover:bg-primary/90">
            <Check className="h-4 w-4 mr-1.5" />
            {lang === "hi" ? "लागू करें" : lang === "mr" ? "लागू करा" : "Set Farm Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
