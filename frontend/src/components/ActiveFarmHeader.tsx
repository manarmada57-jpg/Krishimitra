import React from "react";
import { useFarmProfile } from "../context/FarmContext";
import { Sprout, MapPin, Layers, Droplets, Edit3, ShieldCheck, Sparkles } from "lucide-react";

interface ActiveFarmHeaderProps {
  language: "en" | "hi";
  onOpenSettings?: () => void;
}

export default function ActiveFarmHeader({ language, onOpenSettings }: ActiveFarmHeaderProps) {
  const { farmProfile, farms, activeFarmId, selectActiveFarm } = useFarmProfile();
  const isHi = language === "hi";

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg border-b border-emerald-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left: Active Farm Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-400/30 text-emerald-400 shrink-0">
            <Sprout size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                {isHi ? "सक्रिय कृषि प्रक्षेत्र" : "ACTIVE MONITORED FARM"}
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                👨‍🌾 {farmProfile.farmerName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={activeFarmId || ""}
                onChange={(e) => selectActiveFarm(e.target.value)}
                className="bg-emerald-950/80 border border-emerald-500/30 text-white font-extrabold font-display text-xs sm:text-sm px-2 py-1 rounded-xl outline-none cursor-pointer focus:border-emerald-400"
              >
                {farms.length > 0 ? (
                  farms.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.locationName}
                    </option>
                  ))
                ) : (
                  <option value="" className="bg-slate-900 text-white">{farmProfile.locationName}</option>
                )}
              </select>
              <span className="text-gray-400 text-xs font-mono font-normal">
                ({farmProfile.lat.toFixed(3)}°, {farmProfile.lng.toFixed(3)}°)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Key Farm Attributes */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          {/* Active Crop */}
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">🌱 {isHi ? "फसल:" : "Crop:"}</span>
            <span className="font-extrabold text-white">{farmProfile.cropName}</span>
            <span className="text-gray-300 text-[11px]">({farmProfile.cropAreaAcres} {isHi ? "एकड़" : "Acres"})</span>
          </div>

          {/* Total Area */}
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Layers size={14} className="text-amber-400" />
            <span className="text-amber-300 font-bold">{isHi ? "कुल क्षेत्रफल:" : "Total Area:"}</span>
            <span className="font-extrabold text-white">{farmProfile.farmAreaAcres} {isHi ? "एकड़" : "Acres"}</span>
          </div>

          {/* Soil & Water */}
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 hidden lg:flex">
            <Droplets size={14} className="text-cyan-400" />
            <span className="font-medium text-gray-200">{farmProfile.waterSource}</span>
            <span className="text-gray-400">&bull;</span>
            <span className="font-medium text-gray-200">{farmProfile.soilType}</span>
          </div>
        </div>

        {/* Right: Quick Edit Action */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0 self-end md:self-auto"
          >
            <Edit3 size={14} />
            <span>{isHi ? "प्रोफ़ाइल बदलें" : "Edit Profile"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
