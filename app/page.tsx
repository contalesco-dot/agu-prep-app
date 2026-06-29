"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultGoals } from "../lib/defaultData";

type View = "dashboard" | "fila" | "calendario" | "erros" | "ia";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [generated, setGenerated] = useState("");

  const subjects = useMemo(
    () => [...new Set(defaultGoals.map((goal) => goal.subject))],
    []
  );

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimerSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  function buildLocalPrompt() {
    const normalized = excerpt.replace(/\r/g, "").trim();
    const blocks = normalized
      ? normalized.split("\n\n").map((item) => item.trim()).filter(Boolean)
      : [];
    const excerpts = blocks.length > 1
      ? blocks
      : normalized.split("\n").map((item) => item.trim()).filter(Boolean);

    setGenerated([
      "Batch preparado para IA segura no servidor.",
      "",
      "Excertos: " + excerpts.length,
      "",
      ...excerpts.map((item, index) => "[" + (index + 1) + "] " + item),
    ].join("\n"));
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">AGU Prep</div>
        <div className="nav">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Dashboard</button>
          <button className={view === "fila" ? "active" : ""} onClick={() => setView("fila")}>Fila Diaria</button>
          <button className={view === "calendario" ? "active" : ""} onClick={() => setView("calendario")}>Calendario</button>
          <button className={view === "erros" ? "active" : ""} onClick={() => setView("erros")}>Erros</button>
          <button className={view === "ia" ? "active" : ""} onClick={() => setView("ia")}>Gerar CESPE</button>
        </div>
      </aside>

      <main className="main">
        {view === "dashboard" && (
          <>
            <section className="hero">
              <h1>Seu painel AGU sincronizado</h1>
              <p>Base para virar app com login, banco de dados e acesso por link.</p>
            </section>

            <div className="grid">
              <div className="card">
                <div className="label">Metas</div>
                <div className="value">{defaultGoals.length}</div>
              </div>
              <div className="card">
                <div className="label">Materias</div>
                <div className="value">{subjects.length}</div>
              </div>
              <div className="card">
                <div className="label">Status</div>
                <div className="value">Base</div>
                <p className="muted">Pronto para Supabase/Vercel.</p>
              </div>
            </div>

            <div className="section-title">Proximos passos</div>
            <div className="card">
              <p>Conectar Supabase, ativar login e migrar os dados do HTML atual.</p>
            </div>
          </>
        )}

        {view === "fila" && (
          <>
            <section className="hero">
              <h1>Fila diaria</h1>
              <p>As metas avancam conforme conclusao real.</p>
            </section>

            <div className="grid">
              {defaultGoals.map((goal, index) => (
                <div className="card" key={goal.id}>
                  <div className="label">{index === 0 ? "Hoje" : "D+" + index}</div>
                  <h3>Meta {goal.id}</h3>
                  <p>{goal.title}</p>
                  <p className="muted">{goal.subject}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {view === "calendario" && (
          <>
            <section className="hero">
              <h1>Calendario e tempo liquido</h1>
              <p>O proximo passo e salvar estas sessoes no Supabase.</p>
            </section>

            <div className="card">
              <div className="label">Cronometro</div>
              <div className="value">{new Date(timerSeconds * 1000).toISOString().slice(11, 19)}</div>
              <div className="row">
                <button className="btn gold" onClick={() => setRunning(true)}>Iniciar</button>
                <button className="btn outline" onClick={() => setRunning(false)}>Pausar</button>
                <button className="btn outline" onClick={() => { setRunning(false); setTimerSeconds(0); }}>Zerar</button>
              </div>
            </div>
          </>
        )}

        {view === "erros" && (
          <>
            <section className="hero">
              <h1>Caderno de erros</h1>
              <p>Base para salvar erros por meta e materia no banco.</p>
            </section>
            <textarea className="textarea" placeholder="Cole seus erros, teses corretas e gatilhos de memoria..." />
          </>
        )}

        {view === "ia" && (
          <>
            <section className="hero">
              <h1>Gerar itens CESPE</h1>
              <p>A geracao real ficara em rota segura no servidor.</p>
            </section>
            <textarea className="textarea" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Cole os excertos aqui..." />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn gold" onClick={buildLocalPrompt}>Preparar batch</button>
            </div>
            {generated && <pre className="card" style={{ whiteSpace: "pre-wrap" }}>{generated}</pre>}
          </>
        )}
      </main>
    </div>
  );
}
