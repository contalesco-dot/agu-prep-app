import "./globals.css";

export const metadata = { title: "AGU Prep", description: "Ciclo de estudos AGU com login, calendário e IA." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
