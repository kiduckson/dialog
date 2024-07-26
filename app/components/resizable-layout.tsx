"use client";

import * as React from "react";
import DialogContainer from "@/components/windowDialog/dialogContainer";
import Link from "next/link";
import { useDialogStore } from "@/app/store";
import { ThemeToggle } from "@/components/themeToggle";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable-panel";
import { cn } from "@/lib/utils";
import { useWindowDialog, WindowDialogContainer, WindowDialogContent, Provider as WindowDialogProvider } from "@/components/windowDialog/dialogProviders";

export default function ResizableLayout({ defaultLayout = [20, 80], defaultCollapsed }: { defaultLayout: number[] | undefined; defaultCollapsed?: boolean }) {
  const { selectDialog, updateDialog, tabs, dialogs, activeDialog, dialogOrder, recalculateWrapper } = useWindowDialog();
  const selected = React.useMemo(() => {
    const diaglog = dialogs[activeDialog];
    return diaglog?.activeTab ?? "";
  }, [dialogs, activeDialog]);

  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
    recalculateWrapper();
  };

  const handleTabClick = (id: string) => {
    const selectedTab = tabs[id];
    const dialogId = selectedTab.dialogId;
    selectDialog(dialogId);
    updateDialog({
      ...dialogs[dialogId],
      activeTab: id,
    });
  };

  return (
    <ResizablePanelGroup direction="horizontal" onLayout={onLayout} className="h-full w-full items-stretch overflow-auto">
      <ResizablePanel defaultSize={defaultLayout[0]} minSize={10} maxSize={40}>
        <div className="flex flex-col">
          <span className="h-8 border-border border-b">
            <Link className="w-full h-full items-center flex justify-center" href="/">
              HOME
            </Link>
          </span>
          <div className="flex flex-col p-2 gap-1">
            {Object.keys(tabs).map((tabKey) => {
              return (
                <span
                  className={cn(
                    "truncate p-2 text-sm cursor-pointer rounded-md hover:bg-primary/20",
                    selected === tabKey && "bg-slate-600 text-primary font-bold"
                  )}
                  key={tabKey}
                  onClick={() => {
                    handleTabClick(tabKey);
                  }}
                >
                  {tabs[tabKey].title}
                </span>
              );
            })}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={40}>
        <div className="flex flex-col h-full w-full">
          <div className="h-8 border-b border-border flex gap-x-3 items-center text-xs">
            <ThemeToggle />
            <div className="flex gap-x-1 items-center">
              <span className="text-primary font-bold">Selected </span>
              <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">{activeDialog === "" ? "----" : activeDialog}</span>
            </div>
            <div className="flex gap-x-1 items-center">
              <span className="text-primary font-bold">Dialog Order Count </span>
              <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">{dialogOrder.length}</span>
            </div>
            <div className="flex gap-x-1 items-center">
              <span className="text-primary font-bold">Dialogs Count </span>
              <span className="rounded-full px-2 py-1 bg-slate-300 dark:bg-slate-800">{Object.keys(dialogs).length}</span>
            </div>
          </div>
          <div className="h-full w-full">
            <WindowDialogContainer />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
