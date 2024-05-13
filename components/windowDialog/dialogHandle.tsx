"use client";

import { PanInfo, motion } from "framer-motion";
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
  return (
    <motion.span
      ref={ref}
      drag
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
      className={cn(handleVariant({ handlePos: direction }))}
      onDrag={(e, info: PanInfo) => handleDialogResize(info, direction)}
      onDragEnd={handleHandleDragEnd}
    />
  );
});

export default DialogHandle;
