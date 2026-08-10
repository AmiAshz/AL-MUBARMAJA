import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const oswald = Oswald({ subsets: ["latin"], variable: '--font-oswald' });

export const metadata: Metadata = {
  title: "Vantara | The Journey Behind Every Repair",
  description: "Vantara is a modern digital platform for vehicle workshops to manage every vehicle that enters the workshop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} scroll-smooth`}>
      <body className="bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
