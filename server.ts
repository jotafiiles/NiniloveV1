import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "ninilove-db.json");

// Types for the application data
interface Letter {
  id: string;
  from: "Nini" | "Jota";
  to: "Nini" | "Jota";
  title: string;
  content: string;
  style: {
    bgColor: string;
    textColor: string;
    fontFamily: string;
    sticker?: string;
    backgroundPattern?: string;
  };
  date: string;
  isOpened: boolean;
}

interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  description: string;
  addedBy: "Nini" | "Jota";
  dateAdded: string;
  rating: number;
  notes: string;
  isFavorite: boolean;
}

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  phrase: string;
  writtenBy: "Nini" | "Jota";
  emojis: string;
  notes: string;
  hasMemory: boolean;
}

interface Profile {
  name: string;
  avatar: string;
  bio: string;
  favMovie: string;
  favColor: string;
  favQuote: string;
}

interface DB {
  loveClicks: {
    Nini: number;
    Jota: number;
  };
  loveHistory: Array<{
    id: string;
    who: "Nini" | "Jota";
    timestamp: string;
    message: string;
  }>;
  letters: Letter[];
  movies: Movie[];
  calendar: Record<string, CalendarEvent>;
  profiles: {
    Nini: Profile;
    Jota: Profile;
  };
  daysTogetherStartDate: string;
}

// Romantic phrases pool for fallback
const ROMANTIC_PHRASES = [
  "Eres mi lugar favorito en el mundo entero.",
  "Cada segundo contigo es un regalo que atesoro con todo mi corazón.",
  "Te amo no solo por cómo eres, sino por cómo soy cuando estoy contigo.",
  "Mi amor por ti crece más de lo que las palabras pueden expresar.",
  "Eres la razón por la que sonrío al despertar y al irme a dormir.",
  "Contigo el mundo es un lugar mucho más brillante y feliz.",
  "Si tuviera que elegir mi momento favorito de la vida, elegiría el día que te conocí.",
  "Nini y Jota, un amor diseñado para durar toda la eternidad.",
  "Tu amor es mi melodía favorita y tu sonrisa mi obra de arte.",
  "No hay distancia, tiempo ni espacio que pueda disminuir lo que siento por ti.",
  "Eres mi hoy y todos mis mañanas.",
  "Amo la forma en que nos complementamos, eres mi mitad perfecta.",
  "Escribir nuestra historia juntos es mi pasatiempo favorito.",
  "Gracias por enseñarme lo que realmente significa amar y ser amado.",
  "Tu risa es la banda sonora de mi felicidad.",
  "Haces que los días ordinarios se sientan extraordinarios.",
  "Mi amor por ti es un viaje que empieza en el siempre y termina en el jamás."
];

const DEFAULT_DB: DB = {
  loveClicks: {
    Nini: 142,
    Jota: 128
  },
  loveHistory: [
    {
      id: "h1",
      who: "Jota",
      timestamp: new Date().toISOString(),
      message: "¡Te amo infinitamente, mi reina hermosa! ❤️"
    },
    {
      id: "h2",
      who: "Nini",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      message: "¡Yo te amo mucho más, mi rey consentido! 🥰"
    }
  ],
  letters: [
    {
      id: "l1",
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
    },
    {
      id: "l2",
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
    }
  ],
  movies: [
    {
      id: "m1",
      title: "La La Land",
      year: 2016,
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
      description: "Un pianista de jazz y una aspirante a actriz se enamoran en Los Ángeles mientras persiguen sus sueños.",
      addedBy: "Nini",
      dateAdded: "2026-07-28",
      rating: 5,
      notes: "Nuestra película favorita para cantar juntos. ¡La escena del planetario es mágica!",
      isFavorite: true
    },
    {
      id: "m2",
      title: "About Time",
      year: 2013,
      posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
      description: "A la edad de 21 años, Tim descubre que puede viajar en el tiempo y cambiar lo que sucede en su propia vida.",
      addedBy: "Jota",
      dateAdded: "2026-07-30",
      rating: 5,
      notes: "Nos enseña que hay que vivir cada día como si fuera el último y disfrutar cada pequeño momento juntos.",
      isFavorite: true
    }
  ],
  calendar: {
    "2026-08-03": {
      date: "2026-08-03",
      phrase: "El mejor día de la semana siempre es el que paso a tu lado.",
      writtenBy: "Jota",
      emojis: "☀️🌸🌿",
      notes: "Hoy diseñamos nuestra app NiniLove juntos. ¡Es un día inolvidable!",
      hasMemory: true
    },
    "2026-08-02": {
      date: "2026-08-02",
      phrase: "Amor es cuidar del otro incluso en los detalles más pequeños.",
      writtenBy: "Nini",
      emojis: "☕🍰🧸",
      notes: "Merendamos postre de fresa y tomamos cafecito en la tarde mientras nos dábamos mimos.",
      hasMemory: true
    },
    "2026-08-14": {
      date: "2026-08-14",
      phrase: "Cada mes que pasa, mi corazón te elige una y otra vez.",
      writtenBy: "Jota",
      emojis: "❤️🌙💍",
      notes: "¡Nuestro cumplemes! Recordar preparar sorpresita linda.",
      hasMemory: false
    }
  },
  profiles: {
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
  },
  daysTogetherStartDate: "2024-02-14" // San Valentín 2024
};

// Initialize DB file if not exists
function readDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file, using default DB:", error);
  }
  
  // Write default db
  writeDB(DEFAULT_DB);
  return DEFAULT_DB;
}

function writeDB(data: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found. Using romantic offline presets fallback.");
}

// Middlewares
app.use(express.json());

// API endpoints
app.get("/api/data", (req, res) => {
  const db = readDB();
  res.json(db);
});

// Update Days Together start date
app.post("/api/settings/start-date", (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });
  
  const db = readDB();
  db.daysTogetherStartDate = date;
  writeDB(db);
  res.json({ success: true, daysTogetherStartDate: date });
});

// Love Click Endpoint
app.post("/api/love-click", async (req, res) => {
  const { who } = req.body; // 'Nini' or 'Jota'
  if (who !== "Nini" && who !== "Jota") {
    return res.status(400).json({ error: "Invalid sender" });
  }

  const db = readDB();
  db.loveClicks[who] += 1;

  let sweetMessage = "";

  if (ai) {
    try {
      const prompt = `Genera una frase de amor sumamente romántica, corta, tierna y creativa escrita por ${who} para su pareja. Debe usar un lenguaje dulce, moderno y cariñoso en español. Max 150 caracteres. Evita clichés baratos, que suene elegante y sentido. Solo devuelve la frase, sin comillas adicionales.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      sweetMessage = response.text?.trim() || "";
    } catch (err) {
      console.error("Gemini failed, using fallback:", err);
    }
  }

  if (!sweetMessage) {
    // Pick random from our pool
    const randomIndex = Math.floor(Math.random() * ROMANTIC_PHRASES.length);
    sweetMessage = ROMANTIC_PHRASES[randomIndex];
  }

  const newHistoryItem = {
    id: "h_" + Date.now(),
    who,
    timestamp: new Date().toISOString(),
    message: sweetMessage
  };

  db.loveHistory.unshift(newHistoryItem);
  if (db.loveHistory.length > 30) {
    db.loveHistory = db.loveHistory.slice(0, 30);
  }

  writeDB(db);
  res.json({
    success: true,
    loveClicks: db.loveClicks,
    loveHistory: db.loveHistory,
    message: sweetMessage
  });
});

// Letters APIs
app.post("/api/letters", (req, res) => {
  const { from, to, title, content, style } = req.body;
  if (!from || !to || !title || !content || !style) {
    return res.status(400).json({ error: "All letter fields are required" });
  }

  const db = readDB();
  const newLetter: Letter = {
    id: "l_" + Date.now(),
    from,
    to,
    title,
    content,
    style,
    date: new Date().toISOString().split("T")[0],
    isOpened: false
  };

  db.letters.unshift(newLetter);
  writeDB(db);
  res.json({ success: true, letter: newLetter });
});

app.post("/api/letters/:id/open", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const letter = db.letters.find((l) => l.id === id);
  if (letter) {
    letter.isOpened = true;
    writeDB(db);
    return res.json({ success: true, letter });
  }
  res.status(404).json({ error: "Letter not found" });
});

app.delete("/api/letters/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.letters.findIndex((l) => l.id === id);
  if (index !== -1) {
    db.letters.splice(index, 1);
    writeDB(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Letter not found" });
});

// Movies APIs
app.post("/api/movies", (req, res) => {
  const { title, year, description, posterUrl, addedBy, rating, notes } = req.body;
  if (!title || !addedBy) {
    return res.status(400).json({ error: "Title and addedBy are required" });
  }

  const db = readDB();
  const defaultPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400";
  const newMovie: Movie = {
    id: "m_" + Date.now(),
    title,
    year: parseInt(year) || new Date().getFullYear(),
    description: description || "Sin descripción disponible.",
    posterUrl: posterUrl || defaultPoster,
    addedBy,
    dateAdded: new Date().toISOString().split("T")[0],
    rating: parseInt(rating) || 5,
    notes: notes || "",
    isFavorite: false
  };

  db.movies.unshift(newMovie);
  writeDB(db);
  res.json({ success: true, movie: newMovie });
});

app.post("/api/movies/:id/favorite", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const movie = db.movies.find((m) => m.id === id);
  if (movie) {
    movie.isFavorite = !movie.isFavorite;
    writeDB(db);
    return res.json({ success: true, movie });
  }
  res.status(404).json({ error: "Movie not found" });
});

app.delete("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.movies.findIndex((m) => m.id === id);
  if (index !== -1) {
    db.movies.splice(index, 1);
    writeDB(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Movie not found" });
});

// Calendar APIs
app.post("/api/calendar", (req, res) => {
  const { date, phrase, writtenBy, emojis, notes, hasMemory } = req.body;
  if (!date || !phrase || !writtenBy) {
    return res.status(400).json({ error: "Date, phrase and writtenBy are required" });
  }

  const db = readDB();
  db.calendar[date] = {
    date,
    phrase,
    writtenBy,
    emojis: emojis || "💖",
    notes: notes || "",
    hasMemory: hasMemory !== undefined ? hasMemory : true
  };

  writeDB(db);
  res.json({ success: true, event: db.calendar[date] });
});

// Profile APIs
app.post("/api/profile", (req, res) => {
  const { name, avatar, bio, favMovie, favColor, favQuote } = req.body;
  if (name !== "Nini" && name !== "Jota") {
    return res.status(400).json({ error: "Invalid profile name" });
  }

  const db = readDB();
  db.profiles[name] = {
    name,
    avatar: avatar || db.profiles[name].avatar,
    bio: bio || db.profiles[name].bio,
    favMovie: favMovie || db.profiles[name].favMovie,
    favColor: favColor || db.profiles[name].favColor,
    favQuote: favQuote || db.profiles[name].favQuote
  };

  writeDB(db);
  res.json({ success: true, profile: db.profiles[name] });
});

// Gemini daily custom quote generator
app.get("/api/gemini/quote", async (req, res) => {
  let quote = "";
  let author = "Gemini AI";

  if (ai) {
    try {
      const prompt = `Genera una frase de amor hermosa, profunda y poética dedicada para la pareja Nini y Jota en español. No repitas clichés comunes, crea una metáfora elegante sobre la tranquilidad, complicidad y el amor sincero. Debe ser de máximo 180 caracteres. Solo la frase literaria, sin comentarios ni explicaciones adicionales.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      quote = response.text?.trim() || "";
    } catch (err) {
      console.error("Gemini failed for daily quote:", err);
    }
  }

  if (!quote) {
    const randomIndex = Math.floor(Math.random() * ROMANTIC_PHRASES.length);
    quote = ROMANTIC_PHRASES[randomIndex];
    author = "Inspiración del día";
  }

  res.json({ quote, author });
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
