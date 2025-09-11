// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import Providers from "./providers"; // Импортируем наш провайдер

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Visa Automation UZ",
//   description: "Automating visa processes",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Providers>{children}</Providers> {/* Оборачиваем здесь */}
//       </body>
//     </html>
//   );
// }


// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import Providers from "./providers";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Visa Automation UZ",
//   description: "Automating visa processes",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Visa Automation UZ",
  description: "Automating visa processes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers locale="en">
          {children}
        </Providers>
      </body>
    </html>
  );
}