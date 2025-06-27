import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface WalletProviderProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
    },
  },
});

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default WalletProvider;
