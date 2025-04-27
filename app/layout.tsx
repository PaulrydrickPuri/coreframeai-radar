import React, { ReactNode } from "react";
import './globals.css';

export const metadata = {
  title: 'CoreframeAI Radar',
  description: 'Hashtag Trend Radar for CoreframeAI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
