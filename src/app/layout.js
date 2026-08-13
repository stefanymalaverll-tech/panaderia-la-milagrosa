import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Panadería La Milagrosa",
  description: "Sistema exclusivo para el control de caja, ventas e inventario de Panadería La Milagrosa",
  openGraph: {
    title: "Panadería La Milagrosa",
    description: "Sistema exclusivo para el control de caja, ventas e inventario de Panadería La Milagrosa",
    url: "https://panaderia-la-milagrosa.vercel.app",
    siteName: "Panadería La Milagrosa",
    locale: "es_VE",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}