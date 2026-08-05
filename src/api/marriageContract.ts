import { db } from "./firebase";
import { ref, get, set, update, onValue, off } from "firebase/database";

const PATH = "marriageContract";

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

const DEFAULT_CONTRACT_CONTENT: MarriageContractState = {
  contract: {
    title: "CONTRATO DE AMOR ETERNO",
    subtitle: "Un pacto sagrado y mágico entre dos almas destinadas a estar juntas",
    content: "Nosotros, Nini y Jota, reconociendo la inmensidad de lo que sentimos y en pleno uso de nuestra locura romántica, declaramos este amor como nuestra mayor prioridad y compromiso eterno.",
    clauses: [
      "Amarnos de forma incondicional en la felicidad, en las risas y también en los momentos difíciles.",
      "No dormirnos enojados; resolver cualquier malentendido con sinceridad, ternura y un abrazo prolongado.",
      "Cuidar los mimos cotidianos, los besitos tiernos en la frente y hacernos sonreír cada día.",
      "Apoyar los sueños del otro pase lo que pase, celebrando sus logros como propios porque somos un equipo.",
      "Planear aventuras infinitas, acurrucarnos para ver películas y reír juntos hasta que nos duela la pancita."
    ]
  },
  partner1: {
    name: "Jota",
    status: "pending",
    signatureUrl: "",
    signedAt: ""
  },
  partner2: {
    name: "Nini",
    status: "pending",
    signatureUrl: "",
    signedAt: ""
  },
  seal: {
    enabled: false
  },
  statistics: {
    views: 0,
    timesOpened: 0,
    lastOpenedAt: ""
  },
  experience: {
    introPlayed: false,
    envelopeOpened: false,
    paperUnrolled: false,
    contractViewed: false,
    signAnimationPlayed: false,
    sealAnimationPlayed: false,
    completedCelebrationPlayed: false
  },
  signatureMetadata: {
    partner1: { x: 0, y: 0, scale: 1 },
    partner2: { x: 0, y: 0, scale: 1 }
  },
  lastViewed: {
    userId: "",
    viewedAt: ""
  },
  status: "draft",
  version: "1.0",
  createdBy: "Sistema NiniLove",
  createdAt: new Date().toISOString(),
  completedAt: ""
};

export const getContract = async (): Promise<MarriageContractState> => {
  const snapshot = await get(ref(db, PATH));
  if (!snapshot.exists()) {
    // Bootstrap if it doesn't exist
    await set(ref(db, PATH), DEFAULT_CONTRACT_CONTENT);
    return DEFAULT_CONTRACT_CONTENT;
  }
  return snapshot.val() as MarriageContractState;
};

export const updateContract = async (data: Partial<MarriageContractState>): Promise<void> => {
  await update(ref(db, PATH), data);
};

export const subscribeContract = (callback: (data: MarriageContractState) => void): (() => void) => {
  const dbRef = ref(db, PATH);
  const listener = onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      // Bootstrap on value trigger if it's completely null
      set(ref(db, PATH), DEFAULT_CONTRACT_CONTENT);
      callback(DEFAULT_CONTRACT_CONTENT);
      return;
    }
    callback(snapshot.val() as MarriageContractState);
  });
  return () => off(dbRef, "value", listener);
};
