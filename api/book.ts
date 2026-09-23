export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, service, date, time, notes } = req.body || {};

  // Validate customer name
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Họ và tên không hợp lệ (tối thiểu 2 ký tự).' });
  }

  // Validate Vietnamese phone number
  const cleanPhone = (phone || '').toString().replace(/[\s.\-()]/g, '');
  const vnPhoneRegex = /^(?:(?:\+?84)|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9]|2[48][0-9])[0-9]{7}$/;
  if (!vnPhoneRegex.test(cleanPhone)) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ (Ví dụ: 0912 345 678).' });
  }

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
