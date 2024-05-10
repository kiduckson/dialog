import * as React from "react";

/**
 * 
 * This function is a utility for creating a 
 * React context with an associated provider and a custom hook for consuming the context. 
 * This setup includes error handling to ensure the context is used correctly within the component tree.

 * @param rootComponentName // debugging purpose
 * @param defaultContext // optional default value for the context
 * @returns // an Array containing the 'Provider' Component and the 'useContext' hook
 */

//ContextValueType either object or null
function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType
) {
  const Context = React.createContext<ContextValueType | undefined>(
    defaultContext
  );

  /**
   * Provider Component
   * - accepts context value and children as props
   *
   * @param props
   * @returns
   */
  function Provider(props: ContextValueType & { children: React.ReactNode }) {
    const { children, ...context } = props;
    // Only re-memoize when prop values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = React.useMemo(
      () => context,
      Object.values(context) // make the context as array
    ) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  /**
   * A custom hook to consume context
   *
   * @param consumerName
   * @returns
   */
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

/* -------------------------------------------------------------------------------------------------
 * createContextScope
 * -----------------------------------------------------------------------------------------------*/

// 같은 스콥네임이면 같은 컨텍스트를 사용하게 한다
// 컨텍스트 어레이로 저장한다
// {'dialogScope': [c, ]}
type Scope<C = any> = { [scopeName: string]: React.Context<C>[] } | undefined;

// ScopeHook
// 스콥을 받아서 오브제트를 리턴한다
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

/**
 *
 * This function extends the basic createContext
 * by allowing the creation of context scopes.
 *
 * A scope is a way to provide different context values
 * to different parts of your application
 * without changing the global context.
 *
 * @param scopeName // A unique indentifier for the scope
 * @param createContextScopeDeps // an array of dependencies
 * @returns // an array containting "SCOPED" `createContext` and `createScope`
 */
function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = []
) {
  // wherer to store default Context
  let defaultContexts: any[] = [];

  /* -----------------------------------------------------------------------------------------------
   * createContext
   * ---------------------------------------------------------------------------------------------*/

  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType
  ) {
    // create base context
    const BaseContext = React.createContext<ContextValueType | undefined>(
      defaultContext
    );

    // get the default context length
    const index = defaultContexts.length;
    // default contexts = exisiting defautlcontxts + defaultcontxt
    defaultContexts = [...defaultContexts, defaultContext];

    function Provider(
      props: ContextValueType & {
        scope: Scope<ContextValueType>; // scope = {"scopeName": [{React.context}, {React.context}]}]
        children: React.ReactNode;
      }
    ) {
      const { scope, children, ...context } = props; // get the scope
      const Context = scope?.[scopeName][index] || BaseContext; // 해당스콥의 해당 인덱스(최신)을 얻어온다 없으면 베이스 컨텍스트
      // Only re-memoize when prop values change
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const value = React.useMemo(
        () => context,
        Object.values(context)
      ) as ContextValueType;
      return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined> // scope = {"scopeName": [{React.context}, {React.context}]}], "scopeName": [{React.context}, {React.context}]}] }
    ) {
      const Context = scope?.[scopeName][index] || BaseContext; //
      const context = React.useContext(Context); //
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

  /* -----------------------------------------------------------------------------------------------
   * createScope
   * ---------------------------------------------------------------------------------------------*/

  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext);
    });
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(
        () => ({
          [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts },
        }),
        [scope, contexts]
      );
    };
  };

  createScope.scopeName = scopeName;
  return [
    createContext,
    composeContextScopes(createScope, ...createContextScopeDeps),
  ] as const;
}

/* -------------------------------------------------------------------------------------------------
 * composeContextScopes
 * -----------------------------------------------------------------------------------------------*/

function composeContextScopes(...scopes: CreateScope[]) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;

  const createScope: CreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({
      useScope: createScope(),
      scopeName: createScope.scopeName,
    }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce(
        (nextScopes, { useScope, scopeName }) => {
          // We are calling a hook inside a callback which React warns against to avoid inconsistent
          // renders, however, scoping doesn't have render side effects so we ignore the rule.
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes, ...currentScope };
        },
        {}
      );

      return React.useMemo(
        () => ({ [`__scope${baseScope.scopeName}`]: nextScopes }),
        [nextScopes]
      );
    };
  };

  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

/* -----------------------------------------------------------------------------------------------*/

export { createContext, createContextScope };
export type { CreateScope, Scope };
