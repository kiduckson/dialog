import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type EnlargedType =
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

export interface IDialog {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activeTab: string;
  tabs: string[];
  enlarged: EnlargedType;
  prevWidth: number;
  prevHeight: number;
  prevX: number;
  prevY: number;
}
export interface Itab {
  id: string;
  title: string;
}

type State = {
  dialogs: Record<string, IDialog>;
  tabs: Record<string, Itab>;
  length: number;
  activeDialog: string;
  dialogOrder: string[];
};

type Action = {
  addDialog: (dialog: IDialog) => void;
  removeDialog: (id: string) => void;
  updateDialog: (newDialog: IDialog) => void;
  selectDialog: (id: string | undefined) => void;
};

export const useDialogStore = create<State & Action>()(
  immer((set) => ({
    length: 0,
    activeDialog: "",
    dialogOrder: ["fa077d41-9786-457d-bf5a-2a85a4d9bbbb"],
    tabs: {
      "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b": {
        id: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
        title: "tab1",
      },
      "cce836b9-054f-4dec-ba99-34f35395e93e": {
        id: "cce836b9-054f-4dec-ba99-34f35395e93e",
        title: "tab2",
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
        title: "tab3",
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb",
        title: "tab4",
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc",
        title: "tab5",
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
        enlarged: "center",
        prevHeight: 200,
        prevWidth: 400,
        prevX: 0,
        prevY: 0,
      },
    },
    addDialog: (dialog: IDialog) =>
      set((state) => {
        if (dialog.id in state.dialogs) {
          return;
        }
        state.dialogs[dialog.id] = dialog;
      }),
    removeDialog: (id: string) =>
      set((state) => {
        if (!(id in state.dialogs)) {
          console.log(`No dialog with id ${id} found.`);
          return;
        }
        // Destructure to exclude the dialog with the specified id
        const { [id]: removedDialog, ...remainingDialogs } = state.dialogs;
        state.dialogOrder = state.dialogOrder.filter((order) => order !== id);
        state.dialogs = remainingDialogs;
      }),
    updateDialog: (dialog) =>
      set((state) => {
        console.log("updating dialog", dialog);

        return {
          dialogs: { ...state.dialogs, [dialog.id]: dialog },
        };
      }),
    setActiveDialog: (id: string) =>
      set((state) => {
        state.activeDialog = id;
      }),
    selectDialog: (id: string | undefined) =>
      set((state) => {
        state.activeDialog = id ?? "";
        if (!id) {
          return;
        }
        state.dialogOrder = [
          ...state.dialogOrder.filter((order) => order !== id),
          id,
        ];
      }),
  }))
);
