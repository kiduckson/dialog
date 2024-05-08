"use client";

import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect, useState } from "react";
import { IDialog, useDialogStore } from "./store";
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
  const addDialog = useDialogStore((state) => state.addDialog);

  const [merged, setMerged] = useState(false);
  const [separated, setSeparated] = useState(false);

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
        // setMerged(true);
        break;
      }
    }
  };

  const separateTabToNewDialog = (
    dialogId: string,
    tabId: string,
    ax: number,
    ay: number,
    e: PointerEvent
  ) => {
    const newDialogId = uuidv4();
    const prevDialog = dialogs[dialogId];
    updateDialog({
      ...prevDialog,
      tabs: prevDialog.tabs.filter((tab) => tab !== tabId),
    });

    addDialog({
      id: newDialogId,
      x: prevDialog.x + ax,
      y: prevDialog.y + ay,
      width: prevDialog.width,
      height: prevDialog.height,
      activeTab: tabId,
      tabs: [tabId],
    });
    selectDialog(newDialogId);
    setSeparated(true);
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  };

  useEffect(() => {
    if (ref && activeDialog && (merged || separated)) {
      const selectedDialog = ref.current?.querySelector(
        `[data-tab-id="${dialogs[activeDialog].activeTab}"]`
      );
      setSeparated(false);
      setMerged(false);
      // if (selectedDialog) {
      //   const pointerEvent = new PointerEvent("pointerdown", {
      //     bubbles: true,
      //     cancelable: true,
      //     pointerType: "mouse",
      //   });
      //   const success = selectedDialog.dispatchEvent(pointerEvent);
      //   console.log("dispatch to", selectedDialog, "success", success);
      // }
    }
  }, [ref, activeDialog, dialogs[activeDialog]?.activeTab, merged, separated]);

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
          separateTabToNewDialog={separateTabToNewDialog}
        />
      ))}
    </div>
  );
}
