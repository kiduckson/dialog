"use client";

import { createContext, createContextScope } from "@/hooks/createContext";
import { forwardRef, useCallback, useRef, MouseEvent } from "react";

import type { Scope } from "@/hooks/createContext";
import { useControllableState } from "@/hooks/useControllableState";
import { useComposedRefs } from "@/hooks/useComposeRef";
import { composeEventHandlers } from "@/hooks/composeEventHandlers";

type ScopedProps<P> = P & { __scopeScopeTest?: Scope };

const SCOPETEST_NAME = "ScopeTest";

const [createScopeTestContext, createScopeTestScope] =
  createContextScope(SCOPETEST_NAME);

type ScopeTestContextValue = {
  triggerRef: React.RefObject<HTMLButtonElement>;
  testValue1: string;
  testValue2: number;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
};

const [ScopeTestProvider, useScopeTestContext] =
  createScopeTestContext<ScopeTestContextValue>(SCOPETEST_NAME);

interface ScopeTestProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?(open: boolean): void;
}

function getState(open: boolean) {
  return open ? "open" : "closed";
}

const ScopeTest = (props: ScopedProps<ScopeTestProps>) => {
  const { __scopeScopeTest, children, open: openProp, onOpenChange } = props;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    onChange: onOpenChange,
  });
  return (
    <ScopeTestProvider
      testValue1="testValue1"
      testValue2={222111}
      triggerRef={triggerRef}
      scope={__scopeScopeTest}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen]
      )}
    >
      {children}
    </ScopeTestProvider>
  );
};
ScopeTest.displayName = SCOPETEST_NAME;

const TRIGGER_NAME = "ScopeTestTrigger";

type ScopeTestTriggerElement = React.ElementRef<"button">;
interface ScopeTestTriggerProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const ScopeTestTrigger = forwardRef<
  ScopeTestTriggerElement,
  ScopeTestTriggerProps
>((props: ScopedProps<ScopeTestTriggerProps>, forwardedRef) => {
  const { __scopeScopeTest, ...triggerProps } = props;
  const context = useScopeTestContext(TRIGGER_NAME, __scopeScopeTest);
  const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);

  // console.log(__scopeScopeTest, triggerProps);
  // console.log(context);

  return (
    <button
      aria-expanded={context.open}
      data-state={getState(context.open)}
      {...triggerProps}
      ref={composedTriggerRef}
      onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
    >
      BUTTON TRIGGER
    </button>
  );
});

ScopeTestTrigger.displayName = TRIGGER_NAME;

export { ScopeTest, ScopeTestTrigger };
export type { ScopeTestProps };
