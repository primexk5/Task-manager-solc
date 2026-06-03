"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

// WalletConnect Cloud project id (free): https://cloud.reown.com
// Required for the WalletConnect/mobile options in the modal. getDefaultConfig
// refuses to start with an empty id, so we fall back to a placeholder — injected
// wallets (MetaMask, Rabby, Coinbase extension) still work; only the
// WalletConnect/mobile-QR option needs a real id.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";

const config = getDefaultConfig({
  appName: "Task Manager",
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
