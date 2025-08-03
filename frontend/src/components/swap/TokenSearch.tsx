import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X } from 'lucide-react';
import { TokenInfo } from '../../services/tokenService';

interface TokenSearchProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
  availableTokens: TokenInfo[];
  tokensLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
  selectedToken,
  onTokenSelect,
  availableTokens,
  tokensLoading,
  placeholder = "Search tokens...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<TokenInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter tokens based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTokens(availableTokens.slice(0, 20)); // Show top 20 by default
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableTokens.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered.slice(0, 50)); // Limit to 50 results
    }
  }, [searchQuery, availableTokens]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: TokenInfo) => {
    onTokenSelect(token.symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputClick = () => {
    if (!disabled && !tokensLoading) {
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && filteredTokens.length > 0) {
      handleTokenSelect(filteredTokens[0]);
    }
  };

  const selectedTokenInfo = availableTokens.find(token => token.symbol === selectedToken);

  return (
    <div className="relative">
      {/* Token Input/Button */}
      <div
        onClick={handleInputClick}
        className={`
          flex items-center justify-between px-4 py-3 bg-gray-800/70 border border-purple-700/30 
          rounded-lg cursor-pointer transition-all duration-200
          ${disabled || tokensLoading 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:border-purple-500 focus-within:border-purple-500'
          }
          ${isOpen ? 'border-purple-500 ring-1 ring-purple-500/20' : ''}
        `}
      >
        {tokensLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : selectedTokenInfo ? (
          <div className="flex items-center space-x-3">
            {selectedTokenInfo.logoURI && (
              <img 
                src={selectedTokenInfo.logoURI} 
                alt={selectedTokenInfo.symbol}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex flex-col">
              <span className="text-white font-medium">{selectedTokenInfo.symbol}</span>
              {selectedTokenInfo.name !== selectedTokenInfo.symbol && (
                <span className="text-xs text-gray-400 truncate max-w-32">
                  {selectedTokenInfo.name}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{selectedToken || 'Select token'}</span>
        )}
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-purple-700/30 rounded-lg shadow-2xl z-50 max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            <div className="sticky top-0 bg-gray-800 border-b border-purple-700/30 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-8 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Token List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {searchQuery ? 'No tokens found' : 'No tokens available'}
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <motion.button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 transition-colors border-none bg-transparent text-left"
                    whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.1)' }}
                  >
                    {token.logoURI && (
                      <img 
                        src={token.logoURI} 
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{token.symbol}</span>
                        {token.tags && token.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {token.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-purple-600/20 text-purple-300 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {token.name}
                      </div>
                      {token.address && (
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredTokens.length > 0 && (
              <div className="sticky bottom-0 bg-gray-800 border-t border-purple-700/30 p-2">
                <div className="text-xs text-gray-400 text-center">
                  {filteredTokens.length === 50 ? '50+ tokens found' : `${filteredTokens.length} tokens found`}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};