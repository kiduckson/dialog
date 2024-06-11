import { useRef, useState } from "react";
import { Itab, useDialogStore } from "@/app/store";
import { PanInfo, motion, useMotionValue } from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IhandleTabBehaviourProps } from "./dialogContainer";

export const tabVariant = cva(
  "relative flex justify-center items-center overflow-visible rounded-t-md corner px-4 w-18 min-w-12 h-full",
  {
    variants: {
      variant: {
        default: "bg-muted z-0",
        active: "bg-accent-foreground text-secondary z-10",
      },
      indicator: {
        none: "",
        after:
          "after:content-[''] after:absolute after:h-full after:w-1 after:bg-muted-foreground after:-right-1",
        before:
          "before:content-[''] before:absolute before:h-full before:w-1 before:bg-muted-foreground before:-left-1",
      },
    },
    defaultVariants: {
      variant: "default",
      indicator: "none",
    },
  }
);

interface ITabProps {
  tab: Itab;
  idx: number;
  dialogId: string;
  isDraggable: boolean;
  isActive: boolean;

  handleTabBehaviour: (props: IhandleTabBehaviourProps) => void;
  updateActiveTab: (id: string) => void;
  tabIndicator: "none" | "before" | "after";
}

export default function Tab({
  tab,
  idx,
  dialogId,
  isDraggable,
  isActive,
  handleTabBehaviour,
  updateActiveTab,
  tabIndicator,
}: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dialogs = useDialogStore((state) => state.dialogs);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const tabWidth = ref.current?.clientWidth ?? 96;

  const selectTab = () => {
    selectDialog(dialogId);
    updateActiveTab(tab.id);
  };

  const handlePan = (e: PointerEvent, info: PanInfo) => {
    if (ref.current) {
      handleTabBehaviour({
        dialogId,
        tabId: tab.id,
        tabWidth,
        ax: info.offset.x + tabWidth * idx,
        ay: info.offset.y,
        e,
      });
    }
  };
  return (
    <motion.span
      ref={ref}
      className={cn(
        tabVariant({
          variant: isActive ? "active" : "default",
          indicator: tabIndicator,
        })
      )}
      drag={isDraggable}
      style={{
        x,
        y,
      }}
      layout
      onClick={selectTab}
      onPanStart={selectTab}
      onPan={(e, info) => {
        handlePan(e, info);
      }}
      onPanEnd={(e, info) => {
        handlePan(e, info);
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
