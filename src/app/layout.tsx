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
    icon: "/New_images/character.png",
    shortcut: "/New_images/character.png",
    apple: "/New_images/character.png",
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
      <body className="min-h-screen bg-[#05050a] text-gray-100 font-sans antialiased selection:bg-[#8a2be2] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
