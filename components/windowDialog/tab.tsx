import { useRef, useState } from "react";
import { Itab, useDialogStore } from "@/app/store";
import {
  PanInfo,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IhandleTabBehaviourProps } from "./dialogContainer";

export const tabVariant = cva(
  "rounded-t-lg corner px-4 w-24 min-w-12 truncate h-full",
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
  dialogId: string;
  updateTabOrder: (fromIndex: number, shiftInOrder: number) => void;
  isDraggable: boolean;
  isActive: boolean;

  handleTabBehaviour: (props: IhandleTabBehaviourProps) => void;
  updateActiveTab: (id: string) => void;
}

const OFFSET_DIST = 32;

export default function Tab({
  tab,
  idx,
  dialogId,
  isDraggable,
  isActive,
  updateTabOrder,
  handleTabBehaviour,
  updateActiveTab,
}: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dialogs = useDialogStore((state) => state.dialogs);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const dialog = dialogs[dialogId];
  const tabWidth = ref.current?.clientWidth ?? 96;
  const [yOffsetMet, setYOffsetMet] = useState(false);
  const [xOffsetMet, setXOffsetMet] = useState(false);

  useMotionValueEvent(x, "change", (latest) => {
    if (!xOffsetMet) {
      const shiftInOrder = Math.round(latest / tabWidth);
      updateTabOrder(idx, shiftInOrder);
    }
  });

  const selectTab = () => {
    selectDialog(dialogId);
    updateActiveTab(tab.id);
  };

  const handleYDrag = (e: PointerEvent, info: PanInfo) => {
    setYOffsetMet(Math.abs(info.offset.y) >= OFFSET_DIST);
    if (!yOffsetMet) {
      y.set(0);
    }
    if (yOffsetMet && ref.current) {
      handleTabBehaviour({
        dialogId,
        tabId: tab.id,
        ax: info.offset.x + tabWidth * idx,
        ay: info.offset.y,
        e,
      });
    }
  };
  return (
    <motion.span
      ref={ref}
      className={cn(tabVariant({ variant: isActive ? "active" : "default" }))}
      drag={isDraggable ? (yOffsetMet ? true : "x") : false}
      style={{
        x,
        y,
      }}
      layout
      onClick={selectTab}
      onPanStart={selectTab}
      onPan={(e, info) => {
        handleYDrag(e, info);
      }}
      onPanEnd={(e, info) => {
        handleYDrag(e, info);
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
