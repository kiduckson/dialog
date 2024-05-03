"use client";

import { useRef } from "react";
import { useDialogStore } from "./store";
import Dialog from "@/components/dialog";

export type IHandleClick =
  | React.MouseEvent<HTMLDivElement>
  | MouseEvent
  | TouchEvent
  | PointerEvent;

export default function DialogContainer() {
  const ref = useRef<HTMLDivElement>(null);
  const dialogs = useDialogStore((state) => state.dialogs);
  const length = useDialogStore((state) => state.length);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const handleClick = (e: IHandleClick) => {
    e.stopPropagation();
    let el: HTMLElement | null = e.target as HTMLElement;
    let id;
    while (el) {
      if (el?.dataset.dialogId) {
        id = el.dataset.dialogId;
        break;
      }
      el = el.parentElement;
    }
    selectDialog(id);
  };

  return (
    <div
      className={`flex relative h-dvh w-full bg-muted border`}
      ref={ref}
      onClick={handleClick}
    >
      {dialogs.map((dialog) => (
        <Dialog dialog={dialog} key={dialog.id} handleClick={handleClick} />
      ))}
    </div>
  );
}
