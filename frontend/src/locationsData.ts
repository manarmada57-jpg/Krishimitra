// Agricultural region presets and simulation helpers for KrishiMitra 2026
import { Language } from "./types";

export interface FarmLocation {
  id: string;
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  condition: string;
  conditionHi: string;
  soilTemp: number;
  weeklyRain: number;
  uvIndex: number;
  pressure: number;
  windSpeed: number;
  cloudCover: number;
  ndvi: number;
  forecast: Array<{
    day: string;
    dayHi: string;
    temp: number;
    rainfall: number;
    humidity: number;
  }>;
}

export const farmLocations: FarmLocation[] = [
  {
    id: "bhopal",
    name: "Bhopal, MP",
    nameHi: "भोपाल, मध्य प्रदेश",
    lat: 23.2842,
    lng: 77.4244,
    temp: 32,
    humidity: 65,
    condition: "Partly Cloudy",
    conditionHi: "आंशिक रूप से बादल",
    soilTemp: 28,
    weeklyRain: 12,
    uvIndex: 6,
    pressure: 1011,
    windSpeed: 14,
    cloudCover: 45,
    ndvi: 0.72,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 32, rainfall: 4, humidity: 65 },
      { day: "Sun", dayHi: "रवि", temp: 29, rainfall: 15, humidity: 82 },
      { day: "Mon", dayHi: "सोम", temp: 30, rainfall: 8, humidity: 75 },
      { day: "Tue", dayHi: "मंगल", temp: 31, rainfall: 0, humidity: 62 },
      { day: "Wed", dayHi: "बुध", temp: 33, rainfall: 0, humidity: 55 },
      { day: "Thu", dayHi: "गुरु", temp: 34, rainfall: 0, humidity: 50 },
      { day: "Fri", dayHi: "शुक्र", temp: 35, rainfall: 2, humidity: 58 },
    ]
  },
  {
    id: "ludhiana",
    name: "Ludhiana, Punjab",
    nameHi: "लुधियाना, पंजाब",
    lat: 30.9010,
    lng: 75.8573,
    temp: 36,
    humidity: 48,
    condition: "Sunny & Clear",
    conditionHi: "साफ और तेज धूप",
    soilTemp: 31,
    weeklyRain: 2,
    uvIndex: 8,
    pressure: 1008,
    windSpeed: 10,
    cloudCover: 10,
    ndvi: 0.81,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 36, rainfall: 0, humidity: 48 },
      { day: "Sun", dayHi: "रवि", temp: 37, rainfall: 0, humidity: 45 },
      { day: "Mon", dayHi: "सोम", temp: 35, rainfall: 1, humidity: 50 },
      { day: "Tue", dayHi: "मंगल", temp: 34, rainfall: 0, humidity: 52 },
      { day: "Wed", dayHi: "बुध", temp: 33, rainfall: 0, humidity: 55 },
      { day: "Thu", dayHi: "गुरु", temp: 35, rainfall: 0, humidity: 49 },
      { day: "Fri", dayHi: "शुक्र", temp: 36, rainfall: 0, humidity: 46 },
    ]
  },
  {
    id: "nagpur",
    name: "Nagpur, Maharashtra",
    nameHi: "नागपुर, महाराष्ट्र",
    lat: 21.1458,
    lng: 79.0882,
    temp: 34,
    humidity: 58,
    condition: "Humid & Breeze",
    conditionHi: "उमस और ठंडी हवा",
    soilTemp: 30,
    weeklyRain: 18,
    uvIndex: 7,
    pressure: 1012,
    windSpeed: 16,
    cloudCover: 60,
    ndvi: 0.68,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 34, rainfall: 8, humidity: 58 },
      { day: "Sun", dayHi: "रवि", temp: 31, rainfall: 22, humidity: 78 },
      { day: "Mon", dayHi: "सोम", temp: 30, rainfall: 12, humidity: 80 },
      { day: "Tue", dayHi: "मंगल", temp: 32, rainfall: 4, humidity: 70 },
      { day: "Wed", dayHi: "बुध", temp: 33, rainfall: 0, humidity: 64 },
      { day: "Thu", dayHi: "गुरु", temp: 34, rainfall: 2, humidity: 60 },
      { day: "Fri", dayHi: "शुक्र", temp: 35, rainfall: 0, humidity: 55 },
    ]
  },
  {
    id: "jaipur",
    name: "Jaipur, Rajasthan",
    nameHi: "जयपुर, राजस्थान",
    lat: 26.9124,
    lng: 75.7873,
    temp: 40,
    humidity: 32,
    condition: "Hot & Dry",
    conditionHi: "अत्यधिक गर्म व सूखा",
    soilTemp: 35,
    weeklyRain: 0,
    uvIndex: 9,
    pressure: 1005,
    windSpeed: 18,
    cloudCover: 5,
    ndvi: 0.42,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 40, rainfall: 0, humidity: 32 },
      { day: "Sun", dayHi: "रवि", temp: 41, rainfall: 0, humidity: 30 },
      { day: "Mon", dayHi: "सोम", temp: 39, rainfall: 0, humidity: 35 },
      { day: "Tue", dayHi: "मंगल", temp: 38, rainfall: 0, humidity: 38 },
      { day: "Wed", dayHi: "बुध", temp: 38, rainfall: 0, humidity: 36 },
      { day: "Thu", dayHi: "गुरु", temp: 39, rainfall: 0, humidity: 33 },
      { day: "Fri", dayHi: "शुक्र", temp: 40, rainfall: 0, humidity: 30 },
    ]
  },
  {
    id: "patna",
    name: "Patna, Bihar",
    nameHi: "पटना, बिहार",
    lat: 25.5941,
    lng: 85.1376,
    temp: 31,
    humidity: 75,
    condition: "Moderate Rain showers",
    conditionHi: "हल्की फुहारें और बारिश",
    soilTemp: 27,
    weeklyRain: 25,
    uvIndex: 5,
    pressure: 1010,
    windSpeed: 12,
    cloudCover: 80,
    ndvi: 0.75,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 31, rainfall: 12, humidity: 75 },
      { day: "Sun", dayHi: "रवि", temp: 29, rainfall: 28, humidity: 88 },
      { day: "Mon", dayHi: "सोम", temp: 28, rainfall: 18, humidity: 85 },
      { day: "Tue", dayHi: "मंगल", temp: 30, rainfall: 5, humidity: 78 },
      { day: "Wed", dayHi: "बुध", temp: 31, rainfall: 2, humidity: 75 },
      { day: "Thu", dayHi: "गुरु", temp: 32, rainfall: 0, humidity: 70 },
      { day: "Fri", dayHi: "शुक्र", temp: 33, rainfall: 0, humidity: 68 },
    ]
  },
  {
    id: "guntur",
    name: "Guntur, Andhra Pradesh",
    nameHi: "गुंटूर, आंध्र प्रदेश",
    lat: 16.3067,
    lng: 80.4365,
    temp: 33,
    humidity: 62,
    condition: "Strong Coastal Winds",
    conditionHi: "तेज़ हवाएँ और उमस",
    soilTemp: 29,
    weeklyRain: 8,
    uvIndex: 7,
    pressure: 1009,
    windSpeed: 20,
    cloudCover: 50,
    ndvi: 0.70,
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: 33, rainfall: 2, humidity: 62 },
      { day: "Sun", dayHi: "रवि", temp: 32, rainfall: 10, humidity: 70 },
      { day: "Mon", dayHi: "सोम", temp: 31, rainfall: 15, humidity: 75 },
      { day: "Tue", dayHi: "मंगल", temp: 33, rainfall: 0, humidity: 68 },
      { day: "Wed", dayHi: "बुध", temp: 34, rainfall: 0, humidity: 60 },
      { day: "Thu", dayHi: "गुरु", temp: 35, rainfall: 0, humidity: 58 },
      { day: "Fri", dayHi: "शुक्र", temp: 34, rainfall: 4, humidity: 65 },
    ]
  }
];

// Helper to construct simulated custom locations when a user inputs coordinates
export function createCustomLocation(name: string, lat: number, lng: number): FarmLocation {
  // Generate some realistic pseudo-random parameters based on latitude bands
  const seed = Math.sin(lat) * Math.cos(lng);
  const baseTemp = Math.round(30 + (seed * 5)); // 25 to 35
  const baseHumidity = Math.round(60 + (seed * 20)); // 40 to 80
  const baseSoilTemp = baseTemp - 3;
  const isRainy = baseHumidity > 70;
  
  return {
    id: `custom_${Date.now()}`,
    name,
    nameHi: name,
    lat,
    lng,
    temp: baseTemp,
    humidity: baseHumidity,
    condition: isRainy ? "Showers Expected" : "Partly Clear Skies",
    conditionHi: isRainy ? "वर्षा की संभावना" : "आंशिक रूप से साफ आसमान",
    soilTemp: baseSoilTemp,
    weeklyRain: isRainy ? 15 : 2,
    uvIndex: isRainy ? 4 : 7,
    pressure: 1010,
    windSpeed: Math.round(12 + (seed * 6)),
    cloudCover: isRainy ? 75 : 30,
    ndvi: parseFloat((0.55 + (seed * 0.25)).toFixed(2)), // 0.3 to 0.8
    forecast: [
      { day: "Sat", dayHi: "शनि", temp: baseTemp, rainfall: isRainy ? 6 : 0, humidity: baseHumidity },
      { day: "Sun", dayHi: "रवि", temp: baseTemp - 2, rainfall: isRainy ? 14 : 1, humidity: Math.min(100, baseHumidity + 10) },
      { day: "Mon", dayHi: "सोम", temp: baseTemp - 1, rainfall: isRainy ? 8 : 0, humidity: baseHumidity + 5 },
      { day: "Tue", dayHi: "मंगल", temp: baseTemp, rainfall: 0, humidity: baseHumidity - 5 },
      { day: "Wed", dayHi: "बुध", temp: baseTemp + 1, rainfall: 0, humidity: baseHumidity - 10 },
      { day: "Thu", dayHi: "गुरु", temp: baseTemp + 2, rainfall: 0, humidity: baseHumidity - 12 },
      { day: "Fri", dayHi: "शुक्र", temp: baseTemp + 1, rainfall: isRainy ? 2 : 0, humidity: baseHumidity - 8 },
    ]
  };
}
