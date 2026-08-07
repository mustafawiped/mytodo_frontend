import type { Metadata } from "next";
import { Hanken_Grotesk, Montserrat } from "next/font/google";
import "./globals.css";

const bodyFont = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyToDo! — Yapılacaklar ve notlar",
  description: "Yapılacaklarını ve kısa notlarını sade bir alanda tut.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  );
}
