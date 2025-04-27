import React, { ReactNode } from "react";

export const metadata = {
  title: 'CoreframeAI Radar',
  description: 'Radar dashboard for CoreframeAI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
