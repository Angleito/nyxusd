import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import App from "./App";
// CSS imports in correct order: base styles, theme, then app-specific
import "./styles/index.css";
import "./styles/theme.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
