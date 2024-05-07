"use client";

import { useRef, useEffect } from "react";
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
  const dialogOrder = useDialogStore((state) => state.dialogOrder);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const activeDialog = useDialogStore((state) => state.activeDialog);
  const updateDialog = useDialogStore((state) => state.updateDialog);
  const removeDialog = useDialogStore((state) => state.removeDialog);

  console.log("active Dialog", activeDialog);

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

  const handleTabMerge = (currX: number, currY: number, id: string) => {
    for (const dialog of Object.values(dialogs)) {
      if (dialog.id === id) {
        continue;
      }
      const yThrest = dialog.y + 32;
      const xThresh = dialog.x + dialog.width;
      const inXRange = dialog.x < currX && xThresh > currX;
      const inYRange = dialog.y < currY && yThrest > currY;
      if (inYRange && inXRange) {
        const newDialog = {
          ...dialog,
          activeTab: dialogs[id].tabs[0],
          tabs: [...dialog.tabs, ...dialogs[id].tabs],
        };
        updateDialog(newDialog);
        selectDialog(newDialog.id);
        removeDialog(id);
        break;
      }
    }
  };

  useEffect(() => {
    if (ref && activeDialog) {
      const selectedTab = ref.current?.querySelector(
        `[data-tab-id="${dialogs[activeDialog].activeTab}"]`
      );
    }
  }, [ref, activeDialog, dialogs[activeDialog]?.activeTab]);

  return (
    <div
      className={`flex relative h-dvh w-full bg-muted border`}
      ref={ref}
      onClick={handleClick}
    >
      {dialogOrder.map((dialogId) => (
        <Dialog
          dialog={dialogs[dialogId]}
          selected={activeDialog === dialogId}
          key={dialogId}
          handleClick={handleClick}
          handleTabMerge={handleTabMerge}
        />
      ))}
    </div>
  );
}
