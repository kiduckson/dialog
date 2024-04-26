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
      console.log("x complete", x.get());
      x.set(Math.min(x.get(), rightConstraint));
      updateDialog({
        ...dialog,
        x: x.get(),
      });
    });

    useMotionValueEvent(y, "animationComplete", () => {
      console.log("y complete", y.get());
      y.set(Math.min(y.get()));
      updateDialog({
        ...dialog,
        y: y.get(),
      });
    });

    /**
     * width
     */
    useMotionValueEvent(width, "change", (latest) => {
      x.set(Math.min(x.get(), rightConstraint));
    });

    useMotionValueEvent(width, "animationComplete", () => {
      console.log("width complete");
      updateDialog({
        ...dialog,
        width: width.get(),
      });
    });

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      setEnlarged(
        (prev: EnlargedState) =>
          (prev + 1) % (Object.keys(EnlargedState).length / 2)
      );
      updateDialog({
        ...dialog,
        x: Math.min(dialog.x, rightConstraint),
        width: 190 * (enlarged + 1),
        height: 140 * enlarged + 64,
      });
    };

    const handleClick = () => {
      selectDialog(dialog.id);
    };

    const dragConstraints = {
      top: 0,
      right: rightConstraint,
      left: 0,
    };

    // TODO
    const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
      switch (direction) {
        case ExpandDirection.right:
          width.set(dialog.width + info.offset.x);
          break;
        case ExpandDirection.left:
          console.log(info.offset.x, dialog.x);

          // x.set(dialog.x + info.offset.x);
          // width.set(dialog.width + -info.offset.x);
          break;
        default:
          break;
      }
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
          zIndex: dialog.selected ? 1 : 0,
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
        <motion.span
          layout
          className={`flex items-center justify-between h-8  border-b p-1 cursor-pointer select-none bg-neutral-700`}
          tabIndex={-1}
          onDoubleClick={handleDoubleClick}
          onPointerDown={(event) => controls.start(event)}
        >
          <span className="hover:bg-slate-700 corner">{dialog.title}</span>
        </motion.span>
        <div className="h-full w-full bg-orange-300">body</div>

        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.right }))}
          drag="x"
          dragElastic={false}
          dragMomentum={false}
          dragSnapToOrigin
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.right)
          }
          onDragEnd={(e, info: PanInfo) =>
            updateDialog({
              ...dialog,
              width: dialog.width + info.offset.x,
            })
          }
        />
        <motion.span
          className={cn(handleVariant({ handlePos: ExpandDirection.left }))}
          drag="x"
          dragElastic={false}
          dragMomentum={false}
          dragSnapToOrigin
          onDrag={(e, info: PanInfo) =>
            handleDialogResize(info, ExpandDirection.left)
          }
          // onDragEnd={(e, info: PanInfo) =>
          //   updateDialog({
          //     ...dialog,
          //     width: dialog.width + info.offset.x,
          //   })
          // }
        />
      </motion.div>
    );
  }
);

export default Dialog;
