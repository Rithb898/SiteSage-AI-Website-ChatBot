import { useCallback } from "react";
import { Readability } from "@mozilla/readability";

export const useContentExtraction = () => {
  const extractContent = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("No active tab found");
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      });

      if (!result?.result) throw new Error("Empty page content");

      const doc = new DOMParser().parseFromString(result.result, "text/html");
      const article = new Readability(doc).parse();

      if (!article || !article.textContent?.trim()) {
        throw new Error("Readability couldn't parse the page.");
      }

      return article || "Content extraction failed";
    } catch (error) {
      console.error("Content extraction error:", error);
      return "Error reading page content";
    }
  }, []);

  return { extractContent };
};
