import { createContext } from "react";

/* -------------------------------------------------------------------------------------------------
 * Window Dialog heavily influenced by Radix-ui
 * -----------------------------------------------------------------------------------------------*/

const NAME = "WindowDialog";

type WindowDialogElement = React.ElementRef<"div">;

interface WindowDialogProps {
  /**
   * The controlled state of the toggle.
   */
  pressed?: boolean;
  /**
   * The state of the toggle when initially rendered. Use `defaultPressed`
   * if you do not need to control the state of the toggle.
   * @defaultValue false
   */
  defaultPressed?: boolean;
  /**
   * The callback that fires when the state of the toggle changes.
   */
  onPressedChange?(pressed: boolean): void;
}
const WindowDialogProviderContext = createContext<any>(undefined);
