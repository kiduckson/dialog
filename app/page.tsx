"use client";

import { useState } from "react";
import { Book, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DialogContainer from "@/components/windowDialog/dialogContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center justify-between bg-background">
      <div className="flex justify-between items-center w-full p-1 bg-background border-2">
        <Book className="h-4 w-4" />
        <Button variant="ghost" size="xs">
          <Plus width={14} height={14} />
        </Button>
      </div>
      <DialogContainer />
    </main>
  );
}
