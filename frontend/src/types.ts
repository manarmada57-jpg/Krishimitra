// Types and static data for KrishiMitra

export type Language = "en" | "hi";

export interface WeatherData {
  temp: number;
  condition: string;
  conditionHi: string;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  rainfall: number;
  uvIndex: number;
  pressure: number;
  soilTemp: number;
  forecast: Array<{
    day: string;
    dayHi: string;
    temp: number;
    rainfall: number;
    humidity: number;
  }>;
}

export interface Scheme {
  id: string;
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  benefit: string;
  benefitHi: string;
  eligibility: string;
  eligibilityHi: string;
  link: string;
}

export interface Crop {
  id: string;
  name: string;
  nameHi: string;
  healthScore: number;
  ndvi: number;
  moisture: "Good" | "Moderate" | "Dry" | "Critical";
  moistureHi: string;
  stage: string;
  stageHi: string;
  sowedDate: string;
  expectedHarvest: string;
  status: "healthy" | "moderate" | "critical";
  soilType: string;
  soilTypeHi: string;
  fertilizerUsed: string;
  fertilizerUsedHi: string;
}

export interface Alert {
  id: string;
  title: string;
  titleHi: string;
  severity: "high" | "low" | "medium";
  date: string;
  desc: string;
  descHi: string;
  category: "weather" | "soil" | "pest" | "scheme";
}

export interface Expense {
  id: string;
  category: "Seed" | "Fertilizer" | "Labor" | "Water" | "Equipment" | "Others";
  categoryHi: "बीज" | "खाद" | "मजदूरी" | "सिंचाई" | "उपकरण" | "अन्य";
  amount: number;
  date: string;
  notes: string;
}

// Translations Directory
export const translations = {
  en: {
    appTitle: "KrishiMitra",
    appSubtitle: "Bharat Agro Intelligence",
    welcome: "Welcome",
    farmerName: "Farmer",
    location: "My Farm",
    weatherCloudy: "Cloudy",
    weatherSunny: "Sunny",
    weatherRainy: "Rainy",
    healthScore: "Crop Health Score",
    weeklyRainfall: "Weekly Rainfall",
    rainfallUnit: "mm",
    satelliteView: "Satellite View",
    alertsTitle: "Recent Farm Alerts",
    navHome: "Home",
    navSatellite: "Satellite",
    navCrops: "Crops",
    navWeather: "Weather",
    navMarket: "Mandi Hub",
    navProfile: "Farm Hub", // Includes Expenses, Yield Predictor, Schemes
    allHealthy: "All crops are looking stable today",
    lowMoisture: "Attention: Low soil moisture in Crop Field B",
    rainExpected: "Rain expected tomorrow afternoon (~12mm)",
    viewDetails: "View Details",
    backToDashboard: "Back to Dashboard",
    cropHealthPage: "Crop Diagnostics & Progress",
    ndviScore: "NDVI Index",
    soilMoistureStatus: "Soil Moisture",
    sowingStage: "Growth Stage",
    sowedOn: "Sowed On",
    expectedHarvest: "Expected Harvest",
    todayWeather: "Today's Farm Weather",
    tempTitle: "Temperature",
    humidityTitle: "Humidity",
    windTitle: "Wind Speed",
    cloudCoverTitle: "Cloud Cover",
    rainfallTitle: "Rainfall",
    forecast7Day: "7-Day Farm Forecast",
    mapLayers: "Map Layers Selector",
    mapSatellite: "Satellite RGB Imagery",
    mapNdvi: "NDVI (Veg Index) Filter",
    mapMoisture: "Soil Moisture Analysis Map",
    mapRainfall: "Meteorological Rainfall Map",
    leafletLoadError: "Leaflet Map is initializing...",
    aiChatBotTitle: "Krishi AI Assistant",
    aiPlaceholder: "Ask Krishi AI anything (e.g., 'Soil suggestions for Wheat')",
    askButton: "Ask Expert",
    examplesHeader: "Frequently Asked by Farmers:",
    example1: "Will it rain in my area tomorrow?",
    example2: "Which fertilizer is best for clay soil context?",
    example3: "Why are my soybean leaves getting light spots?",
    cameraUploadSection: "AI Crop Disease Detection Center",
    uploadPrompt: "Drag & drop leaf photo, or click to take/upload",
    alternativeSample: "Click to select a crop leaf sample to diagnose:",
    diagnoseButton: "Diagnose Leaf with Gemini",
    diagnosing: "Consulting Gemini Agricultural Brain...",
    diagnosisResult: "Gemini Expert Recommendation Report",
    totalExpenses: "Total Expenses Summary",
    expenseTracker: "Farm Expense Log",
    addExpense: "Log New Expense",
    expensePlaceholder: "Rent tractor, buy Urea, wages...",
    yieldCalculator: "Smart Yield Prediction Model",
    predictButton: "Calculate Predicted Production",
    predicting: "Simulating farm output with AI...",
    schemesTitle: "Indian Government Farming Initiatives",
    searchSchemes: "Search Schemes (e.g. Fasal Bima)...",
    benefits: "Benefits Offered:",
    eligibility: "Who is Eligible?",
    visitPortal: "Official Portal Details",
    organicSolution: "Organic & Physical Remediation",
    chemicalSolution: "Chemical Remediation Recommendation",
    preventionTips: "Proactive Protection Measures",
    yieldEstimate: "Dynamic Yield Estimation report",
    rupees: "₹"
  },
  hi: {
    appTitle: "कृषि मित्र",
    appSubtitle: "भारत एग्रो इंटेलिजेंस",
    welcome: "आपका स्वागत है",
    farmerName: "किसान",
    location: "मेरा खेत",
    weatherCloudy: "आंशिक रूप से बादल",
    weatherSunny: "धूप खिली है",
    weatherRainy: "बारिश की संभावना",
    healthScore: "फसल स्वास्थ्य सूचकांक",
    weeklyRainfall: "साप्ताहिक वर्षा रिकॉर्ड",
    rainfallUnit: "मिमी",
    satelliteView: "उपग्रह (सैटेलाइट) दृश्य",
    alertsTitle: "हालिया चेतावनी और सूचनाएं",
    navHome: "मुख्य",
    navSatellite: "सैटेलाइट",
    navCrops: "फसलें",
    navWeather: "मौसम",
    navMarket: "मंडी हब",
    navProfile: "कृषि हब",
    allHealthy: "आज सभी फसलें स्थिर और स्वस्थ स्थिति में हैं।",
    lowMoisture: "सावधान: खेत 'ख' में मिट्टी की नमी बहुत कम पायी गयी है।",
    rainExpected: "कल दोपहर बाद हल्की वर्षा (~12mm) होने की उम्मीद है।",
    viewDetails: "विवरण देखें",
    backToDashboard: "वापस मुख्य पृष्ठ पर",
    cropHealthPage: "स्वास्थ्य निगरानी एवं प्रगति रिकॉर्ड",
    ndviScore: "NDVI सूचकांक",
    soilMoistureStatus: "मिट्टी की नमी",
    sowingStage: "विकास का चरण",
    sowedOn: "बुवाई की तारीख",
    expectedHarvest: "अनुमानित कटाई काल",
    todayWeather: "आज का कृषि मौसम",
    tempTitle: "तापमान",
    humidityTitle: "नमी/आर्द्रता",
    windTitle: "हवा की गति",
    cloudCoverTitle: "बादल छाए रहना",
    rainfallTitle: "वर्षा की मात्रा",
    forecast7Day: "7-दिवसीय मौसम पूर्वानुमान",
    mapLayers: "नक्शा परतों का चयन करें",
    mapSatellite: "सैटेलाइट तस्वीर (RGB)",
    mapNdvi: "NDVI (फसल स्वास्थ्य) परत",
    mapMoisture: "मिट्टी की नमी (Moisture) विश्लेषण",
    mapRainfall: "वर्षा (Rainfall) नक्शा विश्लेषण",
    leafletLoadError: "सैटेलाइट नक्शा लोड हो रहा है...",
    aiChatBotTitle: "कृषि AI सहायक",
    aiPlaceholder: "कृषि विशेषज्ञ से पूछें (उदा. 'गेहूं के लिए खाद का सही समय')",
    askButton: "पूछें",
    examplesHeader: "किसानों द्वारा अक्सर पूछे जाने वाले सवाल:",
    example1: "क्या कल मेरे क्षेत्र में वर्षा होगी?",
    example2: "काली मिट्टी के लिए सबसे अच्छी उपज वाली फसल कौन सी है?",
    example3: "सोयाबीन के पत्ते पीले होने का जैविक उपचार क्या है?",
    cameraUploadSection: "फसल रोग पहचान व निदान केंद्र",
    uploadPrompt: "पत्ती की तस्वीर अपलोड करें या खींचें",
    alternativeSample: "निदान हेतु कोई एक लाइव रोग सैंपल चुनें:",
    diagnoseButton: "Gemini AI से जांच शुरू करें",
    diagnosing: "कृषि वैज्ञानिक AI विश्लेषण कर रहा है...",
    diagnosisResult: "Gemini फसल रोग विशेषज्ञ रिपोर्ट:",
    totalExpenses: "कुल कृषि खर्च विवरण",
    expenseTracker: "कृषि खर्च बहीखाता (Log)",
    addExpense: "खर्च एंट्री जोड़ें",
    expensePlaceholder: "ट्रैक्टर किराया, यूरिया खाद, मजदूरी...",
    yieldCalculator: "उन्नत उपज पूर्वानुमान मॉडल",
    predictButton: "उपज पूर्वानुमान की गणना करें",
    predicting: "AI द्वारा उत्पादन की गणना की जा रही है...",
    schemesTitle: "सरकारी किसान योजनाएं एवं सहायता",
    searchSchemes: "योजना खोजें (जैसे: बीमा, सम्मान निधि)...",
    benefits: "मिलने वाले वित्तीय लाभ:",
    eligibility: "पात्रता एवं शर्तें:",
    visitPortal: "आधिकारिक वेबसाइट जानकारी",
    organicSolution: "जैविक/प्राकृतिक समाधान",
    chemicalSolution: "आवश्यक रसायन छिड़काव उपचार",
    preventionTips: "भविष्य के लिए सुरक्षा उपाय",
    yieldEstimate: "अनुमानित उत्पादन पूर्वानुमान रिपोर्ट",
    rupees: "₹"
  }
};

// Seed Mock Data
export const mockWeather: WeatherData = {
  temp: 32,
  condition: "Partly Cloudy",
  conditionHi: "आंशिक बादल",
  humidity: 65,
  windSpeed: 14,
  cloudCover: 45,
  rainfall: 12,
  uvIndex: 6,
  pressure: 1011,
  soilTemp: 28,
  forecast: [
    { day: "Sat", dayHi: "शनि", temp: 32, rainfall: 4, humidity: 65 },
    { day: "Sun", dayHi: "रवि", temp: 29, rainfall: 15, humidity: 82 },
    { day: "Mon", dayHi: "सोम", temp: 30, rainfall: 8, humidity: 75 },
    { day: "Tue", dayHi: "मंगल", temp: 31, rainfall: 0, humidity: 62 },
    { day: "Wed", dayHi: "बुध", temp: 33, rainfall: 0, humidity: 55 },
    { day: "Thu", dayHi: "गुरु", temp: 34, rainfall: 0, humidity: 50 },
    { day: "Fri", dayHi: "शुक्र", temp: 35, rainfall: 2, humidity: 58 },
  ]
};

export const mockCrops: Crop[] = [
  {
    id: "cr1",
    name: "Wheat (Sonalika)",
    nameHi: "गेहूं (सोनालिका)",
    healthScore: 88,
    ndvi: 0.72,
    moisture: "Good",
    moistureHi: "अच्छी नमी",
    stage: "Tillering Stage",
    stageHi: "कल्ले निकलने का चरण",
    sowedDate: "2026-05-10",
    expectedHarvest: "2026-09-15",
    status: "healthy",
    soilType: "Alluvial soil",
    soilTypeHi: "जलोढ़ उपजाऊ मिट्टी",
    fertilizerUsed: "DAP + NPK blend",
    fertilizerUsedHi: "डीएपी + एनपीके मिश्रण"
  },
  {
    id: "cr2",
    name: "Soybean (JS 335)",
    nameHi: "सोयाबीन (JS 335)",
    healthScore: 68,
    ndvi: 0.54,
    moisture: "Dry",
    moistureHi: "सूखापन",
    stage: "Flowering Phase",
    stageHi: "फूल आने की अवस्था",
    sowedDate: "2026-05-28",
    expectedHarvest: "2026-10-05",
    status: "moderate",
    soilType: "Black deep basaltic",
    soilTypeHi: "काली गहरी मिट्टी",
    fertilizerUsed: "Single Super Phosphate",
    fertilizerUsedHi: "सिंगल सुपर फॉस्फेट"
  },
  {
    id: "cr3",
    name: "Cotton (Bt Hybrid)",
    nameHi: "कपास (बीटी हाइब्रिड)",
    healthScore: 42,
    ndvi: 0.35,
    moisture: "Critical",
    moistureHi: "अत्यधिक सूखा",
    stage: "Vegetative Grow",
    stageHi: "वानस्पतिक विकास",
    sowedDate: "2026-06-02",
    expectedHarvest: "2026-11-20",
    status: "critical",
    soilType: "Regur clay loam",
    soilTypeHi: "रेगुर चिकनी बलुई",
    fertilizerUsed: "Ammoniacal Nitrogen",
    fertilizerUsedHi: "अमोनियायुक्त नाइट्रोजन"
  },
  {
    id: "cr4",
    name: "Rice (Basmati 370)",
    nameHi: "धान (बासमती 370)",
    healthScore: 92,
    ndvi: 0.81,
    moisture: "Good",
    moistureHi: "संतोषजनक पानी",
    stage: "Panicle Initiation",
    stageHi: "बाली निकलने की शुरुआत",
    sowedDate: "2026-05-01",
    expectedHarvest: "2026-08-30",
    status: "healthy",
    soilType: "Clay loam heavy",
    soilTypeHi: "भारी चिकनी मटियार",
    fertilizerUsed: "Ammonium Sulphate + Zinc",
    fertilizerUsedHi: "अमोनियम सल्फेट + जिंक"
  }
];

export const mockAlerts: Alert[] = [
  {
    id: "al1",
    title: "Low Soil Moisture Detected",
    titleHi: "खेत की मिट्टी में कम नमी पायी गयी",
    severity: "medium",
    date: "Today 10:30 AM",
    desc: "Wheat Block C moisture index dropped below 30%. Trigger drip irrigation loop immediately.",
    descHi: "ब्लॉक सी में गेहूं की फसल की नमी का स्तर 30% से नीचे गिर गया है। तुरंत सिंचाई शुरू करें।",
    category: "soil"
  },
  {
    id: "al2",
    title: "Heavy Rain & Squall expected",
    titleHi: "तेज़ आंधी और भारी बारिश की घोषणा",
    severity: "high",
    date: "Tomorrow 2:00 PM",
    desc: "IMD predicts localized heavy squall of 15mm with gusts up to 45km/h. Avoid applying pesticide spray.",
    descHi: "कल मौसम विभाग ने 15 मिमी मूसलाधार बारिश और तेज़ हवाओं की चेतावनी दी है। छिड़काव रोकें।",
    category: "weather"
  },
  {
    id: "al3",
    title: "Pest Attack Advisory (Spodoptera)",
    titleHi: "कीट हमले की चेतावनी (स्पोडोप्टेरा)",
    severity: "high",
    date: "2 days ago",
    desc: "Neighboring farms report early instar armyworm fall army infestations. Inspect under leaves.",
    descHi: "पड़ोसी खेतों में आर्मीवर्म (कीड़ा) का हमला देखा गया है। अपनी सोयाबीन की पत्तियों के नीचे जांच करें।",
    category: "pest"
  }
];

export const mockSchemes: Scheme[] = [
  {
    id: "sc1",
    title: "PM Kisan Samman Nidhi Yojana",
    titleHi: "प्रधानमंत्री किसान सम्मान निधि",
    desc: "Direct benefit transfer providing an income support of ₹6,000 per year per family in three equal installments to all landholding farmer families.",
    descHi: "सभी भूधारक किसान परिवारों को वित्तीय सहायता प्रदान करने वाली योजना, जिसके तहत प्रति वर्ष ₹6,000 की राशि तीन समान किश्तों में सीधे बैंक खातों में भेजी जाती है।",
    benefit: "₹6,000 annually paid in 3 instalments (₹2,000 each) straight to aadhaar linked account.",
    benefitHi: "₹6,000 प्रति वर्ष (₹2,000 की तीन किश्तें) सीधे आधार कार्ड से लिंक बैंक खाते में हस्तांतरित।",
    eligibility: "All small and marginal landholding farmer families across the country.",
    eligibilityHi: "देश के सभी छोटे-मध्यम और सीमांत भूधारक किसान परिवार जो सरकारी करदाता (tax payer) नहीं हैं।",
    link: "https://pmkisan.gov.in"
  },
  {
    id: "sc2",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    titleHi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
    desc: "Incredibly affordable crop insurance coverage to safeguard farmers against production risks resulting from unseasonal rain, pests, hail, and drought.",
    descHi: "बेमौसम बारिश, कीट हमले, सूखा और ओलावृष्टि से फसलों को होने वाले नुकसान से बचाने के लिए बहुत ही कम प्रीमियम पर व्यापक फसल बीमा सुरक्षा।",
    benefit: "Low premiums (Rabi: 1.5%, Kharif: 2.0%, Commercial: 5.0%), fast digital claims processing directly into account.",
    benefitHi: "न्यूनतम प्रीमियम (रबी: 1.5%, खरीफ: 2.0%), नुकसान के आकलन के बाद सीधा डिजिटल दावा भुगतान।",
    eligibility: "All Indian tenant or owner farmers growing notified crops in notified areas.",
    eligibilityHi: "अधिसूचित क्षेत्रों में अधिसूचित फसलों की खेती करने वाले सभी बटाईदार व भूस्वामी किसान।",
    link: "https://pmfby.gov.in"
  },
  {
    id: "sc3",
    title: "Soil Health Card Scheme",
    titleHi: "मृदा स्वास्थ्य कार्ड योजना",
    desc: "Empowers farmers to understand crucial physical, chemical conditions of their soil and optimize fertilizer application dosage recommendations.",
    descHi: "किसानों को मिट्टी की गुणवत्ता (12 प्रमुख पोषक तत्व) समझाने और उर्वरकों के संतुलित उपयोग को बढ़ावा देने के लिए निःशुल्क मृदा स्वास्थ्य कार्ड रिपोर्ट कार्ड।",
    benefit: "Detailed report card recommending optimal chemical fertilizer combinations (NPK, Zinc, Iron) to save input costs.",
    benefitHi: "उर्वरकों के संतुलित उपयोग की वैज्ञानिक सूची, जिससे खेती का अतिरिक्त खर्चा 20-30% तक बचता है।",
    eligibility: "Invaluable card accessible for free to every farmer in India via local soil clinics.",
    eligibilityHi: "भारत के समस्त किसान भाई स्थानीय कृषि परीक्षण प्रयोगशाला जा कर निःशुल्क मृदा प्रमाण पत्र पा सकते हैं।",
    link: "https://soilhealth.dac.gov.in"
  }
];

export interface SampleLeaf {
  id: string;
  name: string;
  nameHi: string;
  crop: string;
  imgUrl: string;
  desc: string;
  descHi: string;
}

// Visual crop disease leaf sample mockups
export const sampleLeafs: SampleLeaf[] = [
  {
    id: "l1",
    name: "Yellow Rust (Wheat Leaf)",
    nameHi: "पीला रतुआ (गेहूं)",
    crop: "Wheat",
    imgUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
    desc: "Bright yellow-orange linear pustules arranged in clear stripes along the leaf surface.",
    descHi: "पत्तियों के समानांतर धारीदार चमकीले पीले रंग के पाउडर जैसे फुंसीदार धब्बे।"
  },
  {
    id: "l2",
    name: "Soybean Leaf Spot Complex",
    nameHi: "पत्ती धब्बा रोग (सोयाबीन)",
    crop: "Soybean",
    imgUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
    desc: "Numerous tiny purplish-brown angular spots causing early defoliation and yellowing.",
    descHi: "पत्तियों के ऊपर छोटे संकीर्ण बैगनी-भूरे रंग के कोणीय धब्बे जिससे तना कमजोर हो रहा है।"
  },
  {
    id: "l3",
    name: "Bt Cotton Leaf Blight",
    nameHi: "पर्ण झुलसा रोग (Bt कपास)",
    crop: "Cotton",
    imgUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600",
    desc: "Irregular light brown water-soaked necrotic lesions starting from dry tips.",
    descHi: "पत्ती के किनारों पर भूरे रंग के पानीदार सूखे धब्बे जो पूरी पत्ती को सुखा रहे हैं।"
  }
];
