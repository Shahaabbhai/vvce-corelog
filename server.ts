import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Shared Gemini client with telemetry header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { description, imageBase64, mimeType, existingComplaints = [] } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          priority: { type: Type.STRING },
          department: { type: Type.STRING },
          urgency_score: { type: Type.NUMBER },
          resolution_estimate: { type: Type.NUMBER },
          sentiment: { type: Type.STRING },
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING },
          related_context: { type: Type.STRING },
          confidence_score: { type: Type.NUMBER },
          is_duplicate: { type: Type.BOOLEAN },
          duplicate_ref: { type: Type.STRING }
        },
        required: [
          "category", "priority", "department", "urgency_score", 
          "resolution_estimate", "sentiment", "summary", 
          "explanation", "confidence_score", "is_duplicate"
        ]
      };

      const prompt = `
        As a campus operations AI for VVCE CoreLog, analyze this issue report:
        "${description}"
        
        Compare against existing recent issues if possible:
        ${JSON.stringify(existingComplaints.slice(0, 5))}

        Categorize into: Network, Electrical, Plumbing, Maintenance, Security, Hardware, Software, Other.
        Priority: High, Medium, Low.
        Department: IT, Electrical, Facilities, Security, General.
        
        Provide intelligence:
        1. Urgency Score: 0-100.
        2. Resolution Estimate: Expected hours.
        3. Sentiment: Neutral, Frustrated, Urgent, Positive.
        4. Summary: 1-sentence technical overview.
        5. Confidence: AI's certainty in this analysis (0-1).
        6. Duplicate Detection: Check if similar to existing issues.
      `;

      const contents: any[] = [{ text: prompt }];
      
      if (imageBase64 && mimeType) {
        contents.push({
          inlineData: {
            data: imageBase64.split(",")[1] || imageBase64,
            mimeType: mimeType
          }
        });
      }

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: contents }],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: error.message || "AI Analysis failed" });
    }
  });

  app.post("/api/ai/chat-suggest", async (req, res) => {
    try {
      const { complaintContext, history, role } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const prompt = `
        As a campus operations support AI for VVCE CoreLog, suggest 3 quick responses for the ${role} to send.
        
        Complaint Context: "${complaintContext}"
        
        Recent History:
        ${history.map((h: any) => `${h.role}: ${h.message}`).join("\n")}
        
        Requirements:
        1. Keep responses concise and professional.
        2. If student, focus on providing more info or checking status.
        3. If admin, focus on acknowledging, asking for details, or providing updates.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const suggestions = JSON.parse(result.text || "[]");
      res.json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
    } catch (error: any) {
      console.error("AI suggest error:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // Vite middleware for development
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

startServer();
