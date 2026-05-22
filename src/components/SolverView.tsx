import React, { useState, useRef, useEffect } from "react";
import { X, Flame, HelpCircle, Check, Loader2, Send, Lightbulb, Keyboard, Mic, MicOff } from "lucide-react";
import { TutorStep, ChatMessage } from "../types";

interface SolverViewProps {
  equation: string;
  initialTopic?: string;
  initialSteps?: TutorStep[];
  onClose: () => void;
  onSolveSuccess: (xpAwarded: number, equation: string, topic: string) => void;
}

export default function SolverView({
  equation,
  initialTopic = "Algebra",
  initialSteps,
  onClose,
  onSolveSuccess,
}: SolverViewProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [steps, setSteps] = useState<TutorStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Active step pointer index (0-indexed, meaning step 0 is active, etc.)
  const [activeStepIndex, setActiveStepIndex] = useState(2); // Match Screen D (where Step 1 and 2 are green checked, Step 3 is active)
  
  // Chat console states
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [showHintMsg, setShowHintMsg] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto solve equation step parsing from server on mount
  useEffect(() => {
    const fetchStepsFromServer = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemText: equation }),
        });

        const data = await response.json();
        if (data.success && data.response?.steps) {
          setSteps(data.response.steps);
          setTopic(data.response.topic || initialTopic);
          
          // Match standard index states
          setActiveStepIndex(Math.min(2, Math.max(0, data.response.steps.length - 1)));
        } else {
          // Robust localized fallback loop in case Gemini is loading/offline
          generateFallbackSteps();
        }
      } catch (e) {
        console.error("Fetch Solver steps error: ", e);
        generateFallbackSteps();
      } finally {
        setLoading(false);
      }
    };

    if (initialSteps && initialSteps.length > 0) {
      setSteps(initialSteps);
      setActiveStepIndex(Math.min(2, Math.max(0, initialSteps.length - 1)));
      setLoading(false);
    } else {
      fetchStepsFromServer();
    }
  }, [equation]);

  const generateFallbackSteps = () => {
    // Elegant fallback simulation matching the exact image mockup
    const fallback: TutorStep[] = [
      {
        number: 1,
        title: "Divide by 2",
        formula: "x² - 4x + 3 = 0",
        explanation: "Dividing the entire equation by the common coefficient helps simplify the quadratic calculation.",
        question: "Are both sides divided cleanly?",
        expectedAnswer: "yes",
        wrongAnswerFeedback: "Check your division.",
      },
      {
        number: 2,
        title: "Factor",
        formula: "(x - 3)(x - 1) = 0",
        explanation: "Factoring helps us break down a complex quadratic equation into two simpler linear ones!",
        question: "What are the factored roots?",
        expectedAnswer: "roots",
        wrongAnswerFeedback: "Verify factoring brackets.",
      },
      {
        number: 3,
        title: "Solve for x",
        formula: "x = 3  or  x = 1",
        explanation: "Equating each factor to zero yields our solutions.",
        question: "What is the second value of x?",
        expectedAnswer: "3",
        wrongAnswerFeedback: "Since (x - 1) = 0 gives x = 1, equate (x - 3) = 0 to find the second value.",
      },
    ];
    setSteps(fallback);
    setActiveStepIndex(2); // Step 3 active
  };

  // Populate first chatbot greeting depend on steps loaded
  useEffect(() => {
    if (steps.length > 0) {
      const activeStep = steps[activeStepIndex];
      setChatLogs([
        {
          id: "msg-welcome",
          role: "tutor",
          text: activeStepIndex >= steps.length - 1
            ? `You're doing great! Since (x - 1) = 0, what must the second value of x be?`
            : `Let's work together! For our current step: ${activeStep.title}. What is the correct value for ${activeStep.formula}?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [steps, activeStepIndex]);

  // Scroll to bottom of chatter
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLogs]);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const studentResponseText = chatInput.trim();
    // Add user message locally
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: studentResponseText,
      timestamp: new Date(),
    };

    setChatLogs((prev) => [...prev, userMsg]);
    setChatInput("");
    setSendingChat(true);

    // Verify if this matches the expected answer for the active step
    const activeStep = steps[activeStepIndex];
    const isAnswerCorrect =
      studentResponseText.toLowerCase() === activeStep?.expectedAnswer.toLowerCase() ||
      studentResponseText.toLowerCase().includes(activeStep?.expectedAnswer.toLowerCase()) ||
      (activeStep?.expectedAnswer === "3" && (studentResponseText.includes("3") || studentResponseText.toLowerCase().includes("three")));

    setTimeout(async () => {
      if (isAnswerCorrect) {
        // Success response
        const tutorReply: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          role: "tutor",
          text: `🎉 Spot on! Fantastic job. You have completed the final step successfully! You earned +50 XP.`,
          timestamp: new Date(),
        };
        setChatLogs((prev) => [...prev, tutorReply]);
        setSendingChat(false);

        // Auto reward user!
        setTimeout(() => {
          onSolveSuccess(50, equation, topic);
        }, 1500);
      } else {
        // Feed text response to real Gemini chat API for custom explanation
        try {
          const payload = {
            message: studentResponseText,
            history: chatLogs.map(log => ({ role: log.role, text: log.text })),
            currentStepContext: {
              topic: topic,
              equation: equation,
              stepTitle: activeStep.title,
              stepFormula: activeStep.formula,
              stepQuestion: activeStep.question,
              stepExpectedAnswer: activeStep.expectedAnswer,
            },
          };

          const response = await fetch("/api/tutor-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          const tutorReply: ChatMessage = {
            id: `msg-${Date.now()}-reply`,
            role: "tutor",
            text: data.success ? data.response : activeStep.wrongAnswerFeedback,
            timestamp: new Date(),
          };
          setChatLogs((prev) => [...prev, tutorReply]);
        } catch (err) {
          // Traditional feedback route in case of proxy issues
          const tutorReply: ChatMessage = {
            id: `msg-${Date.now()}-reply`,
            role: "tutor",
            text: activeStep.wrongAnswerFeedback,
            timestamp: new Date(),
          };
          setChatLogs((prev) => [...prev, tutorReply]);
        } finally {
          setSendingChat(false);
        }
      }
    }, 1000);
  };

  const triggerMicrophoneDictation = () => {
    if (voiceActive) {
      setVoiceActive(false);
    } else {
      setVoiceActive(true);
      // Simulate verbal speech-to-text response of student after brief count
      setTimeout(() => {
        setChatInput("Is the answer x = 3?");
        setVoiceActive(false);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-brand-surface border-x border-slate-200">
      {/* Interactive header block matching Screen D */}
      <div className="flex items-center justify-between border-b border-blue-50 bg-white px-4 py-3.5 shadow-2xs">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="font-extrabold text-[#004ac6] text-base tracking-tight font-sans">
          MathCompanion
        </span>
        {/* Streak counts */}
        <div className="flex items-center space-x-1.5 rounded-full bg-orange-100 px-3 py-1 font-bold text-orange-700 text-xs shadow-3xs">
          <span>🔥</span>
          <span>12</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
          <p className="text-xs font-semibold font-mono uppercase tracking-widest text-slate-400">
            Analyzing mathematical steps...
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 select-none">
          {/* Current Problem Showcase card list */}
          <div className="rounded-2xl border border-blue-50 bg-white p-4.5 shadow-2xs space-y-2">
            <span className="text-[10px] font-extrabold text-blue-600 font-sans uppercase tracking-widest">
              Current Problem
            </span>
            <div className="text-slate-900 font-extrabold text-lg flex items-center space-x-1.5">
              <span>Solve for x:</span>
            </div>
            {/* Highlighted box containing equations formula */}
            <div className="rounded-xl bg-blue-50 p-4.5 border border-blue-100/50 flex justify-center items-center">
              <span className="text-2xl font-black text-slate-800 tracking-wider font-mono">
                {equation}
              </span>
            </div>
          </div>

          {/* Interactive vertical step checking list with indicator connectors */}
          <div className="space-y-4 pt-2">
            {steps.map((step, idx) => {
              const isComp = idx < activeStepIndex;
              const isAct = idx === activeStepIndex;
              const isInact = idx > activeStepIndex;

              return (
                <div key={step.number} className="flex items-start space-x-3.5 relative">
                  {/* Left node with connector lines */}
                  <div className="flex flex-col items-center self-stretch select-none">
                    {/* Circle bulb shape status */}
                    {isComp ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-xs">
                        <Check className="h-4.5 w-4.5 stroke-[3]" />
                      </div>
                    ) : isAct ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold shadow-sm font-sans">
                        {step.number}
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200 font-bold font-sans">
                        {step.number}
                      </div>
                    )}

                    {/* Vertical connector segment line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-1 flex-1 my-1.5 min-h-[40px] ${
                          isComp ? "bg-green-500" : "bg-slate-200 border-l border-dashed border-slate-300"
                        }`}
                      ></div>
                    )}
                  </div>

                  {/* Right side step text logs */}
                  <div className="flex-1 space-y-1.5 pb-2">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-black text-[15px] tracking-tight ${
                          isComp ? "text-slate-600" : isAct ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        Step {step.number}: {step.title}
                      </h4>
                      <button className="text-slate-400 hover:text-slate-605">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>

                    <p className={`font-mono text-sm font-extrabold ${isAct ? "text-slate-800" : "text-slate-400"}`}>
                      {step.formula}
                    </p>

                    {/* Callouts bubble only inside Step 2/Active depending on image mockup */}
                    {isAct && step.number === 2 && (
                      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-100/40 p-4.5 text-xs text-slate-600 italic leading-relaxed shadow-3xs">
                        "Factoring helps us break down a complex quadratic equation into two simpler linear ones!"
                      </div>
                    )}

                    {isAct && step.number === 3 && (
                      <div className="inline-flex rounded-md bg-green-400/10 px-2 py-0.5 text-[10px] font-extrabold text-green-700 tracking-wide uppercase border border-green-200">
                        ⭐ Spot on!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-10"></div>
        </div>
      )}

      {/* Tutor console chat interface sliding panel */}
      {!loading && (
        <div className="rounded-t-3xl bg-slate-900 border-t border-slate-800 px-4 pt-3.5 pb-5 space-y-4 shadow-xl z-20">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-700 mb-2"></div>

          {/* Conversation scroll container logs */}
          <div className="max-h-[142px] overflow-y-auto space-y-3 px-1">
            {chatLogs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 items-start ${log.role === "user" ? "justify-end" : ""}`}
              >
                {/* Robot icon indicator */}
                {log.role === "tutor" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs border border-blue-400 animate-pulse">
                    🤖
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[805%] font-medium ${
                    log.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none font-bold"
                      : "bg-white text-slate-800 rounded-tl-none shadow-2xs"
                  }`}
                >
                  {log.text}
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>

          {/* Micro entries and action triggers */}
          <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2">
            {/* Input toggle button */}
            <button
              onClick={() => setShowHintMsg(!showHintMsg)}
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-450 border border-slate-700 hover:text-white cursor-pointer active:scale-90 transition-all"
              title="Show algebraic tip hint"
            >
              <Lightbulb className={`h-5 w-5 ${showHintMsg ? "text-amber-400" : ""}`} />
            </button>

            {/* Chat Input Field container */}
            <div className="flex-1 relative flex items-center bg-slate-800 rounded-full border border-slate-700">
              <input
                type="text"
                placeholder={voiceActive ? "Dictating audio voice..." : "Answer tutoring prompt..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-2.5 text-xs focus:outline-hidden font-bold pr-10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-750 active:scale-90 transition-all cursor-pointer"
              >
                {sendingChat ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Micro voice prompt dictation trigger */}
            <button
              type="button"
              onClick={triggerMicrophoneDictation}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                voiceActive
                  ? "bg-red-500 animate-pulse text-white scale-105"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
              } cursor-pointer`}
              title="Voice speak to Tutor"
            >
              {voiceActive ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </form>

          {/* Interactive Hint balloon tooltip overlay in dark sheet */}
          {showHintMsg && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-200 leading-relaxed font-sans animate-in slide-in-from-bottom-2 duration-200">
              💡 <strong>Hint:</strong> {steps[activeStepIndex]?.wrongAnswerFeedback || "Equate factors to zero!"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
