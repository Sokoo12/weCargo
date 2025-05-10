import type { Metadata } from "next";
import { Ubuntu_Sans } from "next/font/google";
import "./globals.css";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { PerformanceProvider } from "@/components/providers/performance-provider";
import { RouteLoadingIndicator } from "@/components/ui/route-loading";

// Optimize font loading
const ubuntuSans = Ubuntu_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap", // Ensure text is visible during font loading
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Cargoo",
    template: "%s | Cargoo"
  },
  description: "Cargoo - Fast and reliable cargo management",
  metadataBase: new URL("https://wecargo.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to origin to improve loading performance */}
        <link rel="preconnect" href="/" />
        
        {/* Properly preload critical assets with correct 'as' attribute */}
        <link 
          rel="preload" 
          href="/logo.png" 
          as="image" 
        />
        <link 
          rel="preload" 
          href="/assets/images/rocket-launch.png" 
          as="image" 
        />
      </head>
      <body className={`${ubuntuSans.className}`}>
        <RouteLoadingIndicator />
        <PerformanceProvider>
          <UserAuthProvider>
            {children}
          </UserAuthProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}
