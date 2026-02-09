import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex.provider";
import ErrorBoundary from "@/components/ui/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Catan Online - Play the Classic Board Game",
  description:
    "Experience the strategic gameplay of Catan online with friends. Build, trade, and conquer your way to victory.",
  keywords: [
    "catan",
    "board game",
    "online game",
    "strategy game",
    "multiplayer",
  ],
  authors: [{ name: "Catan Online Team" }],
  openGraph: {
    title: "Catan Online",
    description: "Play Catan online with friends",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl={`/sign-in`}
      signUpUrl={`/sign-up`}
      signInFallbackRedirectUrl={`/`}
      signUpFallbackRedirectUrl={`/`}
    >
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
          style={{
            fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          }}
        >
          <ErrorBoundary>
            <ConvexClientProvider>
              <TooltipProvider>
                {children}
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </ConvexClientProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
