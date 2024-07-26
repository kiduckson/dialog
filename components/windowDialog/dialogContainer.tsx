"use client";

import { v4 as uuidv4 } from "uuid";
import { useRef, useState, forwardRef, useEffect } from "react";
import { useDialogStore } from "@/app/store";
import type {
  DialogEnlargedType,
  DialogRecord,
  DialogPosition,
  DialogClickEvent,
  TabBehaviorProps,
  WindowDialogElement,
  WindowDialogProps,
  DialogTab,
} from "./types";

import Dialog from "./dialog";
import { PanInfo } from "framer-motion";
import { getFixedDirection } from "@/lib/utils";
import { GUIDE_STATE, useWindowDialog, Provider as WindowDialogProvider } from "./dialogProviders";
/**
 */

const DialogContainer = forwardRef<WindowDialogElement, WindowDialogProps>((props, forwardedRef) => {
  // const ref = useRef<HTMLDivElement>(null);
  const { tabs, dialogs, dialogOrder, selectDialog, updateDialog, removeDialog, addDialog, activeDialog } = useWindowDialog();
  const { guideDimension, isGuide, containerRef } = useWindowDialog();
  const [hoveredId, setHoveredId] = useState<string>("");
  const [hoveredIdx, setHoveredIdx] = useState<number>(0);

  useEffect(() => {
    selectDialog(hoveredId);
  }, [hoveredId]);

  const handleClick = (e: DialogClickEvent) => {
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

  // const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const target = e.target as HTMLDivElement;
  //   const dialogId = target.dataset.dialogId;
  //   if (dialogId && ref.current) {
  //     const { clientWidth: containerWidth, clientHeight: containerHeight } = ref.current;
  //     const dialog = dialogs[dialogId];
  //     const isSm = !dialog.enlarged;
  //     updateDialog({
  //       ...dialog,
  //       enlarged: isSm ? true : false,
  //       x: !isSm ? dialog.prevX : 0,
  //       y: !isSm ? dialog.prevY : 0,
  //       prevX: !isSm ? dialog.prevX : dialog.x,
  //       prevY: !isSm ? dialog.prevY : dialog.y,
  //       width: !isSm ? dialog.prevWidth : containerWidth,
  //       height: !isSm ? dialog.prevHeight : containerHeight,
  //       prevWidth: !isSm ? dialog.prevWidth : dialog.width,
  //       prevHeight: !isSm ? dialog.prevHeight : dialog.height,
  //     });
  //   }
  // };

  // const handleTabBehaviour = ({ dialogId, tabId, info, e }: TabBehaviorProps) => {
  //   if (!ref.current) return;
  //   const rect = ref.current.getBoundingClientRect();
  //   const { x: ax, y: ay } = info.offset;
  //   const { containerHeight, containerWidth, containerX, containerY } = {
  //     containerHeight: rect.height,
  //     containerWidth: rect.width,
  //     containerX: rect.left + window.scrollX,
  //     containerY: rect.top + window.scrollY,
  //   };

  //   const newDialogId = uuidv4();
  //   const prevDialog = dialogs[dialogId];
  //   const isEnd = e.type === "pointerup";
  //   const adjustedX = info.point.x - containerX;
  //   const adjustedY = info.point.y - containerY;
  //   const calculateX =
  //     prevDialog.x + ax < 0 ? 0 : prevDialog.x + ax + prevDialog.width > containerWidth ? containerWidth - prevDialog.width : prevDialog.x + ax;
  //   const calculateY =
  //     prevDialog.y + ay < 0 ? 0 : prevDialog.y + ay + prevDialog.height > containerHeight ? containerHeight - prevDialog.height : prevDialog.y + ay;

  //   setShowTabPortal(true);
  //   setTabIndicatorD({ x: adjustedX, y: adjustedY, width: tabs[tabId].width });

  //   const dialogsArray = Object.values(dialogs);
  //   const [direction, displayPortal, cordinates] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);
  //   const [targetDialog, tabIdx] = findTargetDialog(adjustedX, adjustedY, dialogsArray, tabs);
  //   console.log("🚀 ~ handleTabBehaviour ~ cordinates:", cordinates);
  //   console.log("🚀 ~ handleTabBehaviour ~ direction:", direction);
  //   console.log("🚀 ~ handleTabBehaviour ~ targetDialog:", targetDialog);
  //   console.log("🚀 ~ handleTabBehaviour ~ tabIdx:", tabIdx);
  //   console.log(" ");

  //   if (direction !== "center" && !targetDialog) {
  //     const { x, y, width, height } = cordinates;
  //     setShowPortal(true);
  //     setIndicatorDimension({
  //       x,
  //       y,
  //       width,
  //       height,
  //     });
  //     if (!isEnd) return;
  //     setShowPortal(false);
  //     divideTabsIntoNewDialog(prevDialog, newDialogId, tabId, x, y, width, height, direction);
  //   } else {
  //     setHoveredId(targetDialog?.id || "");
  //     setHoveredIdx(tabIdx);
  //     setShowPortal(!targetDialog);
  //     setIndicatorDimension({
  //       x: calculateX,
  //       y: calculateY,
  //       width: prevDialog.width,
  //       height: prevDialog.height,
  //     });

  //     if (!isEnd) return;

  //     if (targetDialog) {
  //       mergeTabsToTargetDialog(targetDialog, dialogId, tabId, prevDialog, tabIdx);
  //       setHoveredId("");
  //     } else {
  //       divideTabsIntoNewDialog(prevDialog, newDialogId, tabId, calculateX, calculateY);
  //     }
  //     setShowPortal(false);
  //   }
  //   setShowTabPortal(false);
  // };

  // const findTargetDialog = (x: number, y: number, dialogsArray: DialogRecord[], tabs: Record<string, DialogTab>): [DialogRecord | undefined, number] => {
  //   const targetDialog = dialogsArray.find((dialog) => {
  //     const yThrest = dialog.y + 40;
  //     const xThresh = dialog.x + dialog.width;
  //     const inXRange = dialog.x < x && xThresh > x;
  //     const inYRange = dialog.y < y && yThrest > y;
  //     return inXRange && inYRange;
  //   });

  //   let targetIdx = -1;

  //   if (targetDialog) {
  //     let acc = 0;
  //     targetIdx = targetDialog.tabs.length;
  //     for (let i = 0; i < targetDialog.tabs.length; i++) {
  //       const tab = tabs[targetDialog.tabs[i]];
  //       const start = targetDialog.x + acc;
  //       const end = start + tab.width;
  //       const mid = start + (end - start) / 2;

  //       if (start < x && x < end) {
  //         if (x < mid) {
  //           targetIdx = i;
  //         } else {
  //           targetIdx = i + 1;
  //         }
  //         break;
  //       }
  //       acc += tab.width;
  //     }
  //   }
  //   console.log(targetDialog, targetIdx);
  //   return [targetDialog, targetIdx];
  // };

  // const mergeTabsToTargetDialog = (targetDialog: DialogRecord, dialogId: string, tabId: string, prevDialog: DialogRecord, tabIdx: number) => {
  //   console.log("mergeTabsToTargetDialog");

  //   const newTabs = [...targetDialog.tabs];
  //   if (targetDialog.id === dialogId) {
  //     // Remove the tab from its current position
  //     const currentTabIndex = newTabs.indexOf(tabId);
  //     if (currentTabIndex > -1) {
  //       newTabs.splice(currentTabIndex, 1);
  //     }

  //     // Insert the tab at the new position
  //     newTabs.splice(tabIdx, 0, tabId);

  //     const newDialog = {
  //       ...targetDialog,
  //       activeTab: tabId,
  //       tabs: newTabs,
  //     };

  //     updateDialog(newDialog);
  //   } else {
  //     newTabs.splice(tabIdx, 0, tabId);

  //     const newDialog = {
  //       ...targetDialog,
  //       activeTab: tabId,
  //       tabs: newTabs,
  //     };
  //     updateDialog(newDialog);
  //     const tabsAfterMove = prevDialog.tabs.filter((tab) => tab !== tabId);
  //     if (tabsAfterMove.length > 0) {
  //       updateDialog({
  //         ...prevDialog,
  //         tabs: tabsAfterMove,
  //       });
  //     } else {
  //       removeDialog(dialogId);
  //     }
  //   }
  // };

  // const divideTabsIntoNewDialog = (
  //   prevDialog: DialogRecord,
  //   newDialogId: string,
  //   tabId: string,
  //   x: number,
  //   y: number,
  //   width?: number,
  //   height?: number,
  //   enlargeType: DialogEnlargedType = "center"
  // ) => {
  //   if (prevDialog.tabs.length < 2) {
  //     updateDialog({
  //       ...prevDialog,
  //       x,
  //       y,
  //       width: width ?? prevDialog.width,
  //       height: height ?? prevDialog.height,
  //       enlargeType,
  //     });
  //     selectDialog(prevDialog.id);
  //   } else {
  //     updateDialog({
  //       ...prevDialog,
  //       tabs: prevDialog.tabs.filter((tab) => tab !== tabId),
  //     });

  //     addDialog({
  //       id: newDialogId,
  //       x,
  //       y,
  //       width: width ?? prevDialog.width,
  //       height: height ?? prevDialog.height,
  //       activeTab: tabId,
  //       tabs: [tabId],
  //       enlarged: false,
  //       enlargeType,
  //       prevWidth: width ?? prevDialog.width,
  //       prevHeight: height ?? prevDialog.height,
  //       prevX: x,
  //       prevY: y,
  //     });
  //     selectDialog(newDialogId);
  //   }
  // };

  // const handlePresetDialogSize = (dialog: DialogRecord, e: any, info: PanInfo, mx: number, my: number) => {
  //   const { x, y } = info.point;
  //   const isEnd = e.type === "pointerup";

  //   if (dialog && ref.current) {
  //     const rect = ref.current.getBoundingClientRect();
  //     const { containerHeight, containerWidth, containerX, containerY } = {
  //       containerHeight: rect.height,
  //       containerWidth: rect.width,
  //       containerX: rect.left + window.scrollX,
  //       containerY: rect.top + window.scrollY,
  //     };

  //     const adjustedX = x - containerX;
  //     const adjustedY = y - containerY;

  //     const [direction, displayPortal, cordinates] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);

  //     setIndicatorDimension(cordinates);
  //     setShowPortal(displayPortal);

  //     if (!isEnd) return;

  //     if (direction !== "center") {
  //       setShowPortal(false);
  //       updateDialog({
  //         ...dialog,
  //         ...cordinates,
  //         enlarged: false,
  //         enlargeType: direction,
  //       });
  //     } else {
  //       updateDialog({
  //         ...dialog,
  //         enlargeType: direction,
  //         x: mx,
  //         y: my,
  //       });
  //     }
  //   }
  // };
  return (
    <div className="relative w-full h-full" ref={containerRef} onClick={handleClick}>
      {dialogOrder.map((dialogId) => (
        <Dialog
          containerRef={containerRef}
          dialogId={dialogId}
          selected={activeDialog === dialogId}
          key={dialogId}
          handleClick={handleClick}
          // handleDoubleClick={handleDoubleClick}
          // handleTabBehaviour={handleTabBehaviour}
          // handlePresetDialogSize={handlePresetDialogSize}
          displayIndicator={hoveredId === dialogId}
          indicatorIdx={hoveredIdx}
          // showPortal={showPortal}
        />
      ))}
      {isGuide && (
        <div
          className="absolute top-0 left-0 rounded-md border-2 border-green-500 bg-green-500/40 shadow-sm  shadow-green-300 z-20"
          style={{
            width: guideDimension.width,
            height: guideDimension.height,
            transform: `translateX(${guideDimension.x}px) translateY(${guideDimension.y}px) translateZ(0px)`,
          }}
        />
      )}
    </div>
  );
});

DialogContainer.displayName = "DialogContainer";

export default DialogContainer;
