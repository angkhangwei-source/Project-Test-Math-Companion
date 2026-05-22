import React, { useState, useEffect } from "react";
import { Home, Map as MapIcon, Trophy, Dumbbell, Users, BarChart2, Flame, RefreshCw, X, Camera, Database, AlertTriangle, Check, MessageSquare } from "lucide-react";
import { UserData, Quest, RecentQuest, MissionLogItem, Challenge } from "./types";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import MapView from "./components/MapView";
import ArenaView from "./components/ArenaView";
import SocialView from "./components/SocialView";
import RankView from "./components/RankView";
import CameraView from "./components/CameraView";
import SolverView from "./components/SolverView";
import QuestRevisionView from "./components/QuestRevisionView";
import { supabase, mapEntryToMission, insertMissionToSupabase } from "./lib/supabase";

export default function App() {
  // Navigation active tab: "home" | "map" | "arena" | "social" | "rank"
  const [activeTab, setActiveTab] = useState<"home" | "map" | "arena" | "social" | "rank">("home");

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

  // Mission Log State mirroring Screen A list items exactly, with Supabase live sync & localStorage fallback
  const [missions, setMissions] = useState<MissionLogItem[]>(() => {
    try {
      const saved = localStorage.getItem("math_companion_missions");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load initial missions from localStorage:", e);
    }
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

  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Arena states
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  const loadSupabaseData = async () => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching entries from Supabase:", error.message);
        setSupabaseErrorMsg(error.message);
      } else {
        setSupabaseErrorMsg(null);
        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} entries from Supabase.`);
          setMissions(data.map(mapEntryToMission));
        } else {
          console.log("No entries in Supabase 'entries' table yet. Showing default missions.");
        }
      }
    } catch (err) {
      console.error("Failed to connect to Supabase for initial load:", err);
      setSupabaseErrorMsg(String(err));
    }
  };

  // Load initial entries from Supabase + Subscribe to real-time updates
  useEffect(() => {
    loadSupabaseData();

    // Setup real-time postgres changes channel listener
    const entriesChannel = supabase
      .channel("public-entries-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "entries",
        },
        (payload) => {
          console.log("Real-time postgres change event:", payload);
          if (payload.eventType === "INSERT") {
            const newMission = mapEntryToMission(payload.new);
            setMissions((prev) => {
              // Deduplicate inserts
              if (prev.some((m) => m.id === newMission.id || (m.equation === newMission.equation && m.topic === newMission.topic))) {
                return prev;
              }
              return [newMission, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedMission = mapEntryToMission(payload.new);
            setMissions((prev) =>
              prev.map((m) => (m.id === updatedMission.id ? updatedMission : m))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = String(payload.old?.id);
            setMissions((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(entriesChannel);
    };
  }, []);

  // Save userData to localStorage on stats update
  useEffect(() => {
    localStorage.setItem("math_companion_user", JSON.stringify(userData));
  }, [userData]);

  // Save missions to localStorage to guarantee robust offline/local fallback
  useEffect(() => {
    try {
      localStorage.setItem("math_companion_missions", JSON.stringify(missions));
    } catch (e) {
      console.warn("Failed to write missions to localStorage:", e);
    }
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
    
    // Publishes the new entry to Supabase Postgres real-time study feed
    insertMissionToSupabase(newMission);

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

      {/* Supabase UI warning is hidden from active viewport as requested */}
      {false && supabaseErrorMsg && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 space-y-3 shadow-xs">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm tracking-tight text-rose-800">
                Supabase Setup Error
              </h4>
              <p className="text-xs text-rose-700/95 leading-relaxed mt-1 font-medium font-mono whitespace-pre-wrap break-words">
                {supabaseErrorMsg}
              </p>
            </div>
            <button 
              onClick={() => setSupabaseErrorMsg(null)}
              className="p-1 rounded-md text-rose-400 hover:bg-rose-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="text-xs text-slate-700 space-y-2 pt-1 border-t border-rose-200/50">
            <div className="flex items-center space-x-1 font-bold text-slate-850">
              <Database className="h-3.5 w-3.5 text-blue-500" />
              <span>Fix: Run this query in Supabase SQL Editor</span>
            </div>

            <div className="relative rounded bg-slate-900 text-slate-350 p-2.5 font-mono text-[9px] max-h-36 overflow-y-auto leading-relaxed select-text select-all">
              <pre className="whitespace-pre-wrap break-all">
{`CREATE TABLE public.entries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  equation text NOT NULL,
  title text DEFAULT 'Self Resolve',
  topic text DEFAULT 'Algebra',
  "xpAwarded" int8 DEFAULT 45,
  "isCorrect" bool DEFAULT true,
  "canRetry" bool DEFAULT false,
  "timeString" text DEFAULT 'Just Now',
  created_at timestamptz DEFAULT now()
);

-- Enable Realtime
alter publication supabase_realtime add table entries;`}
              </pre>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const sql = `CREATE TABLE public.entries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  equation text NOT NULL,
  title text DEFAULT 'Self Resolve',
  topic text DEFAULT 'Algebra',
  "xpAwarded" int8 DEFAULT 45,
  "isCorrect" bool DEFAULT true,
  "canRetry" bool DEFAULT false,
  "timeString" text DEFAULT 'Just Now',
  created_at timestamptz DEFAULT now()
);

-- Enable Realtime
alter publication supabase_realtime add table entries;`;
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="flex-1 py-1 px-2.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-1"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <span>Copy SQL Code</span>
                )}
              </button>

              <button
                onClick={() => {
                  loadSupabaseData();
                }}
                className="flex-1 py-1 px-2.5 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center space-x-1"
              >
                <RefreshCw className="h-3 w-3 animate-spin duration-3000" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

        {activeTab === "social" && <SocialView />}

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

        {/* Nav 4: Social */}
        <button
          onClick={() => setActiveTab("social")}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 cursor-pointer ${
            activeTab === "social" ? "text-brand-primary scale-102 font-black" : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              activeTab === "social" ? "bg-blue-100/60 text-brand-primary" : "text-slate-400"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Social</span>
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
