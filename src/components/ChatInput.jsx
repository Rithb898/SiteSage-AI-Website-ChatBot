import { useEffect, useRef } from "react";
const ChatInput = ({
  userInput,
  setUserInput,
  isLoading,
  handleSendMessage,
  isDisabled,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-4 border-t border-gray-800 bg-gray-800"
    >
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about the full content..."
          disabled={isLoading || isDisabled}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none ${
            isDisabled
              ? "bg-gray-700 border-gray-600"
              : "border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isLoading ? "Processing..." : "Ask"}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
