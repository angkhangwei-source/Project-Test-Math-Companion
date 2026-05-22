import React, { useState } from "react";
import { ArrowUp, ArrowDown, Minus, Crown, Star, Award, TrendingUp } from "lucide-react";
import { LeaderboardUser } from "../types";

export default function RankView() {
  // Tab states: Group vs Global
  const [activeTab, setActiveTab] = useState<"group" | "global">("group");
  // Period states: Day vs Week vs Month
  const [period, setPeriod] = useState<"Day" | "Week" | "Month">("Day");

  // Group Leaderboard data (Algebra Alliance - Screen F)
  const groupPodium: LeaderboardUser[] = [
    { rank: 2, name: "Emma W.", xp: 850, avatarSeed: "emma", arrowStatus: "up", changeAmount: 1 },
    { rank: 1, name: "Alex B.", xp: 1200, avatarSeed: "alexb", arrowStatus: "flat" },
    { rank: 3, name: "You", xp: 720, avatarSeed: "you", arrowStatus: "down", changeAmount: 2, isCurrentUser: true },
  ];

  const groupRows: LeaderboardUser[] = [
    { rank: 4, name: "Liam T.", xp: 550, avatarSeed: "liam", arrowStatus: "up", changeAmount: 1 },
    { rank: 5, name: "Samir K.", xp: 490, avatarSeed: "samir", arrowStatus: "down", changeAmount: 1 },
    { rank: 6, name: "Chloe M.", xp: 420, avatarSeed: "chloe", arrowStatus: "flat" },
  ];

  // Global Arena Leaderboard data (Global Arena - Screen H)
  const globalPodium: LeaderboardUser[] = [
    { rank: 2, name: "Alex K.", xp: 8420, avatarSeed: "alexk", arrowStatus: "flat" },
    { rank: 1, name: "Mia S.", xp: 9150, avatarSeed: "mias", arrowStatus: "up" },
    { rank: 3, name: "Leo T.", xp: 7890, avatarSeed: "leot", arrowStatus: "down" },
  ];

  const globalRows: LeaderboardUser[] = [
    { rank: 4, name: "Samir R.", xp: 7120, avatarSeed: "samirr", arrowStatus: "up" },
    { rank: 5, name: "Emma W.", xp: 6950, avatarSeed: "emmaw", arrowStatus: "up" },
    { rank: 6, name: "Yuki M.", xp: 6420, avatarSeed: "yukim", arrowStatus: "flat" },
  ];

  const activePodium = activeTab === "group" ? groupPodium : globalPodium;
  const activeRows = activeTab === "group" ? groupRows : globalRows;

  // Render index status flags helper
  const renderStatus = (user: LeaderboardUser) => {
    if (user.arrowStatus === "up") {
      return (
        <span className="flex items-center text-xs font-bold text-green-600 gap-0.5 font-mono">
          <ArrowUp className="h-3 w-3 stroke-[3]" />
          {user.changeAmount || 1}
        </span>
      );
    }
    if (user.arrowStatus === "down") {
      return (
        <span className="flex items-center text-xs font-bold text-red-500 gap-0.5 font-mono">
          <ArrowDown className="h-3 w-3 stroke-[3]" />
          {user.changeAmount || 1}
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-400">
        <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Upper Segment Toggler: Algebra Alliance vs Global Arena */}
      <div className="flex rounded-full bg-slate-100 p-1 border border-slate-200 mt-4">
        <button
          onClick={() => setActiveTab("group")}
          className={`flex-1 rounded-full py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === "group" ? "bg-white text-brand-primary shadow-2xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Alliance Group
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 rounded-full py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === "global" ? "bg-white text-brand-primary shadow-2xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Global Arena
        </button>
      </div>

      {/* Dynamic Title Headers depends on navigation tabs selected */}
      <div className="text-center space-y-0.5">
        <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
          {activeTab === "group" ? "Algebra Alliance" : "Global Arena"}
        </h1>
        <p className="text-xs font-semibold text-slate-500 tracking-wide font-sans uppercase">
          {activeTab === "group" ? "Group Rankings & Progress" : "Top Mathletes of the Week"}
        </p>
      </div>

      {/* Alliance specific Segment selectors: Day/Week/Month */}
      {activeTab === "group" && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-blue-50/50 p-1 border border-blue-105">
            {(["Day", "Week", "Month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-6 py-1.5 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  period === p ? "bg-brand-primary text-white shadow-3xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 3D Podium Layout Slots exactly as in mockups */}
      <div className="flex items-end justify-center pt-8 pb-3 px-1">
        {/* Rank 2 (Silver - Left) */}
        {activePodium[0] && (
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            {/* Crown or trend icon */}
            <div className="flex items-center text-xs text-green-600 space-x-0.5 font-bold font-mono mb-1.5 animate-bounce">
              <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              <span>1</span>
            </div>
            {/* Avatar block with badge indicator */}
            <div className="relative mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 border-[3px] border-slate-300 font-bold uppercase text-slate-700 shadow-sm text-sm">
                {activePodium[0].name.slice(0, 2)}
              </div>
              <span className="absolute -bottom-1.5 -right-1 text-[11px] font-black w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center border-2 border-white">
                2
              </span>
            </div>
            {/* Stats */}
            <h4 className="font-extrabold text-[13px] text-slate-800 tracking-tight text-center truncate w-full">
              {activePodium[0].name}
            </h4>
            <p className="text-[10px] font-extrabold text-orange-600 font-mono">
              {activePodium[0].xp.toLocaleString()} XP
            </p>
            {/* 3D Platform box */}
            <div className="mt-2.5 h-16 w-full rounded-t-xl bg-slate-100 border-t border-x border-slate-200/50 shadow-inner flex items-center justify-center"></div>
          </div>
        )}

        {/* Rank 1 (Gold - Center High) */}
        {activePodium[1] && (
          <div className="flex flex-col items-center flex-1 max-w-[124px] z-10 -mx-1.5">
            {/* Gold Crown outline symbol */}
            <Crown className="h-6 w-6 text-amber-500 fill-amber-300 animate-pulse mb-1.5" />
            
            {/* Avatar block with target badge overlay */}
            <div className="relative mb-3">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-amber-50 border-[4px] border-amber-400 font-bold uppercase text-amber-800 shadow-md text-base">
                {activePodium[1].name.slice(0, 2)}
              </div>
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 text-xs font-black w-6 h-6 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center border-2 border-white shadow-xs">
                1
              </span>
            </div>
            {/* Stats */}
            <h4 className="font-black text-[15px] text-slate-950 tracking-tight text-center truncate w-full">
              {activePodium[1].name}
            </h4>
            <p className="text-xs font-extrabold text-orange-600 font-mono">
              {activePodium[1].xp.toLocaleString()} XP
            </p>
            {/* 3D Platform box */}
            <div className="mt-3.5 h-[92px] w-full rounded-t-2xl bg-blue-100 border-t-2 border-x border-blue-200/50 shadow-inner flex items-center justify-center relative">
              {/* Star decal decoration on 1st place podium */}
              <Star className="absolute top-4 h-6 w-6 text-blue-400 fill-blue-300" />
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze - Right) */}
        {activePodium[2] && (
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            {/* Down trend line indicator */}
            <div className="flex items-center text-xs text-red-500 space-x-0.5 font-bold font-mono mb-1.5">
              <ArrowDown className="h-3 w-3 stroke-[2.5]" />
              <span>2</span>
            </div>
            {/* Avatar block with indicator badge */}
            <div className="relative mb-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] font-bold uppercase shadow-sm text-sm ${
                activePodium[2].isCurrentUser 
                  ? "bg-blue-600 text-white border-blue-500" 
                  : "bg-orange-50 text-orange-700 border-orange-300"
              }`}>
                {activePodium[2].name.slice(0, 2)}
              </div>
              <span className="absolute -bottom-1.5 -right-1 text-[11px] font-black w-5 h-5 rounded-full bg-orange-300 text-orange-950 flex items-center justify-center border-2 border-white">
                3
              </span>
            </div>
            {/* Stats */}
            <h4 className={`font-extrabold text-[13px] tracking-tight text-center truncate w-full ${
              activePodium[2].isCurrentUser ? "text-blue-600" : "text-slate-800"
            }`}>
              {activePodium[2].name === "You" ? "You" : activePodium[2].name}
            </h4>
            <p className="text-[10px] font-extrabold text-orange-600 font-mono">
              {activePodium[2].xp.toLocaleString()} XP
            </p>
            {/* 3D Platform box */}
            <div className="mt-2.5 h-[52px] w-full rounded-t-xl bg-slate-50 border-t border-x border-slate-200/50 shadow-inner flex items-center justify-center"></div>
          </div>
        )}
      </div>

      {/* Leaderboard user rows log container */}
      <div className="space-y-2">
        {activeRows.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between rounded-xl border p-4.5 shadow-2xs ${
              user.isCurrentUser
                ? "bg-blue-50/50 border-blue-200"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Numerical rank index */}
              <span className="w-5 font-mono text-sm font-black text-slate-400">{user.rank}</span>

              {/* Minimalist gamer circle design */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-150 text-slate-700 font-extrabold text-xs uppercase border border-slate-200">
                {user.name.slice(0, 2)}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-800 text-[14px] tracking-tight">
                  {user.name}
                </h4>
                <p className="text-xs font-semibold font-mono text-orange-600">
                  {user.xp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* UP/DOWN arrow indicators index status */}
            <div>{renderStatus(user)}</div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Stats alert card solely inside Global Arena tab (Screen H) */}
      {activeTab === "global" && (
        <div className="fixed bottom-[74px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-40">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white shadow-xl flex items-center justify-between border border-blue-500 animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xs">
                <Award className="h-5.5 w-5.5 text-amber-300 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-blue-200">Your Rank</span>
                <p className="text-lg font-black tracking-tight font-sans">#142</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] uppercase font-bold text-blue-200">Current XP</span>
              <p className="text-lg font-black font-mono">3,450 XP</p>
              <div className="flex items-center text-emerald-300 text-[10px] font-bold tracking-tight justify-end mt-0.5 animate-pulse">
                <TrendingUp className="h-3 w-3 mr-0.5 stroke-[2.5]" />
                <span>+4 places today</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
