import express from "express";

const DEFAULT_PORT = 3000;

export function createServer() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/status", (_req, res) => {
    res.json({
      ok: true,
      project: "TutorBook Mini CRM",
      stage: "foundation",
      features: {
        backend: "ready",
        bot: "skeleton",
        miniapp: "placeholder",
        googleScript: "prepared",
        googleSheetsApi: "not_used",
        payments: "not_implemented"
      }
    });
  });

  return app;
}

export function startServer(port = Number(process.env.PORT ?? DEFAULT_PORT)) {
  const app = createServer();

  return app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
  });
}
