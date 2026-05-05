import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Email
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body, html } = req.body;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Simulate success if no API key is provided
      console.log("SIMULATED EMAIL SEND (No API Key):", { to, subject });
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Email simulated successfully (add RESEND_API_KEY for real sending)" 
      });
    }

    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: 'Decision OS <onboarding@resend.dev>', // Resend default for free accounts
        to: [to],
        subject: subject,
        text: body,
        html: html || `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">${body.replace(/\n/g, '<br>')}</div>`
      });

      if (error) {
        return res.status(400).json({ success: false, error });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      console.error("Email send error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Provide info about whether Resend is configured
  app.get("/api/config", (req, res) => {
    res.json({
      resendConfigured: !!process.env.RESEND_API_KEY
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
