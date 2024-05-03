import { useDialogStore } from "@/app/store";
import {
  PanInfo,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef } from "react";

/**
 * TODO:
 * 1. tab out of the window
 * x threshhold =
 * if
 */

export default function Tab({
  tab,
  updateTabOrder,
  isDraggable,
  separateTabToNewDialog,
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useMotionValueEvent(x, "change", (latest) => {
    const shiftInOrder = Math.round(latest / (ref.current?.clientWidth ?? 96));
    updateTabOrder(tab.order, shiftInOrder);
  });

  const handleYDrag = (e: any, info: PanInfo) => {
    if (Math.abs(info.offset.y) >= 40) {
      separateTabToNewDialog(tab);
    }
  };

  return (
    <motion.span
      ref={ref}
      className="bg-stone-600 rounded-t-lg hover:bg-slate-700 corner px-4 w-24 min-w-12 truncate"
      drag={isDraggable ? "x" : false}
      style={{
        x,
        y,
      }}
      layoutId={tab.order}
      layout
      onPan={handleYDrag}
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
    >
      {tab.title} {tab.order}
    </motion.span>
  );
}
