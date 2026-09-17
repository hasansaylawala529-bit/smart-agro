/**
 * Structured Agronomic Crop Profiles for Maharashtra & Central India
 * Credible Agronomic References:
 * - Indian Council of Agricultural Research (ICAR) Crop Production Handbooks
 * - Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri Crop Advisory Bulletins
 * - Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola Kharif/Rabi Recommendations
 * - Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV), Parbhani
 */

export interface CultivationStage {
  stage: string;
  stageHi: string;
  stageMr: string;
  duration: string;
  tips: string;
}

export interface CropProfile {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  scientificName: string;
  emoji: string;
  seasons: ("Kharif" | "Rabi" | "Zaid")[];
  temperature: {
    min: number; // Biological minimum (°C) below which growth halts
    optimalMin: number; // Optimal low temperature (°C)
    optimalMax: number; // Optimal high temperature (°C)
    max: number; // Critical heat threshold (°C) above which heat stress occurs
  };
  rainfall: {
    min: number; // Minimum seasonal requirement (mm)
    optimalMin: number; // Optimal lower rainfall (mm)
    optimalMax: number; // Optimal upper rainfall (mm)
    max: number; // Maximum tolerance before waterlogging damage (mm)
  };
  humidity: {
    min: number; // %
    max: number; // %
  };
  soilPH: {
    min: number;
    optimalMin: number;
    optimalMax: number;
    max: number;
  };
  nitrogen: {
    min: number; // kg/ha equivalent or relative soil rating
    optimalMin: number;
    max: number;
  };
  phosphorus: {
    min: number;
    optimalMin: number;
    max: number;
  };
  potassium: {
    min: number;
    optimalMin: number;
    max: number;
  };
  waterRequirement: "low" | "medium" | "high";
  suitableDistricts: string[]; // Maharashtra districts with major agro-climatic fit
  description: string;
  descriptionHi: string;
  descriptionMr: string;
  growingPeriodDays: string;
  expectedYield: string;
  timeline: CultivationStage[];
  importantConsiderations: string[];
}

export const cropsDataset: CropProfile[] = [
  {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    nameMr: "सोयाबीन",
    scientificName: "Glycine max",
    emoji: "🫘",
    seasons: ["Kharif"],
    // ICAR Reference: Soybean thrives in 20-32°C; flowering impacted above 38°C
    temperature: { min: 15, optimalMin: 22, optimalMax: 30, max: 38 },
    // 600-900mm distributed rain is ideal for pod fill
    rainfall: { min: 450, optimalMin: 600, optimalMax: 900, max: 1300 },
    humidity: { min: 50, max: 85 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.5, max: 8.2 },
    nitrogen: { min: 30, optimalMin: 45, max: 90 }, // Legume; fixes nitrogen
    phosphorus: { min: 35, optimalMin: 55, max: 95 }, // High P requirement for root nodules
    potassium: { min: 30, optimalMin: 50, max: 90 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Nagpur", "Amravati", "Wardha", "Yavatmal", "Akola", "Buldhana", "Washim",
      "Latur", "Nanded", "Chhatrapati Sambhajinagar", "Jalna", "Hingoli", "Parbhani", "Kolhapur", "Sangli"
    ],
    description: "Dominant oilseed and protein cash crop across Vidarbha and Marathwada, well-suited for medium to deep black soils.",
    descriptionHi: "विदर्भ और मराठवाड़ा की प्रमुख तिलहन और नकदी फसल, मध्यम से गहरी काली मिट्टी के लिए उपयुक्त।",
    descriptionMr: "विदर्भ आणि मराठवाड्यातील प्रमुख गळीतधान्य व नगदी पीक, मध्यम ते खोल काळ्या मातीसाठी अतिशय योग्य.",
    growingPeriodDays: "95 - 110 days",
    expectedYield: "18 - 24 qtl/acre",
    timeline: [
      { stage: "Sowing & Germination", stageHi: "बुवाई और अंकुरण", stageMr: "पेरणी व उगवण", duration: "Day 1-10", tips: "Sow when soil has received at least 75-100mm monsoon rain. Treat seed with Rhizobium." },
      { stage: "Vegetative Growth", stageHi: "वानस्पतिक वृद्धि", stageMr: "शाकीय वाढ", duration: "Day 15-35", tips: "Perform first hoeing at 20 days. Monitor for stem fly and girdle beetle." },
      { stage: "Flowering & Podding", stageHi: "फूल और फली बनना", stageMr: "फुलोरा व शेंगा भरणे", duration: "Day 40-75", tips: "Critical moisture sensitivity stage. Avoid water stress." },
      { stage: "Maturity & Harvest", stageHi: "परिपक्वता और कटाई", stageMr: "पक्वता व काढणी", duration: "Day 85-105", tips: "Harvest when leaves turn yellow-brown and pods rattle." },
    ],
    importantConsiderations: [
      "Avoid sowing before 100mm cumulative monsoon showers to prevent seedling mortality.",
      "Susceptible to waterlogging; ensure ridges and furrows or broad bed furrow (BBF) drainage.",
      "Intercropping with Tur (4:2 ratio) provides yield stability during erratic monsoon spells."
    ],
  },
  {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    nameMr: "कापूस",
    scientificName: "Gossypium hirsutum",
    emoji: "🌿",
    seasons: ["Kharif"],
    // Cotton requires warm sunny weather; temp < 18°C delays squaring
    temperature: { min: 18, optimalMin: 25, optimalMax: 34, max: 42 },
    rainfall: { min: 500, optimalMin: 650, optimalMax: 1000, max: 1400 },
    humidity: { min: 45, max: 80 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 8.0, max: 8.5 },
    nitrogen: { min: 40, optimalMin: 65, max: 100 },
    phosphorus: { min: 30, optimalMin: 50, max: 90 },
    potassium: { min: 35, optimalMin: 60, max: 100 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Yavatmal", "Nagpur", "Wardha", "Amravati", "Akola", "Buldhana", "Jalgaon",
      "Dhule", "Nanded", "Parbhani", "Jalna", "Chhatrapati Sambhajinagar", "Beed"
    ],
    description: "Maharashtra's leading commercial fibre crop (White Gold) grown predominantly in rainfed and semi-irrigated black soils.",
    descriptionHi: "महाराष्ट्र की प्रमुख नकदी रेशा फसल (सफेद सोना), जो मुख्य रूप से वर्षा आधारित काली मिट्टी में उगाई जाती है।",
    descriptionMr: "महाराष्ट्रातील मुख्य व्यावसायिक नगदी पीक (पांढरे सोने), कोरडवाहू व बागायती काळ्या जमिनीत मोठ्या प्रमाणावर घेतले जाते.",
    growingPeriodDays: "150 - 180 days",
    expectedYield: "10 - 15 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-15", tips: "Maintain 90x60 cm or 120x45 cm spacing in deep black soil." },
      { stage: "Squaring & Vegetative", stageHi: "शाखा वृद्धि", stageMr: "फांद्या व पाते फुटणे", duration: "Day 30-60", tips: "Apply top-dress nitrogen. Monitor sucking pests (jassids, thrips)." },
      { stage: "Boll Development", stageHi: "टिंडे बनना", stageMr: "बोंड विकास", duration: "Day 70-120", tips: "Ensure irrigation or soil moisture conservation during boll expansion." },
      { stage: "Boll Bursting & Picking", stageHi: "चुनाई", stageMr: "बोंडे उमलणे व वेचणी", duration: "Day 130-180", tips: "Pick dry cotton in bright sunshine. Avoid trash and leaf contamination." },
    ],
    importantConsiderations: [
      "Avoid heavy standing water; cotton tap roots rot quickly under stagnant water.",
      "High pest susceptibility; integrate IPM strategies and trap crops like marigold.",
      "Requires dry sunny spells during boll bursting and harvesting."
    ],
  },
  {
    id: "rice",
    name: "Rice (Paddy)",
    nameHi: "धान (चावल)",
    nameMr: "भात (धान)",
    scientificName: "Oryza sativa",
    emoji: "🌾",
    seasons: ["Kharif"],
    // Rice needs hot humid conditions; optimal 24-33°C
    temperature: { min: 20, optimalMin: 24, optimalMax: 33, max: 40 },
    rainfall: { min: 900, optimalMin: 1200, optimalMax: 2500, max: 3500 },
    humidity: { min: 70, max: 95 },
    soilPH: { min: 5.0, optimalMin: 5.5, optimalMax: 6.8, max: 7.8 }, // Tolerates mild acidic soil
    nitrogen: { min: 50, optimalMin: 70, max: 100 },
    phosphorus: { min: 30, optimalMin: 50, max: 85 },
    potassium: { min: 30, optimalMin: 50, max: 85 },
    waterRequirement: "high",
    suitableDistricts: [
      "Ratnagiri", "Sindhudurg", "Raigad", "Thane", "Palghar", "Bhandara", "Gondia", "Gadchiroli", "Chandpur", "Kolhapur"
    ],
    description: "Thrives in heavy rainfall coastal Konkan regions and eastern Vidarbha lake-irrigated belts.",
    descriptionHi: "कोंकण के तटीय भारी वर्षा वाले क्षेत्रों और पूर्वी विदर्भ के तालाब सिंचित क्षेत्रों में सबसे उपयुक्त।",
    descriptionMr: "कोकणातील मुसळधार पावसाच्या पट्ट्यात व पूर्व विदर्भातील तलावांच्या जिल्ह्यात मोठ्या प्रमाणात पिकवले जाते.",
    growingPeriodDays: "115 - 135 days",
    expectedYield: "20 - 28 qtl/acre",
    timeline: [
      { stage: "Nursery & Transplanting", stageHi: "नर्सरी और रोपाई", stageMr: "रोपवाटिका व पुनर्लागवड", duration: "Day 1-25", tips: "Transplant 21-25 day old seedlings at 2-3 seedlings per hill." },
      { stage: "Tillering", stageHi: "कल्ले फूटना", stageMr: "फुटवे फुटणे", duration: "Day 30-55", tips: "Maintain 2-3 cm standing water. Top-dress nitrogen with zinc sulfate." },
      { stage: "Panicle Initiation & Flowering", stageHi: "बाली निकलना", stageMr: "लोंबी बाहेर पडणे", duration: "Day 60-90", tips: "Critical water stage; keep field flooded to prevent sterility." },
      { stage: "Grain Filling & Harvesting", stageHi: "दाना पकना व कटाई", stageMr: "दाणे भरणे व कापणी", duration: "Day 95-130", tips: "Drain water 10 days before harvesting when 85% grains turn golden." },
    ],
    importantConsiderations: [
      "Requires dependable water supply or heavy monsoonal rain.",
      "Thrives in acidic red lateritic soils of Konkan and heavy alluvial soils of Bhandara/Gondia.",
      "Needs zinc application in Vidarbha soils to prevent Khaira disease."
    ],
  },
  {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    nameMr: "गहू",
    scientificName: "Triticum aestivum",
    emoji: "🌾",
    seasons: ["Rabi"],
    // Cool weather crop: optimal germination 20-25°C, grain fill 15-22°C
    temperature: { min: 10, optimalMin: 15, optimalMax: 25, max: 32 },
    rainfall: { min: 150, optimalMin: 250, optimalMax: 450, max: 700 }, // Rabi irrigated crop
    humidity: { min: 35, max: 70 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.8, max: 8.4 },
    nitrogen: { min: 45, optimalMin: 70, max: 100 },
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 30, optimalMin: 50, max: 85 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Nashik", "Pune", "Ahmednagar", "Satara", "Sangli", "Kolhapur", "Solapur",
      "Nagpur", "Chhatrapati Sambhajinagar", "Jalgaon", "Dhule", "Amravati"
    ],
    description: "Premier winter cereal crop grown under assured irrigation across western Maharashtra and Khandesh.",
    descriptionHi: "पश्चिमी महाराष्ट्र और खानदेश में सुनिश्चित सिंचाई के तहत उगाई जाने वाली प्रमुख शीतकालीन रबी फसल।",
    descriptionMr: "पश्चिम महाराष्ट्र व खानदेशात बागायतीखाली घेतली जाणारी प्रमुख रब्बी तृणधान्य पीक.",
    growingPeriodDays: "105 - 120 days",
    expectedYield: "18 - 25 qtl/acre",
    timeline: [
      { stage: "Sowing & CRI Stage", stageHi: "बुवाई और पहली सिंचाई", stageMr: "पेरणी व मुकुट मूळ अवस्था", duration: "Day 1-21", tips: "First irrigation at Crown Root Initiation (21 days) is vital." },
      { stage: "Tillering & Jointing", stageHi: "कल्ले बनना", stageMr: "फुटवे व कांड्यांची वाढ", duration: "Day 30-55", tips: "Second irrigation and split dose of nitrogen application." },
      { stage: "Booting & Heading", stageHi: "बाली निकलना", stageMr: "ओंबी बाहेर पडणे", duration: "Day 60-80", tips: "Ensure irrigation; moisture deficit reduces spikelet count." },
      { stage: "Milking & Dough Stage", stageHi: "दाना भरना व पकना", stageMr: "दाणे भरणे व कापणी", duration: "Day 85-115", tips: "Irrigate gently during milk stage. Avoid lodging caused by winds." },
    ],
    importantConsiderations: [
      "Requires cooler night temperatures during December-January for maximum tillering.",
      "Terminal heat during February-March can shrivel grains; choose early maturing varieties like Lok-1 or Netravati.",
      "Requires 4-5 timely irrigations for optimum yield."
    ],
  },
  {
    id: "tur",
    name: "Tur (Pigeon Pea)",
    nameHi: "अरहर (तूर)",
    nameMr: "तूर (अरहर)",
    scientificName: "Cajanus cajan",
    emoji: "🌱",
    seasons: ["Kharif"],
    // Deep rooted legume: thrives in 22-34°C, drought tolerant
    temperature: { min: 16, optimalMin: 22, optimalMax: 32, max: 38 },
    rainfall: { min: 450, optimalMin: 600, optimalMax: 900, max: 1200 },
    humidity: { min: 45, max: 80 },
    soilPH: { min: 6.2, optimalMin: 6.5, optimalMax: 7.8, max: 8.3 },
    nitrogen: { min: 20, optimalMin: 35, max: 70 }, // Strong nitrogen fixer
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 25, optimalMin: 45, max: 80 },
    waterRequirement: "low",
    suitableDistricts: [
      "Latur", "Nanded", "Parbhani", "Hingoli", "Jalna", "Chhatrapati Sambhajinagar",
      "Akola", "Amravati", "Yavatmal", "Nagpur", "Wardha", "Buldhana", "Solapur"
    ],
    description: "Essential pulse crop of Marathwada and Vidarbha, deeply rooted and excellent for restoring soil nitrogen.",
    descriptionHi: "मराठवाड़ा और विदर्भ की प्रमुख दलहनी फसल, गहरी जड़ों वाली और मिट्टी में नाइट्रोजन सुधार के लिए आदर्श।",
    descriptionMr: "मराठवाडा व विदर्भातील प्रमुख कडधान्य पीक, खोल मुळांमुळे दुष्काळातही टिकून राहते व मातीचा कस वाढवते.",
    growingPeriodDays: "140 - 170 days",
    expectedYield: "8 - 14 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-15", tips: "Treat seed with Trichoderma and Rhizobium culture." },
      { stage: "Branching & Nodule Formation", stageHi: "शाखा निर्माण", stageMr: "फांद्यांची वाढ", duration: "Day 30-60", tips: "Nipping apical buds at 45-50 days induces profuse branching." },
      { stage: "Flowering & Pod Setting", stageHi: "फूल और फली लगना", stageMr: "फुलोरा व शेंगा लागणे", duration: "Day 80-120", tips: "Watch out for pod borer (Helicoverpa armigera) attacks." },
      { stage: "Maturity", stageHi: "परिपक्वता व कटाई", stageMr: "पक्वता व काढणी", duration: "Day 135-165", tips: "Harvest when 80% pods turn brown and dry." },
    ],
    importantConsiderations: [
      "Extremely drought tolerant due to deep tap root system.",
      "Prone to wilt in waterlogged soils; ensure well-drained loam or medium black soil.",
      "Ideal companion crop with Soybean (4:2) or Cotton (6:1 or 8:2)."
    ],
  },
  {
    id: "chana",
    name: "Chana (Chickpea)",
    nameHi: "चना",
    nameMr: "हरभरा (चना)",
    scientificName: "Cicer arietinum",
    emoji: "🫛",
    seasons: ["Rabi"],
    // Cool climate pulse; requires mild winter and dry ripening
    temperature: { min: 10, optimalMin: 18, optimalMax: 26, max: 32 },
    rainfall: { min: 200, optimalMin: 300, optimalMax: 500, max: 750 },
    humidity: { min: 30, max: 65 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.8, max: 8.5 },
    nitrogen: { min: 20, optimalMin: 35, max: 70 },
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 25, optimalMin: 45, max: 80 },
    waterRequirement: "low",
    suitableDistricts: [
      "Ahmednagar", "Solapur", "Pune", "Satara", "Chhatrapati Sambhajinagar", "Jalna",
      "Beed", "Latur", "Dharashiv (Osmanabad)", "Akola", "Amravati", "Buldhana", "Yavatmal"
    ],
    description: "Major Rabi pulse grown on conserved moisture in black soils, requiring minimal irrigation.",
    descriptionHi: "काली मिट्टी में संरक्षित नमी पर उगाई जाने वाली प्रमुख रबी दलहनी फसल, न्यूनतम पानी की आवश्यकता।",
    descriptionMr: "काळ्या जमिनीत साठलेल्या ओलाव्यावर घेतली जाणारी प्रमुख रब्बी डाळवर्गीय पीक, कमी पाण्यात उत्तम उत्पादन.",
    growingPeriodDays: "90 - 110 days",
    expectedYield: "10 - 16 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-10", tips: "Sow in October-November following Kharif harvest with soil moisture." },
      { stage: "Vegetative & Nipping", stageHi: "शाखा वृद्धि और खूंटाई", stageMr: "शाकीय वाढ व शेंडे खुडणे", duration: "Day 25-45", tips: "Nip tender terminal shoots at 30 days to stimulate bushy branches." },
      { stage: "Flowering & Podding", stageHi: "फूल और दाने बनना", stageMr: "फुलोरा व घाटे भरणे", duration: "Day 50-80", tips: "Protect against pod borer. Provide one light protective irrigation if dry." },
      { stage: "Ripening & Harvesting", stageHi: "कटाई", stageMr: "वाळणे व काढणी", duration: "Day 85-105", tips: "Harvest when plants dry up and pods rattle upon shaking." },
    ],
    importantConsiderations: [
      "Avoid heavy excessive irrigation which promotes vegetative growth at the cost of pod formation.",
      "High humidity or sudden rain during flowering causes flower drop and fungal blight.",
      "Excellent residual crop following Kharif Soybean or Maize."
    ],
  },
  {
    id: "maize",
    name: "Maize",
    nameHi: "मक्का",
    nameMr: "मका",
    scientificName: "Zea mays",
    emoji: "🌽",
    seasons: ["Kharif", "Rabi", "Zaid"],
    // Wide adaptability, optimal 20-30°C
    temperature: { min: 14, optimalMin: 20, optimalMax: 30, max: 38 },
    rainfall: { min: 400, optimalMin: 550, optimalMax: 850, max: 1200 },
    humidity: { min: 45, max: 80 },
    soilPH: { min: 5.8, optimalMin: 6.5, optimalMax: 7.5, max: 8.0 },
    nitrogen: { min: 50, optimalMin: 75, max: 100 }, // Heavy feeder
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 30, optimalMin: 50, max: 85 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Nashik", "Dhule", "Jalgaon", "Chhatrapati Sambhajinagar", "Pune", "Kolhapur",
      "Sangli", "Satara", "Ahmednagar", "Solapur", "Nagpur"
    ],
    description: "Highly productive multipurpose cereal for food, poultry feed, and starch industries.",
    descriptionHi: "खाद्य, पोल्ट्री फीड और स्टार्च उद्योग के लिए बहुउद्देश्यीय उच्च उपज वाला अनाज।",
    descriptionMr: "अन्न, कुक्कुटपालन खाद्य आणि स्टार्च उद्योगासाठी बहुउपयोगी व भरघोस उत्पादन देणारे पीक.",
    growingPeriodDays: "95 - 115 days",
    expectedYield: "25 - 35 qtl/acre",
    timeline: [
      { stage: "Sowing & Knee-High", stageHi: "बुवाई और घुटने तक वृद्धि", stageMr: "पेरणी व गुडघाभर वाढ", duration: "Day 1-30", tips: "Apply baseline NPK and maintain weed-free condition." },
      { stage: "Tasseling (Male Flower)", stageHi: "नर फूल निकलना", stageMr: "तुरा बाहेर पडणे", duration: "Day 45-60", tips: "Critical moisture sensitivity. Apply second split dose of nitrogen." },
      { stage: "Silking & Cob Filling", stageHi: "भुट्टा भरना", stageMr: "कणसात दाणे भरणे", duration: "Day 65-85", tips: "Monitor Fall Armyworm (FAW) on leaves and whorls." },
      { stage: "Physiological Maturity", stageHi: "परिपक्वता व तुड़ाई", stageMr: "पक्वता व कणसे तोडणी", duration: "Day 90-110", tips: "Harvest when cob sheath dries and black layer forms at grain base." },
    ],
    importantConsiderations: [
      "Cannot tolerate water stagnation even for 24-48 hours; needs raised beds or ridges.",
      "Monitor strictly for Fall Armyworm (Spodoptera frugiperda) during early vegetative stages.",
      "High responsive to nitrogen fertilizer."
    ],
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    nameMr: "ऊस",
    scientificName: "Saccharum officinarum",
    emoji: "🎋",
    seasons: ["Kharif", "Rabi", "Zaid"], // Year-round perennial crop
    temperature: { min: 20, optimalMin: 25, optimalMax: 35, max: 42 },
    rainfall: { min: 1000, optimalMin: 1400, optimalMax: 2200, max: 3000 },
    humidity: { min: 55, max: 90 },
    soilPH: { min: 6.2, optimalMin: 6.5, optimalMax: 7.8, max: 8.5 },
    nitrogen: { min: 60, optimalMin: 85, max: 100 },
    phosphorus: { min: 40, optimalMin: 65, max: 95 },
    potassium: { min: 45, optimalMin: 70, max: 100 },
    waterRequirement: "high",
    suitableDistricts: [
      "Kolhapur", "Sangli", "Satara", "Pune", "Ahmednagar", "Solapur",
      "Nashik", "Chhatrapati Sambhajinagar", "Jalna", "Nanded"
    ],
    description: "High-value cash crop of western Maharashtra sugar belt requiring perennial irrigation and deep fertile soils.",
    descriptionHi: "पश्चिमी महाराष्ट्र के चीनी बेल्ट की उच्च मूल्य वाली नकदी फसल, जिसके लिए भरपूर सिंचाई की आवश्यकता होती है।",
    descriptionMr: "पश्चिम महाराष्ट्रातील साखर पट्ट्यातील सर्वात मोठे नगदी पीक, बारमाही पाणी व सुपीक भारी जमिनीची गरज.",
    growingPeriodDays: "12 - 14 months",
    expectedYield: "45 - 65 tons/acre",
    timeline: [
      { stage: "Planting & Sprouting", stageHi: "रोपाई व जमाव", stageMr: "लागण व उगवण", duration: "Month 1-2", tips: "Use two-bud setts treated with fungicide. Maintain 4-5 feet furrow spacing." },
      { stage: "Tillering Phase", stageHi: "फुटाव अवस्था", stageMr: "फुटवे फुटण्याची अवस्था", duration: "Month 2-4", tips: "Earthing up and applying recommended nitrogen and biofertilizers." },
      { stage: "Grand Growth Phase", stageHi: "तीव्र वृद्धि", stageMr: "मोठी वाढीची अवस्था", duration: "Month 5-10", tips: "Regular irrigation every 8-10 days. Drip irrigation saves 40% water." },
      { stage: "Ripening & Harvesting", stageHi: "परिपक्वता व कटाई", stageMr: "पक्वता व ऊस तोडणी", duration: "Month 11-13", tips: "Withhold irrigation 15 days before harvest to maximize sugar brix." },
    ],
    importantConsiderations: [
      "Requires guaranteed perennial water source or drip irrigation.",
      "Long gestation period (12-14 months); requires substantial initial capital investment.",
      "Benefits greatly from trash mulching to retain soil moisture in summer."
    ],
  },
  {
    id: "jowar",
    name: "Jowar (Sorghum)",
    nameHi: "ज्वार",
    nameMr: "ज्वारी",
    scientificName: "Sorghum bicolor",
    emoji: "🌾",
    seasons: ["Kharif", "Rabi"],
    // Extreme drought resilience, heat tolerant up to 40°C
    temperature: { min: 15, optimalMin: 24, optimalMax: 32, max: 40 },
    rainfall: { min: 350, optimalMin: 450, optimalMax: 750, max: 1000 },
    humidity: { min: 30, max: 75 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 8.0, max: 8.5 },
    nitrogen: { min: 30, optimalMin: 50, max: 85 },
    phosphorus: { min: 25, optimalMin: 45, max: 80 },
    potassium: { min: 25, optimalMin: 45, max: 80 },
    waterRequirement: "low",
    suitableDistricts: [
      "Solapur", "Ahmednagar", "Pune", "Satara", "Sangli", "Beed", "Dharashiv (Osmanabad)",
      "Latur", "Parbhani", "Jalna", "Nanded", "Amravati", "Akola"
    ],
    description: "Maharashtra's staple nutritious millet (Maldandi is famous), unmatched in drought resilience across Scarcity zones.",
    descriptionHi: "महाराष्ट्र का मुख्य पोषक बाजरा/ज्वार (मालदांडी प्रसिद्ध है), सूखे क्षेत्रों के लिए सर्वोत्तम।",
    descriptionMr: "महाराष्ट्राचे मुख्य अन्नधान्य पीक (मालदांडी ज्वारी प्रसिद्ध), अवर्षणप्रवण भागात कोरडवाहूसाठी सर्वोत्तम पर्याय.",
    growingPeriodDays: "105 - 125 days",
    expectedYield: "12 - 18 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-12", tips: "For Rabi jowar, sow in September-October when soil temperature drops." },
      { stage: "Vegetative Growth", stageHi: "शाकीय वृद्धि", stageMr: "वाढ व पोटरी अवस्था", duration: "Day 25-50", tips: "Weeding and thinning at 20 days. Interculturing retains soil moisture." },
      { stage: "Flowering & Grain Setting", stageHi: "फूल और दाना भरना", stageMr: "कणसे भरणे", duration: "Day 60-85", tips: "Critical stage. One protective irrigation boosts yield by 35%." },
      { stage: "Maturity", stageHi: "परिपक्वता व कटाई", stageMr: "काढणी", duration: "Day 95-120", tips: "Harvest when grain is firm and bottom leaves dry out." },
    ],
    importantConsiderations: [
      "Extremely drought hardy and efficient water user.",
      "Rabi Maldandi 35-1 commands premium market price for taste and roti quality.",
      "Dual-purpose: provides nutritious grain for families and dry stover (kadbi) for cattle fodder."
    ],
  },
  {
    id: "bajra",
    name: "Bajra (Pearl Millet)",
    nameHi: "बाजरा",
    nameMr: "बाजरी",
    scientificName: "Pennisetum glaucum",
    emoji: "🌾",
    seasons: ["Kharif", "Zaid"],
    // Extreme heat and drought tolerance, grows in low rainfall zones
    temperature: { min: 18, optimalMin: 26, optimalMax: 35, max: 44 },
    rainfall: { min: 250, optimalMin: 350, optimalMax: 600, max: 900 },
    humidity: { min: 25, max: 70 },
    soilPH: { min: 5.8, optimalMin: 6.5, optimalMax: 8.0, max: 8.5 },
    nitrogen: { min: 25, optimalMin: 45, max: 80 },
    phosphorus: { min: 20, optimalMin: 40, max: 75 },
    potassium: { min: 20, optimalMin: 40, max: 75 },
    waterRequirement: "low",
    suitableDistricts: [
      "Ahmednagar", "Nashik", "Dhule", "Jalgaon", "Pune", "Satara", "Solapur", "Beed", "Chhatrapati Sambhajinagar"
    ],
    description: "Hardy, climate-resilient super-millet thriving in light, shallow soils with minimal rainfall.",
    descriptionHi: "कम वर्षा और हल्की, उथली मिट्टी में पनपने वाला बेहद सहनशील जलवायु-अनुकूल बाजरा।",
    descriptionMr: "कमी पाऊस व हलक्या जमिनीत येणारे अत्यंत काटक व पौष्टिक तृणधान्य, दुष्काळातही हमखास उत्पादन.",
    growingPeriodDays: "75 - 90 days",
    expectedYield: "12 - 16 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-10", tips: "Sow with onset of monsoon in well-pulverized shallow to medium soil." },
      { stage: "Tillering", stageHi: "फुटाव", stageMr: "फुटवे फुटणे", duration: "Day 20-35", tips: "Thinning to maintain 10-12 cm intra-row distance." },
      { stage: "Head Emergence & Flowering", stageHi: "सिट्टा निकलना", stageMr: "कणसे निसवणे", duration: "Day 40-60", tips: "Protect from downy mildew and ergot. Avoid moisture stress." },
      { stage: "Maturity", stageHi: "कटाई", stageMr: "काढणी", duration: "Day 70-85", tips: "Harvest when ears turn golden-brown and seed moisture drops below 15%." },
    ],
    importantConsiderations: [
      "Lowest water requirement among Indian coarse grains.",
      "Short duration (75-85 days) makes it ideal for late-onset monsoon scenarios.",
      "Rich in iron and zinc; high demand in urban health food markets."
    ],
  },
  {
    id: "groundnut",
    name: "Groundnut (Peanut)",
    nameHi: "मूंगफली",
    nameMr: "भुईमूग",
    scientificName: "Arachis hypogaea",
    emoji: "🥜",
    seasons: ["Kharif", "Zaid"],
    temperature: { min: 18, optimalMin: 24, optimalMax: 30, max: 36 },
    rainfall: { min: 450, optimalMin: 550, optimalMax: 800, max: 1100 },
    humidity: { min: 50, max: 80 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.5, max: 8.2 },
    nitrogen: { min: 25, optimalMin: 40, max: 75 }, // Legume
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 35, optimalMin: 55, max: 90 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Kolhapur", "Sangli", "Satara", "Pune", "Nashik", "Dhule", "Jalgaon",
      "Nanded", "Latur", "Parbhani", "Solapur"
    ],
    description: "Valuable oilseed and fodder legume requiring sandy-loam or well-drained friable soils for easy pegging.",
    descriptionHi: "मूल्यवान तिलहन और चारा दलहन, जिसे फलियों के अच्छे विकास के लिए भुरभुरी, रेतीली-दोमट मिट्टी की आवश्यकता होती है।",
    descriptionMr: "महत्त्वाचे गळीतधान्य पीक, आऱ्या जमिनीत सहज शिरण्यासाठी भुसभुशीत व निचऱ्याची जमीन आवश्यक असते.",
    growingPeriodDays: "105 - 120 days",
    expectedYield: "12 - 18 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-12", tips: "Treat kernels with Trichoderma and Rhizobium." },
      { stage: "Flowering & Pegging", stageHi: "फूल व सुइयां बनना", stageMr: "फुलोरा व आऱ्या सुटणे", duration: "Day 30-55", tips: "Critical phase! Apply gypsum (200 kg/ha) at 30 days for pod calcium." },
      { stage: "Pod Development", stageHi: "दाना भरना", stageMr: "शेंगा भरणे", duration: "Day 60-90", tips: "Ensure optimum moisture. Do not disturb pegs during hoeing." },
      { stage: "Harvesting", stageHi: "खुदाई", stageMr: "उपटणी", duration: "Day 100-115", tips: "Harvest when inner shell turns dark brown and seeds are full." },
    ],
    importantConsiderations: [
      "Avoid heavy stiff clays which hinder peg penetration and make digging difficult.",
      "Gypsum application at pegging stage is essential for calcium uptake and preventing hollow pods (pops).",
      "Summer (Zaid) groundnut under drip yields significantly higher than Kharif."
    ],
  },
  {
    id: "onion",
    name: "Onion",
    nameHi: "प्याज",
    nameMr: "कांदा",
    scientificName: "Allium cepa",
    emoji: "🧅",
    seasons: ["Kharif", "Rabi", "Zaid"], // Kharif, Late Kharif (Rangada), and Rabi
    temperature: { min: 12, optimalMin: 18, optimalMax: 28, max: 36 },
    rainfall: { min: 350, optimalMin: 500, optimalMax: 750, max: 1000 },
    humidity: { min: 45, max: 75 },
    soilPH: { min: 6.2, optimalMin: 6.5, optimalMax: 7.5, max: 8.0 },
    nitrogen: { min: 45, optimalMin: 65, max: 95 },
    phosphorus: { min: 35, optimalMin: 55, max: 90 },
    potassium: { min: 45, optimalMin: 70, max: 100 }, // High potash user for bulb firmness
    waterRequirement: "medium",
    suitableDistricts: [
      "Nashik", "Ahmednagar", "Pune", "Solapur", "Dhule", "Jalgaon",
      "Satara", "Chhatrapati Sambhajinagar", "Beed", "Dharashiv (Osmanabad)"
    ],
    description: "Maharashtra produces over 35% of India's onions; Nashik & Ahmednagar are global trade epicenters.",
    descriptionHi: "महाराष्ट्र भारत के 35% से अधिक प्याज का उत्पादन करता है; नासिक और अहमदनगर प्रमुख केंद्र हैं।",
    descriptionMr: "महाराष्ट्र देशातील ३५% पेक्षा जास्त कांदा पिकवतो; नाशिक व नगर जागतिक बाजारपेठेचे मुख्य केंद्र आहे.",
    growingPeriodDays: "110 - 130 days",
    expectedYield: "80 - 120 qtl/acre",
    timeline: [
      { stage: "Nursery to Transplanting", stageHi: "नर्सरी और रोपाई", stageMr: "रोपवाटिका व पुनर्लागवड", duration: "Day 1-45", tips: "Transplant 6-7 week old healthy seedlings on flat or raised beds." },
      { stage: "Vegetative Foliage", stageHi: "पत्तियों की वृद्धि", stageMr: "पातीची वाढ", duration: "Day 50-75", tips: "Frequent light irrigations. Monitor for thrips and purple blotch." },
      { stage: "Bulb Development", stageHi: "कंद बनना", stageMr: "कांदा पोसणे", duration: "Day 80-105", tips: "Apply potash and micro-nutrients. Avoid excessive nitrogen." },
      { stage: "Neck Fall & Curing", stageHi: "कटाई और सुखाना", stageMr: "मान पडणे व काढणी", duration: "Day 110-125", tips: "Stop watering 10-12 days before harvest when 50% tops fall. Cure in shade." },
    ],
    importantConsiderations: [
      "Shallow rooted; requires frequent light irrigations rather than heavy infrequent soaking.",
      "High sulfur and potassium requirements for pungency, shelf-life, and disease tolerance.",
      "Rabi onion (Garva) has best storage longevity (up to 5-6 months)."
    ],
  },
  {
    id: "tomato",
    name: "Tomato",
    nameHi: "टमाटर",
    nameMr: "टोमॅटो",
    scientificName: "Solanum lycopersicum",
    emoji: "🍅",
    seasons: ["Kharif", "Rabi", "Zaid"],
    temperature: { min: 14, optimalMin: 20, optimalMax: 28, max: 36 },
    rainfall: { min: 400, optimalMin: 500, optimalMax: 750, max: 1100 },
    humidity: { min: 50, max: 75 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.5, max: 8.0 },
    nitrogen: { min: 45, optimalMin: 70, max: 100 },
    phosphorus: { min: 40, optimalMin: 60, max: 95 },
    potassium: { min: 45, optimalMin: 75, max: 100 },
    waterRequirement: "medium",
    suitableDistricts: [
      "Nashik", "Pune", "Satara", "Sangli", "Ahmednagar", "Solapur", "Kolhapur", "Nagpur"
    ],
    description: "High-return vegetable crop of Western Maharashtra with year-round demand in Mumbai, Pune, and export markets.",
    descriptionHi: "पश्चिमी महाराष्ट्र की उच्च रिटर्न वाली सब्जी फसल, जिसकी मुंबई, पुणे और निर्यात बाजारों में साल भर मांग रहती है।",
    descriptionMr: "पश्चिम महाराष्ट्रातील सर्वाधिक नफा देणारे भाजीपाला पीक, मुंबई-पुणे बाजारपेठेत वर्षभर प्रचंड मागणी.",
    growingPeriodDays: "120 - 150 days",
    expectedYield: "200 - 350 qtl/acre",
    timeline: [
      { stage: "Transplanting & Staking", stageHi: "रोपाई व सहारा", stageMr: "लागवड व तारा-बांबू आधार", duration: "Day 1-25", tips: "Erect trellis/staking to keep foliage off the ground and prevent fruit rot." },
      { stage: "Flowering & Fruit Set", stageHi: "फूल व फल लगना", stageMr: "फुलोरा व फळधारणा", duration: "Day 35-65", tips: "High boron and calcium requirement to prevent Blossom End Rot." },
      { stage: "Fruiting & Harvesting", stageHi: "तुड़ाई", stageMr: "फळ तोडणी", duration: "Day 70-140", tips: "Harvest at breaker stage for distant transport or red-ripe for local consumption." },
    ],
    importantConsiderations: [
      "Staking with wire and bamboo significantly improves fruit quality and reduces fungal blight.",
      "Susceptible to leaf curl virus transmitted by whiteflies; monitor nursery and field vectors.",
      "Needs balanced calcium fertilization to avoid Blossom End Rot."
    ],
  },
  {
    id: "potato",
    name: "Potato",
    nameHi: "आलू",
    nameMr: "बटाटा",
    scientificName: "Solanum tuberosum",
    emoji: "🥔",
    seasons: ["Rabi", "Kharif"], // Kharif in Khed/Junnar/Manchar, Rabi elsewhere
    temperature: { min: 10, optimalMin: 16, optimalMax: 24, max: 30 },
    rainfall: { min: 300, optimalMin: 450, optimalMax: 650, max: 900 },
    humidity: { min: 50, max: 80 },
    soilPH: { min: 5.2, optimalMin: 5.8, optimalMax: 6.8, max: 7.5 },
    nitrogen: { min: 50, optimalMin: 75, max: 100 },
    phosphorus: { min: 40, optimalMin: 65, max: 95 },
    potassium: { min: 50, optimalMin: 80, max: 100 }, // Heavy potash consumer for tuber starch
    waterRequirement: "medium",
    suitableDistricts: [
      "Pune", "Satara", "Kolhapur", "Ahmednagar", "Nashik"
    ],
    description: "Famous in Pune's Khed, Junnar, and Ambegaon talukas, producing both Kharif chip-grade and Rabi table potatoes.",
    descriptionHi: "पुणे के खेड, जुन्नर और अंबेगांव तालुकों में प्रसिद्ध, खरीफ और रबी दोनों मौसम में बढ़िया उत्पादन।",
    descriptionMr: "पुण्यातील खेड, जुन्नर, आंबेगाव भागात विशेष प्रसिद्ध, खरीप व रब्बी दोन्ही हंगामात वेफर्स व खाण्यासाठी बटाटा पिकवला जातो.",
    growingPeriodDays: "85 - 105 days",
    expectedYield: "80 - 120 qtl/acre",
    timeline: [
      { stage: "Planting & Sprouting", stageHi: "रोपाई", stageMr: "लागवड व उगवण", duration: "Day 1-15", tips: "Plant certified sprouted seed tubers treated with carbendazim." },
      { stage: "Vegetative & Earthing Up", stageHi: "मिट्टी चढ़ाना", stageMr: "मातीची भर घालणे", duration: "Day 25-45", tips: "Perform thorough earthing up to prevent greening of tubers from sunlight." },
      { stage: "Tuber Bulking", stageHi: "कंद विकास", stageMr: "बटाटे पोसणे", duration: "Day 50-80", tips: "Maintain constant soil moisture. Avoid wet-dry fluctuations." },
      { stage: "Dehaulming & Harvest", stageHi: "कटाई", stageMr: "काढणी", duration: "Day 85-100", tips: "Cut foliage (dehaulming) 8-10 days before harvest to harden tuber skin." },
    ],
    importantConsiderations: [
      "Tuberization ceases if night temperatures exceed 22-23°C.",
      "Earthing up is mandatory to protect growing tubers from direct sun and potato tuber moth.",
      "Pre-harvest dehaulming hardens skin and prevents bruising during transport."
    ],
  },
  {
    id: "moong",
    name: "Moong (Green Gram)",
    nameHi: "मूंग",
    nameMr: "मूग",
    scientificName: "Vigna radiata",
    emoji: "🌱",
    seasons: ["Kharif", "Zaid"],
    temperature: { min: 18, optimalMin: 25, optimalMax: 33, max: 40 },
    rainfall: { min: 350, optimalMin: 450, optimalMax: 650, max: 900 },
    humidity: { min: 40, max: 75 },
    soilPH: { min: 6.2, optimalMin: 6.5, optimalMax: 7.8, max: 8.2 },
    nitrogen: { min: 15, optimalMin: 25, max: 60 }, // Superb nitrogen fixer
    phosphorus: { min: 30, optimalMin: 50, max: 85 },
    potassium: { min: 20, optimalMin: 40, max: 75 },
    waterRequirement: "low",
    suitableDistricts: [
      "Jalna", "Parbhani", "Nanded", "Latur", "Chhatrapati Sambhajinagar", "Akola", "Amravati", "Buldhana", "Wardha", "Dhule"
    ],
    description: "Ultra short duration (60-70 days) pulse crop, perfect catch crop and soil fertility booster.",
    descriptionHi: "अति अल्प अवधि (60-70 दिन) की दलहनी फसल, आदर्श कैच क्रॉप और मिट्टी की उर्वरता बढ़ाने वाली।",
    descriptionMr: "अतिशय कमी कालावधीचे (६०-७० दिवस) कडधान्य पीक, दुबार पिकासाठी व जमिनीची सुपीकता वाढवण्यासाठी उत्तम.",
    growingPeriodDays: "60 - 70 days",
    expectedYield: "5 - 8 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-8", tips: "Treat seed with Rhizobium and PSB culture." },
      { stage: "Vegetative & Flowering", stageHi: "फूल निकलना", stageMr: "फुलोरा", duration: "Day 20-40", tips: "Protect from Yellow Mosaic Virus (YMV) by controlling whitefly." },
      { stage: "Pod Maturity & Picking", stageHi: "तुड़ाई", stageMr: "शेंगा तोडणी", duration: "Day 50-65", tips: "Pick pods as they turn blackish-brown in 1-2 hand pickings." },
    ],
    importantConsiderations: [
      "Short duration fits easily before Rabi wheat, chickpea, or sorghum.",
      "Fixes 35-40 kg atmospheric nitrogen per hectare into soil.",
      "Susceptible to Yellow Mosaic Virus (YMV); choose resistant varieties like BM-2002-1 or BM-2003-2."
    ],
  },
  {
    id: "urad",
    name: "Urad (Black Gram)",
    nameHi: "उड़द",
    nameMr: "उडीद",
    scientificName: "Vigna mungo",
    emoji: "🫘",
    seasons: ["Kharif"],
    temperature: { min: 20, optimalMin: 25, optimalMax: 34, max: 40 },
    rainfall: { min: 400, optimalMin: 500, optimalMax: 750, max: 1000 },
    humidity: { min: 50, max: 85 },
    soilPH: { min: 6.0, optimalMin: 6.5, optimalMax: 7.8, max: 8.2 },
    nitrogen: { min: 20, optimalMin: 30, max: 60 },
    phosphorus: { min: 30, optimalMin: 50, max: 85 },
    potassium: { min: 20, optimalMin: 40, max: 75 },
    waterRequirement: "low",
    suitableDistricts: [
      "Nanded", "Latur", "Parbhani", "Yavatmal", "Nagpur", "Wardha", "Akola", "Chhatrapati Sambhajinagar", "Jalgaon"
    ],
    description: "High-protein Kharif black pulse with excellent market value, ideal for black cotton soils.",
    descriptionHi: "उच्च प्रोटीन युक्त खरीफ दलहन, बढ़िया बाजार मूल्य और काली कपास मिट्टी के लिए उपयुक्त।",
    descriptionMr: "भरपूर प्रथिने असलेले खरीप कडधान्य, चांगला बाजारभाव आणि काळ्या जमिनीत उत्तम उत्पादन देणारे पीक.",
    growingPeriodDays: "70 - 80 days",
    expectedYield: "6 - 9 qtl/acre",
    timeline: [
      { stage: "Sowing", stageHi: "बुवाई", stageMr: "पेरणी", duration: "Day 1-10", tips: "Sow with monsoon arrival at 30x10 cm row spacing." },
      { stage: "Branching & Flowering", stageHi: "फूल आना", stageMr: "फुलोरा", duration: "Day 25-45", tips: "One weeding at 20-25 days. Monitor for leaf crinkle virus." },
      { stage: "Podding & Harvest", stageHi: "कटाई", stageMr: "शेंगा पक्वता व काढणी", duration: "Day 60-75", tips: "Harvest entire plant when 85% pods turn black and dry." },
    ],
    importantConsiderations: [
      "Provides rapid soil ground cover, suppressing monsoon weeds and preventing soil erosion.",
      "Cannot tolerate waterlogging; avoid poorly drained low-lying patches.",
      "Pairs well as an intercrop with Cotton or Pigeon Pea."
    ],
  },
];

// Helper to get crop by ID
export function getCropById(id: string): CropProfile | undefined {
  return cropsDataset.find((c) => c.id === id);
}
