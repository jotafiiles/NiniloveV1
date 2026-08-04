import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Plus, Heart, Star, User, Calendar, Trash2, X, Play, 
  Pause, Volume2, VolumeX, Maximize2, Sparkles, ChevronRight, Check,
  Clock, Tag, Video
} from "lucide-react";
import Hls from "hls.js";
import { DBState, Movie } from "../types";

interface MoviesViewProps {
  db: DBState;
  onAddMovie: (movie: Omit<Movie, "id" | "dateAdded" | "isFavorite"> & { duration?: string; genres?: string; embedUrl?: string; createdBy?: string }) => Promise<void>;
  onToggleFavoriteMovie: (id: string) => Promise<void>;
  onDeleteMovie: (id: string) => Promise<void>;
  currentUser: string;
}

const isDirectVideo = (url?: string) => {
  if (!url) return false;
  const lowercase = url.toLowerCase().split("?")[0];
  return (
    lowercase.endsWith(".m3u8") ||
    lowercase.endsWith(".mp4") ||
    lowercase.endsWith(".webm") ||
    lowercase.endsWith(".ogg") ||
    lowercase.endsWith(".mov") ||
    url.includes(".m3u8") ||
    url.includes("/m3u8")
  );
};

const getEmbedUrl = (url?: string) => {
  if (!url) return "";
  let id = "";
  if (url.includes("youtube.com/watch?v=")) {
    id = url.split("v=")[1]?.split("&")[0] || "";
  } else if (url.includes("youtu.be/")) {
    id = url.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }
  if (id) {
    return `https://www.youtube.com/embed/${id}?autoplay=0&mute=0&controls=1`;
  }
  return url;
};

export default function MoviesView({
  db,
  onAddMovie,
  onToggleFavoriteMovie,
  onDeleteMovie,
  currentUser
}: MoviesViewProps) {
  const currentUserName = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
  const currentUserId = currentUser === "Nini" || currentUser === "nini_001" ? "nini_001" : "jota_001";

  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  // Mock player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:00");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync HTML5 video element state with player controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const formatTime = (secs: number) => {
      if (isNaN(secs) || !isFinite(secs)) return "0:00";
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress(Math.round((video.currentTime / video.duration) * 100));
        setCurrentTimeStr(formatTime(video.currentTime));
        setDurationStr(formatTime(video.duration));
      }
    };
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
    };

    video.addEventListener("play", handlePlayState);
    video.addEventListener("pause", handlePauseState);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);

    // Initial values
    if (video.duration) {
      setCurrentTimeStr(formatTime(video.currentTime));
      setDurationStr(formatTime(video.duration));
    }

    return () => {
      video.removeEventListener("play", handlePlayState);
      video.removeEventListener("pause", handlePauseState);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [isPlaying, activeMovie]);

  // HLS and direct stream playback setup
  useEffect(() => {
    if (!isPlaying || !activeMovie?.embedUrl) return;
    if (!isDirectVideo(activeMovie.embedUrl)) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const url = activeMovie.embedUrl;

    if (url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => console.log("HLS auto-play blocked:", err));
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((err) => console.log("Safari HLS auto-play blocked:", err));
        });
      }
    } else {
      video.src = url;
      video.play().catch((err) => console.log("Video auto-play blocked:", err));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isPlaying, activeMovie?.embedUrl]);

  // Material Design 3 Form states
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genres, setGenres] = useState("");
  const [duration, setDuration] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserName !== "Jota") {
      alert("Lo sentimos, únicamente Jota puede agregar películas a la cartelera.");
      return;
    }
    if (!title.trim()) return;

    await onAddMovie({
      title: title.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      description: description.trim() || "Una película que nos encantará ver acurrucados.",
      posterUrl: posterUrl.trim() || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
      addedBy: "Jota",
      rating,
      notes: notes.trim(),
      genres: genres.trim() || "Romance / Comedia",
      duration: duration.trim() || "120 min",
      embedUrl: embedUrl.trim(),
      createdBy: currentUserId
    });

    // Reset Form
    setTitle("");
    setYear(new Date().getFullYear().toString());
    setGenres("");
    setDuration("");
    setPosterUrl("");
    setEmbedUrl("");
    setDescription("");
    setRating(5);
    setNotes("");

    setIsAdding(false);
  };

  const filteredMovies = (db?.movies || []).filter((m) => {
    if (filter === "favorites") return m?.isFavorite;
    return true;
  });

  return (
    <div className="pb-32 pt-4 px-4 max-w-md mx-auto" id="movies-view-container">
      {/* View Header */}
      <div className="flex justify-between items-end mb-6 pt-4 border-b border-pink-100/30 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68F94] font-semibold mb-1 block">Cine en Pareja</span>
          <h2 className="text-3xl font-serif italic text-[#3A3234] leading-tight font-light">Películas Compartidas</h2>
        </div>

        {/* ÚNICAMENTE JOTA PUEDE AGREGAR */}
        {!isAdding && currentUserName === "Jota" && (
          <button
            id="add-movie-button"
            onClick={() => setIsAdding(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-pink-200 flex items-center gap-1 cursor-pointer outline-none border-none"
          >
            <Plus size={14} />
            Agregar
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {!isAdding && (
        <div className="flex gap-2 mb-6 bg-pink-50/30 p-1.5 rounded-2xl border border-pink-50/20" id="movies-filter-tabs">
          <button
            id="filter-movies-all"
            onClick={() => setFilter("all")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-none outline-none ${
              filter === "all"
                ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                : "text-pink-700 hover:bg-pink-50/50 bg-transparent"
            }`}
          >
            Todas ({db?.movies?.length || 0})
          </button>
          <button
            id="filter-movies-favorites"
            onClick={() => setFilter("favorites")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-none outline-none ${
              filter === "favorites"
                ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                : "text-pink-700 hover:bg-pink-50/50 bg-transparent"
            }`}
          >
            <Heart size={12} fill={filter === "favorites" ? "currentColor" : "none"} />
            Favoritas ({(db?.movies || []).filter((m) => m?.isFavorite).length})
          </button>
        </div>
      )}

      {/* Movie Library List */}
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="movies-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4"
            id="movies-library-grid"
          >
            {filteredMovies.map((movie) => (
              <motion.div
                key={movie.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setActiveMovie(movie);
                  setIsPlaying(false);
                }}
                className="bg-white rounded-[28px] border border-pink-50 shadow-[0_12px_30px_-10px_rgba(255,182,193,0.25)] overflow-hidden cursor-pointer flex flex-col justify-between"
                id={`movie-card-${movie.id}`}
              >
                {/* Poster area */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Rating Badge overlay */}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-0.5 text-white text-[10px] font-black">
                    <Star size={10} fill="#f59e0b" className="text-amber-400" />
                    {movie.rating}
                  </div>
                  {/* Heart Favorite Badge overlay */}
                  <button
                    id={`toggle-fav-movie-${movie.id}`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onToggleFavoriteMovie(movie.id);
                    }}
                    className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm text-pink-500 transition-colors cursor-pointer border-none outline-none"
                  >
                    <Heart size={14} fill={movie.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Content info */}
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold text-[#3A3234] uppercase tracking-tight truncate">
                    {movie.title}
                  </h3>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>{movie.year}</span>
                    <span className="text-pink-500 font-semibold uppercase">Por {movie.addedBy}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredMovies.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.2)]">
                <Film size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium italic">No hay películas en esta lista...</p>
                {currentUserName === "Jota" && (
                  <p className="text-[10px] text-pink-500 mt-1 font-semibold">¡Toca en Agregar arriba para armar la cartelera!</p>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* Material Design 3 Form Stage to add a movie */
          <motion.form
            key="movies-add-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSaveMovie}
            className="bg-white rounded-[32px] border border-pink-50 p-6 shadow-[0_15px_40px_-15px_rgba(255,182,193,0.3)] space-y-5"
            id="movies-input-form"
          >
            <div className="flex items-center justify-between border-b border-pink-50 pb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nueva Película</h3>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">JOTA'S INPUT</span>
            </div>

            {/* Title - MD3 floating style */}
            <div className="relative">
              <input
                type="text"
                id="movie-title"
                placeholder=" "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
                required
              />
              <label
                htmlFor="movie-title"
                className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
              >
                Título de la película (Obligatorio)
              </label>
            </div>

            {/* Year & Rating row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Year */}
              <div className="relative">
                <input
                  type="number"
                  id="movie-year"
                  placeholder=" "
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
                  required
                />
                <label
                  htmlFor="movie-year"
                  className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
                >
                  Año de estreno (Obligatorio)
                </label>
              </div>

              {/* Rating */}
              <div className="relative">
                <select
                  id="movie-rating"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="block px-3 py-3 w-full text-xs text-zinc-900 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                  required
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>
            </div>

            {/* Genres & Duration row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Genres */}
              <div className="relative">
                <input
                  type="text"
                  id="movie-genres"
                  placeholder=" "
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
                  required
                />
                <label
                  htmlFor="movie-genres"
                  className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
                >
                  Género (Ej. Comedia, Drama)
                </label>
              </div>

              {/* Duration */}
              <div className="relative">
                <input
                  type="text"
                  id="movie-duration"
                  placeholder=" "
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
                  required
                />
                <label
                  htmlFor="movie-duration"
                  className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
                >
                  Duración (Ej. 1h 45m)
                </label>
              </div>
            </div>

            {/* Poster URL */}
            <div className="relative">
              <input
                type="text"
                id="movie-poster"
                placeholder=" "
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
              />
              <label
                htmlFor="movie-poster"
                className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
              >
                URL del Poster (Opcional)
              </label>
            </div>

            {/* Video embed URL */}
            <div className="relative">
              <input
                type="text"
                id="movie-embed"
                placeholder=" "
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent transition-all"
                required
              />
              <label
                htmlFor="movie-embed"
                className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
              >
                URL del video / stream (m3u8, mp4, youtube, etc.)
              </label>
            </div>

            {/* Description */}
            <div className="relative">
              <textarea
                id="movie-desc"
                placeholder=" "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent min-h-[60px] transition-all"
                required
              />
              <label
                htmlFor="movie-desc"
                className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
              >
                Breve descripción
              </label>
            </div>

            {/* Romantic Notes */}
            <div className="relative">
              <textarea
                id="movie-notes"
                placeholder=" "
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block px-3.5 pb-2.5 pt-4 w-full text-xs text-zinc-900 bg-transparent rounded-2xl border border-zinc-200 focus:outline-none focus:ring-0 focus:border-pink-500 peer placeholder-transparent min-h-[60px] transition-all"
              />
              <label
                htmlFor="movie-notes"
                className="absolute text-xs text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2.5"
              >
                Nota Romántica / ¿Por qué verla juntos?
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-pink-50">
              <button
                type="button"
                id="cancel-add-movie"
                onClick={() => setIsAdding(false)}
                className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="save-movie-submit"
                className="text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-pink-200 flex items-center gap-1 cursor-pointer outline-none border-none"
              >
                <Check size={14} />
                Guardar Película
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Cinematic Detail overlay with Premium Dark Mode & Glassmorphism Interactive Player */}
      <AnimatePresence>
        {activeMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto flex items-center justify-center p-4"
            id="movies-cinema-overlay"
          >
            <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800/80 rounded-[32px] overflow-hidden shadow-2xl relative p-0 backdrop-blur-md">
              
              {/* Corner floral elements */}
              <div className="absolute top-0 left-0 text-xl p-4 select-none pointer-events-none opacity-40 animate-pulse z-40">🌸</div>
              <div className="absolute top-0 right-0 text-xl p-4 select-none pointer-events-none opacity-40 animate-pulse z-40">🌺</div>
              <div className="absolute bottom-0 left-0 text-xl p-4 select-none pointer-events-none opacity-40 animate-pulse z-40">🌸</div>
              <div className="absolute bottom-0 right-0 text-xl p-4 select-none pointer-events-none opacity-40 animate-pulse z-40">🌺</div>

              {/* Close Button */}
              <button
                id="close-cinema-overlay"
                onClick={() => {
                  setActiveMovie(null);
                  setIsPlaying(false);
                }}
                className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-md text-white/80 hover:text-white p-2 hover:bg-black/80 rounded-full transition-all cursor-pointer border-none outline-none"
              >
                <X size={18} />
              </button>

              {/* Premium Embedded Video Player */}
              <div className="relative aspect-[16/9] bg-black group overflow-hidden border-b border-zinc-800" id="movie-cinematic-player">
                {isPlaying ? (
                  activeMovie.embedUrl ? (
                    isDirectVideo(activeMovie.embedUrl) ? (
                      <video
                        ref={videoRef}
                        poster={activeMovie.posterUrl}
                        playsInline
                        autoPlay
                        muted={isMuted}
                        className="w-full h-full object-contain bg-black z-10 relative"
                      />
                    ) : (
                      <iframe 
                        src={getEmbedUrl(activeMovie.embedUrl)} 
                        className="w-full h-full border-none z-10 relative" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-center p-4">
                      <Video size={36} className="text-zinc-600 mb-2" />
                      <span className="text-xs text-zinc-400">Reproduciendo simulación (No hay URL guardada)</span>
                      <button 
                        onClick={() => setIsPlaying(false)}
                        className="text-xs text-pink-400 mt-2 font-bold hover:underline bg-transparent border-none outline-none cursor-pointer"
                      >
                        Ver póster
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    {/* Background Poster blurred slightly during play */}
                    <img 
                      src={activeMovie.posterUrl} 
                      alt={activeMovie.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60 transition-all duration-700"
                    />

                    {/* Subtitle / Romantic Comment floating overlay during play */}
                    <AnimatePresence>
                      {activeMovie.notes && (
                        <div className="absolute inset-x-4 top-10 text-center pointer-events-none">
                          <span className="bg-pink-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg inline-block backdrop-blur-md">
                            💬 "{activeMovie.notes}"
                          </span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Video Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                      <button
                        id="play-cinema-video"
                        onClick={() => setIsPlaying(true)}
                        className="w-14 h-14 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg scale-100 hover:scale-105 active:scale-95 transition-all cursor-pointer outline-none border-none"
                      >
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </button>
                    </div>
                  </>
                )}

                {/* Modern Comfort iOS controls at bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 flex flex-col gap-2 z-30 opacity-100 transition-opacity">
                  {/* Progress Line */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-400 font-bold select-none">
                      {isDirectVideo(activeMovie.embedUrl) ? currentTimeStr : "12:35"}
                    </span>
                    <div 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = clickX / rect.width;
                        if (isDirectVideo(activeMovie.embedUrl) && videoRef.current && videoRef.current.duration) {
                          videoRef.current.currentTime = percentage * videoRef.current.duration;
                        } else {
                          setProgress(Math.round(percentage * 100));
                        }
                      }}
                      className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-pink-500 rounded-full" 
                        style={{ width: `${progress}%` }}
                      />
                      <div 
                        className="absolute w-2.5 h-2.5 bg-pink-400 rounded-full -top-0.5 shadow border border-white"
                        style={{ left: `calc(${progress}% - 5px)` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold select-none">
                      {isDirectVideo(activeMovie.embedUrl) ? durationStr : "1:48:22"}
                    </span>
                  </div>

                  {/* Main media controls bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        id="cinema-toggle-play"
                        onClick={() => {
                          if (isDirectVideo(activeMovie.embedUrl) && videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play().catch(err => console.log(err));
                            }
                          } else {
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="text-white hover:text-pink-400 transition-colors p-1 border-none bg-transparent cursor-pointer"
                      >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                      </button>
                      
                      <button 
                        id="cinema-toggle-mute"
                        onClick={() => {
                          if (isDirectVideo(activeMovie.embedUrl) && videoRef.current) {
                            videoRef.current.muted = !videoRef.current.muted;
                            setIsMuted(videoRef.current.muted);
                          } else {
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="text-white hover:text-pink-400 transition-colors p-1 border-none bg-transparent cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>

                    <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-md font-extrabold tracking-wide uppercase select-none">
                      NINILOVE THEATER 🍿
                    </span>

                    <button 
                      onClick={() => {
                        if (videoRef.current) {
                          const video = videoRef.current;
                          if (video.requestFullscreen) {
                            video.requestFullscreen();
                          } else if ((video as any).webkitRequestFullscreen) {
                            (video as any).webkitRequestFullscreen();
                          }
                        }
                      }}
                      className="text-white hover:text-pink-400 transition-colors p-1 border-none bg-transparent cursor-pointer"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Theater Details Area */}
              <div className="p-6 space-y-4 relative z-10">
                {/* Header title */}
                <div className="border-b border-zinc-800/80 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug">
                      {activeMovie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold mt-1">
                      <span>{activeMovie.year}</span>
                      <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Tag size={11} />
                        {activeMovie.genres || "Romance / Drama"}
                      </span>
                      <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                      <span className="flex items-center gap-1 text-pink-400">
                        <Star size={11} fill="currentColor" />
                        {activeMovie.rating}/5
                      </span>
                    </div>
                    {activeMovie.duration && (
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-bold">
                        <Clock size={10} />
                        {activeMovie.duration}
                      </div>
                    )}
                  </div>

                  {/* Heart Action */}
                  <button
                    id={`cinema-fav-toggle-${activeMovie.id}`}
                    onClick={async () => {
                      await onToggleFavoriteMovie(activeMovie.id);
                      setActiveMovie({ ...activeMovie, isFavorite: !activeMovie.isFavorite });
                    }}
                    className={`p-2.5 rounded-full border border-solid transition-all cursor-pointer border-none outline-none ${
                      activeMovie.isFavorite
                        ? "bg-pink-500/20 border-pink-500/30 text-pink-500"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Heart size={16} fill={activeMovie.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Synopsis description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sinopsis</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {activeMovie.description}
                  </p>
                </div>

                {/* Love notes review */}
                {activeMovie.notes && (
                  <div className="bg-pink-500/5 border border-pink-500/10 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">
                      Nota de Jota
                    </span>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
                      "{activeMovie.notes}"
                    </p>
                  </div>
                )}

                {/* Metadata added rows */}
                <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-800 pt-4 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    Agregada por {activeMovie.addedBy}
                  </span>
                  
                  {/* Delete button only if from currentUser AND is Jota */}
                  {currentUserName === "Jota" ? (
                    <button
                      id={`delete-movie-${activeMovie.id}`}
                      onClick={async () => {
                        if (confirm("¿Deseas quitar esta película de la biblioteca compartida?")) {
                          await onDeleteMovie(activeMovie.id);
                          setActiveMovie(null);
                        }
                      }}
                      className="text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent font-bold"
                      title="Quitar de watchlist"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {activeMovie.dateAdded}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
