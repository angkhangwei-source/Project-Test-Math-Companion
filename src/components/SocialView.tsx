import React, { useState } from "react";
import { MessageSquare, Users, Globe, ExternalLink, Calendar, HelpCircle, Trophy } from "lucide-react";
// @ts-ignore
import { DiscussionEmbed } from "disqus-react";

interface DiscussionTopic {
  id: string;
  title: string;
  desc: string;
  url: string;
  icon: React.ReactNode;
  category: string;
}

export default function SocialView() {
  const topics: DiscussionTopic[] = [
    {
      id: "math-companion-general",
      title: "General Math Chat (綜合體育 & 數學交流)",
      category: "General",
      desc: "Share your study tips, show off your high scores, or chat with fellow learners anyway you like!",
      url: "https://math-companion.app/social/general",
      icon: <Globe className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "math-companion-algebra",
      title: "Algebra Alliance (代數聯盟討論區)",
      category: "Algebra",
      desc: "Stuck with linear equations or quadratic proofs? Discuss algebraic formulas and tips here.",
      url: "https://math-companion.app/social/algebra",
      icon: <Trophy className="h-5 w-5 text-orange-500" />,
    },
    {
      id: "math-companion-geometry",
      title: "Geometry Guild (幾何證明與繪圖)",
      category: "Geometry",
      desc: "Pythagorean theorem, circle properties, and area solvers. Join forces to draw flawless proofs.",
      url: "https://math-companion.app/social/geometry",
      icon: <HelpCircle className="h-5 w-5 text-purple-500" />,
    },
    {
      id: "math-companion-calculus",
      title: "Calculus Connoisseurs (微積分大師交流)",
      category: "Calculus",
      desc: "Limits, derivatives, integrations, and advanced mathematical physics. Enter if you dare!",
      url: "https://math-companion.app/social/calculus",
      icon: <Users className="h-5 w-5 text-emerald-500" />,
    },
  ];

  const [activeTopic, setActiveTopic] = useState<DiscussionTopic>(topics[0]);

  return (
    <div className="space-y-6 pb-20 pt-4 animate-in fade-in duration-300">
      {/* Intro Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-6 text-white shadow-lg">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-300 via-pink-400 to-blue-800"></div>
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl"></div>

        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center space-x-1 rounded-full bg-white/20 py-1 px-3 text-xs font-black uppercase tracking-wider text-amber-200">
            <MessageSquare className="h-3 w-3 fill-amber-200" />
            <span>Disqus Forum Integration</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            Math Alliance Social Hub
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
            Connect with math scholars across the globe! Select a channel below to write comments, answer equations, or seek layout homework help securely.
          </p>
        </div>
      </div>

      {/* Grid of channels */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>Active Discussion Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map((topic) => {
            const isSelected = activeTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className={`flex items-start text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-200 ring-2 ring-blue-500/10 shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-2xs"
                }`}
              >
                <div className="mr-3.5 mt-0.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {topic.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 font-mono">
                    {topic.category}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mt-0.5 line-clamp-1">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-medium mt-1 line-clamp-2">
                    {topic.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disqus Embed Main Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-50">
          <div>
            <div className="flex items-center space-x-1 text-[10px] font-black text-blue-600 uppercase tracking-widest font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
              <span>Live Comment Feed ({activeTopic.category})</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight font-sans mt-0.5">
              {activeTopic.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>ID: {activeTopic.id}</span>
          </div>
        </div>

        {/* Disqus Embedded Thread Frame Container wrapper with responsive styles */}
        <div className="disqus-container py-2 min-h-[400px]">
          <DiscussionEmbed
            shortname="math-companion"
            config={{
              url: activeTopic.url,
              identifier: activeTopic.id,
              title: topicTitleFormat(activeTopic.title),
              language: "zh_TW", // Traditional Chinese (Taiwan) as requested
            }}
          />
        </div>

        <div className="text-slate-400 text-[10px] font-medium leading-relaxed font-mono text-center pt-4 border-t border-slate-50 flex items-center justify-center space-x-1.5">
          <span>Discussion board by disqus-react</span>
          <span>•</span>
          <a
            href="https://disqus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-0.5"
          >
            <span>Visit Disqus</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper to remove punctuation or sanitize titles nicely for Disqus parsing configs
function topicTitleFormat(title: string): string {
  return title.replace(/[()＆\s]/g, " ").trim();
}
