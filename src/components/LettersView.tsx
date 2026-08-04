import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Send, Sparkles, BookOpen, Clock, Heart, Plus, Trash2, 
  X, Check, Type, Palette, Star, Gift, Bold, Italic 
} from "lucide-react";
import { DBState, Letter } from "../types";

interface LettersViewProps {
  db: DBState;
  onAddLetter: (letter: Omit<Letter, "id" | "date" | "isOpened"> & { createdBy: string }) => Promise<void>;
  onOpenLetter: (id: string) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
  currentUser: string;
}

export default function LettersView({
  db,
  onAddLetter,
  onOpenLetter,
  onDeleteLetter,
  currentUser
}: LettersViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const otherUserName = currentUserName === "Nini" ? "Jota" : "Nini";
  const currentUserId = currentUser === "Nini" || currentUser === "nini_001" ? "nini_001" : "jota_001";
  const otherUserId = currentUserId === "nini_001" ? "jota_001" : "nini_001";

  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  // Form states for new letter
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bgColor, setBgColor] = useState("from-rose-50 to-rose-100");
  const [textColor, setTextColor] = useState("text-rose-800");
  const [fontFamily, setFontFamily] = useState("font-serif");
  const [sticker, setSticker] = useState("❤️");
  const [backgroundPattern, setBackgroundPattern] = useState("hearts");

  const fontOptions = [
    { id: "font-serif", name: "Elegante Serif", class: "font-serif" },
    { id: "font-sans", name: "Moderno Sans", class: "font-sans" },
    { id: "font-mono", name: "Carta de Máquina", class: "font-mono" },
    { id: "font-hand", name: "Cursiva Tierna", class: "font-serif italic tracking-wide" }
  ];

  const bgOptions = [
    { id: "rose", name: "Rosa Amor", bg: "from-rose-50 to-rose-100", text: "text-rose-800" },
    { id: "purple", name: "Lila Mágico", bg: "from-purple-50 to-purple-100", text: "text-purple-800" },
    { id: "amber", name: "Cálido Atardecer", bg: "from-amber-50 to-amber-100", text: "text-amber-800" },
    { id: "sky", name: "Azul Cielo", bg: "from-sky-50 to-sky-100", text: "text-sky-800" }
  ];

  const patternOptions = [
    { id: "hearts", name: "Corazones", emoji: "❤️" },
    { id: "stars", name: "Estrellas", emoji: "✨" },
    { id: "flowers", name: "Flores", emoji: "🌸" },
    { id: "plain", name: "Liso", emoji: "✉️" }
  ];

  const stickersList = ["❤️", "✨", "💋", "🌸", "🧸", "🍰", "💍", "🕊️", "🍿", "🍫"];

  const handleOpenEnvelope = async (letter: Letter) => {
    setActiveLetter(letter);
    setEnvelopeOpened(false); // reset state
    
    // Mark as opened in DB if it's addressed to current user and unread
    if (((letter.to as string) === currentUserName || (letter.to as string) === currentUserId) && !letter.isOpened) {
      await onOpenLetter(letter.id);
    }
  };

  const handleSendLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await onAddLetter({
      from: currentUserName,
      to: otherUserName,
      createdBy: currentUserId,
      title: title.trim(),
      content: content.trim(),
      style: {
        bgColor,
        textColor,
        fontFamily,
        sticker,
        backgroundPattern
      }
    });

    // Reset Form
    setTitle("");
    setContent("");
    setBgColor("from-rose-50 to-rose-100");
    setTextColor("text-rose-800");
    setFontFamily("font-serif");
    setSticker("❤️");
    setBackgroundPattern("hearts");
    
    setIsWriting(false);
  };

  const myLetters = db?.letters || [];

  return (
    <div className="pb-32 pt-4 px-4 max-w-md mx-auto" id="letters-view-container">
      {/* View Header */}
      <div className="flex justify-between items-end mb-6 pt-4 border-b border-pink-100/30 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68F94] font-semibold mb-1 block">Buzón de Amor</span>
          <h2 className="text-3xl font-serif italic text-[#3A3234] leading-tight font-light">Cartas Especiales</h2>
        </div>

        {!isWriting && (
          <button
            id="write-letter-button"
            onClick={() => setIsWriting(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-pink-200 flex items-center gap-1.5 cursor-pointer outline-none border-none"
          >
            <Plus size={14} />
            Escribir
          </button>
        )}
      </div>

      {/* Main Buzon View */}
      <AnimatePresence mode="wait">
        {!isWriting ? (
          <motion.div
            key="mailbox-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
            id="letters-mailbox-list"
          >
            {/* Letters Grid */}
            <div className="grid grid-cols-2 gap-4">
              {myLetters.map((letter) => {
                if (!letter) return null;
                const isFromMe = letter?.from === currentUserName || letter?.createdBy === currentUserId;
                const isUnread = (((letter?.to as string) === currentUserName || (letter?.to as string) === currentUserId) && !letter?.isOpened);

                return (
                  <motion.div
                    key={letter?.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenEnvelope(letter)}
                    className="bg-white rounded-[28px] p-5 border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.25)] relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer"
                    id={`letter-card-${letter?.id}`}
                  >
                    {/* Glowing notification badge for unread letter */}
                    {isUnread && (
                      <span className="absolute top-3 right-3 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
                      </span>
                    )}

                    {/* Stamp / Decorative Seal indicator */}
                    <div className="absolute -right-2 -bottom-2 opacity-10 select-none text-5xl">
                      💌
                    </div>

                    <div>
                      <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        {isFromMe ? `Para ${letter?.to || ""}` : `De ${letter?.from || ""}`}
                      </p>
                      <h3 className="text-xs font-bold text-[#3A3234] line-clamp-2 uppercase tracking-tight leading-snug">
                        {letter?.title || ""}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-pink-50/50 flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-semibold tracking-wider flex items-center gap-1 uppercase">
                        <Clock size={10} />
                        {letter?.date || ""}
                      </span>
                      <span className="text-xs text-pink-400 font-bold bg-pink-50 px-2 py-0.5 rounded-lg">
                        {letter?.style?.sticker || "❤️"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {myLetters.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.2)]">
                  <Mail size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium italic">Buzón vacío...</p>
                  <p className="text-[10px] text-pink-400 mt-1 font-semibold">¡Sé el primero en dejar un sobre tierno!</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Writing Stage styled like a clean personal desk paper */
          <motion.form
            key="letter-writing-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSendLetter}
            className="space-y-6"
            id="letters-compose-form"
          >
            {/* Live Visual Paper Preview Container */}
            <div 
              className={`bg-gradient-to-tr ${bgColor} rounded-[32px] p-7 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] border border-white/60 relative overflow-hidden transition-all`}
              id="live-paper-preview"
            >
              {/* Pattern Stamp overlay */}
              {backgroundPattern === "hearts" && (
                <div className="absolute inset-0 opacity-[0.06] select-none pointer-events-none text-2xl leading-none flex flex-wrap gap-4 p-4">
                  {Array.from({ length: 48 }).map((_, i) => <span key={i}>❤️</span>)}
                </div>
              )}
              {backgroundPattern === "stars" && (
                <div className="absolute inset-0 opacity-[0.06] select-none pointer-events-none text-2xl leading-none flex flex-wrap gap-4 p-4">
                  {Array.from({ length: 48 }).map((_, i) => <span key={i}>✨</span>)}
                </div>
              )}
              {backgroundPattern === "flowers" && (
                <div className="absolute inset-0 opacity-[0.06] select-none pointer-events-none text-2xl leading-none flex flex-wrap gap-4 p-4">
                  {Array.from({ length: 48 }).map((_, i) => <span key={i}>🌸</span>)}
                </div>
              )}

              {/* Decorative Wax Seal Sticker */}
              <div className="absolute right-6 top-6 text-2xl select-none bg-white/70 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                {sticker}
              </div>

              {/* Letter Title Input */}
              <input
                type="text"
                placeholder="Título de la carta..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`bg-transparent border-b border-black/10 focus:border-black/30 w-full pb-2 text-sm font-extrabold outline-none tracking-tight ${textColor} uppercase`}
                required
              />

              {/* Letter Content Input */}
              <textarea
                placeholder="Escribe tus sentimientos más bellos aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`bg-transparent w-full mt-4 text-xs leading-relaxed outline-none min-h-[160px] resize-none ${textColor} ${fontFamily}`}
                required
              />

              {/* Letter bottom details */}
              <div className="mt-6 pt-3 border-t border-black/5 flex justify-between items-center text-[10px] text-black/40 font-bold uppercase">
                <span>Para: {currentUserName === "Nini" ? "Jota" : "Nini"}</span>
                <span>Hoy</span>
              </div>
            </div>

            {/* Customizer Panels */}
            <div className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.25)] space-y-4">
              {/* Fuentes Section */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Type size={11} className="text-purple-400" />
                  Estilo de Letra
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fontOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.class)}
                      className={`text-xs px-3 py-1.5 rounded-xl border border-solid transition-all cursor-pointer outline-none ${
                        fontFamily === f.class
                          ? "bg-purple-50 text-purple-600 border-purple-200 font-bold"
                          : "bg-gray-50 text-gray-600 border-transparent hover:border-gray-100"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Colors Section */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Palette size={11} className="text-rose-400" />
                  Color de Papel
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bgOptions.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBgColor(b.bg);
                        setTextColor(b.text);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border border-solid transition-all cursor-pointer outline-none ${
                        bgColor === b.bg
                          ? "bg-rose-50 text-rose-600 border-rose-200 font-bold"
                          : "bg-gray-50 text-gray-600 border-transparent hover:border-gray-100"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Patterns Section */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Star size={11} className="text-amber-400" />
                  Textura de Fondo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patternOptions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBackgroundPattern(p.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border border-solid transition-all cursor-pointer outline-none ${
                        backgroundPattern === p.id
                          ? "bg-amber-50 text-amber-600 border-amber-200 font-bold"
                          : "bg-gray-50 text-gray-600 border-transparent hover:border-gray-100"
                      }`}
                    >
                      <span className="mr-1">{p.emoji}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stickers list */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Gift size={11} className="text-pink-400" />
                  Pegatina / Sello
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  {stickersList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSticker(s)}
                      className={`text-lg p-1.5 rounded-xl border border-solid transition-all shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer outline-none ${
                        sticker === s
                          ? "bg-rose-50 border-rose-300 scale-110"
                          : "bg-gray-50 border-transparent hover:scale-105"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                id="cancel-compose"
                onClick={() => setIsWriting(false)}
                className="text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-2xl transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="send-letter-submit"
                className="text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 px-6 py-2.5 rounded-2xl transition-all shadow-md shadow-pink-200 flex items-center gap-1.5 cursor-pointer outline-none border-none"
              >
                <Send size={13} />
                Enviar Carta
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Envelope Interactive Animated Reading Modal Overlay */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            id="envelope-modal-overlay"
          >
            <div className="w-full max-w-sm relative">
              {/* Close Button */}
              <button
                id="close-letter-modal"
                onClick={() => {
                  setActiveLetter(null);
                  setEnvelopeOpened(false);
                }}
                className="absolute -top-12 right-2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer border-none bg-transparent outline-none"
              >
                <X size={24} />
              </button>

              <AnimatePresence mode="wait">
                {!envelopeOpened ? (
                  /* CLOSED ENVELOPE STAGE */
                  <motion.div
                    key="closed-stage"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    className="bg-pink-50 rounded-[32px] border-4 border-solid border-pink-100 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden"
                    id="closed-envelope-card"
                  >
                    {/* Retro lines representing a physical postcard style */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-stripes bg-pink-200"></div>
                    
                    <div className="mx-auto w-16 h-16 bg-white/70 rounded-full flex items-center justify-center shadow-inner relative">
                      <Mail size={32} className="text-pink-500" />
                      <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-solid border-white animate-bounce">
                        !
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-pink-500 tracking-widest uppercase">SOBRE EXCLUSIVO</p>
                      <h3 className="text-base font-bold text-[#3A3234] uppercase tracking-tight">
                        {activeLetter?.title || ""}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium italic">
                        De: <span className="font-bold text-gray-700">{activeLetter?.from || ""}</span> para <span className="font-bold text-gray-700">{activeLetter?.to || ""}</span>
                      </p>
                    </div>

                    {/* Wax Seal Click Button */}
                    <button
                      id="open-envelope-wax-seal"
                      onClick={() => setEnvelopeOpened(true)}
                      className="w-20 h-20 bg-pink-500 hover:bg-pink-600 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg border-4 border-solid border-pink-200 animate-pulse active:scale-95 transition-transform cursor-pointer outline-none relative group border-none"
                    >
                      <span className="relative z-10">{activeLetter?.style?.sticker || "❤️"}</span>
                      <span className="absolute inset-0 rounded-full bg-pink-400/50 animate-ping"></span>
                    </button>

                    <p className="text-xs font-bold text-pink-600 tracking-wider uppercase">Toca el sello para abrir</p>
                  </motion.div>
                ) : (
                  /* OPENED PHYSICAL LETTER STAGE */
                  <motion.div
                    key="opened-stage"
                    initial={{ scale: 0.95, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`bg-gradient-to-tr ${activeLetter?.style?.bgColor || "from-rose-50 to-rose-100"} rounded-[32px] p-8 shadow-2xl relative overflow-hidden max-h-[80vh] overflow-y-auto border border-solid border-white/50`}
                    id="opened-letter-card"
                  >
                    {/* Subtle patterns overlay */}
                    {activeLetter?.style?.backgroundPattern === "hearts" && (
                      <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none text-xl leading-none flex flex-wrap gap-3.5 p-4">
                        {Array.from({ length: 36 }).map((_, i) => <span key={i}>❤️</span>)}
                      </div>
                    )}
                    {activeLetter?.style?.backgroundPattern === "stars" && (
                      <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none text-xl leading-none flex flex-wrap gap-3.5 p-4">
                        {Array.from({ length: 36 }).map((_, i) => <span key={i}>✨</span>)}
                      </div>
                    )}
                    {activeLetter?.style?.backgroundPattern === "flowers" && (
                      <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none text-xl leading-none flex flex-wrap gap-3.5 p-4">
                        {Array.from({ length: 36 }).map((_, i) => <span key={i}>🌸</span>)}
                      </div>
                    )}

                    {/* Seal Badge sticker floating */}
                    <div className="absolute right-6 top-6 text-xl select-none bg-white/70 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center shadow-sm">
                      {activeLetter?.style?.sticker || "❤️"}
                    </div>

                    <div className="relative">
                      {/* Trash action for the creator */}
                      {(activeLetter?.from === currentUserName || activeLetter?.createdBy === currentUserId) && (
                        <button
                          id={`delete-letter-${activeLetter?.id}`}
                          onClick={async () => {
                            if (confirm("¿Estás seguro de que deseas eliminar esta carta de amor para siempre?")) {
                              await onDeleteLetter(activeLetter.id);
                              setActiveLetter(null);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-black/5 transition-all mb-4 border-none bg-transparent cursor-pointer"
                          title="Eliminar carta"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        De {activeLetter?.from || ""} para {activeLetter?.to || ""}
                      </p>
                      
                      <h3 className={`text-base font-bold uppercase tracking-tight leading-tight mb-4 border-b border-solid border-black/5 pb-2 ${activeLetter?.style?.textColor || "text-rose-800"}`}>
                        {activeLetter?.title || ""}
                      </h3>

                      <p className={`text-sm leading-relaxed whitespace-pre-wrap font-serif italic font-light ${activeLetter?.style?.textColor || "text-rose-800"} ${activeLetter?.style?.fontFamily || "font-serif"}`}>
                        {activeLetter?.content || ""}
                      </p>

                      <div className="mt-8 pt-4 border-t border-solid border-black/5 flex justify-between items-center text-[10px] text-black/30 font-bold uppercase">
                        <span>Hecho con amor</span>
                        <span>{activeLetter?.date || ""}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
