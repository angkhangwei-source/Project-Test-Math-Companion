import React from "react";
import { Flame, Mic, User, Award } from "lucide-react";

interface HeaderProps {
  streak: number;
  onProfileClick?: () => void;
  onVoiceToggle?: () => void;
  voiceActive?: boolean;
}

export default function Header({
  streak,
  onProfileClick,
  onVoiceToggle,
  voiceActive = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-blue-100 bg-white px-4 py-3.5 shadow-xs">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2">
        <span className="font-extrabold text-xl tracking-tight text-brand-primary font-sans md:text-2xl">
          MathCompanion
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Streak Flame Container */}
        <div className="flex items-center space-x-1 rounded-full bg-orange-50 px-3 py-1 border border-orange-100 text-brand-secondary">
          <Flame className="h-5 w-5 fill-current animate-pulse text-brand-secondary" />
          <span className="font-bold text-sm tracking-tight">{streak}</span>
        </div>

        {/* Voice Assistant Micro-button click feedback */}
        <button
          onClick={onVoiceToggle}
          className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
            voiceActive
              ? "border-brand-primary bg-blue-50 text-brand-primary ring-2 ring-blue-200"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-primary"
          }`}
          title="Toggle companion voice"
        >
          <Mic className={`h-4.5 w-4.5 ${voiceActive ? "scale-110" : ""}`} />
          {voiceActive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary"></span>
            </span>
          )}
        </button>

        {/* Profile Avatar Trigger Button */}
        <button
          onClick={onProfileClick}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <User className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
