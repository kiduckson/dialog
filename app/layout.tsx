import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Book, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen min-w-screen flex-col items-center justify-between bg-background">
            <nav className="flex justify-between items-center h-8 w-full p-1 bg-background border-2">
              <Book className="h-4 w-4" />
              <Button variant="ghost" size="xs">
                <Plus width={14} height={14} />
              </Button>
            </nav>
            <div className="grid grid-cols-[auto_1fr] w-full">
              <div className=" col-span">side</div>
              <div>{children}</div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
