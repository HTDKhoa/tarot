import { lazy, Suspense, createElement, type ComponentType } from "react";

export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>) {
  const C = lazy(loader);
  return function Dynamic(props: P) {
    return createElement(Suspense, { fallback: null }, createElement(C, props));
  };
}
