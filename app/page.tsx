"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { defaultGoals } from "../lib/defaultData";
import { supabase } from "../lib/supabaseClient";

type View = "dashboard" | "fila" | "calendario" | "erros" | "ia";
type AuthMode = "login" | "signup";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [generated, setGenerated] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const subjects = useMemo(
    () => [...new Set(defaultGoals.map((goal) => goal.subject))],
    []
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimerSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  async function handleAuth() {
    setAuthMessage("");
    if (!email || !password) {
      setAuthMessage("Preencha e-mail e senha.");
      return;
    }

    setAuthLoading(true);
    const result = authMode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setAuthLoading(false);

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }

    if (authMode === "signup") {
      setAuthMessage("Conta criada. Se o Supabase pedir confirmacao, verifique seu e-mail.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

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

  if (authLoading && !user) {
    return <div className="auth-shell"><div className="auth-card"><div className="brand">AGU Prep</div><p className="muted">Carregando...</p></div></div>;
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand">AGU Prep</div>
          <h1>{authMode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="muted">Acesse seu painel de estudos em qualquer lugar.</p>
          <label>E-mail</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="seu@email.com" />
          <label>Senha</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="minimo de 6 caracteres" />
          {authMessage && <p className="auth-message">{authMessage}</p>}
          <button className="btn gold" onClick={handleAuth} disabled={authLoading}>{authMode === "login" ? "Entrar" : "Criar conta"}</button>
          <button className="auth-link" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthMessage(""); }}>
            {authMode === "login" ? "Ainda nao tenho conta" : "Ja tenho conta"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">AGU Prep</div>
        <div className="user-box">
          <div className="label">Logado como</div>
          <div className="muted">{user.email}</div>
          <button className="btn outline" onClick={signOut}>Sair</button>
        </div>
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
              <p>Login conectado ao Supabase. O proximo passo e salvar metas, sessoes e erros no banco.</p>
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
                <div className="label">Conta</div>
                <div className="value">OK</div>
                <p className="muted">{user.email}</p>
              </div>
            </div>

            <div className="section-title">Proximos passos</div>
            <div className="card">
              <p>Agora podemos conectar calendario, fila diaria, questoes e caderno de erros ao banco.</p>
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
