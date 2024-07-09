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
import { AnimatePresence, MotionValue, PanInfo } from "framer-motion";

/**
 */

const X_THRESHOLD = 8;
const Y_THRESHOLD = 4;
const ENLARGE_THRESHOLD = 20;
const TAB_HEIGHT = 24;

const DialogContainer = forwardRef<WindowDialogElement, WindowDialogProps>((props, forwardedRef) => {
  const ref = useRef<HTMLDivElement>(null);
  const { tabs, dialogs, dialogOrder, selectDialog, updateDialog, removeDialog, addDialog, activeDialog } = useDialogStore((state) => ({
    tabs: state.tabs,
    dialogs: state.dialogs,
    dialogOrder: state.dialogOrder,
    selectDialog: state.selectDialog,
    updateDialog: state.updateDialog,
    removeDialog: state.removeDialog,
    addDialog: state.addDialog,
    activeDialog: state.activeDialog,
  }));
  const [hoveredId, setHoveredId] = useState<string>("");
  const [hoveredIdx, setHoveredIdx] = useState<number>(0);
  const [showPortal, setShowPortal] = useState(false);
  const [showTabPortal, setShowTabPortal] = useState(false);
  const [tabIndicatorD, setTabIndicatorD] = useState({ x: 0, y: 0, width: 0 });
  const [indicatorDimension, setIndicatorDimension] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [tabMergeState, setTabMergeState] = useState<"merge" | "divide" | "default">("default");

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
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const dialogId = target.dataset.dialogId;
    if (dialogId && ref.current) {
      const { clientWidth: containerWidth, clientHeight: containerHeight } = ref.current;
      const dialog = dialogs[dialogId];
      const isSm = !dialog.enlarged;
      updateDialog({
        ...dialog,
        enlarged: isSm ? true : false,
        x: !isSm ? dialog.prevX : 0,
        y: !isSm ? dialog.prevY : 0,
        prevX: !isSm ? dialog.prevX : dialog.x,
        prevY: !isSm ? dialog.prevY : dialog.y,
        width: !isSm ? dialog.prevWidth : containerWidth,
        height: !isSm ? dialog.prevHeight : containerHeight,
        prevWidth: !isSm ? dialog.prevWidth : dialog.width,
        prevHeight: !isSm ? dialog.prevHeight : dialog.height,
      });
    }
  };

  const handleTabBehaviour = ({ dialogId, tabId, info, e }: TabBehaviorProps) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const { x: ax, y: ay } = info.offset;
    const { x: mx, y: my } = info.point;
    const { containerHeight, containerWidth, containerX, containerY } = {
      containerHeight: rect.height,
      containerWidth: rect.width,
      containerX: rect.left + window.scrollX,
      containerY: rect.top + window.scrollY,
    };

    const newDialogId = uuidv4();
    const prevDialog = dialogs[dialogId];
    const isEnd = e.type === "pointerup";
    const adjustedX = info.point.x - containerX;
    const adjustedY = info.point.y - containerY;
    const calculateX =
      prevDialog.x + ax < 0 ? 0 : prevDialog.x + ax + prevDialog.width > containerWidth ? containerWidth - prevDialog.width : prevDialog.x + ax;

    const calculateY =
      prevDialog.y + ay < 0 ? 0 : prevDialog.y + ay + prevDialog.height > containerHeight ? containerHeight - prevDialog.height : prevDialog.y + ay;

    setShowTabPortal(true);
    setTabIndicatorD({ x: adjustedX, y: adjustedY, width: tabs[tabId].width });

    const dialogsArray = Object.values(dialogs);
    const [direction, displayPortal, cordinates] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);

    const [targetDialog, tabIdx] = findTargetDialog(adjustedX, adjustedY, dialogsArray, tabs);

    if (direction !== "center" && !targetDialog) {
      const { x, y, width, height } = cordinates;
      setShowPortal(true);
      setIndicatorDimension({
        x,
        y,
        width,
        height,
      });
      if (!isEnd) return;
      setShowPortal(false);

      divideTabsIntoNewDialog(prevDialog, newDialogId, tabId, x, y, width, height, direction);
    } else {
      setHoveredId(targetDialog?.id || "");
      setHoveredIdx(tabIdx);
      setShowPortal(!targetDialog);
      setIndicatorDimension({
        x: calculateX,
        y: calculateY,
        width: prevDialog.width,
        height: prevDialog.height,
      });

      if (!isEnd) return;

      if (targetDialog) {
        mergeTabsToTargetDialog(targetDialog, dialogId, tabId, prevDialog, tabIdx);
        setHoveredId("");
      } else {
        divideTabsIntoNewDialog(prevDialog, newDialogId, tabId, calculateX, calculateY);
      }
      setShowPortal(false);
    }
    setShowTabPortal(false);
  };

  // Object.values(tabs).forEach((tab) => console.log(tab.x, tab.y));
  /**
   *
   * 1. find the tab
   *
   */

  const findTargetDialog = (
    x: number,
    y: number,
    dialogsArray: DialogRecord[],
    tabs: Record<string, DialogTab>
  ): [DialogRecord | undefined, number] => {
    const targetDialog = dialogsArray.find((dialog) => {
      const yThrest = dialog.y + 40;
      const xThresh = dialog.x + dialog.width;
      const inXRange = dialog.x < x && xThresh > x;
      const inYRange = dialog.y < y && yThrest > y;
      return inXRange && inYRange;
    });

    let targetIdx = -1;
    if (targetDialog) {
      let acc = 0;
      targetIdx = targetDialog.tabs.length;
      for (let i = 0; i < targetDialog.tabs.length; i++) {
        const tab = tabs[targetDialog.tabs[i]];
        const start = targetDialog.x + acc;
        const end = start + tab.width;
        const mid = start + (end - start) / 2;

        if (start < x && x < end) {
          if (x < mid) {
            targetIdx = i;
          } else {
            targetIdx = i + 1;
          }
          break;
        }
        acc += tab.width;
      }
    }
    return [targetDialog, targetIdx];
  };

  const mergeTabsToTargetDialog = (targetDialog: DialogRecord, dialogId: string, tabId: string, prevDialog: DialogRecord, tabIdx: number) => {
    console.log("mergeTabsToTargetDialog");

    const newTabs = [...targetDialog.tabs];
    if (targetDialog.id === dialogId) {
      // Remove the tab from its current position
      const currentTabIndex = newTabs.indexOf(tabId);
      if (currentTabIndex > -1) {
        newTabs.splice(currentTabIndex, 1);
      }

      // Insert the tab at the new position
      newTabs.splice(tabIdx, 0, tabId);

      const newDialog = {
        ...targetDialog,
        activeTab: tabId,
        tabs: newTabs,
      };

      updateDialog(newDialog);
    } else {
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
    }
  };

  const divideTabsIntoNewDialog = (
    prevDialog: DialogRecord,
    newDialogId: string,
    tabId: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
    enlargeType: DialogEnlargedType = "center"
  ) => {
    if (prevDialog.tabs.length < 2) {
      updateDialog({
        ...prevDialog,
        x,
        y,
        width: width ?? prevDialog.width,
        height: height ?? prevDialog.height,
        enlargeType,
      });
      selectDialog(prevDialog.id);
    } else {
      updateDialog({
        ...prevDialog,
        tabs: prevDialog.tabs.filter((tab) => tab !== tabId),
      });

      addDialog({
        id: newDialogId,
        x,
        y,
        width: width ?? prevDialog.width,
        height: height ?? prevDialog.height,
        activeTab: tabId,
        tabs: [tabId],
        enlarged: false,
        enlargeType,
        prevWidth: width ?? prevDialog.width,
        prevHeight: height ?? prevDialog.height,
        prevX: x,
        prevY: y,
      });
      selectDialog(newDialogId);
    }
  };

  const handlePresetDialogSize = (dialog: DialogRecord, e: any, info: PanInfo, mx: number, my: number) => {
    const { x, y } = info.point;
    const isEnd = e.type === "pointerup";

    if (dialog && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const { containerHeight, containerWidth, containerX, containerY } = {
        containerHeight: rect.height,
        containerWidth: rect.width,
        containerX: rect.left + window.scrollX,
        containerY: rect.top + window.scrollY,
      };

      const adjustedX = x - containerX;
      const adjustedY = y - containerY;

      const [direction, displayPortal, cordinates] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);

      setIndicatorDimension(cordinates);
      setShowPortal(displayPortal);

      if (!isEnd) return;

      if (direction !== "center") {
        setShowPortal(false);
        updateDialog({
          ...dialog,
          ...cordinates,
          enlarged: false,
          enlargeType: direction,
        });
      } else {
        updateDialog({
          ...dialog,
          enlargeType: direction,
          x: mx,
          y: my,
        });
      }
    }
  };

  return (
    <div className="relative border-r border-b border-border" ref={ref} onClick={handleClick}>
      {dialogOrder.map((dialogId) => (
        <Dialog
          containerRef={ref}
          dialog={dialogs[dialogId]}
          selected={activeDialog === dialogId}
          key={dialogId}
          handleClick={handleClick}
          handleTabBehaviour={handleTabBehaviour}
          handleDoubleClick={handleDoubleClick}
          handlePresetDialogSize={handlePresetDialogSize}
          displayIndicator={hoveredId === dialogId}
          indicatorIdx={hoveredIdx}
          showPortal={showPortal}
        />
      ))}
      {showTabPortal && !showPortal && (
        <span
          className="absolute top-0 left-0 rounded-sm w-16 h-10 border-2 border-green-500 bg-green-500/40 shadow-sm shadow-green-300 z-20"
          style={{
            width: tabIndicatorD.width,
            transform: `translateX(${tabIndicatorD.x}px) translateY(${tabIndicatorD.y}px) translateZ(0px)`,
          }}
        />
      )}
      {showPortal && (
        <div
          className="absolute top-0 left-0 rounded-md border-2 border-green-500 bg-green-500/40 shadow-sm  shadow-green-300 z-20"
          style={{
            width: indicatorDimension.width,
            height: indicatorDimension.height,
            transform: `translateX(${indicatorDimension.x}px) translateY(${indicatorDimension.y}px) translateZ(0px)`,
          }}
        />
      )}
    </div>
  );
});

DialogContainer.displayName = "DialogContainer";

export default DialogContainer;

//// utils
// always horizontal first
function getFixedDirection(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): [Exclude<DialogEnlargedType, "full">, boolean, DialogPosition] {
  const leftCond = x < -ENLARGE_THRESHOLD;
  const rightCond = x > containerWidth + ENLARGE_THRESHOLD;
  const topCond = y < -ENLARGE_THRESHOLD / 2;
  const bottomCond = y > containerHeight + ENLARGE_THRESHOLD / 2;

  const conditions = [
    { cond: topCond && leftCond, direction: "topLeft" },
    { cond: topCond && rightCond, direction: "topRight" },
    { cond: bottomCond && leftCond, direction: "bottomLeft" },
    { cond: bottomCond && rightCond, direction: "bottomRight" },
    { cond: leftCond, direction: "left" },
    { cond: rightCond, direction: "right" },
    { cond: topCond, direction: "top" },
    { cond: bottomCond, direction: "bottom" },
  ];

  let direction = "center";
  let display = false;

  for (const condition of conditions) {
    if (condition.cond) {
      direction = condition.direction;
      display = true;
      break;
    }
  }

  const cordinates = {
    x: /(right)/i.test(direction) ? containerWidth / 2 : 0,
    y: /(bottom)/i.test(direction) ? containerHeight / 2 : 0,
    width: /(right|left)/i.test(direction) ? containerWidth / 2 : containerWidth,
    height: /(top|bottom)/i.test(direction) ? containerHeight / 2 : containerHeight,
  };

  return [direction as Exclude<DialogEnlargedType, "full">, display, cordinates];
}
