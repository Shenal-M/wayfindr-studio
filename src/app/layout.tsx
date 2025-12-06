import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayfindr Studio",
  description: "Strategic design for ambitious brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-white text-brand-black font-sans selection:bg-brand-blue selection:text-white">
        {children}
      </body>
    </html>
  );
}


