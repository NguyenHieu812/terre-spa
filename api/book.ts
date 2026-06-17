export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, service, date, time, notes } = req.body;
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return res.status(500).json({
      error: "Google Sheets Web App URL not configured.",
      details: "Please provide GOOGLE_APPS_SCRIPT_URL in Vercel environment variables.",
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
      return res.status(200).json({ success: true, message: "Booking confirmed successfully!" });
    } else {
      return res.status(500).json({ error: data.error || `Script returned status: ${response.status}` });
    }
  } catch (error: any) {
    console.error("Google Sheets Web App Error:", error);
    return res.status(500).json({
      error: "Failed to save booking to Google Sheets.",
      details: error.message,
    });
  }
}
