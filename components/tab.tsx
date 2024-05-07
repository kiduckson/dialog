import { useRef } from "react";
import { Itab } from "@/app/store";
import {
  PanInfo,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TODO:
 * 1. tab out of the window
 * x threshhold =
 * if
 */

export const tabVariant = cva(
  "rounded-t-lg corner px-4 w-24 min-w-12 truncate",
  {
    variants: {
      variant: {
        default: "bg-slate-100 bg-slate-100/55 text-black",
        active: "bg-slate-950 hover:bg-slate-950/55",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ITabProps {
  tab: Itab;
  idx: number;
  updateTabOrder: (fromIndex: number, shiftInOrder: number) => void;
  isDraggable: boolean;
  isActive: boolean;
  separateTabToNewDialog: (id: string, x: number, y: number) => void;
  updateActiveTab: (id: string) => void;
  handleTabDrag: (flag: boolean) => void;
}

export default function Tab({
  tab,
  idx,
  isDraggable,
  isActive,
  updateTabOrder,
  separateTabToNewDialog,
  updateActiveTab,
  handleTabDrag,
}: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useMotionValueEvent(x, "change", (latest) => {
    const shiftInOrder = Math.round(latest / (ref.current?.clientWidth ?? 96));
    updateTabOrder(idx, shiftInOrder);
  });

  const handleYDrag = (info: PanInfo) => {
    if (!isDraggable) return;
    if (Math.abs(info.offset.y) >= 50 && ref.current) {
      separateTabToNewDialog(
        tab.id,
        info.offset.x + ref.current?.clientWidth * idx,
        info.offset.y
      );
    }
  };
  const setTabDrag = (flag: boolean) => {
    handleTabDrag(flag);
  };

  return (
    <motion.span
      ref={ref}
      className={cn(tabVariant({ variant: isActive ? "active" : "default" }))}
      drag={isDraggable ? "x" : false}
      style={{
        x,
        y,
      }}
      layout
      onClick={() => updateActiveTab(tab.id)}
      onPanStart={() => updateActiveTab(tab.id)}
      onPan={(e, info) => {
        console.log("drag");

        handleYDrag(info);
        setTabDrag(true);
      }}
      onPanEnd={(e, info) => {
        handleYDrag(info);
        setTabDrag(false);
      }}
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
      data-tab-id={tab.id}
    >
      {tab.title}
    </motion.span>
  );
}
