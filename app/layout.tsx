import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "المبرمج | صيانة وتشخيص وإصلاح المركبات باحترافية",
  description:
    "المبرمج — صيانة وتشخيص وإصلاح المركبات باحترافية. عناية تتواجد مع كل عملية إصلاح.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${montserrat.variable} bg-background scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
