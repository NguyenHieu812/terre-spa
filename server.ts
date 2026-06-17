import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

// Provide instructions on how to set up the Google Sheet via Apps Script
// 1. Open your Google Sheet. Go to Extensions > Apps Script.
// 2. Paste the provided Apps Script code (see UI) into the editor.
// 3. Click Deploy > New deployment.
// 4. Select "Web app" type.
// 5. Execute as: "Me", Who has access: "Anyone".
// 6. Click Deploy, authorize permissions, and copy the "Web app URL".
// 7. Paste that URL into the GOOGLE_APPS_SCRIPT_URL environment variable.

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API route to accept a booking and write to Google Sheets via Apps Script Web App
app.post("/api/book", async (req, res) => {
  const { name, phone, service, date, time, notes } = req.body;
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return res.status(500).json({
      error: "Google Sheets Web App URL not configured.",
      details: "Please provide GOOGLE_APPS_SCRIPT_URL in environment variables. You can find instructions in the application UI.",
    });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone, service, date, time, notes }),
    });
    
    // We expect the script to return a JSON success message
    const data = await response.json().catch(() => ({}));
    
    if (data.success || response.ok) {
      res.json({ success: true, message: "Booking confirmed successfully!" });
    } else {
      throw new Error(data.error || `Script returned status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Google Sheets Web App Error:", error);
    res.status(500).json({
      error: "Failed to save booking to Google Sheets.",
      details: error.message,
    });
  }
});

async function startServer() {
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
