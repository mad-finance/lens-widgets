import { Environment, production } from "@lens-protocol/client";
import { getAddress } from "viem";

// 1. import your handler class
import {
  SIMPLE_COLLECTION_MINT_TESTNET_ADDRESS, SIMPLE_COLLECTION_MINT_MAINNET_ADDRESS, SimpleCollectionMintAction
} from "./handlers/SimpleCollectionMintAction";
import {
  ZORA_LZ_MINT_TESTNET_ADDRESS, ZORA_LZ_MINT_MAINNET_ADDRESS, ZoraLzMintAction
} from "./handlers/ZoraLzMintAction";
import {
  REWARD_ENGAGEMENT_TESTNET_ADDRESS, REWARD_ENGAGEMENT_MAINNET_ADDRESS, RewardEngagementAction
} from "./handlers/RewardEngagementAction";
import {
  BOUNTY_ACTION_TESTNET_ADDRESS, BOUNTY_ACTION_MAINNET_ADDRESS, PublicationBountyAction
} from "./handlers/PublicationBountyAction";
import {
  REWARDS_SWAP_TESTNET_ADDRESS, REWARDS_SWAP_MAINNET_ADDRESS, RewardsSwapAction
} from "./handlers/RewardsSwapAction"
import {
  RENTABLE_SPACE_ACTION_TESTNET_ADDRESS, RENTABLE_SPACE_ACTION_MAINNET_ADDRESS, RentableSpaceAction,
} from "./handlers/RentableSpaceAction";
import {
  TIP_ACTION_TESTNET_ADDRESS, TIP_ACTION_MAINNET_ADDRESS, TipAction,
} from "./handlers/TipAction";

// 2. add the entry for MAINNET, where `handler` is the exported handler class
const MAINNET = [
  { address: ZORA_LZ_MINT_MAINNET_ADDRESS, handler: ZoraLzMintAction, name: "ZoraLzMintAction" },
  { address: SIMPLE_COLLECTION_MINT_MAINNET_ADDRESS, handler: SimpleCollectionMintAction, name: "SimpleCollectionMintAction" },
  { address: REWARD_ENGAGEMENT_MAINNET_ADDRESS, handler: RewardEngagementAction, name: "RewardEngagementAction" },
  { address: BOUNTY_ACTION_MAINNET_ADDRESS, handler: PublicationBountyAction, name: "PublicationBountyAction" },
  { address: REWARDS_SWAP_MAINNET_ADDRESS, handler: RewardsSwapAction, name: "RewardsSwap" },
  { address: RENTABLE_SPACE_ACTION_MAINNET_ADDRESS, handler: RentableSpaceAction, name: "RentableSpaceAction" },
  { address: TIP_ACTION_MAINNET_ADDRESS, handler: TipAction, name: "TipAction" },
];

// 2. add the entry for TESTNET
const TESTNET = [
  { address: ZORA_LZ_MINT_TESTNET_ADDRESS, handler: ZoraLzMintAction, name: "ZoraLzMintAction" },
  { address: SIMPLE_COLLECTION_MINT_TESTNET_ADDRESS, handler: SimpleCollectionMintAction, name: "SimpleCollectionMintAction" },
  { address: REWARD_ENGAGEMENT_TESTNET_ADDRESS, handler: RewardEngagementAction, name: "RewardEngagementAction" },
  { address: BOUNTY_ACTION_TESTNET_ADDRESS, handler: PublicationBountyAction, name: "PublicationBountyAction" },
  { address: REWARDS_SWAP_TESTNET_ADDRESS, handler: RewardsSwapAction, name: "RewardsSwap" },
  { address: RENTABLE_SPACE_ACTION_TESTNET_ADDRESS, handler: RentableSpaceAction, name: "RentableSpaceAction" },
  { address: TIP_ACTION_TESTNET_ADDRESS, handler: TipAction, name: "TipAction" },
];

// 3. you are gucci
const supportedActionModules = (_environment: Environment) => {
  const list = _environment.name === "production" ? MAINNET : TESTNET;
  return list.reduce((memo, data) => ({ ...memo, [getAddress(data.address)]: data }), {});
};

export const fetchActionModuleHandler = (_environment: Environment, contract: string) => {
  return supportedActionModules(_environment)[contract];
};

export const fetchActionModuleHandlers = (_environment?: Environment, actionModules?: [any]) => {
  if (!actionModules?.length) return [];
  const data = supportedActionModules(_environment || production);

  return actionModules.map(({ contract }) => data[getAddress(contract.address)]).filter((a) => a);
};