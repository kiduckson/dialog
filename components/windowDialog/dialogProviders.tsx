"use client";

import * as React from "react";
import { createContext } from "@/lib/context";
import { DialogRecord, DialogTab, DialogStoreState, DialogClickEvent, WindowDialogElement } from "./types";
import { useImmerReducer } from "use-immer";
import { v4 as uuidv4 } from "uuid";
import { getFixedDirection } from "@/lib/utils";
import { PanInfo, motion, useDragControls, useMotionValue, useMotionValueEvent } from "framer-motion";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import DialogHandle from "./dialogHandle";
import Tab from "./tab";
import { useComposedRefs } from "@/hooks/useComposeRef";

export const WINDOW_DIALOG_NAME = "windowDialog";

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

export const MIN_Y = 140;
export const MIN_X = 280;

export interface WindowDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const handleVariant = cva("absolute rounded-sm", {
  variants: {
    handlePos: {
      [ExpandDirection.top]: "top-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.topLeft]: "top-[-0.5rem] left-[-0.5rem] h-4 w-4 cursor-nwse-resize z-[2]",
      [ExpandDirection.topRight]: "top-[-0.5rem] right-[-0.5rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.left]: "left-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.right]: "right-[-0.25rem] h-full w-2 cursor-col-resize z-[2]",
      [ExpandDirection.bottom]: "bottom-[-0.25rem] w-full h-2 cursor-row-resize z-[1]",
      [ExpandDirection.bottomLeft]: "bottom-[-0.5rem] left-[-0.5rem] h-4 w-4 cursor-nesw-resize z-[2]",
      [ExpandDirection.bottomRight]: "bottom-[-0.5rem] right-[-0.5rem] h-4 w-4 cursor-nwse-resize z-[2]",
    },
    display: {
      hidden: "bg-transparent",
      hover: "hover:bg-primary/50",
      visible: "bg-primary",
    },
  },
  defaultVariants: {
    display: "hidden",
  },
});

export interface IDialogProps {
  dialogId: string;
  selected: boolean;
  displayIndicator: boolean;
  indicatorIdx: number;
}

type DialogElement = React.ElementRef<"div">;
export interface TabBehaviorProps {
  // dialogs: Record<string, DialogRecord>;
  dialogId: string;
  tabId: string;
  info: PanInfo;
  isEnd?: boolean;
}
export interface HandleDialogMovementProps extends Omit<TabBehaviorProps, "tabId"> {
  mx: number;
  my: number;
}

export type WindowDialogContextValue = {
  containerRef: React.RefObject<HTMLDivElement>;
  containerRect: React.RefObject<DOMRect | null>;
  activeDialog: string;
  dialogOrder: string[];
  dialogs: Record<string, DialogRecord>;
  tabs: Record<string, DialogTab>;
  guideDimension: GuideDimension;
  isGuide: boolean;
  addDialog: (dialog: DialogRecord) => void;
  removeDialog: (id: string) => void;
  updateDialog: (newDialog: DialogRecord) => void;
  addTab: (tab: DialogTab, dialogId: string) => void;
  removeTab: (id: string) => void;
  updateTab: (newTab: DialogTab) => void;
  selectDialog: (id: string) => void;
  displayTabGuide: (props: Omit<TabBehaviorProps, "isEnd">) => void;
  handleDialogMovement: (props: HandleDialogMovementProps) => void;
  handleClick: (e: DialogClickEvent) => void;
  recalculateWrapper: () => void;
};

export enum ACTION_TYPE {
  ADD_DIALOG = "ADD_DIALOG",
  REMOVE_DIALOG = "REMOVE_DIALOG",
  UPDATE_DIALOG = "UPDATE_DIALOG",
  SELECT_DIALOG = "SELECT_DIALOG",
  ADD_TAB = "ADD_TAB",
  REMOVE_TAB = "REMOVE_TAB",
  UPDATE_TAB = "UPDATE_TAB",
  DISPLAY_GUIDE = "DISPLAY_GUIDE",
  SET_GUIDE_DIMENSION = "SET_GUIDE_DIMENSION",
  RECALCULATE_WRAPPER = "RECALCULATE_WRAPPER",
}

export enum GUIDE_STATE {
  TAB,
  DIALOG,
  NONE,
}

export type GuideDimension = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Action =
  | { type: ACTION_TYPE.ADD_DIALOG; dialog: DialogRecord }
  | { type: ACTION_TYPE.REMOVE_DIALOG; id: DialogRecord["id"] }
  | { type: ACTION_TYPE.UPDATE_DIALOG; dialog: DialogRecord }
  | { type: ACTION_TYPE.SELECT_DIALOG; id: DialogRecord["id"] }
  | { type: ACTION_TYPE.ADD_TAB; tab: DialogTab; dialogId: DialogTab["id"] }
  | { type: ACTION_TYPE.REMOVE_TAB; id: DialogTab["id"] }
  | { type: ACTION_TYPE.UPDATE_TAB; tab: DialogTab }
  | { type: ACTION_TYPE.DISPLAY_GUIDE; state: boolean }
  | { type: ACTION_TYPE.SET_GUIDE_DIMENSION; dimension: GuideDimension }
  | { type: ACTION_TYPE.RECALCULATE_WRAPPER };

const [WindowDialogProvider, useWindowDialogContext] = createContext<WindowDialogContextValue>(WINDOW_DIALOG_NAME);

const initialState: DialogStoreState = {
  isGuide: false,
  guideDimension: {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  },
  activeDialog: "",
  recalculateIdx: 0,
  dialogOrder: ["fa077d41-9786-457d-bf5a-2a85a4d9bbbb"],
  tabs: {
    "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b": {
      id: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
      title: "🐈 this is the name of the tab",
      dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    },
    "cce836b9-054f-4dec-ba99-34f35395e93e": {
      id: "cce836b9-054f-4dec-ba99-34f35395e93e",
      title: "🐶 dog is the tab of the tabs",
      dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    },
    "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa": {
      id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
      title: "🐵 monkey is the tab of the tab",
      dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    },
    "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb": {
      id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb",
      title: "📏 short tab",
      dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    },
    "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc": {
      id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc",
      title: "1",
      dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    },
  },
  dialogs: {
    "fa077d41-9786-457d-bf5a-2a85a4d9bbbb": {
      id: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
      x: 0,
      y: 0,
      width: 400,
      height: 200,
      activeTab: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
      tabs: [
        "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
        "cce836b9-054f-4dec-ba99-34f35395e93e",
        "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
        "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb",
        "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc",
      ],
      open: true,
      enlargeType: "center",
      enlarged: false,
      prevHeight: 200,
      prevWidth: 400,
      prevX: 0,
      prevY: 0,
    },
  },
};

const reducer = (state: DialogStoreState, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.ADD_DIALOG: {
      const { dialog } = action;
      if (dialog.id in state.dialogs) return;
      state.dialogs[dialog.id] = dialog;
      state.dialogOrder = [dialog.id, ...state.dialogOrder];
      return;
    }
    case ACTION_TYPE.REMOVE_DIALOG: {
      const { id } = action;
      if (!(id in state.dialogs)) return;
      const { [id]: removedDialog, ...remainingDialogs } = state.dialogs;
      state.dialogOrder = state.dialogOrder.filter((order) => order !== id);
      state.dialogs = remainingDialogs;
      return;
    }
    case ACTION_TYPE.UPDATE_DIALOG: {
      const { dialog } = action;
      state.dialogs[dialog.id] = { ...state.dialogs[dialog.id], ...dialog };
      return;
    }
    case ACTION_TYPE.SELECT_DIALOG: {
      const { id } = action;
      state.activeDialog = id ?? "";
      if (!id) return;
      state.dialogOrder = [...state.dialogOrder.filter((order) => order !== id), id];
      return;
    }
    case ACTION_TYPE.ADD_TAB: {
      const { tab, dialogId } = action;
      if (tab.id in state.tabs || !(dialogId in state.dialogs)) return;
      state.tabs[tab.id] = tab;
      state.dialogs[dialogId].tabs = [...state.dialogs[dialogId].tabs.filter((id) => id !== tab.id), tab.id];
      return;
    }
    case ACTION_TYPE.REMOVE_TAB: {
      const { id } = action;
      if (!(id in state.tabs)) return;
      const { [id]: removedTab, ...remainingTabs } = state.tabs;
      state.tabs = remainingTabs;
      state.dialogs[removedTab.dialogId].tabs = state.dialogs[removedTab.dialogId].tabs.filter((tabId) => tabId !== id);
      return;
    }
    case ACTION_TYPE.UPDATE_TAB: {
      const { tab } = action;
      state.tabs[tab.id] = { ...state.tabs[tab.id], ...tab };
      return;
    }
    case ACTION_TYPE.DISPLAY_GUIDE: {
      const { state: guideState } = action;
      state.isGuide = guideState;
      return;
    }
    case ACTION_TYPE.SET_GUIDE_DIMENSION: {
      const { dimension } = action;
      state.guideDimension = dimension;
      return;
    }
    case ACTION_TYPE.RECALCULATE_WRAPPER: {
      state.recalculateIdx = (state.recalculateIdx + 1) % 11;
      return;
    }
  }
};

const WindowDialog: React.FC<WindowDialogProps> = ({ children }) => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const addDialog = React.useCallback((dialog: DialogRecord) => dispatch({ type: ACTION_TYPE.ADD_DIALOG, dialog }), [dispatch]);
  const removeDialog = React.useCallback((id: string) => dispatch({ type: ACTION_TYPE.REMOVE_DIALOG, id }), [dispatch]);
  const updateDialog = React.useCallback((dialog: DialogRecord) => dispatch({ type: ACTION_TYPE.UPDATE_DIALOG, dialog }), [dispatch]);
  const addTab = React.useCallback((tab: DialogTab, dialogId: string) => dispatch({ type: ACTION_TYPE.ADD_TAB, tab, dialogId }), [dispatch]);
  const removeTab = React.useCallback((id: string) => dispatch({ type: ACTION_TYPE.REMOVE_TAB, id }), [dispatch]);
  const updateTab = React.useCallback((tab: DialogTab) => dispatch({ type: ACTION_TYPE.UPDATE_TAB, tab }), [dispatch]);
  const selectDialog = React.useCallback((id: string) => dispatch({ type: ACTION_TYPE.SELECT_DIALOG, id }), [dispatch]);
  const setGuideState = React.useCallback((state: boolean) => dispatch({ type: ACTION_TYPE.DISPLAY_GUIDE, state }), [dispatch]);
  const setGuideDimension = React.useCallback((dimension: GuideDimension) => dispatch({ type: ACTION_TYPE.SET_GUIDE_DIMENSION, dimension }), [dispatch]);
  const recalculateWrapper = React.useCallback(() => dispatch({ type: ACTION_TYPE.RECALCULATE_WRAPPER }), [dispatch]);

  const dialogs = state.dialogs;
  const tabs = state.tabs;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerRect = React.useRef<DOMRect | null>(null);

  React.useEffect(() => {
    const storeBoundingRect = () => {
      if (!containerRef.current) return;
      containerRect.current = containerRef.current.getBoundingClientRect();
    };

    // const containDialogs = () => {
    //   if (containerRect.current) {
    //     console.log("contain Dialog");

    //     const { height: containerHeight, width: containerWidth } = containerRect.current;
    //     Object.values(dialogs).map((dialog) => {
    //       updateDialog({
    //         ...dialog,
    //         width: (dialog.width / containerWidth) * containerWidth,
    //         height: (dialog.height / containerHeight) * containerHeight,
    //         x: (dialog.x / containerWidth) * containerWidth,
    //         y: (dialog.y / containerHeight) * containerHeight,
    //       });
    //     });
    //   }
    // };

    const resizeObserver = new ResizeObserver(() => {
      storeBoundingRect();
      // containDialogs();
    });

    if (containerRef.current) {
      storeBoundingRect();
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [state.recalculateIdx]);

  const displayTabGuide = ({ dialogId, tabId, info }: Omit<TabBehaviorProps, "isEnd">) => {
    const rect = containerRect.current;
    if (!rect) return;
    const { x: ax, y: ay } = info.offset;
    const { containerHeight, containerWidth, containerX, containerY } = {
      containerHeight: rect.height,
      containerWidth: rect.width,
      containerX: rect.left + window.scrollX,
      containerY: rect.top + window.scrollY,
    };
    const dialog = dialogs[dialogId];

    // X and Y adjusted with the size of the position of the container
    const adjustedX = info.point.x - containerX;
    const adjustedY = info.point.y - containerY;

    // x and y caculated with the the height and the width of the dialog
    const calculateX = dialog.x + ax < 0 ? 0 : dialog.x + ax + dialog.width > containerWidth ? containerWidth - dialog.width : dialog.x + ax;
    const calculateY = dialog.y + ay < 0 ? 0 : dialog.y + ay + dialog.height > containerHeight ? containerHeight - dialog.height : dialog.y + ay;
    const [direction, { x, y, width, height }] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);
    const [targetDialog, _] = findTargetDialog(adjustedX, adjustedY, Object.values(dialogs), tabs);

    setGuideState(true);
    setGuideDimension({
      x: targetDialog ? adjustedX : direction !== "center" ? x : calculateX,
      y: targetDialog ? adjustedY : direction !== "center" ? y : calculateY,
      width: targetDialog ? tabs[tabId].width : direction !== "center" ? width : dialog.width,
      height: targetDialog ? tabs[tabId].height : direction !== "center" ? height : dialog.height,
    });
  };
  const handleDialogMovement = ({ dialogId, info, mx, my, isEnd = false }: HandleDialogMovementProps) => {
    const rect = containerRect.current;
    if (!rect) return;
    const dialog = dialogs[dialogId];
    const { x: pointX, y: pointY } = info.point;

    const { containerHeight, containerWidth, containerX, containerY } = {
      containerHeight: rect.height,
      containerWidth: rect.width,
      containerX: rect.left + window.scrollX,
      containerY: rect.top + window.scrollY,
    };

    const adjustedX = pointX - containerX;
    const adjustedY = pointY - containerY;

    const [direction, cordinates] = getFixedDirection(adjustedX, adjustedY, containerWidth, containerHeight);

    setGuideDimension(cordinates);
    setGuideState(direction !== "center");

    if (isEnd) {
      if (direction !== "center") {
        setGuideState(false);
        updateDialog({
          ...dialog,
          ...cordinates,
          enlarged: false,
          enlargeType: direction,
        });
      } else {
        updateDialog({
          ...dialog,
          enlargeType: direction,
          x: mx,
          y: my,
        });
      }
    }
  };

  const handleClick = (e: DialogClickEvent) => {
    e.stopPropagation();
    console.log(e.currentTarget);

    let el: HTMLElement | null = e.target as HTMLElement;
    let id;
    while (el) {
      if (el?.dataset.dialogId) {
        id = el.dataset.dialogId;
        break;
      }
      el = el.parentElement;
    }
    selectDialog(id as string);
  };

  return (
    <WindowDialogProvider
      {...{
        ...state,
        addDialog,
        removeDialog,
        updateDialog,
        addTab,
        removeTab,
        updateTab,
        selectDialog,
        displayTabGuide,
        containerRef,
        containerRect,
        handleDialogMovement,
        handleClick,
        recalculateWrapper,
      }}
    >
      {children}
    </WindowDialogProvider>
  );
};

WindowDialog.displayName = WINDOW_DIALOG_NAME;

const useWindowDialog = () => {
  const context = useWindowDialogContext(WINDOW_DIALOG_NAME);
  if (!context) {
    throw new Error("useWindowDialog must be used within a WindowDialogProvider");
  }
  return context;
};

const Provider = WindowDialog;
export { Provider, useWindowDialog };

/* -------------------------------------------------------------------------------------------------
 * WindowContainer
 * -----------------------------------------------------------------------------------------------*/

const WindowDialogContainer = React.forwardRef<WindowDialogElement, WindowDialogProps>(({ className, ...props }, forwardedRef) => {
  const {
    tabs,
    dialogs,
    dialogOrder,
    selectDialog,
    updateDialog,
    removeDialog,
    addDialog,
    activeDialog,
    handleClick,
    guideDimension,
    isGuide,
    containerRef,
    containerRect,
  } = useWindowDialog();
  const composedRef = useComposedRefs(forwardedRef, containerRef);
  const [hoveredId, setHoveredId] = React.useState<string>("");
  const [hoveredIdx, setHoveredIdx] = React.useState<number>(0);

  React.useEffect(() => {
    selectDialog(hoveredId);
  }, [hoveredId, selectDialog]);

  return (
    <div ref={composedRef} onClick={handleClick} className={cn("relative w-full h-full", className)} {...props}>
      {dialogOrder.map((dialogId) => (
        <WindowDialogContent
          dialogId={dialogId}
          selected={activeDialog === dialogId}
          key={dialogId}
          displayIndicator={hoveredId === dialogId}
          indicatorIdx={hoveredIdx}
        />
      ))}
      {isGuide && (
        <div
          className="absolute top-0 left-0 rounded-md border-2 border-green-500 bg-green-500/40 shadow-sm  shadow-green-300 z-20"
          style={{
            width: guideDimension.width,
            height: guideDimension.height,
            transform: `translateX(${guideDimension.x}px) translateY(${guideDimension.y}px) translateZ(0px)`,
          }}
        />
      )}
    </div>
  );
});

WindowDialogContainer.displayName = "WindowDialogContainer";

/* --------------------------------- Dialog ---------------------------------- */
const WindowDialogContent = React.forwardRef<DialogElement, IDialogProps>((props, forwardedRef) => {
  const { dialogId, selected, displayIndicator, indicatorIdx } = props;
  const { dialogs, updateDialog, selectDialog, dialogOrder, handleDialogMovement, tabs, handleClick, containerRef, containerRect } = useWindowDialog();
  const dialog = dialogs[dialogId];
  const controls = useDragControls();

  const x = useMotionValue(dialog.x);
  const y = useMotionValue(dialog.y);
  const width = useMotionValue(dialog.width);
  const height = useMotionValue(dialog.height);

  useMotionValueEvent(x, "animationComplete", () => {
    if (["top", "left", "topLeft", "bottom"].includes(dialog.enlargeType)) {
      x.set(0);
    }
  });

  useMotionValueEvent(y, "animationComplete", () => {
    if (["top", "left", "topLeft", "right"].includes(dialog.enlargeType)) {
      y.set(0);
    }
  });

  // 리사이즈 기능
  const handleDialogResize = (info: PanInfo, direction: ExpandDirection) => {
    const setRight = () => {
      const minXReached = dialog.width + info.offset.x < MIN_X;
      const offsetX = minXReached ? -(dialog.width - MIN_X) : info.offset.x;
      const maxWidth = (containerRect.current?.width as number) - dialog.x;
      const newWidth = dialog.width + offsetX;
      width.set(Math.min(newWidth, maxWidth));
    };

    const setLeft = () => {
      const minXReached = dialog.width - info.offset.x < MIN_X;
      const offsetX = minXReached ? dialog.width - MIN_X : info.offset.x;
      const calX = dialog.x + offsetX <= 0 ? -dialog.x : offsetX;
      x.set(dialog.x + calX);
      width.set(dialog.width - calX);
    };

    const setTop = () => {
      const minYReached = dialog.height - info.offset.y < MIN_Y;
      const offsetY = minYReached ? dialog.height - MIN_Y : info.offset.y;
      const calY = dialog.y + offsetY <= 0 ? -dialog.y : offsetY;

      y.set(dialog.y + calY);
      height.set(dialog.height - calY);
    };

    const setBottom = () => {
      const minYReached = dialog.height + info.offset.y < MIN_Y;
      const offsetY = minYReached ? -(dialog.height - MIN_Y) : info.offset.y;

      const maxHeight = (containerRect.current?.height as number) - dialog.y;
      const newHeight = dialog.height + offsetY;
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
      enlarged: false,
      enlargeType: "center",
    });
    selectDialog(dialog.id);
  };

  // 핸들
  const handles = Object.values(ExpandDirection).slice(Math.floor(Object.keys(ExpandDirection).length / 2));

  const updateActiveTab = (id: string) => {
    updateDialog({
      ...dialog,
      activeTab: id,
    });
  };

  const activeTab = dialog.tabs.includes(dialog.activeTab) ? dialog.activeTab : dialog.tabs[0];

  const [idxIndicator, pos]: [number, "none" | "before" | "after"] = React.useMemo(() => {
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
      className={cn("absolute top-0 left-0 flex flex-col bg-accent border border-border rounded-sm shadow-border", selected && "shadow-sm border-primary/25")}
      style={{
        x,
        y,
        width,
        height,
      }}
      layout
      transition={{
        layout: {
          ease: "linear",
          duration: 0.1,
        },
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
      onDrag={(_, info) => {
        handleDialogMovement({ dialogId: dialog.id, info, mx: x.get(), my: y.get() });
      }}
      onDragEnd={(_, info) => {
        handleDialogMovement({ dialogId: dialog.id, info, mx: x.get(), my: y.get(), isEnd: true });
      }}
      dragListener={false}
      onClick={handleClick}
      onDragStart={handleClick}
      data-dialog-id={dialog.id}
      ref={forwardedRef}
    >
      {/* headers */}
      <motion.div
        // layout
        className={`dialog-handle flex items-center relative justify-between h-6 min-h-10 px-2 cursor-pointer select-none bg-card rounded-t-sm border-b border-border`}
        tabIndex={-1}
        // onDoubleClick={handleDoubleClick}
        data-dialog-id={dialog.id}
        onPointerDown={(event) => {
          controls.start(event);
        }}
        style={{ touchAction: "none" }}
      >
        {/* tabs */}
        <motion.div
          // layout
          className="flex gap-1 max-w-[80%] items-center overflow-x-auto snap-x h-full py-1 pr-4"
        >
          {dialog.tabs.map((tabId, idx) => (
            <Tab
              key={tabId}
              idx={idx}
              tab={tabs[tabId]}
              dialogId={dialog.id}
              isActive={activeTab === tabId}
              isDraggable={true}
              // handleTabBehaviour={handleTabBehaviour}
              updateActiveTab={updateActiveTab}
              tabIndicator={idxIndicator === idx ? pos : "none"}
            />
          ))}
        </motion.div>
        {/* buttons */}
      </motion.div>

      {/* resize handles */}
      {handles.map((handlePos, idx) => (
        <DialogHandle
          key={idx}
          handlePos={handlePos as ExpandDirection}
          handleDialogResize={handleDialogResize}
          handleHandleDragEnd={handleHandleDragEnd}
          display="hidden"
        />
      ))}

      {/* contents */}
      <div className="h-full w-full ">
        <div className="font-black text-green-700 dark:text-green-100 p-2 rounded-sm">{`dialog ID: ${dialog.id}`}</div>
        <div>{dialog.activeTab}</div>
      </div>
    </motion.div>
  );
});

WindowDialogContent.displayName = "dialog";
const Root = WindowDialogContainer;
const Content = WindowDialogContent;

export {
  WindowDialogContainer,
  WindowDialogContent,
  //
  Root,
  Content,
  //
};

/**
 *
 * UTILS
 *
 */

const findTargetDialog = (x: number, y: number, dialogsArray: DialogRecord[], tabs: Record<string, DialogTab>): [DialogRecord | undefined, number] => {
  const targetDialog = dialogsArray.find((dialog) => {
    const yThrest = dialog.y + 40;
    const xThresh = dialog.x + dialog.width;
    const inXRange = dialog.x < x && xThresh > x;
    const inYRange = dialog.y < y && yThrest > y;
    return inXRange && inYRange;
  });

  let targetIdx = -1;

  if (targetDialog) {
    let acc = 0;
    targetIdx = targetDialog.tabs.length;
    for (let i = 0; i < targetDialog.tabs.length; i++) {
      const tab = tabs[targetDialog.tabs[i]];
      const start = targetDialog.x + acc;
      const end = start + tab.width;
      const mid = start + (end - start) / 2;

      if (start < x && x < end) {
        if (x < mid) {
          targetIdx = i;
        } else {
          targetIdx = i + 1;
        }
        break;
      }
      acc += tab.width;
    }
  }
  return [targetDialog, targetIdx];
};
