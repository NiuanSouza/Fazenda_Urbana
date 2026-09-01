import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Green City — Fazenda Urbana",
  description: "Sistema inteligente de gerenciamento de fazenda urbana. Controle produção, insumos, irrigação e sensores.",
  keywords: "fazenda urbana, agricultura urbana, gestão agrícola, IoT, sensores, irrigação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem("theme");
                  if (saved === "dark" || saved === "light") {
                    document.documentElement.setAttribute("data-theme", saved);
                  } else {
                    document.documentElement.setAttribute("data-theme", "light");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
