import React from "react";
import { Camera, ArrowRight, Star, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { UserData, Quest, RecentQuest } from "../types";

interface HomeViewProps {
  userData: UserData;
  quests: Quest[];
  recentQuests: RecentQuest[];
  onScanClick: () => void;
  onQuestContinueClick: (quest: Quest) => void;
  onQuestItemClick?: (recent: RecentQuest) => void;
}

export default function HomeView({
  userData,
  quests,
  recentQuests,
  onScanClick,
  onQuestContinueClick,
  onQuestItemClick,
}: HomeViewProps) {
  // Let's filter active daily quests
  const dailyQuest = quests[0] || {
    id: "dq-1",
    category: "Geometry",
    description: "Solve 3 Geometry problems",
    progress: 2,
    target: 3,
    xpReward: 150,
    completed: false,
  };

  const progressPercent = Math.min(100, Math.round((dailyQuest.progress / dailyQuest.target) * 100));

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Greetings Section */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
            Level {userData.level} Explorer
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Hello, {userData.name}!
          </h1>
        </div>
        {/* Playful streak count banner */}
        <div className="rounded-full bg-orange-500 text-white px-4 py-1.5 flex items-center space-x-1.5 shadow-sm font-bold text-xs font-sans tracking-wide">
          <span>🔥</span>
          <span>{userData.streak} Day Streak</span>
        </div>
      </div>

      {/* Main Scan Banner Action Card - Immersive Modern Playful Gradient */}
      <div 
        onClick={onScanClick}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-7 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        {/* Background micro grid design for high tech design */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Playful rounded circle camera badge */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs">
              <Camera className="h-6 w-6 stroke-[2]" />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            Scan a New Problem
          </h2>
          <p className="text-blue-100 text-sm max-w-[85%] leading-relaxed font-medium">
            Got stuck? Snap a pic of any equation and let's solve it together step-by-step.
          </p>
        </div>

        <div className="mt-6 flex">
          <button className="flex items-center space-x-2 rounded-full bg-white/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/30 backdrop-blur-xs active:bg-white/40 transition-all cursor-pointer">
            <span>Try it now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Daily Quest Section */}
      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <Star className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm font-sans tracking-tight">
              Daily Quest
            </span>
          </div>
          {/* XP Reward Indicator Badge */}
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700 tracking-wide">
            {dailyQuest.xpReward} XP Reward
          </span>
        </div>

        <p className="text-[17px] font-bold text-slate-900 mb-4">
          {dailyQuest.description}
        </p>

        {/* Custom Progress slide-bar with tactile layout */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden relative">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-lime-500 transition-all duration-500 relative"
            >
              {/* Shiny Shimmer highlight */}
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="font-mono text-xs font-extrabold text-slate-500">
              {dailyQuest.progress}/{dailyQuest.target}
            </span>
          </div>
        </div>

        {/* Action Button: Continue Quest */}
        <button
          onClick={() => onQuestContinueClick(dailyQuest)}
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          <span>Continue Quest</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Recent Quests Log Column */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
          Recent Quests
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Quests & Completed List mapped */}
          {recentQuests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => onQuestItemClick?.(quest)}
              className="relative flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-2xs hover:border-blue-200 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                {/* Category Icon Emblem shape */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold font-sans text-lg ${
                    quest.category.toLowerCase() === "calculus"
                      ? "bg-purple-100 text-purple-700"
                      : quest.category.toLowerCase() === "algebra"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {quest.category === "Calculus" ? "∫" : quest.category === "Algebra" ? "Σ" : "⏃"}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                    {quest.category}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">{quest.subtopic}</p>
                </div>
              </div>

              {/* Reward Check Indicator or Time stamp */}
              <div className="flex flex-col items-end space-y-1">
                <span className={`text-xs font-extrabold ${quest.completed ? "text-green-600" : "text-brand-primary"}`}>
                  +{quest.xpReward} XP
                </span>
                <div className="flex items-center space-x-1.5">
                  {quest.completed ? (
                    <CheckCircle className="h-4.5 w-4.5 text-green-500 fill-green-50" />
                  ) : quest.timeString ? (
                    <div className="flex items-center text-slate-400 space-x-0.5">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-semibold">{quest.timeString}</span>
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
