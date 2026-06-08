import express from "express";
import { join } from "path";
import { fileURLToPath } from "url";

import { createBookingRouter } from "./routes/booking.js";
import { getGoogleScriptUrl } from "./services/googleScriptService.js";

const DEFAULT_PORT = 3000;
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function createServer(options?: {
  notifyAdmin?: (message: string, extra?: Record<string, unknown>) => Promise<void>;
}) {
  const notifyAdmin = options?.notifyAdmin ?? (() => Promise.resolve());
  const app = express();

  app.use(express.json());

  app.use(express.static(join(__dirname, "../../dist/miniapp")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/slots", async (_req, res) => {
    const url = getGoogleScriptUrl();
    if (!url) return res.json({ slots: [] });

    try {
      const response = await fetch(url);
      const data = (await response.json()) as { ok: boolean; slots?: { date: string; time: string }[] };
      if (!data.ok || !Array.isArray(data.slots)) return res.json({ slots: [] });
      return res.json({ slots: data.slots });
    } catch {
      return res.json({ slots: [] });
    }
  });

  app.use("/api", createBookingRouter(notifyAdmin));

  return app;
}

export function startServer(
  options?: { notifyAdmin?: (message: string, extra?: Record<string, unknown>) => Promise<void> },
  port = Number(process.env.PORT ?? DEFAULT_PORT)
) {
  const app = createServer(options);

  return app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
  });
}
