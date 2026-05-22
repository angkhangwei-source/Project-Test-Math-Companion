import React, { useState } from "react";
import { X, Bolt, History, Image as ImageIcon, Sparkles } from "lucide-react";
import { Challenge } from "../types";

interface CameraViewProps {
  onClose: () => void;
  onSolveEquationParsed: (eqText: string, imgBase64?: string) => void;
}

export default function CameraView({
  onClose,
  onSolveEquationParsed,
}: CameraViewProps) {
  const [flashOn, setFlashOn] = useState(false);
  const [customEquationInput, setCustomEquationInput] = useState("");

  // Sample handwritten problem cards to simulate real user-snapped notebooks matching Screen C
  const recentScansSample = [
    {
      id: "scan-1",
      title: "Quadratic Equation",
      equation: "2x^2 - 8x + 6 = 0",
      imageDescription: "Notebook scan with quadratic graph",
    },
    {
      id: "scan-2",
      title: "Algebra System",
      equation: "3x + y = 13",
      imageDescription: "System of linear formulations",
    },
    {
      id: "scan-3",
      title: "Calculus Limits",
      equation: "limit (x^2 - 4x + 3)/(x - 1) as x approaches 1",
      imageDescription: "Handwritten derivative limits",
    },
    {
      id: "scan-4",
      title: "Trig Right Triangle",
      equation: "sin(theta) = 3/5",
      imageDescription: "Notebook doodle of triangle",
    },
  ];

  const handleShutterTrigger = () => {
    // If user enters custom input, use that
    if (customEquationInput.trim()) {
      onSolveEquationParsed(customEquationInput);
    } else {
      // Pick the first default quadratic scan
      onSolveEquationParsed("2x^2 - 8x + 6 = 0");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white overflow-hidden max-w-[480px] mx-auto">
      {/* Top action header */}
      <div className="flex items-center justify-between px-5 py-4 z-10 bg-slate-900/40 backdrop-blur-xs">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="font-extrabold text-sm tracking-wide font-sans text-slate-150">
          Math Scanner
        </span>
        <button
          onClick={() => setFlashOn(!flashOn)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
        >
          <Bolt className={`h-5 w-5 transition-colors ${flashOn ? "text-amber-300" : "text-slate-400"}`} />
        </button>
      </div>

      {/* VIEWPORT: Simulated real camera view matching Screen C on wooden desk */}
      <div className="relative flex-1 bg-amber-50 overflow-hidden flex flex-col items-center justify-center">
        {/* Desk texture background */}
        <div className="absolute inset-0 bg-neutral-900 opacity-95"></div>

        {/* Notebook sheet container simulator */}
        <div className="relative h-[280px] w-[200px] rounded-sm bg-[#fafafa] border border-slate-350 shadow-lg px-4 py-6 flex flex-col justify-between overflow-hidden">
          {/* Lined notebook decoration */}
          <div className="absolute top-0 right-0 h-full w-[2px] bg-red-100 left-5"></div>
          <div className="absolute inset-y-0 left-5 w-full bg-[linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:100%_18px] mt-10 pointer-events-none"></div>

          {/* Doodled math graphs */}
          <div className="pl-5 pt-4 space-y-4 font-mono select-none text-slate-700 leading-none">
            <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Notebook</span>
            
            {/* Vector graph axes */}
            <div className="relative w-full h-[64px] border-b border-l border-slate-300 ml-2">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60">
                <path d="M 10,50 L 50,10 L 90,50" className="stroke-slate-650 stroke-[1.5px] fill-none" />
                <line x1="50" y1="10" x2="50" y2="55" className="stroke-slate-400 stroke-dasharray stroke-[1px]" />
                <path d="M 30,30 L 70,30" className="stroke-slate-400 stroke-[1px] stroke-dashed" />
              </svg>
            </div>

            {/* Algebraic formulation written on paper */}
            <div className="space-y-1.5 text-center px-1 font-sans text-xs font-semibold prose mt-4">
              <p className="text-[15px] font-black tracking-tight font-serif text-slate-800">
                2x² - 8x + 6 = 0
              </p>
              <p className="text-[10px] text-slate-400 font-mono italic">
                solve for x...
              </p>
            </div>
          </div>

          {/* Camera Viewfinder Corners Blue Guideline Brackets */}
          <div className="absolute top-1.5 left-1.5 h-6 w-6 border-t-4 border-l-4 border-blue-600 rounded-tl-sm pointer-events-none"></div>
          <div className="absolute top-1.5 right-1.5 h-6 w-6 border-t-4 border-r-4 border-blue-600 rounded-tr-sm pointer-events-none"></div>
          <div className="absolute bottom-1.5 left-1.5 h-6 w-6 border-b-4 border-l-4 border-blue-600 rounded-bl-sm pointer-events-none"></div>
          <div className="absolute bottom-1.5 right-1.5 h-6 w-6 border-b-4 border-r-4 border-blue-600 rounded-br-sm pointer-events-none"></div>

          {/* Focus label banner overlay inside sheet */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1 text-[10px] font-black text-white tracking-widest uppercase shadow-md backdrop-blur-xs">
            Frame focus zone
          </div>
        </div>

        {/* Text entry field option to input ANY customized mathematical problem */}
        <div className="absolute bottom-5 inset-x-4">
          <div className="rounded-xl bg-slate-900/80 px-4 py-3 border border-slate-700 flex items-center space-x-2 backdrop-blur-md">
            <Sparkles className="h-4.5 w-4.5 text-blue-400 animate-pulse shrink-0" />
            <input
              type="text"
              placeholder="Or write custom equation... (e.g. 3x + 12 = 30)"
              value={customEquationInput}
              onChange={(e) => setCustomEquationInput(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-hidden text-white font-semibold placeholder:font-normal placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Bottom sliding controller drawer - matching mock page */}
      <div className="rounded-t-3xl bg-slate-900 border-t border-slate-800 px-5 pt-3.5 pb-6 space-y-5 animate-slide-up">
        {/* Grab bar notch */}
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-700 mb-2"></div>

        {/* SHUTTER TRIGGER CONTAINER */}
        <div className="flex items-center justify-center py-2 relative">
          {/* Main big shutter button */}
          <button
            onClick={handleShutterTrigger}
            className="flex h-18 w-18 items-center justify-center rounded-full bg-white border-4 border-blue-100 hover:scale-105 active:scale-95 transition-all text-blue-600 hover:text-blue-700 cursor-pointer shadow-md shadow-blue-900/20"
          >
            <div className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-white stroke-[2.2]" />
            </div>
          </button>
        </div>

        {/* RECENT SCANS GALLERY SELECTION ROW */}
        <div className="space-y-2.5">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">
            Recent Scans
          </span>
          
          <div className="grid grid-cols-4 gap-2 pb-1">
            {recentScansSample.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSolveEquationParsed(scan.equation)}
                className="group relative h-[68px] rounded-xl border border-slate-750 bg-slate-800 flex flex-col justify-center items-center overflow-hidden hover:border-blue-500 transition-all cursor-pointer hover:scale-[1.03]"
                title={`Solve: ${scan.equation}`}
              >
                {/* Visual miniature line paper */}
                <div className="absolute inset-0 bg-[#fefefe] text-slate-800 font-mono text-[8px] flex flex-col justify-center items-center scale-95 rounded-lg opacity-85 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] font-black text-center px-1 truncate w-full font-serif text-slate-900">
                    {scan.equation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
