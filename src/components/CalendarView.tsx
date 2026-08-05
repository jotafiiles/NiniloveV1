import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Calendar, Heart, MessageSquare, 
  Smile, User, FileText, Check, Plus, Edit2, Trash2 
} from "lucide-react";
import { DBState, CalendarEvent } from "../types";

interface CalendarViewProps {
  db: DBState;
  onAddCalendarEvent: (event: CalendarEvent) => Promise<void>;
  onDeleteCalendarEvent?: (date: string) => Promise<void>;
  currentUser: string;
}

// Helper to construct YYYY-MM-DD date string based on device's local time
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to calculate daily turnowner dynamically based on the relation start date
export function getDayTurn(startDateStr: string, targetDateStr: string): "Jota" | "Nini" {
  // Parse both dates strictly at local midnight (00:00:00) to avoid timezone/daylight saving shifts
  const startParts = startDateStr.split("-").map(Number); // [YYYY, MM, DD]
  const targetParts = targetDateStr.split("-").map(Number); // [YYYY, MM, DD]
  
  const startLocal = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0, 0);
  const targetLocal = new Date(targetParts[0], targetParts[1] - 1, targetParts[2], 0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = targetLocal.getTime() - startLocal.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Alternating turn starting from start date
  // (diffDays % 2 + 2) % 2 handles negative differences continuously
  const normalized = ((diffDays % 2) + 2) % 2;
  return normalized === 1 ? "Jota" : "Nini";
}

export default function CalendarView({
  db,
  onAddCalendarEvent,
  onDeleteCalendarEvent,
  currentUser
}: CalendarViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const currentUserId = currentUser === "Nini" || currentUser === "nini_001" ? "nini_001" : "jota_001";

  // Standard relationship start date fallback
  const relationshipStartDate = db?.daysTogetherStartDate || "2024-02-14";

  // Component state initialized dynamically using device local clock
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getLocalDateString(today));
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [phrase, setPhrase] = useState("");
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

  // 1. Live synchronization to local clock with 00:00 rollover detection
  useEffect(() => {
    const d = new Date();
    setCurrentDate(d);
    const todayStr = getLocalDateString(d);
    setSelectedDateStr(todayStr);

    let lastCheckedDayStr = todayStr;
    const interval = setInterval(() => {
      const now = new Date();
      const currentDayStr = getLocalDateString(now);
      if (currentDayStr !== lastCheckedDayStr) {
        lastCheckedDayStr = currentDayStr;
        setCurrentDate(now);
        setSelectedDateStr(currentDayStr);
        setIsEditing(false); // Reset editing mode when a new day is selected
      }
    }, 10000); // Check every 10 seconds for date rollover

    return () => clearInterval(interval);
  }, []);

  // Calculate permissions & turns for the currently selected date
  const selectedDayOwner = getDayTurn(relationshipStartDate, selectedDateStr);
  const hasPermission = currentUserName === selectedDayOwner;
  const isTargetToday = selectedDateStr === getLocalDateString(new Date());

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to construct YYYY-MM-DD date string for the grid buttons
  const formatDateString = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Get calendar events
  const selectedEvent: CalendarEvent | undefined = db?.calendar?.[selectedDateStr];

  // Prepare editing state
  const startEditing = () => {
    if (!hasPermission) return; // double check guard

    if (selectedEvent) {
      setPhrase(selectedEvent.phrase);
      setEmojis(selectedEvent.emojis);
      setNotes(selectedEvent.notes);
    } else {
      setPhrase("");
      setEmojis("💖✨");
      setNotes("");
    }
    setIsEditing(true);
  };

  // Handle save memory
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim() || !hasPermission) return;

    await onAddCalendarEvent({
      date: selectedDateStr,
      phrase: phrase.trim(),
      writtenBy: selectedDayOwner, // Handled automatically based on the turnowner of the day
      emojis: emojis.trim() || "💖",
      notes: notes.trim(),
      hasMemory: notes.trim().length > 0,
      createdBy: currentUserId
    });
    
    setIsEditing(false);
  };

  // Handle delete memory
  const handleDeleteMemory = async () => {
    if (!hasPermission || !selectedEvent) return;

    if (window.confirm("¿Estás seguro de que quieres eliminar el recuerdo de este día?")) {
      if (onDeleteCalendarEvent) {
        await onDeleteCalendarEvent(selectedDateStr);
        setIsEditing(false);
      }
    }
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
      <div className="bg-white rounded-[32px] border border-pink-50/60 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] mb-6">
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
            const isToday = dateStr === getLocalDateString(new Date());
            const dayTurn = getDayTurn(relationshipStartDate, dateStr);

            let dayClasses = "";
            if (isSelected) {
              dayClasses = dayTurn === "Nini"
                ? "bg-pink-400 text-white shadow-md shadow-pink-200/50 scale-105"
                : "bg-sky-400 text-white shadow-md shadow-sky-200/50 scale-105";
            } else {
              dayClasses = dayTurn === "Nini"
                ? "bg-pink-50/40 text-pink-700 hover:bg-pink-100/30 border border-pink-100/10"
                : "bg-sky-50/40 text-sky-700 hover:bg-sky-100/30 border border-sky-100/10";
            }

            if (isToday) {
              dayClasses += " ring-2 ring-amber-400 ring-offset-1";
            }
            
            return (
              <button
                key={dateStr}
                id={`calendar-day-${dayNum}`}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  setIsEditing(false);
                }}
                className={`h-9 w-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold relative transition-all cursor-pointer border-none outline-none ${dayClasses}`}
              >
                <span>{dayNum}</span>
                {hasEvent && (
                  <span 
                    className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : dayTurn === "Nini" ? "bg-pink-400 animate-pulse" : "bg-sky-400 animate-pulse"
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
            className="bg-white rounded-[32px] border border-pink-50/50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)]"
            id="calendar-memory-display"
          >
            {/* Elegant Turn Owner Sticker (Above the Content) */}
            <div className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border mb-4 text-[10px] font-bold tracking-wider uppercase transition-all ${
              selectedDayOwner === "Nini" 
                ? "bg-pink-50/60 border-pink-100/60 text-pink-700 shadow-sm"
                : "bg-sky-50/60 border-sky-100/60 text-sky-700 shadow-sm"
            }`}>
              <span>{selectedDayOwner === "Nini" ? "💖" : "💙"}</span>
              <span>
                {isTargetToday 
                  ? `Hoy le corresponde a ${selectedDayOwner}`
                  : `Este día le corresponde a ${selectedDayOwner}`}
              </span>
            </div>

            {/* Header with selected date and action buttons */}
            <div className="flex justify-between items-center border-b border-pink-50/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-pink-50 px-2.5 py-1 rounded-xl">
                  <span className="text-xs font-bold text-pink-500">
                    {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("es-ES", {
                      day: "numeric", month: "short"
                    })}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Detalles</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Delete Memory Button */}
                {selectedEvent && hasPermission && (
                  <button
                    id="delete-memory-button"
                    onClick={handleDeleteMemory}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/30 p-1.5 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center outline-none"
                    title="Eliminar Recuerdo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* Edit Memory Button (Disabled if no permission) */}
                <button
                  id="edit-memory-button"
                  onClick={hasPermission ? startEditing : undefined}
                  disabled={!hasPermission}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all border-none flex items-center gap-1 outline-none ${
                    hasPermission
                      ? "text-pink-500 hover:text-pink-600 bg-pink-50 hover:bg-pink-100/30 cursor-pointer"
                      : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                  }`}
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
            </div>

            {/* Display notes and phrases if exists */}
            {selectedEvent ? (
              <div className="space-y-4">
                {/* Phrase Section */}
                <div className={`p-5 rounded-2xl border relative ${
                  selectedEvent.writtenBy === "Nini" 
                    ? "bg-gradient-to-tr from-pink-50/20 to-pink-50/5 border-pink-100/30"
                    : "bg-gradient-to-tr from-sky-50/20 to-sky-50/5 border-sky-100/30"
                }`}>
                  <div className="absolute right-4 top-4 text-lg select-none">
                    {selectedEvent.emojis}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${
                    selectedEvent.writtenBy === "Nini" ? "text-pink-400" : "text-sky-400"
                  }`}>
                    <MessageSquare size={12} />
                    Frase de amor:
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#3A3234] italic font-serif font-light pr-10">
                    "{selectedEvent.phrase}"
                  </p>
                  
                  {/* Dynamic Author Label (Written By / Escrito por) */}
                  <p className="text-[10px] text-gray-400 font-bold mt-3 text-right uppercase tracking-wider">
                    Escrito por {selectedEvent.writtenBy}
                  </p>
                </div>

                {/* Notes/Memory Section */}
                {selectedEvent.notes && (
                  <div className={`pl-3 border-l-2 ${
                    selectedEvent.writtenBy === "Nini" ? "border-pink-200" : "border-sky-200"
                  }`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${
                      selectedEvent.writtenBy === "Nini" ? "text-pink-400" : "text-sky-400"
                    }`}>
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
                {hasPermission ? (
                  <p className="text-[10px] text-pink-400 mt-1.5 font-bold">¡Haz clic en Añadir para dejarle un detalle tierno!</p>
                ) : (
                  <p className={`text-[10px] mt-1.5 font-bold ${
                    selectedDayOwner === "Nini" ? "text-pink-400" : "text-sky-400"
                  }`}>
                    Le corresponde escribir este recuerdo a {selectedDayOwner} ❤️
                  </p>
                )}
              </div>
            )}

            {/* Custom permission indicator note shown under the card if the current user has no write access */}
            {!hasPermission && (
              <div className="mt-5 pt-3 border-t border-dashed border-gray-100 text-center">
                <p className="text-[11px] text-amber-800/70 font-semibold italic">
                  {isTargetToday 
                    ? `Hoy este recuerdo le corresponde escribirlo a ${selectedDayOwner}.`
                    : `Este recuerdo de esta fecha le corresponde escribirlo a ${selectedDayOwner}.`}
                </p>
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

            {/* Autoassigned Owner Label */}
            <div className={`text-[10.5px] font-bold uppercase tracking-wider py-2 px-3.5 rounded-xl border flex items-center gap-1.5 ${
              selectedDayOwner === "Nini" 
                ? "bg-pink-50/40 border-pink-100/30 text-pink-700" 
                : "bg-sky-50/40 border-sky-100/30 text-sky-700"
            }`}>
              <span>✍️</span>
              <span>Autor asignado de este día: {selectedDayOwner}</span>
            </div>

            {/* Phrase Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare size={12} className={selectedDayOwner === "Nini" ? "text-pink-400" : "text-sky-400"} />
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
                <Smile size={12} className={selectedDayOwner === "Nini" ? "text-pink-400" : "text-sky-400"} />
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
                <FileText size={12} className={selectedDayOwner === "Nini" ? "text-pink-400" : "text-sky-400"} />
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
