import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Sparkles, Calendar, Mail, Film, Clock, Activity, 
  Settings, ChevronRight, RefreshCw, Send, Plus, Gift, Quote
} from "lucide-react";
import { DBState, Letter, Movie } from "../types";

interface HomeViewProps {
  db: DBState;
  onLoveClick: (who: "Nini" | "Jota") => Promise<void>;
  onUpdateStartDate: (date: string) => Promise<void>;
  onNavigate: (tab: string) => void;
  currentUser: string;
  setCurrentUser: (user: any) => void;
  onChangeProfile: () => void;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export default function HomeView({
  db,
  onLoveClick,
  onUpdateStartDate,
  onNavigate,
  currentUser,
  setCurrentUser,
  onChangeProfile,
}: HomeViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const currentUserId = currentUser === "Nini" || currentUser === "nini_001" ? "nini_001" : "jota_001";

  const [dailyQuote, setDailyQuote] = useState("Cargando una frase de amor para ti...");
  const [quoteAuthor, setQuoteAuthor] = useState("Inspiración");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [anniversaryInput, setAnniversaryInput] = useState(db?.daysTogetherStartDate || "2024-02-14");
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const [showLovePrompt, setShowLovePrompt] = useState(false);
  const [latestLoveMessage, setLatestLoveMessage] = useState("");

  // Calculate days together
  const calculateDays = () => {
    const start = new Date(db?.daysTogetherStartDate || "2024-02-14");
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate days until next anniversary
  const getDaysToNextAnniversary = () => {
    const start = new Date(db?.daysTogetherStartDate || "2024-02-14");
    const today = new Date();
    
    // Set up next month anniversary
    let nextAnniv = new Date(today.getFullYear(), today.getMonth(), start.getDate());
    if (nextAnniv < today) {
      nextAnniv.setMonth(nextAnniv.getMonth() + 1);
    }
    
    const diffTime = nextAnniv.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fetch Gemini quote
  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/gemini/quote");
      if (res.ok) {
        const data = await res.json();
        setDailyQuote(data.quote);
        setQuoteAuthor(data.author);
      }
    } catch (err) {
      console.error("Error fetching daily quote:", err);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    setAnniversaryInput(db?.daysTogetherStartDate || "2024-02-14");
  }, [db?.daysTogetherStartDate]);

  // Handle "Te amo" button click
  const handleTeAmoClick = async () => {
    // Generate flying hearts particles
    const newParticles = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 160, // scatter horizontally
      y: -50 - Math.random() * 120, // move upwards
      size: 15 + Math.random() * 25,
      rotation: Math.random() * 360,
      color: ["#f43f5e", "#ec4899", "#d946ef", "#fda4af", "#f472b6"][Math.floor(Math.random() * 5)]
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    
    // Call love click api
    const originalClicks = db?.loveClicks?.[currentUserName as "Nini" | "Jota"] || 0;
    await onLoveClick(currentUserName as "Nini" | "Jota");

    // Get the latest message recorded in history
    setTimeout(() => {
      // Clean up particles
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  };

  // Listen to db history change to show the popup for the click
  useEffect(() => {
    if (db?.loveHistory && db.loveHistory.length > 0) {
      const newest = db.loveHistory[0];
      if ((newest?.who === currentUserName || newest?.userId === currentUserId) && Date.now() - new Date(newest.timestamp).getTime() < 5000) {
        setLatestLoveMessage(newest.message);
        setShowLovePrompt(true);
        const timer = setTimeout(() => setShowLovePrompt(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [db?.loveHistory]);

  const latestLetter: Letter | undefined = db?.letters?.[0];
  const latestMovie: Movie | undefined = db?.movies?.[0];
  const totalClicks = (db?.loveClicks?.Nini || 0) + (db?.loveClicks?.Jota || 0);

  // SVG parameters for Tree of Love based on total clicks
  const leafCount = Math.min(15 + Math.floor(totalClicks / 2), 65);

  return (
    <div className="pb-32 pt-4 px-4 max-w-md mx-auto" id="home-view-container">
      {/* Header Section */}
      <header className="pt-4 pb-4 flex justify-between items-end border-b border-pink-100/30 mb-6" id="home-view-header">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68F94] font-semibold mb-0.5">
            {new Date().getHours() < 12 ? "Buenos días" : new Date().getHours() < 19 ? "Buenas tardes" : "Buenas noches"}, {db?.profiles?.[currentUserName as "Nini" | "Jota"]?.name || currentUserName}
          </span>
          <h1 className="text-4xl font-serif italic text-[#3A3234] leading-tight font-light">NiniLove</h1>
        </div>
        <div className="flex -space-x-2">
          <button
            onClick={() => {
              if (currentUserName !== "Nini") {
                alert("Estás navegando como Jota. Para cambiar tu perfil a Nini, presiona el botón de Configuración (engranaje) abajo y elige 'Cambiar perfil'.");
              }
            }}
            className={`w-10 h-10 rounded-full border-2 object-cover overflow-hidden transition-all duration-300 relative cursor-pointer outline-none ${
              currentUserName === "Nini"
                ? "border-pink-300 scale-110 z-10 shadow-md shadow-pink-200/50"
                : "border-white hover:scale-105 z-0 opacity-80"
            }`}
            title="Perfil de Nini"
          >
            <img src={db?.profiles?.Nini?.photoURL || db?.profiles?.Nini?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"} alt="Nini" className="w-full h-full object-cover" />
          </button>
          <button
            onClick={() => {
              if (currentUserName !== "Jota") {
                alert("Estás navegando como Nini. Para cambiar tu perfil a Jota, presiona el botón de Configuración (engranaje) abajo y elige 'Cambiar perfil'.");
              }
            }}
            className={`w-10 h-10 rounded-full border-2 object-cover overflow-hidden transition-all duration-300 relative cursor-pointer outline-none ${
              currentUserName === "Jota"
                ? "border-[#D4E2FF] scale-110 z-10 shadow-md shadow-blue-200/50"
                : "border-white hover:scale-105 z-0 opacity-80"
            }`}
            title="Perfil de Jota"
          >
            <img src={db?.profiles?.Jota?.photoURL || db?.profiles?.Jota?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"} alt="Jota" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      {/* Floating Love Quote Prompt */}
      <AnimatePresence>
        {showLovePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 bg-gradient-to-r from-pink-500 to-rose-400 text-white p-4 rounded-[24px] shadow-[0_15px_40px_-15px_rgba(244,63,94,0.3)] border border-pink-400/30 relative overflow-hidden"
            id="love-quote-popup"
          >
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
              <Heart size={120} fill="white" />
            </div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="bg-white/20 p-2 rounded-xl shrink-0 mt-0.5">
                <Sparkles size={18} className="text-pink-100 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-pink-100 font-semibold tracking-wide uppercase">¡Mensaje de Amor enviado!</p>
                <p className="text-sm font-medium leading-relaxed mt-1 italic">"{latestLoveMessage}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Días Juntos Widget */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative overflow-hidden bg-white rounded-[32px] p-8 border border-pink-50 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.35)] mb-6"
        id="days-together-widget"
      >
        <div className="absolute top-4 right-4 z-10">
          <button 
            id="open-anniversary-settings"
            onClick={() => setShowSettings(!showSettings)} 
            className="p-2 text-gray-300 hover:text-pink-500 rounded-full hover:bg-pink-50/50 transition-colors cursor-pointer outline-none border-none"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FFF0F3] rounded-full blur-3xl opacity-60"></div>

        <div className="relative">
          <h3 className="text-[#A68F94] text-[11px] uppercase tracking-[0.15em] font-semibold mb-4 flex items-center gap-2 select-none">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span> NUESTRO VIAJE JUNTOS
          </h3>
          
          <p className="text-7xl font-light text-[#3A3234] leading-none mb-2">
            {calculateDays()} <span className="text-3xl font-serif italic text-pink-300">días</span>
          </p>
          
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-3">
            <Calendar size={13} className="text-pink-300" />
            Desde el {new Date(db.daysTogetherStartDate).toLocaleDateString("es-ES", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>

        {/* Meter progress bar */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-1.5 flex-1 bg-gray-50 rounded-full overflow-hidden border border-gray-100/40">
            <div 
              className="h-full bg-gradient-to-r from-pink-200 to-pink-400 rounded-full" 
              style={{ width: `${Math.min(100, (calculateDays() / 1000) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#A68F94] uppercase tracking-wide">Siguiente meta: 1000 Días</span>
        </div>

        {/* Settings inside widget */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-pink-50"
              id="anniversary-settings-box"
            >
              <p className="text-xs text-gray-500 font-semibold mb-2">Editar fecha de aniversario:</p>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={anniversaryInput}
                  onChange={(e) => setAnniversaryInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
                />
                <button
                  id="save-anniversary-date"
                  onClick={() => {
                    onUpdateStartDate(anniversaryInput);
                    setShowSettings(false);
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-pink-200 cursor-pointer border-none outline-none"
                >
                  Guardar
                </button>
              </div>

              {/* Cambiar perfil section */}
              <div className="mt-4 pt-4 border-t border-pink-50/50 flex flex-col gap-2">
                <p className="text-xs text-gray-500 font-semibold">Configuración de Perfil:</p>
                <button
                  id="change-profile-button"
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas salir y cambiar de perfil?")) {
                      onChangeProfile();
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none outline-none select-none text-center w-full"
                >
                  Cambiar perfil
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Frase del Día Widget */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-[#3A3234] text-white rounded-[32px] p-8 shadow-xl mb-6 relative overflow-hidden border border-[#4d4345]"
        id="quote-of-the-day-widget"
      >
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-5 pointer-events-none">
          <Quote size={150} />
        </div>

        <span className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 font-bold mb-4 block">
          Frase del Día
        </span>
        
        <p className="text-xl font-serif leading-relaxed italic mb-4 font-light text-pink-50">
          "{dailyQuote}"
        </p>

        <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/10 relative z-10">
          <span className="text-xs text-pink-200/60 font-medium tracking-wide">
            — {quoteAuthor}
          </span>
          <button 
            id="refresh-daily-quote"
            onClick={fetchQuote} 
            disabled={loadingQuote}
            className="p-1.5 text-white/40 hover:text-pink-300 rounded-lg transition-all cursor-pointer border-none bg-transparent outline-none"
          >
            <RefreshCw size={14} className={loadingQuote ? "animate-spin text-pink-300" : ""} />
          </button>
        </div>
      </motion.div>

      {/* Interactive Love Tree & Love Button Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Love Tree Widget */}
        <div 
          className="bg-[#F2F1FF] rounded-[32px] p-6 border border-[#EBE9FF] flex flex-col items-center justify-between min-h-[220px] shadow-[0_10px_35px_rgba(235,233,255,0.4)]"
          id="love-tree-widget"
        >
          <div className="text-center w-full">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A527A] tracking-[0.15em] uppercase">
              🌲 ÁRBOL DEL AMOR
            </span>
            <p className="text-[10px] text-[#8E86B0] mt-1 font-semibold italic">Crece con cada "Te amo"</p>
          </div>

          {/* SVG Romantic Tree */}
          <div className="w-full h-32 relative flex items-center justify-center mt-2 overflow-visible" id="love-tree-svg-container">
            <svg viewBox="0 0 120 100" className="w-28 h-28 overflow-visible">
              {/* Tree Trunk */}
              <path 
                d="M 60,95 C 62,80 58,60 60,40 C 62,32 55,25 50,22 M 60,40 C 65,30 72,25 78,25 M 58,60 C 53,52 48,48 42,48 M 61,50 C 68,45 74,42 76,35" 
                fill="none" 
                stroke="#8b5a2b" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
              />
              {/* Hearts/Leaves based on Total Clicks */}
              {Array.from({ length: leafCount }).map((_, i) => {
                const angles = [
                  -45, -15, 15, 45, -75, 75, -110, 110, -140, 140, 
                  -10, 20, -50, 60, -30, 40, -80, 90, 0, 180, -20, 30
                ];
                const angle = angles[i % angles.length];
                const distance = 12 + (i * 0.45) % 24;
                const radians = (angle * Math.PI) / 180;
                
                const baseX = 60;
                const baseY = 36;
                const x = baseX + Math.sin(radians) * distance + Math.sin(i) * 3;
                const y = baseY - Math.cos(radians) * distance * 0.8 + Math.cos(i) * 3;
                const leafSize = 4 + (i % 3);

                return (
                  <motion.path
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: i * 0.015 }}
                    d="M 12,5 C 12,1.5 8.5,0 6,0 C 2.5,0 0,2.5 0,6 C 0,11 6,15 12,20 C 18,15 24,11 24,6 C 24,2.5 21.5,0 18,0 C 15.5,0 12,1.5 12,5 Z"
                    fill={i % 3 === 0 ? "#f472b6" : i % 3 === 1 ? "#ec4899" : "#fda4af"}
                    className="origin-center"
                    transform={`translate(${x - 4}, ${y - 4}) scale(${leafSize / 15})`}
                  />
                );
              })}
            </svg>
            
            {/* Absolute total score badge */}
            <div className="absolute -bottom-1 bg-white/90 border border-[#EBE9FF]/60 px-3 py-0.5 rounded-full shadow-sm">
              <span className="text-[10px] font-bold text-[#5A527A] tracking-wider uppercase">
                {totalClicks} flores de amor
              </span>
            </div>
          </div>
        </div>

        {/* The BIG Te Amo Button */}
        <div 
          className="bg-white rounded-[32px] p-6 border border-pink-50 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] flex flex-col items-center justify-center relative min-h-[220px]"
          id="te-amo-button-widget"
        >
          {/* Animated Particles Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: p.rotation }}
                animate={{ x: p.x, y: p.y, scale: [0.5, 1.2, 0.8], opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ fontSize: p.size, color: p.color }}
              >
                ❤️
              </motion.div>
            ))}
          </div>

          <div className="text-center w-full mb-3">
            <span className="text-[10px] font-bold text-[#A68F94] uppercase tracking-[0.15em] block">
              Mándale un abrazo
            </span>
          </div>

          {/* Interactive pulsing heart container */}
          <motion.button
            id="click-te-amo"
            onClick={handleTeAmoClick}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-[0_12px_25px_rgba(244,114,182,0.35)] hover:shadow-[0_15px_30px_rgba(244,114,182,0.45)] transition-shadow duration-300 relative group cursor-pointer outline-none border-none"
          >
            <motion.div 
              className="absolute inset-0 rounded-full bg-pink-300/30 -z-10"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <Heart size={42} fill="white" className="text-white" />
          </motion.button>

          <p className="text-[10px] font-extrabold text-pink-500 mt-4 tracking-widest uppercase">
            ¡PRESIONA "TE AMO"!
          </p>

          <div className="flex gap-4 mt-3 text-[10.5px] font-bold text-[#A68F94] w-full justify-around border-t border-pink-50/50 pt-2.5">
            <div className="text-center">
              <span className="text-pink-400">Nini:</span> {db?.loveClicks?.Nini || 0}
            </div>
            <div className="text-center">
              <span className="text-pink-400">Jota:</span> {db?.loveClicks?.Jota || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic shortcuts for Calendar Anniversary, Letters, Movies */}
      <div className="grid grid-cols-2 gap-4 mb-6" id="shortcuts-grid">
        {/* Countdown */}
        <div className="bg-white rounded-[24px] p-5 border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.2)] flex flex-col justify-between">
          <div>
            <div className="bg-pink-50/60 w-8 h-8 rounded-xl flex items-center justify-center mb-3">
              <Clock size={15} className="text-pink-500" />
            </div>
            <h3 className="text-[11px] font-bold text-[#3A3234] tracking-wide uppercase">Próximo Cumplemes</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium italic">Nuestra fecha especial</p>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-serif italic text-pink-500 font-bold leading-none">
              {getDaysToNextAnniversary()} <span className="text-[11px] font-sans font-semibold tracking-wider text-gray-400 uppercase">días</span>
            </p>
          </div>
        </div>

        {/* Letters Shortcut */}
        <button 
          id="shortcut-letters"
          onClick={() => onNavigate("cartas")}
          className="bg-white rounded-[24px] p-5 border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.2)] text-left flex flex-col justify-between hover:border-pink-200 transition-colors cursor-pointer border-solid outline-none"
        >
          <div>
            <div className="bg-pink-50/60 w-8 h-8 rounded-xl flex items-center justify-center mb-3">
              <Mail size={15} className="text-pink-500" />
            </div>
            <h3 className="text-[11px] font-bold text-[#3A3234] tracking-wide uppercase">Última Carta</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate font-medium italic">
              {latestLetter ? `De ${latestLetter.from}` : "Ninguna carta escrita"}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-pink-500">
            <span className="truncate max-w-[90px] font-semibold italic font-serif">
              {latestLetter ? latestLetter.title : "Escribir ahora"}
            </span>
            <ChevronRight size={14} className="text-pink-400" />
          </div>
        </button>
      </div>

      {/* Latest Movie Shortcut */}
      {latestMovie && (
        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigate("peliculas")}
          className="bg-white rounded-[24px] p-4 border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.2)] mb-6 flex items-center gap-4 hover:border-pink-200 transition-all cursor-pointer"
          id="latest-movie-shortcut"
        >
          <img 
            src={latestMovie.posterUrl} 
            alt={latestMovie.title} 
            className="w-12 h-16 rounded-xl object-cover shrink-0 bg-gray-50 border border-pink-100"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 bg-[#FFF0F3] text-pink-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1">
              🎬 NUEVA PELÍCULA
            </span>
            <h4 className="text-xs font-bold text-[#3A3234] truncate uppercase tracking-tight">{latestMovie.title}</h4>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">Agregada por {latestMovie.addedBy}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </motion.div>
      )}

      {/* Love History / Activity Feed */}
      <div className="bg-white rounded-[32px] p-7 border border-pink-50 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.25)]" id="recent-activity-feed">
        <span className="flex items-center gap-2 text-[10px] font-bold text-pink-500 tracking-[0.15em] uppercase mb-5">
          <Activity size={14} className="text-pink-400 animate-pulse" />
          Muestras de Amor Recientes
        </span>

        <div className="space-y-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {(db?.loveHistory || []).map((item, index) => {
            const isNini = item.who === "Nini";
            const dateStr = item?.timestamp ? new Date(item.timestamp).toLocaleTimeString("es-ES", {
              hour: "2-digit", minute: "2-digit"
            }) : "";

            const profileObj = db?.profiles?.[item.who];
            const profileAvatar = profileObj?.photoURL || profileObj?.avatar || (item.who === "Nini" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300");

            return (
              <div key={item.id || index} className="flex gap-3 text-xs leading-relaxed items-start border-b border-pink-50/50 pb-3 last:border-0 last:pb-0">
                <img 
                  src={profileAvatar} 
                  alt={item.who || ""} 
                  className="w-7 h-7 rounded-full object-cover mt-0.5 ring-2 ring-pink-100/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#3A3234]">{item.who || "Pareja"} envió amor</span>
                    <span className="text-[9px] text-gray-400 font-medium">{dateStr}</span>
                  </div>
                  <p className="text-gray-500 italic font-medium">"{item.message || ""}"</p>
                </div>
              </div>
            );
          })}
          {(!db?.loveHistory || db.loveHistory.length === 0) && (
            <p className="text-center text-xs text-gray-400 py-4 font-medium italic">¡Presionen el botón de amor arriba para empezar el historial!</p>
          )}
        </div>
      </div>
    </div>
  );
}
