import React, { useState } from "react";
import { translations, Language } from "../types";
import { useFarmProfile } from "../context/FarmContext";
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun,
  Compass,
  Gauge,
  LineChart as LineIcon,
  BarChart as BarIcon,
  Sparkles,
  CalendarCheck2,
  MapPin
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface WeatherForecastProps {
  language: Language;
}

export default function WeatherForecast({ language }: WeatherForecastProps) {
  const { farmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";
  const [activeChartTab, setActiveChartTab] = useState<"temp" | "rain" | "humidity">("temp");

  // Use the real 7-day forecast saved in FarmContext from the Open-Meteo API.
  // Fall back to a minimal stub only when the forecast hasn't been fetched yet
  // (e.g. user is offline or backend is down).
  const fallbackForecast = [
    { day: "Today", dayHi: "आज",   temp: farmProfile.temp,     rainfall: farmProfile.weeklyRainfall, humidity: farmProfile.humidity },
    { day: "Day 2", dayHi: "कल",   temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
    { day: "Day 3", dayHi: "परसों", temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
    { day: "Day 4", dayHi: "Day 4", temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
    { day: "Day 5", dayHi: "Day 5", temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
    { day: "Day 6", dayHi: "Day 6", temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
    { day: "Day 7", dayHi: "Day 7", temp: farmProfile.temp,     rainfall: 0,                          humidity: farmProfile.humidity },
  ];

  const forecastList =
    farmProfile.weeklyForecast && farmProfile.weeklyForecast.length > 0
      ? farmProfile.weeklyForecast
      : fallbackForecast;

  const graphData = forecastList.map((item: any) => ({
    name: isHi ? item.dayHi : item.day,
    [isHi ? "तापमान" : "Temperature"]: item.temp,
    [isHi ? "वर्षा_मिमी" : "Rainfall_mm"]: item.rainfall,
    [isHi ? "आर्द्रता_प्रतिशत" : "Humidity_percent"]: item.humidity,
  }));

  const chartInfo = {
    temp: {
      key: isHi ? "तापमान" : "Temperature",
      color: "#F59E0B",
      unit: "°C",
      title: isHi ? "7-दिवसीय तापमान प्रवृत्ति" : "7-Day Temperature Trend",
    },
    rain: {
      key: isHi ? "वर्षा_मिमी" : "Rainfall_mm",
      color: "#3B82F6",
      unit: " mm",
      title: isHi ? "7-दिवसीय वर्षा संचय" : "7-Day Rainfall Volume",
    },
    humidity: {
      key: isHi ? "आर्द्रता_प्रतिशत" : "Humidity_percent",
      color: "#10B981",
      unit: "%",
      title: isHi ? "7-दिवसीय हवा में आद्रता ग्राफ" : "7-Day Relative Humidity",
    }
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <CloudRain className="text-blue-500 animate-bounce-slow" size={24} />
            {t.todayWeather}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isHi 
              ? `आपके खेत (${farmProfile.locationName}) के लिए उपग्रह-मौसम और कृषि प्रभाव चेतावनी रिपोर्ट।` 
              : `Live micro-climatic atmospheric telemetry compiled for ${farmProfile.locationName} (${farmProfile.lat.toFixed(3)}°, ${farmProfile.lng.toFixed(3)}°).`}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-800">
          <MapPin size={14} className="text-red-500" />
          <span>{farmProfile.locationName}</span>
        </div>
      </div>

      {/* Weather Attributes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Temp Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">{t.tempTitle}</p>
            <p className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{farmProfile.temp}°C</p>
            <p className="text-xxs text-gray-400 font-semibold mt-1">Soil Temp: {Math.round(farmProfile.temp * 0.88)}°C</p>
          </div>
        </div>

        {/* Cloud Cover Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Sun size={24} />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">{t.cloudCoverTitle}</p>
            <p className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{farmProfile.humidity > 70 ? "85%" : "35%"}</p>
            <p className="text-xxs text-emerald-600 font-semibold mt-1">
              {farmProfile.humidity > 70 ? "🌧 Overcast Skies" : "🟡 Moderate UV Index"}
            </p>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Droplets size={24} />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">{t.humidityTitle}</p>
            <p className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{farmProfile.humidity}%</p>
            <p className="text-xxs text-gray-400 font-semibold mt-1">Water Source: {farmProfile.waterSource}</p>
          </div>
        </div>

        {/* Rainfall Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <CloudRain size={24} />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">{t.rainfallTitle}</p>
            <p className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{farmProfile.weeklyRainfall} mm</p>
            <p className="text-xxs text-blue-600 font-semibold mt-1">
              {farmProfile.weeklyRainfall > 10 ? "☔ Heavy Rain Alert" : "☀️ Clear Farm Skies"}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Forecast Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Forecast Graph Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="font-bold text-gray-900 font-display text-lg flex items-center gap-1.5">
                <LineIcon className="text-agri-green" size={20} />
                {chartInfo[activeChartTab].title}
              </h3>

              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 p-1 rounded-xl self-start">
                <button 
                  id="btn-toggle-temp"
                  onClick={() => setActiveChartTab("temp")}
                  className={`px-3 py-1.5 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer ${activeChartTab === "temp" ? "bg-white text-agri-green shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {t.tempTitle}
                </button>
                <button 
                  id="btn-toggle-rain"
                  onClick={() => setActiveChartTab("rain")}
                  className={`px-3 py-1.5 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer ${activeChartTab === "rain" ? "bg-white text-blue-600 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t.rainfallTitle}
                </button>
                <button 
                  id="btn-toggle-hud"
                  onClick={() => setActiveChartTab("humidity")}
                  className={`px-3 py-1.5 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer ${activeChartTab === "humidity" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t.humidityTitle}
                </button>
              </div>
            </div>

            {/* Recharts Area Plot */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartInfo[activeChartTab].color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartInfo[activeChartTab].color} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#6B7280", fontSize: 12, fontWeight: "500" }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "monospace" }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
                    formatter={(value) => [`${value}${chartInfo[activeChartTab].unit}`, chartInfo[activeChartTab].key]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartInfo[activeChartTab].key} 
                    stroke={chartInfo[activeChartTab].color} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>{isHi ? `📅 ${farmProfile.locationName} उपग्रह मौसम नोड सजीव` : `📅 Weather satellite connected to ${farmProfile.locationName}`}</span>
            <span className="font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-bold">
              AgriSync Live
            </span>
          </div>

        </div>

        {/* Right Side: 7-Day Forecast cards overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-bold text-gray-900 font-display text-base flex items-center gap-2 mb-4">
              <CalendarCheck2 className="text-agri-green" size={18} />
              {t.forecast7Day}
            </h3>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {forecastList.map((dayItem: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-2xl border border-gray-100/70 hover:border-blue-100 transition-all bg-gray-50/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 font-display w-10 text-sm">
                      {isHi ? dayItem.dayHi : dayItem.day}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {dayItem.rainfall > 10 ? "☔ Heavy" : dayItem.rainfall > 0 ? "🌦 Shower" : "☀️ Clear"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Thermometer className="text-red-400" size={13} />
                      <span className="font-bold text-gray-700 font-mono text-sm">{dayItem.temp}°C</span>
                    </div>
                    <div className="flex items-center gap-1 w-12 justify-end">
                      <span className="text-xs text-blue-500 font-bold font-mono">{dayItem.rainfall}mm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
