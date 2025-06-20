import { createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false, 
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
