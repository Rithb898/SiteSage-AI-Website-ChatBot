import { useEffect, useState, useCallback, useRef } from "react";
import { Readability } from "@mozilla/readability";


const API_CONFIG = {
  ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
  MODEL: "llama-3.3-70b-versatile",
  MAX_TOKENS: 32768,
  TEMPERATURE: 0.3
};


/*global chrome */


const Chatbot = () => {
  const [fullContent, setFullContent] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll and content extraction
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const extractContent = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      });

      const doc = new DOMParser().parseFromString(result.result, "text/html");
      const article = new Readability(doc).parse();
      return article?.textContent || "Content extraction failed";
    } catch (error) {
      console.error("Content extraction error:", error);
      return "Error reading page content";
    }
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      const content = await extractContent();
      setFullContent(content);
      setChatHistory([{
        role: "bot",
        content: "I've analyzed the full content. Ask me anything!",
        id: crypto.randomUUID()
      }]);
    };
    loadContent();
  }, [extractContent]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !fullContent || isLoading) return;

    const userMessage = {
      role: "user",
      content: userInput.trim(),
      id: crypto.randomUUID()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_CONFIG.ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: API_CONFIG.MODEL,
          messages: [
            {
              role: "system",
              content: `Analyze this FULL CONTENT and answer STRICTLY based on it: ${fullContent}`
            },
            {
              role: "user",
              content: userInput
            }
          ],
          temperature: API_CONFIG.TEMPERATURE
        })
      });


      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "No response generated";

      setChatHistory(prev => [...prev, {
        role: "bot",
        content: aiResponse,
        id: crypto.randomUUID()
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: "bot",
        content: `Error processing request ${error.message}`,
        id: crypto.randomUUID()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, fullContent, isLoading]);

  return (
    <div className="flex flex-col w-96 h-[500px] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-white border border-gray-200"
              }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
              <p className="text-sm text-gray-500">Analyzing...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about the full content..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {isLoading ? "Processing..." : "Ask"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;