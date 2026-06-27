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
    if (!window.openai) {
      console.error("OpenAI bridge not found");
      return;
    }

    async function load() {
      try {
        // Wait until the bridge is ready
        await window.openai.ready?.();

        // Read current tool result
        const toolResult = await window.openai.getToolResult?.();

        console.log("Tool Result:", toolResult);

        setData(toolResult);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  return data;
}