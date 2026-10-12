import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Bold typographic pairing: Editorial Authority + Machine Precision
const garamond = EB_Garamond({ 
  subsets: ["latin"], 
  variable: "--font-garamond",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({ 
  weight: ["400", "600"], 
  subsets: ["latin"], 
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synthesizer | Unbiased Extraction",
  description: "Objective, PII-scrubbed engineering matrix extraction powered by multimodal native PDF streaming.",
  alternates: {
    canonical: "https://your-custom-domain.com",
  },
  openGraph: {
    title: "Synthesizer | Unbiased Extraction",
    description: "Clinical evaluation of engineering profiles.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Synthesizer Interface" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={`${garamond.variable} ${plexMono.variable} font-serif bg-[#F4F1EA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-[#E8E6E3] min-h-screen selection:bg-[#D95D39] selection:text-white transition-colors duration-0`}>
        {children}
      </body>
    </html>
  );
}