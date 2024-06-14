import { useRef, useState } from "react";
import { Itab, useDialogStore } from "@/app/store";
import { PanInfo, motion, useMotionValue } from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IhandleTabBehaviourProps } from "./dialogContainer";

export const tabVariant = cva(
  "relative flex justify-center items-center overflow-visible rounded-t-md corner px-4 min-w-18 w-18 max-w-18 h-full",
  {
    variants: {
      variant: {
        default: "bg-muted z-0 hover:brightness-90",
        active: "bg-accent-foreground text-secondary z-10 hover:brightness-90",
        minimized:
          "bg-muted/90 rounded-full w-4 h-4 cursor-grabbing px-0 min-w-0 z-20",
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
  showPortal: boolean;
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
  showPortal,
}: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const [selected, setSelected] = useState(false);

  const tabWidth = ref.current?.clientWidth ?? 96;
  const computedSelected = isActive && showPortal && selected;

  const selectTab = () => {
    setSelected(true);
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
        info,
        e,
      });
    }
  };
  return (
    <motion.span
      ref={ref}
      className={cn(
        tabVariant({
          variant: computedSelected
            ? "minimized"
            : isActive
            ? "active"
            : "default",
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
        setSelected(false);
      }}
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
      data-tab-id={tab.id}
      whileTap={{ scale: 1.02 }}
      tabIndex={-1}
    >
      {!computedSelected && tab.title}
    </motion.span>
  );
}
