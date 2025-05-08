import type { Metadata } from "next";
import { Ubuntu_Sans } from "next/font/google";
import "./globals.css";
import { UserAuthProvider } from "@/context/UserAuthContext";

const ubuntuSans = Ubuntu_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Specify the weights you need
});

export const metadata: Metadata = {
  title: "Cargoo",
  description: "Cargoo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntuSans.className}`}>
        <UserAuthProvider>
          {children}
        </UserAuthProvider>
      </body>
    </html>
  );
}
