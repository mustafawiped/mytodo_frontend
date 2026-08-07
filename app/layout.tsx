import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const previewImage = `${protocol}://${host}/og.png`;

  return {
    title: "MyToDo! — Gününü sadeleştir",
    description: "Görevlerini oluştur, takip et ve gününü daha berrak planla.",
    openGraph: {
      title: "MyToDo! — Gününü sadeleştir",
      description: "Görevlerini oluştur, takip et ve gününü daha berrak planla.",
      images: [{ url: previewImage, width: 1536, height: 864, alt: "MyToDo! sosyal önizleme kartı" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "MyToDo! — Gününü sadeleştir",
      description: "Görevlerini oluştur, takip et ve gününü daha berrak planla.",
      images: [previewImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
