import React, { useState, useEffect } from "react";
import { translations, Language } from "./types";
import { farmLocations, createCustomLocation, FarmLocation } from "./locationsData";
import HomeDashboard from "./components/HomeDashboard";
import SatelliteMap from "./components/SatelliteMap";
import CropHealth from "./components/CropHealth";
import WeatherForecast from "./components/WeatherForecast";
import AiAssistant from "./components/AiAssistant";
import FarmManagement from "./components/FarmManagement";
import MandiHub from "./components/MandiHub";
import FarmerOnboarding from "./components/FarmerOnboarding";
import { FarmProvider, useFarmProfile } from "./context/FarmContext";
import { apiFetch } from "./utils/api";
import { 
  Home, 
  Globe, 
  Sprout, 
  CloudRain, 
  Bot, 
  Briefcase, 
  Languages, 
  MapPin,
  Sparkles,
  ChevronRight,
  User,
  Settings,
  Locate,
  Check,
  Loader2,
  X,
  TrendingUp
} from "lucide-react";

function InnerApp() {
  const { farmProfile, updateFarmProfile } = useFarmProfile();

  // Safe default language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("krishimitra_lang");
    return (saved === "hi" || saved === "en") ? saved : "en";
  });

  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("krishimitra_onboarded") === "true";
  });

  const [activeTab, setActiveTab] = useState<"home" | "satellite" | "crops" | "weather" | "assistant" | "profile" | "market">("home");
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isResolvingGPS, setIsResolvingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Temp form states
  const [tempName, setTempName] = useState<string>(farmProfile.farmerName);
  const [tempFarmName, setTempFarmName] = useState<string>(farmProfile.locationName);
  const [tempCrop, setTempCrop] = useState<string>(farmProfile.cropName);
  const [tempArea, setTempArea] = useState<number>(farmProfile.farmAreaAcres);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("krishimitra_access_token");
  });

  // Keep language synchronized
  useEffect(() => {
    localStorage.setItem("krishimitra_lang", language);
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem("krishimitra_access_token");
    localStorage.removeItem("krishimitra_refresh_token");
    localStorage.removeItem("krishimitra_username");
    localStorage.removeItem("krishimitra_location_id");
    localStorage.removeItem("krishimitra_onboarded");
    localStorage.removeItem("krishimitra_farmer_profile");
    setOnboarded(false);
    setIsAuthenticated(false);
  };

  const t = translations[language];

  // Synchronize temp forms when modal opens
  useEffect(() => {
    setTempName(farmProfile.farmerName);
    setTempFarmName(farmProfile.locationName);
    setTempCrop(farmProfile.cropName);
    setTempArea(farmProfile.farmAreaAcres);
  }, [showSettingsModal, farmProfile]);

  // Language switch toggler
  const handleToggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  };

  // Trigger HTML5 GPS location resolver
  const handleResolveGPS = () => {
    setIsResolvingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError(language === "hi" ? "आपका ब्राउज़र स्थान अनुमति का समर्थन नहीं करता है।" : "GPS is not supported by your browser environment.");
      setIsResolvingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const placeName = language === "hi" ? "सजीव जीपीएस प्रक्षेत्र" : "GPS Monitored Field";
        
        updateFarmProfile({
          locationName: placeName,
          lat: latitude,
          lng: longitude
        });
        setIsResolvingGPS(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        let errorMsg = language === "hi" ? "स्थान प्राप्त करने में असमर्थ।" : "Failed to retrieve device location coordinates.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = language === "hi" ? "जीपीएस अनुमति अस्वीकार कर दी गई।" : "Location access permission denied.";
        }
        setGpsError(errorMsg);
        setIsResolvingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Save profile modal updates
  const handleSaveProfileModal = () => {
    updateFarmProfile({
      farmerName: tempName.trim() || "Farmer",
      locationName: tempFarmName.trim() || "Farm Block",
      cropName: tempCrop,
      farmAreaAcres: tempArea
    });
    setShowSettingsModal(false);
  };

  // Nav item list for standard renders
  const navItems = [
    { id: "home", icon: <Home size={20} />, label: t.navHome, labelHi: "होम" },
    { id: "satellite", icon: <Globe size={20} />, label: t.navSatellite, labelHi: "सैटेलाइट" },
    { id: "crops", icon: <Sprout size={20} />, label: t.navCrops, labelHi: "फसलें" },
    { id: "assistant", icon: <Bot size={20} />, label: "Krishi AI", labelHi: "कृषि AI" },
    { id: "weather", icon: <CloudRain size={20} />, label: t.navWeather, labelHi: "मौसम" },
    { id: "market", icon: <TrendingUp size={20} />, label: t.navMarket, labelHi: "मंडी हब" },
    { id: "profile", icon: <User size={20} />, label: "Farm Hub", labelHi: "किसान हब" },
  ];

  // Screen controller
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeDashboard 
            language={language} 
            onNavigate={setActiveTab} 
            onOpenLocationSettings={() => setShowSettingsModal(true)}
          />
        );
      case "satellite":
        return <SatelliteMap language={language} />;
      case "crops":
        return <CropHealth language={language} onNavigate={setActiveTab} />;
      case "weather":
        return <WeatherForecast language={language} />;
      case "market":
        return <MandiHub language={language} />;
      case "assistant":
        return <AiAssistant language={language} />;
      case "profile":
        return <FarmManagement language={language} />;
      default:
        return (
          <HomeDashboard 
            language={language} 
            onNavigate={setActiveTab} 
            onOpenLocationSettings={() => setShowSettingsModal(true)}
          />
        );
    }
  };

  if (!onboarded) {
    return (
      <FarmerOnboarding
        onComplete={(farmerData) => {
          updateFarmProfile(farmerData);
          if (farmerData.language) setLanguage(farmerData.language);
          setOnboarded(true);
          setIsAuthenticated(true);
          localStorage.setItem("krishimitra_onboarded", "true");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-agri-cream flex flex-col justify-between font-sans relative">
      
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-green-150/50 shadow-xs px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Portfolio Name */}
          <div 
            id="brand-logo-trigger"
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-agri-green via-agri-dark to-emerald-800 text-white p-2.5 rounded-2xl group-hover:scale-105 transition-transform">
              <Sprout size={22} className="animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 font-display flex items-center gap-1">
                {t.appTitle}
                <span className="text-agri-orange text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 hidden sm:inline-block">AI v3.5</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase font-display select-none">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick GPS marker badge - click to open location tuning modal */}
            <button 
              id="btn-header-location"
              onClick={() => setShowSettingsModal(true)}
              className="hidden md:flex items-center gap-1.5 bg-agri-lightgreen hover:bg-emerald-100 text-agri-dark font-display font-bold text-xs px-3.5 py-2.5 rounded-2xl border border-emerald-100 transition-all cursor-pointer"
              title="Click to tune location presets"
            >
              <MapPin size={14} className="text-red-500 animate-bounce" />
              <span>{farmProfile.locationName}</span>
              <span className="bg-white/60 text-[9px] px-1.5 py-0.5 rounded-md text-agri-dark">NDVI: {farmProfile.ndvi}</span>
            </button>

            {/* Smart Dual Language Switch Action */}
            <button 
              id="btn-language-switcher"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-emerald-300 px-3.5 py-2 rounded-2.5 text-xs font-bold text-gray-700 hover:text-agri-green hover:bg-emerald-50/20 transition-all cursor-pointer font-display"
              title="Switch language to Hindi/English"
            >
              <Languages size={15} className="text-gray-400" />
              <span>{language === "en" ? "हिंदी (Hindi)" : "English (अंग्रेजी)"}</span>
            </button>

            {/* Dynamic gear wheel for setting tuning */}
            <button 
              id="btn-header-settings"
              onClick={() => setShowSettingsModal(true)}
              className="bg-gray-50 border border-gray-200 text-gray-600 hover:text-agri-green hover:border-emerald-300 p-2.5 rounded-2.5 transition-all cursor-pointer"
              title="Adjust name or farm node parameters"
            >
              <Settings size={18} />
            </button>

            {/* Micro Quick AI trigger brain */}
            <button 
              id="btn-quick-ai-brain"
              onClick={() => setActiveTab("assistant")}
              className="bg-agri-orange hover:bg-orange-500 text-white p-2.5 rounded-2.5 shadow-sm transition-all relative flex items-center justify-center cursor-pointer"
              title="Krishi AI diagnostic"
            >
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
              <Bot size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* DYNAMIC SETTINGS ADJUSTER MODAL PANEL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-150 p-6 space-y-5 relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Settings className="text-agri-green" size={20} />
              <h3 className="text-lg font-bold text-gray-900 font-display">
                {language === "hi" ? "किसान प्रोफ़ाइल व खेत सेटिंग्स" : "Farm Profile Settings"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  {language === "hi" ? "किसान का नाम" : "Farmer Name"}
                </label>
                <input 
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  {language === "hi" ? "खेत का नाम / स्थान" : "Farm / Location Name"}
                </label>
                <input 
                  type="text"
                  value={tempFarmName}
                  onChange={(e) => setTempFarmName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 text-sm font-medium text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    {language === "hi" ? "मुख्य फसल" : "Active Crop"}
                  </label>
                  <input 
                    type="text"
                    value={tempCrop}
                    onChange={(e) => setTempCrop(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    {language === "hi" ? "क्षेत्रफल (एकड़)" : "Area (Acres)"}
                  </label>
                  <input 
                    type="number"
                    value={tempArea}
                    onChange={(e) => setTempArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* GPS trigger inside settings */}
              <button
                type="button"
                onClick={handleResolveGPS}
                disabled={isResolvingGPS}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-100 cursor-pointer"
              >
                {isResolvingGPS ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{language === "hi" ? "जीपीएस सिंक हो रहा है..." : "Locating via GPS..."}</span>
                  </>
                ) : (
                  <>
                    <Locate size={14} />
                    <span>{language === "hi" ? "वर्तमान स्थान (GPS) प्राप्त करें" : "Detect Current GPS Location"}</span>
                  </>
                )}
              </button>

              {gpsError && (
                <p className="text-xxs text-red-500 font-bold text-center">⚠️ {gpsError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleSaveProfileModal}
                className="flex-1 py-3 bg-agri-green hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/10 transition-all cursor-pointer"
              >
                {language === "hi" ? "बदलाव सहेजें" : "Save Changes"}
              </button>
            </div>

            <div className="border-t border-gray-150 pt-4 mt-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition-colors border border-red-100 cursor-pointer"
              >
                {language === "hi" ? "🔒 लॉग आउट (Logout)" : "🔒 Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Desktop Sidebar & Responsive stage layout block */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDE BAR DESKTOP NAVIGATION */}
        <aside className="hidden md:block w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-3xl p-4.5 border border-green-50 shadow-xs space-y-1.5">
            <h4 className="text-xxs font-bold text-gray-400 font-display uppercase tracking-wider px-3 pb-2.5 border-b border-gray-50 mb-3 block">
              {language === "hi" ? "कृषि मित्र मुख्य मेनू" : "KrishiMitra Workspace"}
            </h4>

            {navItems.map(item => (
              <button
                key={item.id}
                id={`btn-desktop-nav-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left font-display text-sm font-semibold p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 ${activeTab === item.id ? "bg-gradient-to-r from-agri-green via-emerald-700 to-agri-dark text-white shadow-md shadow-emerald-700/10 scale-102" : "text-gray-650 hover:bg-gray-50 hover:text-gray-900 border border-transparent"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${activeTab === item.id ? "text-white" : "text-gray-400"}`}>{item.icon}</span>
                  <span>{language === "hi" ? item.labelHi : item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          {/* Quick info footer */}
          <div className="bg-white/50 rounded-3xl p-5 border border-green-150/30 text-center space-y-1.5">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Bharat Agro Intelligence</p>
            <p className="text-xs text-gray-500 font-medium">© 2026 KrishiMitra Corp.</p>
          </div>
        </aside>

        {/* PRIMARY CORNER COMPONENT VIEW WRAPPER */}
        <section className="flex-1 min-w-0" id="primary-visual-work-stage">
          {renderActiveScreen()}
        </section>

      </main>

      {/* 3. Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-150/80 px-2 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.035)]">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <button
              key={item.id}
              id={`btn-mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${activeTab === item.id ? "text-agri-green" : "text-gray-400 hover:text-gray-600"}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === item.id ? "bg-agri-lightgreen text-agri-green" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-bold font-display tracking-tight mt-0.5 whitespace-nowrap">
                {language === "hi" ? item.labelHi : item.label}
              </span>
              {activeTab === item.id && (
                <span className="absolute bottom-0 w-1.5 h-1.5 bg-agri-orange rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <FarmProvider>
      <InnerApp />
    </FarmProvider>
  );
}
