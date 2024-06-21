import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  DialogStoreState,
  DialogStoreActions,
  DialogRecord,
} from "@/components/windowDialog/types";

export const useDialogStore = create<DialogStoreState & DialogStoreActions>()(
  immer((set) => ({
    length: 0,
    activeDialog: "",
    dialogOrder: ["fa077d41-9786-457d-bf5a-2a85a4d9bbbb"],
    tabs: {
      "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b": {
        id: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
        title: "🐈 this is the name of the tab",
        dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        width: 96,
      },
      "cce836b9-054f-4dec-ba99-34f35395e93e": {
        id: "cce836b9-054f-4dec-ba99-34f35395e93e",
        title: "🐶 dog is the tab of the tabs",
        dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        width: 96,
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
        title: "🐵 monkey is the tab of the tab",
        dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        width: 96,
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fb",
        title: "📏 short tab",
        dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        width: 96,
      },
      "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc": {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fc",
        title: "1",
        dialogId: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        width: 96,
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
        enlargeType: "center",
        enlarged: false,
        prevHeight: 200,
        prevWidth: 400,
        prevX: 0,
        prevY: 0,
      },
    },
    addDialog: (dialog: DialogRecord) =>
      set((state) => {
        if (dialog.id in state.dialogs) {
          return;
        }
        state.dialogs[dialog.id] = dialog;
        state.dialogOrder = [dialog.id, ...state.dialogOrder];
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
        // console.log("updating dialog", dialog);
        return {
          dialogs: { ...state.dialogs, [dialog.id]: { ...dialog } },
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
