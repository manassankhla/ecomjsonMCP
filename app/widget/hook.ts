"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    openai?: {
      widgetData?: unknown;
    };
  }
}

export function useWidgetProps<T>() {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (window.openai?.widgetData) {
      setData(window.openai.widgetData as T);
    }
  }, []);

  return data;
}