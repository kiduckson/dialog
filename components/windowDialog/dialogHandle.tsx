"use client";

import { PanInfo, motion, useMotionValue } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ExpandDirection, handleVariant } from "./dialog";

// TODO: set handle active so that other handle is disabled while one in action
const DialogHandle = forwardRef<
  HTMLDivElement,
  {
    direction: ExpandDirection;
    handleDialogResize: (info: PanInfo, direction: ExpandDirection) => void;
    handleHandleDragEnd: () => void;
  }
>(({ direction, handleHandleDragEnd, handleDialogResize }, ref) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  return (
    <motion.span
      ref={ref}
      drag
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
      className={cn(handleVariant({ handlePos: direction }))}
      onDrag={(e, info: PanInfo) => {
        handleDialogResize(info, direction);
        x.set(0);
        y.set(0);
      }}
      onDragEnd={handleHandleDragEnd}
      style={{
        x,
        y,
      }}
    />
  );
});

export default DialogHandle;
