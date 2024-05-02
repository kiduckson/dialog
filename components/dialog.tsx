"use client";

import {
  PanInfo,
  motion,
  motionValue,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useState, useMemo, forwardRef, DragEvent } from "react";
import { IDialog, useDialogStore } from "@/app/store";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import DialogHandle from "./dialogHandle";
import { IHandleClick } from "@/app/dialogContainer";
import Tab from "./tab";

enum EnlargedState {
  shrink,
  mid,
  large,
}
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

export const handleVariant = cva("absolute hover:bg-card/20", {
  variants: {
    handlePos: {
      [ExpandDirection.top]:
        "top-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.topLeft]:
        "top-[-0.25rem] left-[-0.25rem] h-4 w-4 cursor-nwse-resize z-[2]",
      [ExpandDirection.topRight]:
        "top-[-0.25rem] right-[-0.25rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.left]:
        "left-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.right]:
        "right-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.bottom]:
        "bottom-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.bottomLeft]:
        "bottom-[-0.25rem] left-[-0.25rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.bottomRight]:
        "bottom-[-0.25rem] right-[-0.25rem] h-4 w-4 cursor-nwse-resize z-[2]",
    },
  },
});

const Dialog = forwardRef<
  HTMLDivElement,
  { dialog: IDialog; handleClick: any }
>(({ dialog }, ref) => {
  const controls = useDragControls();
  const updateDialog = useDialogStore((state) => state.updateDialog);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const [windowWidth, setWindowWidth] = useState<number>(1200);
  const x = useMotionValue(dialog.x);
  const y = useMotionValue(dialog.y);
  const width = useMotionValue(dialog.width);
  const height = useMotionValue(dialog.height);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowWidth]);

  const rightConstraint = useMemo(
    () => windowWidth - dialog.width - 96,
    [windowWidth, dialog.width]
  );

  useMotionValueEvent(x, "animationComplete", () => {
    updateDialog({
      ...dialog,
      x: x.get(),
      y: y.get(),
    });
  });

  useMotionValueEvent(y, "animationComplete", () => {
    updateDialog({
      ...dialog,
      x: x.get(),
      y: y.get(),
    });
  });

  /**
   * width
   */
  useMotionValueEvent(width, "change", (latest) => {
    // x.set(Math.min(x.get(), rightConstraint));
  });

  useMotionValueEvent(width, "animationComplete", () => {
    updateDialog({
      ...dialog,
      width: width.get(),
    });
  });

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("double clicked");
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent | PointerEvent
  ) => {
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

  const dragConstraints = {
    top: 0,
    right: rightConstraint,
    left: 0,
  };

  // TODO
  const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
    const setRight = () => {
      width.set(
        Math.min(dialog.width + info.offset.x, windowWidth - x.get() - 96)
      );
    };

    const setLeft = () => {
      x.set(dialog.x + info.offset.x);
      width.set(dialog.width + -info.offset.x);
    };

    const setTop = () => {
      y.set(dialog.y + info.offset.y);
      height.set(dialog.height + -info.offset.y);
    };

    const setBottom = () => {
      height.set(dialog.height + info.offset.y);
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
    });
  };

  const handles = Object.values(ExpandDirection).slice(
    Math.floor(Object.keys(ExpandDirection).length / 2)
  );

  const updateTabOrder = (fromIndex: number, shiftInOrder: number) => {
    const tabs = [...dialog.tabs];

    let toIndex = Math.max(
      0,
      Math.min(tabs.length - 1, fromIndex + shiftInOrder)
    );

    if (fromIndex === toIndex) {
      return;
    }

    const newTab = tabs.splice(fromIndex, 1)[0];

    if (fromIndex < toIndex) {
      toIndex -= 1;
    }

    tabs.splice(toIndex, 0, newTab);

    const newTabs = tabs.map((tab, idx) => ({ ...tab, order: idx }));

    updateDialog({
      ...dialog,
      tabs: newTabs,
    });
  };

  return (
    <motion.div
      className={cn(
        "absolute top-0 left-0 flex flex-col bg-neutral-400 border  border-neutral-500 shadow-neutral-800",
        dialog.selected ? "shadow-lg border-white" : "shadow-none"
      )}
      style={{
        x,
        y,
        width,
        height,
      }}
      layout
      initial={{
        x: dialog.x,
        y: dialog.y,
        width: dialog.width,
        height: dialog.height,
      }}
      animate={{
        x: dialog.x,
        y: dialog.y,
        width: dialog.width,
        height: dialog.height,
        zIndex: dialog.zIndex,
      }}
      drag
      dragConstraints={dragConstraints}
      dragElastic={false}
      dragMomentum={false}
      dragControls={controls}
      dragListener={false}
      onClick={handleClick}
      onDragStart={handleClick}
      data-dialog-id={dialog.id}
    >
      <motion.div
        layout
        className={`flex items-center relative justify-between h-8 border-b px-2 cursor-pointer select-none bg-neutral-700`}
        tabIndex={-1}
        onDoubleClick={handleDoubleClick}
        onPointerDown={(event) => controls.start(event)}
      >
        <motion.span layout className="flex gap-1 max-w-[80%]">
          {[...dialog.tabs]
            .sort((a, b) => a.order - b.order)
            .map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                order={tab.order}
                title={tab.title}
                updateTabOrder={updateTabOrder}
              />
            ))}
        </motion.span>
      </motion.div>
      <div className="h-full w-full bg-orange-300">body</div>
      {handles.map((handle) => (
        <DialogHandle
          direction={handle as ExpandDirection}
          handleDialogResize={handleDialogResize}
          handleHandleDragEnd={handleHandleDragEnd}
        />
      ))}
    </motion.div>
  );
});

export default Dialog;
