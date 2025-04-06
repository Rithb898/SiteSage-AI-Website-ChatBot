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

// import { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// const ChatMessage = ({ message }) => {
//     const isUser = message.role === "user";

//     const CodeBlock = ({ children, language = "javascript" }) => {
//         const [copied, setCopied] = useState(false);
//         const codeString = String(children).trim();

//         const handleCopy = () => {
//             navigator.clipboard.writeText(codeString);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1500);
//         };

//         return (
//             <div className="relative group">
//                 <button
//                     onClick={handleCopy}
//                     className="absolute top-2 right-2 text-xs px-2 py-1 bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
//                 >
//                     {copied ? "Copied!" : "Copy"}
//                 </button>
//                 <SyntaxHighlighter
//                     language={language}
//                     style={oneDark}
//                     customStyle={{ borderRadius: "0.5rem", fontSize: "0.875rem" }}
//                 >
//                     {codeString}
//                 </SyntaxHighlighter>
//             </div>
//         );
//     };

//     return (
//         <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
//             <div
//                 className={`max-w-[80%] rounded-lg p-3 ${isUser
//                         ? "bg-blue-500 text-white"
//                         : "bg-white border border-gray-200 text-gray-800"
//                     }`}
//             >
//                 <ReactMarkdown
//                     className="text-sm whitespace-pre-wrap"
//                     components={{
//                         code({ node, inline, className, children, ...props }) {
//                             const match = /language-(\w+)/.exec(className || "");
//                             if (inline) {
//                                 return (
//                                     <code className="bg-gray-200 text-red-600 px-1 rounded" {...props}>
//                                         {children}
//                                     </code>
//                                 );
//                             }
//                             return (
//                                 <CodeBlock language={match?.[1]}>
//                                     {children}
//                                 </CodeBlock>
//                             );
//                         },
//                         a({ children, href }) {
//                             return (
//                                 <a
//                                     href={href}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="underline text-blue-600 hover:text-blue-800"
//                                 >
//                                     {children}
//                                 </a>
//                             );
//                         }
//                     }}
//                 >
//                     {message.content}
//                 </ReactMarkdown>
//             </div>
//         </div>
//     );
// };

// export default ChatMessage;
