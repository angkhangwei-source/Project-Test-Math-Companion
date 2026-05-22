import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus, Send, Hand, Users, Sparkles } from "lucide-react";
import { Friend, ClassInfo } from "../types";

export default function HubView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<ClassInfo[]>([
    {
      id: "cls-1",
      name: "Algebra I",
      teacher: "Mr. Henderson",
      period: "Period 3",
      activeUnit: "Unit 4: Linear Equations",
      progress: 75,
      rankInClass: 4,
    },
    {
      id: "cls-2",
      name: "Geometry",
      teacher: "Ms. Davis",
      period: "Period 5",
      activeUnit: "Unit 2: Proofs",
      progress: 40,
      rankInClass: 12,
    },
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    {
      id: "fr-1",
      name: "Alex R.",
      level: 12,
      status: "active",
      avatarSeed: "alexr",
    },
    {
      id: "fr-2",
      name: "Jamie T.",
      level: 9,
      status: "offline",
      timeString: "2h ago",
      avatarSeed: "jamiet",
    },
  ]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");

  const handleWave = (friendId: string, name: string) => {
    alert(`👋 You waved to ${name}! They've been alerted.`);
  };

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    
    // Generate a classroom item
    const newClass: ClassInfo = {
      id: `cls-${Date.now()}`,
      name: `${classCode.toUpperCase()} - Advanced Calculus`,
      teacher: "Dr. Peterson",
      period: "Period 1",
      activeUnit: "Unit 1: Introductions",
      progress: 10,
      rankInClass: 25,
    };

    setClasses([...classes, newClass]);
    setClassCode("");
    setShowJoinModal(false);
    alert("🎉 Successfully joined class!");
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Friends list card layout matching Screen G */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans mt-4">
          Friends
        </h2>

        {/* Searching bar overlay */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-2 px-10 text-sm focus:border-brand-primary focus:outline-hidden"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 cursor-pointer">
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Friend line items */}
        <div className="space-y-2.5">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center space-x-3.5">
                {/* Simulated high fidelity colorful gamer bubble */}
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-black text-sm tracking-tight border border-blue-200 uppercase">
                    {friend.name.slice(0, 2)}
                  </div>
                  {/* Active dot Indicator pill */}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      friend.status === "active" ? "bg-green-500" : "bg-slate-400"
                    }`}
                  ></span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{friend.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 font-mono">
                    ⚡ Lvl {friend.level} {friend.timeString ? `• Last active ${friend.timeString}` : ""}
                  </p>
                </div>
              </div>

              {/* Waver button / direct chat pings */}
              <button
                onClick={() => handleWave(friend.id, friend.name)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand-primary border border-blue-100 hover:bg-blue-100 cursor-pointer active:scale-95 transition-all"
                title="Send active wave alert"
              >
                {friend.status === "active" ? (
                  <Hand className="h-4 w-4 transform hover:rotate-12 transition-transform" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-slate-500" />
                )}
              </button>
            </div>
          ))}
          {filteredFriends.length === 0 && (
            <p className="text-center text-xs font-semibold text-slate-400 py-4">No friends found.</p>
          )}
        </div>
      </div>

      {/* Classroom sections log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            My Classes
          </h2>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center space-x-1.5 rounded-full bg-orange-50 px-4 py-2 border border-orange-150 text-xs font-black uppercase tracking-wider text-brand-secondary hover:bg-orange-100 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Join Class</span>
          </button>
        </div>

        {/* List of class enrollment card details exactly matching layout */}
        <div className="space-y-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="relative rounded-2xl bg-white p-5 border border-slate-100 shadow-2xs space-y-4 overflow-hidden"
            >
              {/* Decorative top colored border bar */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${
                  cls.name.includes("Algebra") ? "bg-blue-600" : "bg-orange-800"
                }`}
              ></div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-sans tracking-tight">
                    {cls.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {cls.teacher} • {cls.period}
                  </p>
                </div>
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700 tracking-tight">
                  Rank #{cls.rankInClass}
                </span>
              </div>

              {/* Progress and active curriculum topic bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 font-sans">{cls.activeUnit}</span>
                  <span className="text-slate-500 font-mono">{cls.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${cls.progress}%` }}
                    className={`h-full rounded-full ${
                      cls.name.includes("Algebra")
                        ? "bg-gradient-to-r from-green-400 to-lime-500"
                        : "bg-orange-600"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classroom enrollment trigger modal popup */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-150 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
              Join Academic Class
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter the unique reference code provided by your math educator to synchronize homework, assignments, and school leaderboards.
            </p>

            <form onSubmit={handleJoinClass} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono mb-1.5">
                  Classroom Entry Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ALG-HON-P3"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4.5 py-3 text-sm focus:border-brand-primary focus:outline-hidden font-bold tracking-wider placeholder:font-normal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="rounded-xl border border-slate-150 bg-white px-4 py-2.5 text-xs font-bold text-slate-550 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-primary px-4.5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-750 cursor-pointer"
                >
                  Sync Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
