import React, { useState, useEffect } from "react";
import { translations, mockAlerts, Language } from "../types";
import { useFarmProfile } from "../context/FarmContext";
import { apiFetch } from "../utils/api";
import { 
  CloudRain, 
  MapPin, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  Globe, 
  Sun,
  ShieldAlert,
  Sprout,
  Layers
} from "lucide-react";

interface HomeDashboardProps {
  language: Language;
  onNavigate: (tab: "home" | "satellite" | "crops" | "weather" | "profile" | "assistant" | "market") => void;
  onOpenLocationSettings: () => void;
}

export default function HomeDashboard({ language, onNavigate, onOpenLocationSettings }: HomeDashboardProps) {
  const { farmProfile, updateFarmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";

  const [dbCrops, setDbCrops] = useState<any[]>([]);
  const [mandiHighlight, setMandiHighlight] = useState<any>(null);

  // Dynamic API fetching from backend based on active farm profile
  useEffect(() => {
    // 1. Fetch user crops and sync active health score & NDVI
    apiFetch("/api/crops")
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDbCrops(res.data);
          // Average health score and NDVI across all crops for a representative farm score
          const cropsWithHealth = res.data.filter((c: any) => c.healthScore);
          const cropsWithNdvi   = res.data.filter((c: any) => c.ndvi);
          const avgHealth = cropsWithHealth.length > 0
            ? Math.round(cropsWithHealth.reduce((sum: number, c: any) => sum + c.healthScore, 0) / cropsWithHealth.length)
            : null;
          const avgNdvi = cropsWithNdvi.length > 0
            ? parseFloat((cropsWithNdvi.reduce((sum: number, c: any) => sum + c.ndvi, 0) / cropsWithNdvi.length).toFixed(3))
            : null;
          if (avgHealth !== null || avgNdvi !== null) {
            updateFarmProfile({
              ...(avgHealth !== null ? { healthScore: avgHealth } : {}),
              ...(avgNdvi   !== null ? { ndvi: avgNdvi }         : {}),
            });
          }
        }
      })
      .catch(err => console.error("Error fetching crops:", err));

    // Fallback resolver for frontend-only demo
    const resolveLocationKey = (locationName: string): string => {
      const loc = locationName.toLowerCase();
      if (loc.includes("ludhiana") || loc.includes("punjab")) return "ludhiana";
      if (loc.includes("nagpur") || loc.includes("maharashtra")) return "nagpur";
      if (loc.includes("jaipur") || loc.includes("rajasthan")) return "jaipur";
      if (loc.includes("patna") || loc.includes("bihar")) return "patna";
      if (loc.includes("guntur") || loc.includes("andhra")) return "guntur";
      return "bhopal";
    };

    const mockMandiPresets: Record<string, { modalPrice: number }> = {
      bhopal: { modalPrice: 2680 },
      ludhiana: { modalPrice: 2400 },
      nagpur: { modalPrice: 4420 },
      jaipur: { modalPrice: 5600 },
      patna: { modalPrice: 2200 },
      guntur: { modalPrice: 19200 }
    };

    // 2. Fetch market rate highlight based on active farm location & crop
    const dist = farmProfile.locationName || "Farm Location";
    apiFetch(`/api/market?district=${encodeURIComponent(dist)}`)
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setMandiHighlight(res.data[0]);
        } else {
          // Use frontend fallback if backend is missing
          const locKey = resolveLocationKey(dist);
          setMandiHighlight(mockMandiPresets[locKey]);
        }
      })
      .catch(err => {
        console.error("Error fetching market rate:", err);
        const locKey = resolveLocationKey(dist);
        setMandiHighlight(mockMandiPresets[locKey]);
      });
  }, [farmProfile.locationName, farmProfile.cropName]);

  const activeAlerts = mockAlerts.slice(0, 2);

  return (
    <div className="space-y-6 fade-in pb-10">
      
      {/* Welcome Card & Current Weather Snapshot */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-green-100/50 relative overflow-hidden">
        {/* Decorative farm design element */}
        <div className="absolute right-0 bottom-0 opacity-10 text-emerald-800 -mr-6 -mb-6">
          <Sprout size={180} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-agri-dark font-display font-semibold uppercase text-xs tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-agri-orange animate-pulse"></span>
              {t.appSubtitle}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-1 font-display">
              {t.welcome}, <span className="text-agri-green">{farmProfile.farmerName}</span>
            </h1>
            
            {/* Active Farm Location Trigger */}
            <button 
              onClick={onOpenLocationSettings}
              className="text-gray-500 hover:text-agri-green text-sm flex items-center gap-1.5 mt-1 transition-all hover:scale-[1.01] bg-gray-50 hover:bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-gray-150 pl-1.5"
              title="Click to switch farm profile settings"
            >
              <MapPin size={15} className="text-red-500 animate-bounce" />
              <span className="font-bold text-gray-800">{farmProfile.locationName}</span>
              <span className="text-[10px] bg-agri-green text-white font-bold px-1.5 py-0.5 rounded-md">
                {isHi ? "बदलें ⚙️" : "Change ⚙️"}
              </span>
            </button>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap items-center gap-2 bg-agri-lightgreen p-3 rounded-2xl border border-green-100">
            <div className="flex items-center gap-1 pr-3 border-r border-green-200">
              <Thermometer className="text-red-500" size={18} />
              <span className="font-mono text-lg font-bold text-gray-800">{farmProfile.temp}°C</span>
            </div>
            <div className="flex items-center gap-1 pr-3 border-r border-green-200 pl-2">
              <Droplets className="text-blue-500" size={18} />
              <span className="font-mono text-sm font-semibold text-gray-700">{farmProfile.humidity}% {isHi ? "नमी" : "Hum"}</span>
            </div>
            <div className="flex items-center gap-1.5 pl-2 font-semibold text-sm text-agri-dark">
              <CloudRain className="text-emerald-600" size={18} />
              <span>{isHi ? farmProfile.conditionHi : farmProfile.condition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quick Action links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          id="btn-quick-weather"
          onClick={() => onNavigate("weather")}
          className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all text-left shadow-xs hover:border-emerald-300 group cursor-pointer"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium">{isHi ? "पूर्वानुमान" : "Forecast"}</p>
            <h3 className="font-bold text-gray-800 font-display mt-0.5">{isHi ? "मौसम रिपोर्ट" : "Weather Report"}</h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-agri-green group-hover:text-white transition-colors text-agri-dark">
            <CloudRain size={20} />
          </div>
        </button>

        <button 
          id="btn-quick-crops"
          onClick={() => onNavigate("crops")}
          className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all text-left shadow-xs hover:border-emerald-300 group cursor-pointer"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium">{isHi ? "स्वास्थ्य विवरण" : "Health indices"}</p>
            <h3 className="font-bold text-gray-800 font-display mt-0.5">{isHi ? "फसल स्वास्थ्य" : "Crop Health"}</h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-agri-green group-hover:text-white transition-colors text-agri-dark">
            <Sprout size={20} />
          </div>
        </button>

        <button 
          id="btn-quick-soil"
          onClick={() => onNavigate("profile")}
          className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all text-left shadow-xs hover:border-emerald-300 group cursor-pointer"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium">{isHi ? "कृषि गणना" : "Calculators"}</p>
            <h3 className="font-bold text-gray-800 font-display mt-0.5">{isHi ? "उपज व बहीखाता" : "Yield & Log"}</h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-agri-green group-hover:text-white transition-colors text-agri-dark">
            <TrendingUp size={20} />
          </div>
        </button>

        <button 
          id="btn-quick-maps"
          onClick={() => onNavigate("satellite")}
          className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all text-left shadow-xs hover:border-emerald-300 group cursor-pointer"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium">{isHi ? "भूमि मानचित्रण" : "Field mapping"}</p>
            <h3 className="font-bold text-gray-800 font-display mt-0.5">{isHi ? "सैटेलाइट मैप" : "Satellite Map"}</h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-agri-green group-hover:text-white transition-colors text-agri-dark">
            <Globe size={20} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Alerts & Active Farm Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Farm Card Summary */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 space-y-3.5 shadow-lg border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-extrabold text-emerald-300 uppercase tracking-widest bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                {isHi ? "सक्रिय कृषि प्रोफाइल" : "Active Farm Summary"}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {farmProfile.cropAreaAcres} Acres
              </span>
            </div>
            
            <div>
              <h3 className="text-lg font-black text-white font-display">{farmProfile.locationName}</h3>
              <p className="text-xs text-emerald-200/80 mt-0.5 font-medium">
                🌾 {farmProfile.cropName} &bull; {farmProfile.soilType} &bull; {farmProfile.waterSource}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-800/60 text-xs">
              <div>
                <span className="text-[10px] text-emerald-300/70 block uppercase font-bold">{isHi ? "बुवाई तारीख" : "Sowing Date"}</span>
                <span className="font-bold text-white">{farmProfile.sowingDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300/70 block uppercase font-bold">{isHi ? "सिंचाई सुविधा" : "Irrigation"}</span>
                <span className="font-bold text-emerald-300">{farmProfile.hasIrrigation ? (isHi ? "उपलब्ध (Yes)" : "Available") : (isHi ? "नहीं (No)" : "No")}</span>
              </div>
            </div>

            <button
              id="btn-shortcut-mandi"
              onClick={() => onNavigate("market")}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isHi ? "मंडी भाव व AI भविष्यवाणी देखें" : "CHECK MANDI & AI PREDICTIONS"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
          
          {/* Farm Alerts Banner */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-red-50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-1.5">
                <AlertTriangle className="text-red-500 animate-pulse" size={20} />
                {t.alertsTitle}
              </h2>
              <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {activeAlerts.length}
              </span>
            </div>

            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex gap-3 bg-red-50/50 p-3.5 rounded-2xl border border-red-100/50">
                  <div className="mt-0.5 text-red-600">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      {isHi ? alert.titleHi : alert.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {isHi ? alert.descHi : alert.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Crop Health Score */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-green-50 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Activity className="text-agri-green" size={18} />
              <h3 className="font-bold text-gray-700 text-sm font-display uppercase tracking-wider">{t.healthScore}</h3>
            </div>
            
            <div className="relative inline-flex items-center justify-center m-2">
              <div className="w-28 h-28 rounded-full border-8 border-emerald-100 flex flex-col items-center justify-center bg-emerald-50/30">
                <span className="text-3xl font-black text-agri-dark font-display">{farmProfile.healthScore}</span>
                <span className="text-xs text-gray-400 font-semibold font-mono">/ 100</span>
              </div>
            </div>

            <p className="text-xs font-medium text-emerald-800 leading-relaxed max-w-xs mx-auto mt-2">
              {farmProfile.healthScore >= 80 
                ? (isHi ? "🟢 आपकी फसल स्वस्थ स्थिति में है" : "🟢 Crop is in optimal healthy condition")
                : (isHi ? "🟡 नियमित सिंचाई की सलाह दी जाती है" : "🟡 Regular monitoring advised")}
            </p>
          </div>

        </div>

        {/* Right Side: Mandi Highlight & Satellite Preview */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mandi APMC Price Highlight Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-green-100/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 font-display text-lg flex items-center gap-1.5">
                <TrendingUp className="text-emerald-600" size={20} />
                {isHi ? `${farmProfile.locationName} - मंडी भाव` : `${farmProfile.locationName} APMC Mandi Rates`}
              </h3>
              <span className="text-xs text-gray-400 font-semibold font-mono">
                {farmProfile.cropName}
              </span>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isHi ? `${farmProfile.cropName} का आज का मंडी भाव` : `Today's Rate for ${farmProfile.cropName}`}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-gray-900 font-mono">
                    ₹{mandiHighlight ? mandiHighlight.modalPrice : "--"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">/ {isHi ? "क्विंटल" : "Quintal"}</span>
                  <span className="text-xs text-emerald-600 font-extrabold">▲ +2.7%</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate("market")}
                className="px-4 py-2.5 bg-agri-green hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isHi ? "सभी मंडियों के भाव देखें →" : "View All Mandi Rates →"}
              </button>
            </div>
          </div>

          {/* Satellite Map Preview card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-green-100/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 z-10 relative">
              <h3 className="font-bold text-gray-900 font-display text-lg flex items-center gap-1.5">
                <Globe className="text-emerald-700 animate-spin-slow" size={20} />
                {t.satelliteView}
              </h3>
              <button 
                id="btn-open-satellite"
                onClick={() => onNavigate("satellite")}
                className="text-xs font-bold text-agri-green hover:text-agri-dark flex items-center gap-0.5 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {isHi ? "मैपिंग उपकरण खोलें" : "View Live Satellite"}
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Thumbnail Image using active farm location */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden group border border-emerald-100 shadow-inner">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
                alt="Farm Satellite Aerial preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 saturate-120"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent flex items-end p-4">
                <div className="flex justify-between w-full items-center">
                  <span className="bg-agri-dark/90 text-white text-xxs px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 z-10 uppercase backdrop-blur-sm border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    {farmProfile.locationName} ({farmProfile.lat.toFixed(3)}°, {farmProfile.lng.toFixed(3)}°)
                  </span>
                  <span className="text-xs text-white font-bold font-display shadow-xs bg-emerald-600/90 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    NDVI: {farmProfile.ndvi} Healthy
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
