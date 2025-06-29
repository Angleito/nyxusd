import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import App from "./App";
// CSS imports in correct order: base styles, theme, then app-specific
import "./styles/index.css";
import "./styles/theme.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
