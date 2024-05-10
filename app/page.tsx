"use client";

import { useState } from "react";
import { Book, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DialogContainer from "@/components/windowDialog/dialogContainer";
import { ScopeTest, ScopeTestTrigger } from "@/components/ScopeTest";

import type { ScopeTestProps } from "@/components/ScopeTest";

export default function Home() {
  const [clicked1, setClicked1] = useState(false);
  const [clicked2, setClicked2] = useState(false);
  const [clicked3, setClicked3] = useState(false);
  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center justify-between p-12 bg-background">
      <div className="flex justify-between items-center w-full p-1 bg-background border-2">
        <Book className="h-4 w-4" />
        <Button variant="ghost" size="xs">
          <Plus width={14} height={14} />
        </Button>
      </div>
      <DialogContainer />
      <ScopeTest>
        <div>{clicked1 ? "clicked" : "not"}</div>
        <ScopeTestTrigger onClick={() => setClicked1((prop) => !prop)} />
      </ScopeTest>
      <ScopeTest>
        <div>{clicked2 ? "clicked" : "not"}</div>
        <ScopeTestTrigger onClick={() => setClicked2((prop) => !prop)} />
      </ScopeTest>
      <ScopeTest>
        <div>{clicked3 ? "clicked" : "not"}</div>
        <ScopeTestTrigger onClick={() => setClicked3((prop) => !prop)} />
      </ScopeTest>
    </main>
  );
}
