"use client";

import { PanInfo, motion, useDragControls, useMotionValue, useMotionValueEvent } from "framer-motion";
import React, { useState, useMemo, useRef, forwardRef } from "react";

import { useDialogStore } from "@/app/store";
import type { DialogRecord, TabBehaviorProps } from "./types";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import DialogHandle from "./dialogHandle";
import Tab from "./tab";
import { useWindowDialog } from "./dialogProviders";

export enum ExpandDirection {
  top,
  bottom,
  left,
  right,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}

export const handleVariant = cva("absolute rounded-sm", {
  variants: {
    handlePos: {
      [ExpandDirection.top]: "top-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.topLeft]: "top-[-0.5rem] left-[-0.5rem] h-4 w-4 cursor-nwse-resize z-[2]",
      [ExpandDirection.topRight]: "top-[-0.5rem] right-[-0.5rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.left]: "left-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.right]: "right-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.bottom]: "bottom-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.bottomLeft]: "bottom-[-0.5rem] left-[-0.5rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.bottomRight]: "bottom-[-0.5rem] right-[-0.5rem] h-4 w-4 cursor-nwse-resize z-[2]",
    },
    display: {
      hidden: "bg-transparent",
      hover: "hover:bg-primary/50",
      visible: "bg-primary",
    },
  },
  defaultVariants: {
    display: "hidden",
  },
});

interface IDialogProps {
  dialogId: string;
  handleClick: any;
  selected: boolean;
  // handleTabBehaviour: (props: TabBehaviorProps) => void;
  // handleDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  // handlePresetDialogSize: any;
  // showPortal: boolean;
  displayIndicator: boolean;
  indicatorIdx: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

type DialogElement = React.ElementRef<"div">;

const MIN_Y = 140;
const MIN_X = 280;

const Dialog = forwardRef<DialogElement, IDialogProps>((props, forwardedRef) => {
  const { dialogId, handleClick, selected, displayIndicator, indicatorIdx, containerRef } = props;

  const { dialogs, updateDialog, selectDialog, dialogOrder, handleDialogMovement, tabs } = useWindowDialog();
  const dialog = dialogs[dialogId];
  const controls = useDragControls();
  const dialogRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(dialog.x);
  const y = useMotionValue(dialog.y);
  const width = useMotionValue(dialog.width);
  const height = useMotionValue(dialog.height);

  useMotionValueEvent(x, "animationComplete", () => {
    if (["top", "left", "topLeft", "bottom"].includes(dialog.enlargeType)) {
      x.set(0);
    }
  });

  useMotionValueEvent(y, "animationComplete", () => {
    if (["top", "left", "topLeft", "right"].includes(dialog.enlargeType)) {
      y.set(0);
    }
  });

  // 리사이즈 기능
  const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
    const setRight = () => {
      const minXReached = dialog.width + info.offset.x < MIN_X;
      const offsetX = minXReached ? -(dialog.width - MIN_X) : info.offset.x;
      const maxWidth = (containerRef.current?.clientWidth as number) - dialog.x;
      const newWidth = dialog.width + offsetX;
      width.set(Math.min(newWidth, maxWidth));
    };

    const setLeft = () => {
      const minXReached = dialog.width - info.offset.x < MIN_X;
      const offsetX = minXReached ? dialog.width - MIN_X : info.offset.x;
      const calX = dialog.x + offsetX <= 0 ? -dialog.x : offsetX;
      x.set(dialog.x + calX);
      width.set(dialog.width - calX);
    };

    const setTop = () => {
      const minYReached = dialog.height - info.offset.y < MIN_Y;
      const offsetY = minYReached ? dialog.height - MIN_Y : info.offset.y;
      const calY = dialog.y + offsetY <= 0 ? -dialog.y : offsetY;

      y.set(dialog.y + calY);
      height.set(dialog.height - calY);
    };

    const setBottom = () => {
      const minYReached = dialog.height + info.offset.y < MIN_Y;
      const offsetY = minYReached ? -(dialog.height - MIN_Y) : info.offset.y;

      const maxHeight = (containerRef.current?.clientHeight as number) - dialog.y;
      const newHeight = dialog.height + offsetY;
      height.set(Math.min(newHeight, maxHeight));
    };

    const operations = {
      [ExpandDirection.right]: () => {
        setRight();
      },
      [ExpandDirection.left]: () => {
        setLeft();
      },
      [ExpandDirection.bottom]: () => {
        setBottom();
      },
      [ExpandDirection.top]: () => {
        setTop();
      },
      [ExpandDirection.bottomLeft]: () => {
        setBottom();
        setLeft();
      },
      [ExpandDirection.bottomRight]: () => {
        setBottom();
        setRight();
      },
      [ExpandDirection.topLeft]: () => {
        setTop();
        setLeft();
      },
      [ExpandDirection.topRight]: () => {
        setTop();
        setRight();
      },
    };
    const operation = operations[direction];
    if (operation) {
      operation();
    }
  };

  const handleHandleDragEnd = () => {
    updateDialog({
      ...dialog,
      y: y.get(),
      x: x.get(),
      width: width.get(),
      height: height.get(),
      enlarged: false,
      enlargeType: "center",
    });
    selectDialog(dialog.id);
  };

  // 핸들
  const handles = Object.values(ExpandDirection).slice(Math.floor(Object.keys(ExpandDirection).length / 2));

  const updateActiveTab = (id: string) => {
    updateDialog({
      ...dialog,
      activeTab: id,
    });
  };

  const activeTab = dialog.tabs.includes(dialog.activeTab) ? dialog.activeTab : dialog.tabs[0];

  const [idxIndicator, pos]: [number, "none" | "before" | "after"] = useMemo(() => {
    if (!displayIndicator) {
      return [-1, "none"];
    }
    if (indicatorIdx === 0) {
      return [indicatorIdx, "before"];
    } else {
      return [indicatorIdx - 1, "after"];
    }
  }, [displayIndicator, indicatorIdx]);

  return (
    <motion.div
      className={cn("absolute top-0 left-0 flex flex-col bg-accent border border-border rounded-sm shadow-border", selected && "shadow-sm border-primary/25")}
      style={{
        x,
        y,
        width,
        height,
      }}
      layout
      transition={{
        layout: {
          ease: "linear",
          duration: 0.1,
        },
      }}
      animate={{
        x: dialog.x,
        y: dialog.y,
        width: dialog.width,
        height: dialog.height,
        zIndex: dialogOrder.findIndex((order) => order === dialog.id) + 1,
      }}
      drag
      dragConstraints={containerRef}
      dragElastic={false}
      dragMomentum={false}
      dragControls={controls}
      onDrag={(e, info) => {
        handleDialogMovement({ dialogId: dialog.id, info, mx: x.get(), my: y.get() });
      }}
      onDragEnd={(e, info) => {
        handleDialogMovement({ dialogId: dialog.id, info, mx: x.get(), my: y.get(), isEnd: true });
      }}
      dragListener={false}
      onClick={handleClick}
      onDragStart={handleClick}
      data-dialog-id={dialog.id}
      ref={dialogRef}
    >
      {/* headers */}
      <motion.div
        // layout
        className={`dialog-handle flex items-center relative justify-between h-6 min-h-10 px-2 cursor-pointer select-none bg-card rounded-t-sm border-b border-border`}
        tabIndex={-1}
        // onDoubleClick={handleDoubleClick}
        data-dialog-id={dialog.id}
        onPointerDown={(event) => {
          controls.start(event);
        }}
        style={{ touchAction: "none" }}
      >
        {/* tabs */}
        <motion.div
          // layout
          className="flex gap-1 max-w-[80%] items-center overflow-x-auto snap-x h-full py-1 pr-4"
        >
          {dialog.tabs.map((tabId, idx) => (
            <Tab
              key={tabId}
              idx={idx}
              tab={tabs[tabId]}
              dialogId={dialog.id}
              isActive={activeTab === tabId}
              isDraggable={true}
              // handleTabBehaviour={handleTabBehaviour}
              updateActiveTab={updateActiveTab}
              tabIndicator={idxIndicator === idx ? pos : "none"}
            />
          ))}
        </motion.div>
        {/* buttons */}
      </motion.div>

      {/* resize handles */}
      {handles.map((handlePos, idx) => (
        <DialogHandle
          key={idx}
          handlePos={handlePos as ExpandDirection}
          handleDialogResize={handleDialogResize}
          handleHandleDragEnd={handleHandleDragEnd}
          display="hidden"
        />
      ))}

      {/* contents */}
      <div className="h-full w-full ">
        <div className="font-black text-green-700 dark:text-green-100 p-2 rounded-sm">{`dialog ID: ${dialog.id}`}</div>
        <div>{dialog.activeTab}</div>
      </div>
    </motion.div>
  );
});

Dialog.displayName = "dialog";
export default Dialog;
