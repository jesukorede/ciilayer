import { createWalletClient, custom } from "viem";
import EthereumProvider from "@walletconnect/ethereum-provider";

type Eip1193Provider = any;

let cachedInjectedProvider: Eip1193Provider | null = null;
let cachedWcProvider: Eip1193Provider | null = null;
let activeProvider: Eip1193Provider | null = null;

export type WalletProviderKind = "injected" | "walletconnect";

function getChainConfig() {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 296);
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ??
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL ??
    "https://testnet.hashio.io/api";

  return {
    chainId,
    rpcUrl,
    chainIdHex: `0x${chainId.toString(16)}` as const,
    chainName: process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Hedera Testnet",
    nativeCurrency: {
      name: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME ?? "HBAR",
      symbol: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL ?? "HBAR",
      decimals: Number(process.env.NEXT_PUBLIC_NATIVE_CURRENCY_DECIMALS ?? 18)
    },
    blockExplorerUrls: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL
      ? [process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL]
      : ["https://hashscan.io/testnet"]
  };
}

async function getInjectedProvider(): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return null;
  const anyWin = window as any;
  if (anyWin.ethereum) {
    cachedInjectedProvider = anyWin.ethereum;
    return cachedInjectedProvider;
  }

  return null;
}

async function getWalletConnectProvider(): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return null;
  if (cachedWcProvider) return cachedWcProvider;

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId) return null;

  const { chainId, rpcUrl } = getChainConfig();

  const provider = await EthereumProvider.init({
    projectId,
    chains: [chainId],
    showQrModal: true,
    rpcMap: { [chainId]: rpcUrl },
  });

  cachedWcProvider = provider as any;
  return cachedWcProvider;
}

async function getEip1193Provider(preferred?: WalletProviderKind): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return null;
  if (activeProvider) return activeProvider;

  if (preferred === "walletconnect") {
    const wc = await getWalletConnectProvider();
    if (wc) return wc;
    return await getInjectedProvider();
  }

  if (preferred === "injected") {
    const inj = await getInjectedProvider();
    if (inj) return inj;
    return await getWalletConnectProvider();
  }

  return (await getInjectedProvider()) ?? (await getWalletConnectProvider());
}

export async function getWalletClient(preferred?: WalletProviderKind) {
  const provider = await getEip1193Provider(preferred);
  if (!provider) return null;
  return createWalletClient({ transport: custom(provider) });
}

async function connectWithProvider(provider: any): Promise<`0x${string}`> {
  if (!provider) throw new Error("no_wallet");

  const cfg = getChainConfig();

  // Best-effort: ensure injected wallets are on the configured chain.
  // WalletConnect is already initialized with the target chain.
  try {
    if (provider?.request) {
      const current = await provider.request({ method: "eth_chainId" }).catch(() => null);
      if (current && String(current).toLowerCase() !== cfg.chainIdHex.toLowerCase()) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: cfg.chainIdHex }]
          });
        } catch (e: any) {
          const code = e?.code;
          if (code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: cfg.chainIdHex,
                  chainName: cfg.chainName,
                  nativeCurrency: cfg.nativeCurrency,
                  rpcUrls: [cfg.rpcUrl],
                  blockExplorerUrls: cfg.blockExplorerUrls
                }
              ]
            });
          }
        }
      }
    }
  } catch {
    // ignore chain switching errors; user may still connect on a different chain
  }

  try {
    if (typeof provider.connect === "function") {
      await provider.connect();
    } else if (typeof provider.enable === "function") {
      await provider.enable();
    }
  } catch {
    // best-effort; we'll still try eth_requestAccounts below
  }

  activeProvider = provider;
  const client = await getWalletClient();
  if (!client) throw new Error("no_wallet");
  const [addr] = await client.requestAddresses();
  return addr;
}

export async function connectWallet(): Promise<`0x${string}`> {
  const provider: any = await getEip1193Provider();
  return connectWithProvider(provider);
}

export async function connectInjectedWallet(): Promise<`0x${string}`> {
  const provider: any = await getInjectedProvider();
  if (!provider) throw new Error("no_wallet");
  return connectWithProvider(provider);
}

export async function connectWalletConnect(): Promise<`0x${string}`> {
  const provider: any = await getWalletConnectProvider();
  if (!provider) throw new Error("no_wallet");
  return connectWithProvider(provider);
}

export async function disconnectWallet(): Promise<void> {
  const provider: any = activeProvider ?? cachedWcProvider ?? cachedInjectedProvider;
  activeProvider = null;
  cachedWcProvider = null;
  cachedInjectedProvider = null;

  if (!provider) return;

  try {
    if (typeof provider.disconnect === "function") {
      await provider.disconnect();
    } else if (typeof provider.close === "function") {
      await provider.close();
    }
  } catch {
    // best-effort disconnect
  }
}

export async function signMessage(message: string, address: `0x${string}`): Promise<`0x${string}`> {
  const client = await getWalletClient();
  if (!client) throw new Error("no_wallet");
  return await client.signMessage({ account: address, message });
}
