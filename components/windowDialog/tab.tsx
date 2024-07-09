import { useEffect, useRef, useState } from "react";
import { useDialogStore } from "@/app/store";
import type { DialogTab, TabBehaviorProps, DialogClickEvent } from "./types";
import { PanInfo, motion, useMotionValue } from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const tabVariant = cva(
  "relative flex items-center gap-1 text-sm capitalize min-w-max h-max w-max overflow-visible hover:bg-slate-800/20  hover:dark:bg-slate-300/20 rounded-sm before:content-[''] before:block before:h-[12px] before:left-[-1px] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-[1px] before:bg-muted-foreground",
  {
    variants: {
      variant: {
        default: "z-0 [&>.selected]:opacity-0",
        active: "font-black text-primary z-10 [&>.unselected]:opacity-0 ",
        minimized: "invisible",
      },

      indicator: {
        none: "",
        after: "after:content-[''] after:absolute after:h-full after:w-1 after:bg-muted-foreground after:-right-1",
        before: "after:content-[''] after:absolute after:h-full after:w-1 after:bg-muted-foreground after:-left-1",
      },
    },
    defaultVariants: {
      variant: "default",
      indicator: "none",
    },
  }
);

interface ITabProps {
  tab: DialogTab;
  idx: number;
  dialogId: string;
  isDraggable: boolean;
  isActive: boolean;

  handleTabBehaviour: (props: TabBehaviorProps) => void;
  updateActiveTab: (id: string) => void;
  tabIndicator: "none" | "before" | "after";
  showPortal: boolean;
}

const HEADER_X_PADDING = 8;
const HEADER_Y_PADDING = 4;

export default function Tab({ tab, idx, dialogId, isDraggable, isActive, handleTabBehaviour, updateActiveTab, tabIndicator }: ITabProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const selectDialog = useDialogStore((state) => state.selectDialog);
  const updateTab = useDialogStore((state) => state.updateTab);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const tabWidth = ref.current.clientWidth;
      updateTab({
        ...tab,
        width: tabWidth,
      });
    }
  }, [ref]);

  const selectTab = () => {
    selectDialog(dialogId);
    updateActiveTab(tab.id);
  };

  const handleDrag = (e: DialogClickEvent, info: PanInfo) => {
    if (ref.current) {
      handleTabBehaviour({
        dialogId,
        tabId: tab.id,
        info,
        e,
      });
    }
  };

  const [tipOn, setTipOn] = useState(false);

  useEffect(() => {
    if (selected) {
      setTipOn(false);
    }
  }, [selected]);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={tipOn} onOpenChange={(open) => setTipOn(open)}>
        <TooltipTrigger>
          <motion.span
            ref={ref}
            className={cn(
              tabVariant({
                variant: selected ? "minimized" : isActive ? "active" : "default",
                indicator: tabIndicator,
              })
            )}
            drag={isDraggable}
            style={{
              x,
              y,
            }}
            layout
            // key={`${tab.dialogId}_${idx}_${tab.id}`}
            onClick={selectTab}
            onDragStart={() => {
              selectTab();
              setSelected(true);
            }}
            onDrag={(e, info) => {
              handleDrag(e, info);
            }}
            onDragEnd={(e, info) => {
              handleDrag(e, info);
              setSelected(false);
            }}
            dragElastic={false}
            dragMomentum={false}
            dragSnapToOrigin
            data-tab-id={tab.id}
            whileTap={{ scale: 1.02 }}
            tabIndex={-1}
            data-tab-width={ref.current?.clientWidth}
          >
            <span className="selected truncate font-black px-2 py-1 text-ellipsis max-w-[140px] min-w-[70px]">{tab.title}</span>
            <span className="unselected absolute left-0 top-0 truncate font-normal px-2 py-1 text-ellipsis max-w-[140px] min-w-[70px]">{tab.title}</span>
          </motion.span>
        </TooltipTrigger>
        <TooltipContent className="border-border" avoidCollisions hideWhenDetached>
          <p>{tab.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
