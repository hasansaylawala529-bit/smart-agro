import { maharashtraDistricts, DistrictInfo } from "@/data/districts";

export interface GeoLocationDetails {
  village?: string;
  town?: string;
  city?: string;
  taluka?: string;
  district: string;
  state: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

// In-memory cache for reverse geocoding to prevent excessive API calls
const geocodeCache = new Map<string, GeoLocationDetails>();

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

/**
 * Find the closest Maharashtra district for a given coordinate pair
 */
export function findNearestDistrict(lat: number, lon: number): DistrictInfo {
  let nearest = maharashtraDistricts[0];
  let minDistance = Infinity;

  for (const d of maharashtraDistricts) {
    const dist = Math.hypot(d.lat - lat, d.lon - lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  return nearest;
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim with caching
 */
export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<GeoLocationDetails> {
  const cacheKey = getCacheKey(lat, lon);
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Check localStorage cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`geo_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as GeoLocationDetails;
        geocodeCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // Ignore storage errors
    }
  }

  const nearestDistrict = findNearestDistrict(lat, lon);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SmartAgro-DecisionSupport/1.0",
          "Accept-Language": "en,mr,hi",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const village = addr.village || addr.hamlet || addr.suburb || "";
    const town = addr.town || addr.municipality || "";
    const city = addr.city || "";
    const taluka = addr.county || addr.state_district || "";
    const rawDistrict = addr.state_district || addr.county || addr.district || nearestDistrict.district;
    
    // Normalize district name if matched against known Maharashtra districts
    const matchedDistrict = maharashtraDistricts.find(
      (d) => d.district.toLowerCase() === rawDistrict.toLowerCase() ||
             rawDistrict.toLowerCase().includes(d.district.toLowerCase())
    )?.district || nearestDistrict.district;

    const state = addr.state || "Maharashtra";
    const country = addr.country || "India";

    // Build nice farmer-friendly address: e.g. "Khed, Pune, Maharashtra, India"
    const localityParts = [village || town || city, taluka, matchedDistrict, state, country].filter(
      (part, idx, arr) => Boolean(part) && arr.indexOf(part) === idx
    );

    const result: GeoLocationDetails = {
      village,
      town,
      city,
      taluka,
      district: matchedDistrict,
      state,
      country,
      formattedAddress: localityParts.slice(0, 3).join(", ") + ", " + country,
      latitude: lat,
      longitude: lon,
    };

    geocodeCache.set(cacheKey, result);
    try {
      localStorage.setItem(`geo_${cacheKey}`, JSON.stringify(result));
    } catch {
      // Ignore
    }

    return result;
  } catch (err) {
    console.warn("Reverse geocode fallback used:", err);
    // Fallback to nearest district default
    const fallback: GeoLocationDetails = {
      district: nearestDistrict.district,
      state: "Maharashtra",
      country: "India",
      formattedAddress: `${nearestDistrict.district}, Maharashtra, India`,
      latitude: lat,
      longitude: lon,
    };
    return fallback;
  }
}

/**
 * Get current browser GPS position with high accuracy & timeout
 */
export function getBrowserGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Browser does not support geolocation"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    });
  });
}
