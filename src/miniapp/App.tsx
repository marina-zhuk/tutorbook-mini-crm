import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

export function App() {
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Telegram Mini App</p>
        <h1>TutorBook Mini CRM</h1>
        <p className="subtitle">Запись на занятие по английскому языку</p>
        <button className="primary-button" type="button">
          Начать запись
        </button>
      </section>
    </main>
  );
}
