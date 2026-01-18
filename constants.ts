import { AssetDef, MarketItem, AchievementDef } from './types';

// Audio Resources
export const SOUNDS = {
  COIN: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  BUY: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  DEPOSIT: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Reusing coin for deposit as per prompt logic similarity
};

// Background
// Lush Green Steppe
export const BACKGROUND_URL = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop';

// Contract
export const CONTRACT_ADDRESS = '8DkyFnkirQNRJs1YqaPUxPxgpLph7Zh4AnLtqqbc8xXf';

// Referral System
export const REFERRAL_REWARD = 50; // Amount the referrer gets
export const REFEREE_BONUS = 25;   // Amount the new player gets for entering a code

// Asset Definitions
export const ASSETS: Record<string, AssetDef> = {
  // Livestock
  chicken: { id: 'chicken', name: 'Chicken', price: 1, category: 'livestock', icon: '🐔', incomeInterval: 3000, incomeRate: 0.01 },
  sheep: { id: 'sheep', name: 'Sheep', price: 10, category: 'livestock', icon: '🐑', incomeInterval: 5000, incomeRate: 0.01 },
  cow: { id: 'cow', name: 'Cow', price: 50, category: 'livestock', icon: '🐄', incomeInterval: 7000, incomeRate: 0.01 },
  horse: { id: 'horse', name: 'Horse', price: 80, category: 'livestock', icon: '🐎', incomeInterval: 8000, incomeRate: 0.01 },
  camel: { id: 'camel', name: 'Camel', price: 100, category: 'livestock', icon: '🐫', incomeInterval: 10000, incomeRate: 0.01 },
  
  // Buildings
  solar: { id: 'solar', name: 'Solar Panel', price: 200, category: 'building', icon: '☀️', incomeInterval: 12000, incomeRate: 0.01 },
  yurt: { id: 'yurt', name: 'Yurt', price: 1000, category: 'building', icon: '⛺', incomeInterval: 20000, incomeRate: 0.01 },
  
  // Tools (Passive boosts conceptually, but simplfied to assets for this MVP)
  hammer: { id: 'hammer', name: 'Hammer', price: 5, category: 'tool', icon: '🔨', incomeInterval: 50000, incomeRate: 0.01 },
  harness: { id: 'harness', name: 'Harness', price: 25, category: 'tool', icon: '➰', incomeInterval: 50000, incomeRate: 0.01 },
};

// Mock Market Data
export const MARKET_ITEMS: MarketItem[] = [
  { id: 'm1', sellerName: 'SteppeWolf_99', assetDefId: 'horse', price: 75.5 },
  { id: 'm2', sellerName: 'NomadKing', assetDefId: 'yurt', price: 950.0 },
  { id: 'm3', sellerName: 'CryptoShepherd', assetDefId: 'sheep', price: 9.99 },
];

// Achievements
export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Harvest your first income', icon: '🌱' },
  { id: 'novice_herder', title: 'Novice Herder', description: 'Own 3 animals', icon: '🐑' },
  { id: 'wealthy', title: 'Wealthy Merchant', description: 'Reach 500 AMANAT balance', icon: '💰' },
  { id: 'builder', title: 'Steppe Settler', description: 'Build your first structure', icon: '⛺' },
  { id: 'diligent', title: 'Diligent Worker', description: 'Harvest 50 times', icon: '👆' },
];

// Quest Templates
export const QUEST_TEMPLATES = [
  { type: 'collect', description: 'Collect 10 AMANAT', target: 10, reward: 5 },
  { type: 'collect', description: 'Collect 50 AMANAT', target: 50, reward: 20 },
  { type: 'tap', description: 'Harvest 5 times', target: 5, reward: 5 },
  { type: 'tap', description: 'Harvest 20 times', target: 20, reward: 15 },
  { type: 'buy', description: 'Buy 1 new asset', target: 1, reward: 10 },
  { type: 'buy', description: 'Buy 3 new assets', target: 3, reward: 25 },
];