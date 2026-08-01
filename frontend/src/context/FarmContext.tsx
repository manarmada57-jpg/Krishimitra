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
  id?: string;
  _id?: string;
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
  farms: FarmProfile[];
  activeFarmId: string | null;
  selectActiveFarm: (id: string) => void;
  createFarm: (farm: Partial<FarmProfile>) => Promise<FarmProfile | null>;
  updateFarmProfile: (updates: Partial<FarmProfile>) => void;
  setFullProfile: (profile: FarmProfile) => void;
  isLoading: boolean;
  refreshFromBackend: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType>({
  farmProfile: defaultFarmProfile,
  farms: [],
  activeFarmId: null,
  selectActiveFarm: () => {},
  createFarm: async () => null,
  updateFarmProfile: () => {},
  setFullProfile: () => {},
  isLoading: false,
  refreshFromBackend: async () => {}
});

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farms, setFarmsState] = useState<FarmProfile[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string | null>(() => {
    return localStorage.getItem("krishimitra_active_farm_id");
  });

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
    const savedName = localStorage.getItem("krishimitra_username");
    return {
      ...defaultFarmProfile,
      farmerName: savedName || defaultFarmProfile.farmerName
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync active farm to localStorage on change
  useEffect(() => {
    localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(farmProfile));
    if (farmProfile.farmerName) {
      localStorage.setItem("krishimitra_username", farmProfile.farmerName);
    }
  }, [farmProfile]);

  // Sync activeFarmId to localStorage on change
  useEffect(() => {
    if (activeFarmId) {
      localStorage.setItem("krishimitra_active_farm_id", activeFarmId);
    }
  }, [activeFarmId]);

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
          setFarmProfileState(prev => {
            const updated = {
              ...prev,
              temp: res.data.temp ?? prev.temp,
              humidity: res.data.humidity ?? prev.humidity,
              condition: res.data.condition ?? prev.condition,
              conditionHi: res.data.conditionHi ?? prev.conditionHi,
              weeklyRainfall: res.data.rainfall ?? prev.weeklyRainfall,
              weeklyForecast: Array.isArray(res.data.forecast) && res.data.forecast.length > 0
                ? res.data.forecast
                : prev.weeklyForecast,
            };
            // Update this farm in the farms list state too
            setFarmsState(prevFarms =>
              prevFarms.map(f => f.id === activeFarmId ? { ...f, ...updated } : f)
            );
            return updated;
          });
        }
      })
      .catch(err => console.error("Live weather fetch error:", err));
  }, [farmProfile.lat, farmProfile.lng, activeFarmId]);

  const mapBackendFarmToProfile = (farm: any, username: string): FarmProfile => {
    const idStr = farm._id || farm.id;
    return {
      id: idStr,
      _id: idStr,
      farmerName: username,
      locationName: farm.name || farm.locationName || "My Farm",
      lat: farm.lat ?? defaultFarmProfile.lat,
      lng: farm.lng ?? defaultFarmProfile.lng,
      boundaryPolygon: farm.boundaryPolygon && farm.boundaryPolygon.length > 0 ? farm.boundaryPolygon : defaultFarmProfile.boundaryPolygon,
      farmAreaAcres: farm.farmAreaAcres ?? defaultFarmProfile.farmAreaAcres,
      cropName: farm.cropName || defaultFarmProfile.cropName,
      sowingDate: farm.sowingDate || defaultFarmProfile.sowingDate,
      waterSource: farm.waterSource || defaultFarmProfile.waterSource,
      soilType: farm.soilType || defaultFarmProfile.soilType,
      problem: farm.problem || defaultFarmProfile.problem,
      cropsPerYear: farm.cropsPerYear || defaultFarmProfile.cropsPerYear,
      cropAreaAcres: farm.cropAreaAcres ?? defaultFarmProfile.cropAreaAcres,
      hasIrrigation: farm.hasIrrigation !== undefined ? farm.hasIrrigation : defaultFarmProfile.hasIrrigation,
      additionalProblem: farm.additionalProblem || "",
      ndvi: farm.ndvi ?? defaultFarmProfile.ndvi,
      healthScore: farm.healthScore ?? defaultFarmProfile.healthScore,
      temp: farm.temp ?? defaultFarmProfile.temp,
      humidity: farm.humidity ?? defaultFarmProfile.humidity,
      condition: farm.condition || defaultFarmProfile.condition,
      conditionHi: farm.conditionHi || defaultFarmProfile.conditionHi,
      weeklyRainfall: farm.weeklyRainfall ?? defaultFarmProfile.weeklyRainfall,
      weeklyForecast: farm.weeklyForecast || [],
    };
  };

  const selectActiveFarm = (id: string) => {
    setActiveFarmId(id);
    localStorage.setItem("krishimitra_active_farm_id", id);
    const selected = farms.find(f => f.id === id);
    if (selected) {
      setFarmProfileState(selected);
      localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(selected));
    }
  };

  const createFarm = async (farmData: Partial<FarmProfile>): Promise<FarmProfile | null> => {
    const token = localStorage.getItem("krishimitra_access_token");
    if (!token) return null;

    const username = localStorage.getItem("krishimitra_username") || "Farmer";
    const backendPayload = {
      name: farmData.locationName || "New Farm",
      nameHi: farmData.locationName || "नया प्रक्षेत्र",
      lat: farmData.lat ?? defaultFarmProfile.lat,
      lng: farmData.lng ?? defaultFarmProfile.lng,
      boundaryPolygon: farmData.boundaryPolygon || [],
      farmAreaAcres: farmData.farmAreaAcres ?? defaultFarmProfile.farmAreaAcres,
      cropName: farmData.cropName || defaultFarmProfile.cropName,
      sowingDate: farmData.sowingDate || defaultFarmProfile.sowingDate,
      waterSource: farmData.waterSource || defaultFarmProfile.waterSource,
      soilType: farmData.soilType || defaultFarmProfile.soilType,
      problem: farmData.problem || defaultFarmProfile.problem,
      cropsPerYear: farmData.cropsPerYear || defaultFarmProfile.cropsPerYear,
      cropAreaAcres: farmData.cropAreaAcres ?? farmData.farmAreaAcres ?? defaultFarmProfile.cropAreaAcres,
      hasIrrigation: farmData.hasIrrigation !== undefined ? farmData.hasIrrigation : defaultFarmProfile.hasIrrigation,
      additionalProblem: farmData.additionalProblem || "",
      isCustom: true
    };

    try {
      const res = await apiFetch("/api/farms", {
        method: "POST",
        body: JSON.stringify(backendPayload)
      });

      if (res.success && res.data) {
        const newProfile = mapBackendFarmToProfile(res.data, username);
        setFarmsState(prev => {
          const updatedFarms = [...prev, newProfile];
          return updatedFarms;
        });
        
        setActiveFarmId(newProfile.id!);
        localStorage.setItem("krishimitra_active_farm_id", newProfile.id!);
        setFarmProfileState(newProfile);
        localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(newProfile));

        return newProfile;
      }
    } catch (e) {
      console.error("Failed to create farm on backend:", e);
    }
    return null;
  };

  const updateFarmProfile = (updates: Partial<FarmProfile>) => {
    const backendUpdates: any = { ...updates };
    if (updates.locationName) {
      backendUpdates.name = updates.locationName;
      backendUpdates.nameHi = updates.locationName;
    }

    setFarmProfileState(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(next));
      if (updates.farmerName) {
        localStorage.setItem("krishimitra_username", updates.farmerName);
      }
      return next;
    });

    setFarmsState(prevFarms =>
      prevFarms.map(f => f.id === activeFarmId ? { ...f, ...updates } : f)
    );

    const token = localStorage.getItem("krishimitra_access_token");
    if (token && activeFarmId) {
      apiFetch(`/api/farms/${activeFarmId}`, {
        method: "PATCH",
        body: JSON.stringify(backendUpdates)
      }).catch(err => console.warn("Backend farm sync warning:", err));
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
      let username = localStorage.getItem("krishimitra_username") || "Farmer";
      const profileRes = await apiFetch("/api/users/profile");
      if (profileRes.success && profileRes.data) {
        username = profileRes.data.username || username;
        localStorage.setItem("krishimitra_username", username);
      }

      const farmsRes = await apiFetch("/api/farms");
      if (farmsRes.success && Array.isArray(farmsRes.data)) {
        const loadedFarms = farmsRes.data.map(f => mapBackendFarmToProfile(f, username));
        setFarmsState(loadedFarms);

        if (loadedFarms.length > 0) {
          const savedActiveId = localStorage.getItem("krishimitra_active_farm_id");
          const found = loadedFarms.find(f => f.id === savedActiveId);
          const active = found || loadedFarms[0];

          setActiveFarmId(active.id || null);
          localStorage.setItem("krishimitra_active_farm_id", active.id || "");
          setFarmProfileState(active);
          localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(active));
        } else {
          // Migration fallback
          if (profileRes.success && profileRes.data?.farm) {
            const initialFarm = mapBackendFarmToProfile(profileRes.data.farm, username);
            const created = await createFarm(initialFarm);
            if (created) {
              setFarmsState([created]);
              setActiveFarmId(created.id || null);
              localStorage.setItem("krishimitra_active_farm_id", created.id || "");
              setFarmProfileState(created);
            }
          }
        }
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
        farms,
        activeFarmId,
        selectActiveFarm,
        createFarm,
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
