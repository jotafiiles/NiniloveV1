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

export interface ContractData {
  title: string;
  subtitle: string;
  content: string;
  clauses: string[];
}

export interface PartnerData {
  name: "Jota" | "Nini";
  status: "pending" | "signing" | "signed";
  signatureUrl: string;
  signedAt: string;
}

export interface SealData {
  enabled: boolean;
}

export interface StatisticsData {
  views: number;
  timesOpened: number;
  lastOpenedAt: string;
}

export interface ExperienceData {
  introPlayed: boolean;
  envelopeOpened: boolean;
  paperUnrolled: boolean;
  contractViewed: boolean;
  signAnimationPlayed: boolean;
  sealAnimationPlayed: boolean;
  completedCelebrationPlayed: boolean;
}

export interface SignatureMetadata {
  partner1: { x: number; y: number; scale: number };
  partner2: { x: number; y: number; scale: number };
}

export interface LastViewedData {
  userId: string;
  viewedAt: string;
}

export interface MarriageContractState {
  contract: ContractData;
  partner1: PartnerData;
  partner2: PartnerData;
  seal: SealData;
  statistics: StatisticsData;
  history?: any[];
  experience: ExperienceData;
  signatureMetadata: SignatureMetadata;
  lastViewed: LastViewedData;
  status: "draft" | "waiting_partner" | "completed";
  version: string;
  createdBy: string;
  createdAt: string;
  completedAt: string;
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
  marriageContract?: MarriageContractState;
}
