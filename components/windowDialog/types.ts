import type { PanInfo } from "framer-motion";

export type DialogEnlargedType =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "full"
  | "center";

export interface DialogRecord {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activeTab: string;
  tabs: string[];
  enlarged: boolean;
  prevWidth: number;
  prevHeight: number;
  prevX: number;
  prevY: number;
  enlargeType: DialogEnlargedType;
}

export interface DialogTab {
  id: string;
  title: string;
  dialogId: string;
  x: number;
  y: number;
  width: number;
}

export type DialogStoreState = {
  dialogs: Record<string, DialogRecord>;
  tabs: Record<string, DialogTab>;
  length: number;
  activeDialog: string;
  dialogOrder: string[];
};

export type DialogStoreActions = {
  addDialog: (dialog: DialogRecord) => void;
  removeDialog: (id: string) => void;
  updateDialog: (newDialog: DialogRecord) => void;
  addTab: (tab: DialogTab, dialogId: string) => void;
  removeTab: (id: string) => void;
  updateTab: (newTab: DialogTab) => void;
  selectDialog: (id: string | undefined) => void;
};

export interface DialogPosition
  extends Pick<DialogRecord, "x" | "y" | "width" | "height"> {}

export type DialogClickEvent =
  | React.MouseEvent<HTMLDivElement>
  | MouseEvent
  | TouchEvent
  | PointerEvent;

export interface TabBehaviorProps {
  dialogId: string;
  tabId: string;
  info: PanInfo;
  e: DialogClickEvent;
}

export type WindowDialogElement = React.ElementRef<"div">;

export interface WindowDialogProps {
  container?: HTMLElement | null;
}
