import React, { useEffect, useState } from 'react';
import { PlacedAsset, AssetDef } from '../types';
import { ASSETS } from '../constants';
import { audioService } from '../services/audioService';

interface GameFieldProps {
  inventory: PlacedAsset[];
  onCollect: (asset: PlacedAsset, amount: number) => void;
}

export const GameField: React.FC<GameFieldProps> = ({ inventory, onCollect }) => {
  const [now, setNow] = useState(Date.now());

  // Ticker for updating "Ready" states
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAssetClick = (placedAsset: PlacedAsset, def: AssetDef) => {
    const isReady = now - placedAsset.lastCollectedAt >= def.incomeInterval;
    
    if (isReady) {
      const income = def.price * def.incomeRate;
      onCollect(placedAsset, income);
      audioService.play('coin');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Assets */}
      {inventory.map((item) => {
        const def = ASSETS[item.defId];
        if (!def) return null;

        const isReady = now - item.lastCollectedAt >= def.incomeInterval;

        return (
          <div
            key={item.instanceId}
            onClick={() => handleAssetClick(item, def)}
            className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: Math.floor(item.y), // Simple depth sorting
            }}
          >
            {/* Income Indicator */}
            {isReady && (
              <div className="animate-bounce mb-1 text-lime-400 drop-shadow-lg text-xs font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-lime-500">
                READY
              </div>
            )}

            {/* Asset Icon */}
            <div className={`text-4xl filter drop-shadow-2xl ${isReady ? 'animate-pulse-slow' : 'opacity-90'}`}>
              {def.icon}
            </div>
            
            {/* Asset Name Label (Optional, for clarity) */}
            <span className="text-[10px] text-white/80 bg-emerald-900/50 px-1 rounded mt-1 backdrop-blur-sm border border-emerald-800/30">
              {def.name}
            </span>
          </div>
        );
      })}
      
      {inventory.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-lime-500/50 text-xl font-bold uppercase tracking-widest text-center">
            Empty Aul<br/>
            <span className="text-xs normal-case opacity-70">Buy assets in Shop</span>
          </p>
        </div>
      )}
    </div>
  );
};