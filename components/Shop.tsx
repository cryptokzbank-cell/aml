import React, { useState } from 'react';
import { ASSETS } from '../constants';
import { AssetCategory } from '../types';
import { audioService } from '../services/audioService';

interface ShopProps {
  balance: number;
  onBuy: (assetId: string) => void;
}

export const Shop: React.FC<ShopProps> = ({ balance, onBuy }) => {
  const [activeTab, setActiveTab] = useState<AssetCategory>('livestock');

  const categories: { id: AssetCategory; label: string; icon: string }[] = [
    { id: 'livestock', label: 'Livestock', icon: '🐎' },
    { id: 'building', label: 'Buildings', icon: '⛺' },
    { id: 'tool', label: 'Tools', icon: '🔨' },
  ];

  const filteredAssets = Object.values(ASSETS).filter(a => a.category === activeTab);

  const handleBuy = (assetId: string, price: number) => {
    if (balance >= price) {
      onBuy(assetId);
      audioService.play('buy');
    } else {
      audioService.play('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-emerald-950/70 backdrop-blur-sm text-lime-500">
      {/* Tabs */}
      <div className="flex border-b border-lime-600/30 bg-emerald-950/40">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2
              ${activeTab === cat.id 
                ? 'bg-lime-500/10 text-lime-400 border-b-2 border-lime-500' 
                : 'text-emerald-400 hover:text-lime-400 hover:bg-white/5'
              }`}
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 content-start">
        {filteredAssets.map((asset) => (
          <div 
            key={asset.id} 
            className="bg-emerald-900/80 border border-lime-600/20 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-lime-500 transition-colors shadow-lg backdrop-blur-md"
          >
            <div className="text-4xl mb-2 animate-float">{asset.icon}</div>
            <h3 className="font-bold text-white">{asset.name}</h3>
            <div className="text-xs text-emerald-300 text-center mb-2">
              ROI: {asset.incomeRate * 100}% / {(asset.incomeInterval / 1000).toFixed(0)}s
            </div>
            
            <button
              onClick={() => handleBuy(asset.id, asset.price)}
              disabled={balance < asset.price}
              className={`w-full py-2 px-4 rounded font-bold text-sm mt-auto flex justify-between items-center
                ${balance >= asset.price 
                  ? 'bg-lime-600 text-black hover:bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.3)]' 
                  : 'bg-emerald-800/50 text-emerald-600 cursor-not-allowed'
                }`}
            >
              <span>BUY</span>
              <span className="font-mono">{asset.price} ₳</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};