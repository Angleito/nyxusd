import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { SparklesIcon, UserIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  typing?: boolean;
  status?: "sending" | "sent" | "error";
  metadata?: {
    toolsUsed?: string[];
    cryptoData?: any;
    recommendations?: string[];
  };
}

interface ChatMessageImprovedProps {
  message: Message;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showTimestamp?: boolean;
  previousMessageTimestamp?: Date;
}

export const ChatMessageImproved: React.FC<ChatMessageImprovedProps> = ({
  message,
  isFirstInGroup = false,
  isLastInGroup = false,
  showTimestamp = false,
  previousMessageTimestamp,
}) => {
  const isAI = message.sender === "ai";
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  // Determine if we should show a timestamp separator
  const shouldShowDateSeparator = previousMessageTimestamp && 
    new Date(message.timestamp).toDateString() !== new Date(previousMessageTimestamp).toDateString();

  // Format time in a more friendly way
  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      {/* Date Separator */}
      {shouldShowDateSeparator && (
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-900 rounded-full">
            {new Date(message.timestamp).toLocaleDateString([], { 
              weekday: "long", 
              month: "long", 
              day: "numeric" 
            })}
          </span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
      )}

      {/* System Messages */}
      {isSystem && (
        <motion.div
          className="flex justify-center my-4"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-4 py-2 bg-yellow-900/20 border border-yellow-800/50 rounded-lg text-yellow-200 text-sm">
            {message.content}
          </div>
        </motion.div>
      )}

      {/* Regular Messages */}
      {!isSystem && (
        <motion.div
          className={clsx(
            "flex gap-3 group",
            isUser ? "flex-row-reverse" : "flex-row",
            isFirstInGroup ? "mt-4" : "mt-1",
          )}
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Avatar - Only show for first message in group */}
          {isFirstInGroup ? (
            <motion.div
              className={clsx(
                "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg",
                isAI
                  ? "bg-gradient-to-br from-purple-500 to-purple-700"
                  : "bg-gradient-to-br from-blue-500 to-blue-700",
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {isAI ? (
                <SparklesIcon className="w-5 h-5 text-white" />
              ) : (
                <UserIcon className="w-5 h-5 text-white" />
              )}
            </motion.div>
          ) : (
            <div className="w-9 h-9 flex-shrink-0" />
          )}

          {/* Message Bubble */}
          <div className={clsx(
            "flex flex-col max-w-[70%]",
            isUser ? "items-end" : "items-start"
          )}>
            {/* Sender name and timestamp - Only show for first message in group */}
            {isFirstInGroup && (
              <div className={clsx(
                "flex items-center gap-2 mb-1 px-1",
                isUser ? "flex-row-reverse" : "flex-row"
              )}>
                <span className={clsx(
                  "text-xs font-medium",
                  isAI ? "text-purple-400" : "text-blue-400"
                )}>
                  {isAI ? "NYX Assistant" : "You"}
                </span>
                <span className="text-xs text-gray-600">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}

            {/* Message Content */}
            <motion.div
              className={clsx(
                "relative px-4 py-2.5 rounded-2xl shadow-sm",
                isUser
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700/50",
                isLastInGroup ? "mb-1" : "",
              )}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {/* Typing Indicator */}
              {message.typing ? (
                <div className="flex gap-1">
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              ) : (
                <div className="message-content">
                  {/* Render markdown for AI messages */}
                  {isAI ? (
                    <ReactMarkdown
                      className="prose prose-sm prose-invert max-w-none"
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const inline = props.inline || false;
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={nightOwl as any}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg my-2"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-900 px-1 py-0.5 rounded text-purple-300" {...props}>
                              {children}
                            </code>
                          );
                        },
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="ml-2">{children}</li>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mb-2 text-purple-300">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold mb-2 text-purple-300">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-bold mb-1 text-purple-300">{children}</h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-500 pl-3 my-2 text-gray-300">
                            {children}
                          </blockquote>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-purple-300">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-300">{children}</em>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                </div>
              )}

              {/* Message Status */}
              {message.status && isUser && (
                <div className="absolute -bottom-5 right-0 flex items-center gap-1">
                  {message.status === "sending" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-3 h-3 text-gray-500" />
                    </motion.div>
                  )}
                  {message.status === "sent" && (
                    <CheckCircleIcon className="w-3 h-3 text-blue-400" />
                  )}
                  {message.status === "error" && (
                    <ExclamationTriangleIcon className="w-3 h-3 text-red-400" />
                  )}
                </div>
              )}
            </motion.div>

            {/* Metadata Pills */}
            {message.metadata?.toolsUsed && message.metadata.toolsUsed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 px-1">
                {message.metadata.toolsUsed.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-purple-900/30 text-purple-300 rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

/* Enhanced Styling */
const messageStyles = `
  .message-content {
    word-break: break-word;
    line-height: 1.5;
  }

  .prose-invert {
    color: inherit;
  }

  .prose-invert h1,
  .prose-invert h2,
  .prose-invert h3,
  .prose-invert h4,
  .prose-invert h5,
  .prose-invert h6 {
    color: rgb(196 181 253);
  }

  .prose-invert strong {
    color: rgb(196 181 253);
  }

  .prose-invert a {
    color: rgb(147 197 253);
    text-decoration: underline;
  }

  .prose-invert a:hover {
    color: rgb(191 219 254);
  }

  .prose-invert code {
    color: rgb(196 181 253);
  }

  .prose-invert pre {
    background-color: rgb(17 24 39);
    border: 1px solid rgb(55 65 81);
  }

  .prose-invert blockquote {
    color: rgb(209 213 219);
  }

  .prose-invert ul > li::marker,
  .prose-invert ol > li::marker {
    color: rgb(156 163 175);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = messageStyles;
  document.head.appendChild(styleElement);
}