export const MAD_SBT_TESTNET_ADDRESS = "0x37aB71116E2A89dA7d27c918aBE6B9Bb8bEE5d12";
export const MAD_SBT_MAINNET_ADDRESS = "0x22209D6eAe6cEBA2d059ebfE67b67837BCC1b428";

export const SBT_LEVELS_TESTNET_ADDRESS = "0x214955A9Ab649A17a14999A0afdC9F2c422084b1";
export const SBT_LEVELS_MAINNET_ADDRESS = "0x9bE0E2B6B6AeDf2c4E594D2474824846fdE5e770";

export const BOUNTIES_TESTNET_ADDRESS = "0xa363AB8e2b4e09AF678Ded095011AbB0A801947b";
export const BOUNTIES_MAINNET_ADDRESS = "0x606E8572e79852Cb0766fd95907FeE7b974e41Be";

export const MADFI_API_BASE_URL = "https://api.madfi.xyz/prod";
export const STORJ_API_URL = "https://www.storj-ipfs.com";
export const MADFI_URL = "https://madfi.xyz";
export const MADFI_URL_TESTNET = "https://testnet.madfi.xyz";
export const MADFI_GENESIS_BADGE_ID = "1";

export const MADFI_SUBGRPAH_URL_TESTNET = "https://api.thegraph.com/subgraphs/name/mad-finance/testnet-madfi-subgraph";
export const MADFI_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/mad-finance/madfi-subgraph";

const _hash = (uriOrHash: string): string => (
  typeof uriOrHash === "string" && uriOrHash.startsWith("ipfs://") ? uriOrHash.split("ipfs://")[1] : uriOrHash
);

export const storjGatewayURL = (uriOrHash: string): string => (
  `${STORJ_API_URL}/ipfs/${_hash(uriOrHash)}`
);