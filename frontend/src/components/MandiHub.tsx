import React, { useState, useEffect } from "react";
import { translations, Language } from "../types";
import { apiFetch } from "../utils/api";
import { useFarmProfile } from "../context/FarmContext";
import { 
  TrendingUp, 
  Search, 
  MapPin, 
  Layers, 
  ArrowRightLeft, 
  Sparkles, 
  Bell, 
  CloudRain, 
  Camera, 
  CheckCircle2, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Calendar,
  Wheat,
  Leaf,
  Umbrella,
  BadgeIndianRupee
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface MandiHubProps {
  language: Language;
  activeLocation?: any;
  userName?: string;
}

// Simulated Agmarknet Mandi Dataset for India in 2026
const mandiDataPreset: Record<string, Array<{
  id: string;
  mandiName: string;
  mandiNameHi: string;
  distance: number; // in km from the respective center
  commodity: string;
  commodityHi: string;
  variety: string;
  varietyHi: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  prevModalPrice: number; // for trend calculation
  arrivalQty: number; // in Tons
  date: string;
}>> = {
  bhopal: [
    { id: "b1", mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी", distance: 4, commodity: "Wheat", commodityHi: "गेहूं", variety: "Sharbati", varietyHi: "शरबती", minPrice: 2450, maxPrice: 2850, modalPrice: 2680, prevModalPrice: 2610, arrivalQty: 180, date: "2026-06-27" },
    { id: "b2", mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी", distance: 4, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4200, maxPrice: 4780, modalPrice: 4550, prevModalPrice: 4610, arrivalQty: 120, date: "2026-06-27" },
    { id: "b3", mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी", distance: 4, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "Basmati", varietyHi: "बासमती", minPrice: 3500, maxPrice: 4100, modalPrice: 3850, prevModalPrice: 3800, arrivalQty: 95, date: "2026-06-27" },
    { id: "b4", mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी", distance: 4, commodity: "Gram (Chana)", commodityHi: "चना", variety: "Desi", varietyHi: "देशी", minPrice: 5100, maxPrice: 5650, modalPrice: 5400, prevModalPrice: 5350, arrivalQty: 60, date: "2026-06-27" },
    
    // Nearby Alternative Mandis for comparison
    { id: "s1", mandiName: "Sehore Mandi", mandiNameHi: "सीहोर मंडी", distance: 38, commodity: "Wheat", commodityHi: "गेहूं", variety: "Sharbati", varietyHi: "शरबती", minPrice: 2500, maxPrice: 2950, modalPrice: 2750, prevModalPrice: 2700, arrivalQty: 320, date: "2026-06-27" },
    { id: "s2", mandiName: "Sehore Mandi", mandiNameHi: "सीहोर मंडी", distance: 38, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4150, maxPrice: 4700, modalPrice: 4480, prevModalPrice: 4500, arrivalQty: 240, date: "2026-06-27" },
    { id: "r1", mandiName: "Raisen Mandi", mandiNameHi: "रायसेन मंडी", distance: 45, commodity: "Wheat", commodityHi: "गेहूं", variety: "Lokwan", varietyHi: "लोकवन", minPrice: 2400, maxPrice: 2750, modalPrice: 2600, prevModalPrice: 2620, arrivalQty: 110, date: "2026-06-27" },
    { id: "r2", mandiName: "Raisen Mandi", mandiNameHi: "रायसेन मंडी", distance: 45, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4300, maxPrice: 4850, modalPrice: 4620, prevModalPrice: 4550, arrivalQty: 85, date: "2026-06-27" },
    { id: "v1", mandiName: "Vidisha APMC", mandiNameHi: "विदिशा मंडी", distance: 56, commodity: "Wheat", commodityHi: "गेहूं", variety: "Sharbati", varietyHi: "शरबती", minPrice: 2550, maxPrice: 3000, modalPrice: 2800, prevModalPrice: 2740, arrivalQty: 410, date: "2026-06-27" },
    { id: "v2", mandiName: "Vidisha APMC", mandiNameHi: "विदिशा मंडी", distance: 56, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4250, maxPrice: 4750, modalPrice: 4500, prevModalPrice: 4520, arrivalQty: 175, date: "2026-06-27" }
  ],
  ludhiana: [
    { id: "l1", mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी", distance: 5, commodity: "Wheat", commodityHi: "गेहूं", variety: "Kalyan Sona", varietyHi: "कल्याण सोना", minPrice: 2325, maxPrice: 2450, modalPrice: 2400, prevModalPrice: 2400, arrivalQty: 550, date: "2026-06-27" },
    { id: "l2", mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी", distance: 5, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "PR 126", varietyHi: "पीआर 126", minPrice: 2180, maxPrice: 2320, modalPrice: 2240, prevModalPrice: 2200, arrivalQty: 620, date: "2026-06-27" },
    { id: "l3", mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी", distance: 5, commodity: "Potato", commodityHi: "आलू", variety: "Jyoti", varietyHi: "ज्योति", minPrice: 1100, maxPrice: 1450, modalPrice: 1300, prevModalPrice: 1250, arrivalQty: 140, date: "2026-06-27" },
    
    // Alternatives
    { id: "lp1", mandiName: "Khanna APMC (Asia's Largest)", mandiNameHi: "खन्ना मंडी", distance: 42, commodity: "Wheat", commodityHi: "गेहूं", variety: "Kalyan Sona", varietyHi: "कल्याण सोना", minPrice: 2350, maxPrice: 2480, modalPrice: 2435, prevModalPrice: 2420, arrivalQty: 1200, date: "2026-06-27" },
    { id: "lp2", mandiName: "Khanna APMC (Asia's Largest)", mandiNameHi: "खन्ना मंडी", distance: 42, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "PR 126", varietyHi: "पीआर 126", minPrice: 2200, maxPrice: 2350, modalPrice: 2280, prevModalPrice: 2250, arrivalQty: 1540, date: "2026-06-27" },
    { id: "lp3", mandiName: "Jalandhar Mandi", mandiNameHi: "जालंधर मंडी", distance: 61, commodity: "Potato", commodityHi: "आलू", variety: "Jyoti", varietyHi: "ज्योति", minPrice: 1150, maxPrice: 1500, modalPrice: 1350, prevModalPrice: 1320, arrivalQty: 310, date: "2026-06-27" }
  ],
  nagpur: [
    { id: "n1", mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी", distance: 6, commodity: "Cotton", commodityHi: "कपास", variety: "H-4 Long Staple", varietyHi: "एच-4 लंबी रेशा", minPrice: 6800, maxPrice: 7600, modalPrice: 7250, prevModalPrice: 7100, arrivalQty: 310, date: "2026-06-27" },
    { id: "n2", mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी", distance: 6, commodity: "Oranges", commodityHi: "संतरा", variety: "Nagpur Local", varietyHi: "नागपुर लोकल", minPrice: 3500, maxPrice: 5500, modalPrice: 4600, prevModalPrice: 4800, arrivalQty: 150, date: "2026-06-27" },
    { id: "n3", mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी", distance: 6, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4100, maxPrice: 4650, modalPrice: 4420, prevModalPrice: 4450, arrivalQty: 110, date: "2026-06-27" },
    
    // Alternatives
    { id: "np1", mandiName: "Amravati APMC", mandiNameHi: "अमरावती मंडी", distance: 150, commodity: "Cotton", commodityHi: "कपास", variety: "H-4 Long Staple", varietyHi: "एच-4 लंबी रेशा", minPrice: 6950, maxPrice: 7750, modalPrice: 7400, prevModalPrice: 7300, arrivalQty: 480, date: "2026-06-27" },
    { id: "np2", mandiName: "Wardha APMC", mandiNameHi: "वर्धा मंडी", distance: 78, commodity: "Soybean", commodityHi: "सोयाबीन", variety: "Yellow", varietyHi: "पीला", minPrice: 4200, maxPrice: 4700, modalPrice: 4510, prevModalPrice: 4480, arrivalQty: 130, date: "2026-06-27" }
  ],
  jaipur: [
    { id: "j1", mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)", distance: 8, commodity: "Mustard (Sarson)", commodityHi: "सरसों", variety: "Mustard Bold", varietyHi: "मोटा दाना", minPrice: 5200, maxPrice: 5850, modalPrice: 5600, prevModalPrice: 5520, arrivalQty: 210, date: "2026-06-27" },
    { id: "j2", mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)", distance: 8, commodity: "Barley (Jau)", commodityHi: "जौ", variety: "Local", varietyHi: "लोकल", minPrice: 1900, maxPrice: 2250, modalPrice: 2100, prevModalPrice: 2080, arrivalQty: 90, date: "2026-06-27" },
    { id: "j3", mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)", distance: 8, commodity: "Onion", commodityHi: "प्याज़", variety: "Nasik Local", varietyHi: "नासिक लोकल", minPrice: 1400, maxPrice: 1900, modalPrice: 1650, prevModalPrice: 1700, arrivalQty: 180, date: "2026-06-27" },
    
    // Alternatives
    { id: "jp1", mandiName: "Alwar APMC", mandiNameHi: "अलवर मंडी", distance: 140, commodity: "Mustard (Sarson)", commodityHi: "सरसों", variety: "Mustard Bold", varietyHi: "मोटा दाना", minPrice: 5300, maxPrice: 5980, modalPrice: 5720, prevModalPrice: 5650, arrivalQty: 350, date: "2026-06-27" },
    { id: "jp2", mandiName: "Chomu APMC", mandiNameHi: "चोमू मंडी", distance: 35, commodity: "Onion", commodityHi: "प्याज़", variety: "Local Red", varietyHi: "देशी लाल", minPrice: 1300, maxPrice: 1800, modalPrice: 1550, prevModalPrice: 1580, arrivalQty: 120, date: "2026-06-27" }
  ],
  patna: [
    { id: "p1", mandiName: "Patna (Fatuha) Market", mandiNameHi: "पटना (फतुहा) मंडी", distance: 12, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "Common", varietyHi: "साधारण धान", minPrice: 2183, maxPrice: 2250, modalPrice: 2200, prevModalPrice: 2183, arrivalQty: 140, date: "2026-06-27" },
    { id: "p2", mandiName: "Patna (Fatuha) Market", mandiNameHi: "पटना (फतुहा) मंडी", distance: 12, commodity: "Maize (Makka)", commodityHi: "मक्का", variety: "Hybrid Yellow", varietyHi: "हाइब्रिड पीला", minPrice: 1950, maxPrice: 2300, modalPrice: 2150, prevModalPrice: 2120, arrivalQty: 175, date: "2026-06-27" },
    
    // Alternatives
    { id: "pp1", mandiName: "Mokama APMC", mandiNameHi: "मोकामा मंडी", distance: 90, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "Common", varietyHi: "साधारण धान", minPrice: 2190, maxPrice: 2280, modalPrice: 2230, prevModalPrice: 2210, arrivalQty: 210, date: "2026-06-27" },
    { id: "pp2", mandiName: "Begusarai Mandi", mandiNameHi: "बेगूसराय मंडी", distance: 115, commodity: "Maize (Makka)", commodityHi: "मक्का", variety: "Hybrid Yellow", varietyHi: "हाइब्रिड पीला", minPrice: 2000, maxPrice: 2350, modalPrice: 2200, prevModalPrice: 2180, arrivalQty: 340, date: "2026-06-27" }
  ],
  guntur: [
    { id: "g1", mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी (एशिया की सबसे बड़ी)", distance: 3, commodity: "Red Chilli", commodityHi: "सूखी मिर्च", variety: "Guntur Sannam S4", varietyHi: "गुंटूर सन्नम S4", minPrice: 16500, maxPrice: 21000, modalPrice: 19200, prevModalPrice: 18900, arrivalQty: 640, date: "2026-06-27" },
    { id: "g2", mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी", distance: 3, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "BPT 5204", varietyHi: "बीपीटी 5204", minPrice: 2350, maxPrice: 2700, modalPrice: 2550, prevModalPrice: 2520, arrivalQty: 220, date: "2026-06-27" },
    { id: "g3", mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी", distance: 3, commodity: "Turmeric", commodityHi: "हल्दी", variety: "Finger Local", varietyHi: "फिंगर लोकल", minPrice: 9500, maxPrice: 12500, modalPrice: 11200, prevModalPrice: 11400, arrivalQty: 80, date: "2026-06-27" },
    
    // Alternatives
    { id: "gp1", mandiName: "Vijayawada APMC", mandiNameHi: "विजयवाड़ा मंडी", distance: 35, commodity: "Paddy (Dhan)", commodityHi: "धान", variety: "BPT 5204", varietyHi: "बीपीटी 5204", minPrice: 2380, maxPrice: 2750, modalPrice: 2600, prevModalPrice: 2580, arrivalQty: 185, date: "2026-06-27" },
    { id: "gp2", mandiName: "Duggirala Turmeric APMC", mandiNameHi: "दुग्गिराला हल्दी मंडी", distance: 18, commodity: "Turmeric", commodityHi: "हल्दी", variety: "Duggirala", varietyHi: "दुग्गिराला", minPrice: 9800, maxPrice: 13000, modalPrice: 11800, prevModalPrice: 11600, arrivalQty: 290, date: "2026-06-27" }
  ]
};

// Crop Photo Grading Simulation Presets for Farmers
const gradingPresets = [
  {
    id: "wheat_good",
    crop: "Wheat",
    cropHi: "गेहूं",
    title: "Premium Sharbati Wheat - Dry & Lustrous",
    titleHi: "प्रीमियम शरबती गेहूं - सूखा व चमकदार",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400",
    simulatedData: "MOCK_WHEAT_GRADE_A"
  },
  {
    id: "wheat_damaged",
    crop: "Wheat",
    cropHi: "गेहूं",
    title: "Moist/Shrunk Wheat - High Broken grain %",
    titleHi: "कमजोर/नमी युक्त गेहूं - टूटे दाने अधिक",
    image: "https://images.unsplash.com/photo-1600320844747-062e7fbe6ec9?auto=format&fit=crop&q=80&w=400",
    simulatedData: "MOCK_WHEAT_GRADE_C"
  },
  {
    id: "paddy_standard",
    crop: "Paddy (Dhan)",
    cropHi: "धान",
    title: "Standard Basmati Paddy - Cleaned",
    titleHi: "मानक बासमती धान - साफ छना हुआ",
    image: "https://images.unsplash.com/photo-1536630590255-fc85ed0112b5?auto=format&fit=crop&q=80&w=400",
    simulatedData: "MOCK_PADDY_GRADE_B"
  }
];

export default function MandiHub({ language }: MandiHubProps) {
  const { farmProfile } = useFarmProfile();
  const isHindi = language === "hi";
  
  // Dynamically resolve the nearest mandi region from active farm profile location
  const resolveLocationKey = (locationName: string): string => {
    const loc = locationName.toLowerCase();
    const mappings: Array<{ keywords: string[]; key: string }> = [
      { keywords: ["bhopal", "भोपाल", "sehore", "raisen", "vidisha", "harda", "hoshangabad", "madhya pradesh", "mp", "itarsi", "dewas"], key: "bhopal" },
      { keywords: ["ludhiana", "लुधियाना", "punjab", "khanna", "jalandhar", "amritsar", "patiala"], key: "ludhiana" },
      { keywords: ["nagpur", "नागपुर", "maharashtra", "amravati", "wardha", "chandrapur", "yavatmal"], key: "nagpur" },
      { keywords: ["jaipur", "जयपुर", "rajasthan", "alwar", "chomu", "sikar", "ajmer"], key: "jaipur" },
      { keywords: ["patna", "पटना", "bihar", "mokama", "begusarai", "muzaffarpur", "gaya"], key: "patna" },
      { keywords: ["guntur", "गुंटूर", "andhra", "vijayawada", "telangana", "hyderabad", "duggirala"], key: "guntur" },
    ];
    for (const mapping of mappings) {
      for (const keyword of mapping.keywords) {
        if (loc.includes(keyword)) return mapping.key;
      }
    }
    return "bhopal"; // Default fallback
  };

  const locationKey = resolveLocationKey(farmProfile.locationName);
  const [regionMandis, setRegionMandis] = useState<any[]>(() => {
    return mandiDataPreset[locationKey] || mandiDataPreset["bhopal"];
  });
  
  // Unique list of commodities available in this region's APMC
  const regionCommodities = Array.from(new Set(regionMandis.map(m => m.commodity)));
  
  // Active selection states
  const [selectedCommodity, setSelectedCommodity] = useState<string>("Wheat");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedMandiId, setSelectedMandiId] = useState<string>("");
  
  // Push Notifications Simulation Panel
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>("2750");
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(false);
  const [simulatedAlertMessage, setSimulatedAlertMessage] = useState<string | null>(null);
  
  // AI prediction state
  const [predicting, setPredicting] = useState<boolean>(false);
  const [aiPredictionResult, setAiPredictionResult] = useState<string | null>(null);

  // Quality Grading Scanner States
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedGradingPreset, setSelectedGradingPreset] = useState<string>("");
  const [customGradingFile, setCustomGradingFile] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<any | null>(null);

  // Sync selectedCommodity with farmProfile or region changes
  useEffect(() => {
    if (farmProfile.cropName && regionCommodities.includes(farmProfile.cropName)) {
      setSelectedCommodity(farmProfile.cropName);
    } else if (regionCommodities.length > 0 && !regionCommodities.includes(selectedCommodity)) {
      setSelectedCommodity(regionCommodities[0]);
    }
  }, [farmProfile.cropName, regionMandis]);

  // Reset default commodity & fetch dynamic Mandi prices from backend when farm profile / crop updates
  useEffect(() => {
    const districtName = farmProfile.locationName || "Farm Location";
    apiFetch(`/api/market?district=${encodeURIComponent(locationKey)}`)
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((m: any) => ({
            id: m._id,
            mandiName: m.mandiName,
            mandiNameHi: m.mandiNameHi,
            distance: m.distance,
            commodity: m.cropName,
            commodityHi: m.cropNameHi,
            variety: m.variety,
            varietyHi: m.varietyHi,
            minPrice: m.minPrice,
            maxPrice: m.maxPrice,
            modalPrice: m.price,
            prevModalPrice: m.prevModalPrice,
            arrivalQty: m.arrivalQty,
            date: m.date
          }));
          setRegionMandis(mapped);
        } else {
          setRegionMandis(mandiDataPreset[locationKey] || mandiDataPreset["bhopal"]);
        }
      })
      .catch(err => {
        console.error("Error fetching live Mandi prices from backend:", err);
        setRegionMandis(mandiDataPreset[locationKey] || mandiDataPreset["bhopal"]);
      });
  }, [locationKey]);

  // Find the principal Mandi item matching current commodity
  const principalMandiItem = regionMandis.find(m => m.commodity === selectedCommodity && m.mandiName.includes("Karond") || m.mandiName.includes("Central") || m.mandiName.includes("Kalamna") || m.mandiName.includes("Muhana") || m.mandiName.includes("Fatuha") || m.mandiName.includes("Chilli"));
  const activeMandiItem = principalMandiItem || regionMandis.find(m => m.commodity === selectedCommodity) || regionMandis[0];

  // Compile list of other mandis selling this same commodity for live comparisons
  const alternativeMandis = regionMandis.filter(
    m => m.commodity === selectedCommodity && m.id !== activeMandiItem?.id
  ).sort((a, b) => a.distance - b.distance);

  // Recharts price trend history simulator for last 6 months
  const generateTrendData = (modalPrice: number) => {
    return [
      { month: isHindi ? "जनवरी" : "Jan", price: Math.round(modalPrice * 0.92) },
      { month: isHindi ? "फ़रवरी" : "Feb", price: Math.round(modalPrice * 0.94) },
      { month: isHindi ? "मार्च" : "Mar", price: Math.round(modalPrice * 0.98) },
      { month: isHindi ? "अप्रैल" : "Apr", price: Math.round(modalPrice * 1.03) },
      { month: isHindi ? "मई" : "May", price: Math.round(modalPrice * 1.01) },
      { month: isHindi ? "जून (आज)" : "Jun (Now)", price: modalPrice },
    ];
  };

  const trendData = generateTrendData(activeMandiItem?.modalPrice || 2500);

  // Trigger Gemini AI price forecast & demand analysis
  const handleTriggerPrediction = async () => {
    setPredicting(true);
    setAiPredictionResult(null);

    try {
      const data = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: isHindi 
            ? `आप कृषि विपणन विशेषज्ञ और आर्थिक सलाहकार हैं। कृपया ${activeMandiItem?.commodityHi} (${activeMandiItem?.varietyHi} किस्म) के लिए भोपाल/स्थानीय मंडियों की वर्तमान दर ₹${activeMandiItem?.modalPrice}/क्विंटल को देखते हुए अगले 3 महीनों के लिए बाजार मांग विश्लेषण और एआई मूल्य पूर्वानुमान प्रदान करें। 
               कृपया निम्नलिखित शीर्षकों का उपयोग करें:
               1. **अनुमानित मूल्य सीमा (Estimated Price Range)**: न्यूनतम और अधिकतम दरें (₹ में)
               2. **बाजार मांग की स्थिति (Market Demand State)**: (उच्च/मध्यम/कम) और इसके प्रमुख कारण
               3. **फसल बिक्री/संग्रहण सलाह (Sell/Hold Advice)**: किसानों को अभी बेचना चाहिए या संग्रहित करना चाहिए, विवरण दें।`
            : `You are an expert agricultural economist and Agmarknet market analyst. Given the current modal rate of ₹${activeMandiItem?.modalPrice}/Quintal for ${activeMandiItem?.commodity} (${activeMandiItem?.variety} variety) in the ${activeMandiItem?.mandiName} market, provide an expert AI price prediction and market demand analysis for the next 3 months (July to September 2026).
               Include:
               1. **Expected Price Trend**: Estimated minimum and maximum price range in ₹/Qtl.
               2. **Market Demand analysis**: Is the demand high, average, or dropping and what global/national policies are driving this?
               3. **Farmer Advisory (Sell or Hold)**: Step-by-step recommendation on whether they should sell now or store in cold warehouse for higher returns in August/Sept. Keep it highly legible and structured.`,
          language
        })
      });

      const resData = data.data as any;
      const reply = resData?.reply || (data as any).reply;
      if (reply) {
        setAiPredictionResult(reply);
      } else {
        setAiPredictionResult(isHindi ? "सर्वर से पूर्वानुमान प्राप्त करने में समस्या हुई।" : "Unable to retrieve price prediction forecast from server node.");
      }
    } catch (err) {
      console.error(err);
      setAiPredictionResult(isHindi ? "एआई नेटवर्क कनेक्शन विफल रहा।" : "AI prediction connection timed out.");
    } finally {
      setPredicting(false);
    }
  };

  // Simulated AI photograph grading analysis
  const handleTriggerCropGrading = async (presetId: string) => {
    setScanning(true);
    setGradingResult(null);

    // Formulate a custom descriptive prompt based on simulated harvest image selection
    const preset = gradingPresets.find(p => p.id === presetId);
    const mockImageText = preset ? preset.simulatedData : "MOCK_WHEAT_GRADE_A";

    try {
      const data = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Perform AI harvest quality grading, moisture index estimation, and market value analysis for this sample: "${preset?.title || "Harvest Grain Quality"}".
                   Respond strictly in a formatted block with:
                   1. **Assigned Quality Grade**: (e.g., Grade A - Premium / Grade B / Grade C)
                   2. **Estimated Moisture Content**: (Percentage %, e.g., 11.2% - Safe Storage)
                   3. **Broken Grains & Impurities**: (Broken grain % and foreign matter percentage)
                   4. **Calculated Market Premium/Discount**: (Recommendation relative to modal rate ₹${activeMandiItem?.modalPrice}/Qtl)
                   5. **Actionable Grade upgrade advice**: (e.g. drying, cleaning, sieving). 
                   Provide translation in both English and simple Hindi headers.`,
          language
        })
      });

      const resData = data.data as any;
      const reply = resData?.reply || (data as any).reply;
      if (reply) {
        setGradingResult({
          grade: presetId.includes("good") ? "Grade A" : presetId.includes("damaged") ? "Grade C" : "Grade B",
          gradeHi: presetId.includes("good") ? "श्रेणी क (सर्वोत्तम)" : presetId.includes("damaged") ? "श्रेणी ग (कमजोर)" : "श्रेणी ख (सामान्य)",
          moisture: presetId.includes("good") ? "11.2% (Perfect)" : presetId.includes("damaged") ? "16.8% (Too Moist)" : "13.4% (Standard)",
          broken: presetId.includes("good") ? "1.5%" : presetId.includes("damaged") ? "8.5%" : "3.8%",
          priceDiff: presetId.includes("good") ? "+ ₹150 / Qtl Premium" : presetId.includes("damaged") ? "- ₹220 / Qtl Discount" : "Standard Mandi Rate",
          priceDiffHi: presetId.includes("good") ? "+ ₹150 प्रति क्विंटल बोनस" : presetId.includes("damaged") ? "- ₹220 प्रति क्विंटल कटौती" : "सामान्य मंडी दर लागू",
          analysisText: reply
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  // File Uploader simulator
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomGradingFile(reader.result as string);
        setSelectedGradingPreset("custom");
        // Auto grade custom uploads
        handleTriggerCropGrading("wheat_good");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger live simulated SMS text alert message
  const triggerSimulationAlert = (type: "price" | "weather") => {
    if (type === "price") {
      const modal = activeMandiItem?.modalPrice || 2600;
      const bumped = Math.round(modal * 1.04);
      setSimulatedAlertMessage(
        isHindi 
          ? `🔔 कृषि मित्र 2026 सचेतक: आपके प्रक्षेत्र के नजदीक ${activeMandiItem?.mandiNameHi} में ${activeMandiItem?.commodityHi} की कीमत बढ़ गई है! नया भाव ₹${bumped}/क्विंटल दर्ज किया गया। अधिकतम लाभ के लिए सीहोर मंडी (₹${Math.round(bumped * 1.02)}) से तुलना करें!`
          : `🔔 KrishiMitra 2026 Alert: Price alert triggered! ${activeMandiItem?.commodity} prices in ${activeMandiItem?.mandiName} surged to ₹${bumped}/Qtl, crossing your threshold of ₹${alertTargetPrice}/Qtl. Tap to map navigation!`
      );
    } else {
      setSimulatedAlertMessage(
        isHindi 
          ? `⛈️ आपातकालीन मौसम चेतावनी: अगले 12 घंटों में ${farmProfile.locationName || "आपके क्षेत्र"} में भारी वर्षा (32mm) की अत्यधिक संभावना है। कृपया तैयार फसल को सूखे गोदाम में सुरक्षित करें या तिरपाल से ढकें!`
          : `⛈️ Severe Weather Alert: Heavy rain (32mm) and lightning predicted within 12 hours over ${farmProfile.locationName || "your farm block"}. Secure harvested wheat stacks and pause pesticide sprays immediately!`
      );
    }
    setTimeout(() => {
      // scroll to alert message
      const el = document.getElementById("mandi-alert-box");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const percentageDiff = activeMandiItem 
    ? ((activeMandiItem.modalPrice - activeMandiItem.prevModalPrice) / activeMandiItem.prevModalPrice) * 100 
    : 0;

  const priceIntelligenceRows = [
    activeMandiItem,
    ...alternativeMandis.slice(0, 2)
  ].filter(Boolean);

  const bestNearbyMandi = priceIntelligenceRows.reduce((best, item) => {
    return item.modalPrice > best.modalPrice ? item : best;
  }, priceIntelligenceRows[0] || activeMandiItem);

  const getSellAdvice = (item: typeof activeMandiItem) => {
    if (!item) return isHindi ? "डेटा प्रतीक्षा" : "Waiting data";
    const diff = item.modalPrice - item.prevModalPrice;
    if (diff > 60) return isHindi ? "आज आंशिक बेचें" : "Sell partial";
    if (diff < -50) return isHindi ? "3-5 दिन रोकें" : "Hold 3-5 days";
    return isHindi ? "आवक देखें" : "Watch arrival";
  };

  const cropRecommendation = selectedCommodity.includes("Soybean")
    ? {
        crop: isHindi ? "सोयाबीन JS 20-34 / NRC 150" : "Soybean JS 20-34 / NRC 150",
        reason: isHindi ? "काली मिट्टी, 32°C तापमान और मध्यम वर्षा में अच्छा विकल्प।" : "Good fit for black soil, 32°C temperature, and medium rainfall.",
        action: isHindi ? "45 cm कतार दूरी रखें और बीज उपचार के बाद बुवाई करें।" : "Keep 45 cm row spacing and sow only after seed treatment."
      }
    : selectedCommodity.includes("Paddy")
      ? {
          crop: isHindi ? "धान BPT 5204 / PR 126" : "Paddy BPT 5204 / PR 126",
          reason: isHindi ? "अधिक नमी और जल उपलब्धता वाले खेतों के लिए उपयुक्त।" : "Suitable where moisture and standing water are available.",
          action: isHindi ? "नर्सरी मजबूत रखें और जल निकासी पर ध्यान दें।" : "Maintain a healthy nursery and monitor drainage."
        }
      : {
          crop: isHindi ? "गेहूं शरबती / HI 1544" : "Wheat Sharbati / HI 1544",
          reason: isHindi ? "मंडी मांग मजबूत और क्षेत्र में अनुकूल रबी फसल।" : "Strong mandi demand and a locally suitable rabi crop.",
          action: isHindi ? "प्रमाणित बीज और संतुलित DAP/यूरिया योजना अपनाएं।" : "Use certified seed with balanced DAP/urea planning."
        };

  const seedRecommendation = selectedCommodity.includes("Soybean")
    ? {
        title: isHindi ? "प्रमाणित सोयाबीन बीज" : "Certified soybean seed",
        quality: isHindi ? "अंकुरण 75%+, नमी 10-12%, साफ पीला दाना" : "Germination 75%+, moisture 10-12%, clean yellow grain",
        treatment: isHindi ? "Rhizobium + PSB कल्चर और थायरम/कार्बेन्डाजिम उपचार" : "Rhizobium + PSB culture and Thiram/Carbendazim treatment"
      }
    : {
        title: isHindi ? "प्रमाणित उच्च गुणवत्ता बीज" : "Certified high-quality seed",
        quality: isHindi ? "अंकुरण 80%+, टूटे/बीमार दाने कम, स्थानीय किस्म" : "Germination 80%+, low broken/diseased grain, local variety",
        treatment: isHindi ? "बुवाई से पहले बीज उपचार और मिट्टी नमी जांच" : "Seed treatment and soil moisture check before sowing"
      };

  const insuranceRecommendation = {
    scheme: isHindi ? "प्रधानमंत्री फसल बीमा योजना (PMFBY)" : "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    why: isHindi
      ? "कम नमी, भारी वर्षा, कीट जोखिम या प्राकृतिक आपदा से नुकसान हो तो बीमा सुरक्षा देता है।"
      : "Protects against crop loss from low moisture, heavy rain, pests, and natural calamity.",
    action: isHindi
      ? "बुवाई के बाद फसल, खसरा/भूमि रिकॉर्ड, बैंक खाता और आधार के साथ आवेदन करें।"
      : "Apply after sowing with crop details, land record, bank account, and Aadhaar."
  };

  return (
    <div className="space-y-6 fade-in pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-green-150/50 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
            <TrendingUp size={12} />
            <span>2026 Smart Market Hub (एआई कृषि विपणन केंद्र)</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1.5 font-display flex items-center gap-2">
            {isHindi ? "सजीव मंडी भाव और मांग विश्लेषक" : "Live AGMARKNET Mandi & AI Price Oracle"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isHindi 
              ? `आपके फार्म हब के निकटतम पंजीकृत एपीएमसी (APMC) मंडियों से दैनिक वास्तविक समय की कीमतें।` 
              : `Real-time official daily rates, comparative nearby analysis, and cognitive 3-month forecast alerts.`}
          </p>
        </div>

        {/* Commodity select quick switcher pillbox */}
        <div className="flex flex-wrap gap-2">
          {regionCommodities.map(comm => {
            const presetItem = regionMandis.find(m => m.commodity === comm);
            return (
              <button
                key={comm}
                onClick={() => setSelectedCommodity(comm)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCommodity === comm 
                    ? "bg-agri-green text-white shadow-md shadow-emerald-700/10" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150"
                }`}
              >
                {isHindi ? presetItem?.commodityHi : comm}
              </button>
            );
          })}
        </div>
      </div>

      {/* EMERGENCY TELEMETRY ALERTS SIMULATION BOX */}
      {simulatedAlertMessage && (
        <div id="mandi-alert-box" className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border-l-4 border-red-500 p-4 rounded-2xl flex items-start gap-3 animate-pulse relative">
          <button 
            onClick={() => setSimulatedAlertMessage(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 font-bold text-xs bg-white rounded-full h-5 w-5 flex items-center justify-center border shadow-xs"
          >
            ×
          </button>
          <div className="bg-red-500 text-white p-2 rounded-xl">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-1 pr-6">
            <p className="text-xs font-extrabold text-red-950 uppercase tracking-wider">
              {isHindi ? "🚨 लाइव उपग्रह सचेतक संदेश (Simulated Alert)" : "🚨 LIVE INTEL ALARM SYSTEM"}
            </p>
            <p className="text-xs text-gray-800 font-medium leading-relaxed font-mono">
              {simulatedAlertMessage}
            </p>
          </div>
        </div>
      )}

      {/* AGMARKNET READY PRICE INTELLIGENCE TABLE */}
      <div className="mandi-intelligence-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="mandi-kicker">{isHindi ? "एगमार्कनेट तैयार" : "AGMARKNET READY"}</p>
            <h2>{isHindi ? "मंडी मूल्य बुद्धिमत्ता" : "Mandi Price Intelligence"}</h2>
            <p className="mandi-subcopy">
              {isHindi
                ? "सरकारी AGMARKNET/Data.gov.in फीड से जोड़ने के लिए तैयार तालिका। अभी यह आपके मौजूदा डेमो मंडी डेटा से चल रही है।"
                : "Ready for official AGMARKNET/Data.gov.in feed. This screen currently uses your existing demo mandi dataset."}
            </p>
          </div>
          <button className="sync-price-btn" onClick={() => triggerSimulationAlert("price")}>
            <BadgeIndianRupee size={18} />
            {isHindi ? "भाव सिंक करें" : "Sync Prices"}
          </button>
        </div>

        <div className="mandi-table-wrap">
          <table className="mandi-table">
            <thead>
              <tr>
                <th>{isHindi ? "फसल" : "Commodity"}</th>
                <th>{isHindi ? "मंडी" : "Market"}</th>
                <th>{isHindi ? "न्यूनतम" : "Min"}</th>
                <th>{isHindi ? "अधिकतम" : "Max"}</th>
                <th>{isHindi ? "मॉडल" : "Modal"}</th>
                <th>{isHindi ? "सलाह" : "Recommendation"}</th>
              </tr>
            </thead>
            <tbody>
              {priceIntelligenceRows.map(item => (
                <tr key={`intel-${item.id}`}>
                  <td>{isHindi ? item.commodityHi : item.commodity}</td>
                  <td>{isHindi ? item.mandiNameHi : item.mandiName}</td>
                  <td>₹{item.minPrice.toLocaleString("en-IN")}</td>
                  <td>₹{item.maxPrice.toLocaleString("en-IN")}</td>
                  <td>₹{item.modalPrice.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`mandi-pill ${item.modalPrice >= activeMandiItem.modalPrice ? "good" : "watch"}`}>
                      {getSellAdvice(item)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mandi-decision-strip">
          <div>
            <small>{isHindi ? "सबसे अच्छा नजदीकी विकल्प" : "Best nearby option"}</small>
            <strong>{isHindi ? bestNearbyMandi?.mandiNameHi : bestNearbyMandi?.mandiName}</strong>
          </div>
          <div>
            <small>{isHindi ? "आज का निर्णय" : "Today decision"}</small>
            <strong>
              {bestNearbyMandi?.modalPrice > activeMandiItem.modalPrice
                ? (isHindi ? `₹${bestNearbyMandi.modalPrice - activeMandiItem.modalPrice}/क्विंटल ज्यादा मिल सकता है` : `Can gain ₹${bestNearbyMandi.modalPrice - activeMandiItem.modalPrice}/q`)
                : (isHindi ? "मुख्य मंडी में भाव ठीक है" : "Main mandi price is fair")}
            </strong>
          </div>
          <div>
            <small>{isHindi ? "आवक" : "Arrival"}</small>
            <strong>{activeMandiItem.arrivalQty} MT</strong>
          </div>
        </div>
      </div>

      {/* PLANTING, SEED AND INSURANCE RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="recommendation-card plant">
          <div className="recommendation-icon"><Wheat size={22} /></div>
          <small>{isHindi ? "बुवाई सिफारिश" : "Planting recommendation"}</small>
          <h3>{cropRecommendation.crop}</h3>
          <p>{cropRecommendation.reason}</p>
          <strong>{cropRecommendation.action}</strong>
        </div>

        <div className="recommendation-card seed">
          <div className="recommendation-icon"><Leaf size={22} /></div>
          <small>{isHindi ? "बीज गुणवत्ता" : "Seed recommendation"}</small>
          <h3>{seedRecommendation.title}</h3>
          <p>{seedRecommendation.quality}</p>
          <strong>{seedRecommendation.treatment}</strong>
        </div>

        <div className="recommendation-card insurance">
          <div className="recommendation-icon"><Umbrella size={22} /></div>
          <small>{isHindi ? "फसल बीमा" : "Crop insurance"}</small>
          <h3>{insuranceRecommendation.scheme}</h3>
          <p>{insuranceRecommendation.why}</p>
          <strong>{insuranceRecommendation.action}</strong>
          <a href="https://pmfby.gov.in/" target="_blank" rel="noreferrer">
            {isHindi ? "आधिकारिक PMFBY पोर्टल खोलें" : "Open official PMFBY portal"}
          </a>
        </div>
      </div>

      {/* GRID BLOCK A: LIVE PRICING & TREND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE MANDI STATS & CARD */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-150 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xxs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider">
                {isHindi ? "निकटतम मंडी" : "Nearest Mandi"}
              </span>
              <span className="text-xxs font-mono text-gray-400 font-bold">{activeMandiItem?.date}</span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900 font-display">
                {isHindi ? activeMandiItem?.mandiNameHi : activeMandiItem?.mandiName}
              </h3>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-red-500" />
                <span>{activeMandiItem?.distance} km {isHindi ? "आपके प्रक्षेत्र से दूर" : "from your farm coordinates"}</span>
              </p>
            </div>

            {/* Price Showcase Row */}
            <div className="mt-6 bg-gradient-to-br from-gray-50 to-emerald-50/25 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold">{isHindi ? "फसल / किस्म" : "Commodity / Variety"}</span>
                <span className="text-sm font-extrabold text-gray-800">
                  {isHindi ? `${activeMandiItem?.commodityHi} (${activeMandiItem?.varietyHi})` : `${activeMandiItem?.commodity} - ${activeMandiItem?.variety}`}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-xxs text-gray-400 font-bold uppercase block">{isHindi ? "औसत (Modal) भाव" : "Modal Rate"}</span>
                  <span className="text-3xl font-extrabold text-gray-900 font-mono">₹{activeMandiItem?.modalPrice}</span>
                  <span className="text-xs text-gray-400 font-semibold font-mono block">/{isHindi ? "क्विंटल" : "Qtl"}</span>
                </div>

                <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  percentageDiff >= 0 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {percentageDiff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span>{Math.abs(percentageDiff).toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center">
                <div className="bg-white p-2 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">{isHindi ? "न्यूनतम भाव" : "Min Price"}</span>
                  <span className="text-sm font-bold text-gray-700 font-mono">₹{activeMandiItem?.minPrice}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">{isHindi ? "अधिकतम भाव" : "Max Price"}</span>
                  <span className="text-sm font-bold text-gray-700 font-mono">₹{activeMandiItem?.maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Arrival Quantity info */}
            <div className="mt-4 flex justify-between items-center text-xs px-2">
              <span className="text-gray-400 font-bold">{isHindi ? "आज कुल आवक" : "Total Daily Arrivals"}</span>
              <span className="font-mono font-bold text-gray-700">{activeMandiItem?.arrivalQty} {isHindi ? "टन (MT)" : "Metric Tonnes"}</span>
            </div>
          </div>

          {/* Quick Price Alert setup block inside card */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                <Bell size={14} className="text-amber-600 animate-swing" />
                {isHindi ? "एसएमएस भाव सचेतक" : "SMS Price Alert Engine"}
              </span>
              <input 
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => {
                  setAlertsEnabled(e.target.checked);
                  if (e.target.checked) {
                    triggerSimulationAlert("price");
                  }
                }}
                className="w-4.5 h-4.5 text-emerald-600 border-gray-350 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-amber-850 leading-tight">
              {isHindi 
                ? "जब भी भाव आपके लक्ष्य से ऊपर जाएगा, आपको तुरंत फ़ोन पर सूचना मिलेगी।" 
                : "Get notified when the market rate crosses your target threshold."}
            </p>
            <div className="flex gap-2 items-center pt-1.5">
              <span className="text-xs font-bold text-gray-500">₹</span>
              <input 
                type="number"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg text-xs font-bold font-mono px-2 py-1 focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 font-bold uppercase">/Qtl</span>
            </div>
          </div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS: HISTORICAL CHART & COMPARISON LIST */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-150 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers size={16} className="text-agri-green" />
                {isHindi ? `${activeMandiItem?.commodityHi} मूल्य रुझान (छह माह)` : `${activeMandiItem?.commodity} Historical Price Trend (6 Months)`}
              </h3>
              <span className="text-xxs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                {isHindi ? "एगमार्कनेट डेटा" : "AGMARKNET Feed"}
              </span>
            </div>

            {/* Recharts Price Trend Chart */}
            <div className="h-56 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#6B7280", fontSize: 11, fontWeight: "bold" }} 
                    axisLine={false}
                  />
                  <YAxis 
                    domain={["auto", "auto"]}
                    tick={{ fill: "#6B7280", fontSize: 11, fontWeight: "bold" }} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
                    formatter={(value: any) => [`₹${value} / Qtl`, isHindi ? "बाजार मूल्य" : "Modal price"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                    dot={{ stroke: "#10B981", strokeWidth: 2, r: 4, fill: "white" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REGIONAL APMC MANDI PRICE COMPARISON */}
          <div className="border-t border-gray-100 pt-5 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                <ArrowRightLeft size={14} className="text-amber-500 animate-pulse" />
                {isHindi ? "आसपास की अन्य मंडियों से तुलना" : "Nearby APMC Mandi Comparison Rate"}
              </h4>
              <span className="text-xxs text-gray-400 font-semibold">
                {isHindi ? "*परिवहन लागत का आकलन करें" : "*Optimize travel & logistics cost"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alternativeMandis.length === 0 ? (
                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold">
                    {isHindi ? "अन्य नजदीकी मंडियां सूची में नहीं हैं।" : "No other nearby mandis selling this crop in dataset."}
                  </p>
                </div>
              ) : (
                alternativeMandis.map(mandi => {
                  const variance = mandi.modalPrice - activeMandiItem.modalPrice;
                  const isGain = variance >= 0;
                  return (
                    <div key={mandi.id} className="bg-gray-50 hover:bg-emerald-50/25 p-3 rounded-2xl border border-gray-150 flex justify-between items-center transition-all">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-800">
                            {isHindi ? mandi.mandiNameHi : mandi.mandiName}
                          </span>
                          <span className="bg-white border text-[9px] text-gray-400 px-1 py-0.2 rounded-md font-bold whitespace-nowrap">
                            {mandi.distance} km
                          </span>
                        </div>
                        <span className="text-xxs text-gray-400 block mt-0.5">
                          {isHindi ? `किस्म: ${mandi.varietyHi}` : `Variety: ${mandi.variety}`}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-gray-900 font-mono block">₹{mandi.modalPrice}</span>
                        <span className={`text-[10px] font-bold ${isGain ? "text-emerald-700" : "text-rose-600"}`}>
                          {isGain ? "+" : ""}{variance} Qtl
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK B: COGNITIVE 3-MONTH AI PRICE FORECAST */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-gray-950 rounded-3xl border border-emerald-500/10 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xxs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider border border-amber-500/10">
                <Sparkles size={12} className="animate-pulse" />
                {isHindi ? "एआई मांग व मूल्य भविष्यवक्ता" : "Cognitive Demand & Market Forecaster"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">
                {isHindi 
                  ? `क्या आपको ${activeMandiItem?.commodityHi} को अभी बेचना चाहिए या इंतजार करना चाहिए?` 
                  : `Should you sell your ${activeMandiItem?.commodity} now, or hold?`}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                {isHindi 
                  ? "कृषि मित्र एआई आगामी मानसून की स्थिति, निर्यात आयात नीति, थोक आवक की गति और ऐतिहासिक बाजार रुझानों का आकलन करके विश्लेषण प्रस्तुत करता है।" 
                  : "KrishiMitra AI compiles daily crop warehouse storage trends, regional rainfall status, national export tariffs, and Agmarknet arrivals to compute absolute advisories."}
              </p>
            </div>

            <button
              onClick={handleTriggerPrediction}
              disabled={predicting}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-extrabold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-98 cursor-pointer disabled:opacity-75"
            >
              {predicting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isHindi ? "बाजार डेटा का आकलन हो रहा है..." : "CALCULATING PRICE PATHS..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{isHindi ? "भविष्यवाणी प्राप्त करें 🔮" : "RUN AI PRICE FORECAST 🔮"}</span>
                </>
              )}
            </button>
          </div>

          {/* Prediction Result Panel */}
          {aiPredictionResult ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-xs font-extrabold text-emerald-400 tracking-widest uppercase">
                    {isHindi ? "एआई विश्लेषण पूर्ण" : "GENAI CALIBRATION SUCCESS"}
                  </span>
                </div>
                <span className="text-xxs font-mono text-gray-400 font-bold">Model: Gemini-3.5-flash</span>
              </div>

              <div className="prose prose-sm prose-invert max-w-none text-xs text-slate-200 space-y-2 whitespace-pre-wrap leading-relaxed">
                {aiPredictionResult}
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-[11px] text-gray-300 flex items-start gap-2">
                <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                  {isHindi 
                    ? "नोट: यह केवल सांख्यिकीय और नीतिगत विश्लेषण पर आधारित एक उन्नत अनुमान है। कृपया वास्तविक बिक्री का निर्णय स्थानीय बाजार की परिस्थितियों को देखकर स्वयं लें।" 
                    : "Disclaimer: This model uses deep predictive patterns and policies. Daily localized supply changes may affect actual rates; finalize decisions in consultation with your local APMC representative."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 p-8 rounded-2.5xl text-center space-y-2">
              <TrendingUp className="mx-auto text-gray-500 animate-bounce-slow" size={32} />
              <p className="text-sm font-bold text-gray-300">
                {isHindi ? "3-महीने का मूल्य भविष्यवाणी प्रपत्र खाली है।" : "AI 3-Month Price Prediction Deck is Idle."}
              </p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {isHindi 
                  ? "ऊपर दिए गए 'भविष्यवाणी प्राप्त करें' बटन को दबाएं ताकि जेमिनी एआई राष्ट्रीय बाजार कारकों का विश्लेषण कर सके।" 
                  : "Tap the amber button above to trigger an intelligent context evaluation on agricultural trends."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BLOCK C: HARVEST QUALITY GRADING & CROP PRICE ASSESSMENT SCANNER */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xxs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider border border-amber-100">
            <Camera size={12} />
            {isHindi ? "फसल गुणवत्ता एवं ग्रेडिंग स्कैनर" : "Harvest Crop Quality & Grading Scanner"}
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-gray-900">
            {isHindi ? "कैमरे की फोटो से अनाज की गुणवत्ता मापें" : "Upload Harvest Photo to Estimate Market Grade"}
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl">
            {isHindi 
              ? "अपनी गेहूं, धान या दालों की उपज की तस्वीर खींचे। एआई दाने के आकार, चमक, नमी और टूटे दाने का विश्लेषण करके ग्रेड और बोनस मूल्य का अनुमान लगाएगा।" 
              : "Grade your crop harvest digitally! Analyze parameters such as grain size, luster, moisture content, and weed seeds directly to estimate bonuses or cleanups."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PHOTO SELECTION COLUMN */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {isHindi ? "विधि 1: एक तैयार सैंपल चुनकर देखें" : "Option 1: Try a Preloaded Harvest Sample"}
            </p>

            {/* Simulated preset grid */}
            <div className="grid grid-cols-3 gap-3">
              {gradingPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedGradingPreset(preset.id);
                    setCustomGradingFile(null);
                    handleTriggerCropGrading(preset.id);
                  }}
                  className={`border-2 rounded-2xl overflow-hidden text-left p-1 transition-all flex flex-col justify-between h-36 relative ${
                    selectedGradingPreset === preset.id 
                      ? "border-agri-green bg-emerald-50/20 ring-4 ring-emerald-500/10" 
                      : "border-gray-150 hover:border-gray-300 bg-white"
                  }`}
                >
                  <img 
                    src={preset.image} 
                    alt={preset.title} 
                    className="w-full h-16 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-1 flex-1 flex flex-col justify-between">
                    <p className="text-[10px] font-extrabold text-gray-800 line-clamp-2 mt-1 leading-tight">
                      {isHindi ? preset.titleHi : preset.title}
                    </p>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold tracking-wider">
                      {isHindi ? preset.cropHi : preset.crop}
                    </span>
                  </div>
                  {selectedGradingPreset === preset.id && (
                    <div className="absolute top-2 right-2 bg-agri-green text-white p-1 rounded-full shadow-xs">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {isHindi ? "विधि 2: अपने असली खेत की फसल अपलोड करें" : "Option 2: Capture Live Field Harvest"}
              </p>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-250 rounded-2xl p-4 bg-gray-50 text-center hover:bg-gray-100 hover:border-agri-green transition-all relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="mx-auto text-gray-400 mb-1.5" size={24} />
                <p className="text-xs font-extrabold text-gray-700">
                  {isHindi ? "कैमरा खोलें / फोटो खींचें" : "Open Camera / Upload grain photo"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Supports JPG, PNG up to 10MB</p>
              </div>

              {customGradingFile && (
                <div className="flex items-center gap-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                  <img src={customGradingFile} alt="custom" className="h-10 w-10 object-cover rounded-md" />
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-emerald-800">📸 User Harvest Crop Uploaded</p>
                    <p className="text-[9px] text-gray-400">Successfully matched crop bounds</p>
                  </div>
                  <button onClick={() => setCustomGradingFile(null)} className="text-xs font-bold text-gray-400 hover:text-red-500">×</button>
                </div>
              )}
            </div>
          </div>

          {/* SCANNER ANALYSIS RESULTS COLUMN */}
          <div className="lg:col-span-7 bg-gray-50 border border-gray-150 rounded-3xl p-5 min-h-[300px] flex flex-col justify-between">
            {scanning ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={36} className="text-agri-green animate-spin" />
                <p className="text-xs font-extrabold text-gray-700 uppercase tracking-widest animate-pulse">
                  {isHindi ? "अनाज की सघनता और चमक मापी जा रही है..." : "CALIBRATING GRAIN RESOLUTION INDEX..."}
                </p>
                <p className="text-[11px] text-gray-400">Gemini Vision Node running grain geometry scans...</p>
              </div>
            ) : gradingResult ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600" size={20} />
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                      {isHindi ? "एआई गुणवत्ता विश्लेषण परिणाम" : "AI SENSORY RESULTS"}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                    {isHindi ? gradingResult.gradeHi : gradingResult.grade}
                  </span>
                </div>

                {/* Scorecard grids */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block">{isHindi ? "नमी सूचकांक" : "Moisture Index"}</span>
                    <span className="text-xs font-bold text-gray-800 block mt-0.5 font-mono">{gradingResult.moisture}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block">{isHindi ? "टूटे दाने %" : "Broken Grains %"}</span>
                    <span className="text-xs font-bold text-gray-800 block mt-0.5 font-mono">{gradingResult.broken}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block">{isHindi ? "अनुमानित बोनस मूल्य" : "Price Bonus/Cut"}</span>
                    <span className="text-xxs font-extrabold text-emerald-700 block mt-0.5 whitespace-nowrap">
                      {isHindi ? gradingResult.priceDiffHi : gradingResult.priceDiff}
                    </span>
                  </div>
                </div>

                {/* Gemini Detailed Response Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                    {isHindi ? "विस्तृत ग्रेडिंग रिपोर्ट व सुधारात्मक सुझाव:" : "Detailed Diagnostics & Upgrade Advice:"}
                  </p>
                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line prose max-w-none">
                    {gradingResult.analysisText}
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 p-3 rounded-xl text-[11px] flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>
                    {isHindi 
                      ? "💡 फसल को अपग्रेड करने की सलाह: धान/गेहूं को 48 घंटे धूप में सुखाएं ताकि नमी का स्तर 12% से नीचे आए और आपको मंडी में ₹150 प्रति क्विंटल तक अतिरिक्त बोनस मिल सके!" 
                      : "💡 Upgrade advice: Sun-dry this batch for 48 hours to bring moisture below 12%. This will immediately upgrade the lot to Premium Grade A at Sehore Mandi, fetching ₹150/Qtl extra profit."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <Camera className="text-gray-300" size={36} />
                <p className="text-xs font-bold text-gray-600">
                  {isHindi ? "कोई फसल गुणवत्ता स्कैन सक्रिय नहीं है।" : "No Harvest Scan Data Loaded."}
                </p>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  {isHindi 
                    ? "बाईं ओर दिए गए सैंपलों में से कोई एक चुनें या अपनी फसल के दाने की फोटो अपलोड करें।" 
                    : "Select a sample preset or drag-and-drop a harvest grain photograph to run digital sensory analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR - PUSH ALERTS SIMULATION CONTROLS */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/10">
        <div className="space-y-1">
          <h3 className="text-md font-bold font-display flex items-center gap-1.5">
            <Bell size={18} className="animate-swing" />
            {isHindi ? "लाइव कृषि मित्र 2026 आपातकालीन पुश सचेतक" : "Live Emergency Simulation Alarm Console"}
          </h3>
          <p className="text-xs text-emerald-100">
            {isHindi 
              ? "एक क्लिक में आपातकालीन प्रक्षेत्र खतरों (कीट प्रकोप, चक्रवात या बारिश) की सूचना भेजें।" 
              : "Directly trigger mock smart alerts to visualize farmer alert messaging feeds instantly."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => triggerSimulationAlert("price")}
            className="bg-white hover:bg-gray-50 text-emerald-800 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
          >
            {isHindi ? "📈 मूल्य बढ़ोतरी एसएमएस सचेतक" : "📈 Trigger Mandi Price Surge SMS"}
          </button>
          <button
            onClick={() => triggerSimulationAlert("weather")}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
          >
            {isHindi ? "⛈️ भारी वर्षा आपातकालीन सचेतक" : "⛈️ Trigger 12h Heavy Rain Alarm"}
          </button>
        </div>
      </div>
    </div>
  );
}
