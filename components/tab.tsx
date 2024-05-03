import { useRef } from "react";
import { Itab, useDialogStore } from "@/app/store";
import {
  PanInfo,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";

/**
 * TODO:
 * 1. tab out of the window
 * x threshhold =
 * if
 */

interface ITabProps {
  tab: Itab;
  updateTabOrder: (fromIndex: number, shiftInOrder: number) => void;
  isDraggable: boolean;
  separateTabToNewDialog: (tab: Itab, x: number, y: number) => void;
}

export default function Tab({
  tab,
  updateTabOrder,
  isDraggable,
  separateTabToNewDialog,
}: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useMotionValueEvent(x, "change", (latest) => {
    const shiftInOrder = Math.round(latest / (ref.current?.clientWidth ?? 96));
    updateTabOrder(tab.order, shiftInOrder);
  });

  const handleYDrag = (e: any, info: PanInfo) => {
    if (!isDraggable) return;
    if (Math.abs(info.offset.y) >= 50 && ref.current) {
      separateTabToNewDialog(tab, info.point.x, info.point.y);
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
      layout
      layoutId={tab.id}
      onPan={handleYDrag}
      onPanEnd={handleYDrag}
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
    >
      {tab.title} {tab.order}
    </motion.span>
  );
}
