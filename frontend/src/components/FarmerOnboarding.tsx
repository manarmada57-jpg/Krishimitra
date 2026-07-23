import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Sprout,
  Mic,
  MicOff,
  MapPin,
  Locate,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Edit2,
  Calendar,
  Droplets,
  Layers,
  AlertTriangle,
  User,
  Compass,
  Check,
  Loader2,
  Globe,
  RefreshCw
} from "lucide-react";
import { apiFetch } from "../utils/api";

interface FarmerOnboardingProps {
  onComplete: (farmerData: any) => void;
}

export interface OnboardingData {
  language: "hi" | "en";
  farmerName: string;
  locationName: string;
  lat: number;
  lng: number;
  boundaryPolygon: Array<{ lat: number; lng: number }>;
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
}

// Calculate geodesic polygon area in Acres
function calculatePolygonAreaAcres(coords: Array<{ lat: number; lng: number }>): number {
  if (coords.length < 3) return 0;
  const radius = 6378137; // Earth radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const lng1 = (p1.lng * Math.PI) / 180;
    const lng2 = (p2.lng * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (Math.abs(area) * radius * radius) / 2; // Area in sq meters
  const acres = area * 0.000247105; // Convert sq meters to acres
  return Math.round(acres * 100) / 100;
}

// AI Speech Keyword / Field Extractor
function extractFarmInfoFromText(text: string, currentData: OnboardingData) {
  const lower = text.toLowerCase();
  const extracted = { ...currentData };

  // 1. Area Extraction
  const areaMatch = lower.match(/(\d+(?:\.\d+)?)\s*(acre|acres|एकड़|ekad|bigha|बीघा)/i);
  if (areaMatch) {
    let num = parseFloat(areaMatch[1]);
    if (areaMatch[2].includes("bigha") || areaMatch[2].includes("बीघा")) {
      num = num * 0.625; // Convert Bigha to Acres approx
    }
    extracted.farmAreaAcres = Math.round(num * 100) / 100;
    extracted.cropAreaAcres = Math.round(num * 100) / 100;
  }

  // 2. Crop Extraction
  if (lower.includes("soybean") || lower.includes("सोयाबीन")) extracted.cropName = "Soybean";
  else if (lower.includes("wheat") || lower.includes("गेहूं") || lower.includes("gehun")) extracted.cropName = "Wheat";
  else if (lower.includes("rice") || lower.includes("paddy") || lower.includes("धान") || lower.includes("chawal")) extracted.cropName = "Rice (Paddy)";
  else if (lower.includes("cotton") || lower.includes("कपास") || lower.includes("kapas")) extracted.cropName = "Cotton";
  else if (lower.includes("maize") || lower.includes("मक्का") || lower.includes("makka")) extracted.cropName = "Maize";
  else if (lower.includes("mustard") || lower.includes("सरसों") || lower.includes("sarson")) extracted.cropName = "Mustard";
  else if (lower.includes("chana") || lower.includes("gram") || lower.includes("चना")) extracted.cropName = "Gram (Chana)";

  // 3. Soil Type Extraction
  if (lower.includes("black") || lower.includes("काली") || lower.includes("kali")) extracted.soilType = "Black Soil";
  else if (lower.includes("alluvial") || lower.includes("दोमट") || lower.includes("domat")) extracted.soilType = "Alluvial Soil";
  else if (lower.includes("red") || lower.includes("लाल") || lower.includes("lal")) extracted.soilType = "Red Soil";
  else if (lower.includes("sandy") || lower.includes("बलुई") || lower.includes("balui")) extracted.soilType = "Sandy Soil";

  // 4. Water Source Extraction
  if (lower.includes("canal") || lower.includes("नहर") || lower.includes("nahar")) extracted.waterSource = "Canal";
  else if (lower.includes("tubewell") || lower.includes("borewell") || lower.includes("नलकूप") || lower.includes("बोरावेअल")) extracted.waterSource = "Tubewell / Borewell";
  else if (lower.includes("rain") || lower.includes("बारिश") || lower.includes("barish")) extracted.waterSource = "Rainfed";
  else if (lower.includes("well") || lower.includes("कुआं") || lower.includes("kuwa")) extracted.waterSource = "Open Well";

  // 5. Problem Extraction
  if (lower.includes("pest") || lower.includes("कीड़ा") || lower.includes("insect") || lower.includes("keeda")) extracted.problem = "Pest Attack";
  else if (lower.includes("blight") || lower.includes("disease") || lower.includes("बीमारी") || lower.includes("dhabba")) extracted.problem = "Fungal Blight";
  else if (lower.includes("water") || lower.includes("पानी") || lower.includes("drought") || lower.includes("सूखा")) extracted.problem = "Water Shortage";
  else if (lower.includes("weed") || lower.includes("खरपतवार")) extracted.problem = "Weed Growth";

  // 6. Sowing Date (Defaults to current season if mentioned)
  if (lower.includes("june") || lower.includes("जून") || lower.includes("last month") || lower.includes("पिछले महीने")) {
    extracted.sowingDate = "20 Jun 2024";
  } else if (lower.includes("july") || lower.includes("जुलाई")) {
    extracted.sowingDate = "05 Jul 2024";
  } else if (lower.includes("november") || lower.includes("नवंबर")) {
    extracted.sowingDate = "15 Nov 2024";
  }

  return extracted;
}

export default function FarmerOnboarding({ onComplete }: FarmerOnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Master Farmer Onboarding Form Data
  const [formData, setFormData] = useState<OnboardingData>({
    language: "hi",
    farmerName: "",
    locationName: "Harda, Madhya Pradesh",
    lat: 22.3395,
    lng: 77.0984,
    boundaryPolygon: [],
    farmAreaAcres: 2.64,
    cropName: "Soybean",
    sowingDate: "20 Jun 2024",
    waterSource: "Canal",
    soilType: "Black Soil",
    problem: "Pest Attack",
    cropsPerYear: "One",
    cropAreaAcres: 2.0,
    hasIrrigation: true,
    additionalProblem: ""
  });

  // Voice recognition states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");

  // Map references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");

  // Translation helper
  const isHi = formData.language === "hi";

  // Update specific form field helper
  const updateForm = (key: keyof OnboardingData, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  // --- Speech Recognition Trigger ---
  const handleToggleVoice = (targetField?: "farmerName" | "speechAboutFarm" | "additionalProblem") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Mock Fallback
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          if (targetField === "farmerName") {
            updateForm("farmerName", isHi ? "राम अग्रवाल" : "Ram Agrawal");
          } else if (targetField === "speechAboutFarm") {
            const sampleSpeech = isHi
              ? "मेरा खेत हरदा में 3 एकड़ का है। मैंने पिछले महीने सोयाबीन बोया था। पानी नहर से आता है। मिट्टी काली है। पिछली बार कीड़े की समस्या थी।"
              : "My farm is 3 acres in Harda. I planted soybean last month. Water comes from canal. Soil is black. Last year I had pest problems.";
            setSpokenTranscript(sampleSpeech);
            const extracted = extractFarmInfoFromText(sampleSpeech, formData);
            setFormData(extracted);
          } else if (targetField === "additionalProblem") {
            updateForm("additionalProblem", isHi ? "फसल के लिए समय पर खाद नहीं मिलती" : "Lack of timely fertilizer supply");
          }
        }, 2200);
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHi ? "hi-IN" : "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          if (targetField === "farmerName") {
            updateForm("farmerName", transcript);
          } else if (targetField === "speechAboutFarm") {
            setSpokenTranscript(transcript);
            const extracted = extractFarmInfoFromText(transcript, formData);
            setFormData(extracted);
          } else if (targetField === "additionalProblem") {
            updateForm("additionalProblem", transcript);
          }
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Speech Error:", err);
      setIsListening(false);
    }
  };

  // --- Step 2: GPS Location Resolver ---
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateForm("lat", latitude);
        updateForm("lng", longitude);
        updateForm("locationName", isHi ? "जीपीएस प्रक्षेत्र (Harda MP)" : "GPS Field (Harda MP)");
        setStep(3);
      },
      () => setStep(3),
      { enableHighAccuracy: true }
    );
  };

  // --- Step 3: Initialize Leaflet Polygon Map ---
  useEffect(() => {
    if (step !== 3 || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = formData.lat || 22.3395;
    const initialLng = formData.lng || 77.0984;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // High quality Esri Satellite Tile Layer
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS",
      maxZoom: 19
    }).addTo(map);

    // Initial default polygon around center if none drawn
    let initialPolygon = formData.boundaryPolygon;
    if (initialPolygon.length === 0) {
      initialPolygon = [
        { lat: initialLat + 0.001, lng: initialLng - 0.001 },
        { lat: initialLat + 0.0012, lng: initialLng + 0.001 },
        { lat: initialLat - 0.0008, lng: initialLng + 0.0012 },
        { lat: initialLat - 0.001, lng: initialLng - 0.0008 }
      ];
      updateForm("boundaryPolygon", initialPolygon);
      updateForm("farmAreaAcres", calculatePolygonAreaAcres(initialPolygon));
    }

    // Render Polygon Layer
    const latLngs = initialPolygon.map(p => [p.lat, p.lng] as [number, number]);
    const polygon = L.polygon(latLngs, {
      color: "#22c55e",
      fillColor: "#22c55e",
      fillOpacity: 0.35,
      weight: 3
    }).addTo(map);

    polygonLayerRef.current = polygon;
    map.fitBounds(polygon.getBounds(), { padding: [30, 30] });

    // Handle Map Clicks to add new boundary vertices
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
      setFormData(prev => {
        const updatedPoly = [...prev.boundaryPolygon, newPoint];
        const newArea = calculatePolygonAreaAcres(updatedPoly);

        if (polygonLayerRef.current) {
          polygonLayerRef.current.setLatLngs(updatedPoly.map(p => [p.lat, p.lng]));
        }
        return {
          ...prev,
          boundaryPolygon: updatedPoly,
          farmAreaAcres: newArea > 0 ? newArea : prev.farmAreaAcres
        };
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [step]);

  // Clear & Reset Map Polygon
  const handleResetPolygon = () => {
    updateForm("boundaryPolygon", []);
    if (polygonLayerRef.current) {
      polygonLayerRef.current.setLatLngs([]);
    }
  };

  // --- Step 7: Render Summary Static Map Preview ---
  const summaryMapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (step !== 7 || !summaryMapRef.current) return;

    const map = L.map(summaryMapRef.current, {
      center: [formData.lat, formData.lng],
      zoom: 16,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false
    });

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map);

    if (formData.boundaryPolygon.length > 0) {
      const polygon = L.polygon(
        formData.boundaryPolygon.map(p => [p.lat, p.lng] as [number, number]),
        { color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.4, weight: 3 }
      ).addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [15, 15] });
    }

    return () => {
      map.remove();
    };
  }, [step]);

  // --- Final Save & Dashboard Unlock ---
  const handleFinalSubmit = async () => {
    setLoading(true);

    try {
      // 1. Post to backend passwordless farmer onboarding API
      const res = await apiFetch("/api/farmer/onboard", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (res.success && res.data) {
        localStorage.setItem("krishimitra_access_token", res.data.accessToken);
        localStorage.setItem("krishimitra_refresh_token", res.data.refreshToken);
        localStorage.setItem("krishimitra_username", formData.farmerName);
        localStorage.setItem("krishimitra_onboarded", "true");
      }
    } catch (err) {
      console.warn("Backend sync fallback, saving locally:", err);
    } finally {
      localStorage.setItem("krishimitra_farmer_profile", JSON.stringify(formData));
      localStorage.setItem("krishimitra_username", formData.farmerName || "Farmer");
      localStorage.setItem("krishimitra_onboarded", "true");
      setLoading(false);
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 font-sans text-slate-800">
      
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-md bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col min-h-[640px] relative">
        
        {/* Top Header Bar */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Sprout size={20} />
              </div>
              <span className="font-extrabold text-slate-900 text-sm font-display">KrishiMitra AI</span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-emerald-600"
                    : i < step
                    ? "w-2.5 bg-emerald-300"
                    : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Screen Content */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between">

          {/* SCREEN 1: Language & Farmer Name */}
          {step === 1 && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Farmer Banner Illustration */}
                <div className="bg-gradient-to-b from-emerald-50 to-green-100/60 p-6 rounded-3xl text-center space-y-2 relative overflow-hidden border border-emerald-100">
                  <div className="w-20 h-20 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 text-3xl font-bold">
                    👨‍🌾
                  </div>
                  <h2 className="text-xl font-black text-slate-900 font-display">
                    {isHi ? "कृषि मित्र AI में आपका स्वागत है" : "Welcome to KrishiMitra AI"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isHi ? "आइए आपके खेत को सेटअप करें" : "Let's set up your farm"}
                  </p>
                </div>

                {/* Language Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "भाषा चुनें" : "Choose Language"}
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => updateForm("language", "hi")}
                      className={`py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isHi ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      हिंदी
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm("language", "en")}
                      className={`py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        !isHi ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Farmer Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "आपका नाम क्या है?" : "What is your name?"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isHi ? "अपना नाम लिखें..." : "Enter your name..."}
                      value={formData.farmerName}
                      onChange={e => updateForm("farmerName", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900 text-sm font-semibold px-4 py-3.5 rounded-2xl outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleVoice("farmerName")}
                      className={`absolute right-2.5 top-2.5 p-2 rounded-xl transition-all ${
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 text-slate-700 hover:bg-emerald-100"
                      }`}
                    >
                      <Mic size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.farmerName.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
              >
                <span>{isHi ? "आगे बढ़ें" : "Continue"}</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* SCREEN 2: Farm Location */}
          {step === 2 && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="text-center space-y-2 pt-2">
                  <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-200">
                    <MapPin size={32} />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isHi ? "आपका खेत कहाँ स्थित है?" : "Where is your farm?"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium px-4">
                    {isHi
                      ? "आप अपने वर्तमान जीपीएस स्थान का उपयोग कर सकते हैं या मानचित्र पर चुन सकते हैं"
                      : "You can use your current location or select on map"}
                  </p>
                </div>

                {/* Option 1: GPS Detect */}
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="w-full bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-500 p-4 rounded-2xl text-left flex items-center gap-4 transition-all cursor-pointer group"
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Locate size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isHi ? "मेरे वर्तमान स्थान का उपयोग करें" : "Use My Current Location"}
                    </h3>
                    <p className="text-xs text-slate-500">{isHi ? "GPS का उपयोग करके खोजें" : "Detect using GPS"}</p>
                  </div>
                </button>

                {/* Option 2: Select on Map */}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-500 p-4 rounded-2xl text-left flex items-center gap-4 transition-all cursor-pointer group"
                >
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isHi ? "मानचित्र पर खेत चुनें" : "Select Farm Location on Map"}
                    </h3>
                    <p className="text-xs text-slate-500">{isHi ? "खोजें और मैन्युअल रूप से चुनें" : "Search and select manually"}</p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
              >
                <span>{isHi ? "आगे बढ़ें" : "Continue"}</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* SCREEN 3: Select Farm Boundary (Interactive Leaflet Map) */}
          {step === 3 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 font-display">
                      {isHi ? "अपने खेत की सीमा बनाएं" : "Draw Your Farm Boundary"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isHi ? "मानचित्र पर बिंदु दबाकर खेत की सीमा बनाएं" : "Tap on map to connect field boundary points"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPolygon}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>{isHi ? "रीसेट" : "Reset"}</span>
                  </button>
                </div>

                {/* Leaflet Map Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner h-64 w-full">
                  <div ref={mapContainerRef} className="w-full h-full z-10" />

                  {/* Area Detected Overlay Card */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
                        {isHi ? "अनुमानित क्षेत्रफल" : "Area Detected"}
                      </span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {formData.farmAreaAcres} {isHi ? "एकड़ (Acres)" : "Acres"}
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <Edit2 size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <span>{isHi ? "आगे बढ़ें" : "Continue"}</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* SCREEN 4: Tell Us About Your Farm (Speech AI Extraction) */}
          {step === 4 && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center space-y-2 pt-2">
                  <h2 className="text-xl font-black text-slate-900 font-display">
                    {isHi ? "अपने खेत के बारे में बताएं" : "Tell us About your Farm"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium px-4">
                    {isHi
                      ? "आप अपनी भाषा में बोल सकते हैं और AI स्वचालित विवरण भरेगा"
                      : "You can speak in your own words and AI will fill the details"}
                  </p>
                </div>

                {/* Animated Speech Mic Trigger */}
                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    type="button"
                    onClick={() => handleToggleVoice("speechAboutFarm")}
                    className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse shadow-red-500/30"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                    }`}
                  >
                    <Mic size={48} />
                  </button>
                  <p className="text-xs font-bold text-slate-600 mt-3">
                    {isListening
                      ? isHi ? "सुन रहा है... बोलना शुरू करें" : "Listening... Start speaking"
                      : isHi ? "माइक दबाएं और बोलना शुरू करें" : "Tap mic and start speaking"}
                  </p>
                </div>

                {/* Realtime Spoken Transcript or Example */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
                    {spokenTranscript ? (isHi ? "आपकी आवाज़:" : "Spoken Text:") : (isHi ? "उदाहरण (Example):" : "Example:")}
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                    {spokenTranscript || (isHi
                      ? `"मेरा खेत हरदा में 3 एकड़ का है। मैंने पिछले महीने सोयाबीन बोया था। पानी नहर से आता है। मिट्टी काली है। पिछली बार कीड़े की समस्या थी।"`
                      : `"My farm is 3 acres in Harda. I planted soybean last month. Water comes from canal. Soil is black. Last year I had pest problems."`)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <span>{isHi ? "आगे बढ़ें" : "Continue"}</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* SCREEN 5: Information Detected Card & Confirm */}
          {step === 5 && (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isHi ? "AI द्वारा पहचाना गया विवरण" : "Here's what we understood"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isHi ? "कृपया जांचें और पुष्टि करें" : "Please check and confirm"}
                  </p>
                </div>

                {/* Structured Detected Fields */}
                <div className="space-y-2.5">
                  {[
                    { label: isHi ? "खेत का क्षेत्रफल" : "Farm Area", val: `${formData.farmAreaAcres} Acres`, key: "farmAreaAcres" },
                    { label: isHi ? "मुख्य फसल" : "Crop", val: formData.cropName, key: "cropName" },
                    { label: isHi ? "बुवाई की तारीख" : "Sowing Date", val: formData.sowingDate, key: "sowingDate" },
                    { label: isHi ? "सिंचाई का स्रोत" : "Water Source", val: formData.waterSource, key: "waterSource" },
                    { label: isHi ? "मिट्टी का प्रकार" : "Soil Type", val: formData.soilType, key: "soilType" },
                    { label: isHi ? "प्रमुख समस्या" : "Problem You Face", val: formData.problem, key: "problem" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900">{item.val}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = prompt(isHi ? `${item.label} बदलें:` : `Edit ${item.label}:`, item.val);
                          if (val) updateForm(item.key as any, val);
                        }}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        {isHi ? "संपादित करें" : "Edit"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <span>{isHi ? "सही है, आगे बढ़ें →" : "Looks Good, Continue →"}</span>
              </button>
            </div>
          )}

          {/* SCREEN 6: Additional Information */}
          {step === 6 && (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isHi ? "कुछ और आवश्यक विवरण" : "A few more details"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isHi ? "बेहतर सुझाव देने में हमारी मदद करें" : "Help us give you better suggestions"}
                  </p>
                </div>

                {/* Crops Per Year */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "साल में कितनी फसलें उगाते हैं?" : "How many crops do you grow in a year?"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["One", "Two", "Three", "More"].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateForm("cropsPerYear", opt)}
                        className={`py-3 rounded-xl font-bold text-xs cursor-pointer border ${
                          formData.cropsPerYear === opt
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "वर्तमान फसल का क्षेत्रफल (एकड़ में)" : "Current crop area (in acres)"}
                  </label>
                  <input
                    type="number"
                    value={formData.cropAreaAcres}
                    onChange={e => updateForm("cropAreaAcres", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold px-4 py-3 rounded-2xl outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Irrigation Facility Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "क्या आपके पास सिंचाई की सुविधा है?" : "Do you have irrigation facility?"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateForm("hasIrrigation", true)}
                      className={`py-3 rounded-xl font-bold text-xs cursor-pointer border ${
                        formData.hasIrrigation
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isHi ? "हाँ (Yes)" : "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm("hasIrrigation", false)}
                      className={`py-3 rounded-xl font-bold text-xs cursor-pointer border ${
                        !formData.hasIrrigation
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isHi ? "नहीं (No)" : "No"}
                    </button>
                  </div>
                </div>

                {/* Additional Problem Text/Voice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isHi ? "कोई अन्य समस्या? (वैकल्पिक)" : "Any other problems you face? (Optional)"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isHi ? "लिखें या बोलें..." : "Write or speak..."}
                      value={formData.additionalProblem}
                      onChange={e => updateForm("additionalProblem", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold px-4 py-3 rounded-2xl outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleVoice("additionalProblem")}
                      className="absolute right-2.5 top-2 p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-emerald-100"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <span>{isHi ? "आगे बढ़ें" : "Continue"}</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* SCREEN 7: Review & Save (Matching Exact Wireframe Card Layout) */}
          {step === 7 && (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Farmer Banner Illustration */}
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                    👨‍🌾
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 font-display">
                      {isHi ? "खेत के विवरण की समीक्षा करें" : "Review Your Farm Details"}
                    </h2>
                    <p className="text-xs text-slate-500">{formData.farmerName} &bull; {formData.locationName}</p>
                  </div>
                  <CheckCircle2 className="text-emerald-600 ml-auto" size={24} />
                </div>

                {/* 3x3 Summary Grid Card */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: isHi ? "किसान का नाम" : "Farmer Name", val: formData.farmerName },
                    { label: isHi ? "स्थान" : "Location", val: formData.locationName },
                    { label: isHi ? "कुल क्षेत्रफल" : "Farm Area", val: `${formData.farmAreaAcres} Acres` },
                    { label: isHi ? "फसल" : "Crop", val: formData.cropName },
                    { label: isHi ? "बुवाई तारीख" : "Sowing Date", val: formData.sowingDate },
                    { label: isHi ? "सिंचाई स्रोत" : "Water Source", val: formData.waterSource },
                    { label: isHi ? "मिट्टी" : "Soil Type", val: formData.soilType },
                    { label: isHi ? "समस्या" : "Problem", val: formData.problem },
                    { label: isHi ? "फसल क्षेत्रफल" : "Current Crop Area", val: `${formData.cropAreaAcres} Acres` }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900 truncate block">{item.val}</span>
                    </div>
                  ))}
                </div>

                {/* Inset Satellite Boundary Map Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-32 w-full shadow-sm">
                  <div ref={summaryMapRef} className="w-full h-full" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isHi ? "सहेजें और डैशबोर्ड खोलें 🚀" : "Save & Continue 🚀"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {isHi ? "विवरण बदलें (Edit Details)" : "Edit Details"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
