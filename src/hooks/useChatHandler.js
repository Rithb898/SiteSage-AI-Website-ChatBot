import { useState, useCallback, useRef, useEffect } from "react";
import { API_CONFIG } from "../constants/apiConfig";
import { systemPrompt } from "../constants/prompt";

// Cache for API responses
const responseCache = new Map();

// Helper to create a cache key from messages
const createCacheKey = (messages) => {
  return JSON.stringify(messages.map(m => ({ role: m.role, content: m.content })));
};

// Helper to truncate content if it's too large
const truncateContent = (content, maxLength = 100000) => {
  if (!content || content.length <= maxLength) return content;
  console.warn(`Content truncated from ${content.length} to ${maxLength} characters`);
  return content.substring(0, maxLength);
};

export const useChatHandler = (fullContent) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Clean up any pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const createMessage = (role, content) => ({
    role,
    content,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });

  const handleSendMessage = useCallback(
    async (userInput) => {
      if (!userInput.trim() || !fullContent || isLoading) return;

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const trimmedInput = userInput.trim();
      const userMessage = createMessage("user", trimmedInput);

      setChatHistory((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Debounce the API call by 100ms to prevent rapid-fire requests
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Truncate content if it's too large
          const truncatedContent = truncateContent(fullContent);

          // Prepare messages for the API
          const messages = [
            {
              role: "system",
              content: systemPrompt(truncatedContent),
            },
            {
              role: "user",
              content: trimmedInput,
            },
          ];

          // Check cache first
          const cacheKey = createCacheKey(messages);
          if (responseCache.has(cacheKey)) {
            console.log("Using cached response");
            const cachedResponse = responseCache.get(cacheKey);
            setChatHistory((prev) => [...prev, createMessage("bot", cachedResponse)]);
            setIsLoading(false);
            return;
          }

          // Create a new AbortController for this request
          abortControllerRef.current = new AbortController();

          const response = await fetch(API_CONFIG.ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: API_CONFIG.MODEL,
              messages,
              temperature: API_CONFIG.TEMPERATURE,
              max_tokens: API_CONFIG.MAX_TOKENS,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            );
          }

          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content || "No response generated";

          // Cache the response
          responseCache.set(cacheKey, aiResponse);

          // Limit cache size to 50 entries (simple LRU implementation)
          if (responseCache.size > 50) {
            const firstKey = responseCache.keys().next().value;
            responseCache.delete(firstKey);
          }

          setChatHistory((prev) => [...prev, createMessage("bot", aiResponse)]);
        } catch (error) {
          // Don't show error for aborted requests
          if (error.name !== 'AbortError') {
            setChatHistory((prev) => [
              ...prev,
              createMessage("bot", `❌ Error: ${error.message}`),
            ]);
          }
        } finally {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }, 100); // 100ms debounce
    },
    [fullContent, isLoading],
  );

  return { chatHistory, isLoading, handleSendMessage, setChatHistory };
};
