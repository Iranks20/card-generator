import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kisoro Nyama Festival Invitation Generator",
  description: "Generate Kisoro Nyama Festival 2026 invitation cards with a guest name",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
