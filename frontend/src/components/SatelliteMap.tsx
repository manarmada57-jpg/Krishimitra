/**
 * SatelliteMap.tsx
 * Full ISRO VEDAS-integrated Leaflet map component for KrishiMitra.
 *
 * Features:
 *  - OpenStreetMap + ArcGIS World Imagery base layers
 *  - ISRO VEDAS WMS overlays: NDVI, Soil Moisture, Land Use, Rainfall
 *  - Live satellite insights panel (NDVI trend, soil moisture, farmer advice)
 *  - NDVI time-series chart using recharts
 *  - Active farm boundary polygon from onboarding coordinates
 *  - Layer control legend
 *  - Full bilingual (English / Hindi) support
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Globe,
  Layers,
  Sprout,
  Droplets,
  ThermometerSun,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Satellite,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
} from "lucide-react";
import { translations, Language } from "../types";
import { useFarmProfile, defaultFarmProfile } from "../context/FarmContext";
import { apiFetch } from "../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SatelliteMapProps {
  language: Language;
}

interface NdviRecord {
  date: string;
  ndvi: number;
  quality: number;
}

interface SoilRecord {
  date: string;
  soilMoisture: number;
  depth: string;
}

interface SatelliteMetrics {
  averageNdvi: number;
  ndviTrend: "Improving" | "Stable" | "Declining";
  ndviTrendValue: number;
  latestNdvi: number;
  latestSoilMoisture: number | null;
  latestSoilMoistureDepth: string;
  healthStatus: "Healthy" | "Moderate Stress" | "Poor / Stressed";
  healthStatusHi: string;
  farmerAdvice: string;
  farmerAdviceHi: string;
  observationCount: number;
  dataSource: "VEDAS_LIVE" | "VEDAS_SIMULATED";
}

interface SatelliteInsights {
  raw: {
    ndviFetchedAt: string;
    ndviSeries: NdviRecord[];
    soilSeries: SoilRecord[];
  };
  metrics: SatelliteMetrics;
}

// VEDAS WMS configuration
const VEDAS_WMS_URL = "https://vedas.sac.gov.in/wms/";
const VEDAS_LAYERS = {
  ndvi: "MODIS_NDVI_250M",
  soilMoisture: "SMOS_SOIL_MOISTURE",
  landUse: "LULC_CLASS_30M",
  rainfall: "IMD_RAINFALL_DAILY",
};

// ─── Helper: Build VEDAS WMS TileLayer ────────────────────────────────────────

function createVedasWmsLayer(layerName: string, opacity = 0.65): L.TileLayer.WMS {
  return L.tileLayer.wms(VEDAS_WMS_URL, {
    layers: layerName,
    format: "image/png",
    transparent: true,
    opacity,
    attribution: "© ISRO VEDAS / SAC",
    version: "1.3.0",
    // Error fallback: VEDAS WMS returns blank tiles if the key is missing — that is safe
  });
}

// ─── Health Status UI Helpers ─────────────────────────────────────────────────

function HealthBadge({ status, isHi }: { status: string; isHi: boolean }) {
  if (status === "Healthy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 size={13} />
        {isHi ? "स्वस्थ" : "Healthy"}
      </span>
    );
  }
  if (status === "Moderate Stress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle size={13} />
        {isHi ? "मध्यम तनाव" : "Moderate Stress"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
      <XCircle size={13} />
      {isHi ? "खराब / तनाव में" : "Poor / Stressed"}
    </span>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Improving") return <TrendingUp size={16} className="text-emerald-600" />;
  if (trend === "Declining") return <TrendingDown size={16} className="text-red-500" />;
  return <Minus size={16} className="text-amber-500" />;
}

// ─── NDVI Chart Tooltip ───────────────────────────────────────────────────────

function NdviTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const ndvi = payload[0]?.value as number;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-700">{label}</p>
      <p className="text-emerald-700 font-mono font-bold">NDVI: {ndvi?.toFixed(3)}</p>
      <p className="text-gray-400">{ndvi >= 0.55 ? "Healthy 🟢" : ndvi >= 0.35 ? "Moderate 🟡" : "Stressed 🔴"}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SatelliteMap({ language }: SatelliteMapProps) {
  const { farmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";

  // Leaflet DOM refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const farmerMarkerRef = useRef<L.Marker | null>(null);
  const farmBoundaryRef = useRef<L.Polygon | null>(null);

  // WMS layer refs
  const ndviWmsRef = useRef<L.TileLayer.WMS | null>(null);
  const soilWmsRef = useRef<L.TileLayer.WMS | null>(null);
  const landUseWmsRef = useRef<L.TileLayer.WMS | null>(null);
  const rainfallWmsRef = useRef<L.TileLayer.WMS | null>(null);
  const satelliteTileRef = useRef<L.TileLayer | null>(null);

  // Layer toggles
  const [showSatellite, setShowSatellite] = useState(true);
  const [showNdvi, setShowNdvi] = useState(false);
  const [showSoilMoisture, setShowSoilMoisture] = useState(false);
  const [showLandUse, setShowLandUse] = useState(false);
  const [showRainfall, setShowRainfall] = useState(false);

  // Satellite insights state
  const [insights, setInsights] = useState<SatelliteInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Farm coordinates from onboarding (live from context, never hardcoded)
  const centerLat = farmProfile.lat || defaultFarmProfile.lat;
  const centerLng = farmProfile.lng || defaultFarmProfile.lng;
  const centerCoords: [number, number] = [centerLat, centerLng];

  // ── Fetch VEDAS satellite insights ──────────────────────────────────────────

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await apiFetch(
        `/api/crops/satellite-insights?lat=${centerLat}&lng=${centerLng}`
      );
      if (res.success && res.data) {
        setInsights(res.data as SatelliteInsights);
      } else {
        setInsightsError("Could not load satellite data.");
      }
    } catch (err: any) {
      setInsightsError(err?.message ?? "Network error fetching satellite data.");
    } finally {
      setInsightsLoading(false);
    }
  }, [centerLat, centerLng]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // ── Initialize Leaflet map ──────────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      mapRef.current = map;

      // ── Base layers ──
      const osmTile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
      );

      satelliteTileRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri — Source: Esri, USDA, USGS", maxZoom: 19 }
      );

      // Default: satellite imagery
      satelliteTileRef.current.addTo(map);

      // ── VEDAS WMS overlays (added but hidden until toggled) ──
      ndviWmsRef.current = createVedasWmsLayer(VEDAS_LAYERS.ndvi, 0.7);
      soilWmsRef.current = createVedasWmsLayer(VEDAS_LAYERS.soilMoisture, 0.65);
      landUseWmsRef.current = createVedasWmsLayer(VEDAS_LAYERS.landUse, 0.55);
      rainfallWmsRef.current = createVedasWmsLayer(VEDAS_LAYERS.rainfall, 0.60);

      // ── Native Leaflet layer control ──
      L.control.layers(
        {
          "🛰 Satellite (ESRI)": satelliteTileRef.current,
          "🗺 OpenStreetMap": osmTile,
        },
        {
          "🌿 NDVI (ISRO VEDAS)": ndviWmsRef.current,
          "💧 Soil Moisture (SMOS)": soilWmsRef.current,
          "🌾 Land Use (LULC)": landUseWmsRef.current,
          "🌧 Rainfall (IMD)": rainfallWmsRef.current,
        },
        { position: "topright", collapsed: false }
      ).addTo(map);

      // ── Farmer marker ──
      const farmerIcon = L.divIcon({
        className: "",
        html: `<div style="
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          font-size: 11px;
          font-weight: 700;
          border-radius: 10px;
          padding: 5px 10px;
          box-shadow: 0 4px 14px rgba(22,163,74,0.4);
          border: 2px solid white;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
        ">🧑‍🌾 ${farmProfile.farmerName} · ${farmProfile.locationName}</div>`,
        iconSize: [190, 36],
        iconAnchor: [95, 18],
      });

      farmerMarkerRef.current = L.marker(centerCoords, { icon: farmerIcon })
        .bindPopup(
          `<div style="font-family:'Inter',sans-serif;padding:4px">
            <b style="color:#166534">🌾 ${farmProfile.locationName}</b><br/>
            <span style="font-size:11px;color:#555">Crop: <b>${farmProfile.cropName}</b> · ${farmProfile.cropAreaAcres} Acres</span><br/>
            <span style="font-size:11px;color:#555">Farmer: ${farmProfile.farmerName}</span><br/>
            <span style="font-size:10px;font-family:monospace;color:#888">📍 ${centerLat.toFixed(5)}°N, ${centerLng.toFixed(5)}°E</span>
          </div>`
        )
        .addTo(map);

      // ── Farm boundary polygon (from onboarding) ──
      if (Array.isArray(farmProfile.boundaryPolygon) && farmProfile.boundaryPolygon.length >= 3) {
        const polyCoords = farmProfile.boundaryPolygon.map(
          (p) => [p.lat, p.lng] as [number, number]
        );
        const farmPoly = L.polygon(polyCoords, {
          color: "#22c55e",
          fillColor: "#4ade80",
          fillOpacity: 0.25,
          weight: 3,
          dashArray: "6, 4",
        })
          .bindPopup(
            `<div style="font-family:'Inter',sans-serif;padding:4px">
              <b style="color:#166534">📐 Farm Boundary</b><br/>
              <span style="font-size:11px;color:#555">${farmProfile.farmAreaAcres} Acres · ${farmProfile.cropName}</span>
            </div>`
          )
          .addTo(map);

        farmBoundaryRef.current = farmPoly;
        map.fitBounds(farmPoly.getBounds(), { padding: [40, 40] });
      }

      // ── Scale control ──
      L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

    } catch (err: any) {
      console.error("[SatelliteMap] Leaflet init error:", err);
      setMapError(err?.message ?? "Could not initialize map.");
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-center when farm location changes ────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView(centerCoords, 14);
    if (farmerMarkerRef.current) {
      farmerMarkerRef.current.setLatLng(centerCoords);
    }
  }, [centerLat, centerLng]);

  // ── Toggle WMS overlay layers ────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const toggle = (layerRef: React.MutableRefObject<L.TileLayer.WMS | null>, show: boolean) => {
      if (!layerRef.current) return;
      if (show) layerRef.current.addTo(map);
      else layerRef.current.remove();
    };

    toggle(ndviWmsRef, showNdvi);
    toggle(soilWmsRef, showSoilMoisture);
    toggle(landUseWmsRef, showLandUse);
    toggle(rainfallWmsRef, showRainfall);

    if (satelliteTileRef.current) {
      if (showSatellite) satelliteTileRef.current.addTo(map);
      else satelliteTileRef.current.remove();
    }
  }, [showNdvi, showSoilMoisture, showLandUse, showRainfall, showSatellite]);

  // ── Derived chart data ────────────────────────────────────────────────────────

  const ndviChartData = (insights?.raw.ndviSeries ?? [])
    .filter((r) => r.quality === 0)
    .slice(-12)
    .map((r) => ({
      date: r.date.slice(5), // "MM-DD"
      ndvi: r.ndvi,
    }));

  const m = insights?.metrics;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 fade-in pb-12">

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <Satellite className="text-agri-green animate-spin-slow" size={24} />
            {isHi ? "ISRO VEDAS उपग्रह विश्लेषण" : "ISRO VEDAS Satellite Analyst"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isHi
              ? `${farmProfile.locationName} प्रक्षेत्र पर VEDAS NDVI व मृदा नमी सेटेलाइट डेटा।`
              : `Live NDVI & soil moisture insights from ISRO VEDAS for ${farmProfile.locationName}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="bg-agri-lightgreen text-agri-dark text-xs px-3 py-1.5 rounded-full font-mono font-bold border border-green-100">
            📍 {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E
          </div>
          {m && (
            <div className="text-xs px-3 py-1.5 rounded-full font-bold border bg-sky-50 text-sky-700 border-sky-100">
              {m.dataSource === "VEDAS_LIVE" ? "🛰 VEDAS Live" : "🔬 VEDAS Simulated"}
            </div>
          )}
          <button
            onClick={fetchInsights}
            disabled={insightsLoading}
            className="flex items-center gap-1.5 text-xs bg-agri-green text-white px-3 py-1.5 rounded-full font-bold hover:bg-agri-dark transition-colors disabled:opacity-60"
          >
            <RefreshCw size={12} className={insightsLoading ? "animate-spin" : ""} />
            {isHi ? "अपडेट" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ─── Farm Summary Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="satellite-action-card good">
          <div className="satellite-action-icon"><Sprout size={22} /></div>
          <div>
            <small>{isHi ? "सक्रिय फसल" : "Active Crop"}</small>
            <strong>{farmProfile.cropName} ({farmProfile.cropAreaAcres} Acres)</strong>
            <p>{isHi ? `बुवाई: ${farmProfile.sowingDate}` : `Sown: ${farmProfile.sowingDate}`}</p>
          </div>
        </div>

        <div className="satellite-action-card warn">
          <div className="satellite-action-icon"><Droplets size={22} /></div>
          <div>
            <small>{isHi ? "मिट्टी व सिंचाई" : "Soil & Water"}</small>
            <strong>{farmProfile.soilType} · {farmProfile.waterSource}</strong>
            <p>{isHi ? `सिंचाई: ${farmProfile.hasIrrigation ? "उपलब्ध" : "अनुलब्ध"}` : `Irrigation: ${farmProfile.hasIrrigation ? "Available" : "N/A"}`}</p>
          </div>
        </div>

        <div className={`satellite-action-card ${m?.healthStatus === "Healthy" ? "good" : m?.healthStatus === "Moderate Stress" ? "warn" : "danger"}`}>
          <div className="satellite-action-icon"><ThermometerSun size={22} /></div>
          <div>
            <small>{isHi ? "VEDAS फसल स्वास्थ्य" : "VEDAS Crop Health"}</small>
            <strong>{m ? (isHi ? m.healthStatusHi : m.healthStatus) : "—"}</strong>
            <p>{m ? `NDVI: ${m.latestNdvi.toFixed(3)} · ${m.observationCount} obs.` : (isHi ? "लोड हो रहा है..." : "Loading...")}</p>
          </div>
        </div>
      </div>

      {/* ─── VEDAS Metrics Panel ─── */}
      {insightsLoading && (
        <div className="bg-white rounded-3xl border border-green-50 p-6 flex items-center justify-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin text-agri-green" size={20} />
          <span className="text-sm font-medium">
            {isHi ? "ISRO VEDAS से उपग्रह डेटा प्राप्त हो रहा है..." : "Fetching satellite data from ISRO VEDAS..."}
          </span>
        </div>
      )}

      {insightsError && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} />
          <span>{insightsError}</span>
        </div>
      )}

      {m && !insightsLoading && (
        <div className="satellite-result-panel">
          <div>
            <p className="mandi-kicker">{isHi ? "VEDAS उपग्रह परिणाम" : "VEDAS SATELLITE RESULT"}</p>
            <h2 className="flex items-center gap-2 flex-wrap">
              {farmProfile.locationName} — {farmProfile.farmerName}
              <HealthBadge status={m.healthStatus} isHi={isHi} />
            </h2>
            <p className="text-sm mt-2 opacity-80">
              {isHi ? m.farmerAdviceHi : m.farmerAdvice}
            </p>
          </div>
          <div className="satellite-result-grid">
            <div>
              <small>NDVI ({isHi ? "औसत" : "Avg"})</small>
              <strong>{m.averageNdvi.toFixed(3)}</strong>
              <span className="flex items-center gap-1">
                <TrendIcon trend={m.ndviTrend} />
                {isHi
                  ? m.ndviTrend === "Improving" ? "सुधरता हुआ" : m.ndviTrend === "Declining" ? "घटता हुआ" : "स्थिर"
                  : m.ndviTrend}
              </span>
            </div>
            <div>
              <small>{isHi ? "ताजा NDVI" : "Latest NDVI"}</small>
              <strong>{m.latestNdvi.toFixed(3)}</strong>
              <span>{isHi ? "अंतिम पास" : "Last pass"}</span>
            </div>
            <div>
              <small>{isHi ? "मृदा नमी" : "Soil Moisture"}</small>
              <strong>{m.latestSoilMoisture !== null ? `${m.latestSoilMoisture}%` : "—"}</strong>
              <span>{m.latestSoilMoistureDepth}</span>
            </div>
            <div>
              <small>{isHi ? "टिप्पणियाँ" : "Observations"}</small>
              <strong>{m.observationCount}</strong>
              <span>MODIS 16-day</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── NDVI Time-Series Chart ─── */}
      {ndviChartData.length > 0 && (
        <div className="bg-white rounded-3xl border border-green-50 p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 font-display text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-agri-green" />
            {isHi ? "NDVI समय श्रृंखला (पिछले 90 दिन)" : "NDVI Time-Series (Last 90 Days)"}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ndviChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickCount={5} />
              <Tooltip content={<NdviTooltip />} />
              <ReferenceLine y={0.55} stroke="#16a34a" strokeDasharray="4 3" label={{ value: "Healthy", fill: "#16a34a", fontSize: 9, position: "right" }} />
              <ReferenceLine y={0.35} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: "Stress", fill: "#f59e0b", fontSize: 9, position: "right" }} />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#ndviGrad)"
                dot={{ fill: "#16a34a", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#15803d" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-600 inline-block rounded" />NDVI</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-emerald-500 inline-block border-t border-dashed border-emerald-500" />Healthy threshold (0.55)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-amber-400 inline-block border-t border-dashed border-amber-400" />Stress threshold (0.35)</span>
          </div>
        </div>
      )}

      {/* ─── Map + Layer Controls ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Layer sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs">
            <h3 className="font-bold text-gray-900 font-display text-base flex items-center gap-1.5 pb-3 border-b border-gray-100 mb-4">
              <Layers size={18} className="text-agri-green" />
              {t.mapLayers}
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: "sat",
                  label: isHi ? "उपग्रह छवि" : "Satellite Imagery",
                  sub: "ESRI World Imagery",
                  color: "gray",
                  checked: showSatellite,
                  set: setShowSatellite,
                },
                {
                  id: "ndvi",
                  label: isHi ? "NDVI (वनस्पति)" : "NDVI (Vegetation)",
                  sub: "MODIS 250m · ISRO VEDAS",
                  color: "emerald",
                  checked: showNdvi,
                  set: setShowNdvi,
                },
                {
                  id: "soil",
                  label: isHi ? "मृदा नमी" : "Soil Moisture",
                  sub: "SMOS L3 · ISRO VEDAS",
                  color: "blue",
                  checked: showSoilMoisture,
                  set: setShowSoilMoisture,
                },
                {
                  id: "lulc",
                  label: isHi ? "भूमि उपयोग" : "Land Use / LULC",
                  sub: "30m · ISRO VEDAS",
                  color: "orange",
                  checked: showLandUse,
                  set: setShowLandUse,
                },
                {
                  id: "rain",
                  label: isHi ? "वर्षा (IMD)" : "Rainfall (IMD)",
                  sub: "IMD Daily · ISRO VEDAS",
                  color: "purple",
                  checked: showRainfall,
                  set: setShowRainfall,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  id={`lbl-layer-${item.id}`}
                  className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                    item.checked
                      ? `bg-${item.color}-50 border border-${item.color}-100`
                      : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className={`mt-1 w-4 h-4 accent-${item.color === "gray" ? "gray" : item.color}-700 cursor-pointer`}
                  />
                  <div>
                    <h4 className={`text-sm font-bold font-display text-${item.color === "gray" ? "gray" : item.color}-800`}>
                      {item.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* VEDAS Legend */}
          <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs">
            <h3 className="font-bold text-gray-800 font-display text-sm mb-3 flex items-center gap-1.5">
              <Info size={14} className="text-gray-400" />
              {isHi ? "रंग संकेतक" : "NDVI Legend"}
            </h3>
            <div className="space-y-2 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#1B5E20] inline-block" />0.7–1.0 Dense Vegetation</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#4CAF50] inline-block" />0.5–0.7 Healthy Crop</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#CDDC39] inline-block" />0.3–0.5 Moderate Growth</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#FFC107] inline-block" />0.1–0.3 Sparse/Stressed</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#EF5350] inline-block" />0.0–0.1 Bare Soil</div>
            </div>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-4 border border-green-50 shadow-xs h-[520px] flex flex-col">
            <div className="flex-1 rounded-2xl overflow-hidden relative bg-gray-100">

              <div
                id="satellite-leaflet-map"
                ref={mapContainerRef}
                className="w-full h-full min-h-[440px]"
              />

              {/* Farm info overlay (bottom-left over map) */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-md border border-gray-100 z-[1000] pointer-events-none text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 font-display mb-1">
                  <MapPin size={12} className="text-agri-green" />
                  {farmProfile.locationName}
                </div>
                <div className="text-gray-500 space-y-0.5">
                  <div>🌾 {farmProfile.cropName} · {farmProfile.cropAreaAcres} Acres</div>
                  <div className="font-mono text-[10px]">{centerLat.toFixed(5)}°N, {centerLng.toFixed(5)}°E</div>
                </div>
              </div>

              {mapError && (
                <div className="absolute inset-0 bg-gray-50/95 flex flex-col items-center justify-center p-6 text-center z-[1001]">
                  <AlertCircle className="text-red-500 mb-2" size={40} />
                  <h3 className="font-bold text-gray-800 text-lg">
                    {isHi ? "मानचित्र त्रुटि" : "Map Rendering Error"}
                  </h3>
                  <p className="font-mono text-[10px] bg-red-50 border border-red-100 text-red-600 p-2 rounded-lg mt-3">
                    {mapError}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>
                {isHi
                  ? `🛰 ISRO VEDAS + OpenStreetMap — ${farmProfile.locationName} की भूमि निगरानी सक्रिय है`
                  : `🛰 ISRO VEDAS WMS + OpenStreetMap — Active field monitor for ${farmProfile.locationName}`}
              </span>
              <span className="font-mono text-[10px]">
                {m ? `${m.observationCount} obs · MODIS+SMOS` : "Sentinel-2B"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
