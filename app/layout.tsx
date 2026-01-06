import type { Metadata } from "next";
import { Lexend, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ThemeProvider from "@/providers/ThemeProvider";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "German Virtual School",
    template: "%s | German Virtual School",
  },
  description: "The premier online platform for learning German. Live classes, expert teachers, and comprehensive resources for all proficiency levels (A1-C2).",
  keywords: ["German", "Learn German", "Online School", "Language Learning", "A1", "A2", "B1", "B2", "C1", "C2", "Live Classes"],
  authors: [{ name: "German Virtual School" }],
  creator: "German Virtual School",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "German Virtual School - Master the German Language",
    description: "Join our expert-led live classes and access world-class resources to master German from anywhere in the world.",
    siteName: "German Virtual School",
    images: [
      {
        url: "/gvs-logo.png",
        width: 800,
        height: 800,
        alt: "German Virtual School Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "German Virtual School",
    description: "Master the German language with live classes and expert tutors.",
    images: ["/gvs-logo.png"],
    creator: "@germanvirtualschool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${lexend.variable} ${notoSans.variable} font-body antialiased`}
      >
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
