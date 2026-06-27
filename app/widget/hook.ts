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

    // Print everything available
    console.log("🔥 OpenAI keys:", Object.keys(window.openai));

    if ("widgetData" in window.openai) {
      console.log("🔥 widgetData =", window.openai.widgetData);
      setData(window.openai.widgetData as T);
    } else {
      console.log("❌ widgetData property not found");
    }
  }, []);

  return data;
}