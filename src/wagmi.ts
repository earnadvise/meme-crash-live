import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Builder Code: bc_z10us01u
// Encoded String: 0x62635f7a313075733031750b0080218021802180218021802180218021
export const BUILDER_CODE_SUFFIX = "0x62635f7a313075733031750b0080218021802180218021802180218021";

export const config = getDefaultConfig({
  appName: 'Base Match-3 Puzzle',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  // Automatic attribution for all transactions
  dataSuffix: BUILDER_CODE_SUFFIX as `0x${string}`,
});
