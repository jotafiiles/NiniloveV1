export interface Letter {
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
  createdBy?: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  description: string;
  addedBy: "Nini" | "Jota";
  dateAdded: string;
  rating: number; // 1-5
  notes: string;
  isFavorite: boolean;
  duration?: string;
  genres?: string;
  embedUrl?: string;
  createdBy?: string;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  phrase: string;
  writtenBy: "Nini" | "Jota";
  emojis: string;
  notes: string;
  hasMemory: boolean;
  createdBy?: string;
}

export interface Profile {
  name: string;
  avatar: string;
  photoURL?: string;
  displayName?: string;
  bio: string;
  favMovie: string;
  favColor: string;
  favQuote: string;
}

export interface DBState {
  loveClicks: {
    Nini: number;
    Jota: number;
  };
  loveHistory: Array<{
    id: string;
    who: "Nini" | "Jota";
    timestamp: string;
    message: string;
    userId?: string;
    lastPressedBy?: string;
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
