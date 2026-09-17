import { useState, useMemo } from "react";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { useSoil } from "@/contexts/SoilContext";
import { useWeather } from "@/hooks/useWeather";
import {
  detectIndianSeason,
  getRankedCropRecommendations,
  CropRecommendationResult,
  SeasonType,
  SoilParameters,
} from "@/services/cropRecommendationService";

interface UseCropRecommendationOptions {
  customDistrict?: string;
  customSeason?: SeasonType;
  customSoil?: SoilParameters;
}

export function useCropRecommendation(options?: UseCropRecommendationOptions) {
  const { location } = useFarmLocation();
  const { soil: contextSoil, waterAvailability } = useSoil();

  const [manualSeason, setManualSeason] = useState<SeasonType | null>(options?.customSeason ?? null);
  const currentAutoSeason = useMemo(() => detectIndianSeason(), []);
  const activeSeason = manualSeason || currentAutoSeason;

  const activeDistrict = options?.customDistrict || location.district || "Pune";

  // Weather query for the location
  const { weather, loading: weatherLoading } = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    district: activeDistrict,
  });

  const activeSoil = options?.customSoil || contextSoil;

  // Recalculate deterministic recommendations only when inputs change
  const rankedCrops: CropRecommendationResult[] = useMemo(() => {
    return getRankedCropRecommendations({
      district: activeDistrict,
      weather: weather?.current ?? null,
      dailyForecast: weather?.daily ?? [],
      soil: activeSoil,
      season: activeSeason,
      waterAvailability: waterAvailability,
    });
  }, [activeDistrict, weather, activeSoil, activeSeason, waterAvailability]);

  const topCrop = rankedCrops.length > 0 ? rankedCrops[0] : null;

  return {
    rankedCrops,
    topCrop,
    season: activeSeason,
    autoSeason: currentAutoSeason,
    setSeason: setManualSeason,
    weather,
    weatherLoading,
    soil: activeSoil,
    waterAvailability,
    district: activeDistrict,
  };
}
