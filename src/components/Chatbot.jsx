import { useEffect, useState, useRef, memo, useCallback, lazy, Suspense } from "react";
import { useContentExtraction } from "../hooks/useContentExtraction";
import { useChatHandler } from "../hooks/useChatHandler";
import { ChevronDown, ChevronUp } from "lucide-react";

// Lazy load components for better initial load performance
const ChatMessage = lazy(() => import("./ChatMessage"));
const ChatInput = lazy(() => import("./ChatInput"));

// Memoize static data
const suggestedQuestions = [
  "Summarize this page",
  "What are the key points?",
  "Explain this like I'm 5",
];

// Loading indicator as a separate component to avoid re-renders
const LoadingIndicator = memo(() => (
  <div className='flex items-center space-x-1 px-4 py-2 bg-gray-800 rounded-2xl max-w-[50%]'>
    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]'></div>
    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]'></div>
    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.3s]'></div>
  </div>
));

// Suggested questions component
const SuggestedQuestions = memo(({ onSuggestionClick }) => (
  <div className='flex flex-wrap gap-2'>
    {suggestedQuestions.map((question) => (
      <button
        key={question}
        onClick={() => onSuggestionClick(question)}
        className='text-sm bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors'
      >
        {question}
      </button>
    ))}
  </div>
));

// Chat header component
const ChatHeader = memo(({ isCollapsed, onToggleCollapse }) => (
  <div className='flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700'>
    <h3 className='font-medium text-white'>SiteSage-AI</h3>
    <div className='flex items-center'>
      <button
        onClick={onToggleCollapse}
        className='p-1 text-gray-300 hover:text-white'
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  </div>
));

// Main component
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const chatContainerRef = useRef(null);

  // Load content only once on mount
  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      const result = await extractContent();

      // Prevent state updates if component unmounted
      if (!isMounted) return;

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
            timestamp: new Date().toISOString(),
          },
        ]);
        setShowSuggestions(true);
      } else {
        setChatHistory([
          {
            role: "bot",
            content: result?.error || "⚠️ Failed to analyze page content",
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    loadContent();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [extractContent, setChatHistory]);

  // Auto-scroll chat to bottom - use requestAnimationFrame for smoother scrolling
  useEffect(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      });
    }
  }, [chatHistory]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSuggestionClick = useCallback((suggestion) => {
    setUserInput("");
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  }, [handleSendMessage]);

  // Toggle collapsed mode (just header visible)
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Memoize the submit handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (contentData.textContent && userInput.trim()) {
      handleSendMessage(userInput);
      setUserInput("");
      setShowSuggestions(false);
    }
  }, [contentData.textContent, userInput, handleSendMessage]);

  return (
    <div
      className='flex flex-col bg-gray-800 border border-gray-700 overflow-hidden text-white shadow-lg transition-all duration-300'
      style={{
        width: "384px",
        height: isCollapsed ? "48px" : "600px",
      }}
    >
      {/* Chat header */}
      <ChatHeader isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />

      {/* Chat content - hidden when collapsed */}
      {!isCollapsed && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading chat...</div>}>
          <>
            <div
              ref={chatContainerRef}
              className='flex-1 overflow-y-auto p-4 space-y-4'
            >
              {/* Virtualize the chat history for better performance with many messages */}
              {chatHistory.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Suggested questions */}
              {showSuggestions && <SuggestedQuestions onSuggestionClick={handleSuggestionClick} />}

              {/* Loading indicator */}
              {isLoading && <LoadingIndicator />}
            </div>

            <ChatInput
              userInput={userInput}
              setUserInput={setUserInput}
              isLoading={isLoading}
              handleSendMessage={handleSubmit}
              isDisabled={!contentData.textContent || isLoading}
            />
          </>
        </Suspense>
      )}
    </div>
  );
};

export default memo(Chatbot);
