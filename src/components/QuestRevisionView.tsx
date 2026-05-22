import React from "react";
import { ArrowLeft, BookOpen, Award, Sparkles, Clock, CheckCircle2, Play, HelpCircle } from "lucide-react";
import { RecentQuest } from "../types";

interface QuestRevisionViewProps {
  quest: RecentQuest;
  onClose: () => void;
  onReviseClick: (equation: string) => void;
}

export default function QuestRevisionView({
  quest,
  onClose,
  onReviseClick,
}: QuestRevisionViewProps) {
  // Graceful helper functions for robust question lookup
  const getQuestQuestion = (q: RecentQuest) => {
    if (q.question) return q.question;
    if (q.subtopic === "Right Triangles") return "A right triangle has legs of length 3 and 4. Find the length of the hypotenuse c.";
    if (q.subtopic === "Derivatives") return "Find the first derivative of the polynomial f(x) = 3x² + 5x - 2.";
    if (q.subtopic === "Polynomials") return "Factor and solve the polynomial system: x² - 5x + 6 = 0.";
    return `Interactive textbook practice focusing on ${q.category} (${q.subtopic}). Solve the main objective to complete.`;
  };

  const getQuestEquation = (q: RecentQuest) => {
    if (q.equation) return q.equation;
    if (q.subtopic === "Right Triangles") return "3² + 4² = c²";
    if (q.subtopic === "Derivatives") return "d/dx (3x² + 5x - 2)";
    if (q.subtopic === "Polynomials") return "x² - 5x + 6 = 0";
    return "2x² - 8x + 6 = 0";
  };

  const question = getQuestQuestion(quest);
  const equation = getQuestEquation(quest);

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans select-none max-w-[480px] mx-auto border-x border-slate-100 shadow-xl overflow-x-hidden relative">
      {/* Sleek Custom Header */}
      <div className="bg-white border-b border-blue-50 px-4 py-4 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={onClose}
          id="btn-revision-back"
          className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
        </button>
        <h2 className="text-base font-extrabold tracking-tight text-slate-800 font-sans">
          Quest Revision
        </h2>
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600 text-xs font-bold">
          🔥
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-5 space-y-6 pb-24 overflow-y-auto">
        {/* Topic Emblem Header Banner */}
        <div className="flex items-center space-x-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold font-sans text-xl shadow-xs ${
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
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase font-mono">
              {quest.category} Module
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {quest.subtopic}
            </h3>
          </div>
        </div>

        {/* Completion status & Rewards Card */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5 shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Status</p>
              <p className="text-xs font-black text-emerald-600">
                {quest.completed ? "Completed" : "Revision Ready"}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center space-x-2.5 shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Reward</p>
              <p className="text-xs font-black text-amber-600">
                +{quest.xpReward} XP
              </p>
            </div>
          </div>
        </div>

        {/* The Actual Question - Styled like a classroom whiteboard or blueprint */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <BookOpen className="h-4.5 w-4.5 text-blue-500" />
            <span className="text-xs font-bold font-sans tracking-tight">Original Homework Question</span>
          </div>

          <div
            id="revision-question-card"
            className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:14px_14px] text-slate-800 space-y-4"
          >
            <p className="text-[15px] font-bold leading-relaxed text-slate-700">
              {question}
            </p>

            {/* Equation board panel */}
            <div className="bg-slate-900/95 border border-slate-800 text-indigo-200 text-center py-5 px-4 rounded-xl shadow-inner relative overflow-hidden">
              <div className="absolute top-1.5 left-2 text-[8px] font-bold text-slate-500 font-mono tracking-widest uppercase">
                Equation Editor Output
              </div>
              <p className="text-lg font-mono font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300 mt-1">
                {equation}
              </p>
            </div>
          </div>
        </div>

        {/* Informative Help Alert with actionable tips */}
        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 space-y-2 text-blue-900">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h4 className="font-bold text-xs tracking-tight text-blue-800">Why revise this quest?</h4>
          </div>
          <p className="text-xs leading-relaxed text-blue-900 font-medium">
            Active recall is scientifically proven to boost exam test performance! Revise these formulas to lock knowledge into long-term memory.
          </p>
        </div>

        {/* Interactive Solve CTA & Back home button */}
        <div className="space-y-3 pt-4">
          <button
            id="btn-revision-solve"
            onClick={() => onReviseClick(equation)}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 text-white font-extrabold py-4 text-sm shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current text-white" />
            <span>Practice & Solve Again</span>
          </button>

          <button
            id="btn-revision-dismiss"
            onClick={onClose}
            className="w-full text-center font-bold text-xs text-slate-400 hover:text-slate-600 py-2.5 transition-all uppercase tracking-wider cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
