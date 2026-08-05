import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { DBState, Letter, Movie, CalendarEvent, Profile } from "./types";

// Import Views
import Navigation from "./components/Navigation";
import HomeView from "./components/HomeView";
import CalendarView from "./components/CalendarView";
import LettersView from "./components/LettersView";
import MoviesView from "./components/MoviesView";
import ProfileView from "./components/ProfileView";
import WelcomeScreen from "./components/WelcomeScreen";
import ContractView from "./components/ContractView";

import * as usersApi from "./api/users";
import * as settingsApi from "./api/settings";
import * as calendarApi from "./api/calendar";
import * as lettersApi from "./api/letters";
import * as moviesApi from "./api/movies";
import * as loveCounterApi from "./api/loveCounter";
import * as activitiesApi from "./api/activities";
import * as marriageContractApi from "./api/marriageContract";

const ROMANTIC_PHRASES = [
  "Eres mi lugar favorito en el mundo entero.",
  "Cada segundo contigo es un regalo que atesoro con todo mi corazón.",
  "Te amo no solo por cómo eres, sino por cómo soy cuando estoy contigo.",
  "Mi amor por ti grows más de lo que las palabras pueden expresar.",
  "Eres la razón por la que sonrío al despertar y al irme a dormir.",
  "Contigo el mundo es un lugar mucho más brillante y feliz.",
  "Si tuviera que elegir mi momento favorito de la vida, elegiría el día que te conocí.",
  "Nini y Jota, un amor diseñado para durar toda la eternidad.",
  "Tu amor es mi melodía favorita y tu sonrisa mi obra de arte.",
  "No hay distancia, tiempo ni espacio que pueda disminuir lo que siento por ti.",
  "Eres mi hoy y todos mi mañanas.",
  "Amo la forma en que nos complementamos, eres mi mitad perfecta.",
  "Escribir nuestra historia juntos es mi pasatiempo favorito.",
  "Gracias por enseñarme lo que realmente significa amar y ser amado.",
  "Tu risa es la banda sonora de mi felicidad.",
  "Haces que los días ordinarios se sientan extraordinarios.",
  "Mi amor por ti es un viaje que empieza en el siempre y termina en el jamás."
];

const DEFAULT_PROFILES = {
  Nini: {
    name: "Nini",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    bio: "Amante del chocolate blanco, los mimos infinitos de Jota, las tardes soleadas y reír a carcajadas. Jota es mi lugar favorito en el mundo entero.",
    favMovie: "La La Land",
    favColor: "Rosa pastel / Lila suave",
    favQuote: "Si sé lo que es el amor, es gracias a ti."
  },
  Jota: {
    name: "Jota",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    bio: "Apasionado por la tecnología, el café cargado y, por sobre todas las cosas, por hacer feliz a Nini cada segundo del día. Ella es mi reina y mi musa.",
    favMovie: "About Time (Una cuestión de tiempo)",
    favColor: "Azul cielo / Blanco",
    favQuote: "Envejecer contigo es el único plan de vida que realmente deseo."
  }
};

const DEFAULT_STATE: DBState = {
  loveClicks: { Nini: 142, Jota: 128 },
  loveHistory: [],
  letters: [],
  movies: [],
  calendar: {},
  profiles: DEFAULT_PROFILES,
  daysTogetherStartDate: "2024-02-14",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("inicio");
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    const isConfigured = localStorage.getItem("configured") === "true";
    const selected = localStorage.getItem("selectedUser");
    if (isConfigured && (selected === "Nini" || selected === "Jota")) {
      return selected;
    }
    const saved = localStorage.getItem("currentUserId");
    if (saved === "nini_001" || saved === "Nini") {
      localStorage.setItem("selectedUser", "Nini");
      localStorage.setItem("configured", "true");
      return "Nini";
    }
    if (saved === "jota_001" || saved === "Jota") {
      localStorage.setItem("selectedUser", "Jota");
      localStorage.setItem("configured", "true");
      return "Jota";
    }
    return null;
  });
  const [db, setDb] = useState<DBState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Bootstrap empty database with default cute values
  const bootstrapFirebase = async () => {
    // 1. Love Clicks
    const clicks = await loveCounterApi.getAll();
    if (!clicks || !clicks.Nini) {
      await loveCounterApi.create({ Nini: 142, Jota: 128 });
    }

    // 2. Activities (Love History)
    const activities = await activitiesApi.getAll();
    if (!activities || activities.length === 0) {
      await activitiesApi.create({
        who: "Jota",
        timestamp: new Date().toISOString(),
        message: "¡Te amo infinitamente, mi reina hermosa! ❤️"
      });
      await activitiesApi.create({
        who: "Nini",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        message: "¡Yo te amo mucho más, mi rey consentido! 🥰"
      });
    }

    // 3. Profiles (Users)
    const users = await usersApi.getAll();
    if (!users || !users.Nini) {
      await usersApi.create(DEFAULT_PROFILES.Nini);
      await usersApi.create(DEFAULT_PROFILES.Jota);
    }

    // 4. Settings
    const settings = await settingsApi.getAll();
    if (!settings || !settings.daysTogetherStartDate) {
      await settingsApi.updateItem("daysTogetherStartDate", "2024-02-14");
    }

    // 5. Letters
    const letters = await lettersApi.getAll();
    if (!letters || letters.length === 0) {
      await lettersApi.create({
        from: "Jota",
        to: "Nini",
        title: "Nuestra increíble aventura ✨",
        content: "Nini, mi amor,\n\nEscribo esta carta para recordarte lo infinitamente feliz que me haces todos los días. Desde que entraste en mi vida, todo tiene más color, más sentido y más alegría.\n\nMe encanta planear el futuro a tu lado: ver películas acurrucados, viajar a lugares nuevos y simplemente reírnos de cualquier tontería. Eres la persona más increíble, inteligente y hermosa de este universo.\n\nNunca olvides que estaré aquí para apoyarte en cada uno de tus sueños. Juntos somos el mejor equipo del mundo.\n\nCon todo el amor de mi alma,\nTu Jota. ❤️",
        style: {
          bgColor: "from-rose-50 to-rose-100",
          textColor: "text-rose-800",
          fontFamily: "font-serif",
          sticker: "❤️",
          backgroundPattern: "hearts"
        },
        date: "2026-08-01",
        isOpened: true
      });
      await lettersApi.create({
        from: "Nini",
        to: "Jota",
        title: "Mi refugio seguro 🌸",
        content: "Jota consentido de mi corazón,\n\nSolo quería dejarte una pequeña cartita para recordarte que eres mi refugio seguro. Cuando el mundo se siente ruidoso y cansado, hablar contigo y sentir tus abrazos es lo único que necesito para calmar mi alma.\n\nGracias por ser tan paciente, por hacerme reír hasta que me duela la pancita y por amarme de la forma tan bonita en que lo haces. Adoro nuestras noches de películas y cómo siempre me dejas el último bocado de postre.\n\nEres mi persona favorita hoy, mañana y siempre.\n\nMuchos besitos tiernos,\nNini. 💋",
        style: {
          bgColor: "from-purple-50 to-purple-100",
          textColor: "text-purple-800",
          fontFamily: "font-sans",
          sticker: "✨",
          backgroundPattern: "stars"
        },
        date: "2026-08-02",
        isOpened: true
      });
    }

    // 6. Movies
    const movies = await moviesApi.getAll();
    if (!movies || movies.length === 0) {
      await moviesApi.create({
        title: "La La Land",
        year: 2016,
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
        description: "Un pianista de jazz y una aspirante a actriz se enamoran en Los Ángeles mientras persiguen sus sueños.",
        addedBy: "Nini",
        dateAdded: "2026-07-28",
        rating: 5,
        notes: "Nuestra película favorita para cantar juntos. ¡La escena del planetario es mágica!",
        isFavorite: true
      });
      await moviesApi.create({
        title: "About Time",
        year: 2013,
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
        description: "A la edad de 21 años, Tim descubre que puede viajar en el tiempo y cambiar lo que sucede en su propia vida.",
        addedBy: "Jota",
        dateAdded: "2026-07-30",
        rating: 5,
        notes: "Nos enseña que hay que vivir cada día como si fuera el último y disfrutar cada pequeño momento juntos.",
        isFavorite: true
      });
    }

    // 7. Calendar Memories
    const calendar = await calendarApi.getAll();
    if (!calendar || Object.keys(calendar).length === 0) {
      await calendarApi.create({
        date: "2026-08-03",
        phrase: "El mejor día de la semana siempre es el que paso a tu lado.",
        writtenBy: "Jota",
        emojis: "☀️🌸🌿",
        notes: "Hoy diseñamos nuestra app NiniLove juntos. ¡Es un día inolvidable!",
        hasMemory: true
      });
      await calendarApi.create({
        date: "2026-08-02",
        phrase: "Amor es cuidar del otro incluso en los detalles más pequeños.",
        writtenBy: "Nini",
        emojis: "☕🍰🧸",
        notes: "Merendamos postre de fresa y tomamos cafecito en la tarde mientras nos dábamos mimos.",
        hasMemory: true
      });
      await calendarApi.create({
        date: "2026-08-14",
        phrase: "Cada mes que pasa, mi corazón te elige una y otra vez.",
        writtenBy: "Jota",
        emojis: "❤️🌙💍",
        notes: "¡Nuestro cumplemes! Recordar preparar sorpresita linda.",
        hasMemory: false
      });
    }
  };

  // Set up Realtime Sync
  useEffect(() => {
    let active = true;
    const unsubscribes: (() => void)[] = [];

    const setup = async () => {
      try {
        await bootstrapFirebase();
      } catch (err) {
        console.error("Firebase bootstrap error:", err);
      }

      if (!active) return;

      const loadedFlags = {
        loveClicks: false,
        loveHistory: false,
        letters: false,
        movies: false,
        calendar: false,
        profiles: false,
        daysTogether: false,
        marriageContract: false,
      };

      const checkAllLoaded = () => {
        if (active && Object.values(loadedFlags).every(Boolean)) {
          setLoading(false);
        }
      };

      // 1. Subscribe to Love clicks
      unsubscribes.push(
        loveCounterApi.subscribe((data) => {
          const loveClicks = data || DEFAULT_STATE.loveClicks;
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            loveClicks
          }));
          loadedFlags.loveClicks = true;
          checkAllLoaded();
        })
      );

      // 2. Subscribe to activities (Love History)
      unsubscribes.push(
        activitiesApi.subscribe((data) => {
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            loveHistory: data || []
          }));
          loadedFlags.loveHistory = true;
          checkAllLoaded();
        })
      );

      // 3. Subscribe to Letters
      unsubscribes.push(
        lettersApi.subscribe((data) => {
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            letters: data || []
          }));
          loadedFlags.letters = true;
          checkAllLoaded();
        })
      );

      // 4. Subscribe to Movies
      unsubscribes.push(
        moviesApi.subscribe((data) => {
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            movies: data || []
          }));
          loadedFlags.movies = true;
          checkAllLoaded();
        })
      );

      // 5. Subscribe to Calendar
      unsubscribes.push(
        calendarApi.subscribe((data) => {
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            calendar: data || {}
          }));
          loadedFlags.calendar = true;
          checkAllLoaded();
        })
      );

      // 6. Subscribe to Users (profiles)
      unsubscribes.push(
        usersApi.subscribe((data) => {
          // Merge incoming user profiles robustly with defaults
          const mergedProfiles = {
            Nini: {
              ...DEFAULT_PROFILES.Nini,
              ...(data?.Nini || {})
            },
            Jota: {
              ...DEFAULT_PROFILES.Jota,
              ...(data?.Jota || {})
            }
          };
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            profiles: mergedProfiles
          }));
          loadedFlags.profiles = true;
          checkAllLoaded();
        })
      );

      // 7. Subscribe to settings (anniversary date)
      unsubscribes.push(
        settingsApi.subscribe((data) => {
          const daysTogetherStartDate = data?.daysTogetherStartDate || DEFAULT_STATE.daysTogetherStartDate;
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            daysTogetherStartDate
          }));
          loadedFlags.daysTogether = true;
          checkAllLoaded();
        })
      );

      // 8. Subscribe to Marriage Contract
      unsubscribes.push(
        marriageContractApi.subscribeContract((data) => {
          setDb((prev) => ({
            ...prev || DEFAULT_STATE,
            marriageContract: data
          }));
          loadedFlags.marriageContract = true;
          checkAllLoaded();
        })
      );
    };

    setup();

    return () => {
      active = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // API Call: Te Amo click (direct to Firebase)
  const handleLoveClick = async (who: "Nini" | "Jota") => {
    try {
      const counts = await loveCounterApi.getAll() || { Nini: 142, Jota: 128 };
      const updatedCounts = {
        ...counts,
        [who]: (counts[who] || 0) + 1
      };
      await loveCounterApi.update("", updatedCounts);

      // Select random quote
      const randomIndex = Math.floor(Math.random() * ROMANTIC_PHRASES.length);
      const sweetMessage = ROMANTIC_PHRASES[randomIndex];

      const newHistoryItem = {
        who,
        userId: currentUser,
        lastPressedBy: currentUser,
        timestamp: new Date().toISOString(),
        message: sweetMessage
      };

      await activitiesApi.create(newHistoryItem);
    } catch (error) {
      console.error("Error sending love click:", error);
    }
  };

  // API Call: Update anniversary start date (direct to Firebase)
  const handleUpdateStartDate = async (date: string) => {
    try {
      await settingsApi.updateItem("daysTogetherStartDate", date);
    } catch (error) {
      console.error("Error updating anniversary date:", error);
    }
  };

  // API Call: Add calendar memory (direct to Firebase)
  const handleAddCalendarEvent = async (event: CalendarEvent) => {
    try {
      await calendarApi.create(event);
      const name = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
      await activitiesApi.create({
        who: name,
        userId: currentUser,
        timestamp: new Date().toISOString(),
        message: `${name} escribió un nuevo recuerdo para el calendario: "${event.phrase}"`
      });
    } catch (error) {
      console.error("Error saving calendar memory:", error);
    }
  };

  // API Call: Delete calendar memory (direct to Firebase)
  const handleDeleteCalendarEvent = async (date: string) => {
    try {
      await calendarApi.delete(date);
      const name = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
      await activitiesApi.create({
        who: name,
        userId: currentUser,
        timestamp: new Date().toISOString(),
        message: `${name} eliminó el recuerdo del calendario de la fecha: ${date}`
      });
    } catch (error) {
      console.error("Error deleting calendar memory:", error);
    }
  };

  // API Call: Add Letter (direct to Firebase)
  const handleAddLetter = async (newLetter: Omit<Letter, "id" | "date" | "isOpened">) => {
    try {
      const letterData = {
        ...newLetter,
        date: new Date().toISOString().split("T")[0],
        isOpened: false
      };
      await lettersApi.create(letterData);
      const name = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
      await activitiesApi.create({
        who: name,
        userId: currentUser,
        timestamp: new Date().toISOString(),
        message: `${name} te envió una carta de amor: "${newLetter.title}" 💌`
      });
    } catch (error) {
      console.error("Error sending love letter:", error);
    }
  };

  // API Call: Mark Letter as opened/read (direct to Firebase)
  const handleOpenLetter = async (id: string) => {
    try {
      await lettersApi.update(id, { isOpened: true });
    } catch (error) {
      console.error("Error marking letter as read:", error);
    }
  };

  // API Call: Delete Letter (direct to Firebase)
  const handleDeleteLetter = async (id: string) => {
    try {
      await lettersApi.delete(id);
    } catch (error) {
      console.error("Error deleting letter:", error);
    }
  };

  // API Call: Add Movie to shared Watchlist (direct to Firebase)
  const handleAddMovie = async (newMovie: any) => {
    try {
      const defaultPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400";
      const movieData = {
        ...newMovie,
        year: parseInt(newMovie.year as any) || new Date().getFullYear(),
        description: newMovie.description || "Sin descripción disponible.",
        posterUrl: newMovie.posterUrl || defaultPoster,
        dateAdded: new Date().toISOString().split("T")[0],
        rating: parseInt(newMovie.rating as any) || 5,
        isFavorite: false
      };
      await moviesApi.create(movieData);
      const name = currentUser === "nini_001" || currentUser === "Nini" ? "Nini" : "Jota";
      await activitiesApi.create({
        who: name,
        userId: currentUser,
        timestamp: new Date().toISOString(),
        message: `${name} agregó la película: "${newMovie.title}" 🍿`
      });
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  // API Call: Toggle Favorite Movie (direct to Firebase)
  const handleToggleFavoriteMovie = async (id: string) => {
    try {
      const movie = db?.movies.find((m) => m.id === id);
      if (movie) {
        await moviesApi.update(id, { isFavorite: !movie.isFavorite });
      }
    } catch (error) {
      console.error("Error toggling favorite movie:", error);
    }
  };

  // API Call: Delete Movie (direct to Firebase)
  const handleDeleteMovie = async (id: string) => {
    try {
      await moviesApi.delete(id);
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  // API Call: Update Profile (direct to Firebase)
  const handleUpdateProfile = async (profileData: Profile) => {
    try {
      await usersApi.update(profileData.name, profileData);
    } catch (error) {
      console.error("Error saving profile details:", error);
    }
  };

  // API Call: Update marriage contract (direct to Firebase)
  const handleUpdateContract = async (contractState: any) => {
    try {
      await marriageContractApi.updateContract(contractState);
    } catch (error) {
      console.error("Error updating marriage contract:", error);
    }
  };

  // Transition parameters for seamless sliding transitions
  const tabTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: "spring", stiffness: 350, damping: 32 }
  };


  // Render view depending on activeTab
  const renderActiveView = () => {
    if (!db || !currentUser) return null;

    switch (activeTab) {
      case "inicio":
        return (
          <motion.div key="inicio" {...tabTransition}>
            <HomeView
              db={db}
              onLoveClick={handleLoveClick}
              onUpdateStartDate={handleUpdateStartDate}
              onNavigate={setActiveTab}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onChangeProfile={() => {
                localStorage.removeItem("currentUserId");
                setCurrentUser(null);
                setActiveTab("inicio");
              }}
            />
          </motion.div>
        );
      case "calendario":
        return (
          <motion.div key="calendario" {...tabTransition}>
            <CalendarView
              db={db}
              onAddCalendarEvent={handleAddCalendarEvent}
              onDeleteCalendarEvent={handleDeleteCalendarEvent}
              currentUser={currentUser}
            />
          </motion.div>
        );
      case "cartas":
        return (
          <motion.div key="cartas" {...tabTransition}>
            <LettersView
              db={db}
              onAddLetter={handleAddLetter}
              onOpenLetter={handleOpenLetter}
              onDeleteLetter={handleDeleteLetter}
              currentUser={currentUser}
            />
          </motion.div>
        );
      case "peliculas":
        return (
          <motion.div key="peliculas" {...tabTransition}>
            <MoviesView
              db={db}
              onAddMovie={handleAddMovie}
              onToggleFavoriteMovie={handleToggleFavoriteMovie}
              onDeleteMovie={handleDeleteMovie}
              currentUser={currentUser}
            />
          </motion.div>
        );
      case "perfil":
        return (
          <motion.div key="perfil" {...tabTransition}>
            <ProfileView
              db={db}
              onUpdateProfile={handleUpdateProfile}
              currentUser={currentUser}
            />
          </motion.div>
        );
      case "contrato":
        return (
          <motion.div key="contrato" {...tabTransition}>
            <ContractView
              db={db}
              onNavigate={setActiveTab}
              currentUser={currentUser}
              onUpdateContract={handleUpdateContract}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Loading Stage
  if (loading || !db) {
    return (
      <div 
        id="app-loader-splash"
        className="fixed inset-0 bg-gradient-to-tr from-rose-50 via-white to-purple-50 flex flex-col items-center justify-center z-50 p-6"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-rose-500 mb-6"
        >
          <Heart size={64} fill="currentColor" />
        </motion.div>

        <h1 className="text-2xl font-black text-gray-800 tracking-tight">NiniLove</h1>
        <p className="text-xs text-rose-400 font-bold tracking-widest mt-1.5 uppercase">Construyendo tu rincón feliz</p>
        
        <div className="w-24 h-1 bg-rose-100 rounded-full mt-6 overflow-hidden">
          <motion.div 
            className="h-full bg-rose-500 rounded-full"
            animate={{ left: ["-100%", "100%"] }}
            style={{ position: "relative", width: "100%" }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  // Welcome Screen Stage
  if (!currentUser) {
    return (
      <WelcomeScreen
        db={db}
        onConfirmUser={(userId) => {
          localStorage.setItem("selectedUser", userId);
          localStorage.setItem("configured", "true");
          localStorage.setItem("currentUserId", userId === "Nini" ? "nini_001" : "jota_001");
          setCurrentUser(userId);
        }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-tr from-[#fff5f5] via-[#ffffff] to-[#fcf5ff] text-gray-700 selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden"
      id="ninilove-app-root"
    >
      {/* Decorative Blur Backdrops */}
      <div className="fixed top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-rose-200/20 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-200/20 blur-[120px] pointer-events-none -z-10" />

      {/* Main Container framed nicely for Desktop but matches mobile first */}
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col">
        {/* Dynamic Nav View Stage */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {renderActiveView()}
          </AnimatePresence>
        </div>

        {/* Global floating Navigation bar */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
