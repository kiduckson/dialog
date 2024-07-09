// https://github.com/radix-ui/primitives/blob/7e8f72011dc6b1fbdf07320eeeb20e6b5a7a9d97/packages/react/context/src/createContext.tsx

import * as React from "react";

function createContext<ContextValueType extends object | null>(rootComponentName: string, defaultContext?: ContextValueType) {
  const Context = React.createContext<ContextValueType | undefined>(defaultContext);

  function Provider(props: ContextValueType & { children: React.ReactNode }) {
    const { children, ...context } = props;
    // Only re-memoize when prop values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = React.useMemo(() => context, Object.values(context)) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext(consumerName: string) {
    const context = React.useContext(Context);
    if (context) return context;
    if (defaultContext !== undefined) return defaultContext;
    // if a defaultContext wasn't specified, it's a required context.
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }

  Provider.displayName = rootComponentName + "Provider";
  return [Provider, useContext] as const;
}

export { createContext };
