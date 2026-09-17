import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { maharashtraDistricts, DistrictInfo } from "@/data/districts";
import {
  reverseGeocodeCoordinates,
  getBrowserGeolocation,
  findNearestDistrict,
  GeoLocationDetails,
} from "@/services/locationService";

// Re-export for backward compatibility
export const maharashtraLocations = maharashtraDistricts.map((d) => ({
  district: d.district,
  lat: d.lat,
  lon: d.lon,
  talukas: d.talukas,
}));

export interface FarmLocation {
  district: string;
  taluka?: string;
  village?: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  isAutoDetected: boolean;
}

interface FarmLocationContextType {
  location: FarmLocation;
  districtInfo: DistrictInfo;
  setLocation: (location: FarmLocation) => void;
  setDistrict: (district: string) => void;
  detectLocation: () => Promise<void>;
  isDetecting: boolean;
  error: string | null;
  clearError: () => void;
}

const DEFAULT_DISTRICT = "Pune";
const defaultDistrictInfo = maharashtraDistricts.find((d) => d.district === DEFAULT_DISTRICT) || maharashtraDistricts[0];

const defaultLocation: FarmLocation = {
  district: defaultDistrictInfo.district,
  taluka: "Haveli",
  village: "Pune",
  formattedAddress: `${defaultDistrictInfo.district}, Maharashtra, India`,
  latitude: defaultDistrictInfo.lat,
  longitude: defaultDistrictInfo.lon,
  isAutoDetected: false,
};

const FarmLocationContext = createContext<FarmLocationContextType | null>(null);

const STORAGE_KEY = "smartagro_farm_location";

export function FarmLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<FarmLocation>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.latitude && parsed.longitude && parsed.district) {
            return parsed;
          }
        } catch {
          return defaultLocation;
        }
      }
    }
    return defaultLocation;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, [location]);

  const clearError = useCallback(() => setError(null), []);

  const setLocation = useCallback((newLocation: FarmLocation) => {
    setLocationState(newLocation);
    setError(null);
  }, []);

  const setDistrict = useCallback((districtName: string) => {
    const districtData = maharashtraDistricts.find(
      (d) => d.district.toLowerCase() === districtName.toLowerCase()
    );
    if (districtData) {
      setLocationState({
        district: districtData.district,
        taluka: districtData.talukas[0] || "",
        village: districtData.district,
        formattedAddress: `${districtData.district}, Maharashtra, India`,
        latitude: districtData.lat,
        longitude: districtData.lon,
        isAutoDetected: false,
      });
      setError(null);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const position = await getBrowserGeolocation();
      const { latitude, longitude } = position.coords;

      // Reverse geocode to get human-readable location
      const geoDetails: GeoLocationDetails = await reverseGeocodeCoordinates(latitude, longitude);

      setLocationState({
        district: geoDetails.district,
        taluka: geoDetails.taluka || "",
        village: geoDetails.village || geoDetails.town || geoDetails.city || "",
        formattedAddress: geoDetails.formattedAddress,
        latitude,
        longitude,
        isAutoDetected: true,
      });
    } catch (err: unknown) {
      const geoError = err as GeolocationPositionError;
      if (geoError?.code === 1) {
        setError("Location access was denied. Please select your district manually.");
      } else if (geoError?.code === 2) {
        setError("Unable to detect location. Please check GPS settings or select district manually.");
      } else if (geoError?.code === 3) {
        setError("Location detection timed out. Please select your district manually.");
      } else {
        setError("Could not retrieve GPS coordinates. Please select your district manually.");
      }
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const currentDistrictInfo =
    maharashtraDistricts.find(
      (d) => d.district.toLowerCase() === location.district.toLowerCase()
    ) || findNearestDistrict(location.latitude, location.longitude);

  return (
    <FarmLocationContext.Provider
      value={{
        location,
        districtInfo: currentDistrictInfo,
        setLocation,
        setDistrict,
        detectLocation,
        isDetecting,
        error,
        clearError,
      }}
    >
      {children}
    </FarmLocationContext.Provider>
  );
}

export function useFarmLocation() {
  const context = useContext(FarmLocationContext);
  if (!context) {
    throw new Error("useFarmLocation must be used within a FarmLocationProvider");
  }
  return context;
}

export function getDistrictData(district: string) {
  return maharashtraDistricts.find((d) => d.district.toLowerCase() === district.toLowerCase());
}
