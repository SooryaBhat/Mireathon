import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIRAETHON 2026 | AI Meets Business",
  description: "Official Business Innovation Hackathon presented by Department of Artificial Intelligence and Data Science, Srinivas Institute of Technology.",
  icons: {
    icon: [
      { url: "/New_images/character.png?v=2026", type: "image/png" },
      { url: "/favicon-32x32.png?v=2026", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2026", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/New_images/character.png?v=2026",
    apple: "/apple-touch-icon.png?v=2026",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} ${inter.variable} dark scroll-smooth`}
    >
      <head>
        <link rel="icon" href="/New_images/character.png?v=2026" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/New_images/character.png?v=2026" type="image/png" />
        <link rel="apple-touch-icon" href="/New_images/character.png?v=2026" />
      </head>
      <body className="min-h-screen bg-[#05050a] text-gray-100 font-sans antialiased selection:bg-[#8a2be2] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
