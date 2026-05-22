import { createClient } from "@supabase/supabase-js";
import { MissionLogItem } from "../types";

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Clean and fallback values to avoid blank string errors
const cleanValue = (val: any): string => {
  if (!val) return "";
  return String(val).trim().replace(/^['"]|['"]$/g, "");
};

const defaultUrl = "https://mjdfgxangrhoivxjeqvh.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZGZneGFuZ3Job2l2eGplcXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTIxMDYsImV4cCI6MjA5NDk4ODEwNn0.1qyHboUiKUjpFGaASOG1Kynv1qCrFCLK4ihnEOWe_L4";

const supabaseUrl = cleanValue(rawUrl) || defaultUrl;
const supabaseAnonKey = cleanValue(rawKey) || defaultKey;

console.log("Initializing Supabase Client with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Maps a Postgres table row from "entries" to the React MissionLogItem type.
 * Supports both snake_case and camelCase database schema strategies.
 */
export const mapEntryToMission = (item: any): MissionLogItem => {
  if (!item) {
    return {
      id: `m-${Date.now()}`,
      equation: "Unknown",
      title: "Self Resolve",
      topic: "Algebra",
      xpAwarded: 10,
      isCorrect: true,
      canRetry: false,
      timeString: "Just Now",
    };
  }

  let equation = item.equation || item.formula || "";
  let title = item.title || "Self Resolve";
  let topic = item.topic || item.category || "Algebra";

  // Support (text, author) schemas by extracting values or parsing JSON
  if (!equation && item.text) {
    try {
      if (typeof item.text === "string" && item.text.startsWith("{")) {
        const parsed = JSON.parse(item.text);
        equation = parsed.equation || parsed.text || item.text;
        title = parsed.title || (item.author ? `Solve by ${item.author}` : "Self Resolve");
        topic = parsed.topic || "Algebra";
      } else {
        equation = item.text;
        title = item.author ? `Solve by ${item.author}` : "Guest Solve";
      }
    } catch {
      equation = item.text;
      title = item.author ? `Solve by ${item.author}` : "Guest Solve";
    }
  }

  if (!equation) {
    equation = "Solved Problem";
  }

  return {
    id: String(item.id || item.entry_id || `m-${Date.now()}`),
    equation,
    title,
    topic,
    xpAwarded: Number(
      item.xpAwarded !== undefined 
        ? item.xpAwarded 
        : item.xp_awarded !== undefined 
          ? item.xp_awarded 
          : item.xpawarded !== undefined 
            ? item.xpawarded 
            : 45
    ),
    isCorrect: item.isCorrect !== undefined 
      ? Boolean(item.isCorrect) 
      : item.is_correct !== undefined 
        ? Boolean(item.is_correct) 
        : item.iscorrect !== undefined 
          ? Boolean(item.iscorrect) 
          : true,
    canRetry: item.canRetry !== undefined 
      ? Boolean(item.canRetry) 
      : item.can_retry !== undefined 
        ? Boolean(item.can_retry) 
        : item.canretry !== undefined 
          ? Boolean(item.canretry) 
          : false,
    timeString: item.timeString || item.time_string || item.timestring || (item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now")
  };
};

/**
 * Inserts a new MissionLogItem solution entry into the "entries" table.
 * Uses adaptive payloads to assure compatibility with camelCase / snake_case databases.
 */
export const insertMissionToSupabase = async (mission: MissionLogItem) => {
  // Payload A: camelCase schema
  const payloadCamel = {
    id: mission.id,
    equation: mission.equation,
    title: mission.title,
    topic: mission.topic,
    xpAwarded: mission.xpAwarded,
    isCorrect: mission.isCorrect,
    canRetry: mission.canRetry,
    timeString: mission.timeString,
  };

  // Payload B: snake_case schema
  const payloadSnake = {
    id: mission.id,
    equation: mission.equation,
    title: mission.title,
    topic: mission.topic,
    xp_awarded: mission.xpAwarded,
    is_correct: mission.isCorrect,
    can_retry: mission.canRetry,
    time_string: mission.timeString,
  };

  // Payload C: lowercase schema (for standard UI table generator)
  const payloadLower = {
    id: mission.id,
    equation: mission.equation,
    title: mission.title,
    topic: mission.topic,
    xpawarded: mission.xpAwarded,
    iscorrect: mission.isCorrect,
    canretry: mission.canRetry,
    timestring: mission.timeString,
  };

  // Payload D: minimal fallback schema
  const payloadMinimal = {
    equation: mission.equation,
    title: mission.title,
    topic: mission.topic,
  };

  // Payload E: text and author format (with JSON or raw string fallback)
  const payloadTextAuthorJson = {
    text: JSON.stringify({
      equation: mission.equation,
      title: mission.title,
      topic: mission.topic,
      xpAwarded: mission.xpAwarded,
      isCorrect: mission.isCorrect,
    }),
    author: "angkhangwei@gmail.com",
  };

  const payloadTextAuthorSimple = {
    text: mission.equation,
    author: "angkhangwei@gmail.com",
  };

  try {
    // Attempt 1: Standard camelCase insert
    const { error: errorCamel } = await supabase.from("entries").insert([payloadCamel]);
    if (!errorCamel) {
      console.log("Inserted entry successfully via camelCase columns.");
      return true;
    }
    console.warn("CamelCase insert payload failed, trying snake_case payload...", errorCamel);

    // Attempt 2: Standard snake_case insert
    const { error: errorSnake } = await supabase.from("entries").insert([payloadSnake]);
    if (!errorSnake) {
      console.log("Inserted entry successfully via snake_case columns.");
      return true;
    }
    console.warn("SnakeCase insert payload failed, trying lowercase payload...", errorSnake);

    // Attempt 3: All-lowercase columns insert
    const { error: errorLower } = await supabase.from("entries").insert([payloadLower]);
    if (!errorLower) {
      console.log("Inserted entry successfully via pure lowercase columns.");
      return true;
    }
    console.warn("Lowercase insert payload failed, trying minimal payload...", errorLower);

    // Attempt 4: Minimal insert (less constraints to fail on)
    const { error: errorMinimal } = await supabase.from("entries").insert([payloadMinimal]);
    if (!errorMinimal) {
      console.log("Inserted entry successfully via minimal columns.");
      return true;
    }
    console.warn("Minimal insert payload failed, trying text-author JSON payload...", errorMinimal);

    // Attempt 5: text-author JSON fallback payload
    const { error: errorTextAuthorJson } = await supabase.from("entries").insert([payloadTextAuthorJson]);
    if (!errorTextAuthorJson) {
      console.log("Inserted entry successfully via JSON text+author columns.");
      return true;
    }
    console.warn("JSON text+author payload failed, trying simple text+author payload...", errorTextAuthorJson);

    // Attempt 6: text-author simple fallback payload
    const { error: errorTextAuthorSimple } = await supabase.from("entries").insert([payloadTextAuthorSimple]);
    if (!errorTextAuthorSimple) {
      console.log("Inserted entry successfully via simple text+author columns.");
      return true;
    }

    console.error("All Supabase insert payload strategies failed. Ultimate error context:", errorTextAuthorSimple);
    return false;
  } catch (err) {
    console.error("Exception in insertMissionToSupabase:", err);
    return false;
  }
};

