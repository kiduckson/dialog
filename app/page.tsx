"use client";

import DialogContainer from "@/components/windowDialog/dialogContainer";

export default function Home() {
  return (
    <>
      <nav className="flex justify-between items-center h-8 w-full p-1 bg-background border">
        breakcrums
      </nav>
      <div className="grid grid-cols-[auto_1fr] w-full h-full">
        <div className="text-9xl">TEST</div>
        <DialogContainer />
      </div>
    </>
  );
}
