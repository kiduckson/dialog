"use client";

import {
  PanInfo,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import React, { useEffect, useState, useMemo, useRef, forwardRef } from "react";

import { IDialog, useDialogStore } from "@/app/store";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import DialogHandle from "./dialogHandle";
import Tab from "./tab";
import { IhandleTabBehaviourProps } from "./dialogContainer";

export enum ExpandDirection {
  top,
  bottom,
  left,
  right,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}

export const handleVariant = cva("absolute hover:bg-card/20", {
  variants: {
    handlePos: {
      [ExpandDirection.top]:
        "top-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.topLeft]:
        "top-[-0.25rem] left-[-0.25rem] h-4 w-4 cursor-nwse-resize z-[2]",
      [ExpandDirection.topRight]:
        "top-[-0.25rem] right-[-0.25rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.left]:
        "left-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.right]:
        "right-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.bottom]:
        "bottom-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.bottomLeft]:
        "bottom-[-0.25rem] left-[-0.25rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.bottomRight]:
        "bottom-[-0.25rem] right-[-0.25rem] h-4 w-4 cursor-nwse-resize z-[2]",
    },
  },
});

interface IDialogProps {
  dialog: IDialog;
  handleClick: any;
  selected: boolean;
  handleTabBehaviour: (props: IhandleTabBehaviourProps) => void;
  displayIndicator: boolean;
  indicatorIdx: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

type DialogElement = React.ElementRef<"div">;
interface WindowDialogProps {
  container?: HTMLElement | null;
}

const Dialog = forwardRef<DialogElement, IDialogProps>(
  (props, forwardedRef) => {
    const {
      dialog,
      handleClick,
      selected,
      handleTabBehaviour,
      displayIndicator,
      indicatorIdx,
      containerRef,
    } = props;
    const controls = useDragControls();
    const dialogRef = useRef<HTMLDivElement>(null);
    const tabs = useDialogStore((state) => state.tabs);
    const updateDialog = useDialogStore((state) => state.updateDialog);
    const selectDialog = useDialogStore((state) => state.selectDialog);
    const dialogOrder = useDialogStore((state) => state.dialogOrder);

    const x = useMotionValue(dialog.x);
    const y = useMotionValue(dialog.y);
    const width = useMotionValue(dialog.width);
    const height = useMotionValue(dialog.height);

    // 리사이즈시
    useMotionValueEvent(x, "animationComplete", () => {
      updateDialog({
        ...dialog,
        x: x.get(),
        y: y.get(),
      });
    });

    // 리사이즈 시
    useMotionValueEvent(y, "animationComplete", () => {
      updateDialog({
        ...dialog,
        x: x.get(),
        y: y.get(),
      });
    });

    // 넓이 수정시
    useMotionValueEvent(width, "animationComplete", () => {
      updateDialog({
        ...dialog,
        width: width.get(),
      });
    });

    // 더블 클릭
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log("double clicked");
    };

    // 리사이즈 기능
    const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
      const setRight = () => {
        const maxWidth =
          (containerRef.current?.clientWidth as number) - dialog.x;
        const newWidth = dialog.width + info.offset.x;
        width.set(Math.min(newWidth, maxWidth));
      };

      const setLeft = () => {
        x.set(dialog.x + info.offset.x);
        width.set(dialog.width + -info.offset.x);
      };

      const setTop = () => {
        y.set(dialog.y + info.offset.y);
        height.set(dialog.height + -info.offset.y);
      };

      const setBottom = () => {
        const maxHeight =
          (containerRef.current?.clientHeight as number) - dialog.y;
        const newHeight = dialog.height + info.offset.y;
        height.set(Math.min(newHeight, maxHeight));
      };

      const operations = {
        [ExpandDirection.right]: () => {
          setRight();
        },
        [ExpandDirection.left]: () => {
          setLeft();
        },
        [ExpandDirection.bottom]: () => {
          setBottom();
        },
        [ExpandDirection.top]: () => {
          setTop();
        },
        [ExpandDirection.bottomLeft]: () => {
          setBottom();
          setLeft();
        },
        [ExpandDirection.bottomRight]: () => {
          setBottom();
          setRight();
        },
        [ExpandDirection.topLeft]: () => {
          setTop();
          setLeft();
        },
        [ExpandDirection.topRight]: () => {
          setTop();
          setRight();
        },
      };
      const operation = operations[direction];
      if (operation) {
        operation();
      }
    };
    const handleHandleDragEnd = () => {
      updateDialog({
        ...dialog,
        y: y.get(),
        x: x.get(),
        width: width.get(),
        height: height.get(),
      });
      selectDialog(dialog.id);
    };

    // 핸들
    const handles = Object.values(ExpandDirection).slice(
      Math.floor(Object.keys(ExpandDirection).length / 2)
    );

    // 탭오더 수정
    const updateTabOrder = (fromIndex: number, shiftInOrder: number) => {
      const tabs = [...dialog.tabs];
      if (tabs.length < 2) return;

      let toIndex = Math.max(
        0,
        Math.min(tabs.length, fromIndex + shiftInOrder)
      );

      if (fromIndex === toIndex) {
        return;
      }

      const newTab = tabs.splice(fromIndex, 1)[0];

      if (fromIndex < toIndex) {
        toIndex -= 1;
      }

      tabs.splice(toIndex, 0, newTab);

      updateDialog({
        ...dialog,
        tabs,
      });
    };

    const updateActiveTab = (id: string) => {
      updateDialog({
        ...dialog,
        activeTab: id,
      });
    };

    const activeTab = dialog.tabs.includes(dialog.activeTab)
      ? dialog.activeTab
      : dialog.tabs[0];

    const [idxIndicator, pos]: [number, "none" | "before" | "after"] =
      useMemo(() => {
        if (!displayIndicator) {
          return [-1, "none"];
        }
        if (indicatorIdx === 0) {
          return [indicatorIdx, "before"];
        } else {
          return [indicatorIdx - 1, "after"];
        }
      }, [displayIndicator, indicatorIdx]);

    return (
      <motion.div
        className={cn(
          "absolute top-0 left-0 flex flex-col bg-neutral-400 border  border-neutral-500 shadow-neutral-800",
          selected ? "shadow-lg border-white" : "shadow-none"
        )}
        style={{
          x,
          y,
          width,
          height,
        }}
        layout
        initial={{
          x: dialog.x,
          y: dialog.y,
          width: dialog.width,
          height: dialog.height,
        }}
        animate={{
          x: dialog.x,
          y: dialog.y,
          width: dialog.width,
          height: dialog.height,
          zIndex: dialogOrder.findIndex((order) => order === dialog.id) + 1,
        }}
        drag
        dragConstraints={containerRef}
        dragElastic={false}
        dragMomentum={false}
        dragControls={controls}
        dragListener={false}
        onClick={handleClick}
        onDragStart={handleClick}
        data-dialog-id={dialog.id}
        ref={dialogRef}
      >
        <motion.div
          layout
          className={`dialog-handle flex items-center relative justify-between h-8 border-b px-2 cursor-pointer select-none bg-neutral-700`}
          tabIndex={-1}
          onDoubleClick={handleDoubleClick}
          onPointerDown={(event) => {
            controls.start(event);
          }}
          style={{ touchAction: "none" }}
        >
          {/* tabs */}
          <motion.div layout className="flex gap-1 max-w-[80%] h-full pt-1">
            {dialog.tabs.map((tabId, idx) => (
              <Tab
                key={tabId}
                idx={idx}
                tab={tabs[tabId]}
                dialogId={dialog.id}
                isActive={activeTab === tabId}
                isDraggable={dialog.tabs.length > 1}
                updateTabOrder={updateTabOrder}
                handleTabBehaviour={handleTabBehaviour}
                updateActiveTab={updateActiveTab}
                tabIndicator={idxIndicator === idx ? pos : "none"}
              />
            ))}
          </motion.div>
          {/* buttons */}
        </motion.div>
        <div className="h-full w-full bg-zinc-700">
          <div>{dialog.id}</div>
          <div>{dialog.activeTab}</div>
        </div>
        {handles.map((handle, idx) => (
          <DialogHandle
            key={idx}
            direction={handle as ExpandDirection}
            handleDialogResize={handleDialogResize}
            handleHandleDragEnd={handleHandleDragEnd}
          />
        ))}
      </motion.div>
    );
  }
);

export default Dialog;
