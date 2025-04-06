// import React, { useState, useEffect } from "react";
// import { Readability } from "@mozilla/readability";

// const App = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [pageContent, setPageContent] = useState("");
//   // Debug states
//   const [currentTab, setCurrentTab] = useState(null);
//   const [htmlContent, setHtmlContent] = useState("");
//   const [status, setStatus] = useState("Initializing...");

//   useEffect(() => {
//     setStatus("Fetching page content...");
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       setCurrentTab(tabs[0]);
//       setStatus("Getting HTML...");

//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id },
//         function: () => document.documentElement.outerHTML
//       }, (result) => {
//         const html = result[0].result;
//         setHtmlContent(html.substring(0, 100) + "...");
//         setStatus("Parsing content...");

//         const doc = new DOMParser().parseFromString(html, 'text/html');
//         const reader = new Readability(doc);
//         const article = reader.parse();
//         const content = article ? article.textContent : 'Could not extract content';
//         setPageContent(content);
//         setStatus("Ready");
//       });
//     });
//   }, []);

//   const handleSend = () => {
//     if (!input.trim()) return;

//     setStatus(`Processing: ${input}`);
//     const newMessage = { text: input, sender: 'user' };
//     setMessages([...messages, newMessage]);

//     setTimeout(() => {
//       setMessages(prev => [...prev, {
//         text: "I understand you're asking about: " + input,
//         sender: 'bot'
//       }]);
//       setStatus("Ready");
//     }, 1000);

//     setInput("");
//   };

//   return (
//     <div className="w-96 h-[600px] flex flex-col p-4 bg-background">
//       {/* Debug info - Remove in production */}
//       <div className="mb-4 p-2 bg-gray-100 text-xs overflow-auto">
//         <div>Status: {status}</div>
//         <div>Tab: {currentTab?.url}</div>
//         <div>HTML Preview: {htmlContent}</div>
//         <div className="mt-2">Content Preview: {pageContent.substring(0, 100)}...</div>
//       </div>

//       <div className="flex-1 overflow-auto mb-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-[80%] p-3 rounded-lg ${
//               msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
//             }`}>
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//           className="flex-1 p-2 rounded-md bg-input text-foreground"
//           placeholder="Ask about this page..."
//         />
//         <button
//           onClick={handleSend}
//           className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default App;

// import React, { useState, useEffect } from "react";
// import { Readability } from "@mozilla/readability";
// import ChatBot from "react-simple-chatbot";
// import { ThemeProvider } from "styled-components";

// const App = () => {
//   const [pageContent, setPageContent] = useState("Loading...");
//   const [status, setStatus] = useState("Initializing...");
//   const [currentTab, setCurrentTab] = useState(null);
//   const [htmlContent, setHtmlContent] = useState("");

//   useEffect(() => {
//     setStatus("Fetching page content...");
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const tab = tabs[0];
//       setCurrentTab(tab);
//       setStatus("Getting HTML...");

//       chrome.scripting.executeScript(
//         {
//           target: { tabId: tab.id },
//           function: () => document.documentElement.outerHTML,
//         },
//         (result) => {
//           const html = result[0].result;
//           setHtmlContent(html.substring(0, 100) + "...");
//           setStatus("Parsing content...");

//           const doc = new DOMParser().parseFromString(html, "text/html");
//           const reader = new Readability(doc);
//           const article = reader.parse();
//           const content = article?.textContent || "Could not extract content";
//           setPageContent(content);
//           setStatus("Ready");
//         }
//       );
//     });
//   }, []);

//   const theme = {
//     background: "#f9fafb",
//     fontFamily: "sans-serif",
//     headerBgColor: "#3b82f6", // Tailwind blue-500
//     headerFontColor: "#fff",
//     headerFontSize: "16px",
//     botBubbleColor: "#3b82f6",
//     botFontColor: "#fff",
//     userBubbleColor: "#fff",
//     userFontColor: "#374151", // Tailwind gray-700
//   };

//   const steps = [
//     {
//       id: "0",
//       message: "Hey there! Ask me anything about the page you're on.",
//       trigger: "user-input",
//     },
//     {
//       id: "user-input",
//       user: true,
//       trigger: "bot-response",
//     },
//     {
//       id: "bot-response",
//       message: ({ previousValue }) =>
//         `You asked: "${previousValue}". Here's a snippet of the page: "${pageContent.substring(
//           0,
//           200
//         )}..."`,
//       trigger: "user-input",
//     },
//   ];

//   return (
//     <div className="w-96 h-[600px] bg-white rounded-xl shadow-md overflow-auto">
//       {/* Debug Info - comment or remove before production */}
//       {/* <div className="mb-4 p-3 bg-gray-100 text-xs text-gray-700 rounded overflow-auto">
//         <p><strong>Status:</strong> {status}</p>
//         <p><strong>Tab URL:</strong> {currentTab?.url}</p>
//         <p><strong>HTML Snippet:</strong> {htmlContent}</p>
//         <p className="mt-2"><strong>Content Snippet:</strong> {pageContent.substring(0, 100)}...</p>
//       </div> */}

//       <ThemeProvider theme={theme}>
//         <ChatBot steps={steps} />
//       </ThemeProvider>
//     </div>
//   );
// };

// export default App;

import React from "react";
import ChatbotSingle from "./components/ChatbotSingle";
import Chatbot from "./components/Chatbot";

function App() {
  return <Chatbot />;
}

export default App;
