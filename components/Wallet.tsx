import React, { useState } from 'react';
import { CONTRACT_ADDRESS } from '../constants';
import { audioService } from '../services/audioService';

interface WalletProps {
  onDeposit: () => void;
}

export const Wallet: React.FC<WalletProps> = ({ onDeposit }) => {
  const [copiedContract, setCopiedContract] = useState(false);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleDeposit = () => {
    onDeposit();
    audioService.play('deposit');
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col items-center space-y-6 bg-emerald-950/70 backdrop-blur-sm text-lime-500">
      
      {/* Header */}
      <div className="text-center space-y-1 mt-4">
        <div className="w-16 h-16 mx-auto bg-emerald-900 border border-lime-600/20 rounded-2xl flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Wallet & Asset</h2>
      </div>

      {/* Contract Section */}
      <div className="w-full max-w-sm bg-emerald-950/60 border border-emerald-800 rounded-lg p-6 space-y-4 backdrop-blur-md">
        
        <div>
            <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Token Contract</label>
            <div 
            onClick={handleCopyContract}
            className="flex items-center justify-between bg-white/5 p-3 rounded cursor-pointer hover:bg-white/10 transition-colors group mt-1"
            >
            <code className="text-[10px] text-lime-600 break-all font-mono opacity-80 group-hover:opacity-100">
                {CONTRACT_ADDRESS}
            </code>
            <div className="text-emerald-500 group-hover:text-white pl-2">
                {copiedContract ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                )}
            </div>
            </div>
        </div>

        <div className="pt-4 border-t border-white/5">
             <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-2 block">Top Up Balance</label>
            <button
                onClick={handleDeposit}
                className="w-full text-xs bg-lime-600 hover:bg-lime-500 text-black font-bold py-3 rounded border border-transparent transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                SIMULATE DEPOSIT (+100 ₳)
            </button>
            <p className="text-[10px] text-emerald-500 mt-2 text-center">
                This is a testnet simulation. No real funds are used.
            </p>
        </div>
      </div>
      
    </div>
  );
};