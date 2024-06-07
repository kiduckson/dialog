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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen min-w-screen flex-col items-center justify-between bg-background">
            <nav className="flex justify-between items-center h-8 w-full p-1 bg-background border">
              breakcrums
            </nav>
            <div className="grid grid-cols-[auto_1fr] w-full">
              <div className="text-9xl">TEST</div>
              <div>{children}</div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
