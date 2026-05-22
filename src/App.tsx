import React, { useState, useEffect } from "react";
import { Home, Map as MapIcon, Trophy, Dumbbell, Users, BarChart2, Flame, RefreshCw, X, Camera } from "lucide-react";
import { UserData, Quest, RecentQuest, MissionLogItem, Challenge } from "./types";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import MapView from "./components/MapView";
import ArenaView from "./components/ArenaView";
import HubView from "./components/HubView";
import RankView from "./components/RankView";
import CameraView from "./components/CameraView";
import SolverView from "./components/SolverView";
import QuestRevisionView from "./components/QuestRevisionView";

export default function App() {
  // Navigation active tab: "home" | "map" | "arena" | "hub" | "rank"
  const [activeTab, setActiveTab] = useState<"home" | "map" | "arena" | "hub" | "rank">("home");

  // Camera scanner overlay state
  const [showCamera, setShowCamera] = useState(false);
  // Active solver state (modal or page overlay)
  const [activeEquation, setActiveEquation] = useState<string | null>(null);
  // Selected recent quest for full-page revision review
  const [selectedRecentQuest, setSelectedRecentQuest] = useState<RecentQuest | null>(null);

  // Voice Assistant state
  const [voiceActive, setVoiceActive] = useState(false);

  // Level Up celebrate modal state
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);

  // User Stats: Load or setup original stats mirroring Screen A exactly
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem("math_companion_user");
    if (saved) return JSON.parse(saved);
    return {
      name: "Alex",
      level: 8,
      xp: 2450,
      maxXp: 3000,
      streak: 12,
      globalRank: 142,
    };
  });

  // Daily Quests State
  const [quests, setQuests] = useState<Quest[]>(() => {
    return [
      {
        id: "q-1",
        category: "Geometry",
        description: "Solve 3 Geometry problems",
        progress: 2,
        target: 3,
        xpReward: 150,
        completed: false,
      },
    ];
  });

  // Recent Quests list state
  const [recentQuests, setRecentQuests] = useState<RecentQuest[]>([
    {
      id: "rq-1",
      category: "Calculus",
      subtopic: "Derivatives",
      xpReward: 50,
      completed: true,
      question: "What is the first derivative of the polynomial function f(x) = 3x² + 5x - 2?",
      equation: "d/dx (3x² + 5x - 2)",
    },
    {
      id: "rq-2",
      category: "Algebra",
      subtopic: "Polynomials",
      xpReward: 30,
      completed: true,
      question: "Factor and solve the polynomial system: x² - 5x + 6 = 0.",
      equation: "x² - 5x + 6 = 0",
    },
    {
      id: "rq-3",
      category: "Geometry",
      subtopic: "Right Triangles",
      xpReward: 45,
      completed: false,
      timeString: "2h ago",
      question: "A right triangle has legs of length a = 3 and b = 4. What is the length of hypotenuse c?",
      equation: "3² + 4² = c²",
    },
  ]);

  // Mission Log State mirroring Screen A list items exactly
  const [missions, setMissions] = useState<MissionLogItem[]>(() => {
    const saved = localStorage.getItem("math_companion_missions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "m-1",
        equation: "Quadratic Equations",
        title: "Algebra Solve",
        topic: "Algebra",
        xpAwarded: 50,
        isCorrect: true,
        canRetry: false,
        timeString: "2h ago",
      },
      {
        id: "m-2",
        equation: "Pythagorean Theorem",
        title: "Geometry Proof",
        topic: "Geometry",
        xpAwarded: 45,
        isCorrect: true,
        canRetry: false,
        timeString: "Yesterday",
      },
      {
        id: "m-3",
        equation: "Derivatives Practice",
        title: "Calculus Limits",
        topic: "Calculus",
        xpAwarded: 20,
        isCorrect: false,
        canRetry: true,
        timeString: "Yesterday",
      },
    ];
  });

  // Arena states
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // Save to localStorage on stats update
  useEffect(() => {
    localStorage.setItem("math_companion_user", JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("math_companion_missions", JSON.stringify(missions));
  }, [missions]);

  // Handler for Successful Step resolution
  const handleSolveSuccess = (xpAwarded: number, solvedEquation: string, solvedTopic: string) => {
    setActiveEquation(null);

    // 1. Update user stats
    setUserData((prev) => {
      let newXp = prev.xp + xpAwarded;
      let newLvl = prev.level;
      let newMaxXp = prev.maxXp;
      let leveledUp = false;

      if (newXp >= prev.maxXp) {
        newXp = newXp - prev.maxXp;
        newLvl += 1;
        newMaxXp = Math.round(newMaxXp * 1.25);
        leveledUp = true;
      }

      const activeRank = Math.max(1, prev.globalRank - Math.floor(Math.random() * 8) - 1);

      if (leveledUp) {
        setTimeout(() => {
          setShowLevelUpAlert(true);
        }, 500);
      }

      return {
        ...prev,
        level: newLvl,
        xp: newXp,
        maxXp: newMaxXp,
        globalRank: activeRank,
      };
    });

    // 2. Increment Daily Quest Progress if applicable
    setQuests((prevQuests) => {
      return prevQuests.map((quest) => {
        if (quest.completed) return quest;
        const updatedProgress = Math.min(quest.target, quest.progress + 1);
        const comp = updatedProgress >= quest.target;
        return {
          ...quest,
          progress: updatedProgress,
          completed: comp,
        };
      });
    });

    // 3. Add to Mission Log scroll items
    const newMission: MissionLogItem = {
      id: `m-solved-${Date.now()}`,
      equation: solvedEquation.length > 25 ? solvedEquation.slice(0, 22) + "..." : solvedEquation,
      title: "Self Resolve",
      topic: solvedTopic,
      xpAwarded: xpAwarded,
      isCorrect: true,
      canRetry: false,
      timeString: "Just Now",
    };

    setMissions((prev) => [newMission, ...prev]);

    // Complete active trigonometry quest indicator locally
    if (solvedTopic === "Geometry") {
      setRecentQuests(prev => prev.map(q => q.subtopic === "Right Triangles" ? { ...q, completed: true } : q));
    }
  };

  // Launch camera scan handler
  const handleScanClick = () => {
    setShowCamera(true);
  };

  // Receive scanned equation parse transition
  const handleSolveEquationParsed = (eqText: string) => {
    setShowCamera(false);
    setActiveEquation(eqText);
  };

  // Launch pre-enrolled Quest solver
  const handleQuestContinueClick = (quest: Quest) => {
    if (quest.category === "Geometry") {
      setActiveEquation("sin(theta) = 3/5");
    } else {
      setActiveEquation("3x + 12 = 30");
    }
  };

  // Handle click on existing failed mission to solve again
  const handleMissionClick = (mission: MissionLogItem) => {
    if (mission.equation.toLowerCase().includes("derivative")) {
      setActiveEquation("limit (x^2 - 4x + 3)/(x - 1) as x approaches 1");
    } else {
      setActiveEquation("2x^2 - 8x + 6 = 0");
    }
  };

  // Handle custom generated AI Arena challenge click
  const handleChallengeGenerated = (challenge: Challenge) => {
    setActiveEquation(challenge.formula);
  };

  // Voice Companion Dictation trigger simulation
  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      alert("🎙️ Companion voice activated! Use microphone inputs in solver sheets to dictate math equations.");
    }
  };

  // Clear/Reset App stats for user ease-of-use
  const handleResetUserData = () => {
    if (confirm("Reset current stats, strengths and streak back to initial layout?")) {
      localStorage.removeItem("math_companion_user");
      localStorage.removeItem("math_companion_missions");
      window.location.reload();
    }
  };

  if (selectedRecentQuest) {
    return (
      <QuestRevisionView
        quest={selectedRecentQuest}
        onClose={() => setSelectedRecentQuest(null)}
        onReviseClick={(equation) => {
          setSelectedRecentQuest(null);
          setActiveEquation(equation);
        }}
      />
    );
  }

  if (showCamera) {
    return (
      <CameraView
        onClose={() => setShowCamera(false)}
        onSolveEquationParsed={handleSolveEquationParsed}
      />
    );
  }

  if (activeEquation) {
    return (
      <SolverView
        equation={activeEquation}
        onClose={() => setActiveEquation(null)}
        onSolveSuccess={handleSolveSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans select-none max-w-[480px] mx-auto border-x border-slate-100 shadow-xl overflow-x-hidden relative">
      {/* Global standard Header and Navigation layouts */}
      <Header
        streak={userData.streak}
        onProfileClick={handleResetUserData}
        onVoiceToggle={handleVoiceToggle}
        voiceActive={voiceActive}
      />

      {/* Main scrolling content frame */}
      <main className="flex-1 px-4 overflow-y-auto">
        {activeTab === "home" && (
          <HomeView
            userData={userData}
            quests={quests}
            recentQuests={recentQuests}
            onScanClick={handleScanClick}
            onQuestContinueClick={handleQuestContinueClick}
            onQuestItemClick={(quest) => setSelectedRecentQuest(quest)}
          />
        )}

        {activeTab === "map" && (
          <MapView
            userData={userData}
            missions={missions}
            onNewQuestionClick={() => setActiveEquation("2x^2 - 8x + 6 = 0")}
            onMissionClick={handleMissionClick}
          />
        )}

        {activeTab === "arena" && (
          <ArenaView
            onChallengeGenerated={handleChallengeGenerated}
            loadingChallenge={loadingChallenge}
            setLoadingChallenge={setLoadingChallenge}
          />
        )}

        {activeTab === "hub" && <HubView />}

        {activeTab === "rank" && <RankView />}
      </main>

      {/* Persistent Bottom Gaming Nav Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-white border-t border-blue-105 py-2.5 px-4 flex items-center justify-around shadow-lg">
        {/* Nav 1: Home */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 cursor-pointer ${
            activeTab === "home" ? "text-brand-primary scale-102 font-black" : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              activeTab === "home" ? "bg-blue-100/60 text-brand-primary" : "text-slate-400"
            }`}
          >
            <Home className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Nav 2: Arena */}
        <button
          onClick={() => setActiveTab("arena")}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 cursor-pointer ${
            activeTab === "arena" ? "text-brand-primary scale-102 font-black" : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              activeTab === "arena" ? "bg-blue-100/60 text-brand-primary" : "text-slate-400"
            }`}
          >
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Arena</span>
        </button>

        {/* Nav 3: Solve (Enlarged Central Action Button) */}
        <button
          onClick={handleScanClick}
          className="relative -mt-6 flex flex-col items-center cursor-pointer group active:scale-95 transition-all flex-1"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl border-4 border-white group-hover:bg-blue-700 transition-all duration-250">
            <Camera className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-black tracking-tight text-blue-600 mt-1">Solve</span>
        </button>

        {/* Nav 4: Hub */}
        <button
          onClick={() => setActiveTab("hub")}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 cursor-pointer ${
            activeTab === "hub" ? "text-brand-primary scale-102 font-black" : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              activeTab === "hub" ? "bg-blue-100/60 text-brand-primary" : "text-slate-400"
            }`}
          >
            <Users className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Hub</span>
        </button>

        {/* Nav 5: Rank */}
        <button
          onClick={() => setActiveTab("rank")}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 cursor-pointer ${
            activeTab === "rank" ? "text-brand-primary scale-102 font-black" : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              activeTab === "rank" ? "bg-blue-100/60 text-brand-primary" : "text-slate-400"
            }`}
          >
            <BarChart2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Rank</span>
        </button>
      </nav>

      {/* LEVEL UP MODAL DIALOG - Delightful celebrate feedback */}
      {showLevelUpAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-blue-700 to-indigo-800 p-6 text-white text-center border-2 border-blue-400 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250">
            {/* Hologram details */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_20px]"></div>

            <div className="relative z-10 space-y-5">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg border-[6px] border-amber-300 animate-bounce">
                <Trophy className="h-10 w-10 fill-amber-300" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-mono">Algebra Alliance</span>
                <h3 className="text-3xl font-black font-sans tracking-tight">LEVEL UP!</h3>
                <p className="text-blue-100 text-sm max-w-[85%] mx-auto leading-relaxed mt-1 font-medium">
                  Incredible! You have masterfully leveled up to <span className="font-bold text-amber-300">Level {userData.level}</span>.
                </p>
              </div>

              {/* Status display list */}
              <div className="bg-white/10 rounded-2xl py-3 px-5 border border-white/10 flex justify-around text-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-200 font-mono uppercase">Level reached</span>
                  <p className="text-xl font-extrabold text-amber-300">{userData.level}</p>
                </div>
                <div className="border-l border-white/10 h-10"></div>
                <div>
                  <span className="text-[10px] font-bold text-blue-200 font-mono uppercase">Active Streak</span>
                  <p className="text-xl font-extrabold text-amber-300">🔥 {userData.streak} Days</p>
                </div>
              </div>

              <button
                onClick={() => setShowLevelUpAlert(false)}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all rounded-full font-black text-slate-950 text-sm tracking-wider uppercase shadow-md cursor-pointer"
              >
                Claim Rewards & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
