import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SoilParameters } from "@/services/cropRecommendationService";

export type SoilInputMode = "manual" | "simulated";
export type WaterAvailability = "low" | "medium" | "high";

interface SoilContextType {
  soil: SoilParameters;
  mode: SoilInputMode;
  waterAvailability: WaterAvailability;
  setMode: (mode: SoilInputMode) => void;
  updateSoil: (params: Partial<SoilParameters>) => void;
  setWaterAvailability: (water: WaterAvailability) => void;
  isSimulated: boolean;
  resetToDefaults: () => void;
}

const STORAGE_KEY = "smartagro_soil_data";

const defaultSoil: SoilParameters = {
  n: 68,
  p: 45,
  k: 52,
  ph: 6.8,
};

const SoilContext = createContext<SoilContextType | null>(null);

export function SoilProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SoilInputMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("smartagro_soil_mode") as SoilInputMode) || "manual";
    }
    return "manual";
  });

  const [waterAvailability, setWaterAvailabilityState] = useState<WaterAvailability>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("smartagro_water_avail") as WaterAvailability) || "medium";
    }
    return "medium";
  });

  const [soil, setSoilState] = useState<SoilParameters>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultSoil;
        }
      }
    }
    return defaultSoil;
  });

  // Simulated telemetry ticker when mode === 'simulated'
  useEffect(() => {
    if (mode !== "simulated") return;

    const interval = setInterval(() => {
      setSoilState((prev) => ({
        n: Math.max(20, Math.min(95, Math.round(prev.n + (Math.random() - 0.5) * 3))),
        p: Math.max(20, Math.min(95, Math.round(prev.p + (Math.random() - 0.5) * 2))),
        k: Math.max(20, Math.min(95, Math.round(prev.k + (Math.random() - 0.5) * 2))),
        ph: Number((Math.max(5.5, Math.min(8.2, prev.ph + (Math.random() - 0.5) * 0.1))).toFixed(1)),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [mode]);

  // Persist manual soil edits
  useEffect(() => {
    if (mode === "manual") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(soil));
    }
  }, [soil, mode]);

  const setMode = (newMode: SoilInputMode) => {
    setModeState(newMode);
    localStorage.setItem("smartagro_soil_mode", newMode);
  };

  const setWaterAvailability = (water: WaterAvailability) => {
    setWaterAvailabilityState(water);
    localStorage.setItem("smartagro_water_avail", water);
  };

  const updateSoil = (params: Partial<SoilParameters>) => {
    setSoilState((prev) => ({ ...prev, ...params }));
  };

  const resetToDefaults = () => {
    setSoilState(defaultSoil);
  };

  return (
    <SoilContext.Provider
      value={{
        soil,
        mode,
        waterAvailability,
        setMode,
        updateSoil,
        setWaterAvailability,
        isSimulated: mode === "simulated",
        resetToDefaults,
      }}
    >
      {children}
    </SoilContext.Provider>
  );
}

export function useSoil() {
  const context = useContext(SoilContext);
  if (!context) {
    throw new Error("useSoil must be used within a SoilProvider");
  }
  return context;
}
