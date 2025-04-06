import { useState, useCallback } from "react";
import { API_CONFIG } from "../constants/apiConfig";
import { systemPrompt } from "../constants/prompt";

export const useChatHandler = (fullContent) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const createMessage = (role, content) => ({
    role,
    content,
    id: crypto.randomUUID(),
  });

  const handleSendMessage = useCallback(
    async (userInput) => {
      if (!userInput.trim() || !fullContent || isLoading) return;

      console.log("Sending message:", userInput);
      console.log("Full content:", fullContent);

      const userMessage = createMessage("user", userInput.trim());

      setChatHistory((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch(API_CONFIG.ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: API_CONFIG.MODEL,
            messages: [
              {
                role: "system",
                content: systemPrompt(fullContent),
              },
              {
                role: "user",
                content: userInput,
              },
            ],
            temperature: API_CONFIG.TEMPERATURE,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("AI response:", data);

        const aiResponse =
          data.choices?.[0]?.message?.content || "No response generated";

        setChatHistory((prev) => [...prev, createMessage("bot", aiResponse)]);
      } catch (error) {
        setChatHistory((prev) => [
          ...prev,
          createMessage("bot", `❌ Error: ${error.message}`),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [fullContent, isLoading],
  );

  return { chatHistory, isLoading, handleSendMessage, setChatHistory };
};
