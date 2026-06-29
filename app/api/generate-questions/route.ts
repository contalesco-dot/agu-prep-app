import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Atue como examinador CESPE/Cebraspe para carreiras jurídicas de alto nível.
Cada excerto fornecido pelo usuário é verdade absoluta.
Faça um item Certo/Errado por excerto, com distribuição aproximada de 50% Certo e 50% Errado.
Não use metalinguagem. Não omita informação relevante.
Formato:
JULGUE CERTO OU ERRADO
[Texto do item]
GABARITO: [✅ Certo / ❌ Errado] — [Justificativa técnica concisa com trecho decisivo em negrito e caixa alta].`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
  const body = await request.json();
  const excerpts = String(body.excerpts || "").trim();
  if (!excerpts) return NextResponse.json({ error: "Envie ao menos um excerto." }, { status: 400 });
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4.1", input: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: excerpts }] })
  });
  if (!response.ok) return NextResponse.json({ error: "Falha ao gerar questões." }, { status: 500 });
  const data = await response.json();
  return NextResponse.json({ text: data.output_text || "" });
}
