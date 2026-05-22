import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "", // Injected by platform from Settings > Secrets
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "10mb" }));

// Helper to make sure API key is present
const checkApiKey = (req: any, res: any, next: any) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please add it via the Settings > Secrets menu in AI Studio.",
    });
  }
  next();
};

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// API: Solve Equation (multimodal scan or text)
app.post("/api/solve", checkApiKey, async (req, res) => {
  try {
    const { problemText, imageBase64, mimeType } = req.body;

    let contentsParts: any[] = [];

    if (imageBase64) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/png",
          data: imageBase64,
        },
      });
      contentsParts.push({
        text: "You are a friendly high school math tutor. OCR scan the math problem in this picture, identify it, and solve it in exactly 3 or 4 step-by-step interactive stages. Fill the JSON response schema precisely. Let's make sure the steps are logical, understandable and target ages 10-18.",
      });
    } else if (problemText) {
      contentsParts.push({
        text: `You are a friendly high-school math tutor. Solve this math problem step-by-step: "${problemText}". Build a logical, educational resolution path in exactly 3 or 4 stages. Fill the JSON response schema precisely. Let's make sure it is understandable and targets students.`,
      });
    } else {
      return res.status(400).json({ error: "Either problemText or imageBase64 is required." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contentsParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["equation", "topic", "steps"],
          properties: {
            equation: {
              type: Type.STRING,
              description: "The formatted mathematical equation to solve, e.g., '2x^2 - 8x + 6 = 0' or 'x^2 + y^2 = 25'.",
            },
            topic: {
              type: Type.STRING,
              description: "The main math category, e.g., 'Algebra', 'Geometry', 'Calculus', 'Trigonometry'.",
            },
            steps: {
              type: Type.ARRAY,
              description: "The logical 3-4 steps resolving this equation.",
              items: {
                type: Type.OBJECT,
                required: ["number", "title", "formula", "explanation", "question", "expectedAnswer", "wrongAnswerFeedback"],
                properties: {
                  number: {
                    type: Type.INTEGER,
                    description: "Step index starting from 1.",
                  },
                  title: {
                    type: Type.STRING,
                    description: "Concise title for this step, e.g., 'Divide by 2' or 'Factor' or 'Differentiate'.",
                  },
                  formula: {
                    type: Type.STRING,
                    description: "The updated formula or equation at this step, e.g., 'x^2 - 4x + 3 = 0' or '(x - 3)(x - 1) = 0'.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A simple, encouraging micro-explanation of why or how this step is performed.",
                  },
                  question: {
                    type: Type.STRING,
                    description: "A leading question to ask the student to guide them into giving the key value. For example, for factoring: 'Since (x - 1) = 0, what must the second value of x be?'",
                  },
                  expectedAnswer: {
                    type: Type.STRING,
                    description: "The shortest value representation expected from the student, e.g., '3' or 'x = 3'.",
                  },
                  wrongAnswerFeedback: {
                    type: Type.STRING,
                    description: "Feedback text to guide the student towards correct calculation in case they make a mistake.",
                  },
                },
              },
            },
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty model response received.");
    }

    const solvedData = JSON.parse(textOutput.trim());
    return res.json({ success: true, response: solvedData });
  } catch (error: any) {
    console.error("Solver Error: ", error);
    return res.status(500).json({ error: error.message || "An error occurred while analyzing the equation." });
  }
});

// API: Generate Practice Challenge
app.post("/api/generate-challenge", checkApiKey, async (req, res) => {
  try {
    const { topic, difficulty } = req.body; // topic: e.g. Algebra, Geometry, Calculus, Mixed. difficulty: Easy, Medium, Hard.

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a custom, educational ${difficulty}-tier math practice question for a student in the topic of "${topic}". Provide a question text, standard display formula, and a final answer formatted nicely. Follow the JSON response schema precisely.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["id", "topic", "difficulty", "title", "questionText", "formula", "expectedAnswer", "xpReward", "explanationText"],
          properties: {
            id: {
              type: Type.STRING,
              description: "A unique short alphanumeric string identifier, e.g., 'q-alg-002'.",
            },
            topic: {
              type: Type.STRING,
              description: "E.g., 'Algebra', 'Geometry', 'Calculus'.",
            },
            difficulty: {
              type: Type.STRING,
              description: "Easy, Medium, or Hard.",
            },
            title: {
              type: Type.STRING,
              description: "Short catchy title, e.g., 'Quadratic Roots' or 'Tangent Slope'.",
            },
            questionText: {
              type: Type.STRING,
              description: "Detailed challenge context instructions.",
            },
            formula: {
              type: Type.STRING,
              description: "Formatted formula display string, e.g., '3x - 15 = 45' or 'y = x^2 - 4x'.",
            },
            expectedAnswer: {
              type: Type.STRING,
              description: "The correct value requested, e.g., '20'.",
            },
            xpReward: {
              type: Type.INTEGER,
              description: "An XP award amount proportionate to difficulty: Easy: 30, Medium: 45, Hard: 60.",
            },
            explanationText: {
              type: Type.STRING,
              description: "Encouraging, clear breakdown explanation of the math solution.",
            },
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty model response received.");
    }

    const challengeData = JSON.parse(textOutput.trim());
    return res.json({ success: true, challenge: challengeData });
  } catch (error: any) {
    console.error("Challenge Generator Error: ", error);
    return res.status(500).json({ error: error.message || "An error occurred while generating high-performance challenges." });
  }
});

// API: Tutor Bot Chat Session helper (interactive conversation about current problem)
app.post("/api/tutor-chat", checkApiKey, async (req, res) => {
  try {
    const { history, message, currentStepContext } = req.body;

    const chatHistory = history || []; // array of { role: 'user' | 'model', parts: [{ text: string }] }
    
    // Inject custom tutoring system instructions dynamically as the primer if it's the first message
    const systemPrompt = `You are the friendly robot math tutor from the ed-tech app MathCompanion.
The student is currently working on: 
Topic: ${currentStepContext.topic}
Problem: ${currentStepContext.equation}
Active Step: ${currentStepContext.stepTitle} (${currentStepContext.stepFormula})
Active Question asked to student: "${currentStepContext.stepQuestion}"
Expected answer from student: "${currentStepContext.stepExpectedAnswer}"

Be encouraging, playful and supportive. Avoid giving away the answer directly if they have not got it yet. If they got it, praise them enthusiastically! Keep replies under 3 sentences to keep them highly readable on a mobile chat interface.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
      }
    });

    // Feed in previous messages if any (Translate roles: e.g. user to 'user', tutor to 'model') or pass sequentially
    // Instead of using chats.create with contents, let's just make a generateContent call so we're simple and robust
    const formattedHistory = chatHistory.map((item: any) => {
      return {
        role: item.role === "tutor" || item.role === "model" ? "model" : "user",
        parts: [{ text: item.text }]
      };
    });

    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const resp = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const text = resp.text;
    return res.json({ success: true, response: text });
  } catch (error: any) {
    console.error("Tutor Chat Error: ", error);
    return res.status(500).json({ error: error.message || "An error occurred while conversing." });
  }
});

// Vite middleware development setup and bootstrap async function
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
