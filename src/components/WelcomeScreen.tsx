import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { DBState } from "../types";

interface WelcomeScreenProps {
  db: DBState;
  onConfirmUser: (userId: "Nini" | "Jota") => void;
}

export default function WelcomeScreen({ db, onConfirmUser }: WelcomeScreenProps) {
  const [selectedUser, setSelectedUser] = useState<"Nini" | "Jota" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const niniProfile = db?.profiles?.Nini;
  const jotaProfile = db?.profiles?.Jota;

  const handleCardClick = (user: "Nini" | "Jota") => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onConfirmUser(selectedUser);
    }
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedUser(null);
  };

  // Profile fields with safe fallback
  const profilesData = {
    Nini: {
      name: niniProfile?.displayName || niniProfile?.name || "Nini",
      avatar: niniProfile?.photoURL || niniProfile?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
      bio: niniProfile?.bio || "Amante de los mimos y el chocolate. ¡Rincón favorito!",
      emoji: "🌸",
      colorClass: "from-pink-100/70 to-rose-200/50 hover:border-pink-300 ring-pink-300",
      badgeColor: "bg-pink-100 text-pink-700",
      accentBg: "bg-pink-500",
    },
    Jota: {
      name: jotaProfile?.displayName || jotaProfile?.name || "Jota",
      avatar: jotaProfile?.photoURL || jotaProfile?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      bio: jotaProfile?.bio || "Apasionado por la tecnología y hacer sonreír a mi reina.",
      emoji: "⚡",
      colorClass: "from-blue-100/70 to-indigo-200/50 hover:border-blue-300 ring-blue-300",
      badgeColor: "bg-blue-100 text-blue-700",
      accentBg: "bg-blue-500",
    },
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-tr from-[#fff3f5] via-[#ffffff] to-[#f4f2ff] flex flex-col justify-between p-6 relative overflow-hidden"
      id="welcome-screen-container"
    >
      {/* Decorative floating shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/25 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/25 blur-[80px] pointer-events-none" />

      {/* Header section with Logo & Welcome */}
      <div className="flex flex-col items-center text-center mt-8 relative z-10" id="welcome-header">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-pink-500 mb-3 bg-white/80 p-4 rounded-[24px] shadow-[0_10px_30px_rgba(255,182,193,0.2)] border border-pink-50/50 flex items-center justify-center"
        >
          <Heart size={36} fill="currentColor" className="animate-pulse" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-serif italic text-[#3A3234] leading-tight font-light"
        >
          NiniLove
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-rose-400 font-bold tracking-[0.2em] mt-1.5 uppercase"
        >
          Nuestro espacio de amor
        </motion.p>
      </div>

      {/* Main card selector */}
      <div className="flex flex-col items-center my-auto py-10 relative z-10" id="welcome-selector-body">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-bold text-[#4e4345] uppercase tracking-widest mb-6"
        >
          ¿Quién eres?
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {/* Nini Card */}
          <motion.button
            onClick={() => handleCardClick("Nini")}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`backdrop-blur-xl bg-white/50 border border-white/60 p-5 rounded-[32px] text-left flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-[0_12px_35px_-12px_rgba(255,182,193,0.3)] hover:shadow-[0_20px_45px_-10px_rgba(255,182,193,0.45)] cursor-pointer outline-none relative overflow-hidden group`}
            id="welcome-card-nini"
          >
            {/* Soft decorative background tint on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex justify-between items-start relative z-10 w-full">
              <img 
                src={profilesData.Nini.avatar} 
                alt={profilesData.Nini.name} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl">{profilesData.Nini.emoji}</span>
            </div>

            <div className="relative z-10 mt-6">
              <h3 className="text-sm font-bold text-[#3A3234] uppercase tracking-wide">
                {profilesData.Nini.name}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-3 italic">
                "{profilesData.Nini.bio}"
              </p>
            </div>
          </motion.button>

          {/* Jota Card */}
          <motion.button
            onClick={() => handleCardClick("Jota")}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`backdrop-blur-xl bg-white/50 border border-white/60 p-5 rounded-[32px] text-left flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-[0_12px_35px_-12px_rgba(59,130,246,0.15)] hover:shadow-[0_20px_45px_-10px_rgba(59,130,246,0.25)] cursor-pointer outline-none relative overflow-hidden group`}
            id="welcome-card-jota"
          >
            {/* Soft decorative background tint on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex justify-between items-start relative z-10 w-full">
              <img 
                src={profilesData.Jota.avatar} 
                alt={profilesData.Jota.name} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl">{profilesData.Jota.emoji}</span>
            </div>

            <div className="relative z-10 mt-6">
              <h3 className="text-sm font-bold text-[#3A3234] uppercase tracking-wide">
                {profilesData.Jota.name}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-3 italic">
                "{profilesData.Jota.bio}"
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Footer sign */}
      <div className="text-center pb-4 text-[10px] text-gray-400 font-bold tracking-widest relative z-10 select-none">
        NINILOVE &copy; {new Date().getFullYear()} &bull; HECHO CON ❤️
      </div>

      {/* Confirmation Overlay Dialog */}
      <AnimatePresence>
        {showConfirm && selectedUser && (
          <div 
            className="fixed inset-0 bg-[#3A3234]/30 backdrop-blur-md flex items-center justify-center p-6 z-50"
            id="welcome-confirm-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-[32px] p-6 max-w-xs w-full shadow-[0_25px_60px_-15px_rgba(58,50,52,0.4)] border border-pink-50 text-center"
              id="welcome-confirm-modal"
            >
              <div className="flex justify-center mb-4">
                <img 
                  src={profilesData[selectedUser].avatar} 
                  alt={profilesData[selectedUser].name} 
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100 shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h4 className="text-base font-bold text-[#3A3234] leading-snug">
                ¿Confirmas que eres {profilesData[selectedUser].name}?
              </h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1.5 leading-relaxed px-2">
                Guardaremos tu elección en este dispositivo para que no tengas que volver a seleccionarlo.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  id="welcome-confirm-cancel"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer border-none outline-none select-none"
                >
                  Cancelar
                </button>
                <button
                  id="welcome-confirm-continue"
                  onClick={handleConfirm}
                  className={`flex-1 ${profilesData[selectedUser].accentBg} hover:opacity-90 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer border-none outline-none select-none`}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
