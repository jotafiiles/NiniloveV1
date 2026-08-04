import { motion } from "motion/react";
import { Home, Calendar, Mail, Film, User } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "calendario", label: "Calendario", icon: Calendar },
    { id: "cartas", label: "Cartas", icon: Mail },
    { id: "peliculas", label: "Películas", icon: Film },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <div 
        id="bottom-navigation-container"
        className="backdrop-blur-xl bg-white/75 border border-pink-100/40 shadow-[0_20px_50px_-15px_rgba(255,182,193,0.35)] rounded-[28px] px-3 py-2 flex justify-around items-center"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="relative py-1.5 px-3 flex flex-col items-center justify-center rounded-2xl transition-colors duration-200 outline-none select-none touch-manipulation cursor-pointer border-none bg-transparent"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-[#FFF0F3] rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`${isActive ? "text-pink-500" : "text-gray-400"}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <span
                className={`text-[9.5px] mt-1 font-semibold tracking-wide transition-all duration-200 ${
                  isActive ? "text-pink-600" : "text-gray-400 font-medium"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
