import type { Metadata } from "next";
import { Lexend, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ThemeProvider from "@/providers/ThemeProvider";
import Script from "next/script";

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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://german-virtual-school.vercel.app";

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "German Virtual School",
      alternateName: "GVS",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/gvs-logo.png`,
        width: 512,
        height: 512,
      },
      image: `${baseUrl}/images/gvs-marketing-banner.webp`,
      description: "The premier online platform for learning German with live classes, expert teachers, and comprehensive resources for A1-C2 proficiency levels.",
      email: "germanvirtualschool@gmail.com",
      telephone: "+254742318300",
      sameAs: [
        "https://twitter.com/germanvirtualschool",
        "https://www.facebook.com/germanvirtualschool",
        "https://www.instagram.com/germanvirtualschool",
      ],
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#school`,
      name: "German Virtual School",
      description: "Online German language school offering live classes for all proficiency levels from A1 to C2, including TestDaF and TestAS exam preparation.",
      url: baseUrl,
      logo: `${baseUrl}/gvs-logo.png`,
      areaServed: {
        "@type": "Place",
        name: "Worldwide",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "German Language Courses",
        itemListElement: [
          {
            "@type": "Course",
            name: "German A1 - Beginner",
            description: "Foundation course for absolute beginners in German language.",
            provider: { "@id": `${baseUrl}/#school` },
          },
          {
            "@type": "Course",
            name: "German A2 - Elementary",
            description: "Build on basics and develop everyday German conversation skills.",
            provider: { "@id": `${baseUrl}/#school` },
          },
          {
            "@type": "Course",
            name: "German B1 - Intermediate",
            description: "Achieve conversational fluency and grammar mastery.",
            provider: { "@id": `${baseUrl}/#school` },
          },
          {
            "@type": "Course",
            name: "German B2 - Upper Intermediate",
            description: "Advanced communication skills for professional and academic settings.",
            provider: { "@id": `${baseUrl}/#school` },
          },
          {
            "@type": "Course",
            name: "German C1 - Advanced",
            description: "Near-native proficiency with complex text and speech comprehension.",
            provider: { "@id": `${baseUrl}/#school` },
          },
          {
            "@type": "Course",
            name: "TestDaF Preparation",
            description: "Intensive preparation for the Test Deutsch als Fremdsprache examination.",
            provider: { "@id": `${baseUrl}/#school` },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "German Virtual School",
      description: "Master the German language with live classes and expert tutors",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/courses?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "German Virtual School - Learn German Online with Live Classes",
    template: "%s | German Virtual School",
  },
  description: "Master German online with live expert-led classes. From A1 to C2, TestDaF & TestAS prep, STEM courses, and intercultural training. Verified certificates included. Join German Virtual School today!",
  keywords: [
    "German Virtual School",
    "Learn German Online",
    "German Language Course",
    "German Classes Online",
    "German A1 Course",
    "German A2 Course", 
    "German B1 Course",
    "German B2 Course",
    "German C1 Course",
    "TestDaF Preparation",
    "TestAS Exam",
    "German for STEM",
    "Study in Germany",
    "German Language School",
    "Online German Lessons",
    "Live German Classes",
    "German Tutor Online",
    "Deutsch lernen online",
  ],
  authors: [{ name: "German Virtual School", url: baseUrl }],
  creator: "German Virtual School",
  publisher: "German Virtual School",
  applicationName: "German Virtual School",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Education",
  classification: "Language Learning",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["de_DE"],
    url: baseUrl,
    title: "German Virtual School - Master the German Language Online",
    description: "Join expert-led live German classes. A1-C2 levels, TestDaF prep, STEM courses. Verified certificates. Start your German journey today!",
    siteName: "German Virtual School",
    countryName: "Germany",
    images: [
      {
        url: "/images/gvs-marketing-banner.webp",
        width: 1200,
        height: 1200,
        alt: "German Virtual School - Master German Online with Live Expert Classes",
        type: "image/webp",
      },
      {
        url: "/gvs-logo.png",
        width: 512,
        height: 512,
        alt: "German Virtual School Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "German Virtual School - Learn German Online",
    description: "Master German with live classes from A1 to C2. TestDaF prep, STEM courses & verified certificates. Start today!",
    images: ["/images/gvs-marketing-banner.webp"],
    creator: "@germanvirtualschool",
    site: "@germanvirtualschool",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": baseUrl,
      "de-DE": baseUrl,
    },
  },
  verification: {
    // Add your Google Search Console verification code here after setup
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  other: {
    "msapplication-TileColor": "#1e3a5f",
    "theme-color": "#1e3a5f",
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
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
