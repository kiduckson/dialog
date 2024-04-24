"use client";

import { PanInfo, motion } from "framer-motion";
import { useEffect, useState, useMemo, forwardRef, DragEvent } from "react";
import { IDialog, useDialogStore } from "@/app/store";

enum EnlargedState {
  shrink,
  mid,
  large,
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

    const handleDragOver = (e: PointerEvent | MouseEvent | TouchEvent) => {
      e.stopPropagation();
    };

    return (
      <motion.div
        className={`absolute top-0 left-0 flex flex-col bg-neutral-400 border shadow-neutral-800 ${
          dialog.selected ? "shadow-lg" : "shadow-none"
        }`}
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
        onDrag={handleDragOver}
        data-dialog-id={dialog.id}
      >
        <motion.span
          layout
          className={`flex items-center justify-between h-8  border-b p-1 cursor-pointer select-none bg-neutral-700`}
          tabIndex={-1}
          onDoubleClick={handleDoubleClick}
        >
          <span className="p-2 hover:bg-slate-700 corner">{dialog.title}</span>
        </motion.span>
        <div className="h-full w-full bg-orange-300">body</div>
      </motion.div>
    );
  }
);

export default Dialog;
