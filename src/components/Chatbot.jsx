import { useEffect, useState } from "react";
import { useContentExtraction } from "../hooks/useContentExtraction";
import { useChatHandler } from "../hooks/useChatHandler";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const suggestedQuestions = [
  "Summarize this page",
  "What are the key points?",
  "Explain this like I'm 5",
];

const Chatbot = () => {
  const { extractContent } = useContentExtraction();
  const [contentData, setContentData] = useState({
    textContent: "",
    title: "",
    length: 0,
  });
  const { chatHistory, isLoading, handleSendMessage, setChatHistory } =
    useChatHandler(contentData.textContent);
  const [userInput, setUserInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      const result = await extractContent();
      if (result?.textContent) {
        setContentData({
          textContent: result.textContent,
          title: result.title,
          length: result.length,
        });
        // Initial message setup
        setChatHistory([
          {
            role: "bot",
            content: result.title
              ? `✅ I've analyzed **"${result.title}"**. Ask me anything based on the content.`
              : `✅ Content analyzed. Ask me anything you'd like to know.`,
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setShowSuggestions(true);
      } else {
        setChatHistory([
          {
            role: "bot",
            content: result?.error || "⚠️ Failed to analyze page content",
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    loadContent();
  }, [extractContent, setChatHistory]);

  const handleSuggestionClick = (suggestion) => {
    setUserInput("");
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col w-96 h-[600px] bg-gray-800 border border-gray-800 overflow-hidden text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {showSuggestions && (
          <div className="space-y-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestionClick(question)}
                className="text-sm bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center space-x-1 px-4 py-2 bg-gray-800 rounded-2xl max-w-[50%]">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.3s]"></div>
          </div>
        )}
      </div>

      <ChatInput
        userInput={userInput}
        setUserInput={setUserInput}
        isLoading={isLoading}
        handleSendMessage={(e) => {
          e.preventDefault();
          if (contentData) {
            handleSendMessage(userInput);
            setUserInput("");
            setShowSuggestions(false);
          }
        }}
        isDisabled={!contentData || isLoading}
      />
    </div>
  );
};

export default Chatbot;
