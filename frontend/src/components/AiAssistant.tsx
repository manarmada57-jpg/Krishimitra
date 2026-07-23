import React, { useState, useRef } from "react";
import { translations, sampleLeafs, Language } from "../types";
import { useFarmProfile } from "../context/FarmContext";
import { apiFetch } from "../utils/api";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Camera, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Sprout, 
  Info,
  ChevronRight,
  RefreshCw,
  Eye,
  Speech,
  MapPin
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiAssistantProps {
  language: Language;
}

export default function AiAssistant({ language }: AiAssistantProps) {
  const { farmProfile } = useFarmProfile();
  const t = translations[language];
  const isHi = language === "hi";

  // Chat States
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        role: "model",
        text: isHi 
          ? `नमस्ते ${farmProfile.farmerName}! मैं आपका कृषि एआई (Krishi AI) विशेषज्ञ हूँ। अभी मैं ${farmProfile.locationName} प्रक्षेत्र का विश्लेषण कर रहा हूँ जहाँ फसल ${farmProfile.cropName} (${farmProfile.cropAreaAcres} एकड़, मिट्टी: ${farmProfile.soilType}, तापमान: ${farmProfile.temp}°C) बोई गई है। आप मुझसे कृषि संबंधी कुछ भी पूछ सकते हैं।` 
          : `Namaste ${farmProfile.farmerName}! I am your Krishi AI digital farming expert advisor. I am currently monitoring your farm at ${farmProfile.locationName} (${farmProfile.cropName}, ${farmProfile.cropAreaAcres} Acres, Soil: ${farmProfile.soilType}, Temp: ${farmProfile.temp}°C, NDVI: ${farmProfile.ndvi}). Ask me anything relative to your farm!`
      }
    ];
  });
  const [inputText, setInputText] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Diagnostic States
  const [activeTab, setActiveTab] = useState<"advisor" | "doctor">("advisor");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [selectedSampleLeaf, setSelectedSampleLeaf] = useState<string | null>(null);
  const [diagnosticDescription, setDiagnosticDescription] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recommended search cues customized to active farm profile
  const suggestions = [
    { text: isHi ? `क्या कल ${farmProfile.locationName} में वर्षा होगी?` : `Will it rain in ${farmProfile.locationName} tomorrow?`, q: `Will it rain in ${farmProfile.locationName} tomorrow? Give brief summary.` },
    { text: isHi ? `${farmProfile.soilType} में ${farmProfile.cropName} के लिए सर्वोत्तम खाद कौन सी है?` : `Best fertilizer for ${farmProfile.cropName} in ${farmProfile.soilType}?`, q: `Which fertilizer and nutrients are best for ${farmProfile.cropName} growing in ${farmProfile.soilType} with ${farmProfile.waterSource} irrigation?` },
    { text: isHi ? `${farmProfile.problem || "कीट हमले"} का जैविक निवारण क्या है?` : `Organic solution for ${farmProfile.problem || "pest control"}?`, q: `What organic biological remediation treats ${farmProfile.problem || "pest issues"} on ${farmProfile.cropName}?` }
  ];

  // Send message to Express API
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isChatLoading) return;

    const userMsg: Message = { role: "user", text: rawText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsChatLoading(true);

    try {
      const response = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: `[Farm Profile Context: Farmer=${farmProfile.farmerName}, Location=${farmProfile.locationName}, Crop=${farmProfile.cropName}, Area=${farmProfile.cropAreaAcres} Acres, Soil=${farmProfile.soilType}, WaterSource=${farmProfile.waterSource}, ReportedProblem=${farmProfile.problem}] ${rawText}`,
          history: messages.slice(-6),
          language
        })
      });

      if (!response.success || !response.data) throw new Error("Server communication broken.");
      const resData = response.data as any;

      setMessages(prev => [...prev, { role: "model", text: resData.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: "model", 
        text: isHi 
          ? "क्षमा करें, सर्वर प्रतिक्रिया देने में असमर्थ है। कृपया इंटरनेट जांचें।" 
          : "Apologies, Krishi AI server is currently overloaded. Please check your internet link." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Voice recognition
  const handleMicrophoneToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const mockQuery = isHi 
            ? `${farmProfile.cropName} की फसल में ${farmProfile.problem || "पीले पत्तों"} का उपचार क्या है?` 
            : `Organic solution to protect ${farmProfile.cropName} from ${farmProfile.problem || "pests"}?`;
          setInputText(mockQuery);
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
        if (transcript) setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Speech trigger failed:", err);
      setIsListening(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedSampleLeaf(null);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setDiagnosticResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleLeaf = (leaf: typeof sampleLeafs[0]) => {
    setSelectedSampleLeaf(leaf.id);
    setUploadedImage(leaf.imgUrl);
    setImageMime("image/jpeg");
    setDiagnosticDescription(isHi ? leaf.descHi : leaf.desc);
    setDiagnosticResult(null);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setSelectedSampleLeaf(null);
    setDiagnosticDescription("");
    setDiagnosticResult(null);
    setErrorMessage(null);
  };

  const handleDiagnoseLeaf = async () => {
    if (!uploadedImage) {
      setErrorMessage(isHi ? "कृपया एक पत्ती की तस्वीर अपलोड करें या चुनें।" : "Please upload or select a leaf image first.");
      return;
    }

    setIsDiagnosing(true);
    setErrorMessage(null);
    setDiagnosticResult(null);

    let base64Payload = uploadedImage;
    if (uploadedImage.startsWith("data:")) {
      base64Payload = uploadedImage.split(",")[1];
    }

    try {
      const response = await apiFetch("/api/diagnose", {
        method: "POST",
        body: JSON.stringify({
          image: base64Payload.startsWith("http") ? "MOCK_IMAGE_TEMPLATE_" + selectedSampleLeaf : base64Payload,
          mimeType: imageMime,
          description: `${diagnosticDescription} [Active Crop: ${farmProfile.cropName}, Soil: ${farmProfile.soilType}]`,
          cropType: selectedSampleLeaf ? sampleLeafs.find(l => l.id === selectedSampleLeaf)?.crop : farmProfile.cropName,
          language
        })
      });

      if (!response.success || !response.data) throw new Error("AI engine diagnosis failed.");
      const resData = response.data as any;

      setDiagnosticResult(resData.result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        isHi 
          ? "एआई निदान सेवा तकनीकी कारणों से अनुपलब्ध है। कृपया पुन: प्रयास करें।" 
          : "The leaf diagnostic gateway of Gemini failed to process. Try an uploaded small local image."
      );
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <Bot className="text-agri-green" size={24} />
            {t.aiChatBotTitle}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isHi 
              ? `${farmProfile.farmerName} (${farmProfile.locationName}) - कृषि एआई विशेषज्ञ आपकी फसल (${farmProfile.cropName}) के लिए तैयार है।` 
              : `Personalized Krishi AI advisor tuned for ${farmProfile.farmerName}'s farm (${farmProfile.cropName} at ${farmProfile.locationName}).`}
          </p>
        </div>

        {/* Workspace selector tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl self-start md:self-center">
          <button 
            id="tab-advisor"
            onClick={() => setActiveTab("advisor")}
            className={`px-4.5 py-2.5 font-display text-sm font-bold rounded-xl transition-all cursor-pointer ${activeTab === "advisor" ? "bg-white text-agri-green shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
          >
            💬 {isHi ? "कृषि एआई चैट" : "Agricultural AI Chat"}
          </button>
          
          <button 
            id="tab-doctor"
            onClick={() => setActiveTab("doctor")}
            className={`px-4.5 py-2.5 font-display text-sm font-bold rounded-xl transition-all cursor-pointer ${activeTab === "doctor" ? "bg-white text-agri-green shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
          >
            🍃 {isHi ? "एआई पत्ती डॉक्टर" : "Leaf Doctor AI"}
          </button>
        </div>
      </div>

      {activeTab === "advisor" ? (
        /* WORKSPACE 1: CHAT BOT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Panel */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col h-[520px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`mt-0.5 p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-agri-lightgreen text-agri-dark" : "bg-green-50 text-agri-green"}`}>
                      {message.role === "user" ? "👤" : <Bot size={18} />}
                    </div>
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${message.role === "user" ? "bg-agri-green text-white font-medium" : "bg-gray-50 text-gray-800 border border-gray-100/50"}`}>
                      <p className="whitespace-pre-line">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%] items-center text-gray-400 text-xs font-semibold pl-12 bg-gray-50 px-4 py-3 rounded-full">
                    <RefreshCw className="animate-spin text-agri-green" size={14} />
                    <span>{isHi ? "कृषि विशेषज्ञ विचार कर रहे हैं..." : "Advisor compiling instructions..."}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Listening Banner Overlay */}
            {isListening && (
              <div className="bg-red-50 text-red-700 p-3 flex items-center justify-center gap-3 border-t border-red-100">
                <Speech className="animate-pulse" size={18} />
                <span className="text-xs font-bold font-display animate-pulse">
                  {isHi ? "🎙️ एआई सुन रहा है... कृपया बोलें" : "🎙️ KrishiMitra listening... Speak clearly"}
                </span>
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/50 items-center rounded-b-3xl">
              <button 
                id="btn-voice-mic"
                onClick={handleMicrophoneToggle}
                className={`p-3 rounded-2xl flex items-center justify-center transition-colors shadow-xs cursor-pointer ${isListening ? "bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-gray-500 border border-gray-200"}`}
                title={isHi ? "बोलकर पूछें" : "Voice Input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input 
                id="input-chat-text"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={t.aiPlaceholder}
                className="flex-1 bg-white border border-gray-200 focus:outline-none focus:border-agri-green px-4 py-3 rounded-2xl text-sm"
              />

              <button 
                id="btn-send-message"
                onClick={() => handleSendMessage()}
                disabled={isChatLoading}
                className="p-3 bg-agri-green hover:bg-agri-dark text-white rounded-2xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Right Side: Suggestions & Active Profile summary */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-xs">
              <h3 className="font-bold text-gray-900 font-display text-sm uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <Sparkles size={16} className="text-agri-orange" />
                {t.examplesHeader}
              </h3>

              <div className="space-y-2.5">
                {suggestions.map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(suggestion.q)}
                    className="w-full text-left p-3.5 bg-gray-50/50 hover:bg-emerald-50 rounded-2xl border border-gray-100/70 hover:border-emerald-300 text-xs text-gray-700 font-medium transition-all flex items-start gap-2 leading-relaxed cursor-pointer"
                  >
                    <ChevronRight size={14} className="text-agri-green mt-0.5 shrink-0" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Active Context Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs tracking-wider uppercase">
                <Info size={15} className="text-emerald-600" />
                <span>{isHi ? "सक्रिय एआई संदर्भ" : "Active AI Context"}</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                🌾 {farmProfile.cropName} &bull; {farmProfile.soilType} &bull; {farmProfile.waterSource} &bull; {farmProfile.locationName}
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* WORKSPACE 2: LEAF DOCTOR AI */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload and Sample Panel */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-bold text-gray-900 font-display text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <Camera size={18} className="text-agri-green" />
              {t.cameraUploadSection}
            </h3>

            {/* Drag & Drop Visual Box */}
            {!uploadedImage ? (
              <div 
                id="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                className="h-44 border-2 border-dashed border-gray-200 hover:border-green-300 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all"
              >
                <Camera size={36} className="text-gray-400 mb-2 animate-pulse-slow" />
                <p className="text-xs font-bold text-gray-700 font-display">{t.uploadPrompt}</p>
                <span className="text-[10px] text-gray-400 mt-1 font-sans">Supports PNG, JPG (Max 5MB)</span>
                
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                <img 
                  src={uploadedImage} 
                  alt="Leaf to Diagnose" 
                  className="w-full h-44 object-cover"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button 
                    id="btn-clear-leaf"
                    onClick={handleClearImage}
                    className="bg-black/75 backdrop-blur-md text-white p-2 hover:bg-red-600 rounded-xl transition-colors cursor-pointer"
                    title={isHi ? "तस्वीर हटाएं" : "Remove Leaf"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Description prompt context input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 font-display block uppercase tracking-wider">
                {isHi ? "लक्षण या अतिरिक्त विवरण:" : "Additional leaf symptom notes:"}
              </label>
              <textarea 
                id="textarea-leaf-notes"
                value={diagnosticDescription}
                onChange={(e) => setDiagnosticDescription(e.target.value)}
                placeholder={isHi ? "जैसे: पत्तियां पीली पड़कर मुड़ रही हैं..." : "E.g., tiny spots with brown linear halo..."}
                rows={3}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:border-agri-green p-3 rounded-2xl"
              />
            </div>

            {/* Preloaded Template Samples Selector */}
            <div className="space-y-2">
              <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider block">
                {t.alternativeSample}
              </p>
              
              <div className="space-y-1.5">
                {sampleLeafs.map(leaf => (
                  <button 
                    key={leaf.id}
                    id={`btn-sample-leaf-${leaf.id}`}
                    onClick={() => handleSelectSampleLeaf(leaf)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${selectedSampleLeaf === leaf.id ? "border-agri-green bg-emerald-50/50 shadow-xxs" : "border-gray-100 bg-white hover:bg-gray-50"}`}
                  >
                    <img 
                      src={leaf.imgUrl} 
                      alt={leaf.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{isHi ? leaf.nameHi : leaf.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{leaf.crop} sample</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Diagnostic Display Panel */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xs min-h-[480px] p-6 flex flex-col justify-between">
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 font-display text-lg mb-6 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span>🔬 {isHi ? "निदान परिणाम रिपोर्ट" : "Sensory Diagnosis Report Workspace"}</span>
                  <span className="font-mono text-xs text-gray-400 font-semibold">[{farmProfile.cropName}]</span>
                </h3>

                {isDiagnosing && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Sprout className="animate-bounce text-agri-green" size={54} />
                    <div>
                      <h4 className="font-bold text-gray-800 font-display">{t.diagnosing}</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs">{isHi ? "पत्ती के जीवाणु व कीट संदूषण का रडार विश्लेषण प्रगति पर है..." : "Analyzing nitrogen presence, moisture stress and pest symptoms via Gemini API..."}</p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-800 my-4 text-xs font-medium leading-relaxed">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {!isDiagnosing && !diagnosticResult && !errorMessage && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                    <Bot size={48} className="mb-2 text-agri-wheat animate-bounce-slow" />
                    <p className="text-sm font-bold font-display">{isHi ? "कोई पत्ती जांची नहीं गयी है" : "Ready for Diagnostic Inspection"}</p>
                    <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
                      {isHi 
                        ? "पत्ती की स्पष्ट तस्वीर अपलोड करें या नीचे दिए उदाहरण चुनकर शुरू करें।" 
                        : "Upload a crop leaf picture or pick one of our live template samples and hit the button below."}
                    </p>
                  </div>
                )}

                {diagnosticResult && (
                  <div className="space-y-5 fade-in font-sans">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-xxs">
                      <div className="flex items-center gap-2.5 text-agri-dark font-display font-bold text-sm uppercase tracking-wide mb-3">
                        <CheckCircle2 className="text-agri-green" size={18} />
                        {t.diagnosisResult}
                      </div>
                      
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
                        {diagnosticResult}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5 flex justify-end">
                <button 
                  id="btn-run-leaf-diagnose"
                  onClick={handleDiagnoseLeaf}
                  disabled={isDiagnosing || !uploadedImage}
                  className={`w-full sm:w-auto font-display font-semibold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${!uploadedImage || isDiagnosing ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none" : "bg-agri-green hover:bg-agri-dark text-white hover:scale-101"}`}
                >
                  <Sparkles size={16} />
                  {isDiagnosing ? t.diagnosing : t.diagnoseButton}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
