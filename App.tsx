import React, { useState, useEffect } from 'react';
import { GameField } from './components/GameField';
import { Shop } from './components/Shop';
import { Marketplace } from './components/Marketplace';
import { Wallet } from './components/Wallet';
import { Goals } from './components/Goals';
import { Friends } from './components/Friends';
import { Support } from './components/Support';
import { GameState, PlacedAsset, Quest, QuestType } from './types';
import { ASSETS, QUEST_TEMPLATES, ACHIEVEMENT_DEFS, BACKGROUND_URL, REFEREE_BONUS, REFERRAL_REWARD } from './constants';
import { audioService } from './services/audioService';

const generateReferralCode = () => {
  return 'STEPPE-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const INITIAL_STATE: GameState = {
  balance: 200.00000000,
  inventory: [],
  stats: {
    totalCollected: 0,
    totalTaps: 0,
    totalAssetsBought: 0
  },
  quests: [],
  unlockedAchievements: [],
  lastDailyReset: 0,
  referralCode: generateReferralCode(),
  referredBy: null,
  referralEarnings: 0
};

// Storage Key
const STORAGE_KEY = 'CRYPTO_AUL_SAVE_V2';

// --- Zoning Logic ---
const getSpawnPosition = (defId: string, category: string) => {
  // 1. Sky Zone (High Up): Chickens & Tools
  if (defId === 'chicken' || category === 'tool') {
    return {
      x: 10 + Math.random() * 80, // Spread across width (10-90%)
      y: 10 + Math.random() * 15  // Top 10-25%
    };
  }

  // 2. Ground Zone (Bottom): Everything else
  // Buildings: Strict Bottom Left Corner
  if (category === 'building') {
    return {
      x: 2 + Math.random() * 18,  // Left 2-20%
      y: 65 + Math.random() * 20  // Bottom 65-85%
    };
  }

  // Herds: Arranged from left-middle to right along the bottom
  // Creating distinct "paddocks" for each species
  switch (defId) {
    case 'sheep':
      // Next to buildings
      return { x: 25 + Math.random() * 15, y: 70 + Math.random() * 20 }; // x: 25-40%
    case 'cow':
      // Center-Left
      return { x: 45 + Math.random() * 15, y: 70 + Math.random() * 20 }; // x: 45-60%
    case 'horse':
      // Center-Right
      return { x: 65 + Math.random() * 15, y: 65 + Math.random() * 20 }; // x: 65-80%
    case 'camel':
      // Far Right
      return { x: 82 + Math.random() * 15, y: 65 + Math.random() * 20 }; // x: 82-97%
    default:
      // Fallback
      return { x: 40 + Math.random() * 20, y: 70 + Math.random() * 20 };
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [currentTab, setCurrentTab] = useState<'game' | 'shop' | 'market' | 'wallet' | 'goals' | 'friends' | 'support'>('game');
  const [loaded, setLoaded] = useState(false);

  // Load state and Migration Logic
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Relocate existing assets to new zones (One-time migration effect for UI update)
        const relocatedInventory = (parsed.inventory || []).map((item: PlacedAsset) => {
            const def = ASSETS[item.defId];
            if (!def) return item;
            const newPos = getSpawnPosition(item.defId, def.category);
            // We update positions to match the new rules
            return {
                ...item,
                x: newPos.x,
                y: newPos.y
            };
        });

        const migratedState: GameState = {
          ...INITIAL_STATE,
          ...parsed,
          inventory: relocatedInventory, // Apply relocation
          stats: parsed.stats || INITIAL_STATE.stats,
          quests: parsed.quests || [],
          unlockedAchievements: parsed.unlockedAchievements || [],
          lastDailyReset: parsed.lastDailyReset || 0,
          referralCode: parsed.referralCode || generateReferralCode(),
          referredBy: parsed.referredBy || null,
          referralEarnings: parsed.referralEarnings || 0
        };
        setGameState(migratedState);
      } catch (e) {
        console.error("Failed to load save:", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, loaded]);

  // Daily Reset & Quest Generation
  useEffect(() => {
    if (!loaded) return;

    const now = new Date();
    const lastResetDate = new Date(gameState.lastDailyReset);
    
    // Check if it's a new day
    const isNewDay = now.getDate() !== lastResetDate.getDate() || now.getMonth() !== lastResetDate.getMonth() || (now.getTime() - lastResetDate.getTime() > 86400000);

    if (isNewDay || gameState.quests.length === 0) {
      // Generate 3 random quests
      const newQuests: Quest[] = [];
      const shuffledTemplates = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
      
      shuffledTemplates.slice(0, 3).forEach(template => {
        newQuests.push({
          id: crypto.randomUUID(),
          description: template.description,
          type: template.type as QuestType,
          target: template.target,
          current: 0,
          reward: template.reward,
          isClaimed: false
        });
      });

      setGameState(prev => ({
        ...prev,
        quests: newQuests,
        lastDailyReset: now.getTime()
      }));
    }
  }, [loaded, gameState.lastDailyReset, gameState.quests.length]);

  // Helpers
  const checkAchievements = (newState: GameState) => {
    const newUnlocked: string[] = [];

    ACHIEVEMENT_DEFS.forEach(ach => {
      if (newState.unlockedAchievements.includes(ach.id)) return;

      let unlocked = false;
      // Hardcoded Logic for MVP
      if (ach.id === 'first_steps' && newState.stats.totalTaps >= 1) unlocked = true;
      if (ach.id === 'novice_herder' && newState.inventory.filter(i => ASSETS[i.defId]?.category === 'livestock').length >= 3) unlocked = true;
      if (ach.id === 'wealthy' && newState.balance >= 500) unlocked = true;
      if (ach.id === 'builder' && newState.inventory.filter(i => ASSETS[i.defId]?.category === 'building').length >= 1) unlocked = true;
      if (ach.id === 'diligent' && newState.stats.totalTaps >= 50) unlocked = true;

      if (unlocked) {
        newUnlocked.push(ach.id);
        // Play success sound for achievement
        audioService.play('buy'); 
      }
    });

    return newUnlocked;
  };

  const updateQuestProgress = (prev: GameState, type: QuestType, amount: number): Quest[] => {
    return prev.quests.map(q => {
      if (q.type === type && !q.isClaimed) {
        return { ...q, current: Math.min(q.current + amount, q.target) };
      }
      return q;
    });
  };

  // Actions
  const buyAsset = (defId: string, priceOverride?: number) => {
    const def = ASSETS[defId];
    if (!def) return;

    const price = priceOverride ?? def.price;

    setGameState(prev => {
      if (prev.balance < price) return prev;

      const pos = getSpawnPosition(defId, def.category);

      const newAsset: PlacedAsset = {
        instanceId: crypto.randomUUID(),
        defId: defId,
        x: pos.x,
        y: pos.y,
        lastCollectedAt: Date.now(),
      };

      const updatedInventory = [...prev.inventory, newAsset];
      
      const nextStateBase = {
        ...prev,
        balance: prev.balance - price,
        inventory: updatedInventory,
        stats: {
          ...prev.stats,
          totalAssetsBought: prev.stats.totalAssetsBought + 1
        }
      };

      const updatedQuests = updateQuestProgress(nextStateBase, 'buy', 1);
      const newlyUnlocked = checkAchievements(nextStateBase);

      return {
        ...nextStateBase,
        quests: updatedQuests,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked]
      };
    });
  };

  const collectIncome = (asset: PlacedAsset, amount: number) => {
    setGameState(prev => {
      const nextStateBase = {
        ...prev,
        balance: prev.balance + amount,
        inventory: prev.inventory.map(item => 
          item.instanceId === asset.instanceId 
            ? { ...item, lastCollectedAt: Date.now() }
            : item
        ),
        stats: {
          ...prev.stats,
          totalCollected: prev.stats.totalCollected + amount,
          totalTaps: prev.stats.totalTaps + 1
        }
      };

      // Update Quests
      let updatedQuests = updateQuestProgress(nextStateBase, 'collect', amount);
      updatedQuests = updatedQuests.map(q => {
        if (q.type === 'tap' && !q.isClaimed) {
           return { ...q, current: Math.min(q.current + 1, q.target) };
        }
        return q;
      });

      const newlyUnlocked = checkAchievements(nextStateBase);

      return {
        ...nextStateBase,
        quests: updatedQuests,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked]
      };
    });
  };

  const claimQuest = (questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.isClaimed || quest.current < quest.target) return prev;

      audioService.play('coin');

      return {
        ...prev,
        balance: prev.balance + quest.reward,
        quests: prev.quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
      };
    });
  };

  const deposit = () => {
    setGameState(prev => {
      const nextState = {
        ...prev,
        balance: prev.balance + 100
      };
      
      const newlyUnlocked = checkAchievements(nextState);
      
      return {
        ...nextState,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked]
      };
    });
  };

  const redeemReferral = (code: string): boolean => {
    if (gameState.referredBy) return false;
    if (code === gameState.referralCode) return false;
    // In a real app, verify code on backend. Here we accept any non-empty string different from own code.
    if (!code || code.length < 3) return false;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance + REFEREE_BONUS,
      referredBy: code
    }));
    audioService.play('coin');
    return true;
  };

  const simulateReferralJoin = () => {
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + REFERRAL_REWARD,
      referralEarnings: prev.referralEarnings + REFERRAL_REWARD
    }));
    audioService.play('coin');
  };

  if (!loaded) return <div className="h-screen bg-emerald-950 text-lime-500 flex items-center justify-center">Loading Steppe...</div>;

  return (
    <div className="h-screen w-full bg-emerald-950 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-emerald-900">
      
      {/* Global Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
        />
        {/* Tinted green instead of black */}
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]" />
      </div>

      {/* Header / Stats */}
      <div className="h-16 bg-emerald-950/80 backdrop-blur-md border-b border-lime-600/30 flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-emerald-950 font-bold text-xs border-2 border-white/20 shadow-[0_0_10px_rgba(132,204,22,0.5)]">
             ₳
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-emerald-300 uppercase tracking-widest">Balance</span>
             <span className="text-lime-400 font-mono text-lg leading-none tracking-tight drop-shadow-md">
               {gameState.balance.toFixed(8)}
             </span>
           </div>
        </div>

        {/* Support Button (Header) */}
        <button 
          onClick={() => setCurrentTab('support')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border
            ${currentTab === 'support' 
              ? 'bg-lime-500 text-emerald-950 border-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.5)] scale-105' 
              : 'bg-emerald-900/80 text-emerald-300 border-emerald-700 hover:text-lime-500 hover:border-lime-500/50'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-1.58-1.58C6.211 8.324 6 9.131 6 10c0 1.068.296 2.062.806 2.917l1.552-1.552zM10 4c.835 0 1.631.18 2.366.502l-1.562 1.562a4.006 4.006 0 00-1.789-.027l-1.58-1.58A5.976 5.976 0 0110 4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        {currentTab === 'game' && (
          <GameField inventory={gameState.inventory} onCollect={collectIncome} />
        )}
        {currentTab === 'shop' && (
          <Shop balance={gameState.balance} onBuy={(id) => buyAsset(id)} />
        )}
        {currentTab === 'market' && (
          <Marketplace balance={gameState.balance} onBuyP2P={(mId, assetId, price) => buyAsset(assetId, price)} />
        )}
        {currentTab === 'wallet' && (
          <Wallet 
            onDeposit={deposit} 
          />
        )}
        {currentTab === 'goals' && (
          <Goals 
            quests={gameState.quests} 
            unlockedAchievements={gameState.unlockedAchievements} 
            onClaimQuest={claimQuest}
          />
        )}
        {currentTab === 'friends' && (
          <Friends 
            referralCode={gameState.referralCode}
            referralEarnings={gameState.referralEarnings}
            referredBy={gameState.referredBy}
            onRedeemReferral={redeemReferral}
            onSimulateReferral={simulateReferralJoin}
          />
        )}
        {currentTab === 'support' && (
          <Support />
        )}
      </div>

      {/* Navigation Bar */}
      <div className="h-16 bg-emerald-950/90 backdrop-blur-md border-t border-lime-600/20 grid grid-cols-6 shrink-0 z-10">
        <NavButton 
          active={currentTab === 'game'} 
          onClick={() => setCurrentTab('game')} 
          icon={<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
          label="Aul"
        />
        <NavButton 
          active={currentTab === 'shop'} 
          onClick={() => setCurrentTab('shop')} 
          icon={<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
          label="Shop"
        />
        <NavButton 
          active={currentTab === 'market'} 
          onClick={() => setCurrentTab('market')} 
          icon={<path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
          label="P2P"
        />
        <NavButton 
          active={currentTab === 'goals'} 
          onClick={() => setCurrentTab('goals')} 
          icon={<path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />}
          label="Goals"
        />
        <NavButton 
          active={currentTab === 'wallet'} 
          onClick={() => setCurrentTab('wallet')} 
          icon={<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
          label="Wallet"
        />
        <NavButton 
          active={currentTab === 'friends'} 
          onClick={() => setCurrentTab('friends')} 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          label="Friends"
        />
      </div>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 min-w-0
      ${active ? 'text-lime-500 bg-white/5 shadow-[inset_0_4px_0_0_#84cc16]' : 'text-emerald-400 hover:text-lime-500 hover:bg-white/5'}
    `}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${active ? 'scale-110 drop-shadow-[0_0_5px_rgba(132,204,22,0.5)]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
    <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{label}</span>
  </button>
);