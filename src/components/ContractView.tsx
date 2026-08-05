import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, ArrowLeft, RotateCcw, Check, Trash2, Undo2, Redo2, 
  Sparkles, Award, Star, BookOpen, Feather
} from "lucide-react";
import { ref as sRef, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebase";
import { DBState, MarriageContractState } from "../types";

interface ContractViewProps {
  db: DBState;
  onNavigate: (tab: string) => void;
  currentUser: string;
  onUpdateContract: (data: Partial<MarriageContractState>) => Promise<void>;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export default function ContractView({
  db,
  onNavigate,
  currentUser,
  onUpdateContract
}: ContractViewProps) {
  const contractState = db?.marriageContract;
  
  // Local experience steps to make transitions fluid & responsive
  const [envOpen, setEnvOpen] = useState(false);
  const [scrollUnrolled, setScrollUnrolled] = useState(false);
  
  // Signature Canvas Modal
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStrokes, setRedoStrokes] = useState<Stroke[]>([]);
  const [canvasColor, setCanvasColor] = useState("#0f172a"); // Royal black ink
  const [canvasWidth, setCanvasWidth] = useState(3);
  const [isUploading, setIsUploading] = useState(false);

  // Completed Celebration triggers
  const [showCelebration, setShowCelebration] = useState(false);
  const [petals, setPetals] = useState<Array<{ id: number; left: string; delay: string; duration: string; size: string }>>([]);

  // Check user context
  const currentUserName = currentUser === "Nini" || currentUser === "nini_001" ? "Nini" : "Jota";
  const partnerKey = contractState?.partner1?.name === currentUserName ? "partner1" : "partner2";
  const otherPartnerKey = partnerKey === "partner1" ? "partner2" : "partner1";

  const partner1Signed = contractState?.partner1?.status === "signed";
  const partner2Signed = contractState?.partner2?.status === "signed";
  const bothSigned = partner1Signed && partner2Signed;

  // Initialize and track visual experience steps based on synced DB state
  useEffect(() => {
    if (contractState) {
      if (contractState.experience?.envelopeOpened) {
        setEnvOpen(true);
      }
      if (contractState.experience?.paperUnrolled) {
        setScrollUnrolled(true);
      }
      
      // Auto-trigger completion celebration if both signed and celebration not yet completed locally
      if (bothSigned && contractState.seal?.enabled && !contractState.experience?.completedCelebrationPlayed) {
        triggerCelebration();
      }
    }
  }, [contractState, bothSigned]);

  // Record stats and view details on load
  useEffect(() => {
    if (contractState) {
      const currentViews = contractState.statistics?.views || 0;
      const currentTimes = contractState.statistics?.timesOpened || 0;
      const nowStr = new Date().toISOString();
      
      onUpdateContract({
        statistics: {
          views: currentViews + 1,
          timesOpened: currentTimes + 1,
          lastOpenedAt: nowStr
        },
        lastViewed: {
          userId: currentUserName,
          viewedAt: nowStr
        }
      });
    }
  }, []);

  // Set up falling rose petals celebration
  const triggerCelebration = () => {
    // Vibrar dispositivo
    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150]);
    }

    // Generate random falling rose petals
    const newPetals = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${12 + Math.random() * 18}px`
    }));
    
    setPetals(newPetals);
    setShowCelebration(true);

    // Save that celebration played
    setTimeout(() => {
      onUpdateContract({
        experience: {
          ...contractState!.experience,
          completedCelebrationPlayed: true
        }
      });
    }, 4500);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getEventCoords(e, canvas);
    setIsDrawing(true);
    setStrokes((prev) => [...prev, { points: [coords], color: canvasColor, width: canvasWidth }]);
    setRedoStrokes([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getEventCoords(e, canvas);
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      const updatedStroke = {
        ...lastStroke,
        points: [...lastStroke.points, coords]
      };
      return [...prev.slice(0, -1), updatedStroke];
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Redraw strokes whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes]);

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStrokes((prev) => [last, ...prev]);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStrokes.length === 0) return;
    const first = redoStrokes[0];
    setStrokes((prev) => [...prev, first]);
    setRedoStrokes((prev) => prev.slice(1));
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStrokes([]);
  };

  // Export signature as PNG and save
  const handleConfirmSignature = async () => {
    if (strokes.length === 0) {
      alert("Por favor, dibuja tu firma antes de confirmar.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsUploading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      let uploadedUrl = dataUrl; // fallback base64 string

      // Attempt upload to Firebase Storage
      try {
        const storagePath = `signatures/${currentUserName.toLowerCase()}_signature_${Date.now()}.png`;
        const storageRef = sRef(storage, storagePath);
        await uploadString(storageRef, dataUrl, "data_url");
        uploadedUrl = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn("Storage upload failed, saving as direct base64 in database:", storageErr);
      }

      // Update signature on contract node
      if (contractState) {
        const now = new Date().toISOString();
        const updatedPartnerData = {
          name: currentUserName as "Jota" | "Nini",
          status: "signed" as const,
          signatureUrl: uploadedUrl,
          signedAt: now
        };

        const otherPartnerSignedNow = contractState[otherPartnerKey]?.status === "signed";
        const completeNow = otherPartnerSignedNow;

        const updatePayload: Partial<MarriageContractState> = {
          [partnerKey]: updatedPartnerData,
          status: completeNow ? "completed" : "waiting_partner",
          experience: {
            ...contractState.experience,
            signAnimationPlayed: true
          }
        };

        if (completeNow) {
          updatePayload.completedAt = now;
          updatePayload.seal = { enabled: true };
          // Experience completes celebration played will trigger on database reload callback
        }

        await onUpdateContract(updatePayload);
        setShowCanvas(false);
      }
    } catch (err) {
      console.error("Error saving signature:", err);
      alert("Hubo un error guardando tu firma. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  // Step Trigger: Open Envelope
  const handleOpenEnvelope = async () => {
    setEnvOpen(true);
    if (contractState) {
      await onUpdateContract({
        experience: {
          ...contractState.experience,
          envelopeOpened: true
        }
      });
    }
  };

  // Step Trigger: Unroll Scroll
  const handleUnrollScroll = async () => {
    setScrollUnrolled(true);
    if (contractState) {
      await onUpdateContract({
        experience: {
          ...contractState.experience,
          paperUnrolled: true,
          contractViewed: true
        }
      });
    }
  };

  if (!contractState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-[#A68F94]">
        <div className="flex flex-col items-center gap-3">
          <Heart size={32} className="animate-spin text-pink-400" />
          <p className="text-xs font-bold tracking-widest uppercase">Cargando vuestro pacto sagrado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 max-w-md mx-auto relative overflow-hidden" id="contract-view-root">
      
      {/* Header Back controls */}
      <header className="flex justify-between items-center mb-6 z-30 relative" id="contract-header-nav">
        <button
          onClick={() => onNavigate("inicio")}
          className="flex items-center gap-1.5 text-xs text-amber-900/60 hover:text-amber-950 bg-white/70 backdrop-blur px-3.5 py-2 rounded-full border border-amber-100 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Volver al Inicio
        </button>
        <span className="text-[10px] font-extrabold text-amber-800/40 tracking-widest uppercase select-none">
          Pacto Nini & Jota
        </span>
      </header>

      {/* Experience steps */}
      <div className="relative w-full min-h-[500px]" id="contract-experience-stages">
        
        {/* STAGE 1: Antique Envelope */}
        {!envOpen && (
          <div className="flex flex-col items-center justify-center pt-10" id="stage-envelope-view">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-amber-800/70 font-semibold tracking-widest uppercase text-center mb-6"
            >
              Has recibido un envío sagrado...
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={handleOpenEnvelope}
              className="w-full max-w-sm aspect-[4/3] bg-[#EADCC9] rounded-[24px] shadow-[0_20px_50px_rgba(90,60,30,0.3)] border border-[#DFCEB6] relative p-6 cursor-pointer overflow-hidden flex items-center justify-center group"
            >
              {/* Envelope Letter lines */}
              <div className="absolute inset-0 border-4 border-dashed border-[#DFCEB6]/50 m-2 rounded-[18px]" />
              
              {/* Back shadows to feel vintage/folded */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/10 via-transparent to-black/10 pointer-events-none" />
              
              {/* Flaps lines using beautiful golden colors */}
              <svg className="absolute inset-0 w-full h-full stroke-[#D5C2A5] stroke-[1.5] fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="50" y2="50" />
                <line x1="100" y1="0" x2="50" y2="50" />
                <polygon points="0,100 50,50 100,100" fill="#E4D3BC" />
              </svg>

              {/* Red Wax Seal */}
              <motion.div
                whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0] }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-800 to-red-600 shadow-[0_8px_20px_rgba(150,0,0,0.4)] flex items-center justify-center relative z-10 active:scale-95 transition-transform"
                id="wax-seal-button"
              >
                {/* Innermost design */}
                <div className="w-[84%] h-[84%] rounded-full border-2 border-dashed border-red-900/40 flex items-center justify-center text-red-100 font-serif italic text-2xl font-black">
                  ❤️
                </div>
                {/* Soft wax flow circles */}
                <div className="absolute -inset-1 rounded-full border-4 border-red-700/30 -z-10 animate-ping opacity-40 group-hover:block" />
              </motion.div>

              <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                <span className="text-[10px] text-amber-900/60 tracking-widest font-bold uppercase">
                  Toca el sello para abrir
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* STAGE 2: Closed Scroll coming out */}
        {envOpen && !scrollUnrolled && (
          <div className="flex flex-col items-center justify-center pt-12" id="stage-scroll-closed">
            <motion.div
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 15 }}
              onClick={handleUnrollScroll}
              className="flex flex-col items-center gap-6 cursor-pointer"
            >
              <div className="relative w-20 h-72 bg-gradient-to-r from-[#DFCEB6] via-[#F5E6D3] to-[#DFCEB6] rounded-full shadow-[0_15px_35px_rgba(90,60,30,0.25)] border-y border-amber-900/10 flex items-center justify-center">
                
                {/* Scroll bands with gold highlights */}
                <div className="absolute top-1/4 w-full h-1 bg-amber-700/20" />
                <div className="absolute bottom-1/4 w-full h-1 bg-amber-700/20" />
                
                {/* Red tie ribbon */}
                <div className="absolute top-1/2 -translate-y-1/2 w-[110%] h-8 bg-red-700 shadow-md flex items-center justify-center text-red-100 text-[10px] tracking-widest font-bold uppercase rounded-sm">
                  ❤️
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-bold text-amber-900/80 uppercase tracking-widest">El Pergamino Sagrado</h4>
                <p className="text-xs text-amber-800/60 mt-1 italic">Toca el pergamino para desenrollar el pacto...</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* STAGE 3: Unrolled Contract */}
        {envOpen && scrollUnrolled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="w-full bg-[#FCF8F2] rounded-[36px] p-6 shadow-[0_25px_60px_-15px_rgba(90,60,30,0.2)] border border-[#E9DFD0] relative min-h-[600px]"
            id="stage-scroll-open"
          >
            {/* Antique decorative watermark */}
            <div className="absolute top-10 left-10 right-10 bottom-10 border border-amber-200/20 rounded-[28px] pointer-events-none" />
            
            {/* Wooden/scroll top roller bar visual effect */}
            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-[90%] h-4 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 rounded-full shadow-md -z-10" />
            
            {/* Contract Header */}
            <div className="text-center relative pb-4 mb-6 border-b border-amber-200/40" id="contract-content-header">
              <span className="text-[9px] font-extrabold text-amber-700/60 tracking-[0.25em] uppercase">
                Acuerdo de Corazones Unidos
              </span>
              <h2 className="text-2xl font-serif text-[#3A3234] leading-tight font-extrabold italic mt-1.5 uppercase tracking-wide">
                {contractState.contract?.title || "CONTRATO DE AMOR ETERNO"}
              </h2>
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium mt-1 font-serif max-w-xs mx-auto">
                {contractState.contract?.subtitle || "Un compromiso mágico para toda la vida"}
              </p>
            </div>

            {/* Contract Content */}
            <div className="text-sm text-[#4E4345] leading-relaxed mb-6 font-serif px-2 italic text-justify" id="contract-intro-content">
              "{contractState.contract?.content}"
            </div>

            {/* Clauses List */}
            <div className="space-y-4 mb-8" id="contract-clauses-box">
              <h3 className="text-[10px] font-black text-amber-800 tracking-[0.15em] uppercase border-b border-amber-100 pb-1 mb-2">
                Cláusulas de Unión
              </h3>
              {(contractState.contract?.clauses || []).map((clause, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed text-[#4E4345]">
                  <span className="text-amber-600 shrink-0 font-bold font-serif">{idx + 1}.</span>
                  <p className="font-medium italic text-justify">{clause}</p>
                </div>
              ))}
            </div>

            {/* Signatures Area */}
            <div className="grid grid-cols-2 gap-4 border-t border-amber-200/40 pt-6 relative" id="contract-signatures-box">
              
              {/* PARTNER 1: Jota */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-bold text-amber-800/60 uppercase tracking-widest mb-2">Firma de Jota</span>
                
                <div className="w-full aspect-[1.5] rounded-2xl bg-amber-50/50 border border-[#E9DFD0] flex items-center justify-center p-2 relative overflow-hidden">
                  {contractState.partner1?.status === "signed" ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={contractState.partner1.signatureUrl} 
                        alt="Firma de Jota" 
                        className="max-h-20 object-contain w-full drop-shadow-sm select-none"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                        {new Date(contractState.partner1.signedAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 p-2 flex flex-col items-center gap-1 select-none">
                      <Feather size={18} className="text-amber-800/20" />
                      <span className="text-[9px] font-bold text-amber-800/40 uppercase tracking-wide">
                        Lugar para la firma
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign button for Jota */}
                {currentUser === "Jota" && contractState.partner1?.status !== "signed" && (
                  <button
                    onClick={() => setShowCanvas(true)}
                    className="mt-3 inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-md transition-colors cursor-pointer border-none"
                  >
                    <Feather size={12} />
                    Firmar contrato
                  </button>
                )}
              </div>

              {/* PARTNER 2: Nini */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-bold text-amber-800/60 uppercase tracking-widest mb-2">Firma de Nini</span>
                
                <div className="w-full aspect-[1.5] rounded-2xl bg-amber-50/50 border border-[#E9DFD0] flex items-center justify-center p-2 relative overflow-hidden">
                  {contractState.partner2?.status === "signed" ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={contractState.partner2.signatureUrl} 
                        alt="Firma de Nini" 
                        className="max-h-20 object-contain w-full drop-shadow-sm select-none"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                        {new Date(contractState.partner2.signedAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 p-2 flex flex-col items-center gap-1 select-none">
                      <Feather size={18} className="text-amber-800/20" />
                      <span className="text-[9px] font-bold text-amber-800/40 uppercase tracking-wide">
                        Lugar para la firma
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign button for Nini */}
                {currentUser === "Nini" && contractState.partner2?.status !== "signed" && (
                  <button
                    onClick={() => setShowCanvas(true)}
                    className="mt-3 inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-md transition-colors cursor-pointer border-none"
                  >
                    <Feather size={12} />
                    Firmar contrato
                  </button>
                )}
              </div>

            </div>

            {/* SYNC STATUS / WAITING PARTNER NOTE */}
            {contractState.status === "waiting_partner" && (
              <div className="mt-8 bg-amber-100/50 border border-amber-200/40 p-4 rounded-2xl flex items-start gap-3" id="contract-waiting-banner">
                <div className="bg-amber-600/10 p-1.5 rounded-lg text-amber-800 mt-0.5">
                  <Star size={16} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Esperando segunda firma...</h4>
                  <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                    {contractState.partner1?.status === "signed" ? "Jota" : "Nini"} ya firmó el contrato. En cuanto {contractState.partner1?.status !== "signed" ? "Jota" : "Nini"} estampe su firma, el pacto de amor eterno quedará sellado.
                  </p>
                </div>
              </div>
            )}

            {/* WAX SEAL OF STAMP STAGED / ANIMATED */}
            {contractState.seal?.enabled && (
              <motion.div
                initial={{ scale: 3, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.5 }}
                className="absolute right-6 bottom-32 w-28 h-28 rounded-full bg-gradient-to-tr from-red-800 to-red-600 shadow-[0_8px_25px_rgba(140,0,0,0.35)] border border-red-900/10 flex items-center justify-center z-20 overflow-hidden"
                id="synced-wax-seal-stamp"
              >
                {/* Fine wax details */}
                <div className="w-[84%] h-[84%] rounded-full border border-red-900/30 flex items-center justify-center font-serif text-3xl font-black text-red-100 italic">
                  ❤️
                </div>
                {/* Sello de cera roto layer */}
                <div className="absolute inset-0 bg-red-900/5 hover:bg-transparent transition-colors" />
              </motion.div>
            )}

          </motion.div>
        )}

      </div>

      {/* FULL-SCREEN REAL-TIME DRAWING CANVAS OVERLAY */}
      <AnimatePresence>
        {showCanvas && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
            id="signature-canvas-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#FCFBF8] rounded-[32px] w-full max-w-sm overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.25)] border border-amber-200/50"
              id="signature-canvas-container"
            >
              {/* Header */}
              <div className="bg-amber-50/50 border-b border-amber-100/50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Feather size={16} className="text-amber-800" />
                  <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Estampar tu Firma</h3>
                </div>
                <span className="text-[10px] font-extrabold text-[#A68F94] tracking-wide uppercase">
                  {currentUserName}
                </span>
              </div>

              {/* Drawing Area Card */}
              <div className="p-6">
                <p className="text-[11px] text-gray-500 font-medium mb-3">
                  Usa tu dedo o lápiz en la pizarra blanca para escribir tu firma tierno:
                </p>

                {/* Actual canvas */}
                <div className="relative border border-amber-200/60 bg-white rounded-2xl overflow-hidden shadow-inner aspect-[2/1] w-full">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={170}
                    className="w-full h-full block cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  
                  {strokes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-[11px] italic font-medium uppercase tracking-wider">
                      Escribe aquí
                    </div>
                  )}
                </div>

                {/* Canvas Controls */}
                <div className="flex justify-between items-center mt-4">
                  {/* Color Pickers */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCanvasColor("#0f172a")} // ink black
                      className={`w-6 h-6 rounded-full border-2 ${canvasColor === "#0f172a" ? "border-amber-700 scale-110" : "border-transparent"} bg-[#0f172a]`}
                      title="Tinta Negra"
                    />
                    <button
                      onClick={() => setCanvasColor("#1e3a8a")} // royal blue ink
                      className={`w-6 h-6 rounded-full border-2 ${canvasColor === "#1e3a8a" ? "border-amber-700 scale-110" : "border-transparent"} bg-[#1e3a8a]`}
                      title="Tinta Azul"
                    />
                    <button
                      onClick={() => setCanvasColor("#991b1b")} // deep romantic red
                      className={`w-6 h-6 rounded-full border-2 ${canvasColor === "#991b1b" ? "border-amber-700 scale-110" : "border-transparent"} bg-[#991b1b]`}
                      title="Tinta Roja"
                    />
                  </div>

                  {/* Redo/Undo buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={strokes.length === 0}
                      className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-600 rounded-lg cursor-pointer border-none outline-none"
                      title="Deshacer"
                    >
                      <Undo2 size={15} />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStrokes.length === 0}
                      className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-600 rounded-lg cursor-pointer border-none outline-none"
                      title="Rehacer"
                    >
                      <Redo2 size={15} />
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={strokes.length === 0}
                      className="p-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-600 rounded-lg cursor-pointer border-none outline-none"
                      title="Borrar todo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-amber-50/50 border-t border-amber-100/50 p-4 flex gap-3">
                <button
                  onClick={() => setShowCanvas(false)}
                  disabled={isUploading}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-100 text-gray-500 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer outline-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSignature}
                  disabled={isUploading || strokes.length === 0}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer border-none outline-none flex items-center justify-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <Heart size={14} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RITUAL CELEBRATION POPUP STAMP ON ALL SIGNED COMPLETION */}
      <AnimatePresence>
        {showCelebration && (
          <div 
            className="fixed inset-0 bg-[#3A3234]/40 backdrop-blur-lg flex items-center justify-center z-50 p-6 overflow-hidden"
            id="contract-celebration-popup"
          >
            {/* Falling Rose Petals Canvas/Items */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {petals.map((petal) => (
                <div
                  key={petal.id}
                  className="absolute bg-pink-500 rounded-full opacity-60 animate-fall pointer-events-none"
                  style={{
                    left: petal.left,
                    width: petal.size,
                    height: petal.size,
                    animationDelay: petal.delay,
                    animationDuration: petal.duration,
                    top: "-10%"
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="bg-white rounded-[36px] p-8 max-w-sm w-full text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-pink-50 relative overflow-hidden"
              id="celebration-card"
            >
              {/* Background flares */}
              <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 to-white -z-10" />

              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-md">
                  <Heart size={36} fill="currentColor" className="animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#3A3234] leading-snug uppercase tracking-wide">
                ¡Pacto Sellado Para Siempre!
              </h3>
              
              <p className="text-xs text-rose-400 font-bold tracking-[0.2em] mt-1.5 uppercase">
                Contrato firmado ❤️
              </p>

              {/* Synod signature values */}
              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-4 px-2">
                Nini y Jota, vuestro amor ha sido sellado con un compromiso sagrado por toda la eternidad. Cada día, cada sonrisa y cada abrazo son testimonios de este hermoso viaje juntos.
              </p>

              <button
                onClick={() => setShowCelebration(false)}
                className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-rose-200 transition-all cursor-pointer border-none outline-none uppercase tracking-widest"
              >
                Celebrar nuestro amor
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tailwind Falling animation helper inject */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

    </div>
  );
}
