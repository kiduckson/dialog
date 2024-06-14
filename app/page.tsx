"use client";

import DialogContainer from "@/components/windowDialog/dialogContainer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="flex justify-between items-center w-full h-8 bg-background border">
        <Link
          href="/"
          className="border-r w-24 h-full flex items-center justify-center font-bold"
        >
          HOME
        </Link>
      </nav>
      <div className="grid grid-cols-[auto_1fr_40px] grid-rows-[auto_40px] w-full h-full">
        <div className="text-4xl p-2 w-24 border-l border-b">TEST</div>
        <DialogContainer />
      </div>
    </>
  );
}
