import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  metadataBase: new URL("https://mocktestsacademy.com"),
  title: {
    default: "MTacademy | PMA Mock Test Platform & Initial Test Preparation",
    template: "%s | MTacademy",
  },
  description:
    "MTacademy is Pakistan's premier preparation platform for the Pakistan Military Academy (PMA) Long Course initial tests. Practice Verbal Intelligence, Non-Verbal Intelligence, and Academic mock exams with authentic computer-based timers, instant grading, and performance analysis.",
  keywords: [
    "PMA Long Course",
    "PMA Initial Test",
    "PMA Mock Test",
    "Verbal Intelligence Test",
    "Non-Verbal Intelligence Test",
    "Academic Test PMA",
    "Pakistan Army Initial Test",
    "MTacademy",
    "Mock Tests Academy",
    "PMA Test Preparation",
    "ISSB Preparation",
    "Army Initial Test MCQs",
  ],
  authors: [{ name: "MTacademy", url: "https://mocktestsacademy.com" }],
  creator: "MTacademy",
  publisher: "MTacademy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://mocktestsacademy.com",
  },
  openGraph: {
    title: "MTacademy | PMA Mock Test Platform & Initial Test Preparation",
    description:
      "Practice PMA Long Course Verbal, Non-Verbal Intelligence, and Academic examinations with authentic timed simulations and comprehensive scoring.",
    url: "https://mocktestsacademy.com",
    siteName: "Mock Tests Academy (MTacademy)",
    images: [
      {
        url: "https://mocktestsacademy.com/logo.png",
        width: 800,
        height: 800,
        alt: "MTacademy - PMA Mock Test Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MTacademy | PMA Mock Test Platform",
    description:
      "Prepare for PMA Long Course tests with authentic Verbal, Non-Verbal, and Academic mock exams.",
    images: ["https://mocktestsacademy.com/logo.png"],
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://mocktestsacademy.com/#organization",
      name: "MTacademy - Mock Tests Academy",
      url: "https://mocktestsacademy.com",
      logo: "https://mocktestsacademy.com/logo.png",
      description:
        "Specialized examination preparation platform for Pakistan Military Academy (PMA) Long Course initial examinations.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://mocktestsacademy.com/#website",
      url: "https://mocktestsacademy.com",
      name: "MTacademy",
      publisher: {
        "@id": "https://mocktestsacademy.com/#organization",
      },
    },
    {
      "@type": "Course",
      name: "PMA Long Course Initial Mock Examination Preparation",
      description:
        "Comprehensive practice modules for Verbal Intelligence (84 MCQs), Non-Verbal Intelligence (64 MCQs), and Academic Tests (English, Maths, Physics, Pak Studies, Islamiyat, GK).",
      provider: {
        "@id": "https://mocktestsacademy.com/#organization",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amarante&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body>
        <AuthProvider>
          <ToastProvider>
            {/* Navbar is global and appears on every page */}
            <Navbar />

            {children}
          </ToastProvider>
        </AuthProvider>

        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}
