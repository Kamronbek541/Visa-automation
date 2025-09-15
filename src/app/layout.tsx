// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <-- ВОТ ЭТА ВАЖНАЯ СТРОКА
import { TranslationProvider } from "@/contexts/TranslationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Visa Automation UZ",
  description: "Automating visa processes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={inter.className}>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}