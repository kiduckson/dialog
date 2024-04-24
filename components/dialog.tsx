"use client";

import { PanInfo, motion, motionValue } from "framer-motion";
import { useEffect, useState, useMemo, forwardRef, DragEvent } from "react";
import { IDialog, useDialogStore } from "@/app/store";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

enum EnlargedState {
  shrink,
  mid,
  large,
}
enum ExpandDirection {
  top,
  topLeft,
  topRight,
  bottom,
  bottomLeft,
  bottomRight,
  left,
  right,
}

/**
 * TODO
 * 1. 화면 크기에 따라 위치 x ,y 조정
 * 2. 선택
 *  - 선택시 highlight
 *  - 크기조절
 *
 * 1. header selected -> change to the chrome like tap
 */

const handleVariant = cva("absolute hover:bg-card/20", {
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

const Dialog = forwardRef<HTMLDivElement, { dialog: IDialog }>(
  ({ dialog }, ref) => {
    const [enlarged, setEnlarged] = useState<EnlargedState>(EnlargedState.mid);
    const updateDialog = useDialogStore((state) => state.updateDialog);
    const selectDialog = useDialogStore((state) => state.selectDialog);
    const [windowWidth, setWindowWidth] = useState<number>(1200);

    const rightConstraint = useMemo(
      () => windowWidth - dialog.width - 96,
      [windowWidth, dialog.width]
    );

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

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      setEnlarged(
        (prev: EnlargedState) =>
          (prev + 1) % (Object.keys(EnlargedState).length / 2)
      );
    };

    const handleClick = (
      e: MouseEvent | TouchEvent | PointerEvent | React.MouseEvent,
      info?: PanInfo
    ) => {
      selectDialog(dialog.id);
    };

    const handleDragEnd = (
      e: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      updateDialog({
        ...dialog,
        x: Math.min(Math.max(dialog.x + info.offset.x, 0), rightConstraint),
        y: Math.max(dialog.y + info.offset.y, 0),
      });
    };

    useEffect(() => {
      updateDialog({
        ...dialog,
        x: Math.min(dialog.x, rightConstraint),
        width: 190 * (enlarged + 1),
        height: 140 * enlarged + 32,
      });
    }, [enlarged, rightConstraint]);

    const dragConstraints = {
      top: 0,
      right: rightConstraint,
      left: 0,
    };

    const widthMotionV = motionValue(0);

    const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
      if (direction === ExpandDirection.right) {
        updateDialog({
          ...dialog,
          width: Math.min(
            Math.max(dialog.width + info.offset.x, 190),
            rightConstraint
          ),
          y: Math.max(dialog.y + info.offset.y, 0),
        });
      }
    };

    return (
      <motion.div
        className={cn(
          "absolute top-0 left-0 flex flex-col bg-neutral-400 border  border-neutral-500 shadow-neutral-800",
          dialog.selected ? "shadow-lg border-white" : "shadow-none"
        )}
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
          zIndex: dialog.selected ? 1 : 0,
        }}
        drag
        dragConstraints={dragConstraints}
        dragElastic={false}
        dragMomentum={false}
        onClick={handleClick}
        onDragStart={handleClick}
        onDragEnd={handleDragEnd}
        data-dialog-id={dialog.id}
      >
        <motion.span
          layout
          className={`flex items-center justify-between h-8  border-b p-1 cursor-pointer select-none bg-neutral-700`}
          tabIndex={-1}
          onDoubleClick={handleDoubleClick}
        >
          <span className="hover:bg-slate-700 corner">{dialog.title}</span>
        </motion.span>
        <div className="h-full w-full bg-orange-300">body</div>
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.top }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.top)
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.topLeft }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.topLeft)
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.topRight }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.topRight)
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.bottom }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.bottom)
          }
        />
        <motion.span
          className={cn(
            handleVariant({ handlePos: ExpandDirection.bottomLeft })
          )}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.bottomLeft)
          }
        />
        <motion.span
          className={cn(
            handleVariant({ handlePos: ExpandDirection.bottomRight })
          )}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.bottomRight)
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.left }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.left)
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.right }))}
          drag
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.right)
          }
        />
      </motion.div>
    );
  }
);

export default Dialog;
