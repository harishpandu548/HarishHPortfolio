import "./globals.css";
import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Harish Portfolio",
  description: "Portfolio built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
