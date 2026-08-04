import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Heart, Palette, MessageSquare, Film, Edit2, Check, 
  X, Sparkles, BookOpen, Camera, ShieldAlert
} from "lucide-react";
import { DBState, Profile } from "../types";

interface ProfileViewProps {
  db: DBState;
  onUpdateProfile: (profile: Profile) => Promise<void>;
  currentUser: string;
}

export default function ProfileView({
  db,
  onUpdateProfile,
  currentUser
}: ProfileViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const [selectedProfileTab, setSelectedProfileTab] = useState<"Nini" | "Jota">("Nini");
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [favMovie, setFavMovie] = useState("");
  const [favColor, setFavColor] = useState("");
  const [favQuote, setFavQuote] = useState("");

  const activeProfile = db?.profiles?.[selectedProfileTab] || {
    name: selectedProfileTab,
    avatar: selectedProfileTab === "Nini" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    photoURL: selectedProfileTab === "Nini" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    bio: "",
    favMovie: "",
    favColor: "",
    favQuote: ""
  };
  const isMe = selectedProfileTab === currentUserName;

  const startEditing = () => {
    setAvatar(activeProfile?.photoURL || activeProfile?.avatar || "");
    setBio(activeProfile?.bio || "");
    setFavMovie(activeProfile?.favMovie || "");
    setFavColor(activeProfile?.favColor || "");
    setFavQuote(activeProfile?.favQuote || "");
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      name: selectedProfileTab,
      avatar: avatar.trim(),
      photoURL: avatar.trim(),
      bio: bio.trim(),
      favMovie: favMovie.trim(),
      favColor: favColor.trim(),
      favQuote: favQuote.trim()
    });
    setIsEditing(false);
  };

  return (
    <div className="pb-32 pt-4 px-4 max-w-md mx-auto" id="profile-view-container">
      {/* View Header */}
      <div className="text-center mb-6 pt-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68F94] font-semibold mb-1 block">Nuestros Perfiles</span>
        <h2 className="text-3xl font-serif italic text-[#3A3234] leading-tight font-light">Cómplices de Amor</h2>
        <p className="text-xs text-[#A68F94] font-serif italic font-light mt-1">Conócenos un poco más de cerca</p>
      </div>

      {/* Profile selector tabs */}
      <div className="flex gap-2 mb-6 bg-pink-50/30 p-1.5 rounded-2xl border border-pink-50/20" id="profile-selector-tabs">
        <button
          id="tab-profile-nini"
          onClick={() => {
            setSelectedProfileTab("Nini");
            setIsEditing(false);
          }}
          className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none outline-none ${
            selectedProfileTab === "Nini"
              ? "bg-pink-500 text-white shadow-md shadow-pink-100"
              : "text-pink-600 hover:bg-pink-50/50 bg-transparent"
          }`}
        >
          Perfil Nini 🌸
        </button>
        <button
          id="tab-profile-jota"
          onClick={() => {
            setSelectedProfileTab("Jota");
            setIsEditing(false);
          }}
          className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none outline-none ${
            selectedProfileTab === "Jota"
              ? "bg-pink-500 text-white shadow-md shadow-pink-100"
              : "text-pink-600 hover:bg-pink-50/50 bg-transparent"
          }`}
        >
          Perfil Jota ⚡
        </button>
      </div>

      {/* Profile Card Container */}
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key={selectedProfileTab}
            initial={{ opacity: 0, x: selectedProfileTab === "Nini" ? -15 : 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: selectedProfileTab === "Nini" ? 15 : -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-[32px] border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.25)] overflow-hidden"
            id={`profile-card-display-${selectedProfileTab}`}
          >
            {/* Cover header area with soft gradient */}
            <div className="h-28 bg-gradient-to-r from-pink-100 via-rose-50 to-purple-100 relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
              
              {/* Edit button if viewing own profile */}
              {isMe && (
                <button
                  id="edit-profile-button"
                  onClick={startEditing}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white backdrop-blur-md p-2 rounded-xl text-pink-500 hover:scale-105 transition-all shadow-sm border-none cursor-pointer outline-none"
                  title="Editar mi perfil"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {/* Avatar & Basic details */}
            <div className="px-6 pb-6 relative">
              {/* Avatar picture offset */}
              <div className="flex justify-center -mt-14 mb-4">
                <img 
                  src={activeProfile?.photoURL || activeProfile?.avatar || ""} 
                  alt={activeProfile?.name || ""} 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md bg-gray-100"
                />
              </div>

              {/* Name & Bio */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-bold text-[#3A3234] tracking-tight flex items-center justify-center gap-1 uppercase">
                  {activeProfile?.name}
                  {selectedProfileTab === "Nini" ? "🌸" : "⚡"}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-[280px] mx-auto">
                  {activeProfile?.bio}
                </p>
              </div>

              {/* Romantic Preferences list */}
              <div className="space-y-3 pt-3 border-t border-pink-50">
                {/* Fav Movie */}
                <div className="flex items-center gap-3.5 bg-gray-50/60 p-3 rounded-2xl border border-gray-100/30">
                  <div className="bg-pink-50 p-2.5 rounded-xl text-pink-500 shrink-0">
                    <Film size={16} />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">Película Favorita</span>
                    <span className="text-xs font-bold text-[#3A3234]">{activeProfile?.favMovie}</span>
                  </div>
                </div>

                {/* Fav Color */}
                <div className="flex items-center gap-3.5 bg-gray-50/60 p-3 rounded-2xl border border-gray-100/30">
                  <div className="bg-pink-50 p-2.5 rounded-xl text-pink-500 shrink-0">
                    <Palette size={16} />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">Color Favorito</span>
                    <span className="text-xs font-bold text-[#3A3234]">{activeProfile?.favColor}</span>
                  </div>
                </div>

                {/* Fav Quote phrase */}
                <div className="flex items-start gap-3.5 bg-pink-50/10 p-3 rounded-2xl border border-pink-100/10">
                  <div className="bg-pink-50 p-2.5 rounded-xl text-pink-500 shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">Frase de Cabecera</span>
                    <span className="text-xs font-serif italic font-light text-[#3A3234]">"{activeProfile?.favQuote}"</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Editor Stage for profiles */
          <motion.form
            key="profile-edit-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSaveProfile}
            className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] space-y-4"
            id="profile-editing-form"
          >
            <div className="flex items-center gap-2 border-b border-pink-50 pb-3 mb-1">
              <Sparkles size={16} className="text-pink-500" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Editar Perfil de {selectedProfileTab}
              </h3>
            </div>

            {/* Avatar Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Camera size={11} className="text-pink-400" />
                URL de Foto de Perfil
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
                required
              />
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <BookOpen size={11} className="text-pink-400" />
                Sobre Mí (Biografía)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-pink-300 min-h-[60px]"
                required
              />
            </div>

            {/* Fav Movie */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Film size={11} className="text-pink-400" />
                Película Favorita
              </label>
              <input
                type="text"
                value={favMovie}
                onChange={(e) => setFavMovie(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
                required
              />
            </div>

            {/* Fav Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Palette size={11} className="text-pink-400" />
                Color Favorito
              </label>
              <input
                type="text"
                value={favColor}
                onChange={(e) => setFavColor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
                required
              />
            </div>

            {/* Fav Quote */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare size={11} className="text-pink-400" />
                Frase de Cabecera
              </label>
              <input
                type="text"
                value={favQuote}
                onChange={(e) => setFavQuote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
                required
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-2 justify-end pt-2 border-t border-pink-50">
              <button
                type="button"
                id="cancel-profile-edit"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="save-profile-button"
                className="text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-pink-200 flex items-center gap-1 cursor-pointer outline-none border-none"
              >
                <Check size={14} />
                Guardar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
