import { GoogleGenerativeAI } from "@google/generative-ai";

// Get Gemini API key from environment variable or localStorage (configured via Settings)
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey !== 'your_gemini_api_key_here' && envKey !== 'YOUR_OWN_API_KEY_HERE') {
      return envKey;
    }
    return localStorage.getItem('gemini_api_key') || '';
  }
  return '';
};

const getSystemPrompt = (lang: "en" | "hi" | "mr", farmLocation: string) => {
  const prompts = {
    en: `You are SmartAgro Assistant, a helpful AI assistant for Indian farmers, specifically for Maharashtra state. 
Your role is to help farmers with:
- Weather information and forecasts
- Crop recommendations based on season and soil
- Market prices (Mandi/APMC bhav) information
- Government schemes and subsidies (PM-KISAN, Fasal Bima, etc.)
- Soil health and farming tips
- Disease detection guidance

Current farmer's location: ${farmLocation}, Maharashtra

Guidelines:
- Keep responses concise (2-4 sentences unless detailed info requested)
- Use simple language that farmers can understand
- Mention specific schemes, prices in INR (₹)
- Be helpful and supportive
- If asked about features, guide them to the relevant section of the SmartAgro app
- For weather, mention it's based on their farm location in Settings
- For market prices, refer them to Market Advisor section

Respond naturally and helpfully in English.`,

    hi: `आप स्मार्ट एग्रो असिस्टेंट हैं, भारतीय किसानों के लिए एक सहायक AI, विशेष रूप से महाराष्ट्र राज्य के लिए।
आपकी भूमिका किसानों की मदद करना है:
- मौसम की जानकारी और पूर्वानुमान
- मौसम और मिट्टी के आधार पर फसल सिफारिशें
- बाजार भाव (मंडी/APMC भाव) की जानकारी
- सरकारी योजनाएं और सब्सिडी (पीएम-किसान, फसल बीमा, आदि)
- मिट्टी स्वास्थ्य और खेती के टिप्स
- रोग पहचान मार्गदर्शन

किसान का वर्तमान स्थान: ${farmLocation}, महाराष्ट्र

दिशानिर्देश:
- जवाब संक्षिप्त रखें (2-4 वाक्य जब तक विस्तृत जानकारी न मांगी जाए)
- सरल भाषा का उपयोग करें जो किसान समझ सकें
- विशिष्ट योजनाओं, भारतीय रुपये (₹) में कीमतों का उल्लेख करें
- सहायक और सहयोगी बनें
- अगर फीचर्स के बारे में पूछा जाए, तो SmartAgro ऐप के संबंधित सेक्शन में गाइड करें
- मौसम के लिए, बताएं कि यह सेटिंग्स में उनके खेत स्थान पर आधारित है
- बाजार भाव के लिए, मार्केट एडवाइजर सेक्शन देखें

हिंदी में स्वाभाविक और सहायक रूप से जवाब दें।`,

    mr: `तुम्ही स्मार्ट एग्रो असिस्टंट आहात, भारतीय शेतकऱ्यांसाठी एक सहाय्यक AI, विशेषतः महाराष्ट्र राज्यासाठी.
तुमची भूमिका शेतकऱ्यांना मदत करणे आहे:
- हवामान माहिती आणि अंदाज
- हंगाम आणि मातीवर आधारित पीक शिफारसी
- बाजारभाव (मंडी/APMC भाव) माहिती
- सरकारी योजना आणि अनुदान (पीएम-किसान, फसल विमा, इ.)
- माती आरोग्य आणि शेती टिप्स
- रोग ओळख मार्गदर्शन

शेतकऱ्याचे सध्याचे स्थान: ${farmLocation}, महाराष्ट्र

मार्गदर्शक तत्त्वे:
- उत्तरे संक्षिप्त ठेवा (2-4 वाक्ये जोपर्यंत तपशीलवार माहिती मागितली जात नाही)
- साधी भाषा वापरा जी शेतकरी समजू शकतील
- विशिष्ट योजना, भारतीय रुपयांमध्ये (₹) किंमती नमूद करा
- सहाय्यक आणि सहकार्य करणारे व्हा
- वैशिष्ट्यांबद्दल विचारल्यास, SmartAgro अॅपच्या संबंधित विभागाकडे मार्गदर्शन करा
- हवामानासाठी, सेटिंग्जमधील त्यांच्या शेत स्थानावर आधारित असल्याचे सांगा
- बाजारभावासाठी, मार्केट अॅडव्हायझर विभाग पहा

मराठीत नैसर्गिक आणि उपयुक्त प्रतिसाद द्या.`
  };
  
  return prompts[lang];
};

export interface FarmAgriContext {
  weather?: string;
  soil?: string;
  season?: string;
  recommendedCrops?: string;
}

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommended?: boolean;
}

export const AVAILABLE_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    badge: "Recommended (High Quota)",
    description: "Production-ready, ultra-fast model with 15 requests/min and 1,500 requests/day on free tier.",
    recommended: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    badge: "Fast & Lightweight",
    description: "Reliable, resource-efficient model with 15 requests/min free tier quota.",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "Latest Preview",
    description: "Google's latest multimodal architecture for advanced reasoning and vision.",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    badge: "Deep Reasoning (Low Quota)",
    description: "Deep agronomic reasoning. Free tier has a strict limit of only 2 requests/min.",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    badge: "Large Context (Low Quota)",
    description: "Foundational flagship model. Free tier has a strict limit of only 2 requests/min.",
  },
];

export const getGeminiModel = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gemini_model") || "gemini-2.0-flash";
  }
  return "gemini-2.0-flash";
};

export const setGeminiModel = (model: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("gemini_model", model.trim());
  }
};

export interface LocalizedText {
  en: string;
  hi: string;
  mr: string;
}

export interface DiseaseAnalysisResult {
  diseaseName: LocalizedText;
  scientificName: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  isHealthy: boolean;
  affectedPart: string;
  symptoms: LocalizedText;
  weatherInfluence: LocalizedText;
  treatment: LocalizedText[];
  organicRemedies: LocalizedText[];
  safety: LocalizedText;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export async function getGeminiResponse(
  userMessage: string,
  lang: "en" | "hi" | "mr",
  farmLocation: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = [],
  agriContext?: FarmAgriContext
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    const noKeyMessages = {
      en: "Please configure your Gemini API key in Settings to use the AI assistant. Get a free key from Google AI Studio (aistudio.google.com).",
      hi: "AI असिस्टेंट उपयोग करने के लिए कृपया सेटिंग्स में अपनी Gemini API key कॉन्फ़िगर करें। Google AI Studio (aistudio.google.com) से मुफ्त key प्राप्त करें।",
      mr: "AI असिस्टंट वापरण्यासाठी कृपया सेटिंग्जमध्ये तुमची Gemini API key कॉन्फिगर करा. Google AI Studio (aistudio.google.com) वरून मोफत key मिळवा."
    };
    return noKeyMessages[lang];
  }

  const configuredModel = getGeminiModel();
  const modelsToTry = [configuredModel, "gemini-2.0-flash", "gemini-1.5-flash"].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let systemPrompt = getSystemPrompt(lang, farmLocation);

  // Inject verified deterministic context
  if (agriContext) {
    systemPrompt += `\n\nVerified Farm Data:
- Location: ${farmLocation}, Maharashtra
- Current Weather: ${agriContext.weather || "Not available"}
- Current Season: ${agriContext.season || "Not available"}
- Soil Parameters: ${agriContext.soil || "Not available"}
- Top Deterministically Recommended Crops: ${agriContext.recommendedCrops || "Not available"}

IMPORTANT INSTRUCTION:
Base your crop and weather advice strictly on this real farm data above. Do NOT invent fictional weather conditions or disagree with the deterministic crop suitability rankings. Explain the reasons to the farmer simply.`;
  }
  
  const historyContext = conversationHistory.slice(-4).map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
  ).join('\n');
  
  const fullPrompt = `${systemPrompt}\n\n${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}User: ${userMessage}`;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      console.log(`Calling Gemini API using model ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      return text;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed, checking next model:`, error?.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('invalid')) {
          const invalidKeyMessages = {
            en: "The API key is invalid. Please check your Gemini API key in Settings.",
            hi: "API key अमान्य है। कृपया सेटिंग्स में अपनी Gemini API key जाँचें।",
            mr: "API key अवैध आहे. कृपया सेटिंग्जमध्ये तुमची Gemini API key तपासा."
          };
          return invalidKeyMessages[lang];
        }
        
        if (
          error?.message?.includes('quota') ||
          error?.message?.includes('rate') ||
          error?.message?.includes('429') ||
          error?.message?.includes('RESOURCE_EXHAUSTED')
        ) {
          const quotaMessages = {
            en: "Google Gemini Free Tier Limit Reached (429). Google AI Studio free tier limits requests per minute (Pro models allow only 2 requests/min). Please wait 30–60 seconds, or switch to 'Gemini 2.0 Flash' in Settings for higher free quotas.",
            hi: "Google Gemini फ्री टियर दर सीमा समाप्त (429)। Google AI Studio फ्री टियर प्रति मिनट अनुरोधों को सीमित करता है (Pro मॉडल में केवल 2 अनुरोध/मिनट)। कृपया 30-60 सेकंड प्रतीक्षा करें, या अधिक कोटा के लिए सेटिंग्स में 'Gemini 2.0 Flash' चुनें।",
            mr: "Google Gemini फ्री टियर मर्यादा संपली (429). Google AI Studio मोफत टियरमध्ये प्रति मिनिट विनंत्या मर्यादित आहेत (Pro मॉडेलसाठी फक्त २ विनंत्या/मिनिट). कृपया ३०-६० सेकंद थांबा, किंवा जास्त मर्यादेसाठी सेटिंग्जमध्ये 'Gemini 2.0 Flash' निवडा."
          };
          return quotaMessages[lang];
        }

        const fallbackMessages = {
          en: `Connection error: ${error?.message || 'Unknown error'}. Please try again.`,
          hi: `कनेक्शन त्रुटि: ${error?.message || 'अज्ञात त्रुटि'}। कृपया पुनः प्रयास करें।`,
          mr: `कनेक्शन त्रुटी: ${error?.message || 'अज्ञात त्रुटी'}. कृपया पुन्हा प्रयत्न करा.`
        };
        return fallbackMessages[lang];
      }
    }
  }

  return "Unable to get response from Gemini.";
}

// Multimodal Leaf Disease Diagnostics via Gemini Vision
export async function analyzeCropImageWithGemini(
  base64Data: string,
  mimeType: string,
  farmLocation: string = "Maharashtra"
): Promise<DiseaseAnalysisResult> {
  const apiKey = getApiKey();

  // If no API key configured, provide realistic fallback demo with notification
  if (!apiKey) {
    return {
      diseaseName: {
        en: "Cercospora Leaf Blight (Sample Result)",
        hi: "सर्कोस्पोरा पत्ती झुलसा (नमूना परिणाम)",
        mr: "सर्कोस्पोरा पानावरील करपा (नमुना निकाल)"
      },
      scientificName: "Cercospora sojina / Cercospora kikuchii",
      confidence: 87,
      risk: "high",
      isHealthy: false,
      affectedPart: "Foliage / Upper Leaf Surface",
      symptoms: {
        en: "Brown circular lesions with reddish-purple borders visible on leaf lamina with premature yellowing.",
        hi: "पत्तियों पर लाल-बैंगनी किनारों के साथ भूरे गोलाकार धब्बे और समय से पहले पीलापन।",
        mr: "पानांवर लाल-जांभळ्या कडांसह तपकिरी गोलाकार डाग आणि अकाली पिवळेपणा."
      },
      weatherInfluence: {
        en: "High humidity (>80%) and warm temperatures (25-30°C) significantly accelerate spore germination.",
        hi: "उच्च आर्द्रता (>80%) और गर्म तापमान (25-30°C) बीजाणु अंकुरण को काफी बढ़ावा देते हैं।",
        mr: "जास्त आर्द्रता (>80%) आणि उबदार तापमान (25-30°C) बुरशीच्या प्रसारास अनुकूल ठरते."
      },
      treatment: [
        {
          en: "Spray Mancozeb 75% WP @ 2.5g per Liter of water thoroughly covering both leaf sides.",
          hi: "मैन्कोज़ेब 75% WP @ 2.5 ग्राम प्रति लीटर पानी में दोनों तरफ अच्छी तरह छिड़कें।",
          mr: "मॅन्कोझेब 75% WP @ 2.5 ग्रॅम प्रति लिटर पाण्यात दोन्ही बाजूने फवारणी करा."
        },
        {
          en: "Follow up with Carbendazim 50% WP @ 1g/L after 12 days if spots persist.",
          hi: "यदि धब्बे बने रहें तो 12 दिनों बाद कार्बेन्डाज़िम 50% WP @ 1g/L का दूसरा छिड़काव करें।",
          mr: "डाग कायम राहिल्यास 12 दिवसांनी कार्बेन्डाझिम 50% WP @ 1g/L ची दुसरी फवारणी करा."
        }
      ],
      organicRemedies: [
        {
          en: "Apply 5% Neem Seed Kernel Extract (NSKE) or cold-pressed Neem Oil @ 5ml/L with mild soap.",
          hi: "5% नीम बीज अर्क (NSKE) या नीम का तेल @ 5ml/L साबुन के पानी के साथ छिड़कें।",
          mr: "5% निंबोळी अर्क किंवा कडुनिंब तेल @ 5ml/L हलक्या साबणाच्या पाण्यात मिसळून फवारा."
        },
        {
          en: "Foliar spray of Trichoderma harzianum @ 5g/L during early morning hours.",
          hi: "सुबह के समय ट्राइकोडर्मा हरज़ियानम @ 5 ग्राम/लीटर का पर्ण छिड़काव करें।",
          mr: "सकाळी ट्रायकोडर्मा हरझियानम @ 5 ग्रॅम/लिटरची फवारणी करा."
        }
      ],
      safety: {
        en: "Wear protective face mask and chemical-resistant gloves. Observe a 10-day pre-harvest interval (PHI).",
        hi: "छिड़काव के दौरान मास्क और दस्ताने पहनें। कटाई से कम से कम 10 दिन पहले छिड़काव रोक दें।",
        mr: "फवारणी करताना मास्क व हातमोजे वापरा. काढणीच्या किमान 10 दिवस आधी फवारणी थांबवा."
      },
      isAiGenerated: false
    };
  }

  const configuredModel = getGeminiModel();
  const modelsToTry = [configuredModel, "gemini-2.0-flash", "gemini-1.5-flash"].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType || "image/jpeg"
    }
  };

  const visionPrompt = `You are a chief plant pathologist and agronomist specializing in Indian agriculture and crops grown in Maharashtra (Soybean, Cotton, Tur/Pigeon Pea, Wheat, Sugarcane, Chickpea, Onion, Tomato, Maize, Groundnut, etc.).
Analyze this uploaded plant/leaf photograph with high precision.
Determine if the leaf is healthy or affected by a specific plant pathology, fungal blight, bacterial wilt, viral infection, nutrient chlorosis, or insect pest damage.

CRITICAL: Return ONLY a raw JSON object (do NOT wrap in markdown \`\`\`json code blocks, just raw JSON) adhering strictly to this schema:
{
  "diseaseName": {
    "en": "Specific Name of Disease or 'Healthy Crop Leaf'",
    "hi": "रोग का नाम हिंदी में या 'स्वस्थ पौधा'",
    "mr": "रोगाचे नाव मराठीत किंवा 'निरोगी पीक'"
  },
  "scientificName": "Binomial pathogen name or 'None (Healthy)'",
  "confidence": 89,
  "risk": "high",
  "isHealthy": false,
  "affectedPart": "Leaf / Foliage / Stem",
  "symptoms": {
    "en": "Detailed 1-2 sentence description of observable symptoms (lesions, discoloration, fungal spots)",
    "hi": "पत्ती पर दिखाई देने वाले लक्षणों का सटीक विवरण",
    "mr": "पानावर दिसणाऱ्या लक्षणांचे अचूक वर्णन"
  },
  "weatherInfluence": {
    "en": "How ambient humidity, rainfall, and temperature in ${farmLocation}, Maharashtra aggravate or trigger this issue",
    "hi": "महाराष्ट्र के मौसम (नमी, बारिश, तापमान) का इस रोग पर प्रभाव",
    "mr": "महाराष्ट्रातील हवामानाचा (आर्द्रता, पाऊस, तापमान) या रोगावरील प्रभाव"
  },
  "treatment": [
    {
      "en": "Chemical fungicide/pesticide recommendation with recommended trade/active dosage per Liter",
      "hi": "रासायनिक कीटनाशक/फफूंदनाशक खुराक प्रति लीटर पानी",
      "mr": "रासायनिक बुरशीनाशक उपचार आणि डोस प्रति लिटर पाणी"
    }
  ],
  "organicRemedies": [
    {
      "en": "Biological or organic IPM solution (e.g. Neem extract, Trichoderma, Beauveria, Cow urine decoction)",
      "hi": "जैविक या प्राकृतिक नियंत्रण उपाय (नीम अर्क, ट्राइकोडर्मा, आदि)",
      "mr": "सेंद्रिय किंवा जैविक उपाय (निंबोळी अर्क, ट्रायकोडर्मा, गोमूत्र अर्क)"
    }
  ],
  "safety": {
    "en": "Mandatory safety measures for farmers (PPE, spraying time, withholding days before harvest)",
    "hi": "किसानों के लिए सुरक्षा सावधानियां (मास्क, छिड़काव का समय, कटाई पूर्व प्रतीक्षा अवधि)",
    "mr": "शेतकऱ्यांसाठी सुरक्षा खबरदारी (मास्क, फवारणीची वेळ, काढणीपूर्व प्रतीक्षा कालावधी)"
  }
}`;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      console.log(`Analyzing crop image using Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([visionPrompt, imagePart]);
      const rawText = result.response.text().trim();
      
      // Remove any potential code block ticks
      let cleanedJson = rawText;
      if (cleanedJson.startsWith("```json")) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed: DiseaseAnalysisResult = JSON.parse(cleanedJson);
      parsed.isAiGenerated = true;
      parsed.modelUsed = modelName;
      return parsed;
    } catch (err: any) {
      console.warn(`Vision inference failed on model ${modelName}:`, err?.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        throw new Error(err?.message || "Failed to analyze image with Gemini Vision");
      }
    }
  }

  throw new Error("Vision analysis failed across all attempted models.");
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
  return getApiKey().length > 0;
}

// Save API key to localStorage
export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', key.trim());
  }
}

// Get current API key (masked for display)
export function getGeminiApiKeyMasked(): string {
  const key = getApiKey();
  if (!key) return '';
  return key.slice(0, 8) + '...' + key.slice(-4);
}
