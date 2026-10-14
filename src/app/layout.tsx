import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Stiphantube | حمّل الفيديوهات بسهولة وسرعة",
  description:
    "Stiphantube — حمّل الفيديوهات من يوتيوب وفيسبوك وإنستغرام وتيك توك وجميع المنصات بسهولة وسرعة.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="min-h-screen bg-[#050506] font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
