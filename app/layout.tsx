import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Script } from "next/script";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M3U Player",
  description: "Uses publicly hosted IPTV channels to display content.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
    <head>
     <Script src="https://cloud.umami.is/script.js" data-website-id="4ab95a7b-c6aa-48d5-a646-30591cbc56da" defer />
    </head>
      <body
        className={`${jetbrainsMono.variable} antialiased bg-neutral-950 text-neutral-200 font-mono`}
      >
        {children}
      </body>
    </html>
  );
}
