import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import cors from "cors";

// Provide instructions on how to set up the Google Sheet.
// 1. Create a Google Service Account in GCP and get the email and private key.
// 2. Create a Google Sheet and get the ID from the URL (https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit).
// 3. Share the Google Sheet with the Service Account email.
// 4. Create headers in the first row: "Name", "Phone", "Service", "Date", "Time", "Notes", "Status", "Created At"

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API route to accept a booking and write to Google Sheets
app.post("/api/book", async (req, res) => {
  const { name, phone, service, date, time, notes } = req.body;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Replace \\n with actual newlines in case it's escaped in .env
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return res.status(500).json({
      error: "Google Sheets connection not configured.",
      details: "Please provide GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID in environment variables.",
    });
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    const request = {
      spreadsheetId: sheetId,
      range: "Sheet1!A:H", // Adjust if your sheet name is different
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [
          [
            name,
            phone,
            service,
            date,
            time,
            notes || "",
            "Pending",
            new Date().toISOString()
          ],
        ],
      },
    };

    const response = await sheets.spreadsheets.values.append(request);
    
    res.json({ success: true, message: "Booking confirmed successfully!" });
  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
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
