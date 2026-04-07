import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const metadata: Metadata = {
  title: "CSE Memories | A Journey Through Time",
  description: "A digital archive of memories, students, and stories from the Computer Science Engineering department.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark overflow-x-hidden", inter.variable, cormorant.variable, caveat.variable)} suppressHydrationWarning>
      <body className="bg-primary text-white font-body selection:bg-accent selection:text-white overflow-x-hidden w-full">
        <AuthProvider>
          {/* Film grain overlay */}
          <div className="grain-overlay" aria-hidden="true" />
          
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
