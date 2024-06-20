"use client";

import DialogContainer from "@/components/windowDialog/dialogContainer";
import Link from "next/link";
import { useDialogStore } from "./store";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/themeToggle";

export default function Home() {
  const selectdDialog = useDialogStore((state) => state.activeDialog);
  const dialogs = useDialogStore((state) => state.dialogs);
  const dialogOrder = useDialogStore((state) => state.dialogOrder);
  const { setTheme } = useTheme();

  return (
    <>
      <nav className="grid grid-cols-[96px_1fr_40px] w-full h-10 border-b items-center gap-x-1">
        <Link
          href="/"
          className="flex justify-center items-center w-full h-full border-r font-bold"
        >
          HOME
        </Link>
        <div className="flex px-4 gap-x-3 items-center text-xs">
          <ThemeToggle />
          <div className="flex gap-x-1 items-center">
            <span className="text-primary font-bold">Selected </span>
            <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">
              {selectdDialog === "" ? "----" : selectdDialog}
            </span>
          </div>
          <div className="flex gap-x-1 items-center">
            <span className="text-primary font-bold">Dialog Order Count </span>
            <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">
              {dialogOrder.length}
            </span>
          </div>
          <div className="flex gap-x-1 items-center">
            <span className="text-primary font-bold">Dialogs Count </span>
            <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">
              {Object.keys(dialogs).length}
            </span>
          </div>
        </div>
      </nav>
      <div className="grid grid-cols-[96px_1fr_40px] grid-rows-[auto_40px] w-full h-full">
        <div className="border-r">paper</div>
        <DialogContainer />
      </div>
    </>
  );
}
