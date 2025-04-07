import { useState, memo, lazy, Suspense } from "react";
import { Bot, User, Copy, CheckCheck } from "lucide-react";
import { motion } from "motion/react";

// Lazy load heavy components
const ReactMarkdown = lazy(() => import("react-markdown"));
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then(mod => ({
    default: mod.Prism
  }))
);

// Import styles only when needed
const loadPrismStyle = () => import("react-syntax-highlighter/dist/esm/styles/prism/one-dark").then(mod => mod.default);

// Optimized code block component
const CodeBlock = memo(({ children, language = "javascript", inline = false }) => {
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState(null);
  const codeString = String(children).trim();

  // Load syntax highlighting style only when needed
  if (!style && !inline) {
    loadPrismStyle().then(setStyle);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // For inline code, return a simpler component
  if (inline) {
    return (
      <code className="bg-gray-700 text-blue-300 px-1 rounded">{children}</code>
    );
  }

  // For block code, include copy button and full syntax highlighting
  return (
    <div className="relative group mb-3">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <>
            <CheckCheck size={14} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span>Copy</span>
          </>
        )}
      </button>
      <Suspense fallback={<pre className="bg-gray-800 p-4 rounded-lg">{codeString}</pre>}>
        {style ? (
          <SyntaxHighlighter
            language={language}
            style={style}
            customStyle={{ borderRadius: "0.5rem", margin: 0 }}
            wrapLongLines={true}
          >
            {codeString}
          </SyntaxHighlighter>
        ) : (
          <pre className="bg-gray-800 p-4 rounded-lg">{codeString}</pre>
        )}
      </Suspense>
    </div>
  );
});

// Optimized markdown components
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return inline ? (
      <code
        className="bg-gray-700 text-blue-300 px-1 rounded"
        {...props}
      >
        {children}
      </code>
    ) : (
      <CodeBlock language={match?.[1] || "javascript"}>
        {children}
      </CodeBlock>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    );
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc pl-4 mb-3">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 mb-3">{children}</ol>;
  },
  li({ children }) {
    return <li className="mb-1">{children}</li>;
  },
  h3({ children }) {
    return (
      <h3 className="text-lg font-semibold mb-2">{children}</h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="text-base font-medium mb-1">{children}</h4>
    );
  },
};

// Main component memoized to prevent unnecessary re-renders
const ChatMessage = memo(({ message }) => {
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
          <Suspense fallback={<p>Loading message...</p>}>
            <ReactMarkdown
              className="prose prose-sm prose-invert"
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </Suspense>
        )}
      </div>
      {isUser && (
        <div className="ml-2 text-lg">
          <span role="img" aria-label="User">
            <User />
          </span>
        </div>
      )}
    </motion.div>
  );
});

export default ChatMessage;