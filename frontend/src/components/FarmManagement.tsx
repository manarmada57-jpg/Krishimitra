import React, { useState, useEffect } from "react";
import { translations, mockSchemes, Expense, Language } from "../types";
import { useFarmProfile } from "../context/FarmContext";
import { apiFetch } from "../utils/api";
import { 
  PlusCircle, 
  Trash2, 
  Calculator, 
  Coins, 
  HelpCircle, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Sprout,
  DollarSign,
  Briefcase,
  Edit3,
  Save,
  MapPin,
  Layers,
  Droplets
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface FarmManagementProps {
  language: Language;
}

export default function FarmManagement({ language }: FarmManagementProps) {
  const { farmProfile, updateFarmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";

  // 0. Active Profile Form Edit states
  const [editFarmerName, setEditFarmerName] = useState(farmProfile.farmerName);
  const [editLocationName, setEditLocationName] = useState(farmProfile.locationName);
  const [editCropName, setEditCropName] = useState(farmProfile.cropName);
  const [editAreaAcres, setEditAreaAcres] = useState(farmProfile.farmAreaAcres);
  const [editWaterSource, setEditWaterSource] = useState(farmProfile.waterSource);
  const [editSoilType, setEditSoilType] = useState(farmProfile.soilType);
  const [editHasIrrigation, setEditHasIrrigation] = useState(farmProfile.hasIrrigation);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setEditFarmerName(farmProfile.farmerName);
    setEditLocationName(farmProfile.locationName);
    setEditCropName(farmProfile.cropName);
    setEditAreaAcres(farmProfile.farmAreaAcres);
    setEditWaterSource(farmProfile.waterSource);
    setEditSoilType(farmProfile.soilType);
    setEditHasIrrigation(farmProfile.hasIrrigation);
  }, [farmProfile]);

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmProfile({
      farmerName: editFarmerName.trim() || "Farmer",
      locationName: editLocationName.trim() || "Farm",
      cropName: editCropName,
      farmAreaAcres: editAreaAcres,
      cropAreaAcres: editAreaAcres,
      waterSource: editWaterSource,
      soilType: editSoilType,
      hasIrrigation: editHasIrrigation
    });
    setSaveSuccessMsg(isHi ? "✅ फार्म प्रोफाइल सफलतापूर्वक अपडेट की गई!" : "✅ Farm profile updated instantly across all modules!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // 1. Expense Tracker states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inputAmount, setInputAmount] = useState("");
  const [inputCategory, setInputCategory] = useState<Expense["category"]>("Seed");
  const [inputNotes, setInputNotes] = useState("");

  // Load expenses on mount
  useEffect(() => {
    apiFetch("/api/expenses")
      .then(res => {
        if (!res.success || !res.data) throw new Error("Failed to fetch expenses");
        setExpenses(res.data);
      })
      .catch(err => {
        console.error("Error loading expenses from DB:", err);
        const saved = localStorage.getItem("krishimitra_expenses");
        if (saved) {
          try {
            setExpenses(JSON.parse(saved));
            return;
          } catch (e) {}
        }
        setExpenses([
          { id: "e1", category: "Seed", categoryHi: "बीज", amount: 4500, date: "2026-05-15", notes: "Bought Sonalika Wheat seeds" },
          { id: "e2", category: "Fertilizer", categoryHi: "खाद", amount: 6200, date: "2026-05-20", notes: "Urea and DAP bags from co-op store" },
          { id: "e3", category: "Labor", categoryHi: "मजदूरी", amount: 3500, date: "2026-06-02", notes: "Sowing labor wage daily" },
          { id: "e4", category: "Equipment", categoryHi: "उपकरण", amount: 12000, date: "2026-06-10", notes: "Tractor rental 2 days" }
        ]);
      });
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(inputAmount);
    if (!amt || isNaN(amt)) return;

    const catHiMap: Record<Expense["category"], Expense["categoryHi"]> = {
      Seed: "बीज",
      Fertilizer: "खाद",
      Labor: "मजदूरी",
      Water: "सिंचाई",
      Equipment: "उपकरण",
      Others: "अन्य"
    };

    const newExpense: Expense = {
      id: "exp_" + Date.now(),
      category: inputCategory,
      categoryHi: catHiMap[inputCategory],
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      notes: inputNotes
    };

    try {
      const response = await apiFetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(newExpense)
      });
      if (!response.success || !response.data) throw new Error("Failed to save expense");
      const savedExpense = response.data;
      setExpenses(prev => [...prev, savedExpense]);
      
      const updated = [...expenses, savedExpense];
      localStorage.setItem("krishimitra_expenses", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to add expense to DB:", err);
      setExpenses(prev => [...prev, newExpense]);
      localStorage.setItem("krishimitra_expenses", JSON.stringify([...expenses, newExpense]));
    }

    setInputAmount("");
    setInputNotes("");
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await apiFetch(`/api/expenses/${id}`, {
        method: "DELETE"
      });
      if (!response.success) throw new Error("Failed to delete expense");
      
      setExpenses(prev => prev.filter(e => e.id !== id));
      localStorage.setItem("krishimitra_expenses", JSON.stringify(expenses.filter(e => e.id !== id)));
    } catch (err) {
      console.error("Failed to delete expense from DB:", err);
      setExpenses(prev => prev.filter(e => e.id !== id));
      localStorage.setItem("krishimitra_expenses", JSON.stringify(expenses.filter(e => e.id !== id)));
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseChartData: Array<{ name: string; value: number }> = Object.values(
    expenses.reduce((acc, exp) => {
      const cat = isHi ? exp.categoryHi : exp.category;
      if (!acc[cat]) {
        acc[cat] = { name: cat, value: 0 };
      }
      acc[cat].value += exp.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  const PIE_COLORS = ["#2E7D32", "#FF9800", "#1E3A8A", "#9333EA", "#EF4444", "#06B6D4"];

  // 2. Yield Predictor states
  const [predictorCrop, setPredictorCrop] = useState(farmProfile.cropName);
  const [predictorSoil, setPredictorSoil] = useState(farmProfile.soilType);
  const [predictorAcreage, setPredictorAcreage] = useState(farmProfile.farmAreaAcres.toString());
  const [predictorWater, setPredictorWater] = useState(farmProfile.waterSource);
  const [predictorFertilizer, setPredictorFertilizer] = useState("Balanced DAP/NPK");
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionReport, setPredictionReport] = useState<string | null>(null);

  const handlePredictYield = async () => {
    setIsPredicting(true);
    setPredictionReport(null);

    try {
      const response = await apiFetch("/api/predict-yield", {
        method: "POST",
        body: JSON.stringify({
          crop: predictorCrop,
          soil: predictorSoil,
          acreage: predictorAcreage,
          water: predictorWater,
          fertilizer: predictorFertilizer,
          location: farmProfile.locationName,
          language
        })
      });

      if (!response.success || !response.data) throw new Error("Yield prediction failed");
      const resData = response.data as any;
      setPredictionReport(resData.prediction);
    } catch (err) {
      console.error(err);
      setPredictionReport(
        isHi
          ? "एआई पूर्वानुमान सर्वर से संपर्क विफल। कृपया भौतिक गणना विधि का उपयोग करें।"
          : "AI Yield calculator returned offline fallback. Review crop area variables."
      );
    } finally {
      setIsPredicting(false);
    }
  };

  // 3. Government Scheme states
  const [schemeQuery, setSchemeQuery] = useState("");
  const filteredSchemes = mockSchemes.filter(s => {
    const searchContent = `${s.title} ${s.titleHi} ${s.desc} ${s.descHi}`.toLowerCase();
    return searchContent.includes(schemeQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 fade-in pb-16">
      
      {/* Title Banner */}
      <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs">
        <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
          <Briefcase className="text-agri-green" size={24} />
          {isHi ? "भारत कृषि समृद्धि व फार्म प्रोफ़ाइल हब" : "Bharat Agro & Farm Profile Hub"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isHi 
            ? "अपने खेत के मुख्य विवरण प्रबंधित करें, खर्चों का रिकॉर्ड रखें, एआई उपज की गणना करें और सरकारी योजनाओं का लाभ लें।" 
            : "Single source of truth for your farm profile parameters, expenses, yield predictions, and government schemes."}
        </p>
      </div>

      {/* FARM PROFILE EDIT FORM CARD */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <Edit3 className="text-emerald-400" size={22} />
            <h2 className="text-lg font-black text-white font-display">
              {isHi ? "सक्रिय खेत प्रोफ़ाइल (Single Source of Truth)" : "Active Farm Profile (Single Source of Truth)"}
            </h2>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/30">
            {farmProfile.farmerName} &bull; {farmProfile.locationName}
          </span>
        </div>

        {saveSuccessMsg && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 p-3 rounded-2xl text-xs font-bold font-display animate-fade-in">
            {saveSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfileForm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "किसान का नाम" : "Farmer Name"}
            </label>
            <input 
              type="text"
              value={editFarmerName}
              onChange={(e) => setEditFarmerName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "खेत का नाम / स्थान" : "Farm / Location Name"}
            </label>
            <input 
              type="text"
              value={editLocationName}
              onChange={(e) => setEditLocationName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "मुख्य फसल" : "Active Crop Name"}
            </label>
            <input 
              type="text"
              value={editCropName}
              onChange={(e) => setEditCropName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)"}
            </label>
            <input 
              type="number"
              value={editAreaAcres}
              onChange={(e) => setEditAreaAcres(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "पानी का स्रोत" : "Water Irrigation Source"}
            </label>
            <select 
              value={editWaterSource}
              onChange={(e) => setEditWaterSource(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="Canal">Canal (नहर)</option>
              <option value="Tubewell / Borewell">Tubewell / Borewell (नलकूप)</option>
              <option value="Rainfed">Rainfed (वर्षा सिंचित)</option>
              <option value="Open Well">Open Well (कुआं)</option>
            </select>
          </div>

          <div>
            <label className="text-xxs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isHi ? "मिट्टी का प्रकार" : "Soil Type"}
            </label>
            <select 
              value={editSoilType}
              onChange={(e) => setEditSoilType(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="Black Soil">Black Soil (काली मिट्टी)</option>
              <option value="Alluvial Soil">Alluvial Soil (जलोढ़ मिट्टी)</option>
              <option value="Red Soil">Red Soil (लाल मिट्टी)</option>
              <option value="Sandy Soil">Sandy Soil (बलुई मिट्टी)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-emerald-200 cursor-pointer">
              <input 
                type="checkbox"
                checked={editHasIrrigation}
                onChange={(e) => setEditHasIrrigation(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{isHi ? "सिंचाई सुविधा उपलब्ध है (Irrigation Available)" : "Has Irrigation Facility"}</span>
            </label>

            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{isHi ? "प्रोफ़ाइल सहेजें 🚀" : "Save Profile Updates 🚀"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Expense Tracker Block (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-bold text-gray-900 font-display text-lg flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="text-amber-500" size={20} />
                {t.expenseTracker}
              </span>
              <span className="font-mono text-xs bg-red-50 border border-red-100 text-red-700 px-3 py-1 rounded-lg">
                {isHi ? "कुल व्यय: " : "Total Spent: "} ₹ {totalExpenseSum.toLocaleString()}
              </span>
            </h3>

            {/* Input expense inline form */}
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              
              <div className="space-y-1">
                <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "कैटेगरी" : "Expense Category"}</label>
                <select 
                  id="select-exp-category"
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value as Expense["category"])}
                  className="w-full text-xs font-semibold bg-white border border-gray-200 focus:outline-none focus:border-agri-green px-3 py-2.5 rounded-xl cursor-pointer"
                >
                  <option value="Seed">{isHi ? "बीज (Seed)" : "Seed"}</option>
                  <option value="Fertilizer">{isHi ? "उर्वरक/खाद (Fertilizer)" : "Fertilizer"}</option>
                  <option value="Labor">{isHi ? "मजदूरी (Labor)" : "Labor"}</option>
                  <option value="Water">{isHi ? "सिंचाई (Water)" : "Water"}</option>
                  <option value="Equipment">{isHi ? "उपकरण/ट्रैक्टर (Equipment)" : "Equipment"}</option>
                  <option value="Others">{isHi ? "अन्य (Others)" : "Others"}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "राशि (₹ में)" : "Amount in Rupees"}</label>
                <input 
                  id="input-exp-amount"
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="₹ 5000"
                  className="w-full text-xs font-semibold bg-white border border-gray-200 focus:outline-none focus:border-agri-green px-3 py-2.5 rounded-xl font-mono"
                  required
                />
              </div>

              <div className="space-y-1 relative sm:col-span-3 flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "विवरण/नोट्स" : "Transaction Notes"}</label>
                  <input 
                    id="input-exp-notes"
                    type="text"
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    placeholder={t.expensePlaceholder}
                    className="w-full text-xs bg-white border border-gray-200 focus:outline-none focus:border-agri-green px-3 py-2.5 rounded-xl font-medium"
                  />
                </div>
                <button 
                  id="btn-add-expense-submit"
                  type="submit"
                  className="bg-agri-green hover:bg-agri-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1 h-fit cursor-pointer"
                >
                  <PlusCircle size={15} />
                  {t.addExpense}
                </button>
              </div>

            </form>

            {/* List log items */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-sm">
                  {isHi ? "कोई खर्च लॉग उपलब्ध नहीं है।" : "No logged values found."}
                </div>
              ) : (
                expenses.map(expense => (
                  <div 
                    key={expense.id} 
                    className="flex justify-between items-center p-3.5 bg-gray-50/20 hover:bg-gray-50 border border-gray-100/70 rounded-2xl transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800 font-display">
                          {isHi ? expense.categoryHi : expense.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono font-medium bg-gray-100 px-1.5 py-0.5 rounded-sm">
                          {expense.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{expense.notes || "..."}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-gray-800">
                        ₹ {expense.amount.toLocaleString()}
                      </span>
                      <button 
                        id={`btn-del-exp-${expense.id}`}
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Expense distribution Pie Chart (Right) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 font-display text-base pb-3 border-b border-gray-100 flex items-center gap-1.5">
                <TrendingUp className="text-agri-green" size={18} />
                {t.totalExpenses}
              </h3>

              {expenseChartData.length > 0 ? (
                <div className="h-44 relative flex items-center justify-center mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xxs text-gray-400 font-bold uppercase">{isHi ? "व्यय" : "Total"}</span>
                    <span className="text-sm font-extrabold text-gray-700 font-mono mt-0.5">₹ {totalExpenseSum}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12 text-xs">
                  {isHi ? "ग्राफ दिखाने के लिए खर्चे जोड़ें।" : "Add expenses to generate charts."}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {expenseChartData.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xxs font-medium text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* 2. Yield Prediction Calculator */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 font-display text-lg flex items-center gap-2">
            <Calculator className="text-agri-green" size={20} />
            {t.yieldCalculator}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            {isHi 
              ? "आपकी बोई फसल, एकड़ आकार, मिट्टी की गुणवत्ता और पानी की उपलब्धता के आधार पर संभावित फसल उत्पादन (क्विंटलों में) और न्यूनतम समर्थन मूल्य (MSP) आमदनी की गणना।" 
              : "Dynamic simulations powered by Gemini Flash checking soil NPK factors, crop strains and irrigation metrics with current central MSP averages."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "फसल प्रकार" : "Crop selection"}</label>
            <select 
              id="select-pred-crop"
              value={predictorCrop}
              onChange={(e) => setPredictorCrop(e.target.value)}
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl cursor-pointer"
            >
              <option value="Wheat">Wheat (गेहूँ)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Cotton">Cotton (कपास)</option>
              <option value="Rice Paddy">Paddy Rice (धान)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "भूमि आकार (Acre)" : "Land Area (Acre)"}</label>
            <input 
              id="input-pred-acreage"
              type="number"
              value={predictorAcreage}
              onChange={(e) => setPredictorAcreage(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "मिट्टी गुणवत्ता" : "Soil Structure"}</label>
            <select 
              id="select-pred-soil"
              value={predictorSoil}
              onChange={(e) => setPredictorSoil(e.target.value)}
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl cursor-pointer"
            >
              <option value="Black Basaltic Soil">Black Cotton Soil (काली मिट्टी)</option>
              <option value="Alluvial Loamy">Alluvial Soil (जलोढ़ मिट्टी)</option>
              <option value="Sandy Loam">Red Sandy (लाल दोमट)</option>
              <option value="Heavy Clay Silt">Clayey Soil (चिकनी भारी)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "सिंचाई/पानी साधन" : "Water Irrigation Source"}</label>
            <select 
              id="select-pred-water"
              value={predictorWater}
              onChange={(e) => setPredictorWater(e.target.value)}
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl cursor-pointer"
            >
              <option value="Tubewell / Ground Aquifer">Tubewell bore (नलकूप)</option>
              <option value="Canal System Supply">Canal Channel (नहर)</option>
              <option value="Drip Irrigation Optimized">Optimized Drip Loop (टपक सिंचाई)</option>
              <option value="Rainfed purely">Monsoon rainfed (वर्षा सिंचित)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase tracking-wider block">{isHi ? "उर्वरक/खाद उपयोग" : "Fertility Dosage applied"}</label>
            <select 
              id="select-pred-fertilizer"
              value={predictorFertilizer}
              onChange={(e) => setPredictorFertilizer(e.target.value)}
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl cursor-pointer"
            >
              <option value="Standard Organic Compost Only">Only Organic manure (जैविक खाद)</option>
              <option value="DAP + Urea balanced dosage">Balanced DAP + Urea feeds (डीएपी+यूरिया)</option>
              <option value="High chemical dosage NPK">Heavy NPK chemical doses (अधिक रसायन)</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button 
            id="btn-trigger-yield-prediction"
            onClick={handlePredictYield}
            disabled={isPredicting || !predictorAcreage}
            className="bg-agri-green hover:bg-agri-dark text-white font-display font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-md transition-all border border-green-50 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isPredicting ? t.predicting : t.predictButton}
          </button>
        </div>

        {predictionReport && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-xxs fade-in">
            <div className="flex items-center gap-2 text-agri-dark font-display font-bold text-sm uppercase tracking-wide mb-3">
              <CheckCircle2 size={18} className="text-agri-green" />
              {t.yieldEstimate}
            </div>

            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium space-y-1.5">
              {predictionReport}
            </div>
          </div>
        )}

      </div>

      {/* 3. Government Scheme Suggestions List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 font-display text-lg flex items-center gap-1.5">
              <Briefcase className="text-agri-green" size={20} />
              {t.schemesTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isHi ? "भारत सरकार और राज्य सरकारों द्वारा कृषि निवेश के लिए लाइव ऋण और धन हस्तांतरण योजनाएं।" : "Active support, crop insurance coverage and financial aids designed by Govt of India."}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
            <input 
              id="input-search-schemes"
              type="text"
              value={schemeQuery}
              onChange={(e) => setSchemeQuery(e.target.value)}
              placeholder={t.searchSchemes}
              className="w-full bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green pl-10 pr-4 py-3 rounded-2xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12 text-sm font-medium">
              ❌ {isHi ? "मिलती-जुलती कोई सरकारी योजना नहीं मिली।" : "No matching central policies found."}
            </div>
          ) : (
            filteredSchemes.map(sch => (
              <div 
                key={sch.id} 
                className="bg-white border hover:border-emerald-350 border-gray-100 p-5 rounded-3xl hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="bg-agri-lightgreen text-agri-dark w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 font-display text-base">
                      {isHi ? sch.titleHi : sch.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-sans">
                      {isHi ? sch.descHi : sch.desc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-agri-green font-bold uppercase tracking-wider block">
                        💰 {t.benefits}
                      </span>
                      <p className="text-xs text-gray-700 font-semibold mt-0.5 font-sans leading-relaxed">
                        {isHi ? sch.benefitHi : sch.benefit}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        ⚠️ {t.eligibility}
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed font-sans">
                        {isHi ? sch.eligibilityHi : sch.eligibility}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100">
                  <a 
                    id={`link-scheme-${sch.id}`}
                    href={sch.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-agri-green hover:text-agri-dark flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {t.visitPortal}
                    <ExternalLink size={12} />
                  </a>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
