"use client";

import { PanInfo, motion, useMotionValue } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ExpandDirection, handleVariant } from "./dialog";
import type { VariantProps } from "class-variance-authority";

type HandleVariantProps = VariantProps<typeof handleVariant>;
export interface DialogHandleProps
  extends Omit<HandleVariantProps, "handlePos">,
    Required<Pick<HandleVariantProps, "handlePos">> {
  handleDialogResize: (info: PanInfo, direction: ExpandDirection) => void;
  handleHandleDragEnd: () => void;
}

const DialogHandle = forwardRef<HTMLDivElement, DialogHandleProps>(
  ({ handlePos, handleHandleDragEnd, handleDialogResize, display }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    return (
      <motion.span
        ref={ref}
        drag
        dragElastic={false}
        dragMomentum={false}
        dragSnapToOrigin
        className={cn(handleVariant({ handlePos, display }))}
        onDrag={(e, info: PanInfo) => {
          handleDialogResize(info, handlePos as ExpandDirection);
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
  }
);
DialogHandle.displayName = 'DialogHandle'
export default DialogHandle;
