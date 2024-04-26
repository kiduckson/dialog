"use client";

import {
  DragControls,
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
import { ExpandDirection, handleVariant } from "./dialog";

const DialogHandle = forwardRef<
  HTMLDivElement,
  {
    dialog: IDialog;
    handlePos: ExpandDirection;
    rightConstraint: number;
  }
>(({ dialog, handlePos, rightConstraint }, ref) => {
  const x = useMotionValue(0);
  const updateDialog = useDialogStore((state) => state.updateDialog);

  const handleDragChange = () => {};

  useMotionValueEvent(x, "change", (latest) => {
    console.log("x changed to", latest);
  });

  // useEffect(() => {
  //   function updateWidth() {
  //     updateDialog({
  //       ...dialog,
  //       width: Math.max(dialog.width + x.get(), 120),
  //     });
  //   }

  //   const unsubscribeX = x.on("change", updateWidth);

  //   return () => {
  //     unsubscribeX();
  //   };
  // }, []);

  return (
    <motion.span
      className={cn(handleVariant({ handlePos }))}
      style={{ x }}
      drag
      dragElastic={false}
      dragMomentum={false}
      onDrag={(e, info: PanInfo) => handleDialogResize(info, handlePos)}
      onDragEnd={(e, info: PanInfo) =>
        updateDialog({
          ...dialog,
          width: dialog.width + info.offset.x,
        })
      }
    />
  );
});

export default DialogHandle;
