import { CropProfile, cropsDataset } from "@/data/crops";
import { CurrentWeather, DailyForecast } from "./weatherService";
import { maharashtraDistricts } from "@/data/districts";

export type SeasonType = "Kharif" | "Rabi" | "Zaid";

export interface SoilParameters {
  n: number; // 0 - 100 relative index or kg/ha
  p: number;
  k: number;
  ph: number;
}

export interface RecommendationFactor {
  isPositive: boolean;
  text: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface ComponentScores {
  climate: number;
  rainfall: number;
  temperature: number;
  soil: number;
  season: number;
  water: number;
  humidity: number;
}

export interface CropRecommendationResult {
  crop: CropProfile;
  overallScore: number; // 0 - 100
  category: "Highly Suitable" | "Suitable" | "Moderately Suitable" | "Low Suitability";
  categoryHi: string;
  categoryMr: string;
  componentScores: ComponentScores;
  explanations: RecommendationFactor[];
  warnings: string[];
}

export interface RecommendationOptions {
  district: string;
  weather?: CurrentWeather | null;
  dailyForecast?: DailyForecast[];
  soil: SoilParameters;
  season?: SeasonType;
  waterAvailability: "low" | "medium" | "high";
  farmSizeAcres?: number;
  previousCrop?: string;
  irrigationMethod?: string;
}

/**
 * Automatically determine Indian agricultural season from date
 * Kharif: June - October
 * Rabi: November - March
 * Zaid: April - May
 */
export function detectIndianSeason(date: Date = new Date()): SeasonType {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  // June (5) to October (9) -> Kharif
  if (month >= 5 && month <= 9) {
    return "Kharif";
  }
  // November (10) to March (2) -> Rabi
  if (month >= 10 || month <= 2) {
    return "Rabi";
  }
  // April (3) to May (4) -> Zaid
  return "Zaid";
}

/**
 * Normalizes a value linearly into a 0-100 score
 */
function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Calculates deterministic suitability for a specific crop profile
 */
export function evaluateCropSuitability(
  crop: CropProfile,
  options: RecommendationOptions
): CropRecommendationResult {
  const {
    district,
    weather,
    dailyForecast = [],
    soil,
    season = detectIndianSeason(),
    waterAvailability,
  } = options;

  const districtData = maharashtraDistricts.find(
    (d) => d.district.toLowerCase() === district.toLowerCase()
  );

  const explanations: RecommendationFactor[] = [];
  const warnings: string[] = [];

  // 1. CLIMATE SUITABILITY (25% weight)
  let climateScore = 75; // baseline
  const isDirectlySuitableDistrict = crop.suitableDistricts.some(
    (d) => d.toLowerCase() === district.toLowerCase()
  );

  if (isDirectlySuitableDistrict) {
    climateScore = 95;
    explanations.push({
      isPositive: true,
      text: {
        en: `${crop.name} is well-adapted to the agro-climatic conditions of ${district}.`,
        hi: `${crop.name} ${district} की कृषि-जलवायु परिस्थितियों के लिए अत्यधिक उपयुक्त है।`,
        mr: `${crop.name} हे पीक ${district} च्या कृषी-हवामान परिस्थितीसाठी अतिशय अनुकूल आहे.`,
      },
    });
  } else {
    // Check agro-zone compatibility
    const zone = districtData?.agroZone || "";
    if (zone.includes("Konkan") && crop.id === "wheat") {
      climateScore = 30;
      warnings.push(`Wheat is not recommended for coastal humid Konkan region.`);
    } else if (zone.includes("Scarcity") && crop.waterRequirement === "high") {
      climateScore = 45;
      warnings.push(`High water crops face climatic stress in scarcity zones.`);
    } else {
      climateScore = 78;
    }
  }

  // 2. RAINFALL SUITABILITY (20% weight)
  let rainfallScore = 80;
  const currentRainTotal = dailyForecast.reduce((acc, d) => acc + d.precipitationSum, 0);
  const districtRainfall = districtData?.avgRainfallMm || 800;

  // Compare district seasonal average + forecast with crop optimal rainfall
  if (districtRainfall >= crop.rainfall.optimalMin && districtRainfall <= crop.rainfall.optimalMax) {
    rainfallScore = 94;
    explanations.push({
      isPositive: true,
      text: {
        en: `Expected regional rainfall (${districtRainfall}mm) matches crop requirements (${crop.rainfall.optimalMin}-${crop.rainfall.optimalMax}mm).`,
        hi: `क्षेत्रीय वर्षा (${districtRainfall} मिमी) फसल की आवश्यकता (${crop.rainfall.optimalMin}-${crop.rainfall.optimalMax} मिमी) के अनुकूल है।`,
        mr: `प्रादेशिक पर्जन्यमान (${districtRainfall} मिमी) पिकाच्या गरजेनुसार (${crop.rainfall.optimalMin}-${crop.rainfall.optimalMax} मिमी) योग्य आहे.`,
      },
    });
  } else if (districtRainfall < crop.rainfall.optimalMin) {
    const deficit = crop.rainfall.optimalMin - districtRainfall;
    rainfallScore = Math.max(30, 85 - (deficit / 10));
    warnings.push(`Regional rainfall is slightly below the preferred optimal range (${crop.rainfall.optimalMin}mm).`);
    explanations.push({
      isPositive: false,
      text: {
        en: `Regional rainfall (${districtRainfall}mm) is lower than preferred (${crop.rainfall.optimalMin}mm); supplementary irrigation advised.`,
        hi: `क्षेत्रीय वर्षा (${districtRainfall} मिमी) आवश्यकता से कम है; पूरक सिंचाई की सलाह दी जाती है।`,
        mr: `पावसाचे प्रमाण (${districtRainfall} मिमी) पिकाच्या इष्टतम गरजेपेक्षा कमी आहे; संरक्षित पाण्याची गरज भासेल.`,
      },
    });
  } else {
    // Excessive rainfall
    if (crop.waterRequirement === "low" && districtRainfall > crop.rainfall.max) {
      rainfallScore = 40;
      warnings.push(`Excess rainfall can cause root rot or drainage issues for this crop.`);
    } else {
      rainfallScore = 82;
    }
  }

  // 3. TEMPERATURE SUITABILITY (15% weight)
  let temperatureScore = 80;
  const currentTemp = weather?.temperature ?? 27;
  const avgForecastTemp = dailyForecast.length > 0
    ? dailyForecast.reduce((acc, d) => acc + d.avgTemp, 0) / dailyForecast.length
    : currentTemp;

  if (avgForecastTemp >= crop.temperature.optimalMin && avgForecastTemp <= crop.temperature.optimalMax) {
    temperatureScore = 96;
    explanations.push({
      isPositive: true,
      text: {
        en: `Current temperature (${Math.round(currentTemp)}°C) is within the optimal range (${crop.temperature.optimalMin}-${crop.temperature.optimalMax}°C).`,
        hi: `वर्तमान तापमान (${Math.round(currentTemp)}°C) फसल के आदर्श तापमान (${crop.temperature.optimalMin}-${crop.temperature.optimalMax}°C) के अनुकूल है।`,
        mr: `सध्याचे तापमान (${Math.round(currentTemp)}°C) पिकाच्या योग्य वाढीसाठी अनुकूल (${crop.temperature.optimalMin}-${crop.temperature.optimalMax}°C) आहे.`,
      },
    });
  } else if (avgForecastTemp < crop.temperature.min || avgForecastTemp > crop.temperature.max) {
    temperatureScore = 35;
    warnings.push(`Temperature (${Math.round(avgForecastTemp)}°C) exceeds tolerance thresholds (${crop.temperature.min}-${crop.temperature.max}°C).`);
    explanations.push({
      isPositive: false,
      text: {
        en: `Ambient temperatures (${Math.round(avgForecastTemp)}°C) are stressful for ${crop.name}.`,
        hi: `तापमान (${Math.round(avgForecastTemp)}°C) ${crop.name} की वृद्धि के लिए प्रतिकूल है।`,
        mr: `तापमान (${Math.round(avgForecastTemp)}°C) ${crop.name} पिकाच्या वाढीवर ताण आणू शकते.`,
      },
    });
  } else {
    temperatureScore = 75;
  }

  // 4. SOIL SUITABILITY (15% weight)
  let soilScore = 80;

  // Handle Edge Case 41: Very acidic (pH < 5) or Alkaline (pH > 8)
  if (soil.ph < 5.0) {
    soilScore = 30;
    warnings.push(`Soil is strongly acidic (pH ${soil.ph}). Liming is necessary before planting.`);
    explanations.push({
      isPositive: false,
      text: {
        en: `Soil is overly acidic (pH ${soil.ph}). Agricultural lime application required.`,
        hi: `मिट्टी अत्यधिक अम्लीय है (pH ${soil.ph})। चूना (लाइम) डालने की आवश्यकता है।`,
        mr: `माती अति-आम्लधर्मी आहे (pH ${soil.ph}). शेतात चुना वापरणे आवश्यक आहे.`,
      },
    });
  } else if (soil.ph > 8.2) {
    soilScore = 40;
    warnings.push(`Soil is strongly alkaline (pH ${soil.ph}). Gypsum or organic manure advised.`);
    explanations.push({
      isPositive: false,
      text: {
        en: `Soil is alkaline (pH ${soil.ph}). Organic manure or gypsum will help moderate pH.`,
        hi: `मिट्टी क्षारीय है (pH ${soil.ph})। जिप्सम या जैविक खाद का प्रयोग करें।`,
        mr: `माती क्षारयुक्त आहे (pH ${soil.ph}). सेंद्रिय खते किंवा जिप्समचा वापर करा.`,
      },
    });
  } else if (soil.ph >= crop.soilPH.optimalMin && soil.ph <= crop.soilPH.optimalMax) {
    soilScore = 95;
    explanations.push({
      isPositive: true,
      text: {
        en: `Soil pH (${soil.ph}) is in the preferred range (${crop.soilPH.optimalMin}-${crop.soilPH.optimalMax}).`,
        hi: `मिट्टी का pH (${soil.ph}) उपयुक्त सीमा (${crop.soilPH.optimalMin}-${crop.soilPH.optimalMax}) में है।`,
        mr: `मातीचा सामू / pH (${soil.ph}) पिकाच्या अनुकूल कक्षेत (${crop.soilPH.optimalMin}-${crop.soilPH.optimalMax}) आहे.`,
      },
    });
  } else {
    soilScore = 72;
  }

  // NPK adjustments
  const isLegume = ["soybean", "tur", "chana", "moong", "urad", "groundnut"].includes(crop.id);
  if (isLegume) {
    if (soil.n < 50) {
      // Legumes do well in low N soils and restore fertility
      soilScore = Math.min(100, soilScore + 5);
      explanations.push({
        isPositive: true,
        text: {
          en: `As a legume, ${crop.name} fixes atmospheric nitrogen, enriching soil fertility.`,
          hi: `दलहनी फसल होने के कारण, ${crop.name} मिट्टी में प्राकृतिक रूप से नाइट्रोजन बढ़ाएगी।`,
          mr: `कडधान्य पीक असल्यामुळे, ${crop.name} हवेतील नायट्रोजन जमिनीत स्थिर करून सुपीकता वाढवेल.`,
        },
      });
    }
  } else {
    if (soil.n < crop.nitrogen.optimalMin) {
      soilScore -= 10;
      warnings.push(`Soil nitrogen is lower than optimal; basal fertilizer required.`);
    }
  }

  // 5. SEASON SUITABILITY (10% weight)
  let seasonScore = 20;
  if (crop.seasons.includes(season)) {
    seasonScore = 98;
    explanations.push({
      isPositive: true,
      text: {
        en: `Current season (${season}) aligns perfectly with crop calendar.`,
        hi: `वर्तमान मौसम (${season}) फसल के बुवाई चक्र से मेल खाता है।`,
        mr: `सध्याचा हंगाम (${season}) या पिकाच्या पेरणीसाठी तंतोतंत योग्य आहे.`,
      },
    });
  } else {
    seasonScore = 25;
    warnings.push(`${crop.name} is conventionally grown in ${crop.seasons.join(" / ")}, not in ${season}.`);
    explanations.push({
      isPositive: false,
      text: {
        en: `Not recommended for ${season} season; preferred seasons: ${crop.seasons.join(", ")}.`,
        hi: `${season} मौसम के लिए अनुशंसित नहीं; उपयुक्त मौसम: ${crop.seasons.join(", ")}।`,
        mr: `${season} हंगामासाठी शिफारस नाही; योग्य हंगाम: ${crop.seasons.join(", ")}.`,
      },
    });
  }

  // 6. WATER SUITABILITY (10% weight)
  let waterScore = 80;
  if (crop.waterRequirement === waterAvailability) {
    waterScore = 95;
    explanations.push({
      isPositive: true,
      text: {
        en: `Crop water requirement (${crop.waterRequirement}) matches available water.`,
        hi: `फसल की पानी की आवश्यकता (${crop.waterRequirement}) उपलब्ध पानी से मेल खाती है।`,
        mr: `पिकाची पाण्याची गरज (${crop.waterRequirement}) उपलब्ध पाण्याशी जुळते.`,
      },
    });
  } else if (crop.waterRequirement === "low" && (waterAvailability === "medium" || waterAvailability === "high")) {
    waterScore = 90;
    explanations.push({
      isPositive: true,
      text: {
        en: `Low water requirement; readily managed with available water resources.`,
        hi: `कम पानी की आवश्यकता; उपलब्ध संसाधनों में आसानी से प्रबंधित की जा सकती है।`,
        mr: `कमी पाण्याची गरज; उपलब्ध सिंचन सुविधेत उत्तम व्यवस्थापन शक्य आहे.`,
      },
    });
  } else if (crop.waterRequirement === "high" && waterAvailability === "low") {
    waterScore = 25;
    warnings.push(`Crop requires high water, but farm water availability is low.`);
    explanations.push({
      isPositive: false,
      text: {
        en: `High water demand exceeds low water availability; high risk without assured irrigation.`,
        hi: `फसल को अधिक पानी चाहिए लेकिन उपलब्धता कम है; बिना सिंचाई भारी जोखिम।`,
        mr: `जास्त पाण्याची आवश्यकता व कमी उपलब्धतेमुळे पिकाला मोठा धोका होऊ शकतो.`,
      },
    });
  } else {
    waterScore = 65;
  }

  // 7. HUMIDITY SUITABILITY (5% weight)
  let humidityScore = 80;
  const currentHumidity = weather?.humidity ?? 65;
  if (currentHumidity >= crop.humidity.min && currentHumidity <= crop.humidity.max) {
    humidityScore = 92;
  } else if (currentHumidity > crop.humidity.max) {
    humidityScore = 55;
    warnings.push(`High humidity increases disease vulnerability for ${crop.name}.`);
  } else {
    humidityScore = 65;
  }

  // Normalize component scores
  const componentScores: ComponentScores = {
    climate: clamp(climateScore),
    rainfall: clamp(rainfallScore),
    temperature: clamp(temperatureScore),
    soil: clamp(soilScore),
    season: clamp(seasonScore),
    water: clamp(waterScore),
    humidity: clamp(humidityScore),
  };

  // Weighted formula from Specification section 14:
  // 25% Climate + 20% Rainfall + 15% Temp + 15% Soil + 10% Season + 10% Water + 5% Humidity
  const overallScore = clamp(
    0.25 * componentScores.climate +
    0.20 * componentScores.rainfall +
    0.15 * componentScores.temperature +
    0.15 * componentScores.soil +
    0.10 * componentScores.season +
    0.10 * componentScores.water +
    0.05 * componentScores.humidity
  );

  // Determine Category per Specification section 15
  let category: CropRecommendationResult["category"] = "Low Suitability";
  let categoryHi = "कम उपयुक्त";
  let categoryMr = "कमी योग्यता";

  if (overallScore >= 80) {
    category = "Highly Suitable";
    categoryHi = "अत्यधिक उपयुक्त";
    categoryMr = "अत्यंत योग्य";
  } else if (overallScore >= 60) {
    category = "Suitable";
    categoryHi = "उपयुक्त";
    categoryMr = "योग्य";
  } else if (overallScore >= 40) {
    category = "Moderately Suitable";
    categoryHi = "मध्यम उपयुक्त";
    categoryMr = "मध्यम योग्य";
  }

  return {
    crop,
    overallScore,
    category,
    categoryHi,
    categoryMr,
    componentScores,
    explanations,
    warnings,
  };
}

/**
 * Evaluates all crops and returns sorted by overall suitability score (descending)
 */
export function getRankedCropRecommendations(options: RecommendationOptions): CropRecommendationResult[] {
  const results = cropsDataset.map((crop) => evaluateCropSuitability(crop, options));
  // Sort descending
  return results.sort((a, b) => b.overallScore - a.overallScore);
}
