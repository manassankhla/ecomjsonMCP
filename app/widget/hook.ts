"use client";

import { useEffect, useState } from "react";

export function useWidgetProps<T>() {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      console.clear();

      console.log("window.openai =", (window as any).openai);
      console.log("widgetData =", (window as any).openai?.widgetData);

      if ((window as any).openai?.widgetData) {
        setData((window as any).openai.widgetData);
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return data;
}