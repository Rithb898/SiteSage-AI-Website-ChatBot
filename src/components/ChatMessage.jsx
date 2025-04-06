import { Bot, User } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end ${isUser ? "justify-end" : "justify-start"} px-2`}
    >
      {!isUser && (
        <div className="mr-2 text-lg">
          <span role="img" aria-label="Bot">
            <Bot />
          </span>
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown className="prose prose-sm prose-invert">
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div className="ml-2 text-lg">
          <span role="img" aria-label="User">
            <User />{" "}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;