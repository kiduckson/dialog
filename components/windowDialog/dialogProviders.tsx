"use client";

import * as React from "react";
import { createContext } from "@/lib/context";
import { DialogRecord, DialogTab, DialogStoreState } from "./types";
import { useImmerReducer } from "use-immer";

export const WINDOW_DIALOG_NAME = "windowDialog";

type WindowDialogContextValue = {
  activeDialog: string;
  dialogOrder: string[];
  dialogs: Record<string, DialogRecord>;
  tabs: Record<string, DialogTab>;
  addDialog: (dialog: DialogRecord) => void;
  removeDialog: (id: string) => void;
  updateDialog: (newDialog: DialogRecord) => void;
  addTab: (tab: DialogTab, dialogId: string) => void;
  removeTab: (id: string) => void;
  updateTab: (newTab: DialogTab) => void;
  selectDialog: (id: string) => void;
};

export enum ACTION_TYPE {
  ADD_DIALOG = "ADD_DIALOG",
  REMOVE_DIALOG = "REMOVE_DIALOG",
  UPDATE_DIALOG = "UPDATE_DIALOG",
  SELECT_DIALOG = "SELECT_DIALOG",
  ADD_TAB = "ADD_TAB",
  REMOVE_TAB = "REMOVE_TAB",
  UPDATE_TAB = "UPDATE_TAB",
}

type Action =
  | { type: ACTION_TYPE.ADD_DIALOG; dialog: DialogRecord }
  | { type: ACTION_TYPE.REMOVE_DIALOG; id: DialogRecord["id"] }
  | { type: ACTION_TYPE.UPDATE_DIALOG; dialog: DialogRecord }
  | { type: ACTION_TYPE.SELECT_DIALOG; id: DialogRecord["id"] }
  | { type: ACTION_TYPE.ADD_TAB; tab: DialogTab; dialogId: DialogTab["id"] }
  | { type: ACTION_TYPE.REMOVE_TAB; id: DialogTab["id"] }
  | { type: ACTION_TYPE.UPDATE_TAB; tab: DialogTab };

const [WindowDialogProvider, useWindowDialogContext] = createContext<WindowDialogContextValue>(WINDOW_DIALOG_NAME);

interface WindowDialogProps {
  children: React.ReactNode;
}

const initialState: DialogStoreState = {
  activeDialog: "",
  dialogOrder: [],
  tabs: {},
  dialogs: {},
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

  return (
    <WindowDialogProvider {...{ ...state, addDialog, removeDialog, updateDialog, addTab, removeTab, updateTab, selectDialog }}>{children}</WindowDialogProvider>
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
