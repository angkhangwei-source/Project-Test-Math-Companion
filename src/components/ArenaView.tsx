import React, { useState } from "react";
import { Cpu, BookOpen, Settings, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Challenge } from "../types";

interface ArenaViewProps {
  onChallengeGenerated: (challenge: Challenge) => void;
  loadingChallenge: boolean;
  setLoadingChallenge: (val: boolean) => void;
}

export default function ArenaView({
  onChallengeGenerated,
  loadingChallenge,
  setLoadingChallenge,
}: ArenaViewProps) {
  // Focus area toggler local state
  const [focusArea, setFocusArea] = useState<"Mixed" | "Weaknesses" | "New Topics">("Mixed");
  // Difficulty toggler local state
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Hard");

  const handleGenerateAIChallenge = async () => {
    setLoadingChallenge(true);
    try {
      const topicOption = focusArea === "Mixed" ? "Algebra" : focusArea;
      const response = await fetch("/api/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicOption,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();
      if (data.success && data.challenge) {
        onChallengeGenerated(data.challenge);
      } else {
        alert(data.error || "Failed to generate AI challenge. Please check your Gemini API configuration.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error generating challenge context on server. Make sure server is running and API key is set.");
    } finally {
      setLoadingChallenge(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Practice Arena Intro headlines */}
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Practice Arena
        </h1>
        <p className="text-sm font-semibold text-slate-500 leading-relaxed mt-1 max-w-[90%]">
          Ready to level up your math skills? Choose your challenge model.
        </p>
      </div>

      {/* Main Mode select grid columns */}
      <div className="space-y-4">
        {/* Card 1: AI Challenges (NEW) - high engagement blue vertical banner layout */}
        <div
          onClick={loadingChallenge ? undefined : handleGenerateAIChallenge}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
        >
          {loadingChallenge && (
            <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-15 backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <span className="text-xs font-bold font-mono tracking-wider">GENERATING CHALLENGE...</span>
            </div>
          )}

          {/* New star tag */}
          <div className="absolute top-5 right-5 rounded-full bg-blue-500/30 border border-blue-400 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
            NEW
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-xs mb-4">
            <Cpu className="h-5.5 w-5.5" />
          </div>

          <h3 className="text-xl font-extrabold font-sans">AI Challenges</h3>
          <p className="text-blue-100 text-xs mt-1.5 max-w-[85%] font-medium leading-relaxed">
            Dynamic algebraic or geometric questions tailored specifically to your active mastery level.
          </p>
          
          <div className="mt-4 flex items-center text-xs font-extrabold text-orange-200 space-x-1 uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>Click to enter match</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Past Papers - plain clean slate outline card */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs hover:border-blue-100 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
          <div className="flex items-start space-x-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <BookOpen className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0b1c30] text-base font-sans mt-0.5">
                Past Papers
              </h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mt-0.5">
                Simulate real exams with historical test sets.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Recommended metric tables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
            Recommended for You
          </h3>
          <button className="text-xs font-bold text-brand-primary uppercase tracking-wide hover:underline cursor-pointer">
            See All
          </button>
        </div>

        <div className="space-y-3 bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xs">
          {/* Skill progress 1: Algebra */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-850 font-sans">Algebra</span>
              <span className="text-[10px] font-extrabold text-slate-500 font-mono">75% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-400 w-[75%]"></div>
            </div>
          </div>

          {/* Skill progress 2: Geometry */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-850 font-sans">Geometry</span>
              <span className="text-[10px] font-extrabold text-slate-500 font-mono">40% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-orange-400 w-[40%]"></div>
            </div>
          </div>

          {/* Skill progress 3: Calculus */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-850 font-sans">Calculus</span>
              <span className="text-[10px] font-extrabold text-slate-500 font-mono">10% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-orange-600 w-[10%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration pills card exactly matching the layout on Screen E */}
      <div className="rounded-2xl border border-blue-50 bg-blue-50/40 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-4.5 w-4.5 text-slate-605" />
          <h3 className="font-extrabold text-slate-900 text-sm font-sans tracking-tight uppercase">
            Configuration
          </h3>
        </div>

        {/* Option 1: Focus Area (Mixed vs Weaknesses vs New Topics) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            Focus Area
          </label>
          <div className="flex flex-wrap gap-2">
            {(["Mixed", "Weaknesses", "New Topics"] as const).map((area) => (
              <button
                key={area}
                onClick={() => setFocusArea(area)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all border duration-200 cursor-pointer ${
                  focusArea === area
                    ? "bg-brand-primary border-brand-primary text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Option 2: Difficulty Level (Easy vs Medium vs Hard) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            Difficulty Level
          </label>
          <div className="flex flex-wrap gap-2">
            {(["Easy", "Medium", "Hard"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all border duration-200 cursor-pointer ${
                  difficulty === diff
                    ? "bg-[#9d4300] border-[#9d4300] text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
