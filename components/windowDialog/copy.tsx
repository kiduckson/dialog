import * as React from "react";

function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType
) {
  const Context = React.createContext<ContextValueType | undefined>(
    defaultContext
  );

  function Provider(props: ContextValueType & { children: React.ReactNode }) {
    const { children, ...context } = props;
    // Only re-memoize when prop values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = React.useMemo(
      () => context,
      Object.values(context)
    ) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext(consumerName: string) {
    const context = React.useContext(Context);
    if (context) return context;
    if (defaultContext !== undefined) return defaultContext;
    // if a defaultContext wasn't specified, it's a required context.
    throw new Error(
      `\`${consumerName}\` must be used within \`${rootComponentName}\``
    );
  }

  Provider.displayName = rootComponentName + "Provider";
  return [Provider, useContext] as const;
}

/* ----------------------------------------
 * createContextScope
 * ---------------------------------------- */

type Scope<C = any> = { [scopeName: string]: React.Context<C>[] } | undefined;
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };

// call signiture
// a function with scopeName
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = [] // array of functions
) {
  let defaultContexts: any[] = [];

  /**
   */
  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType
  ) {
    const BaseContext = React.createContext<ContextValueType | undefined>(
      defaultContext
    );
    const index = defaultContexts.length;
    defaultContext;
  }
}
