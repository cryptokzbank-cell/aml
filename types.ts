export type AssetCategory = 'livestock' | 'building' | 'tool';

export interface AssetDef {
  id: string;
  name: string;
  price: number;
  category: AssetCategory;
  icon: string; // Emoji or Image URL
  incomeInterval: number; // in ms
  incomeRate: number; // percentage (0.01)
}

export interface PlacedAsset {
  instanceId: string;
  defId: string;
  x: number; // percent 0-100
  y: number; // percent 0-100
  lastCollectedAt: number;
}

export interface MarketItem {
  id: string;
  sellerName: string;
  assetDefId: string;
  price: number;
}

// --- New Types ---

export type QuestType = 'collect' | 'tap' | 'buy';

export interface Quest {
  id: string;
  description: string;
  type: QuestType;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface GameStats {
  totalCollected: number;
  totalTaps: number;
  totalAssetsBought: number;
}

export interface GameState {
  balance: number;
  inventory: PlacedAsset[];
  stats: GameStats;
  quests: Quest[];
  unlockedAchievements: string[]; // List of Achievement IDs
  lastDailyReset: number;
  // Referral System
  referralCode: string;
  referredBy: string | null;
  referralEarnings: number;
}