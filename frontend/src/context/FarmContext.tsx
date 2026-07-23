import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export interface FarmPoint {
  lat: number;
  lng: number;
}

export interface WeeklyForecastDay {
  day: string;
  dayHi: string;
  temp: number;
  rainfall: number;
  humidity: number;
}

export interface FarmProfile {
  farmerName: string;
  locationName: string;
  lat: number;
  lng: number;
  boundaryPolygon: FarmPoint[];
  farmAreaAcres: number;
  cropName: string;
  sowingDate: string;
  waterSource: string;
  soilType: string;
  problem: string;
  cropsPerYear: string;
  cropAreaAcres: number;
  hasIrrigation: boolean;
  additionalProblem: string;
  ndvi: number;
  healthScore: number;
  temp: number;
  humidity: number;
  condition: string;
  conditionHi: string;
  weeklyRainfall: number;
  /** Real 7-day forecast from Open-Meteo via backend. Empty array = not yet fetched. */
  weeklyForecast: WeeklyForecastDay[];
}

export const defaultFarmProfile: FarmProfile = {
  farmerName: "Ram Agrawal",
  locationName: "Harda, Madhya Pradesh",
  lat: 22.3395,
  lng: 77.0984,
  boundaryPolygon: [
    { lat: 22.3405, lng: 77.0974 },
    { lat: 22.3407, lng: 77.0994 },
    { lat: 22.3387, lng: 77.0996 },
    { lat: 22.3385, lng: 77.0976 }
  ],
  farmAreaAcres: 3.5,
  cropName: "Soybean",
  sowingDate: "20 Jun 2024",
  waterSource: "Canal",
  soilType: "Black Soil",
  problem: "Pest Attack",
  cropsPerYear: "Two",
  cropAreaAcres: 3.5,
  hasIrrigation: true,
  additionalProblem: "",
  ndvi: 0.76,
  healthScore: 88,
  temp: 32,
  humidity: 65,
  condition: "Partly Cloudy",
  conditionHi: "आंशिक रूप से बादल",
  weeklyRainfall: 14,
  weeklyForecast: [],
};

interface FarmContextType {
  farmProfile: FarmProfile;
  updateFarmProfile: (updates: Partial<FarmProfile>) => void;
  setFullProfile: (profile: FarmProfile) => void;
  isLoading: boolean;
  refreshFromBackend: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType>({
  farmProfile: defaultFarmProfile,
  updateFarmProfile: () => {},
  setFullProfile: () => {},
  isLoading: false,
  refreshFromBackend: async () => {}
});

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmProfile, setFarmProfileState] = useState<FarmProfile>(() => {
    const saved = localStorage.getItem("krishimitra_farmer_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultFarmProfile, ...parsed };
      } catch (e) {
        console.error("Error parsing saved farm profile:", e);
      }
    }
    // Check fallback individual keys
    const savedName = localStorage.getItem("krishimitra_username");
    return {
      ...defaultFarmProfile,
      farmerName: savedName || defaultFarmProfile.farmerName
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(farmProfile));
    if (farmProfile.farmerName) {
      localStorage.setItem("krishimitra_username", farmProfile.farmerName);
    }
  }, [farmProfile]);

  // Auto-resync farm profile from MongoDB on mount for authenticated returning users
  useEffect(() => {
    const token = localStorage.getItem("krishimitra_access_token");
    if (token) {
      refreshFromBackend();
    }
  }, []);

  // Sync weather telemetry (including real 7-day forecast) for active farm coordinates
  useEffect(() => {
    if (!farmProfile.lat || !farmProfile.lng) return;
    apiFetch(`/api/weather/forecast?lat=${farmProfile.lat}&lng=${farmProfile.lng}`)
      .then(res => {
        if (res.success && res.data) {
          setFarmProfileState(prev => ({
            ...prev,
            temp: res.data.temp ?? prev.temp,
            humidity: res.data.humidity ?? prev.humidity,
            condition: res.data.condition ?? prev.condition,
            conditionHi: res.data.conditionHi ?? prev.conditionHi,
            weeklyRainfall: res.data.rainfall ?? prev.weeklyRainfall,
            // Save the real Open-Meteo 7-day forecast array
            weeklyForecast: Array.isArray(res.data.forecast) && res.data.forecast.length > 0
              ? res.data.forecast
              : prev.weeklyForecast,
          }));
        }
      })
      .catch(err => console.error("Live weather fetch error:", err));
  }, [farmProfile.lat, farmProfile.lng]);

  const updateFarmProfile = (updates: Partial<FarmProfile>) => {
    setFarmProfileState(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(next));
      if (updates.farmerName) {
        localStorage.setItem("krishimitra_username", updates.farmerName);
      }
      return next;
    });

    // Fire & forget backend patch sync if authenticated
    const token = localStorage.getItem("krishimitra_access_token");
    if (token) {
      apiFetch("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify(updates)
      }).catch(err => console.warn("Backend profile sync warning:", err));
    }
  };

  const setFullProfile = (profile: FarmProfile) => {
    setFarmProfileState(profile);
    localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(profile));
    if (profile.farmerName) {
      localStorage.setItem("krishimitra_username", profile.farmerName);
    }
  };

  const refreshFromBackend = async () => {
    const token = localStorage.getItem("krishimitra_access_token");
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/users/profile");
      if (res.success && res.data) {
        const p = res.data;
        const f = p.farm;
        setFarmProfileState(prev => ({
          ...prev,
          farmerName: p.username || prev.farmerName,
          locationName: f?.name || f?.locationName || prev.locationName,
          lat: f?.lat ?? prev.lat,
          lng: f?.lng ?? prev.lng,
          boundaryPolygon: f?.boundaryPolygon && f.boundaryPolygon.length > 0 ? f.boundaryPolygon : prev.boundaryPolygon,
          farmAreaAcres: f?.farmAreaAcres ?? prev.farmAreaAcres,
          cropName: f?.cropName || prev.cropName,
          sowingDate: f?.sowingDate || prev.sowingDate,
          waterSource: f?.waterSource || prev.waterSource,
          soilType: f?.soilType || prev.soilType,
          problem: f?.problem || prev.problem,
          cropsPerYear: f?.cropsPerYear || prev.cropsPerYear,
          cropAreaAcres: f?.cropAreaAcres ?? prev.cropAreaAcres,
          hasIrrigation: f?.hasIrrigation !== undefined ? f.hasIrrigation : prev.hasIrrigation,
          additionalProblem: f?.additionalProblem ?? prev.additionalProblem,
          ndvi: f?.ndvi ?? prev.ndvi,
          healthScore: f?.healthScore ?? prev.healthScore
        }));
      }
    } catch (e) {
      console.error("Failed to refresh profile from backend:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FarmContext.Provider
      value={{
        farmProfile,
        updateFarmProfile,
        setFullProfile,
        isLoading,
        refreshFromBackend
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmProfile = () => useContext(FarmContext);
