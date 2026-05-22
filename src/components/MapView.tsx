import React from "react";
import { Plus, Trophy, Zap, GraduationCap, CheckCircle, XCircle, ChevronRight, Award } from "lucide-react";
import { UserData, MissionLogItem } from "../types";

interface MapViewProps {
  userData: UserData;
  missions: MissionLogItem[];
  onNewQuestionClick: () => void;
  onMissionClick?: (mission: MissionLogItem) => void;
}

export default function MapView({
  userData,
  missions,
  onNewQuestionClick,
  onMissionClick,
}: MapViewProps) {
  // Map Level dial progress calculation:
  const xlProgressPct = Math.round((userData.xp / userData.maxXp) * 100);

  // Hardcode prebuilt Skill Trees matching Screen A
  const skillTrees = [
    { name: "Algebra", level: 5, progress: 75, colorClass: "bg-blue-600", accentBorder: "border-blue-500" },
    { name: "Geometry", level: 3, progress: 40, colorClass: "bg-gradient-to-r from-lime-500 to-green-600", accentBorder: "border-lime-500" },
    { name: "Calculus", level: 1, progress: 10, colorClass: "bg-amber-500", accentBorder: "border-amber-500" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Title Mastery header */}
      <div className="mt-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
          Your Mastery Map
        </h1>
        <p className="text-xs font-semibold text-slate-500 font-mono mt-0.5">
          GLOBAL RANK: #{userData.globalRank || 142}
        </p>
      </div>

      {/* Mastery Map Card - Sleek soft light blue container */}
      <div className="relative rounded-2xl border border-blue-50 bg-brand-container p-5 shadow-xs overflow-hidden">
        {/* Streak Flame Banner in card */}
        <div className="absolute top-5 right-5 flex items-center space-x-1 rounded-full bg-orange-100 px-3 py-1 border border-orange-200 text-orange-700">
          <span className="text-xs font-bold font-sans">🔥 {userData.streak} Day Streak</span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Mastery Map
        </h2>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">
          Global Rank
        </p>

        {/* Diagnostic Circular Meter Display & Progress stats side-by-side */}
        <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Circular level indicator with custom border line */}
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-sm border-[5px] border-blue-100">
            {/* SVG circle stroke representing level completion dial */}
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-blue-600 stroke-[6px]"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - userData.xp / userData.maxXp)}`}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Content circle badge */}
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-blue-600 leading-none">
                {userData.level}
              </span>
              <div className="mt-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                LVL
              </div>
            </div>
          </div>

          {/* XP Progress detail labels */}
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              XP Progress
            </p>
            <p className="text-2xl font-black text-slate-800">
              {userData.xp.toLocaleString()} <span className="text-slate-400 text-lg font-bold">/ {userData.maxXp.toLocaleString()} XP</span>
            </p>
            <p className="text-xs font-semibold text-slate-500 italic">
              {userData.maxXp - userData.xp} XP needed to Level Up!
            </p>
          </div>
        </div>

        {/* Primary Click button: + New Question */}
        <button
          onClick={onNewQuestionClick}
          className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>New Question</span>
        </button>
      </div>

      {/* Skill Trees Section */}
      <div className="space-y-3.5">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
          Skill Trees
        </h3>

        <div className="space-y-3">
          {skillTrees.map((tree) => (
            <div
              key={tree.name}
              className={`rounded-xl border-l-[6px] ${tree.accentBorder} bg-white p-4 shadow-2xs`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#0b1c30] text-base font-sans capitalize">
                  {tree.name}
                </span>
                <span className="text-xs font-semibold text-slate-550 font-mono tracking-wide">
                  Level {tree.level}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${tree.progress}%` }}
                  className={`h-full rounded-full ${tree.colorClass}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Badges Row Section */}
      <div className="space-y-3.5">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
          Recent Badges
        </h3>

        {/* 3 custom gamification badges */}
        <div className="grid grid-cols-3 gap-3">
          {/* Badge 1: First Win */}
          <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-slate-100 text-center shadow-2xs hover:scale-105 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Trophy className="h-6 w-6 stroke-[1.8] fill-rose-50" />
            </div>
            <span className="mt-2.5 text-xs font-black text-slate-800 tracking-tight font-sans">
              First Win
            </span>
          </div>

          {/* Badge 2: Speed Demon */}
          <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-slate-100 text-center shadow-2xs hover:scale-105 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Zap className="h-6 w-6 stroke-[1.8] fill-amber-50" />
            </div>
            <span className="mt-2.5 text-xs font-black text-slate-800 tracking-tight font-sans">
              Speed Demon
            </span>
          </div>

          {/* Badge 3: Scholar */}
          <div className="flex flex-col items-center rounded-xl bg-white p-3.5 border border-slate-100 text-center shadow-2xs hover:scale-105 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <GraduationCap className="h-6 w-6 stroke-[1.8]" />
            </div>
            <span className="mt-2.5 text-xs font-black text-slate-800 tracking-tight font-sans">
              Scholar
            </span>
          </div>
        </div>
      </div>

      {/* Mission Log Column Items */}
      <div className="space-y-3.5">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
          Mission Log
        </h3>

        <div className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              onClick={() => mission.canRetry && onMissionClick?.(mission)}
              className={`flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-2xs transition-all ${
                mission.canRetry ? "hover:border-blue-200 cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center space-x-3.5">
                {/* Solved Status Emblem design */}
                {mission.isCorrect ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5 fill-green-50" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <XCircle className="h-5 w-5 fill-red-50" />
                  </div>
                )}

                <div>
                  <h4 className="font-extrabold text-slate-900 text-[15px] tracking-tight">
                    {mission.equation}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">
                    {mission.topic} •{" "}
                    {mission.isCorrect ? (
                      <span className="text-green-650 font-bold">+{mission.xpAwarded} XP</span>
                    ) : (
                      <span className="text-red-500 font-bold">Retry Available</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Timestamp value strings */}
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 font-mono uppercase">
                  {mission.timeString}
                </p>
                {mission.canRetry && (
                  <span className="inline-flex items-center text-xs font-extrabold text-brand-primary mt-1">
                    Solve now <ChevronRight className="h-3 w-3 ml-0.5" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
