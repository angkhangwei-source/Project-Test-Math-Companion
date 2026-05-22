export interface UserData {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  streak: number;
  globalRank: number;
  avatarUrl?: string;
}

export interface Quest {
  id: string;
  category: string; // "Geometry", "Algebra", etc.
  description: string;
  progress: number; // e.g., 2
  target: number; // e.g., 3
  xpReward: number;
  completed: boolean;
}

export interface RecentQuest {
  id: string;
  category: string;
  subtopic: string;
  xpReward: number;
  completed: boolean;
  timeString?: string;
  question?: string;
  equation?: string;
}

export interface MissionLogItem {
  id: string;
  equation: string;
  title: string;
  topic: string;
  xpAwarded: number;
  isCorrect: boolean;
  canRetry: boolean;
  timeString: string;
}

export interface Challenge {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  title: string;
  questionText: string;
  formula: string;
  expectedAnswer: string;
  xpReward: number;
  explanationText?: string;
}

export interface TutorStep {
  number: number;
  title: string;
  formula: string;
  explanation: string;
  question: string;
  expectedAnswer: string;
  wrongAnswerFeedback: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  timestamp: Date;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  status: "idle" | "active" | "offline";
  timeString?: string;
  avatarSeed: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  period: string;
  activeUnit: string;
  progress: number; // e.g. 75 %
  rankInClass: number; // e.g. 4
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatarSeed: string;
  arrowStatus: "up" | "down" | "flat";
  changeAmount?: number;
  isCurrentUser?: boolean;
}
