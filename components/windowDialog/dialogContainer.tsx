"use client";

import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect, useState, forwardRef } from "react";
import { IDialog, useDialogStore } from "../../app/store";
import Dialog from "./dialog";

export type IHandleClick =
  | React.MouseEvent<HTMLDivElement>
  | MouseEvent
  | TouchEvent
  | PointerEvent;

export interface IhandleTabBehaviourProps {
  dialogId: string;
  tabId: string;
  tabWidth: number;
  ax: number;
  ay: number;
  e: PointerEvent;
}

const WINDOW_DIALOG_NAME = "WindowDialog";

type WindowDialogElement = React.ElementRef<"div">;
interface WindowDialogProps {
  container?: HTMLElement | null;
}

const DialogContainer = forwardRef<WindowDialogElement, WindowDialogProps>(
  (props, forwardedRef) => {
    const ref = useRef<HTMLDivElement>(null);
    const dialogs = useDialogStore((state) => state.dialogs);
    const dialogOrder = useDialogStore((state) => state.dialogOrder);
    const selectDialog = useDialogStore((state) => state.selectDialog);
    const activeDialog = useDialogStore((state) => state.activeDialog);
    const updateDialog = useDialogStore((state) => state.updateDialog);
    const removeDialog = useDialogStore((state) => state.removeDialog);
    const addDialog = useDialogStore((state) => state.addDialog);
    const [hoveredId, setHoveredId] = useState<string>("");
    const [hoveredIdx, setHoveredIdx] = useState<number>(0);

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

    const handleTabBehaviour = ({
      dialogId,
      tabId,
      tabWidth,
      ax,
      ay,
      e,
    }: IhandleTabBehaviourProps) => {
      const newDialogId = uuidv4();
      const prevDialog = dialogs[dialogId];
      const isEnd = e.type === "pointerup";
      const isDividable = prevDialog.tabs.length > 1 && isEnd;

      const calculateX = prevDialog.x + ax;
      const calculateY = prevDialog.y + ay;

      const dialogsArray = Object.values(dialogs).filter(
        (dialog) => dialog.id !== dialogId
      );
      const [targetDialog, tabIdx] = findTargetDialog(
        dialogsArray,
        calculateX,
        calculateY,
        tabWidth
      );

      setHoveredId(targetDialog?.id || "");
      setHoveredIdx(tabIdx);

      if (targetDialog && isEnd) {
        mergeTabsToTargetDialog(
          targetDialog,
          dialogId,
          tabId,
          prevDialog,
          tabIdx
        );
        setHoveredId("");
      } else if (isDividable) {
        divideTabsIntoNewDialog(
          newDialogId,
          tabId,
          calculateX,
          calculateY,
          prevDialog
        );
      }
    };

    const findTargetDialog = (
      dialogsArray: IDialog[],
      x: number,
      y: number,
      tabWidth: number
    ): [IDialog | undefined, number] => {
      const dialog = dialogsArray.find((dialog) => {
        const yThrest = dialog.y + 32;
        const xThresh = dialog.x + dialog.width;
        const inXRange = dialog.x - 64 < x && xThresh > x;
        const inYRange = dialog.y - 64 < y && yThrest > y;
        return inXRange && inYRange;
      });
      const tabIdx = dialog
        ? Math.max(
            Math.min(Math.round((x - dialog.x) / tabWidth), dialog.tabs.length),
            0
          )
        : 0;
      return [dialog, tabIdx];
    };

    const mergeTabsToTargetDialog = (
      targetDialog: IDialog,
      dialogId: string,
      tabId: string,
      prevDialog: IDialog,
      tabIdx: number
    ) => {
      const newTabs = [...targetDialog.tabs];
      newTabs.splice(tabIdx, 0, tabId);

      const newDialog = {
        ...targetDialog,
        activeTab: tabId,
        tabs: newTabs,
      };
      updateDialog(newDialog);
      const tabsAfterMove = prevDialog.tabs.filter((tab) => tab !== tabId);
      if (tabsAfterMove.length > 0) {
        updateDialog({
          ...prevDialog,
          tabs: tabsAfterMove,
        });
      } else {
        removeDialog(dialogId);
      }
      selectDialog(newDialog.id);
    };

    const divideTabsIntoNewDialog = (
      newDialogId: string,
      tabId: string,
      x: number,
      y: number,
      prevDialog: IDialog
    ) => {
      updateDialog({
        ...prevDialog,
        tabs: prevDialog.tabs.filter((tab) => tab !== tabId),
      });

      addDialog({
        id: newDialogId,
        x,
        y,
        width: prevDialog.width,
        height: prevDialog.height,
        activeTab: tabId,
        tabs: [tabId],
      });
      selectDialog(newDialogId);
    };

    return (
      <div
        className={`flex relative h-dvh w-full bg-background border`}
        ref={ref}
        onClick={handleClick}
      >
        {dialogOrder.map((dialogId) => (
          <Dialog
            containerRef={ref}
            dialog={dialogs[dialogId]}
            selected={activeDialog === dialogId}
            key={dialogId}
            handleClick={handleClick}
            handleTabBehaviour={handleTabBehaviour}
            displayIndicator={hoveredId === dialogId}
            indicatorIdx={hoveredIdx}
          />
        ))}
      </div>
    );
  }
);

export default DialogContainer;
