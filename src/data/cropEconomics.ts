/**
 * Agronomic Economic Profiles and Cost of Cultivation Benchmarks for Maharashtra Crops
 * References:
 * - Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare, GoI
 * - Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri Cost of Cultivation Studies
 * - Commission for Agricultural Costs and Prices (CACP) Price & MSP Recommendations 2024-2026
 * - APMC Maharashtra benchmark market indices
 */

export interface InputCostBreakdown {
  seeds: number; // ₹/acre
  fertilizer: number; // ₹/acre (DAP, Urea, MOP, micronutrients, FYM)
  protection: number; // ₹/acre (pesticides, fungicides, weedicides)
  irrigation: number; // ₹/acre (irrigation water, electricity, diesel pump fuel)
  laborAndMachinery: number; // ₹/acre (land prep, tractor tillage, sowing, weeding, harvesting, threshing)
}

export interface CropEconomicProfile {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  emoji: string;
  season: "Kharif" | "Rabi" | "Zaid" | "Annual";
  unit: "qtl" | "ton";
  benchmarkYield: number; // Expected yield per acre
  minYield: number;
  maxYield: number;
  benchmarkPrice: number; // ₹ per quintal or ton
  priceType: "MSP" | "APMC Benchmark" | "FRP";
  defaultCosts: InputCostBreakdown;
  marketVolatilityRisk: "Low" | "Moderate" | "High";
  intercropOptions?: {
    companionCropId: string;
    companionName: string;
    ratio: string;
    acreageSplit: number; // e.g. 0.20 for 20% companion
    synergyNotes: { en: string; hi: string; mr: string };
  }[];
}

export const cropEconomicsDataset: CropEconomicProfile[] = [
  {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    nameMr: "सोयाबीन",
    emoji: "🫘",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 20,
    minYield: 14,
    maxYield: 26,
    benchmarkPrice: 4892, // Current MSP / APMC benchmark
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 2600,
      fertilizer: 3400,
      protection: 2400,
      irrigation: 1500,
      laborAndMachinery: 6800,
    },
    intercropOptions: [
      {
        companionCropId: "tur",
        companionName: "Tur (Pigeon Pea)",
        ratio: "4:2 or 3:1 Row Pattern",
        acreageSplit: 0.25,
        synergyNotes: {
          en: "Soybean fixes nitrogen early; deep-rooted Tur matures later and mitigates monsoon dry spells.",
          hi: "सोयाबीन प्रारंभिक नाइट्रोजन देता है; गहरी जड़ों वाली अरहर बाद में पकती है और सूखे से बचाती है।",
          mr: "सोयाबीन लवकर नत्र पुरवठा करतो; खोल मुळांची तूर उशिरा पक्व होऊन पावसाच्या खंडाला तोंड देते.",
        },
      },
    ],
  },
  {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    nameMr: "कापूस",
    emoji: "🌿",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 12,
    minYield: 7,
    maxYield: 18,
    benchmarkPrice: 7121, // Medium/long staple MSP
    priceType: "MSP",
    marketVolatilityRisk: "High",
    defaultCosts: {
      seeds: 1900,
      fertilizer: 4600,
      protection: 5200,
      irrigation: 2500,
      laborAndMachinery: 11500, // Multi-phase hand picking is labor intensive
    },
    intercropOptions: [
      {
        companionCropId: "urad",
        companionName: "Urad (Black Gram)",
        ratio: "6:1 or 8:2 Row Pattern",
        acreageSplit: 0.15,
        synergyNotes: {
          en: "Urad provides early cash income in 65 days and covers inter-row weeds.",
          hi: "उड़द 65 दिनों में अतिरिक्त आय देती है और खरपतवार नियंत्रित करती है।",
          mr: "उडीद ६५ दिवसांत लवकर आर्थिक उत्पन्न देतो आणि तण नियंत्रण करतो.",
        },
      },
    ],
  },
  {
    id: "rice",
    name: "Rice (Paddy)",
    nameHi: "धान (चावल)",
    nameMr: "भात (धान)",
    emoji: "🌾",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 24,
    minYield: 16,
    maxYield: 30,
    benchmarkPrice: 2300,
    priceType: "MSP",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 1600,
      fertilizer: 3600,
      protection: 1800,
      irrigation: 3200,
      laborAndMachinery: 12500, // Nursery, puddling, transplanting & threshing
    },
  },
  {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    nameMr: "गहू",
    emoji: "🌾",
    season: "Rabi",
    unit: "qtl",
    benchmarkYield: 22,
    minYield: 15,
    maxYield: 28,
    benchmarkPrice: 2275,
    priceType: "MSP",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 2100,
      fertilizer: 3900,
      protection: 1200,
      irrigation: 3600,
      laborAndMachinery: 6400,
    },
  },
  {
    id: "tur",
    name: "Tur (Pigeon Pea)",
    nameHi: "अरहर (तूर)",
    nameMr: "तूर (अरहर)",
    emoji: "🌱",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 11,
    minYield: 6,
    maxYield: 16,
    benchmarkPrice: 7550,
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 1300,
      fertilizer: 2900,
      protection: 3600,
      irrigation: 1400,
      laborAndMachinery: 6200,
    },
  },
  {
    id: "chana",
    name: "Chana (Chickpea)",
    nameHi: "चना",
    nameMr: "हरभरा (चना)",
    emoji: "🫛",
    season: "Rabi",
    unit: "qtl",
    benchmarkYield: 13,
    minYield: 8,
    maxYield: 18,
    benchmarkPrice: 5440,
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 3200,
      fertilizer: 2600,
      protection: 2400,
      irrigation: 1600,
      laborAndMachinery: 5800,
    },
  },
  {
    id: "maize",
    name: "Maize",
    nameHi: "मक्का",
    nameMr: "मका",
    emoji: "🌽",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 30,
    minYield: 20,
    maxYield: 40,
    benchmarkPrice: 2225,
    priceType: "MSP",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 2500,
      fertilizer: 4400,
      protection: 2800,
      irrigation: 2600,
      laborAndMachinery: 6900,
    },
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    nameMr: "ऊस",
    emoji: "🎋",
    season: "Annual",
    unit: "ton",
    benchmarkYield: 55,
    minYield: 38,
    maxYield: 75,
    benchmarkPrice: 3400, // Fair and Remunerative Price (FRP) per metric ton
    priceType: "FRP",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 12500, // High sett volume & planting material
      fertilizer: 14500, // Heavy feeder over 12-14 month cycle
      protection: 4800,
      irrigation: 15500, // Perennial water cycles
      laborAndMachinery: 22500, // Earthing up, tying, cutting, transport
    },
  },
  {
    id: "jowar",
    name: "Jowar (Sorghum)",
    nameHi: "ज्वार",
    nameMr: "ज्वारी",
    emoji: "🌾",
    season: "Rabi",
    unit: "qtl",
    benchmarkYield: 15,
    minYield: 9,
    maxYield: 20,
    benchmarkPrice: 3450, // Maldandi food grain premium
    priceType: "APMC Benchmark",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 900,
      fertilizer: 2300,
      protection: 1100,
      irrigation: 1200,
      laborAndMachinery: 5200,
    },
  },
  {
    id: "bajra",
    name: "Bajra (Pearl Millet)",
    nameHi: "बाजरा",
    nameMr: "बाजरी",
    emoji: "🌾",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 14,
    minYield: 8,
    maxYield: 18,
    benchmarkPrice: 2625,
    priceType: "MSP",
    marketVolatilityRisk: "Low",
    defaultCosts: {
      seeds: 800,
      fertilizer: 1900,
      protection: 900,
      irrigation: 900,
      laborAndMachinery: 4600,
    },
  },
  {
    id: "groundnut",
    name: "Groundnut (Peanut)",
    nameHi: "मूंगफली",
    nameMr: "भुईमूग",
    emoji: "🥜",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 15,
    minYield: 10,
    maxYield: 22,
    benchmarkPrice: 6783,
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 5600, // Heavy seed pod cost
      fertilizer: 3700, // Includes Gypsum
      protection: 2200,
      irrigation: 2600,
      laborAndMachinery: 7800, // Digging & manual threshed pods
    },
  },
  {
    id: "onion",
    name: "Onion",
    nameHi: "प्याज",
    nameMr: "कांदा",
    emoji: "🧅",
    season: "Rabi",
    unit: "qtl",
    benchmarkYield: 100,
    minYield: 60,
    maxYield: 140,
    benchmarkPrice: 2200, // APMC seasonal average
    priceType: "APMC Benchmark",
    marketVolatilityRisk: "High",
    defaultCosts: {
      seeds: 6800,
      fertilizer: 6200,
      protection: 5300,
      irrigation: 4200,
      laborAndMachinery: 14500, // Transplanting, multiple weedings, harvest, curing
    },
  },
  {
    id: "tomato",
    name: "Tomato",
    nameHi: "टमाटर",
    nameMr: "टोमॅटो",
    emoji: "🍅",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 260,
    minYield: 150,
    maxYield: 380,
    benchmarkPrice: 1600, // Average APMC wholesale
    priceType: "APMC Benchmark",
    marketVolatilityRisk: "High",
    defaultCosts: {
      seeds: 7500, // F1 Hybrid seedlings
      fertilizer: 9500, // Water-soluble fertigation
      protection: 8500,
      irrigation: 4800,
      laborAndMachinery: 28500, // Staking trellis bamboo/wire + multiple pickings
    },
  },
  {
    id: "potato",
    name: "Potato",
    nameHi: "आलू",
    nameMr: "बटाटा",
    emoji: "🥔",
    season: "Rabi",
    unit: "qtl",
    benchmarkYield: 95,
    minYield: 60,
    maxYield: 130,
    benchmarkPrice: 1550,
    priceType: "APMC Benchmark",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 23000, // 8-10 quintals seed tubers per acre
      fertilizer: 7400,
      protection: 3800,
      irrigation: 4200,
      laborAndMachinery: 12500,
    },
  },
  {
    id: "moong",
    name: "Moong (Green Gram)",
    nameHi: "मूंग",
    nameMr: "मूग",
    emoji: "🌱",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 7,
    minYield: 4,
    maxYield: 10,
    benchmarkPrice: 8682,
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 1300,
      fertilizer: 1900,
      protection: 1600,
      irrigation: 900,
      laborAndMachinery: 4800,
    },
  },
  {
    id: "urad",
    name: "Urad (Black Gram)",
    nameHi: "उड़द",
    nameMr: "उडीद",
    emoji: "🫘",
    season: "Kharif",
    unit: "qtl",
    benchmarkYield: 7.5,
    minYield: 4.5,
    maxYield: 11,
    benchmarkPrice: 7400,
    priceType: "MSP",
    marketVolatilityRisk: "Moderate",
    defaultCosts: {
      seeds: 1400,
      fertilizer: 1900,
      protection: 1700,
      irrigation: 900,
      laborAndMachinery: 4800,
    },
  },
];

export interface FinancialCalculationResult {
  crop: CropEconomicProfile;
  farmAcres: number;
  yieldPerAcre: number;
  totalYield: number;
  sellingPricePerUnit: number;
  costsPerAcre: InputCostBreakdown;
  totalCostPerAcre: number;
  totalOperatingCost: number;
  grossRevenue: number;
  netProfit: number;
  profitPerAcre: number;
  roiPercentage: number;
  benefitCostRatio: number; // BCR = Gross Revenue / Total Operating Cost
  breakevenPricePerUnit: number; // ₹/unit to cover total expenses
  breakevenYieldPerAcre: number; // Yield/acre needed at current selling price
  isProfitable: boolean;
}

/**
 * Retrieve crop economic profile by ID
 */
export function getCropEconomics(cropId: string): CropEconomicProfile {
  const found = cropEconomicsDataset.find((c) => c.id === cropId);
  return found || cropEconomicsDataset[0]; // fallback to soybean
}

/**
 * Deterministically compute comprehensive farm financial metrics
 */
export function calculateCropFinancials(params: {
  cropId: string;
  farmAcres: number;
  customYield?: number;
  customPrice?: number;
  customCosts?: Partial<InputCostBreakdown>;
}): FinancialCalculationResult {
  const crop = getCropEconomics(params.cropId);
  const farmAcres = Math.max(0.1, params.farmAcres || 1);

  const yieldPerAcre = params.customYield !== undefined ? Math.max(0, params.customYield) : crop.benchmarkYield;
  const sellingPricePerUnit = params.customPrice !== undefined ? Math.max(0, params.customPrice) : crop.benchmarkPrice;

  // Merge custom costs with defaults
  const costsPerAcre: InputCostBreakdown = {
    seeds: params.customCosts?.seeds !== undefined ? Math.max(0, params.customCosts.seeds) : crop.defaultCosts.seeds,
    fertilizer: params.customCosts?.fertilizer !== undefined ? Math.max(0, params.customCosts.fertilizer) : crop.defaultCosts.fertilizer,
    protection: params.customCosts?.protection !== undefined ? Math.max(0, params.customCosts.protection) : crop.defaultCosts.protection,
    irrigation: params.customCosts?.irrigation !== undefined ? Math.max(0, params.customCosts.irrigation) : crop.defaultCosts.irrigation,
    laborAndMachinery: params.customCosts?.laborAndMachinery !== undefined ? Math.max(0, params.customCosts.laborAndMachinery) : crop.defaultCosts.laborAndMachinery,
  };

  const totalCostPerAcre =
    costsPerAcre.seeds +
    costsPerAcre.fertilizer +
    costsPerAcre.protection +
    costsPerAcre.irrigation +
    costsPerAcre.laborAndMachinery;

  const totalOperatingCost = Math.round(totalCostPerAcre * farmAcres);
  const totalYield = parseFloat((yieldPerAcre * farmAcres).toFixed(1));
  const grossRevenue = Math.round(totalYield * sellingPricePerUnit);
  const netProfit = grossRevenue - totalOperatingCost;
  const profitPerAcre = Math.round(netProfit / farmAcres);

  // Financial ratios
  const roiPercentage = totalOperatingCost > 0 ? parseFloat(((netProfit / totalOperatingCost) * 100).toFixed(1)) : 0;
  const benefitCostRatio = totalOperatingCost > 0 ? parseFloat((grossRevenue / totalOperatingCost).toFixed(2)) : 0;

  // Breakeven metrics
  const breakevenPricePerUnit = totalYield > 0 ? Math.round(totalOperatingCost / totalYield) : 0;
  const breakevenYieldPerAcre = sellingPricePerUnit > 0 ? parseFloat((totalCostPerAcre / sellingPricePerUnit).toFixed(1)) : 0;

  return {
    crop,
    farmAcres,
    yieldPerAcre,
    totalYield,
    sellingPricePerUnit,
    costsPerAcre,
    totalCostPerAcre,
    totalOperatingCost,
    grossRevenue,
    netProfit,
    profitPerAcre,
    roiPercentage,
    benefitCostRatio,
    breakevenPricePerUnit,
    breakevenYieldPerAcre,
    isProfitable: netProfit >= 0,
  };
}

/**
 * Compute Price Sensitivity ("What-If" Analysis)
 * Evaluates net profit under -20%, -10%, baseline, +10%, and +20% market price fluctuations
 */
export function calculatePriceSensitivity(result: FinancialCalculationResult) {
  const steps = [
    { label: "-20% Drop", factor: 0.8, scenario: "bearish" },
    { label: "-10% Dip", factor: 0.9, scenario: "moderate_down" },
    { label: "Baseline (Current)", factor: 1.0, scenario: "baseline" },
    { label: "+10% Rally", factor: 1.1, scenario: "moderate_up" },
    { label: "+20% Surge", factor: 1.2, scenario: "bullish" },
  ];

  return steps.map((step) => {
    const adjustedPrice = Math.round(result.sellingPricePerUnit * step.factor);
    const adjustedRevenue = Math.round(result.totalYield * adjustedPrice);
    const adjustedProfit = adjustedRevenue - result.totalOperatingCost;
    const adjustedROI =
      result.totalOperatingCost > 0
        ? parseFloat(((adjustedProfit / result.totalOperatingCost) * 100).toFixed(1))
        : 0;

    return {
      label: step.label,
      scenario: step.scenario,
      pricePerUnit: adjustedPrice,
      grossRevenue: adjustedRevenue,
      netProfit: adjustedProfit,
      roiPercentage: adjustedROI,
      isProfitable: adjustedProfit >= 0,
    };
  });
}
