import React, { useState, useEffect } from "react";
import { translations, Crop, Language } from "../types";
import { useFarmProfile } from "../context/FarmContext";
import { apiFetch } from "../utils/api";
import { 
  Sprout, 
  Sparkles, 
  Activity, 
  Calendar, 
  Database, 
  ArrowRight, 
  Layers, 
  Droplet,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  X,
  Plus,
  Loader2,
  MapPin
} from "lucide-react";

interface CropHealthProps {
  language: Language;
  onNavigate: (tab: "home" | "satellite" | "crops" | "weather" | "profile" | "assistant" | "market") => void;
}

export default function CropHealth({ language, onNavigate }: CropHealthProps) {
  const { farmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  
  // Add Crop Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newCropName, setNewCropName] = useState<string>("Wheat (गेहूं)");
  const [newStage, setNewStage] = useState<string>("Sowing / Tillering");
  const [newSowedDate, setNewSowedDate] = useState<string>("2026-06-01");
  const [newExpectedHarvest, setNewExpectedHarvest] = useState<string>("2026-10-15");

  const fetchCrops = () => {
    apiFetch("/api/crops")
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mappedCrops: Crop[] = res.data.map((c: any, index: number) => ({
            id: c._id || `cr${index + 1}`,
            name: c.name || c.cropName || farmProfile.cropName,
            nameHi: c.nameHi || c.cropName || farmProfile.cropName,
            healthScore: c.healthScore || farmProfile.healthScore,
            status: c.status || "healthy",
            ndvi: c.ndvi || farmProfile.ndvi,
            moisture: c.moisture || "Good",
            moistureHi: c.moistureHi || "उत्तम",
            stage: c.stage || "Vegetative Growth",
            stageHi: c.stageHi || "वानस्पतिक विकास",
            sowedDate: c.sowedDate ? (c.sowedDate.includes("T") ? c.sowedDate.split("T")[0] : c.sowedDate) : farmProfile.sowingDate,
            expectedHarvest: c.expectedHarvest || "2026-10-15",
            soilType: farmProfile.soilType,
            soilTypeHi: farmProfile.soilType,
            fertilizerUsed: "DAP / NPK Blend",
            fertilizerUsedHi: "डीएपी / एनपीके मिश्रण"
          }));
          setCrops(mappedCrops);
        } else {
          // Fallback to active farm single source of truth crop
          setCrops([
            {
              id: "cr_active",
              name: farmProfile.cropName,
              nameHi: farmProfile.cropName,
              healthScore: farmProfile.healthScore,
              status: "healthy",
              ndvi: farmProfile.ndvi,
              moisture: "Good",
              moistureHi: "अच्छा",
              stage: "Vegetative Phase",
              stageHi: "वानस्पतिक विकास",
              sowedDate: farmProfile.sowingDate,
              expectedHarvest: "2026-10-15",
              soilType: farmProfile.soilType,
              soilTypeHi: farmProfile.soilType,
              fertilizerUsed: "DAP / Urea",
              fertilizerUsedHi: "डीएपी / यूरिया"
            }
          ]);
        }
      })
      .catch(err => {
        console.error("Error fetching crops from backend:", err);
        setCrops([
          {
            id: "cr_active",
            name: farmProfile.cropName,
            nameHi: farmProfile.cropName,
            healthScore: farmProfile.healthScore,
            status: "healthy",
            ndvi: farmProfile.ndvi,
            moisture: "Good",
            moistureHi: "अच्छा",
            stage: "Vegetative Phase",
            stageHi: "वानस्पतिक विकास",
            sowedDate: farmProfile.sowingDate,
            expectedHarvest: "2026-10-15",
            soilType: farmProfile.soilType,
            soilTypeHi: farmProfile.soilType,
            fertilizerUsed: "DAP / Urea",
            fertilizerUsedHi: "डीएपी / यूरिया"
          }
        ]);
      });
  };

  useEffect(() => {
    fetchCrops();
  }, [farmProfile.cropName, farmProfile.sowingDate]);

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;

    setSubmitting(true);
    const cleanName = newCropName.split("(")[0].trim();
    const response = await apiFetch("/api/crops", {
      method: "POST",
      body: JSON.stringify({
        name: cleanName,
        nameHi: cleanName === "Soybean" ? "सोयाबीन" : cleanName === "Wheat" ? "गेहूं" : cleanName === "Paddy" ? "धान" : cleanName,
        stage: newStage || "Sowing",
        stageHi: newStage || "बुवाई",
        sowedDate: newSowedDate || "2026-06-01",
        expectedHarvest: newExpectedHarvest || "2026-10-15",
        healthScore: 88,
        status: "healthy",
        ndvi: 0.76,
        moisture: "Good",
        moistureHi: "अच्छा"
      })
    });

    setSubmitting(false);
    if (response.success) {
      setShowAddModal(false);
      fetchCrops();
    } else {
      alert(response.message || "Could not add crop");
    }
  };

  const getStatusBadge = (status: "healthy" | "moderate" | "critical") => {
    switch (status) {
      case "healthy": 
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200">
            🟢 {isHi ? "स्वस्थ" : "Healthy"}
          </span>
        );
      case "moderate":
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200">
            🟡 {isHi ? "औसत" : "Moderate"}
          </span>
        );
      case "critical":
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold border border-red-200">
            🔴 {isHi ? "दुर्बल / संकट" : "Critical"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <Sprout className="text-agri-green" size={24} />
            {t.cropHealthPage}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isHi 
              ? `${farmProfile.locationName} में बोई गई फसल (${farmProfile.cropName}, ${farmProfile.cropAreaAcres} एकड़) की लाइव प्रगति रिपोर्ट।` 
              : `Live multispectral telemetry for ${farmProfile.farmerName}'s farm (${farmProfile.cropName} at ${farmProfile.locationName}).`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn-add-new-crop"
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{isHi ? "नई फसल जोड़ें" : "+ Add New Crop"}</span>
          </button>

          <button 
            id="btn-trigger-ai-diagnostic"
            onClick={() => onNavigate("assistant")}
            className="bg-agri-green hover:bg-agri-dark text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            {isHi ? "एआई रोग पत्ती जांच" : "AI Crop Diagnostic"}
          </button>
        </div>
      </div>

      {/* Main Grid: Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crops.map(crop => (
          <div 
            key={crop.id} 
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-emerald-200 transition-all hover:shadow-xs flex flex-col justify-between group"
          >
            <div>
              {/* Card top banner */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 bg-green-50 text-agri-green rounded-2xl group-hover:bg-agri-green group-hover:text-white transition-colors">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">
                      {isHi ? crop.nameHi : crop.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium font-mono">
                      {farmProfile.locationName} &bull; {farmProfile.cropAreaAcres} Acres
                    </p>
                  </div>
                </div>

                {getStatusBadge(crop.status)}
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-4">
                
                <div>
                  <span className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">
                    {t.ndviScore}
                  </span>
                  <span className="text-base font-bold text-gray-800 font-mono mt-0.5 flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-600" />
                    {crop.ndvi}
                  </span>
                </div>

                <div>
                  <span className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">
                    {t.soilMoistureStatus}
                  </span>
                  <span className="text-base font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
                    <Droplet size={14} className="text-blue-500" />
                    {isHi ? crop.moistureHi : crop.moisture}
                  </span>
                </div>

              </div>

              {/* Sowing Dates bar */}
              <div className="flex justify-between items-center text-xs text-gray-500 mt-5 pt-3 border-t border-gray-100 font-medium">
                <span>
                  🌱 {t.sowingStage}: <b className="text-agri-dark font-display">{isHi ? crop.stageHi : crop.stage}</b>
                </span>
                <span className="font-mono bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  {crop.healthScore}% Health
                </span>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="mt-6">
              <button 
                id={`btn-view-${crop.id}`}
                onClick={() => setSelectedCrop(crop)}
                className="w-full bg-agri-lightgreen text-agri-dark font-display font-medium text-xs px-4 py-3 rounded-2xl hover:bg-agri-green hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {t.viewDetails}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Crop detail Modal / Popup */}
      {selectedCrop && (
        <div id="modal-crop-details" className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 fade-in flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-agri-green to-agri-dark text-white p-6 relative">
              <button 
                id="btn-close-modal"
                onClick={() => setSelectedCrop(null)}
                className="absolute right-4 top-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Sprout size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">
                    {isHi ? selectedCrop.nameHi : selectedCrop.name}
                  </h2>
                  <p className="text-xs text-white/70 font-mono mt-0.5">
                    {farmProfile.locationName} &bull; {farmProfile.farmerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
                  <p className="text-xxs text-gray-400 font-bold uppercase">{isHi ? "स्वास्थ्य" : "Health"}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{selectedCrop.healthScore}%</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
                  <p className="text-xxs text-gray-400 font-bold uppercase">{t.ndviScore}</p>
                  <p className="text-lg font-bold text-emerald-800 mt-1 font-mono">{selectedCrop.ndvi}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
                  <p className="text-xxs text-gray-400 font-bold uppercase">{t.soilMoistureStatus}</p>
                  <p className="text-sm font-bold mt-1.5 text-blue-600">
                    {isHi ? selectedCrop.moistureHi : selectedCrop.moisture}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 bg-gray-50/50 p-4.5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{t.sowingStage}</span>
                  <span className="font-bold text-gray-800 font-display">{isHi ? selectedCrop.stageHi : selectedCrop.stage}</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{isHi ? "मिट्टी का प्रकार" : "Soil Category"}</span>
                  <span className="font-bold text-gray-800">{farmProfile.soilType}</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{isHi ? "सिंचाई का स्रोत" : "Water Source"}</span>
                  <span className="font-bold text-gray-800">{farmProfile.waterSource}</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{t.sowedOn}</span>
                  <span className="font-bold text-gray-800 font-mono">{selectedCrop.sowedDate}</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1.5">
                  <span className="text-gray-500 font-medium">{t.expectedHarvest}</span>
                  <span className="font-bold text-agri-dark font-mono">{selectedCrop.expectedHarvest}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3 text-green-800">
                <div className="mt-0.5 text-green-600">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h5 className="font-bold text-xs font-display uppercase tracking-wider">
                    {isHi ? "स्थिति: उत्कृष्ट विकास दर" : "Report: Active Growth Monitoring"}
                  </h5>
                  <p className="text-xs leading-relaxed mt-1">
                    {isHi 
                      ? "आपकी फसल स्वस्थ है। उपग्रह डेटा के अनुसार पत्तियां हरी और मजबूत हैं।" 
                      : "Crop satellite telemetry reflects optimal canopy photosynthesis and moisture levels."}
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button 
                id="btn-close-modal-footer"
                onClick={() => setSelectedCrop(null)}
                className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                {isHi ? "बंद करें" : "Close Details"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add New Crop Modal */}
      {showAddModal && (
        <div id="modal-add-crop" className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 fade-in flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <Plus size={20} />
                {isHi ? "नई फसल पंजीकृत करें" : "Register New Crop"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCropSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {isHi ? "फसल का नाम" : "Crop Name"}
                </label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Wheat (गेहूं)">Wheat / गेहूं</option>
                  <option value="Soybean (सोयाबीन)">Soybean / सोयाबीन</option>
                  <option value="Paddy (धान)">Paddy / धान</option>
                  <option value="Cotton (कपास)">Cotton / कपास</option>
                  <option value="Mustard (सरसों)">Mustard / सरसों</option>
                  <option value="Gram (चना)">Gram / चना</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {isHi ? "विकास का चरण" : "Growth Stage"}
                </label>
                <input 
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  placeholder="e.g. Sowing, Tillering, Flowering"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    {isHi ? "बुवाई तारीख" : "Sowed Date"}
                  </label>
                  <input 
                    type="date"
                    value={newSowedDate}
                    onChange={(e) => setNewSowedDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    {isHi ? "कटाई तारीख" : "Expected Harvest"}
                  </label>
                  <input 
                    type="date"
                    value={newExpectedHarvest}
                    onChange={(e) => setNewExpectedHarvest(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{isHi ? "सुरक्षित करें" : "Save to MongoDB"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
