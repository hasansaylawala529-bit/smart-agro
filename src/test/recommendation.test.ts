import { describe, it, expect } from "vitest";
import { cropsDataset, getCropById } from "@/data/crops";
import { maharashtraDistricts } from "@/data/districts";
import {
  evaluateCropSuitability,
  detectIndianSeason,
  getRankedCropRecommendations,
} from "@/services/cropRecommendationService";
import { generateAgriculturalInsights, CurrentWeather, DailyForecast } from "@/services/weatherService";
import { findNearestDistrict } from "@/services/locationService";

describe("Maharashtra Districts Dataset", () => {
  it("should contain all 36 Maharashtra districts", () => {
    expect(maharashtraDistricts.length).toBe(36);
  });

  it("should resolve nearest district from coordinates", () => {
    // Coordinates near Pune (18.5204, 73.8567)
    const district = findNearestDistrict(18.52, 73.85);
    expect(district.district).toBe("Pune");

    // Coordinates near Nagpur (21.1458, 79.0882)
    const nagpur = findNearestDistrict(21.15, 79.09);
    expect(nagpur.district).toBe("Nagpur");
  });
});

describe("Crops Dataset", () => {
  it("should have at least 16 verified Indian/Maharashtra crops", () => {
    expect(cropsDataset.length).toBeGreaterThanOrEqual(16);
  });

  it("should include key crops: Soybean, Cotton, Rice, Wheat, Tur, Chana, Maize, Sugarcane", () => {
    const requiredCrops = ["soybean", "cotton", "rice", "wheat", "tur", "chana", "maize", "sugarcane"];
    for (const cropId of requiredCrops) {
      const crop = getCropById(cropId);
      expect(crop).toBeDefined();
      expect(crop?.name).toBeTruthy();
      expect(crop?.seasons.length).toBeGreaterThan(0);
      expect(crop?.temperature.optimalMin).toBeLessThan(crop!.temperature.optimalMax);
      expect(crop?.rainfall.optimalMin).toBeLessThan(crop!.rainfall.optimalMax);
    }
  });
});

describe("Deterministic Crop Scoring Algorithm", () => {
  const mockWeather: CurrentWeather = {
    temperature: 26,
    humidity: 68,
    windSpeed: 12,
    windDirection: 180,
    weatherCode: 2,
    weatherDescription: "Partly Cloudy",
    icon: "⛅",
    feelsLike: 27,
    precipitation: 0,
    cloudCover: 30,
    pressure: 1012,
    uvIndex: 6,
    isDay: true,
  };

  const mockDaily: DailyForecast[] = [
    {
      date: "2026-07-15",
      maxTemp: 29,
      minTemp: 21,
      avgTemp: 25,
      weatherCode: 2,
      weatherDescription: "Partly Cloudy",
      icon: "⛅",
      precipitationProbability: 30,
      precipitationSum: 1.5,
      humidity: 65,
      windSpeedMax: 18,
      uvIndexMax: 7,
      sunrise: "06:00",
      sunset: "19:00",
    },
    {
      date: "2026-07-16",
      maxTemp: 28,
      minTemp: 20,
      avgTemp: 24,
      weatherCode: 61,
      weatherDescription: "Slight rain",
      icon: "🌧️",
      precipitationProbability: 60,
      precipitationSum: 8.0,
      humidity: 75,
      windSpeedMax: 15,
      uvIndexMax: 6,
      sunrise: "06:00",
      sunset: "19:00",
    },
  ];

  it("should score Soybean high in Nagpur during Kharif with balanced soil", () => {
    const soybean = getCropById("soybean")!;
    const result = evaluateCropSuitability(soybean, {
      district: "Nagpur",
      weather: mockWeather,
      dailyForecast: mockDaily,
      soil: { n: 65, p: 55, k: 50, ph: 6.8 },
      season: "Kharif",
      waterAvailability: "medium",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("Highly Suitable");
    expect(result.explanations.some((e) => e.isPositive)).toBe(true);
  });

  it("should penalize Wheat when evaluated in Kharif season (seasonal mismatch)", () => {
    const wheat = getCropById("wheat")!;
    const kharifResult = evaluateCropSuitability(wheat, {
      district: "Nashik",
      weather: mockWeather,
      dailyForecast: mockDaily,
      soil: { n: 60, p: 50, k: 50, ph: 6.8 },
      season: "Kharif",
      waterAvailability: "medium",
    });

    const rabiResult = evaluateCropSuitability(wheat, {
      district: "Nashik",
      weather: { ...mockWeather, temperature: 20 },
      dailyForecast: mockDaily.map((d) => ({ ...d, maxTemp: 22, minTemp: 14, avgTemp: 18 })),
      soil: { n: 60, p: 50, k: 50, ph: 6.8 },
      season: "Rabi",
      waterAvailability: "medium",
    });

    expect(rabiResult.overallScore).toBeGreaterThan(kharifResult.overallScore);
    expect(kharifResult.warnings.length).toBeGreaterThan(0);
  });

  it("should rank crops properly in descending order of suitability", () => {
    const ranked = getRankedCropRecommendations({
      district: "Pune",
      weather: mockWeather,
      dailyForecast: mockDaily,
      soil: { n: 70, p: 40, k: 45, ph: 6.5 },
      season: "Kharif",
      waterAvailability: "medium",
    });

    expect(ranked.length).toBe(cropsDataset.length);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].overallScore).toBeGreaterThanOrEqual(ranked[i + 1].overallScore);
    }
  });
});

describe("Edge Cases (Spec Section 41)", () => {
  const soybean = getCropById("soybean")!;

  it("handles highly acidic soil (pH < 5) with warning and reduced score", () => {
    const result = evaluateCropSuitability(soybean, {
      district: "Pune",
      soil: { n: 50, p: 50, k: 50, ph: 4.2 },
      season: "Kharif",
      waterAvailability: "medium",
    });

    expect(result.componentScores.soil).toBeLessThanOrEqual(40);
    expect(result.warnings.some((w) => w.toLowerCase().includes("acidic"))).toBe(true);
  });

  it("handles alkaline soil (pH > 8) with warning and reduced score", () => {
    const result = evaluateCropSuitability(soybean, {
      district: "Pune",
      soil: { n: 50, p: 50, k: 50, ph: 8.8 },
      season: "Kharif",
      waterAvailability: "medium",
    });

    expect(result.componentScores.soil).toBeLessThanOrEqual(45);
    expect(result.warnings.some((w) => w.toLowerCase().includes("alkaline"))).toBe(true);
  });

  it("handles water deficit when high-water crop faces low water availability", () => {
    const sugarcane = getCropById("sugarcane")!;
    const result = evaluateCropSuitability(sugarcane, {
      district: "Solapur",
      soil: { n: 70, p: 60, k: 60, ph: 7.0 },
      season: "Kharif",
      waterAvailability: "low",
    });

    expect(result.componentScores.water).toBeLessThanOrEqual(30);
    expect(result.warnings.some((w) => w.toLowerCase().includes("water"))).toBe(true);
  });
});

describe("Agricultural Weather Intelligence (Spec Section 10 & 22)", () => {
  it("triggers rain advisory and delay irrigation when rain is expected tomorrow", () => {
    const current: CurrentWeather = {
      temperature: 28,
      humidity: 70,
      windSpeed: 10,
      windDirection: 90,
      weatherCode: 1,
      weatherDescription: "Mainly Clear",
      icon: "🌤️",
      feelsLike: 29,
      precipitation: 0,
      cloudCover: 20,
      pressure: 1010,
      uvIndex: 5,
      isDay: true,
    };

    const dailyWithRainTomorrow: DailyForecast[] = [
      {
        date: "2026-08-01",
        maxTemp: 30,
        minTemp: 22,
        avgTemp: 26,
        weatherCode: 1,
        weatherDescription: "Mainly Clear",
        icon: "🌤️",
        precipitationProbability: 10,
        precipitationSum: 0,
        humidity: 60,
        windSpeedMax: 12,
        uvIndexMax: 8,
        sunrise: "",
        sunset: "",
      },
      {
        date: "2026-08-02",
        maxTemp: 27,
        minTemp: 21,
        avgTemp: 24,
        weatherCode: 63,
        weatherDescription: "Moderate Rain",
        icon: "🌧️",
        precipitationProbability: 75,
        precipitationSum: 14.5,
        humidity: 85,
        windSpeedMax: 20,
        uvIndexMax: 5,
        sunrise: "",
        sunset: "",
      },
    ];

    const insights = generateAgriculturalInsights(current, dailyWithRainTomorrow);
    expect(insights.rainExpectedTomorrow).toBe(true);
    expect(insights.irrigationAction).toBe("delay");
    expect(insights.advisories.some((a) => a.id === "rain_expected")).toBe(true);
  });

  it("triggers fungal disease risk warning when humidity is very high (>80%)", () => {
    const humidCurrent: CurrentWeather = {
      temperature: 27,
      humidity: 86,
      windSpeed: 8,
      windDirection: 90,
      weatherCode: 3,
      weatherDescription: "Overcast",
      icon: "☁️",
      feelsLike: 29,
      precipitation: 0.5,
      cloudCover: 90,
      pressure: 1008,
      uvIndex: 3,
      isDay: true,
    };

    const insights = generateAgriculturalInsights(humidCurrent, []);
    expect(insights.fungalDiseaseRisk).toBe("high");
    expect(insights.advisories.some((a) => a.id === "high_humidity")).toBe(true);
  });

  it("triggers heat stress advisory when maximum temperature exceeds 36°C", () => {
    const hotCurrent: CurrentWeather = {
      temperature: 38,
      humidity: 35,
      windSpeed: 14,
      windDirection: 270,
      weatherCode: 0,
      weatherDescription: "Clear sky",
      icon: "☀️",
      feelsLike: 40,
      precipitation: 0,
      cloudCover: 0,
      pressure: 1006,
      uvIndex: 9,
      isDay: true,
    };

    const dailyHot: DailyForecast[] = [
      {
        date: "2026-05-10",
        maxTemp: 41,
        minTemp: 26,
        avgTemp: 33,
        weatherCode: 0,
        weatherDescription: "Clear sky",
        icon: "☀️",
        precipitationProbability: 0,
        precipitationSum: 0,
        humidity: 30,
        windSpeedMax: 15,
        uvIndexMax: 10,
        sunrise: "",
        sunset: "",
      },
    ];

    const insights = generateAgriculturalInsights(hotCurrent, dailyHot);
    expect(insights.heatStressRisk).toBe(true);
    expect(insights.advisories.some((a) => a.id === "high_temp")).toBe(true);
  });
});
