"use client";

import { useSyncExternalStore } from "react";

type OpenAiGlobals = {
  toolOutput?: Record<string, unknown>;
  widgetData?: Record<string, unknown>;
};

declare global {
  interface Window {
    openai?: OpenAiGlobals;
  }
}

const SET_GLOBALS_EVENT = "openai:set_globals";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SET_GLOBALS_EVENT, onStoreChange);
  return () => window.removeEventListener(SET_GLOBALS_EVENT, onStoreChange);
}

function getSnapshot<T>(selector: (globals: OpenAiGlobals) => T | null): T | null {
  if (typeof window === "undefined" || !window.openai) {
    return null;
  }

  return selector(window.openai);
}

export function useWidgetProps<T extends Record<string, unknown>>() {
  return useSyncExternalStore(
    subscribe,
    () =>
      getSnapshot((globals) => {
        const toolOutput = globals.toolOutput as T | undefined;
        const widgetData = globals.widgetData as T | undefined;
        return toolOutput ?? widgetData ?? null;
      }),
    () => null
  );
}
