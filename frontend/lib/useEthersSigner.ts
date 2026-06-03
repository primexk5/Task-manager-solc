"use client";

import { useMemo } from "react";
import { useConnectorClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import type { Account, Chain, Client, Transport } from "viem";

// Convert a wagmi/viem wallet client into an ethers v6 signer, so the rest of
// the app can keep using ethers Contract for writes. (Official wagmi recipe.)
function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(
    () => (client ? clientToSigner(client) : undefined),
    [client]
  );
}
