import type { Metadata } from "next";
import { Inter, Gentium_Plus } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });
const gentiumPlus = Gentium_Plus({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal CV",
  description: "Personal CV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={gentiumPlus.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex h-svh w-svw flex-col items-center justify-between bg-background">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
