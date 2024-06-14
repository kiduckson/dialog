"use client";

import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect, useState, forwardRef } from "react";
import { IDialog, useDialogStore, EnlargedType } from "../../app/store";
import Dialog from "./dialog";
import { MotionValue, PanInfo } from "framer-motion";

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
  info: PanInfo;
}
interface ICordinate extends Pick<IDialog, "x" | "y" | "width" | "height"> {}

const WINDOW_DIALOG_NAME = "WindowDialog";
const X_THRESHOLD = 32;
const Y_THRESHOLD = 64;
const ENLARGE_THRESHOLD = 20;

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
    const [showPortal, setShowPortal] = useState(false);
    const [indicatorDimension, setIndicatorDimension] = useState({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });

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
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const dialogId = target.dataset.dialogId;
      if (dialogId && ref.current) {
        const { clientWidth: containerWidth, clientHeight: containerHeight } =
          ref.current;
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

    const handleTabBehaviour = ({
      dialogId,
      tabId,
      tabWidth,
      ax,
      ay,
      e,
      info,
    }: IhandleTabBehaviourProps) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const { containerHeight, containerWidth, containerX, containerY } = {
        containerHeight: rect.height,
        containerWidth: rect.width,
        containerX: rect.left + window.scrollX,
        containerY: rect.top + window.scrollY,
      };

      const adjustedX = info.point.x - containerX;
      const adjustedY = info.point.y - containerY;
      const newDialogId = uuidv4();
      const prevDialog = dialogs[dialogId];
      const isEnd = e.type === "pointerup";

      const dialogsArray = Object.values(dialogs);
      const [direction, displayPortal, cordinates] = getFixedDirection(
        adjustedX,
        adjustedY,
        containerWidth,
        containerHeight
      );
      const [targetDialog, tabIdx] = findTargetDialog(
        dialogsArray,
        prevDialog.x + ax,
        prevDialog.y + ay,
        tabWidth
      );
      /* 
       1. center -> prv logic
       2. if not center -> 

      */
      if (direction !== "center" && !targetDialog) {
        console.log("tab to fixed sive");

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
        divideTabsIntoNewDialog(
          prevDialog,
          newDialogId,
          tabId,
          x,
          y,
          width,
          height
        );
      } else {
        const calculateX =
          prevDialog.x + ax < 0
            ? 0
            : prevDialog.x + ax + prevDialog.width > containerWidth
            ? containerWidth - prevDialog.width
            : prevDialog.x + ax;

        const calculateY =
          prevDialog.y + ay < 0
            ? 0
            : prevDialog.y + ay + prevDialog.height > containerHeight
            ? containerHeight - prevDialog.height
            : prevDialog.y + ay;

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
          mergeTabsToTargetDialog(
            targetDialog,
            dialogId,
            tabId,
            prevDialog,
            tabIdx
          );
          setHoveredId("");
        } else {
          divideTabsIntoNewDialog(
            prevDialog,
            newDialogId,
            tabId,
            calculateX,
            calculateY
          );
        }
        setShowPortal(false);
      }
    };

    const findTargetDialog = (
      dialogsArray: IDialog[],
      x: number,
      y: number,
      tabWidth: number
    ): [IDialog | undefined, number] => {
      const dialog = dialogsArray.find((dialog) => {
        const yThrest = dialog.y + X_THRESHOLD;
        const xThresh = dialog.x + dialog.width;
        const inXRange = dialog.x - Y_THRESHOLD < x && xThresh > x;
        const inYRange = dialog.y - Y_THRESHOLD < y && yThrest > y;
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
        selectDialog(newDialog.id);
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
        selectDialog(newDialog.id);
      }
    };

    const divideTabsIntoNewDialog = (
      prevDialog: IDialog,
      newDialogId: string,
      tabId: string,
      x: number,
      y: number,
      width?: number,
      height?: number
    ) => {
      if (prevDialog.tabs.length <= 1) {
        removeDialog(prevDialog.id);
      }
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
        prevWidth: width ?? prevDialog.width,
        prevHeight: height ?? prevDialog.height,
        prevX: x,
        prevY: y,
      });
      selectDialog(newDialogId);
    };

    const handlePresetDialogSize = (
      dialog: IDialog,
      e: any,
      info: PanInfo,
      mx: number,
      my: number
    ) => {
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

        const [direction, displayPortal, cordinates] = getFixedDirection(
          adjustedX,
          adjustedY,
          containerWidth,
          containerHeight
        );

        setIndicatorDimension(cordinates);
        setShowPortal(displayPortal);

        if (!isEnd) return;

        if (direction !== "center") {
          setShowPortal(false);
          updateDialog({
            ...dialog,
            ...cordinates,
            enlarged: false,
          });
        } else {
          updateDialog({
            ...dialog,
            x: mx,
            y: my,
          });
        }
      }
    };

    return (
      <div
        className="relative border border-t-0"
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
            handleDoubleClick={handleDoubleClick}
            handlePresetDialogSize={handlePresetDialogSize}
            displayIndicator={hoveredId === dialogId}
            indicatorIdx={hoveredIdx}
            showPortal={showPortal}
          />
        ))}
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
  }
);

export default DialogContainer;

//// utils
// always horizontal first
function getFixedDirection(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): [Exclude<EnlargedType, "full">, boolean, ICordinate] {
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
    width: /(right|left)/i.test(direction)
      ? containerWidth / 2
      : containerWidth,
    height: /(top|bottom)/i.test(direction)
      ? containerHeight / 2
      : containerHeight,
  };

  return [direction as Exclude<EnlargedType, "full">, display, cordinates];
}
