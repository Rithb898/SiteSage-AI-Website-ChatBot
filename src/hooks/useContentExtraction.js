import { useCallback, useRef, useEffect } from "react";
import { Readability } from "@mozilla/readability";

// Cache structure to store parsed content by URL
const contentCache = new Map();

export const useContentExtraction = () => {
  const cacheTimeoutRef = useRef(null);

  // Clear cache after 30 minutes of inactivity
  useEffect(() => {
    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  const extractContent = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("No active tab found");

      // Check if we have a cached version for this URL
      if (contentCache.has(tab.url)) {
        console.log("Using cached content for:", tab.url);
        return contentCache.get(tab.url);
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      });

      if (!result?.result) throw new Error("Empty page content");

      // Parse HTML more efficiently with a size limit
      const htmlContent = result.result;
      const maxSize = 5 * 1024 * 1024; // 5MB limit

      if (htmlContent.length > maxSize) {
        console.warn("Content exceeds size limit, truncating for parsing");
      }

      const doc = new DOMParser().parseFromString(
        htmlContent.slice(0, maxSize),
        "text/html"
      );

      const article = new Readability(doc, {
        // Readability options for better performance
        charThreshold: 500,
        classesToPreserve: [],
      }).parse();

      if (!article || !article.textContent?.trim()) {
        throw new Error("Readability couldn't parse the page.");
      }

      // Cache the result
      contentCache.set(tab.url, article);

      // Set a timeout to clear this item from cache after 30 minutes
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
      cacheTimeoutRef.current = setTimeout(() => {
        contentCache.delete(tab.url);
      }, 30 * 60 * 1000);

      return article;
    } catch (error) {
      console.error("Content extraction error:", error);
      return { error: error.message };
    }
  }, []);

  return { extractContent };
};
