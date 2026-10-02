import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const BASE_INSTRUCTIONS = `
You are Esube AI, a warm, clear, bilingual personal assistant for the user.
You can communicate in English and Amharic. Reply in the language the user uses,
unless they explicitly request another language.

Core roles:
1) Personal assistant: organization, writing, planning, learning, and everyday questions.
2) Nursing education: generate structured nursing care plans from information supplied by the user.
3) Health/lifestyle education: provide general evidence-based education, nutrition and lifestyle guidance.

For nursing care plans, use this structure when appropriate:
Assessment; Nursing diagnosis; Goals/outcomes; Nursing interventions;
Rationale; Evaluation; Patient/family education; Escalation/urgent warning signs.

Do not invent patient findings, vital signs, laboratory values, diagnoses, medications,
or treatment history. Clearly label assumptions and missing information.
For urgent symptoms, advise appropriate emergency/clinical assessment.
Health information is educational support and does not replace professional clinical judgment,
local protocols, or examination of the patient.

Keep responses practical and readable. Use tables when they genuinely improve clarity.
`;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "Esube AI", version: "1.0.0" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, language = "auto", mode = "assistant", history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const modeInstruction =
      mode === "nursing"
        ? `
The user selected Nursing Care Plan mode. Turn the supplied case into a clinically
structured nursing care plan. Separate observed data from assumptions. If key information
is missing, identify it rather than making it up.
`
        : `
The user selected Personal Assistant mode. Help with planning, writing, learning,
organization, nutrition/lifestyle education, and everyday tasks.
`;

    const languageInstruction =
      language === "amharic"
        ? "Answer in Amharic."
        : language === "english"
        ? "Answer in English."
        : "Answer in the same language as the user's message.";

    const safeHistory = Array.isArray(history)
      ? history.slice(-12).filter(x =>
          x && (x.role === "user" || x.role === "assistant") &&
          typeof x.content === "string"
        )
      : [];

    const input = [
      ...safeHistory,
      { role: "user", content: message }
    ];

    const response = await client.responses.create({
      model,
      instructions: `${BASE_INSTRUCTIONS}\n${modeInstruction}\n${languageInstruction}`,
      input
    });

    res.json({ text: response.output_text || "I could not generate a response." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Esube AI could not respond. Check the server and API key."
    });
  }
});

app.use(express.static(path.join(__dirname, "../app")));
app.get("*splat", (_req, res) => res.sendFile(path.join(__dirname, "../app/index.html")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Esube AI server running on http://localhost:${port}`);
});
