export interface CurrentWeather {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  weatherCode: number;
  weatherDescription: string;
  icon: string;
  feelsLike: number; // °C
  precipitation: number; // mm
  cloudCover: number; // %
  pressure: number; // hPa
  uvIndex: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  maxTemp: number; // °C
  minTemp: number; // °C
  avgTemp: number; // °C
  weatherCode: number;
  weatherDescription: string;
  icon: string;
  precipitationProbability: number; // %
  precipitationSum: number; // mm
  humidity: number; // %
  windSpeedMax: number; // km/h
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAdvisoryItem {
  id: string;
  icon: string;
  title: string;
  titleHi: string;
  titleMr: string;
  message: string;
  messageHi: string;
  messageMr: string;
  type: "warning" | "info" | "success" | "danger";
  actionRecommendation: string;
}

export interface AgriculturalInsights {
  rainExpectedTomorrow: boolean;
  heavyRainExpected: boolean;
  drySpellExpected: boolean;
  fungalDiseaseRisk: "low" | "moderate" | "high";
  heatStressRisk: boolean;
  irrigationAction: "delay" | "plan" | "normal";
  sowingSuitability: boolean;
  advisories: WeatherAdvisoryItem[];
  summary: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface WeatherReport {
  current: CurrentWeather;
  daily: DailyForecast[];
  insights: AgriculturalInsights;
  lastUpdated: string;
  isFallback: boolean;
}

// WMO weather interpretation codes
const weatherCodeMap: Record<number, { en: string; hi: string; mr: string; icon: string }> = {
  0: { en: "Clear sky", hi: "साफ आसमान", mr: "स्वच्छ आकाश", icon: "☀️" },
  1: { en: "Mainly clear", hi: "मुख्य रूप से साफ", mr: "मुख्यतः स्वच्छ", icon: "🌤️" },
  2: { en: "Partly cloudy", hi: "आंशिक बादल", mr: "अंशतः ढगाळ", icon: "⛅" },
  3: { en: "Overcast", hi: "घने बादल", mr: "पूर्ण ढगाळ", icon: "☁️" },
  45: { en: "Fog", hi: "कोहरा", mr: "धुके", icon: "🌫️" },
  48: { en: "Depositing rime fog", hi: "घना कोहरा", mr: "दाट धुके", icon: "🌫️" },
  51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी", mr: "हलकी रिमझिम", icon: "🌦️" },
  53: { en: "Moderate drizzle", hi: "मध्यम बूंदाबांदी", mr: "मध्यम रिमझिम", icon: "🌦️" },
  55: { en: "Dense drizzle", hi: "तेज बूंदाबांदी", mr: "दाट रिमझिम", icon: "🌧️" },
  61: { en: "Slight rain", hi: "हल्की बारिश", mr: "हलका पाऊस", icon: "🌧️" },
  63: { en: "Moderate rain", hi: "मध्यम बारिश", mr: "मध्यम पाऊस", icon: "🌧️" },
  65: { en: "Heavy rain", hi: "भारी बारिश", mr: "जोरदार पाऊस", icon: "⛈️" },
  71: { en: "Slight snow", hi: "हल्की बर्फबारी", mr: "हलकी हिमवृष्टी", icon: "🌨️" },
  73: { en: "Moderate snow", hi: "मध्यम बर्फबारी", mr: "मध्यम हिमवृष्टी", icon: "🌨️" },
  75: { en: "Heavy snow", hi: "भारी बर्फबारी", mr: "जोरदार हिमवृष्टी", icon: "❄️" },
  80: { en: "Slight rain showers", hi: "हल्की फुहारें", mr: "हलक्या पावसाच्या सरी", icon: "🌦️" },
  81: { en: "Moderate rain showers", hi: "मध्यम बौछार", mr: "मध्यम सरी", icon: "🌧️" },
  82: { en: "Violent rain showers", hi: "मूसलाधार बारिश", mr: "मुसळधार पाऊस", icon: "⛈️" },
  95: { en: "Thunderstorm", hi: "गरज के साथ तूफान", mr: "वादळी पाऊस / मेघगर्जना", icon: "⛈️" },
  96: { en: "Thunderstorm with slight hail", hi: "ओलावृष्टि के साथ तूफान", mr: "गारपिटीसह वादळ", icon: "⛈️" },
  99: { en: "Thunderstorm with heavy hail", hi: "भारी ओलावृष्टि व तूफान", mr: "तीव्र गारपिटीसह वादळ", icon: "⛈️" },
};

export function getWeatherConditionInfo(code: number) {
  return weatherCodeMap[code] || { en: "Partly Cloudy", hi: "आंशिक बादल", mr: "अंशतः ढगाळ", icon: "⛅" };
}

/**
 * Derives agronomic insights from weather trends
 */
export function generateAgriculturalInsights(current: CurrentWeather, daily: DailyForecast[]): AgriculturalInsights {
  const tomorrow = daily[1] || daily[0];
  const advisories: WeatherAdvisoryItem[] = [];

  // 1. Rain Expected Tomorrow
  const rainExpectedTomorrow = (tomorrow?.precipitationProbability ?? 0) >= 45 || (tomorrow?.precipitationSum ?? 0) >= 2.5;
  if (rainExpectedTomorrow) {
    advisories.push({
      id: "rain_expected",
      icon: "🌧️",
      title: "Rain Expected Tomorrow",
      titleHi: "कल बारिश की संभावना",
      titleMr: "उद्या पावसाची शक्यता",
      message: `Rain probability tomorrow is ${tomorrow.precipitationProbability}% with ~${tomorrow.precipitationSum.toFixed(1)}mm expected.`,
      messageHi: `कल ${tomorrow.precipitationProbability}% बारिश की संभावना (~${tomorrow.precipitationSum.toFixed(1)} मिमी)। सिंचाई टालने पर विचार करें।`,
      messageMr: `उद्या ${tomorrow.precipitationProbability}% पावसाची शक्यता (~${tomorrow.precipitationSum.toFixed(1)} मिमी). सिंचन पुढे ढकलण्याचा विचार करा.`,
      type: "info",
      actionRecommendation: "Postpone irrigation to conserve water and avoid waterlogging.",
    });
  }

  // 2. Heavy Rainfall / Storm alert
  const hasHeavyRainDay = daily.some((d) => d.precipitationSum >= 25 || d.weatherCode >= 65);
  if (hasHeavyRainDay) {
    const heavyDay = daily.find((d) => d.precipitationSum >= 25 || d.weatherCode >= 65)!;
    advisories.push({
      id: "heavy_rain",
      icon: "⚠️",
      title: "Heavy Rainfall Alert",
      titleHi: "भारी वर्षा चेतावनी",
      titleMr: "मुसळधार पावसाचा इशारा",
      message: `Heavy rainfall (${heavyDay.precipitationSum}mm) forecast on ${heavyDay.date}. Avoid unnecessary irrigation and clear field drainage channels.`,
      messageHi: `${heavyDay.date} को भारी बारिश (${heavyDay.precipitationSum} मिमी) का अनुमान। खेतों में जल निकासी की व्यवस्था सुनिश्चित करें।`,
      messageMr: `${heavyDay.date} रोजी मुसळधार पाऊस (${heavyDay.precipitationSum} मिमी) अपेक्षित. शेतातील पाण्याचा निचरा त्वरित मोकळा करा.`,
      type: "danger",
      actionRecommendation: "Check field drainage channels to prevent root asphyxiation and collar rot.",
    });
  }

  // 3. High Temperature / Heat Stress
  const maxForecastTemp = Math.max(...daily.map((d) => d.maxTemp), current.temperature);
  const heatStressRisk = maxForecastTemp >= 36;
  if (heatStressRisk) {
    advisories.push({
      id: "high_temp",
      icon: "🌡️",
      title: "High Temperature Warning",
      titleHi: "उच्च तापमान चेतावनी",
      titleMr: "उच्च तापमानाचा इशारा",
      message: `Peak temperature expected to reach ${maxForecastTemp}°C. Monitor crop evapotranspiration and soil moisture levels.`,
      messageHi: `अधिकतम तापमान ${maxForecastTemp}°C तक पहुंचने की संभावना। फसलों में पानी की आवश्यकता और नमी की निगरानी करें।`,
      messageMr: `कमाल तापमान ${maxForecastTemp}°C पर्यंत जाण्याची शक्यता. पिकांची पाण्याची गरज ओळखून वेळेवर हलके पाणी द्या.`,
      type: "warning",
      actionRecommendation: "Schedule light irrigations during early morning or evening hours to avoid thermal shock.",
    });
  }

  // 4. High Humidity & Fungal Disease Vulnerability
  let fungalDiseaseRisk: "low" | "moderate" | "high" = "low";
  if (current.humidity >= 80 || daily.some((d) => d.humidity >= 80 && d.maxTemp >= 25)) {
    fungalDiseaseRisk = "high";
    advisories.push({
      id: "high_humidity",
      icon: "💧",
      title: "High Humidity - Fungal Risk",
      titleHi: "अधिक आर्द्रता - फफूंद रोग जोखिम",
      titleMr: "जास्त आर्द्रता - बुरशीजन्य रोगांचा धोका",
      message: `Relative humidity is elevated (${current.humidity}%). Fungal diseases such as rust, downy mildew, and leaf blight spread quickly under warm humid conditions.`,
      messageHi: `हवा में आर्द्रता अधिक है (${current.humidity}%)। गर्म और नम मौसम में फफूंद जनित रोगों (झुलसा, रतुआ) का प्रकोप बढ़ सकता है। फसल का निरीक्षण करें।`,
      messageMr: `हवेतील आर्द्रता जास्त आहे (${current.humidity}%). उबदार दमट हवेमुळे करपा, तांबेरा यांसारख्या बुरशीजन्य रोगांचा प्रादुर्भाव वाढू शकतो. पिकांचे बारकाईने निरीक्षण करा.`,
      type: "warning",
      actionRecommendation: "Scout crop canopies for early lesions. Prepare preventive bio-fungicides or recommended sprays.",
    });
  } else if (current.humidity >= 65) {
    fungalDiseaseRisk = "moderate";
  }

  // 5. Dry Period / Prolonged Low Rainfall
  const total7DayRain = daily.reduce((acc, d) => acc + d.precipitationSum, 0);
  const drySpellExpected = total7DayRain < 5 && daily.every((d) => d.precipitationProbability < 30);
  if (drySpellExpected && !rainExpectedTomorrow) {
    advisories.push({
      id: "dry_period",
      icon: "☀️",
      title: "Dry Spell Forecast",
      titleHi: "शुष्क मौसम का पूर्वानुमान",
      titleMr: "कोरड्या हवामानाचा अंदाज",
      message: `Low rainfall (<5mm total) forecast over the next 7 days. Plan protective irrigation according to crop stage.`,
      messageHi: `अगले 7 दिनों में नगण्य बारिश (<5 मिमी) की संभावना। फसल अवस्था अनुसार सिंचाई की योजना बनाएं।`,
      messageMr: `पुढील ७ दिवसांत नगण्य पाऊस (<५ मिमी) अपेक्षित. पिकाच्या गरजेनुसार संरक्षित सिंचनाचे नियोजन करा.`,
      type: "info",
      actionRecommendation: "Conserve soil moisture using intercultivation or mulching; arrange drip/sprinkler cycles.",
    });
  }

  // 6. Sowing Suitability Check
  const sowingSuitability =
    total7DayRain >= 20 &&
    total7DayRain <= 90 &&
    current.temperature >= 22 &&
    current.temperature <= 34;

  if (sowingSuitability) {
    advisories.push({
      id: "sowing_favorable",
      icon: "🌱",
      title: "Favorable Sowing Window",
      titleHi: "बुवाई के लिए अनुकूल मौसम",
      titleMr: "पेरणीसाठी पोषक वातावरण",
      message: "Current soil moisture outlook and temperatures are favorable for seed sowing and germination.",
      messageHi: "मिट्टी की नमी और तापमान बीज बुवाई और स्वस्थ अंकुरण के लिए अनुकूल प्रतीत हो रहे हैं।",
      messageMr: "मातीतील ओलावा आणि तापमान बियाणे पेरणी व उत्तम उगवणीसाठी अतिशय पोषक आहे.",
      type: "success",
      actionRecommendation: "Ensure certified treated seeds are ready for sowing in well-prepared seedbeds.",
    });
  }

  // Irrigation Action Strategy
  let irrigationAction: "delay" | "plan" | "normal" = "normal";
  if (rainExpectedTomorrow || hasHeavyRainDay) {
    irrigationAction = "delay";
  } else if (drySpellExpected || heatStressRisk) {
    irrigationAction = "plan";
  }

  // Multilingual summary
  const summary = {
    en: rainExpectedTomorrow
      ? "Rain expected tomorrow. Consider postponing irrigation."
      : heatStressRisk
      ? "High temperature expected. Monitor crop water requirements and irrigation."
      : drySpellExpected
      ? "Low rainfall expected for the next few days. Plan irrigation according to crop and soil conditions."
      : "Weather conditions are stable for general agricultural activities.",
    hi: rainExpectedTomorrow
      ? "कल बारिश की संभावना है। सिंचाई टालने पर विचार करें।"
      : heatStressRisk
      ? "उच्च तापमान की संभावना है। फसल की पानी की आवश्यकता पर नजर रखें।"
      : drySpellExpected
      ? "अगले कुछ दिनों में कम बारिश का अनुमान। आवश्यकतानुसार सिंचाई की योजना बनाएं।"
      : "कृषि गतिविधियों के लिए मौसम सामान्य बना हुआ है।",
    mr: rainExpectedTomorrow
      ? "उद्या पावसाची शक्यता आहे. सिंचन पुढे ढकलण्याचा विचार करा."
      : heatStressRisk
      ? "कमाल तापमान वाढण्याची शक्यता आहे. पिकांच्या पाण्याची गरज तपासा."
      : drySpellExpected
      ? "पुढील काही दिवसांत कमी पाऊस अपेक्षित. त्यानुसार सिंचनाचे नियोजन करा."
      : "शेतीकामांसाठी हवामान सर्वसाधारणपणे अनुकूल आहे.",
  };

  return {
    rainExpectedTomorrow,
    heavyRainExpected: hasHeavyRainDay,
    drySpellExpected,
    fungalDiseaseRisk,
    heatStressRisk,
    irrigationAction,
    sowingSuitability,
    advisories,
    summary,
  };
}

/**
 * Fetches Open-Meteo live weather data for given coordinates
 */
export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherReport> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    timezone: "Asia/Kolkata",
    forecast_days: "7",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo API returned status ${response.status}`);
  }

  const data = await response.json();

  const condInfo = getWeatherConditionInfo(data.current.weather_code);
  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: Math.round(data.current.wind_direction_10m),
    weatherCode: data.current.weather_code,
    weatherDescription: condInfo.en,
    icon: condInfo.icon,
    feelsLike: Math.round(data.current.apparent_temperature),
    precipitation: data.current.precipitation ?? 0,
    cloudCover: data.current.cloud_cover ?? 0,
    pressure: Math.round(data.current.pressure_msl),
    uvIndex: data.current.uv_index ?? 0,
    isDay: data.current.is_day === 1,
  };

  const daily: DailyForecast[] = data.daily.time.map((dateStr: string, idx: number) => {
    const wCode = data.daily.weather_code[idx] ?? 0;
    const dayCond = getWeatherConditionInfo(wCode);
    const maxT = Math.round(data.daily.temperature_2m_max[idx]);
    const minT = Math.round(data.daily.temperature_2m_min[idx]);

    return {
      date: dateStr,
      maxTemp: maxT,
      minTemp: minT,
      avgTemp: Math.round((maxT + minT) / 2),
      weatherCode: wCode,
      weatherDescription: dayCond.en,
      icon: dayCond.icon,
      precipitationProbability: data.daily.precipitation_probability_max?.[idx] ?? 0,
      precipitationSum: data.daily.precipitation_sum?.[idx] ?? 0,
      humidity: current.humidity, // estimated average
      windSpeedMax: Math.round(data.daily.wind_speed_10m_max?.[idx] ?? 0),
      uvIndexMax: data.daily.uv_index_max?.[idx] ?? 0,
      sunrise: data.daily.sunrise?.[idx] ?? "",
      sunset: data.daily.sunset?.[idx] ?? "",
    };
  });

  const insights = generateAgriculturalInsights(current, daily);

  return {
    current,
    daily,
    insights,
    lastUpdated: new Date().toISOString(),
    isFallback: false,
  };
}
