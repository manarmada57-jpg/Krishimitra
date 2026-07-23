import React, { useState } from "react";
import { Sprout, Lock, Mail, User, Sparkles, Loader2, Languages } from "lucide-react";
import { apiFetch } from "../utils/api";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  language: "en" | "hi";
  onToggleLanguage: () => void;
}

export default function Auth({ onAuthSuccess, language, onToggleLanguage }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = {
    en: {
      title: "KrishiMitra",
      subtitle: "Bharat Agro Intelligence",
      loginTab: "Sign In",
      signupTab: "Register",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      usernameLabel: "Full Name",
      btnSubmit: isLogin ? "Sign In to Farm Hub" : "Create Account",
      switchText: isLogin ? "New to KrishiMitra? Register here" : "Already have an account? Sign In",
      authFailed: "Invalid email or password credentials.",
      signupFailed: "Failed to create account. Email may already be in use.",
      welcomeBack: "Welcome back, Farmer!",
      createAccTitle: "Start Managing Your Fields Smartly"
    },
    hi: {
      title: "कृषि मित्र",
      subtitle: "भारत एग्रो इंटेलिजेंस",
      loginTab: "लॉग इन करें",
      signupTab: "पंजीकरण",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      usernameLabel: "पूरा नाम",
      btnSubmit: isLogin ? "कृषि हब में प्रवेश करें" : "खाता बनाएं",
      switchText: isLogin ? "कृषि मित्र पर नए हैं? यहाँ पंजीकरण करें" : "पहले से खाता है? लॉग इन करें",
      authFailed: "अमान्य ईमेल या पासवर्ड क्रेडेंशियल।",
      signupFailed: "खाता बनाने में विफल। ईमेल पहले से उपयोग में हो सकता है।",
      welcomeBack: "स्वागत है, किसान भाई!",
      createAccTitle: "अपने खेतों का स्मार्ट प्रबंधन शुरू करें"
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });

        if (res.success && res.data) {
          localStorage.setItem("krishimitra_access_token", res.data.accessToken);
          localStorage.setItem("krishimitra_refresh_token", res.data.refreshToken);
          localStorage.setItem("krishimitra_username", res.data.user.username);
          onAuthSuccess(res.data.user);
        } else {
          setErrorMsg(res.message || t.authFailed);
        }
      } else {
        const res = await apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ username, email, password })
        });

        if (res.success) {
          // Switch to login tab on success
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setUsername("");
          setErrorMsg(language === "hi" ? "पंजीकरण सफल! कृपया अब लॉग इन करें।" : "Registration successful! Please Sign In.");
        } else {
          setErrorMsg(res.message || t.signupFailed);
        }
      }
    } catch (err) {
      setErrorMsg(language === "hi" ? "सर्वर से कनेक्ट होने में समस्या आ रही है।" : "Connection error. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-display">
      {/* Nature abstract background blur shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-emerald-100/60 filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-green-100/50 filter blur-3xl opacity-70"></div>

      {/* Language Switch floating */}
      <button 
        onClick={onToggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors"
      >
        <Languages size={14} />
        {language === "hi" ? "English" : "हिंदी"}
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative z-10 p-8 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-3xl shadow-inner mb-2 animate-bounce">
            <Sprout size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1">
            {t.title}
            <Sparkles className="text-emerald-500" size={16} />
          </h1>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t.subtitle}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
              isLogin 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.loginTab}
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
              !isLogin 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.signupTab}
          </button>
        </div>

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold ${
              errorMsg.includes("successful") || errorMsg.includes("सफल")
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 font-bold uppercase tracking-wider block">{t.usernameLabel}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder={language === "hi" ? "उदा: राम प्रसाद" : "e.g. Ram Prasad"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 pl-10 pr-4 py-3 rounded-xl transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xxs text-slate-400 font-bold uppercase tracking-wider block">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="email"
                required
                placeholder="farmer@krishimitra.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 pl-10 pr-4 py-3 rounded-xl transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xxs text-slate-400 font-bold uppercase tracking-wider block">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 pl-10 pr-4 py-3 rounded-xl transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              t.btnSubmit
            )}
          </button>
        </form>

        {/* Switch Link */}
        <div className="text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            {t.switchText}
          </button>
        </div>

      </div>
    </div>
  );
}
