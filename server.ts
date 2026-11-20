import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getErrorStatus(error: unknown): { status: number; message: string } {
  const errObj = error as { status?: number; message?: string };
  const msg = errObj?.message || "An unexpected AI service error occurred.";
  if (typeof errObj?.status === "number" && errObj.status >= 400 && errObj.status < 600) {
    return { status: errObj.status, message: msg };
  }
  if (msg.includes("API_KEY_INVALID") || msg.includes("PERMISSION_DENIED")) {
    return { status: 403, message: "Invalid or unauthorized Gemini API key. Check Settings > Secrets." };
  }
  if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
    return { status: 429, message: "AI request quota reached. Please wait a moment and try again." };
  }
  if (msg.includes("not configured")) {
    return { status: 503, message: msg };
  }
  return { status: 500, message: msg };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "4mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "campus-pulse" });
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history = [], events = [], studentInterests = [], role = "student" } = req.body ?? {};
      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "A message prompt is required." });
        return;
      }

      const ai = getAiClient();
      const condensedEvents = Array.isArray(events)
        ? events.map((ev: Record<string, unknown>) => ({
            id: ev.id,
            title: ev.title,
            category: ev.category,
            date: ev.date,
            time: ev.time,
            venue: ev.venue,
            organiser: ev.organiser,
            maxParticipants: ev.maxParticipants,
            registeredCount: ev.registeredCount,
            deadline: ev.deadline,
            description: ev.description,
          }))
        : [];

      const systemInstruction = `You are Campus Pulse AI, an intelligent campus event concierge for university students and event organisers.
Current date: 2026-11-20.
User role: ${role}.
User interests: ${Array.isArray(studentInterests) && studentInterests.length > 0 ? studentInterests.join(", ") : "General campus life, technology, sports, and culture"}.

You have access to the live Campus Pulse event catalog below (JSON):
${JSON.stringify(condensedEvents)}

Capabilities:
1. Recommend events tailored to the user's interests or question, citing exact event names, dates, times, venues, and available seats.
2. Summarize specific events clearly in concise bullet points or clean prose.
3. Answer practical questions about deadlines, seat availability, venues, or organisers strictly using the catalog data.
4. Help organisers brainstorm event descriptions, titles, or suggest the best category from: Hackathons, Workshops, Technical Events, Sports, Cultural Programs, Club Activities.

Rules:
- Keep answers crisp, structured, helpful, and scannable (avoid filler hype).
- Whenever you mention or recommend specific events from the catalog, include their exact "id" values in recommendedEventIds.
- Do not invent fake campus events that are not in the catalog when answering discovery questions (unless explicitly asked to draft a brand new event idea).`;

      const conversationHistory = Array.isArray(history)
        ? history
            .slice(-8)
            .map((h: { sender?: string; text?: string }) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text ?? ""}`)
            .join("\n")
        : "";

      const prompt = conversationHistory
        ? `Previous conversation:\n${conversationHistory}\n\nLatest user message:\n${message}`
        : message;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Helpful, concise response for the user.",
              },
              recommendedEventIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exact event IDs from the live catalog referenced or recommended in the reply.",
              },
            },
            required: ["reply", "recommendedEventIds"],
          },
        },
      });

      const raw = (response.text ?? "{}").trim();
      const parsed = JSON.parse(raw);
      res.json({
        reply: typeof parsed.reply === "string" ? parsed.reply : "I could not generate a response.",
        recommendedEventIds: Array.isArray(parsed.recommendedEventIds) ? parsed.recommendedEventIds : [],
      });
    } catch (error) {
      const { status, message } = getErrorStatus(error);
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { title, category, venue, date, roughNotes } = req.body ?? {};
      if (!title || typeof title !== "string") {
        res.status(400).json({ error: "Provide an event title so the AI can draft the description." });
        return;
      }

      const ai = getAiClient();
      const prompt = `Draft a crisp, engaging campus event description and suggest the single best category.
Event Title: ${title}
Current Category Input: ${category || "Not specified"}
Venue: ${venue || "Campus Hall"}
Date: ${date || "Upcoming"}
Additional Notes: ${roughNotes || "None"}

Valid categories (pick exactly one): Hackathons, Workshops, Technical Events, Sports, Cultural Programs, Club Activities.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            "You write clear, student-friendly campus event copy without buzzword fluff. Include what attendees will learn or experience, who should join, and key logistics in 2-3 tight paragraphs.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "Polished event description (80-130 words).",
              },
              suggestedCategory: {
                type: Type.STRING,
                description:
                  "One of: Hackathons, Workshops, Technical Events, Sports, Cultural Programs, Club Activities.",
              },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 concise takeaway bullet phrases.",
              },
            },
            required: ["description", "suggestedCategory", "highlights"],
          },
        },
      });

      const raw = (response.text ?? "{}").trim();
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch (error) {
      const { status, message } = getErrorStatus(error);
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { events = [], interests = [], registeredEventIds = [] } = req.body ?? {};
      if (!Array.isArray(events) || events.length === 0) {
        res.json({ recommendations: [] });
        return;
      }

      const ai = getAiClient();
      const openEvents = events
        .filter((e: Record<string, unknown>) => !registeredEventIds.includes(e.id))
        .map((e: Record<string, unknown>) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          date: e.date,
          venue: e.venue,
          description: e.description,
        }));

      if (openEvents.length === 0) {
        res.json({ recommendations: [] });
        return;
      }

      const prompt = `Student interests: ${Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "Hackathons, AI, Design, Campus Culture"}
Available events: ${JSON.stringify(openEvents)}

Pick up to 3 best-fit events and write a concise 1-sentence reason why each matches the student's interests.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            "Select up to 3 relevant campus events from the provided list and give a crisp, specific 1-sentence reason for each.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    eventId: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ["eventId", "reason"],
                },
              },
            },
            required: ["recommendations"],
          },
        },
      });

      const raw = (response.text ?? "{}").trim();
      const parsed = JSON.parse(raw);
      res.json({
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [],
      });
    } catch (error) {
      const { status, message } = getErrorStatus(error);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Pulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
