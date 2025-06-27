import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { Message } from '../../providers/AIAssistantProvider';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
  const isAI = message.sender === 'ai';
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const typewriterVariants = {
    hidden: { width: 0 },
    visible: { 
      width: '100%',
      transition: {
        duration: 0.5,
        ease: 'linear'
      }
    }
  };

  return (
    <motion.div
      className={clsx(
        'flex gap-3 p-4 rounded-lg transition-all duration-200',
        isAI ? 'bg-gray-800/30 hover:bg-gray-800/40' : 'bg-transparent hover:bg-gray-800/10'
      )}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 500 }}
    >
      {/* Avatar */}
      <motion.div 
        className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          isAI 
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-900/30' 
            : 'bg-gray-700 hover:bg-gray-600'
        )}
        whileHover={{ scale: 1.1, rotate: isAI ? 5 : 0 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {isAI ? (
          <SparklesIcon className="w-5 h-5 text-white" />
        ) : (
          <UserIcon className="w-5 h-5 text-gray-300" />
        )}
      </motion.div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-sm font-medium',
            isAI ? 'text-purple-300' : 'text-gray-400'
          )}>
            {isAI ? 'AI Assistant' : 'You'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        {message.typing && isLatest ? (
          <motion.div
            className="text-gray-300"
            variants={typewriterVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-block overflow-hidden whitespace-nowrap">
              {message.content}
              <motion.span
                className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              />
            </span>
          </motion.div>
        ) : (
          <div className="text-gray-300 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}
      </div>
    </motion.div>
  );
};