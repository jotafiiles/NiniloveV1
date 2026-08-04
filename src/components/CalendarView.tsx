import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Calendar, Heart, MessageSquare, 
  Smile, User, FileText, Check, Plus, Edit2, Trash2 
} from "lucide-react";
import { DBState, CalendarEvent } from "../types";

interface CalendarViewProps {
  db: DBState;
  onAddCalendarEvent: (event: CalendarEvent) => Promise<void>;
  currentUser: string;
}

export default function CalendarView({
  db,
  onAddCalendarEvent,
  currentUser
}: CalendarViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const currentUserId = currentUser === "Nini" || currentUser === "nini_001" ? "nini_001" : "jota_001";

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 3)); // Match mock state date: August 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-08-03");
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [phrase, setPhrase] = useState("");
  const [writtenBy, setWrittenBy] = useState<"Nini" | "Jota">(currentUserName as "Nini" | "Jota");
  const [emojis, setEmojis] = useState("💖✨");
  const [notes, setNotes] = useState("");

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get starting day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = new Date(year, month, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to construct YYYY-MM-DD date string
  const formatDateString = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Get calendar events
  const selectedEvent: CalendarEvent | undefined = db?.calendar?.[selectedDateStr];

  // Prepare editing state
  const startEditing = () => {
    if (selectedEvent) {
      setPhrase(selectedEvent.phrase);
      setWrittenBy(selectedEvent.writtenBy);
      setEmojis(selectedEvent.emojis);
      setNotes(selectedEvent.notes);
    } else {
      setPhrase("");
      setWrittenBy(currentUserName as "Nini" | "Jota");
      setEmojis("💖✨");
      setNotes("");
    }
    setIsEditing(true);
  };

  // Handle save memory
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) return;

    await onAddCalendarEvent({
      date: selectedDateStr,
      phrase: phrase.trim(),
      writtenBy: currentUserName as "Nini" | "Jota",
      emojis: emojis.trim() || "💖",
      notes: notes.trim(),
      hasMemory: notes.trim().length > 0,
      createdBy: currentUserId
    });
    
    setIsEditing(false);
  };

  return (
    <div className="pb-32 pt-4 px-4 max-w-md mx-auto" id="calendar-view-container">
      {/* View Header */}
      <div className="text-center mb-6 pt-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68F94] font-semibold mb-1 block">Nuestro Calendario</span>
        <h2 className="text-3xl font-serif italic text-[#3A3234] leading-tight font-light">Recuerdos Diarios</h2>
        <p className="text-xs text-gray-400 mt-1 italic font-medium">Log de momentos felices y frases de amor</p>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] mb-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <button 
            id="prev-month-button"
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-pink-500 rounded-full hover:bg-pink-50/50 transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-[#3A3234] tracking-[0.1em] uppercase">
            {monthNames[month]} {year}
          </span>
          <button 
            id="next-month-button"
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-pink-500 rounded-full hover:bg-pink-50/50 transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
            <span key={idx} className="text-[10px] font-bold text-pink-300 tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid Numbers */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Offset days */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-9 w-9"></div>
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = formatDateString(dayNum);
            const isSelected = selectedDateStr === dateStr;
            const hasEvent = db?.calendar && db.calendar[dateStr] !== undefined;
            
            return (
              <button
                key={dateStr}
                id={`calendar-day-${dayNum}`}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  setIsEditing(false);
                }}
                className={`h-9 w-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold relative transition-all cursor-pointer border-none bg-transparent outline-none ${
                  isSelected
                    ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                    : "text-gray-600 hover:bg-pink-50/50"
                }`}
              >
                <span>{dayNum}</span>
                {hasEvent && (
                  <span 
                    className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-pink-400 animate-pulse"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Romantic Card */}
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="display-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)]"
            id="calendar-memory-display"
          >
            {/* Header with selected date */}
            <div className="flex justify-between items-center border-b border-pink-50/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-pink-50 px-2.5 py-1 rounded-xl">
                  <span className="text-xs font-bold text-pink-500">
                    {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("es-ES", {
                      day: "numeric", month: "short"
                    })}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Detalles del día</p>
              </div>

              <button
                id="edit-memory-button"
                onClick={startEditing}
                className="text-xs font-semibold text-pink-500 hover:text-pink-600 bg-pink-50 hover:bg-pink-100/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 outline-none"
              >
                {selectedEvent ? (
                  <>
                    <Edit2 size={12} />
                    Editar
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    Añadir Frase
                  </>
                )}
              </button>
            </div>

            {/* Display notes and phrases if exists */}
            {selectedEvent ? (
              <div className="space-y-4">
                {/* Phrase Section */}
                <div className="bg-gradient-to-tr from-pink-50/20 to-purple-50/20 p-5 rounded-2xl border border-pink-50/40 relative">
                  <div className="absolute right-4 top-4 text-lg select-none">
                    {selectedEvent.emojis}
                  </div>
                  <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <MessageSquare size={12} />
                    Frase de amor:
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#3A3234] italic font-serif font-light pr-10">
                    "{selectedEvent.phrase}"
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold mt-2 text-right uppercase tracking-wider">
                    Escrita por {selectedEvent.writtenBy}
                  </p>
                </div>

                {/* Notes/Memory Section */}
                {selectedEvent.notes && (
                  <div className="pl-3 border-l-2 border-pink-200">
                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Smile size={12} />
                      Recuerdo de este día:
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 font-medium italic">No hay ninguna frase o recuerdo guardado para este día aún.</p>
                <p className="text-[10px] text-pink-400 mt-1 font-semibold">¡Haz clic en Añadir arriba para dejarle un detalle tierno!</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="edit-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSaveEvent}
            className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] space-y-4"
            id="calendar-memory-form"
          >
            <div className="flex items-center justify-between border-b border-pink-50/50 pb-3 mb-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Escribir Recuerdo</h3>
              <span className="text-[10.5px] font-bold text-pink-500 uppercase tracking-wider">
                {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("es-ES", {
                  day: "numeric", month: "long"
                })}
              </span>
            </div>

            {/* Phrase Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare size={12} className="text-pink-400" />
                Frase Romántica (Obligatorio)
              </label>
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Ej. El mejor día de la semana siempre es el que paso a tu lado..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs text-gray-700 outline-none focus:border-pink-300 min-h-[60px]"
                required
              />
            </div>

            {/* Emoji row */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Smile size={12} className="text-pink-400" />
                Emojis para el día
              </label>
              <input
                type="text"
                value={emojis}
                onChange={(e) => setEmojis(e.target.value)}
                placeholder="Ej. 💖🌸☀️"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-pink-300"
              />
            </div>

            {/* Note/Memory Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <FileText size={12} className="text-pink-400" />
                Notas del día / Recuerdo (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Tomamos cafecito en la tarde y paseamos juntos..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs text-gray-700 outline-none focus:border-pink-300 min-h-[60px]"
              />
            </div>

            {/* Actions row */}
            <div className="flex gap-2 justify-end pt-2 border-t border-pink-50/50">
              <button
                type="button"
                id="cancel-memory-edit"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="save-memory-button"
                className="text-xs font-semibold text-white bg-pink-500 hover:bg-pink-600 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-pink-200 flex items-center gap-1 cursor-pointer border-none outline-none"
              >
                <Check size={14} />
                Guardar Recuerdo
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
