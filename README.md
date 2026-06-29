# AGU Prep App

Esta pasta é a base para transformar seu HTML em um app acessível por link, com login e banco de dados.

## Caminho simples para você

1. Criar conta no Supabase.
2. Criar projeto no Supabase.
3. Rodar o arquivo `supabase/schema.sql` no SQL Editor do Supabase.
4. Criar conta na Vercel.
5. Publicar esta pasta na Vercel.
6. Preencher as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`

Depois disso, você abre por um link em casa ou no trabalho.

## Observação importante

A chave da OpenAI fica no servidor da Vercel, não dentro do navegador.
