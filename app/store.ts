import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface IDialog {
  id: string;
  x: number;
  y: number;
  title: string;
  baseWidth: number;
  baseHeight: number;
  width: number;
  height: number;
  selected: boolean;
}

type State = {
  dialogs: IDialog[];
};

type Action = {
  addDialog: (dialog: IDialog) => void;
  updateDialog: (newDialog: IDialog) => void;
  selectDialog: (id: string) => void;
};

export const useDialogStore = create<State & Action>()(
  immer((set) => ({
    dialogs: [
      {
        id: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        title: "dialog 1",
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        selected: false,
      },
      {
        id: "fbe849de-2656-4c60-a299-5f4a8aeb5567",
        title: "dialog 2",
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        selected: false,
      },
    ] as IDialog[],
    addDialog: (dialog: IDialog) =>
      set((state) => {
        state.dialogs.push(dialog);
      }),
    updateDialog: (newDialog: IDialog) =>
      set((state) => {
        const id = state.dialogs.findIndex(
          (dialog) => dialog.id === newDialog.id
        );
        state.dialogs = [
          ...state.dialogs.slice(0, id),
          newDialog,
          ...state.dialogs.slice(id + 1),
        ];
      }),
    selectDialog: (id: string) =>
      set((state) => {
        state.dialogs = [
          ...state.dialogs.map((dialog) => ({
            ...dialog,
            selected: id === dialog.id,
          })),
        ];
      }),
  }))
);
