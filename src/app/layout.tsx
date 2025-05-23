import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useThemeContext";

// Importar los estilos de autenticación
import "../../public/auth-styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--card-background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)'
            },
            success: {
              style: {
                background: '#22c55e',
                color: '#ffffff'
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#ffffff'
              },
            }
          }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


