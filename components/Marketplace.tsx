import React from 'react';
import { MARKET_ITEMS, ASSETS } from '../constants';
import { audioService } from '../services/audioService';

interface MarketplaceProps {
  balance: number;
  onBuyP2P: (marketItemId: string, assetDefId: string, price: number) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ balance, onBuyP2P }) => {
  const handleBuy = (id: string, defId: string, price: number) => {
    if (balance >= price) {
      onBuyP2P(id, defId, price);
      audioService.play('buy');
    } else {
      audioService.play('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-emerald-950/70 backdrop-blur-sm text-lime-500 p-4">
      <h2 className="text-xl font-bold mb-4 border-b border-lime-600/30 pb-2 flex justify-between items-center">
        <span>Global Market</span>
        <span className="text-xs font-normal text-emerald-300">Live Feed</span>
      </h2>

      <div className="space-y-3 overflow-y-auto pr-1">
        {MARKET_ITEMS.map((item) => {
          const assetDef = ASSETS[item.assetDefId];
          if (!assetDef) return null;

          return (
            <div 
              key={item.id} 
              className="flex items-center justify-between bg-emerald-900/80 p-3 rounded border border-emerald-800 hover:border-lime-600/50 transition-colors backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-950/50 rounded-full flex items-center justify-center text-2xl border border-lime-600/20">
                  {assetDef.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{assetDef.name}</div>
                  <div className="text-xs text-emerald-400">@{item.sellerName}</div>
                </div>
              </div>

              <button 
                onClick={() => handleBuy(item.id, assetDef.id, item.price)}
                disabled={balance < item.price}
                className={`px-3 py-1.5 rounded text-xs font-bold border 
                  ${balance >= item.price 
                    ? 'border-lime-600 text-lime-500 hover:bg-lime-600 hover:text-black' 
                    : 'border-emerald-700 text-emerald-600 cursor-not-allowed'
                  }`}
              >
                {item.price.toFixed(2)} ₳
              </button>
            </div>
          );
        })}
        
        {MARKET_ITEMS.length === 0 && (
          <div className="text-center text-emerald-500 py-10">No listings available</div>
        )}
      </div>
    </div>
  );
};