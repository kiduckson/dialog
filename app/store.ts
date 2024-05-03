import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface IDialog {
  id: string;
  x: number;
  y: number;
  zIndex: number;
  width: number;
  height: number;
  selected: boolean;
  tabs: Itab[];
}
export interface Itab {
  id: string;
  title: string;
  active: boolean;
  order: number;
  separable: boolean;
}

type State = {
  dialogs: IDialog[];
  tabs: Itab[];
  length: number;
};

type Action = {
  addDialog: (dialog: IDialog) => void;
  updateDialog: (newDialog: IDialog) => void;
  selectDialog: (id: string | undefined) => void;
};

export const useDialogStore = create<State & Action>()(
  immer((set) => ({
    length: 0,
    tabs: [
      {
        id: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
        title: "tab1",
        active: true,
        order: 0,
        separable: true,
      },
      {
        id: "cce836b9-054f-4dec-ba99-34f35395e93e",
        title: "tab2",
        active: false,
        order: 1,
        separable: true,
      },
      {
        id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
        title: "tab3",
        active: false,
        order: 2,
        separable: true,
      },
    ],
    dialogs: [
      {
        id: "fa077d41-9786-457d-bf5a-2a85a4d9bbbb",
        x: 0,
        y: 0,
        zIndex: 0,
        width: 400,
        height: 200,
        selected: false,
        tabs: [
          {
            id: "9d7a54f2-60e8-4e49-81c8-1319bc9b4b3b",
            title: "tab1",
            active: true,
            order: 0,
            separable: true,
          },
          {
            id: "cce836b9-054f-4dec-ba99-34f35395e93e",
            title: "tab2",
            active: false,
            order: 1,
            separable: true,
          },
          {
            id: "f7e97e9b-9a24-44f0-8a6e-0d6d6e3428fa",
            title: "tab3",
            active: false,
            order: 2,
            separable: true,
          },
        ],
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
    selectDialog: (id: string | undefined) =>
      set((state) => {
        state.dialogs = [
          ...state.dialogs.map((dialog) => {
            if (id === dialog.id) {
              state.length += 1;
            }

            return {
              ...dialog,
              selected: id === dialog.id,
              zIndex: id === dialog.id ? state.length : dialog.zIndex,
            };
          }),
        ];
      }),
  }))
);
