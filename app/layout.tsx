import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
import "./globals.css";

// Pixelated Elegance by GGBotNet — CC0 1.0 (public domain, no attribution
// required). See public/fonts/CREDIT.txt. Not on Google Fonts, so it's
// self-hosted here.
const pixelatedElegance = localFont({
  src: "../public/fonts/PixelatedElegance.woff",
  variable: "--font-pixel",
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sejal Agarwal",
  description:
    "Software & UI/UX engineer building intuitive, AI-powered interfaces. Explore a cozy pixel-art portfolio.",
  openGraph: {
    title: "Sejal Agarwal",
    description:
      "Software & UI/UX engineer building intuitive, AI-powered interfaces.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixelatedElegance.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
