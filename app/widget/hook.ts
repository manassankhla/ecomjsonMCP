"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    openai?: any;
  }
}

export function useWidgetProps<T>() {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    console.log("🔥 window.openai =", window.openai);

    if (!window.openai) {
      console.log("❌ window.openai is undefined");
      return;
    }

    console.log("🔥 widgetData =", window.openai.widgetData);

    if (window.openai.widgetData) {
      setData(window.openai.widgetData as T);
      return;
    }

    console.log("❌ No widgetData found");
  }, []);

  return data;
}