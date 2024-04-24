"use client";

import { useRef } from "react";
import { useDialogStore } from "./store";
import { Book } from "lucide-react";
import Dialog from "@/components/dialog";

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const dialogs = useDialogStore((state) => state.dialogs);

  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center justify-between p-12 bg-background">
      <div className="flex  justify-between items-center w-full h-8 bg-background border-2">
        <Book className="h-4 w-4" />
      </div>
      <div className={`flex relative h-dvh w-full bg-muted border`} ref={ref}>
        {dialogs.map((dialog) => (
          <Dialog ref={ref} dialog={dialog} />
        ))}
      </div>
    </main>
  );
}
